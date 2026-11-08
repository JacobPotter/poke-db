#!/usr/bin/env bash
# Local Kubernetes development script for PokeDB.
# Usage:
#   scripts/local-dev.sh up             Build images, deploy to local k8s, wait for readiness & seed
#   scripts/local-dev.sh build          Build container images locally and sync to node runtime
#   scripts/local-dev.sh deploy         Apply Kustomize local overlay and rollout restart
#   scripts/local-dev.sh seed           Seed Postgres using api/seed/mock-dump.sql
#   scripts/local-dev.sh port-forward   Port-forward Frontend (3000), API (8080), and Postgres (5432)
#   scripts/local-dev.sh down           Tear down the local k8s environment
#   scripts/local-dev.sh status         Show rollout and pod status
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAMESPACE="poke-db-local"
API_IMAGE="ghcr.io/jacobpotter/poke-db-api:latest"
FRONTEND_IMAGE="ghcr.io/jacobpotter/poke-db-frontend:latest"

get_current_context() {
  local ctx
  ctx="$(kubectl config current-context 2>/dev/null || echo "")"
  if [ -z "${ctx}" ]; then
    echo "Error: No active kubectl context found. Ensure your local Kubernetes cluster is running." >&2
    exit 1
  fi
  echo "${ctx}"
}

validate_context() {
  local ctx="$1"
  if [ "${ALLOW_UNRECOGNIZED_CONTEXT:-0}" = "1" ]; then
    echo "==> Warning: ALLOW_UNRECOGNIZED_CONTEXT=1 set; bypassing context safety validation for '${ctx}'."
    return 0
  fi

  case "${ctx}" in
    docker-desktop|docker-for-desktop|orbstack|colima*)
      return 0
      ;;
    kind-*|minikube*|k3d-*)
      return 0
      ;;
    *)
      if command -v kind >/dev/null 2>&1 && kind get clusters 2>/dev/null | grep -qx "${ctx}"; then
        return 0
      fi
      if command -v minikube >/dev/null 2>&1 && minikube profile list 2>/dev/null | grep -E "(^|[[:space:]])${ctx}([[:space:]]|$)"; then
        return 0
      fi
      echo "Error: Active kubectl context '${ctx}' is not recognized as a supported local development cluster." >&2
      echo "Applying the local overlay (imagePullPolicy: Never) to non-local or remote clusters is unsafe." >&2
      echo "Supported local contexts: docker-desktop, orbstack, colima, kind-*, minikube*, k3d-*." >&2
      echo "To bypass this safety check for custom local clusters, set ALLOW_UNRECOGNIZED_CONTEXT=1." >&2
      exit 1
      ;;
  esac
}

