pipeline {
  agent any

  environment {
    API_DIR = "apps/api"
    WEB_DIR = "apps/web"
    SONAR_TOKEN = credentials("SONAR_TOKEN")
    RENDER_DEPLOY_HOOK = credentials("RENDER_DEPLOY_HOOK")
    RENDER_DEPLOY_HOOK_WEB = credentials("RENDER_DEPLOY_HOOK_WEB")
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Install Dependencies") {
      steps {
        sh '''docker run --rm -v "$WORKSPACE":/workspace -w /workspace node:20-alpine sh -c "npm install --workspace ${API_DIR} && npm install --workspace ${WEB_DIR}"'''
      }
    }

    stage("Unit/Integration Tests") {
      steps {
        sh "docker network create ticketing-ci"
        sh "docker run -d --name ticketing-db --network ticketing-ci -e POSTGRES_USER=ticket_user -e POSTGRES_PASSWORD=ticket_pass -e POSTGRES_DB=ticketing postgres:16-alpine"
        sh "sleep 5"
        sh '''docker run --rm --network ticketing-ci -v "$WORKSPACE":/workspace -w /workspace -e DATABASE_URL=postgres://ticket_user:ticket_pass@ticketing-db:5432/ticketing -e JWT_SECRET=test-secret node:20-alpine sh -c "npm run test"'''
      }
      post {
        always {
          sh "docker rm -f ticketing-db"
          sh "docker network rm ticketing-ci"
        }
      }
    }

    stage("Architecture Rules") {
      steps {
        sh '''docker run --rm -v "$WORKSPACE":/workspace -w /workspace node:20-alpine sh -c "npm run arch"'''
      }
    }

    stage("Docker Lint/Scan") {
      steps {
        sh "docker run --rm -i hadolint/hadolint hadolint ${API_DIR}/Dockerfile"
        sh "docker build -t ticketing-api ${API_DIR}"
        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock goodwithtech/dockle:latest ticketing-api"
        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock anchore/syft:latest ticketing-api -o table"
        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock anchore/grype:latest ticketing-api --fail-on high"
      }
    }

    stage("SonarCloud") {
      when {
        expression { return env.SONAR_TOKEN?.trim() }
      }
      steps {
        sh "docker run --rm -e SONAR_TOKEN=${SONAR_TOKEN} -v \"\$WORKSPACE\":/workspace -w /workspace sonarsource/sonar-scanner-cli:latest -Dsonar.projectKey=Crash0015_ProjDist -Dsonar.organization=crash0015 -Dsonar.sources=${API_DIR} -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=${SONAR_TOKEN}"
      }
    }

    stage("SAST (Semgrep)") {
      steps {
        sh "docker run --rm -v \"\$WORKSPACE\":/workspace -w /workspace returntocorp/semgrep semgrep --config p/owasp-top-ten --config p/javascript --error"
      }
    }

    stage("SCA (OSV)") {
      steps {
        sh "docker run --rm -v \"\$WORKSPACE\":/workspace -w /workspace ghcr.io/google/osv-scanner:latest --recursive --severity High,Critical ."
      }
    }

    stage("Repo/IaC Scan") {
      steps {
        sh "docker run --rm -v \"\$WORKSPACE\":/workspace -w /workspace aquasec/trivy:latest fs --severity HIGH,CRITICAL --exit-code 1 ."
        sh "docker run --rm -v \"\$WORKSPACE\":/workspace -w /workspace bridgecrew/checkov:latest -f render.yaml -f infra/docker-compose.yml --quiet --soft-fail false"
      }
    }

    stage("Deploy to Render") {
      when {
        expression {
          return (env.RENDER_DEPLOY_HOOK?.trim() || env.RENDER_DEPLOY_HOOK_WEB?.trim())
        }
      }
      steps {
        sh "if [ -n \"${RENDER_DEPLOY_HOOK}\" ]; then curl -s -X POST \"${RENDER_DEPLOY_HOOK}\"; fi"
        sh "if [ -n \"${RENDER_DEPLOY_HOOK_WEB}\" ]; then curl -s -X POST \"${RENDER_DEPLOY_HOOK_WEB}\"; fi"
      }
    }
  }
}
