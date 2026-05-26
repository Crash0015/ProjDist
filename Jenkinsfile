pipeline {
  agent any

  environment {
    NODE_VERSION = "20"
    API_DIR = "apps/api"
    WEB_DIR = "apps/web"
    E2E_DIR = "tests/e2e"
    API_URL = "http://localhost:4000"
    WEB_URL = "http://localhost:5173"
    DATABASE_URL = "postgres://ticket_user:ticket_pass@localhost:5432/ticketing"
    JWT_SECRET = "test-secret"
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

    stage("E2E Playwright") {
      steps {
        powershell "npx playwright install"
        powershell "docker run --name ticketing-db -e POSTGRES_USER=ticket_user -e POSTGRES_PASSWORD=ticket_pass -e POSTGRES_DB=ticketing -p 5432:5432 -d postgres:16-alpine"
        powershell "Start-Sleep -Seconds 5"
        powershell "docker exec ticketing-db psql ${DATABASE_URL} -f ${API_DIR}/src/db/schema.sql"
        powershell "docker exec ticketing-db psql ${DATABASE_URL} -f ${API_DIR}/src/db/seed.sql"
        powershell "Start-Process -NoNewWindow powershell -ArgumentList 'node ${API_DIR}/src/index.js'"
        powershell "npm --workspace ${WEB_DIR} run build"
        powershell "Start-Process -NoNewWindow powershell -ArgumentList 'npx serve ${WEB_DIR}/dist -l 5173'"
        powershell "Start-Sleep -Seconds 3"
        powershell "npx playwright test --config ${E2E_DIR}/playwright.config.js"
      }
      post {
        always {
          powershell "docker rm -f ticketing-db" 
        }
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
        powershell "grype ticketing-api"
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

    stage("DAST (ZAP)") {
      when {
        expression { return env.DAST_TARGET?.trim() }
      }
      steps {
        powershell "docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t ${DAST_TARGET}"
      }
    }

    stage("Deploy to Render") {
      when {
        expression { return env.RENDER_DEPLOY_HOOK?.trim() }
      }
      steps {
        powershell "Invoke-RestMethod -Method Post -Uri ${RENDER_DEPLOY_HOOK}"
      }
    }
  }
}
