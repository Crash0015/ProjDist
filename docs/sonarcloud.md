# SonarCloud Setup

1) Create a SonarCloud project and link the repo.
2) Add the `SONAR_TOKEN` secret in Jenkins credentials.
3) The Jenkinsfile runs `sonar-scanner` when `SONAR_TOKEN` is set.