sync_images_to_cluster() {
  local ctx="$1"
  echo "==> Synchronizing images to local cluster runtime for context '${ctx}'..."

  local host_api_id host_fe_id
  host_api_id="$(docker image inspect "${API_IMAGE}" --format '{{.Id}}')"
  host_fe_id="$(docker image inspect "${FRONTEND_IMAGE}" --format '{{.Id}}')"

  if [[ "${ctx}" == "docker-desktop" || "${ctx}" == "docker-for-desktop" ]]; then
    local node_runtimes nodes
    nodes="$(kubectl get nodes -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")"
    node_runtimes="$(kubectl get nodes -o jsonpath='{.items[*].status.nodeInfo.containerRuntimeVersion}' 2>/dev/null || echo "")"

    if [[ "${node_runtimes}" =~ containerd:// ]] || [[ "${nodes}" =~ desktop- ]]; then
      echo "==> Docker Desktop (kind/containerd provisioner) detected."
      for node in ${nodes}; do
        echo "  --> Loading images into node '${node}' containerd runtime via ctr..."
        docker save "${API_IMAGE}" | docker exec -i "${node}" ctr -n k8s.io images import --all-platforms -
        docker save "${FRONTEND_IMAGE}" | docker exec -i "${node}" ctr -n k8s.io images import --all-platforms -

        # Verify images on node
        local node_api_id node_fe_id
        node_api_id="$(docker exec "${node}" ctr -n k8s.io images ls 2>/dev/null | (grep -F "${API_IMAGE}" || true) | awk '{print $3}' | head -n1)"
        node_fe_id="$(docker exec "${node}" ctr -n k8s.io images ls 2>/dev/null | (grep -F "${FRONTEND_IMAGE}" || true) | awk '{print $3}' | head -n1)"

        if [ -z "${node_api_id}" ] || [ "${node_api_id}" != "${host_api_id}" ]; then
          echo "Error: Node '${node}' API image digest (${node_api_id:-none}) does not match host (${host_api_id})." >&2
          exit 1
        fi
        if [ -z "${node_fe_id}" ] || [ "${node_fe_id}" != "${host_fe_id}" ]; then
          echo "Error: Node '${node}' Frontend image digest (${node_fe_id:-none}) does not match host (${host_fe_id})." >&2
          exit 1
        fi
        echo "  --> Verified node '${node}' image digests match host build (${node_api_id:0:19}..., ${node_fe_id:0:19}...)."
      done
    elif [[ "${node_runtimes}" =~ docker:// ]]; then
      echo "==> Docker Desktop (kubeadm/docker provisioner) detected. Images in host daemon are directly accessible."
    else
      echo "==> Docker Desktop detected. Ensuring images are available to node runtimes..."
      for node in ${nodes}; do
        if docker exec "${node}" ctr -v >/dev/null 2>&1; then
          docker save "${API_IMAGE}" | docker exec -i "${node}" ctr -n k8s.io images import --all-platforms -
          docker save "${FRONTEND_IMAGE}" | docker exec -i "${node}" ctr -n k8s.io images import --all-platforms -
        fi
      done
    fi

  elif [[ "${ctx}" =~ ^kind- ]] || (command -v kind >/dev/null 2>&1 && kind get clusters 2>/dev/null | grep -qx "${ctx}"); then
    local kind_cluster="${ctx#kind-}"
    if ! command -v kind >/dev/null 2>&1; then
      echo "Error: 'kind' CLI is required to load images into Kind cluster '${kind_cluster}' but was not found in PATH." >&2
      exit 1
    fi
    echo "==> Loading images into Kind cluster '${kind_cluster}'..."
    kind load docker-image "${API_IMAGE}" "${FRONTEND_IMAGE}" --name "${kind_cluster}"

  elif [[ "${ctx}" =~ ^minikube ]] || (command -v minikube >/dev/null 2>&1 && minikube profile list 2>/dev/null | grep -qw "${ctx}"); then
    if ! command -v minikube >/dev/null 2>&1; then
      echo "Error: 'minikube' CLI is required to load images into Minikube cluster '${ctx}' but was not found in PATH." >&2
      exit 1
    fi
    echo "==> Loading images into Minikube cluster (profile: '${ctx}')..."
    minikube -p "${ctx}" image load "${API_IMAGE}" "${FRONTEND_IMAGE}"

  elif [[ "${ctx}" =~ ^k3d- ]]; then
    local k3d_cluster="${ctx#k3d-}"
    if ! command -v k3d >/dev/null 2>&1; then
      echo "Error: 'k3d' CLI is required to load images into K3d cluster '${k3d_cluster}' but was not found in PATH." >&2
      exit 1
    fi
    echo "==> Importing images into K3d cluster '${k3d_cluster}'..."
    k3d image import "${API_IMAGE}" "${FRONTEND_IMAGE}" -c "${k3d_cluster}"

  elif [[ "${ctx}" == "orbstack" ]]; then
    echo "==> OrbStack runtime detected. Host images are directly shared with the cluster."

  elif [[ "${ctx}" =~ ^colima ]]; then
    if command -v colima >/dev/null 2>&1 && colima status 2>&1 | grep -qi containerd; then
      echo "==> Colima containerd runtime detected. Loading images..."
      colima nerdctl -- -n k8s.io image load < <(docker save "${API_IMAGE}" "${FRONTEND_IMAGE}")
    else
      echo "==> Colima Docker runtime detected. Host images are directly shared with the cluster."
    fi

  else
    if [ "${ALLOW_UNRECOGNIZED_CONTEXT:-0}" = "1" ]; then
      echo "==> Warning: Unrecognized context '${ctx}' with ALLOW_UNRECOGNIZED_CONTEXT=1. Skipping automated image loading."
    else
      echo "Error: Could not determine image loader for context '${ctx}'." >&2
      echo "Please load images '${API_IMAGE}' and '${FRONTEND_IMAGE}' manually into your node runtime, or set ALLOW_UNRECOGNIZED_CONTEXT=1." >&2
      exit 1
    fi
  fi
}

verify_deployment_pods() {
  local ctx="$1"
  local app="$2"
  local image_tag="$3"

  if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' command is required for pod image verification but was not found in PATH." >&2
    exit 1
  fi

  local desired_replicas
  desired_replicas="$(kubectl get deployment "${app}" -n "${NAMESPACE}" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")"
  if [ -z "${desired_replicas}" ] || [ "${desired_replicas}" -lt 1 ]; then
    desired_replicas=1
  fi

  # Get the current active ReplicaSet's pod-template-hash for the deployment
  local current_hash
  current_hash="$(kubectl get rs -n "${NAMESPACE}" -l app="${app}" -o json 2>/dev/null | jq -r '[.items[] | select((.spec.replicas // 0) > 0)] | sort_by(.metadata.creationTimestamp) | last | .metadata.labels["pod-template-hash"] // empty')"

  # Fetch all pods for this app
  local pods_json
  pods_json="$(kubectl get pods -n "${NAMESPACE}" -l app="${app}" -o json 2>/dev/null || echo '{"items":[]}')"

  # Filter out terminating pods (deletionTimestamp != null) and ensure pod is Running.
  # If current_hash is identified, also ensure the pod matches the current active ReplicaSet.
  local active_pods
  active_pods="$(echo "${pods_json}" | jq -c --arg hash "${current_hash}" '[.items[] | select(.metadata.deletionTimestamp == null and .status.phase == "Running" and (if $hash != "" then .metadata.labels["pod-template-hash"] == $hash else true end))]')"

  local count
  count="$(echo "${active_pods}" | jq 'length')"

  if [ "${count}" -lt "${desired_replicas}" ]; then
    echo "Error: Expected at least ${desired_replicas} active running pod(s) for deployment '${app}', found ${count}." >&2
    exit 1
  fi

  for i in $(seq 0 $((count - 1))); do
    local pod_name pod_node pod_image_id
    pod_name="$(echo "${active_pods}" | jq -r ".[$i].metadata.name")"
    pod_node="$(echo "${active_pods}" | jq -r ".[$i].spec.nodeName // empty")"
    pod_image_id="$(echo "${active_pods}" | jq -r ".[$i].status.containerStatuses[0].imageID // empty")"

    if [ -z "${pod_node}" ]; then
      echo "Error: Pod '${pod_name}' is not scheduled on any node." >&2
      exit 1
    fi
    if [ -z "${pod_image_id}" ]; then
      echo "Error: Pod '${pod_name}' has no container imageID in status." >&2
      exit 1
    fi

    echo "  --> Active pod: ${pod_name} on node '${pod_node}' (imageID: ${pod_image_id})"

    # On Docker Desktop (kind/containerd provisioner), verify against the CRI runtime on THAT pod's specific node
    if [[ "${ctx}" == "docker-desktop" || "${ctx}" == "docker-for-desktop" ]]; then
      local node_runtimes
      node_runtimes="$(kubectl get nodes -o jsonpath='{.items[*].status.nodeInfo.containerRuntimeVersion}' 2>/dev/null || echo "")"
      if [[ "${node_runtimes}" =~ containerd:// ]] || [[ "${pod_node}" =~ desktop- ]]; then
        if ! docker exec "${pod_node}" crictl images >/dev/null 2>&1; then
          echo "Error: Unable to run 'crictl images' on node '${pod_node}' for image verification." >&2
          exit 1
        fi

        local node_cri_json expected_cri_id
        node_cri_json="$(docker exec "${pod_node}" crictl images --output json 2>/dev/null || echo "")"
        if [ -z "${node_cri_json}" ]; then
          echo "Error: Failed to retrieve CRI images from node '${pod_node}'." >&2
          exit 1
        fi

        expected_cri_id="$(echo "${node_cri_json}" | jq -r --arg tag "${image_tag}" '.images[] | select(.repoTags[]? == $tag) | .id' | head -n1)"
        if [ -z "${expected_cri_id}" ]; then
          echo "Error: Image tag '${image_tag}' not found in CRI runtime on node '${pod_node}'." >&2
          exit 1
        fi

        local norm_pod_id="${pod_image_id#docker-pullable://}"
        local norm_cri_id="${expected_cri_id#docker-pullable://}"

        if [ "${norm_pod_id}" != "${norm_cri_id}" ]; then
          echo "Error: Pod '${pod_name}' imageID (${pod_image_id}) does not match CRI image ID (${expected_cri_id}) on node '${pod_node}'." >&2
          exit 1
        fi
        echo "      Verified imageID matches node '${pod_node}' CRI store (${expected_cri_id:0:19}...)."
      fi
    fi
  done
}

verify_pod_images() {
  local ctx="$1"
  echo "==> Verifying running pods and image digests in namespace '${NAMESPACE}'..."
  verify_deployment_pods "${ctx}" "api" "${API_IMAGE}"
  verify_deployment_pods "${ctx}" "frontend" "${FRONTEND_IMAGE}"
}

build_images() {
  local ctx
  ctx="$(get_current_context)"
  validate_context "${ctx}"

  echo "==> Building API image (${API_IMAGE}) from local code..."
  docker build -t "${API_IMAGE}" "$ROOT/api"

  echo "==> Building Frontend image (${FRONTEND_IMAGE}) from local code..."
  docker build -t "${FRONTEND_IMAGE}" "$ROOT/frontend"

  sync_images_to_cluster "${ctx}"
}

deploy_k8s() {
  local ctx
  ctx="$(get_current_context)"
  validate_context "${ctx}"

  echo "==> Ensuring namespace '${NAMESPACE}' exists..."
  kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

  echo "==> Applying Kustomize local overlay..."
  kubectl apply -k "$ROOT/k8s/overlays/local"

  # Restart deployments if already present so newly loaded local images are picked up
  if kubectl get deployment api -n "${NAMESPACE}" >/dev/null 2>&1 && kubectl get deployment frontend -n "${NAMESPACE}" >/dev/null 2>&1; then
    echo "==> Triggering rollout restart for local deployments..."
    kubectl rollout restart deployment/api deployment/frontend -n "${NAMESPACE}"
  fi

  echo "==> Waiting for Postgres deployment to be ready..."
  kubectl rollout status deployment/postgres -n "${NAMESPACE}" --timeout=120s

  echo "==> Waiting for API deployment to be ready..."
  kubectl rollout status deployment/api -n "${NAMESPACE}" --timeout=120s

  echo "==> Waiting for Frontend deployment to be ready..."
  kubectl rollout status deployment/frontend -n "${NAMESPACE}" --timeout=120s

  verify_pod_images "${ctx}"
}

seed_db() {
  local ctx
  ctx="$(get_current_context)"
  validate_context "${ctx}"

  echo "==> Checking and seeding database with mock dump..."
  local pod
  pod="$(kubectl get pod -n "${NAMESPACE}" -l app=postgres --field-selector=status.phase=Running -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")"
  if [ -z "${pod}" ]; then
    pod="$(kubectl get pod -n "${NAMESPACE}" -l app=postgres -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")"
  fi

  if [ -z "${pod}" ]; then
    echo "Error: Postgres pod not found in namespace ${NAMESPACE}" >&2
    exit 1
  fi

  # Wait for postgres to accept connections
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- sh -c \
    'until pg_isready -U postgres -d postgres; do sleep 1; done'

  echo "==> Applying seed data..."
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
    psql -U postgres -d postgres < "$ROOT/api/seed/00-reset-schema.sql"
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
    psql -U postgres -d postgres < "$ROOT/api/seed/mock-dump.sql"

  echo "==> Database seeded successfully."
}

port_forward() {
  local ctx
  ctx="$(get_current_context)"
  validate_context "${ctx}"

  echo "==> Starting port forwards (Ctrl+C to stop)..."
  echo "  - Frontend: http://localhost:3000"
  echo "  - API:      http://localhost:8080"
  echo "  - Postgres: localhost:5432"

  # Run port forwards in background and trap exit
  trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

  kubectl port-forward -n "${NAMESPACE}" svc/frontend 3000:80 &
  kubectl port-forward -n "${NAMESPACE}" svc/api 8080:8080 &
  kubectl port-forward -n "${NAMESPACE}" svc/postgres 5432:5432 &

  wait
}

down_k8s() {
  local ctx
  ctx="$(get_current_context)"
  validate_context "${ctx}"

  echo "==> Deleting resources in namespace '${NAMESPACE}'..."
  kubectl delete -k "$ROOT/k8s/overlays/local" --ignore-not-found
  kubectl delete namespace "${NAMESPACE}" --ignore-not-found
}

status_k8s() {
  local ctx
  ctx="$(get_current_context)"
  validate_context "${ctx}"

  echo "==> Active context: ${ctx}"
  echo "==> Resources in namespace '${NAMESPACE}':"
  kubectl get all -n "${NAMESPACE}"

  echo ""
  echo "==> Container Image Details:"
  kubectl get pods -n "${NAMESPACE}" -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\t"}{range .status.containerStatuses[*]}{.name}:{.imageID}{" "}{end}{"\n"}{end}'
}

case "${1:-up}" in
  up)
    build_images
    deploy_k8s
    seed_db
    echo ""
    echo "PokeDB is up and running in namespace '${NAMESPACE}'."
    echo "Run '$0 port-forward' to access the application."
    ;;
  build)
    build_images
    ;;
  deploy)
    deploy_k8s
    ;;
  seed)
    seed_db
    ;;
  port-forward)
    port_forward
    ;;
  down)
    down_k8s
    ;;
  status)
    status_k8s
    ;;
  *)
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
