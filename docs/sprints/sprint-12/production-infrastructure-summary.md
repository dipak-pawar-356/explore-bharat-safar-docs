# Explore Bharat Safar — Production Infrastructure Summary
## Multi-AZ Kubernetes Architecture, Helm Packaging & Workload Sizing

---

## 1. High-Availability Cluster Topology

Explore Bharat Safar runs across a Multi-AZ Kubernetes architecture (AWS EKS, GCP GKE, or sovereign bare-metal K8s) distributed across three distinct availability zones (`ap-south-1a`, `ap-south-1b`, `ap-south-1c`).

```
                              [ Cloudflare Anycast Edge ]
                                          │
                            [ Dual Ingress / Load Balancer ]
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
            [ AZ-1 Nodes ]          [ AZ-2 Nodes ]          [ AZ-3 Nodes ]
             • ebs-web Pod           • ebs-web Pod           • ebs-web Pod
             • ebs-api Pod           • ebs-api Pod           • ebs-api Pod
             • ebs-worker Pod        • ebs-worker Pod        • ebs-worker Pod
             • OTel Collector        • OTel Collector        • OTel Collector
```

---

## 2. Workload Specifications & Autoscaling Limits

| Workload | Base Replicas | HPA Scaling Range | Target Metrics | CPU Req / Limit | Memory Req / Limit | PDB Min Available |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`ebs-api`** | 6 | 4 – 30 Replicas | CPU 70%, RAM 80% | 500m / 2000m | 512Mi / 2048Mi | 2 Replicas |
| **`ebs-web`** | 4 | 3 – 20 Replicas | CPU 75% | 500m / 2000m | 512Mi / 2048Mi | 2 Replicas |
| **`ebs-worker`** | 3 | 2 – 10 Replicas | CPU 80% | 250m / 1000m | 256Mi / 1024Mi | 1 Replica |

---

## 3. Enterprise Helm Chart Architecture

The platform is packaged into a unified Helm chart located at `infrastructure/k8s/helm/explore-bharat-safar/`:
- **Chart Version**: 1.0.0 (`appVersion: "1.0.0"`).
- **Templates**:
  - `deployment-api.yaml`: Distroless Fastify API Gateway deployment with health probes.
  - `deployment-web.yaml`: Next.js 14 Standalone deployment with non-root execution.
  - `deployment-worker.yaml`: BullMQ background worker deployment with 60s termination grace.
  - `hpa.yaml`: Dynamic horizontal pod autoscaling rules with stabilization behavior.
  - `vpa.yaml`: Vertical pod autoscaling in `Off` recommendation mode for rightsizing.
  - `pdb.yaml`: Pod disruption budgets preventing simultaneous eviction during node maintenance.
  - `ingress.yaml`: Ingress with rate limiting annotations and TLS termination.
  - `serviceaccount.yaml`: Least-privilege IAM Roles for Service Accounts (IRSA).
