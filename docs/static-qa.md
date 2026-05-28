# Static QA Pipeline (2026)

This repo uses a static-quality pipeline centered on SonarCloud and modern SAST/SCA tooling.

## Included checks
- SonarCloud (code quality and security)
- Semgrep (OWASP Top 10 + JS rules)
- OSV-Scanner (dependency CVEs)
- Trivy fs (repo misconfig + secrets)
- Hadolint (Dockerfile)
- Checkov (IaC for render.yaml + compose)
- dependency-cruiser (architecture rules)

## Severity policy
- Fail on High/Critical for SCA and repo scans.
- Quality gate enforced by SonarCloud.
