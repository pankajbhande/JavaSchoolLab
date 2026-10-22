// JavaSchoolLab CI/CD pipeline for Jenkins (planned home: https://jenkins.dhipansoft.in). Setup guide: docs/jenkins.md
//
// What it does on every build:
//   1. checks the code out, then runs the backend tests (Maven, Java 21) and the frontend checks (typecheck, tests, build, npm audit)
//   2. validates the three Docker Compose files and builds the application image, tagged  <build number>-<git commit>
//   3. scans the image for CRITICAL vulnerabilities
//   4. only on the main branch, when you tick DEPLOY and approve: copies the project to DEPLOY_DIR on the server and runs docker/scripts/deploy.sh,
//      which backs the database up, starts the new image, waits until it is healthy, and rolls back by itself if it is not.
//
// Assumptions (the simplest, most common set-up for one VPS):
//   - Jenkins runs ON the same server as the application, and its user ("jenkins") is in the "docker" group.
//   - Builds run in throw-away Docker containers (maven, node), so nothing but Docker and Git has to be installed for them.
//   - DEPLOY_DIR (default /opt/javaschoollab) holds the real  docker/.env  with the production passwords. It is NEVER in Git and never touched by the pipeline.
// If Jenkins will run on a different machine, only the "Deploy" stage changes (copy the image with docker save | ssh ... docker load, then run deploy.sh over SSH).
// This file has not been run on a Jenkins server yet: do the first run with DEPLOY unticked.

// True on main / master, whether this is a Multibranch job (BRANCH_NAME) or a plain Pipeline job (GIT_BRANCH, e.g. origin/main).
def isMainBranch() {
    def b = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
    return b.replaceFirst('^origin/', '') in ['main', 'master']
}

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()                          // two builds must never deploy at the same time
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timeout(time: 60, unit: 'MINUTES')
    }

    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy this build to the server (main branch only; asks for approval)')
        booleanParam(name: 'RUN_IMAGE_SCAN', defaultValue: true, description: 'Scan the image for CRITICAL vulnerabilities (fails the build if one is found)')
        string(name: 'DEPLOY_DIR', defaultValue: '/opt/javaschoollab', description: 'Folder on this server that holds docker/.env')
    }

    environment {
        IMAGE   = 'javaschoollab/app'
        MAVEN   = 'maven:3.9-eclipse-temurin-21'
        NODE    = 'node:22'
        TRIVY   = 'aquasec/trivy:0.57.1'
        COMPOSE = 'docker compose'
    }

    stages {
        stage('Prepare') {
            steps {
                script {
                    env.GIT_SHORT = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_SHORT}"
                    currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.GIT_SHORT}"
                }
                echo "Image tag for this build: ${env.IMAGE_TAG}"
            }
        }

        stage('Backend tests') {
            steps {
                // The tests use an in-memory H2 database: no database container is needed.
                sh '''
                    docker run --rm -v "$WORKSPACE":/w -v jenkins-m2-cache:/root/.m2 -w /w "$MAVEN" mvn -B -ntp test
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('Frontend checks') {
            steps {
                // typecheck + unit tests + production build, then a vulnerability audit of the production dependencies (fails on high or critical)
                sh '''
                    docker run --rm -e NODE_OPTIONS=--max-old-space-size=4096 -v "$WORKSPACE/frontend":/w -v jenkins-npm-cache:/root/.npm -w /w "$NODE" \
                        sh -c "npm ci && npm run verify && npm audit --omit=dev --audit-level=high"
                '''
            }
        }

        stage('Docker files and image') {
            steps {
                sh '''
                    # compose files must be valid; docker/.env is not in Git, so any non-empty value satisfies the "required" checks
                    export DB_PASSWORD=ci DB_ROOT_PASSWORD=ci EXPORTER_PASSWORD=ci GRAFANA_ADMIN_PASSWORD=ci REDIS_PASSWORD=ci JWT_SECRET=ci-ci-ci-ci-ci-ci-ci-ci-ci-ci-ci-ci-ci
                    $COMPOSE -f docker/docker-compose.shared.yml     config -q
                    $COMPOSE -f docker/docker-compose.yml            config -q
                    $COMPOSE -f docker/docker-compose.monitoring.yml config -q

                    docker build -f docker/Dockerfile -t "$IMAGE:$IMAGE_TAG" .
                '''
            }
        }

        stage('Image scan') {
            when { expression { params.RUN_IMAGE_SCAN } }
            steps {
                sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v jenkins-trivy-cache:/root/.cache "$TRIVY" \
                        image --severity CRITICAL --exit-code 1 --ignore-unfixed --no-progress "$IMAGE:$IMAGE_TAG"
                '''
            }
        }

        stage('Approve deploy') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    expression { isMainBranch() }
                }
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: "Deploy ${env.IMAGE_TAG} to production?", ok: 'Deploy'
                }
            }
        }

        stage('Deploy') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    expression { isMainBranch() }
                }
            }
            steps {
                // The image is already in this server's Docker (it was built here). Copy the project files (compose files, scripts, monitoring
                // configuration) next to the real docker/.env, without touching .env, the backups or any build output; then run the deploy script.
                sh '''
                    test -f "$DEPLOY_DIR/docker/.env" || { echo "$DEPLOY_DIR/docker/.env is missing: create it on the server first (see docs/jenkins.md)"; exit 1; }
                    rsync -a --delete \
                        --exclude '.git' --exclude 'node_modules' --exclude 'target' --exclude 'frontend/dist' \
                        --exclude 'docker/.env' --exclude 'backups' --exclude '.env' \
                        ./ "$DEPLOY_DIR"/
                    # who / what for the deployment audit log (docker/scripts/deploy-history.sh). BUILD_USER_ID comes from the optional "Build User Vars" plugin.
                    export DEPLOY_TRIGGER=jenkins DEPLOY_ACTOR="${BUILD_USER_ID:-jenkins} (build #$BUILD_NUMBER)" DEPLOY_BUILD_URL="$BUILD_URL" \
                           DEPLOY_GIT_COMMIT="$(git rev-parse HEAD)" DEPLOY_GIT_BRANCH="${BRANCH_NAME:-${GIT_BRANCH#origin/}}" \
                           DEPLOY_COMMIT_AUTHOR="$(git log -1 --format=%an)" DEPLOY_COMMIT_EMAIL="$(git log -1 --format=%ae)" DEPLOY_COMMIT_MESSAGE="$(git log -1 --format=%s)"
                    bash "$DEPLOY_DIR/docker/scripts/deploy.sh" "$IMAGE_TAG"
                '''
            }
        }
    }

    post {
        success {
            echo "Build ${env.IMAGE_TAG} finished successfully."
        }
        failure {
            echo "Build ${env.IMAGE_TAG} FAILED. Open the stage that is red; a failed deploy has already rolled back to the previous version."
            // To get an e-mail, configure SMTP in Jenkins (Manage Jenkins > System), then uncomment:
            // mail to: 'you@dhipansoft.in', subject: "JavaSchoolLab build ${env.BUILD_NUMBER} failed", body: "${env.BUILD_URL}"
        }
        always {
            // The containers above ran as root: hand the workspace back to the jenkins user so it can be cleaned.
            sh 'docker run --rm -v "$WORKSPACE":/w alpine chown -R "$(id -u):$(id -g)" /w || true'
            cleanWs(deleteDirs: true, notFailBuild: true)
        }
    }
}
