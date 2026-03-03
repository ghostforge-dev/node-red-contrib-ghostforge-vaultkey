# node-red-contrib-ghostforge-vaultkey

**GhostForge™ VaultKey** — JIT authentication and secret burning for Node-RED.

Part of the [GhostForge™](https://github.com/ghostforge) Node-RED toolkit.

---

## What it does

Two nodes that work as a pair to handle secrets securely in Node-RED flows:

**gf-master-key** — Fetches a fresh GCP access token JIT (just-in-time) from the GCP Metadata Server on every message. Optionally fetches additional secrets from GCP Secret Manager. Secrets are placed in `msg.secret` and never stored.

**gf-burner** — Deletes `msg.secret` from the message immediately after use. Place this node right after any HTTP request node to ensure secrets never travel further in the flow.

---

## Design philosophy

- **Zero persistence** — Tokens are fetched fresh on every message, never cached
- **Zero hardcoding** — All credentials live in GCP Secret Manager
- **Zero exposure** — The Burner node destroys secrets the moment they are no longer needed
- **Minimal footprint** — Two small nodes, one job each

---

## Installation

Via Node-RED Palette Manager: search for `ghostforge-vaultkey`

Or via npm:
```bash
npm install node-red-contrib-ghostforge-vaultkey
```

---

## Requirements

- Node-RED >= 3.0.0
- Running on a GCP VM with a service account that has Secret Manager access
- GCP Secret Manager API enabled in your project

---

## Usage

```
[inject] → [gf-master-key] → [your function node] → [gf-burner] → [http request]
```

Configure `gf-master-key` with your GCP Project ID and the list of secrets to fetch. Each secret appears as `msg.secret["secret-name"]` downstream.

Place `gf-burner` immediately after your last node that needs the secrets.

---

## Part of the GhostForge™ toolkit

- **ghostforge-vaultkey** — JIT auth & secret burning (this package)
- **ghostforge-flowgate** — API call queue & rate limiting
- **ghostforge-arrows** — Visual flow routing nodes

---

*GhostForge™ is a trademark of Zerr Remoteservice*
