# Jenkins Tools Installation (Windows Host)

Install these on the Jenkins host so the pipeline can run scans:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Docker.DockerDesktop
winget install Hadolint.Hadolint
winget install AquaSecurity.Trivy
winget install Goodwithtech.Dockle
winget install Anchore.Syft
winget install Anchore.Grype
```

## Sonar Scanner
Download from:
https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/sonarscanner-cli/

Add `sonar-scanner` to PATH.
