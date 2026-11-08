# Ubuntu Development Lab Setup Guide

> A complete guide to setting up Ubuntu 24.04 LTS on a separate boot partition alongside Windows 10, with Docker, Kubernetes, ArgoCD, and a full-stack development toolchain.

---

## Table of Contents

1. [Dual-Boot Installation](#1-dual-boot-installation)
2. [Post-Install System Setup](#2-post-install-system-setup)
3. [Docker Installation](#3-docker-installation)
4. [Kubernetes Cluster Setup](#4-kubernetes-cluster-setup)
5. [ArgoCD Installation](#5-argocd-installation)
6. [Development Tools](#6-development-tools)
7. [Verification & Troubleshooting](#7-verification--troubleshooting)

---

## 1. Dual-Boot Installation

> **Setup:** Ubuntu installs on a **separate physical disk** (currently `D:\`), while Windows 10 remains on its own disk. No partition shrinking is required.

### Prerequisites

- **Backup all important data** before installing.
- A USB drive (8 GB+) for the installer.
- The [Ubuntu 24.04 LTS Desktop ISO](https://ubuntu.com/download/desktop).
- **Identify your Linux disk** — the drive currently mounted as `D:\` in Windows. Note its model name (e.g., `Samsung 970 EVO`, `WD Blue SN550`) so you can identify it during installation.

### Pre-Installation: Prepare Windows 10

Before booting the Linux installer, prepare your Windows 10 system:

1. **Disable Fast Startup** (prevents partition locking):
   - Control Panel → Power Options → Choose what the power buttons do → Change settings that are currently unavailable → Uncheck "Turn on fast startup" → Save changes.

2. **Disable Secure Boot temporarily** (needed for installation):
   - Press `Win + R`, type `msconfig`, go to the Boot tab → Uncheck "Safe boot".
   - To access UEFI/BIOS: Settings → Update & Security → Recovery → Advanced startup → Restart now → Troubleshoot → Advanced options → UEFI Firmware Settings.
   - Disable "Secure Boot" in your UEFI/BIOS. You can re-enable it after installation — Ubuntu supports Secure Boot.

3. **Create a System Repair Disk** or backup your Windows boot configuration as a safety net.

### Create a Bootable USB

1. Download [Rufus](https://rufus.ie/) and insert your USB drive (8 GB+).
2. Launch Rufus, select your USB drive.
3. Click "SELECT" and choose the Ubuntu ISO.
4. Click "START" — Rufus will write the ISO. For Ubuntu, ISO mode works fine.
5. Wait for the process to complete.

### Installation: Choose the Correct Disk

1. Boot from the USB drive (access your boot menu via F12, F11, or Esc during startup).
2. Select "Try or Install Ubuntu".
3. When the installer reaches the **"Installation Type"** step, choose **"Something else"** (manual partitioning).
4. **Critical: Select the correct disk** at the top-right dropdown — this must be your separate disk (`D:\`), **not** the disk where Windows is installed.
   - Use the disk model name or size to identify the correct disk. Your Windows disk will show existing NTFS partitions.

#### Recommended partition layout (entire separate disk):

| Mount Point | Size | Type | Filesystem | Purpose |
|---|---|---|---|---|
| `/boot/efi` | 512 MB | Primary | FAT32 | Shared EFI boot partition (reuse existing if possible) |
| `/` (root) | 50 GB | Primary | ext4 | OS and applications |
| `/home` | Remaining | Primary | ext4 | User files and projects |
| `[swap]` | 2× RAM (or 16 GB) | Logical | swap | Memory overflow and hibernation |

#### Step-by-step partitioning:

1. **Select the correct disk** — verify it is your separate disk by checking the model name and size.
2. **Create the partitions** on the blank disk:
   - If an EFI partition already exists on your Windows disk, you can **reuse it** — select it and set mount point to `/boot/efi` **without formatting it**. Alternatively, create a new EFI partition on the Linux disk.
   - Create the root (`/`) partition with ext4.
   - Create the `/home` partition with ext4 (use the remaining space).
   - Create the swap partition.
3. **Set the bootloader device** to the disk where you installed Linux, e.g., `/dev/nvme1n1` or `/dev/sdb`.
4. Proceed with the installation.

> ⚠️ **Warning:** Double-check that you are partitioning the correct disk. Formatting the wrong disk will destroy your Windows installation.

### Bootloader (GRUB)

GRUB is installed automatically. After reboot:

- GRUB should list both Windows and your new Linux distro.
- Set the default OS and timeout in `/etc/default/grub`:
  ```bash
  sudo nano /etc/default/grub
  # Set GRUB_DEFAULT=0 (or 1 for Windows)
  # Set GRUB_TIMEOUT=5
  sudo update-grub
  ```

### If Windows Doesn't Appear in GRUB

```bash
sudo os-prober
sudo update-grub
```

If `os-prober` is disabled (Ubuntu 22.04+), enable it:
```bash
sudo sed -i 's/GRUB_DISABLE_OS_PROBER=true/GRUB_DISABLE_OS_PROBER=false/' /etc/default/grub
sudo update-grub
```

---

## 2. Post-Install System Setup

### 2.1 Install & Configure SSH Server (Port 22)

Install OpenSSH server, enable and start the service on port 22:

```bash
sudo apt update && sudo apt install -y openssh-server

# Enable and start the SSH service
sudo systemctl enable --now ssh

# Verify SSH is running and listening on port 22
sudo systemctl status ssh
sudo ss -tulpn | grep :22
```

*(Optional) Verify Port 22 configuration in sshd:*
```bash
# Confirm active sshd listening port
sudo sshd -T | grep -i port
# Expected output: port 22
```

Connect remotely from another machine on your local network:
```bash
ssh <username>@192.168.0.213
```

### 2.2 System Update

```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

### 2.3 Install Essential Packages

```bash
sudo apt install -y \
  curl wget git htop tmux \
  build-essential \
  net-tools iproute2 \
  ufw \
  fonts-font-awesome
```

### 2.4 Configure Static IP

Identify your network interface:
```bash
ip a
# Note the interface name, e.g., eth0 or enp3s0
```

Ubuntu uses Netplan for network configuration:

```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 192.168.0.213/24
      routes:
        - to: default
          via: 192.168.0.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
```

```bash
sudo netplan apply
```

### 2.5 Configure Firewall

```bash
sudo ufw allow 22/tcp      # SSH (or 'sudo ufw allow ssh')
sudo ufw allow 8080/tcp    # API
sudo ufw allow 3000/tcp    # Frontend (k8s NodePort)
sudo ufw enable
```

### 2.6 Create a Non-Root User with Sudo

If the installer didn't create one:
```bash
sudo useradd -m -s /bin/bash developer
sudo usermod -aG sudo developer
sudo passwd developer
```

---

## 3. Docker Installation

### 3.1 Install Docker

```bash
# Remove old versions
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt remove -y $pkg 2>/dev/null
done

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3.2 Post-Install Docker Configuration

```bash
# Start and enable Docker
sudo systemctl enable --now docker

# Add your user to the docker group (avoids sudo with docker)
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect

# Verify
docker run hello-world
```

### 3.3 Configure Docker Daemon (Optional)

For development, you may want to increase default limits:

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {
      "base": "172.80.0.0/16",
      "size": 24
    }
  ]
}
EOF
sudo systemctl restart docker
```

---

## 4. Kubernetes Cluster Setup

Three options are available: **k3s** (lightweight, recommended for persistent dev servers), **Kind** (Kubernetes in Docker, ideal for fast teardowns and image testing), and **kubeadm** (vanilla Kubernetes).

### Option A: k3s (Recommended for Persistent Dev Labs)

k3s is a lightweight, certified Kubernetes distribution that runs as a systemd service with minimal resources (~512 MB RAM) — ideal for a dedicated single-node dev server that persists across reboots.

#### Install k3s

```bash
curl -sfL https://get.k3s.io | sh -
```

#### Configure k3s

```bash
# k3s config file
sudo mkdir -p /etc/rancher/k3s
sudo tee /etc/rancher/k3s/config.yaml << 'EOF'
write-kubeconfig-mode: 0644
disable:
  - traefik
bind-address: 0.0.0.0
EOF

sudo systemctl restart k3s
```

#### Access k3s with kubectl

```bash
# Copy kubeconfig
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
chmod 600 ~/.kube/config

# Verify
kubectl cluster-info
kubectl get nodes
```

#### Install Helm

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Option B: Kind (Kubernetes in Docker)

Kind runs Kubernetes clusters using Docker container "nodes". It is ideal for ephemeral development environments, fast teardown/rebuild cycles, testing multi-node topologies, and loading locally built Docker images without pushing to a registry.

#### Install Kind CLI

```bash
# Download and install latest Kind binary
KIND_VERSION=$(curl -s https://api.github.com/repos/kubernetes-sigs/kind/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v${KIND_VERSION}/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Verify
kind version
```

#### Create Cluster Configuration with Port Mappings

To access services (such as frontend on port 3000, API/ArgoCD on port 8080, HTTP on 80/443) directly on your host or LAN, create a configuration with `extraPortMappings`:

```bash
cat << 'EOF' > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30000
    hostPort: 3000
    protocol: TCP
  - containerPort: 30080
    hostPort: 8080
    protocol: TCP
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
```

#### Create & Manage the Cluster

```bash
# Create cluster
kind create cluster --name pokedb-cluster --config kind-config.yaml

# Verify cluster connection
kubectl cluster-info --context kind-pokedb-cluster
kubectl get nodes

# Load local Docker images directly into Kind without a registry
# (Used automatically by scripts/local-dev.sh)
# kind load docker-image poke-db-api:latest --name pokedb-cluster
# kind load docker-image poke-db-frontend:latest --name pokedb-cluster

# Delete cluster when needed
# kind delete cluster --name pokedb-cluster
```

### Option C: kubeadm (Vanilla Kubernetes)

For a production-like single-node cluster:

#### Prerequisites

```bash
# Disable swap (required by kubeadm)
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Load required kernel modules
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# Set kernel parameters
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

#### Install kubeadm, kubelet, kubectl

```bash
sudo apt install -y apt-transport-https ca-certificates curl gpg

# Add Kubernetes GPG key
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | \
  sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Add Kubernetes repository
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | \
  sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

#### Initialize the Cluster

```bash
# Pull required images first
kubeadm config images pull

# Initialize
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=192.168.0.213

# Set up kubeconfig
mkdir -p ~/.kube
sudo cp /etc/kubernetes/admin.conf ~/.kube/config
sudo chown $USER:$USER ~/.kube/config

# Install Calico CNI
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml

# Taint the master node to allow workloads (single-node dev cluster)
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

---

## 5. ArgoCD Installation

ArgoCD provides GitOps-based continuous delivery for your Kubernetes cluster.

### 5.1 Install ArgoCD CLI

```bash
# Determine architecture
ARGOCD_VERSION=$(curl -s https://api.github.com/repos/argoproj/argo-cd/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/download/v${ARGOCD_VERSION}/argocd-linux-amd64
sudo install argocd /usr/local/bin/
rm argocd

# Verify
argocd version --client
```

### 5.2 Deploy ArgoCD to Kubernetes

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Verify deployment
kubectl get all -n argocd
kubectl rollout status deployment/argocd-server -n argocd --timeout=120s
```

### 5.3 Access ArgoCD

```bash
# Get the initial admin password
ARGOCD_INITIAL_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "ArgoCD admin password: $ARGOCD_INITIAL_PASSWORD"

# Port forward to access the UI
kubectl port-forward -n argocd svc/argocd-server 8080:443

# Login via CLI
argocd login localhost:8080 --username admin --password $ARGOCD_INITIAL_PASSWORD --insecure

# Change the default password
argocd account update-password
```

Open `https://localhost:8080` in your browser (accept the self-signed certificate).

### 5.4 Configure ArgoCD: Production & Preview Environments

The PokeDB repository includes ready-to-use ArgoCD manifests for two environments:

- **Production** (`../k8s/apps/argocd-prod.yaml`) — deploys from `k8s/overlays/prod`, targeting namespace `poke-db` on the `main` branch.
- **Preview** (`../k8s/apps/argocd-preview-appset.yaml`) — an ApplicationSet that creates a separate preview environment for every open PR labelled `preview`, each with its own namespace (`poke-db-pr-<N>`) and Postgres instance.

#### Deploy Production

```bash
# Apply the production Application
kubectl apply -f k8s/apps/argocd-prod.yaml

# Verify
argocd app get poke-db-prod
```

#### Deploy Preview Environments

```bash
# Apply the preview ApplicationSet
kubectl apply -f k8s/apps/argocd-preview-appset.yaml

# Verify
argocd appset get poke-db-previews
argocd app list | grep poke-db-pr-
```

#### How Preview Environments Work

1. Open a PR — CI builds and pushes images tagged `pr-<N>`.
2. Add the **`preview`** label to the PR.
3. ArgoCD creates `poke-db-pr-<N>` with its own Postgres, seeded by the PostSync hook.
4. When the PR is closed or unlabelled, the preview Application is deleted. Clean up the namespace:
   ```bash
   kubectl delete ns poke-db-pr-<N>
   ```

#### GitHub Notifications (Optional)

ArgoCD can post commit status checks (`pending`, `success`, `failure`) back to GitHub PRs and branch commits.

1. **Create a GitHub App** with **Commit statuses: Read and write** permission, installed on this repo.
2. **Create the notifications secret** with your GitHub App credentials:
   ```bash
   kubectl create secret generic argocd-notifications-secret \
     -n argocd \
     --from-literal=github-app-id="<GITHUB_APP_ID>" \
     --from-literal=github-installation-id="<GITHUB_INSTALLATION_ID>" \
     --from-file=github-privateKey=/path/to/private-key.pem
   ```
3. **Apply the notifications ConfigMap**:
   ```bash
   kubectl apply -f k8s/apps/argocd-notifications-cm.yaml
   ```

Status checks appear under `continuous-delivery/<app-name>` on commits and PRs.

### 5.5 Expose ArgoCD (Optional — for network access)

For static IP access without port-forwarding:

```bash
# Change argocd-server service type to NodePort
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# Get the port
NODE_PORT=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.spec.ports[0].nodePort}')
echo "Access ArgoCD at https://<YOUR_STATIC_IP>:$NODE_PORT"
```

---

## 6. Development Tools

### 6.1 Go (1.23+)

```bash
# Download Go
GO_VERSION=$(curl -s https://go.dev/VERSION?m=text | head -1)  # e.g., go1.23.4
GO_TAR="${GO_VERSION}.linux-amd64.tar.gz"

wget -q "https://go.dev/dl/${GO_TAR}"
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf "${GO_TAR}"
rm "${GO_TAR}"

# Add to PATH
cat <<'EOF' >> ~/.bashrc

# Go
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
EOF

source ~/.bashrc

# Verify
go version
```

### 6.2 Node.js and npm

```bash
# Install via NodeSource (LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 6.3 PostgreSQL Client

```bash
sudo apt install -y postgresql-client
```

### 6.4 kubectl (if not installed via kubeadm)

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

### 6.5 Helm

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

### 6.6 VS Code

```bash
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/vscode.gpg > /dev/null
echo "deb [arch=amd64 signed-by=/etc/apt/trusted.gpg.d/vscode.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update
sudo apt install -y code
```

#### Recommended VS Code Extensions

```bash
code --install-extension golang.go
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
code --install-extension redhat.vscode-yaml
code --install-extension ms-azuretools.vscode-docker
```

### 6.7 Additional Useful Tools

```bash
# k9s — Kubernetes CLI dashboard
K9S_VERSION=$(curl -s https://api.github.com/repos/derailed/k9s/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
wget -q "https://github.com/derailed/k9s/releases/download/v${K9S_VERSION}/k9s_Linux_x86_64.tar.gz"
tar -xzf k9s_Linux_x86_64.tar.gz
sudo mv k9s /usr/local/bin/
rm k9s_Linux_x86_64.tar.gz

# kustomize
KUSTOMIZE_VERSION=$(curl -s https://api.github.com/repos/kubernetes-sigs/kustomize/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
curl -sSL "https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64.tar.gz" | tar xz
sudo mv kustomize /usr/local/bin/

# stern — multi-pod log viewer
go install github.com/stern/stern@latest

# act — run GitHub Actions locally
go install github.com/nektos/act@latest

# fzf — fuzzy finder
sudo apt install -y fzf

# bat — cat with syntax highlighting
sudo apt install -y bat

# eza — ls replacement
sudo apt install -y eza
```

---

## 7. Verification & Troubleshooting

### 7.1 Full Verification Checklist

Run through this checklist after completing all steps:

```bash
# 1. System
uname -a
hostname -I

# 2. Docker
docker version
docker info
docker run --rm hello-world

# 3. Kubernetes
kubectl cluster-info
kubectl get nodes
kubectl get pods -A

# 4. Helm
helm version
helm list -A

# 5. ArgoCD
argocd version
kubectl get all -n argocd
argocd app get poke-db-prod
argocd appset get poke-db-previews

# 6. Development Tools
go version
node --version
npm --version
psql --version
kubectl version --client
helm version
kind version
code --version
k9s --version
```

### 7.2 Common Issues & Fixes

#### Docker: "permission denied while trying to connect to the Docker daemon socket"

```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Kind: "failed to create cluster: node(s) already exist for a cluster with that name" or port conflicts

```bash
# Delete existing cluster with matching name
kind delete cluster --name pokedb-cluster

# Check if another service is using port 80, 443, 3000, or 8080 on the host
sudo ss -tulpn | grep -E ':(80|443|3000|8080)\b'
```

#### k3s: Services not starting

```bash
sudo journalctl -u k3s -f
sudo systemctl restart k3s
```

#### kubeadm: "swap is running" error

```bash
sudo swapoff -a
# Ensure /etc/fstab has swap line commented out
```

#### kubeadm: Node NotReady after init

```bash
# Check CNI pod status
kubectl get pods -n kube-system

# Wait for CNI to be ready
kubectl wait --for=condition=Ready node --all --timeout=300s
```

#### ArgoCD: Login fails after port-forward

```bash
# Reset the password
kubectl -n argocd exec -it deploy/argocd-server -- argocd admin reset-password -n argocd
```

#### ArgoCD: Application shows "ImagePullBackOff"

Ensure images in GHCR are set to **Public** visibility, or configure `imagePullSecrets` in your Kustomize overlays.

#### Static IP conflicts

```bash
# Check for IP conflicts on the network
arping -c 3 192.168.0.213

# Verify your configuration
ip a
ip route
```

#### Go module proxy issues

```bash
go env -w GOPROXY=https://proxy.golang.org,direct
```

### 7.3 Quick Reference: PokeDB on the Dev Lab

Once the lab is set up, you can develop and deploy PokeDB:

```bash
# Clone and build
git clone https://github.com/JacobPotter/poke-db.git
cd poke-db

# Backend
cd api
go build -v ./...

# Frontend
cd ../frontend
npm install
npm run build

# Deploy via ArgoCD — Production
kubectl apply -f k8s/apps/argocd-prod.yaml

# Deploy via ArgoCD — Preview environments (one per PR labelled "preview")
kubectl apply -f k8s/apps/argocd-preview-appset.yaml

# Optional: GitHub commit status notifications
kubectl apply -f k8s/apps/argocd-notifications-cm.yaml

# Verify deployments
argocd app get poke-db-prod
argocd appset get poke-db-previews
```

---

## Appendix: Recommended System Resources

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB+ |
| Storage (Linux partition) | 100 GB | 200 GB+ (SSD/NVMe) |
| Network | 100 Mbps | 1 Gbps wired |
