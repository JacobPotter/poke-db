---
name: cluster-access
description: Use when the user asks to inspect, debug, or change the PokeDB Kubernetes cluster or Argo CD apps (pods, logs, CronJobs, deployments, syncs). Checks that cluster credentials are present in the session and sets the rules for kubectl and argocd use.
---

# Cluster access (Kubernetes / Argo CD)

Cluster access exists only when the session was started with credentials in the environment. Never ask the user to paste credentials into chat.

## 1. Check the session (without printing values)

Run this and only report which variables are set:

```bash
for v in KUBECONFIG ARGOCD_SERVER ARGOCD_AUTH_TOKEN; do
  if [ -n "${!v:-}" ]; then echo "$v: set"; else echo "$v: missing"; fi
done
```

- If `KUBECONFIG` is missing, `kubectl` has no cluster. If `ARGOCD_SERVER` or `ARGOCD_AUTH_TOKEN` is missing, `argocd` won't work. Tell the user which are missing and ask them to restart Claude Code with those variables exported. Don't guess a cluster, context, or server.
- Only proceed with the commands that have the variables they need.

## 2. Rules while working

- Never print credentials: no `echo $ARGOCD_AUTH_TOKEN`, `env`, or `printenv` on these variables, and don't write them to files, memory, or commit messages.
- Read-only diagnostics are fine without asking: `kubectl get`, `describe`, `logs`, and `argocd app get`.
- Namespaces: production is `poke-db`. PR previews are `poke-db-pr-<N>` (ApplicationSet `poke-db-previews`). There is no staging environment.
- Ask before any change: `kubectl apply/delete/scale/edit/rollout restart/create job`, `argocd app sync`, or edits to CronJobs or Secrets.
- Data refresh: the `refresh-db` CronJob (nightly) and the `refresh-db-seed` PostSync hook Job (runs with `-if-empty` on each sync). Trigger a manual refresh only on request, as a one-off job from the CronJob.
