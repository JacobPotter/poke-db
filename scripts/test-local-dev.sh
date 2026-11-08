#!/usr/bin/env bash
# Unit and integration stub test suite for scripts/local-dev.sh.
# Tests context validation, loader dispatch, Docker Desktop multi-node containerd import,
# digest verification, pod revision filtering, and error handling.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT/scripts/local-dev.sh"

echo "==> Running local-dev.sh test suite..."

# Helper to invoke internal functions from local-dev.sh
call_fn() {
  local fn="$1"
  shift
  bash -c "eval \"\$(sed '/^case /,\$d' \"\$1\")\" && shift && $fn \"\$@\"" _ "$SCRIPT" "$@"
}

test_valid_contexts() {
  echo "Testing valid local contexts..."
  local valid_contexts=("docker-desktop" "docker-for-desktop" "orbstack" "colima" "colima-x86" "kind-local" "minikube" "minikube-profile" "k3d-poke-db")
  for ctx in "${valid_contexts[@]}"; do
    if ! call_fn validate_context "${ctx}"; then
      echo "FAIL: Expected context '${ctx}' to be valid" >&2
      exit 1
    fi
  done
  echo "PASS: Valid contexts accepted."
}

test_invalid_contexts() {
  echo "Testing invalid/remote contexts rejection..."
  local invalid_contexts=("prod" "production-cluster" "arn:aws:eks:us-east-1:123456789012:cluster/prod" "gke_my-project_us-central1_prod" "remote-staging")
  for ctx in "${invalid_contexts[@]}"; do
    if call_fn validate_context "${ctx}" 2>/dev/null; then
      echo "FAIL: Expected context '${ctx}' to be rejected" >&2
      exit 1
    fi
  done
  echo "PASS: Invalid contexts rejected safely."
}

test_override_context() {
  echo "Testing ALLOW_UNRECOGNIZED_CONTEXT override..."
  if ! ALLOW_UNRECOGNIZED_CONTEXT=1 call_fn validate_context "unknown-custom-ctx" >/dev/null; then
    echo "FAIL: Expected ALLOW_UNRECOGNIZED_CONTEXT=1 to allow unknown context" >&2
    exit 1
  fi
  echo "PASS: ALLOW_UNRECOGNIZED_CONTEXT=1 successfully overrides safety check."
}

test_missing_cli_handling() {
  echo "Testing missing loader CLI failure handling..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  mkdir -p "$stub_bin"

  # Stub docker to return dummy image inspection IDs
  cat <<'EOF' > "$stub_bin/docker"
#!/usr/bin/env bash
if [ "$1" = "image" ] && [ "$2" = "inspect" ]; then
  echo "sha256:1111222233334444555566667777888899990000"
  exit 0
fi
exit 0
EOF
  chmod +x "$stub_bin/docker"

  local custom_path="$stub_bin:/bin:/usr/bin:/usr/local/bin"

  local output
  # Test missing kind CLI
  output=$(PATH="$custom_path" ALLOW_UNRECOGNIZED_CONTEXT=0 call_fn sync_images_to_cluster "kind-test" 2>&1 || true)
  if ! echo "$output" | grep -q "'kind' CLI is required"; then
    echo "FAIL: Expected missing kind CLI error, got: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  # Test missing minikube CLI
  output=$(PATH="$custom_path" ALLOW_UNRECOGNIZED_CONTEXT=0 call_fn sync_images_to_cluster "minikube" 2>&1 || true)
  if ! echo "$output" | grep -q "'minikube' CLI is required"; then
    echo "FAIL: Expected missing minikube CLI error, got: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  # Test missing k3d CLI
  output=$(PATH="$custom_path" ALLOW_UNRECOGNIZED_CONTEXT=0 call_fn sync_images_to_cluster "k3d-test" 2>&1 || true)
  if ! echo "$output" | grep -q "'k3d' CLI is required"; then
    echo "FAIL: Expected missing k3d CLI error, got: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Missing CLI tools fail explicitly with clear error messages."
}

