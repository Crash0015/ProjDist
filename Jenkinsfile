pipeline {
  agent any

  environment {
    NODE_VERSION = "20"
    API_DIR = "apps/api"
    WEB_DIR = "apps/web"
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Install Dependencies") {
      steps {
        powershell "npm install --workspace ${API_DIR}"
        powershell "npm install --workspace ${WEB_DIR}"
        powershell "npm install --workspace ${E2E_DIR}"
      }
    }

    stage("Unit/Integration Tests") {
      steps {
        powershell "npm run test"
      }
    }

    stage("Architecture Rules") {
      steps {
        powershell "npm run arch"
      }
    }

    stage("Docker Lint/Scan") {
      steps {
        powershell "hadolint ${API_DIR}/Dockerfile"
        powershell "docker build -t ticketing-api ${API_DIR}"
        powershell "trivy image ticketing-api"
        powershell "dockle ticketing-api"
        powershell "syft ticketing-api -o table"
        powershell "grype ticketing-api --fail-on high"
      }
    }

    stage("SonarCloud") {
      when {
        expression { return env.SONAR_TOKEN?.trim() }
      }
      steps {
        powershell "sonar-scanner -Dsonar.projectKey=Crash0015_ProjDist -Dsonar.organization=crash0015 -Dsonar.sources=${API_DIR} -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=${SONAR_TOKEN}"
      }
    }

    stage("SAST (Semgrep)") {
      steps {
        powershell "semgrep scan --config p/owasp-top-ten --config p/javascript --error"
      }
    }

    stage("SCA (OSV)") {
      steps {
        powershell "osv-scanner --severity High,Critical --recursive ."
      }
    }

    stage("Repo/IaC Scan") {
      steps {
        powershell "trivy fs --severity HIGH,CRITICAL --exit-code 1 ."
        powershell "checkov -f render.yaml -f infra/docker-compose.yml --quiet --soft-fail false"
      }
    }

    stage("Deploy to Render") {
      when {
        expression {
          return (env.RENDER_DEPLOY_HOOK?.trim() || env.RENDER_DEPLOY_HOOK_WEB?.trim())
        }
      }
      steps {
        powershell "if ($env:RENDER_DEPLOY_HOOK) { Invoke-RestMethod -Method Post -Uri $env:RENDER_DEPLOY_HOOK }"
        powershell "if ($env:RENDER_DEPLOY_HOOK_WEB) { Invoke-RestMethod -Method Post -Uri $env:RENDER_DEPLOY_HOOK_WEB }"
      }
    }
  }
}
