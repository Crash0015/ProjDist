# Jenkins Setup (Local Docker)

## 1) Run Jenkins
```powershell
docker volume create jenkins_home
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

## 2) Unlock Jenkins
```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 3) Required Plugins
- Pipeline
- Git
- Docker Pipeline
- Credentials Binding
- NodeJS (optional)

## 4) Tools
Install on Jenkins host:
- Node.js 20
- Docker
- Playwright (via npm in pipeline)
- hadolint, trivy, dockle, syft, grype
- sonar-scanner

If you run Jenkins in Docker, install tools on the host OS.

## 5) Credentials
Add Jenkins Credentials:
- `SONAR_TOKEN` (Secret Text)
- `RENDER_DEPLOY_HOOK` (Secret Text)
- `DAST_TARGET` (Secret Text, optional)

## 6) Create Pipeline Job
- New Item -> Pipeline
- SCM: Git
- Repo: https://github.com/Crash0015/ProjDist.git
- Script Path: Jenkinsfile

## 7) Run
- Build Now