test_sync_invocations() {
  echo "Testing kind, minikube, and k3d loader command invocations..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  local log_file="$test_dir/calls.log"
  mkdir -p "$stub_bin"

  # Stub docker
  cat <<'EOF' > "$stub_bin/docker"
#!/usr/bin/env bash
if [ "$1" = "image" ] && [ "$2" = "inspect" ]; then
  echo "sha256:dummyhostid"
  exit 0
fi
exit 0
EOF

  # Stub kind
  cat <<EOF > "$stub_bin/kind"
#!/usr/bin/env bash
echo "kind \$*" >> "$log_file"
exit 0
EOF

  # Stub minikube
  cat <<EOF > "$stub_bin/minikube"
#!/usr/bin/env bash
echo "minikube \$*" >> "$log_file"
exit 0
EOF

  # Stub k3d
  cat <<EOF > "$stub_bin/k3d"
#!/usr/bin/env bash
echo "k3d \$*" >> "$log_file"
exit 0
EOF

  chmod +x "$stub_bin"/*
  local custom_path="$stub_bin:/bin:/usr/bin:/usr/local/bin"

  PATH="$custom_path" call_fn sync_images_to_cluster "kind-mycluster" >/dev/null
  PATH="$custom_path" call_fn sync_images_to_cluster "minikube-custom" >/dev/null
  PATH="$custom_path" call_fn sync_images_to_cluster "k3d-myk3d" >/dev/null

  if ! grep -q "kind load docker-image .* --name mycluster" "$log_file"; then
    echo "FAIL: Expected kind load invocation for cluster 'mycluster'" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  if ! grep -q "minikube -p minikube-custom image load" "$log_file"; then
    echo "FAIL: Expected minikube load invocation for profile 'minikube-custom'" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  if ! grep -q "k3d image import .* -c myk3d" "$log_file"; then
    echo "FAIL: Expected k3d image import invocation for cluster 'myk3d'" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Loader CLIs invoked with expected arguments."
}

test_docker_desktop_multi_node_import() {
  echo "Testing Docker Desktop multi-node containerd import and verification..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  local log_file="$test_dir/docker_calls.log"
  mkdir -p "$stub_bin"

  # Stub kubectl to return 2 containerd nodes
  cat <<'EOF' > "$stub_bin/kubectl"
#!/usr/bin/env bash
if [ "$1" = "get" ] && [ "$2" = "nodes" ]; then
  if [[ "$*" =~ containerRuntimeVersion ]]; then
    echo "containerd://2.3.1 containerd://2.3.1"
  elif [[ "$*" =~ metadata.name ]]; then
    echo "desktop-control-plane desktop-worker"
  fi
  exit 0
fi
exit 0
EOF

  # Stub docker to log calls and return matching image inspect / ctr output
  cat <<EOF > "$stub_bin/docker"
#!/usr/bin/env bash
echo "docker \$*" >> "$log_file"

if [ "\$1" = "image" ] && [ "\$2" = "inspect" ]; then
  if [[ "\$3" =~ poke-db-api ]]; then
    echo "sha256:api_host_id_12345"
  else
    echo "sha256:fe_host_id_67890"
  fi
  exit 0
elif [ "\$1" = "exec" ]; then
  # Simulate ctr images ls on node
  if [[ "\$*" =~ "ctr -n k8s.io images ls" ]]; then
    echo "REF TYPE DIGEST SIZE OS/ARCH LABELS"
    echo "ghcr.io/jacobpotter/poke-db-api:latest index sha256:api_host_id_12345 58.6MiB linux/arm64 -"
    echo "ghcr.io/jacobpotter/poke-db-frontend:latest index sha256:fe_host_id_67890 21.0MiB linux/arm64 -"
    exit 0
  fi
  exit 0
elif [ "\$1" = "save" ]; then
  cat /dev/null
  exit 0
fi
exit 0
EOF

  chmod +x "$stub_bin"/*
  local custom_path="$stub_bin:/bin:/usr/bin:/usr/local/bin"

  PATH="$custom_path" call_fn sync_images_to_cluster "docker-desktop" >/dev/null

  # Verify import was called on both control-plane and worker nodes
  if ! grep -q "docker exec -i desktop-control-plane ctr -n k8s.io images import" "$log_file"; then
    echo "FAIL: Expected ctr import on desktop-control-plane" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  if ! grep -q "docker exec -i desktop-worker ctr -n k8s.io images import" "$log_file"; then
    echo "FAIL: Expected ctr import on desktop-worker" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Multi-node Docker Desktop containerd import and verification succeeded."
}

test_docker_desktop_digest_mismatch() {
  echo "Testing Docker Desktop digest mismatch detection failure..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  mkdir -p "$stub_bin"

  # Stub kubectl to return 1 containerd node
  cat <<'EOF' > "$stub_bin/kubectl"
#!/usr/bin/env bash
if [ "$1" = "get" ] && [ "$2" = "nodes" ]; then
  if [[ "$*" =~ containerRuntimeVersion ]]; then
    echo "containerd://2.3.1"
  elif [[ "$*" =~ metadata.name ]]; then
    echo "desktop-worker"
  fi
  exit 0
fi
exit 0
EOF

  # Stub docker with MISMATCHED node ctr image digest
  cat <<'EOF' > "$stub_bin/docker"
#!/usr/bin/env bash
if [ "$1" = "image" ] && [ "$2" = "inspect" ]; then
  echo "sha256:fresh_host_digest_111"
  exit 0
elif [ "$1" = "save" ]; then
  cat /dev/null
  exit 0
elif [ "$1" = "exec" ]; then
  if [[ "$*" =~ "ctr -n k8s.io images ls" ]]; then
    echo "REF TYPE DIGEST SIZE OS/ARCH LABELS"
    echo "ghcr.io/jacobpotter/poke-db-api:latest index sha256:STALE_NODE_DIGEST_999 58.6MiB linux/arm64 -"
    echo "ghcr.io/jacobpotter/poke-db-frontend:latest index sha256:fresh_host_digest_111 21.0MiB linux/arm64 -"
    exit 0
  fi
  exit 0
fi
exit 0
EOF

  chmod +x "$stub_bin"/*
  local custom_path="$stub_bin:/bin:/usr/bin:/usr/local/bin"

  local output
  output=$(PATH="$custom_path" call_fn sync_images_to_cluster "docker-desktop" 2>&1 || true)
  if ! echo "$output" | grep -q "does not match host"; then
    echo "FAIL: Expected digest mismatch error, got: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Stale node digest mismatch correctly caught and aborted."
}

test_verify_pod_images_filtering_and_matching() {
  echo "Testing verify_pod_images filters terminating pods and verifies CRI imageID..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  mkdir -p "$stub_bin"

  # Stub kubectl returning RS and pods (one terminating old pod, one active new pod)
  cat <<'EOF' > "$stub_bin/kubectl"
#!/usr/bin/env bash
if [ "$1" = "get" ] && [ "$2" = "deployment" ]; then
  echo "1"
  exit 0
elif [ "$1" = "get" ] && [ "$2" = "rs" ]; then
  # JSON output for ReplicaSets: new RS has replicas=1 and hash=newhash; old RS has replicas=0 and hash=oldhash
  echo '{"items":[{"metadata":{"name":"api-new","creationTimestamp":"2026-11-08T12:00:00Z","labels":{"pod-template-hash":"newhash"}},"spec":{"replicas":1}},{"metadata":{"name":"api-old","creationTimestamp":"2026-11-08T11:00:00Z","labels":{"pod-template-hash":"oldhash"}},"spec":{"replicas":0}}]}'
  exit 0
elif [ "$1" = "get" ] && [ "$2" = "pods" ]; then
  # JSON output for Pods: api-old has deletionTimestamp and old imageID; api-new has null deletionTimestamp and fresh imageID
  echo '{"items":[{"metadata":{"name":"api-old","deletionTimestamp":"2026-11-08T12:00:05Z","labels":{"pod-template-hash":"oldhash"}},"spec":{"nodeName":"desktop-worker"},"status":{"phase":"Running","containerStatuses":[{"name":"api","imageID":"sha256:stale_config_id"}]}},{"metadata":{"name":"api-new","deletionTimestamp":null,"labels":{"pod-template-hash":"newhash"}},"spec":{"nodeName":"desktop-worker"},"status":{"phase":"Running","containerStatuses":[{"name":"api","imageID":"sha256:fresh_config_id"}]}}]}'
  exit 0
elif [ "$1" = "get" ] && [ "$2" = "nodes" ]; then
  echo "containerd://2.3.1"
  exit 0
fi
exit 0
EOF

  # Stub docker returning matching CRI image ID for the fresh image
  cat <<'EOF' > "$stub_bin/docker"
#!/usr/bin/env bash
if [ "$1" = "exec" ]; then
  if [[ "$*" =~ "crictl images" ]]; then
    if [[ "$*" =~ "--output json" ]]; then
      echo '{"images":[{"id":"sha256:fresh_config_id","repoTags":["ghcr.io/jacobpotter/poke-db-api:latest"]}]}'
      exit 0
    fi
    exit 0
  fi
fi
exit 0
EOF

  chmod +x "$stub_bin"/*
  local custom_path="$stub_bin:$PATH"

  local output
  output=$(PATH="$custom_path" call_fn verify_deployment_pods "docker-desktop" "api" "ghcr.io/jacobpotter/poke-db-api:latest" 2>&1)
  
  if echo "$output" | grep -q "api-old"; then
    echo "FAIL: verify_deployment_pods should have ignored terminating pod api-old: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  if ! echo "$output" | grep -q "Active pod: api-new on node 'desktop-worker' (imageID: sha256:fresh_config_id)"; then
    echo "FAIL: verify_deployment_pods failed to select api-new: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Terminating pods ignored and active revision pod imageID verified against CRI."
}

test_verify_pod_images_mismatch_failure() {
  echo "Testing verify_pod_images detection of CRI imageID mismatch..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  mkdir -p "$stub_bin"

  # Stub kubectl returning active pod with imageID sha256:wrong_id
  cat <<'EOF' > "$stub_bin/kubectl"
#!/usr/bin/env bash
if [ "$1" = "get" ] && [ "$2" = "deployment" ]; then
  echo "1"
  exit 0
elif [ "$1" = "get" ] && [ "$2" = "rs" ]; then
  echo '{"items":[{"metadata":{"name":"api-new","creationTimestamp":"2026-11-08T12:00:00Z","labels":{"pod-template-hash":"newhash"}},"spec":{"replicas":1}}]}'
  exit 0
elif [ "$1" = "get" ] && [ "$2" = "pods" ]; then
  echo '{"items":[{"metadata":{"name":"api-new","deletionTimestamp":null,"labels":{"pod-template-hash":"newhash"}},"spec":{"nodeName":"desktop-worker"},"status":{"phase":"Running","containerStatuses":[{"name":"api","imageID":"sha256:wrong_config_id"}]}}]}'
  exit 0
elif [ "$1" = "get" ] && [ "$2" = "nodes" ]; then
  echo "containerd://2.3.1"
  exit 0
fi
exit 0
EOF

  # Stub docker returning node CRI ID sha256:expected_config_id
  cat <<'EOF' > "$stub_bin/docker"
#!/usr/bin/env bash
if [ "$1" = "exec" ]; then
  if [[ "$*" =~ "crictl images" ]]; then
    if [[ "$*" =~ "--output json" ]]; then
      echo '{"images":[{"id":"sha256:expected_config_id","repoTags":["ghcr.io/jacobpotter/poke-db-api:latest"]}]}'
      exit 0
    fi
    exit 0
  fi
fi
exit 0
EOF

  chmod +x "$stub_bin"/*
  local custom_path="$stub_bin:$PATH"

  local output
  output=$(PATH="$custom_path" call_fn verify_deployment_pods "docker-desktop" "api" "ghcr.io/jacobpotter/poke-db-api:latest" 2>&1 || true)

  if ! echo "$output" | grep -q "does not match CRI image ID"; then
    echo "FAIL: Expected CRI imageID mismatch error, got: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Pod vs node CRI imageID mismatch correctly detected."
}

test_missing_jq_handling() {
  echo "Testing verify_pod_images failure when jq is missing..."
  local test_dir
  test_dir="$(mktemp -d)"
  local stub_bin="$test_dir/bin"
  mkdir -p "$stub_bin"

  # Symlink standard tools except jq
  for tool in bash sh sed grep awk cat rm seq head; do
    local tool_path
    tool_path="$(command -v "$tool" 2>/dev/null || true)"
    if [ -n "$tool_path" ]; then
      ln -s "$tool_path" "$stub_bin/$tool"
    fi
  done

  cat <<'EOF' > "$stub_bin/kubectl"
#!/usr/bin/env bash
exit 0
EOF
  chmod +x "$stub_bin/kubectl"

  # Path containing only stub_bin (no jq)
  local custom_path="$stub_bin"

  local output
  output=$(PATH="$custom_path" call_fn verify_deployment_pods "docker-desktop" "api" "ghcr.io/jacobpotter/poke-db-api:latest" 2>&1 || true)

  if ! echo "$output" | grep -q "'jq' command is required"; then
    echo "FAIL: Expected missing jq error, got: $output" >&2
    rm -rf "$test_dir"
    exit 1
  fi

  rm -rf "$test_dir"
  echo "PASS: Missing jq error caught and reported cleanly."
}

test_valid_contexts
test_invalid_contexts
test_override_context
test_missing_cli_handling
test_sync_invocations
test_docker_desktop_multi_node_import
test_docker_desktop_digest_mismatch
test_verify_pod_images_filtering_and_matching
test_verify_pod_images_mismatch_failure
test_missing_jq_handling

echo "==> All local-dev.sh unit and stub tests passed successfully!"
