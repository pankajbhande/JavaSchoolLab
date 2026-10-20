// Microservices roadmap, part 3: sections 11-15 (Docker and Kubernetes, CI/CD, testing, advanced architecture patterns, interview questions).
// Examples use Java 21, Spring Boot 3.x. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';
import { microservicesExamplesFull } from './RoadmapExamples2';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const ms = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('ms', n, title, priority, topics);

const microservicesRoadmap3Base: SubTopic[] = [
  ms(11, 'Docker and Kubernetes', 'Core', [
    topic(
      'ms-docker-fundamentals',
      'Docker Fundamentals, Dockerfile, Docker Compose, Container Networking and Images',
      [
        blk(`<h3>Docker fundamentals</h3>
• A <b>container</b> packages an app with its dependencies and runs it isolated using Linux <b>namespaces</b> (process, network, filesystem views) and <b>cgroups</b> (CPU/memory limits), sharing the host kernel: lighter and faster than VMs. An <b>image</b> is a read-only layered template; a <b>container</b> is a running instance; a <b>registry</b> (Docker Hub, ECR, GHCR, Harbor, Artifactory) stores images.<br>
• Why for microservices: <b>identical environments</b> from laptop to production (dev/prod parity), fast start, <b>immutable artifacts</b>, per-service dependencies, simple scaling, the unit Kubernetes schedules.<br>
• Commands: <code>docker build -t catalogue:1.0 .</code>, <code>docker run -p 8081:8081 -e SPRING_PROFILES_ACTIVE=dev catalogue:1.0</code>, <code>docker ps</code>, <code>logs -f</code>, <code>exec -it ... sh</code>, <code>stop/rm</code>, <code>images</code>, <code>push</code>.`,
          `docker build -t javaschoollab/catalogue-service:1.0.0 .
docker run -d --name catalogue -p 8081:8081 \\
  -e SPRING_PROFILES_ACTIVE=dev -e DB_URL=jdbc:postgresql://host.docker.internal:5432/catalogue \\
  --memory=512m --cpus=1 javaschoollab/catalogue-service:1.0.0
docker logs -f catalogue
docker exec -it catalogue sh
docker stop catalogue && docker rm catalogue
docker push javaschoollab/catalogue-service:1.0.0`,
        ),
      ],
      [
        blk(`<h3>Writing a good Dockerfile for Spring Boot</h3>
• Use a <b>multi-stage build</b> (build with JDK + Maven, run with a small JRE image), a <b>non-root user</b>, <b>layered jar</b> (Spring Boot layertools: dependencies change rarely so they cache well), <b>pinned base image versions</b> (distroless/Temurin/Alpine/Chainguard), correct <b>JVM memory flags</b> for containers (<code>-XX:MaxRAMPercentage=75</code>), <code>.dockerignore</code>, one process per container, health check, and no secrets in layers.<br>
• Alternatives to a hand-written Dockerfile: <b>Spring Boot Buildpacks</b> (<code>mvn spring-boot:build-image</code>), <b>Jib</b> (builds optimised images without Docker), <b>GraalVM native image</b> (fast start, small memory), <b>CRaC</b>.`,
          `# Dockerfile (multi-stage, layered, non-root)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw -q dependency:go-offline                  # cached layer until pom.xml changes
COPY src src
RUN ./mvnw -q package -DskipTests && java -Djarmode=tools -jar target/*.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre
RUN useradd --system --uid 1001 app
WORKDIR /app
COPY --from=build /workspace/extracted/dependencies/ ./
COPY --from=build /workspace/extracted/spring-boot-loader/ ./
COPY --from=build /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build /workspace/extracted/application/ ./
USER app
EXPOSE 8081
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8081/actuator/health/liveness || exit 1
ENTRYPOINT ["java", "-jar", "catalogue-service.jar"]

# .dockerignore: target/  .git/  *.md  .idea/

# without a Dockerfile
# ./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=javaschoollab/catalogue:1.0.0`,
        ),
      ],
      [
        blk(`<h3>Docker Compose, networking and image management</h3>
• <b>Docker Compose</b> defines a multi-container application in <code>compose.yaml</code>: services, networks, volumes, env, ports, <code>depends_on</code> with <b>healthchecks</b>. Ideal for local development of a microservices system (PostgreSQL, Kafka, Keycloak, services) and integration environments: <code>docker compose up -d</code>.<br>
• <b>Container networking</b>: <b>bridge</b> network (default): containers on a user-defined bridge reach each other by <b>service name</b> via Docker DNS (<code>http://catalogue:8081</code>), expose to the host with <code>ports: "8081:8081"</code>; <b>host</b> (shares the host network), <b>overlay</b> (multi-host, Swarm), <b>none</b>. Inside a container <code>localhost</code> is the container itself: use the service name or <code>host.docker.internal</code> for the host.<br>
• <b>Images</b>: small and secure (JRE not JDK, distroless, no shell tools in prod), <b>tags</b> (immutable version tags + digest; avoid <code>latest</code> in deployments), vulnerability scanning (Trivy), SBOM, signing (cosign), layer caching, registry cleanup policies. <b>Volumes</b> persist data; containers are ephemeral.`,
          `# compose.yaml : local microservices environment
services:
  postgres:
    image: postgres:16
    environment: { POSTGRES_USER: jsl, POSTGRES_PASSWORD: secret, POSTGRES_DB: catalogue }
    volumes: [ pgdata:/var/lib/postgresql/data ]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U jsl"], interval: 5s, retries: 10 }
  kafka:
    image: apache/kafka:3.8.0
    ports: [ "9092:9092" ]
  catalogue:
    build: ./catalogue-service
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_URL: jdbc:postgresql://postgres:5432/catalogue          # service name = hostname on the compose network
      KAFKA_BROKERS: kafka:9092
    ports: [ "8081:8081" ]
    depends_on: { postgres: { condition: service_healthy }, kafka: { condition: service_started } }
  gateway:
    build: ./api-gateway
    ports: [ "8080:8080" ]
    depends_on: [ catalogue ]
volumes: { pgdata: {} }

# docker compose up -d --build     docker compose logs -f catalogue     docker compose down -v`,
        ),
      ],
      [
        ['Docker image vs container?', 'An image is a read-only layered template containing the app and its dependencies; a container is a running instance of an image with its own writable layer, process and network namespace.'],
        ['What are the best practices for a Spring Boot Dockerfile?', 'Multi-stage build, small JRE base image with a pinned version, non-root user, layered jar for caching, container-aware JVM flags, .dockerignore, health check, and no secrets in the image.'],
        ['How do containers on one Docker network reach each other?', 'By service/container name through Docker\'s embedded DNS on a user-defined bridge network; localhost inside a container refers to the container itself.'],
      ],
    ),
    topic(
      'ms-k8s-fundamentals',
      'Kubernetes Fundamentals: Pods, Deployments, Services and Ingress',
      [
        blk(`<h3>Kubernetes architecture and core objects</h3>
• <b>Kubernetes</b> orchestrates containers across a cluster: scheduling, scaling, self-healing, rollouts, service discovery, config and storage. <b>Control plane</b>: API server, etcd (state), scheduler, controller manager; <b>nodes</b> run the kubelet, container runtime and kube-proxy.<br>
• <b>Declarative model</b>: you describe the <b>desired state</b> in YAML (<code>kubectl apply -f</code>); controllers continuously reconcile actual state to it.<br>
• Core objects: <b>Pod</b> (one or more containers sharing network/storage; the smallest unit; ephemeral), <b>ReplicaSet</b> (keeps N pods), <b>Deployment</b> (manages ReplicaSets: rollouts, rollbacks), <b>Service</b> (stable virtual IP/DNS + load balancing to pods by label), <b>Ingress</b> (HTTP routing from outside), <b>Namespace</b>, <b>ConfigMap/Secret</b>, <b>Job/CronJob</b>, <b>StatefulSet</b> (stable identity/storage for databases), <b>DaemonSet</b>.`,
          `kubectl get pods,svc,deploy -n jsl
kubectl apply -f k8s/                          # declarative: create/update from files
kubectl describe pod catalogue-6d5f7c9b8-xk2lp # events, probes, why it is Pending/CrashLooping
kubectl logs -f deploy/catalogue --tail=100
kubectl exec -it deploy/catalogue -- sh
kubectl port-forward svc/catalogue 8081:80     # reach a service from your laptop
kubectl rollout status deploy/catalogue && kubectl rollout undo deploy/catalogue
kubectl top pods                                # needs metrics-server`,
        ),
      ],
      [
        blk(`<h3>Pods and Deployments</h3>
• A <b>Deployment</b> declares a pod template, <b>replicas</b>, a label <b>selector</b> and the <b>update strategy</b> (RollingUpdate: <code>maxSurge</code>, <code>maxUnavailable</code>). Always set <b>resource requests and limits</b> (requests drive scheduling; limits cap usage: a container over its memory limit is <b>OOMKilled</b>), probes, a security context (non-root, read-only filesystem) and labels. Never run bare Pods in production.<br>
• Use <b>immutable image tags</b> (version or digest); spread replicas across nodes/zones (<code>topologySpreadConstraints</code>, anti-affinity); a <b>PodDisruptionBudget</b> keeps a minimum available during node drains.`,
          `apiVersion: apps/v1
kind: Deployment
metadata: { name: catalogue, namespace: jsl, labels: { app: catalogue } }
spec:
  replicas: 3
  selector: { matchLabels: { app: catalogue } }
  strategy: { type: RollingUpdate, rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } }      # never reduce capacity during a rollout
  template:
    metadata: { labels: { app: catalogue } }
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 1001 }
      containers:
        - name: catalogue
          image: ghcr.io/javaschoollab/catalogue-service:1.4.2
          ports: [ { containerPort: 8081, name: http } ]
          resources:
            requests: { cpu: 250m, memory: 512Mi }
            limits:   { memory: 768Mi }                                   # memory limit; CPU limit often omitted to avoid throttling
          envFrom: [ { configMapRef: { name: catalogue-config } }, { secretRef: { name: catalogue-secrets } } ]
          readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 8081 }, periodSeconds: 5 }
          livenessProbe:  { httpGet: { path: /actuator/health/liveness, port: 8081 }, initialDelaySeconds: 30 }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: catalogue-pdb }
spec: { minAvailable: 2, selector: { matchLabels: { app: catalogue } } }`,
        ),
      ],
      [
        blk(`<h3>Services and Ingress</h3>
• A <b>Service</b> gives pods a stable name and load-balances to <b>ready</b> pods matching its selector. Types: <b>ClusterIP</b> (internal; default), <b>NodePort</b> (port on every node), <b>LoadBalancer</b> (cloud LB), <b>ExternalName</b>; <b>headless</b> (<code>clusterIP: None</code>) returns pod IPs (StatefulSets, client-side balancing). Inside the cluster services are reachable as <code>http://catalogue</code> (same namespace) or <code>catalogue.jsl.svc.cluster.local</code>: this is your <b>service discovery</b>.<br>
• <b>Ingress</b> (or the newer <b>Gateway API</b>) routes external HTTP(S) traffic to Services by host/path through an <b>ingress controller</b> (NGINX, Traefik, Envoy/Contour, cloud ALB), terminates TLS (cert-manager) and applies annotations (rate limits, timeouts). Often the Ingress points to your <b>Spring Cloud Gateway</b> (single entry) or routes directly to services.`,
          `apiVersion: v1
kind: Service
metadata: { name: catalogue, namespace: jsl }
spec:
  selector: { app: catalogue }
  ports: [ { name: http, port: 80, targetPort: http } ]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  namespace: jsl
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
    nginx.ingress.kubernetes.io/proxy-read-timeout: "30"
spec:
  ingressClassName: nginx
  tls: [ { hosts: [ api.javaschoollab.com ], secretName: api-tls } ]
  rules:
    - host: api.javaschoollab.com
      http:
        paths:
          - { path: /api/courses, pathType: Prefix, backend: { service: { name: catalogue, port: { number: 80 } } } }
          - { path: /api/learning, pathType: Prefix, backend: { service: { name: learning, port: { number: 80 } } } }`,
        ),
      ],
      [
        ['Pod vs Deployment vs Service?', 'A Pod is the smallest runnable unit (one or more containers); a Deployment manages replicated Pods with rolling updates and rollbacks; a Service gives a set of Pods a stable name/IP and load-balances traffic to the ready ones.'],
        ['What is the difference between Service and Ingress?', 'A Service exposes pods inside the cluster (or via NodePort/LoadBalancer) at L4; an Ingress routes external HTTP(S) traffic by host and path to Services through an ingress controller and handles TLS.'],
        ['Why set resource requests and limits?', 'Requests let the scheduler place pods and guarantee capacity; limits cap usage (exceeding memory kills the container). Without them pods can starve or be evicted unpredictably.'],
      ],
    ),
    topic(
      'ms-k8s-config-scaling-probes',
      'ConfigMaps and Secrets, Horizontal Pod Autoscaling, Probes and Rolling Deployments',
      [
        blk(`<h3>ConfigMaps and Secrets</h3>
• <b>ConfigMap</b>: non-sensitive configuration (key/values or files) injected as <b>environment variables</b> (<code>envFrom</code>), <b>files</b> in a mounted volume, or command args. <b>Secret</b>: sensitive data (passwords, tokens, TLS keys): base64-encoded (<b>not encrypted</b> by default): enable <b>encryption at rest</b>, restrict <b>RBAC</b>, prefer external managers (Vault, External Secrets, Sealed Secrets). Mounted <b>files update</b> when the object changes (env vars do not): pods usually need a <b>rolling restart</b> (<code>kubectl rollout restart</code>, Reloader, or Spring Cloud Kubernetes reload).<br>
• Spring mapping: env <code>SPRING_DATASOURCE_URL</code> ↔ <code>spring.datasource.url</code>; mounted <code>application.yml</code> via <code>spring.config.import=optional:file:/config/</code>.`,
          `apiVersion: v1
kind: ConfigMap
metadata: { name: catalogue-config, namespace: jsl }
data:
  SPRING_PROFILES_ACTIVE: prod
  JSL_CATALOGUE_MAX_PAGE_SIZE: "100"
  application.yml: |
    jsl.pricing.default-currency: INR
---
apiVersion: v1
kind: Secret
metadata: { name: catalogue-secrets, namespace: jsl }
type: Opaque
stringData:                                   # applied as base64; keep real values out of Git (Sealed/External Secrets)
  SPRING_DATASOURCE_PASSWORD: change-me

# in the Deployment
#   envFrom: [ { configMapRef: { name: catalogue-config } }, { secretRef: { name: catalogue-secrets } } ]
#   volumeMounts: [ { name: cfg, mountPath: /config } ]     volumes: [ { name: cfg, configMap: { name: catalogue-config } } ]`,
        ),
      ],
      [
        blk(`<h3>Horizontal Pod Autoscaling (HPA)</h3>
• The <b>HPA</b> adjusts <code>replicas</code> of a Deployment based on metrics: <b>CPU/memory utilisation</b> (needs <b>metrics-server</b> and <b>resource requests</b>), <b>custom metrics</b> (requests per second, queue length/consumer lag via the Prometheus adapter) or <b>external metrics</b> (<b>KEDA</b> scales on Kafka lag, RabbitMQ queue depth, cron, to and from <b>zero</b>). It computes <code>desired = ceil(current × currentMetric / targetMetric)</code> within min/max and with <b>stabilisation windows</b> to prevent flapping.<br>
• Related: <b>VPA</b> (vertical, right-sizes requests), <b>Cluster Autoscaler/Karpenter</b> (adds nodes when pods are unschedulable). Design for scaling: stateless pods, fast startup (readiness), graceful shutdown, connection pools sized for N replicas (<code>replicas × pool size ≤ DB max connections</code>).`,
          `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: catalogue, namespace: jsl }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: catalogue }
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }
    - type: Pods
      pods: { metric: { name: http_server_requests_per_second }, target: { type: AverageValue, averageValue: "150" } }
  behavior:
    scaleUp:   { stabilizationWindowSeconds: 30, policies: [ { type: Percent, value: 100, periodSeconds: 30 } ] }
    scaleDown: { stabilizationWindowSeconds: 300 }                  # scale down slowly

# KEDA: scale a Kafka consumer on lag (also to zero)
# triggers: [ { type: kafka, metadata: { bootstrapServers: kafka:9092, consumerGroup: learning, topic: payments.events, lagThreshold: "500" } } ]`,
        ),
      ],
      [
        blk(`<h3>Readiness and liveness probes, and rolling deployments</h3>
• <b>Readiness</b> controls traffic (pod removed from Service endpoints when failing); <b>liveness</b> restarts a stuck container; <b>startup</b> gives slow apps time before liveness applies. Spring Boot Actuator provides <code>/actuator/health/readiness</code> and <code>/liveness</code> (see Observability). A <b>wrong liveness probe</b> (depending on the database) turns a database blip into a restart storm.<br>
• <b>Rolling update</b>: new pods are created and must become <b>ready</b> before old ones are terminated (<code>maxSurge</code>/<code>maxUnavailable</code>); traffic shifts gradually; <code>kubectl rollout undo</code> reverts. Make it <b>zero-downtime</b>: readiness probes, graceful shutdown (<code>server.shutdown=graceful</code>), <code>preStop</code> sleep for endpoint propagation, <code>terminationGracePeriodSeconds</code> &gt; shutdown timeout, <b>backward-compatible</b> DB and API changes (old and new run together), PDBs. Failed rollouts stall (new pods never ready) leaving the old version serving: set <code>progressDeadlineSeconds</code> and alert on it.`,
          `spec:
  progressDeadlineSeconds: 300                         # mark the rollout failed if pods are not ready in 5 minutes
  strategy: { type: RollingUpdate, rollingUpdate: { maxSurge: 25%, maxUnavailable: 0 } }
  template:
    spec:
      terminationGracePeriodSeconds: 45
      containers:
        - name: catalogue
          lifecycle: { preStop: { exec: { command: ["sh", "-c", "sleep 10"] } } }   # keep serving while endpoints are removed everywhere
          readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 8081 }, periodSeconds: 5, failureThreshold: 3 }

kubectl set image deploy/catalogue catalogue=ghcr.io/javaschoollab/catalogue-service:1.4.3
kubectl rollout status deploy/catalogue --timeout=5m || kubectl rollout undo deploy/catalogue
kubectl rollout history deploy/catalogue`,
        ),
      ],
      [
        ['What do readiness and liveness probes do?', 'Readiness decides whether a pod receives traffic; liveness decides whether the container should be restarted. Mixing them up (liveness depending on a database) can cause restart storms.'],
        ['How does the Horizontal Pod Autoscaler work?', 'It periodically compares a metric (CPU, custom, external) with a target and scales the Deployment replicas up or down within min/max limits, using stabilisation windows to avoid flapping.'],
        ['How do you achieve zero-downtime rolling deployments?', 'Use readiness probes, maxUnavailable 0, graceful shutdown with a preStop delay, PodDisruptionBudgets and backward-compatible database/API changes so old and new versions run side by side.'],
      ],
    ),
  ]),

  ms(12, 'CI/CD and DevOps', 'Core', [
    topic(
      'ms-git-pipelines',
      'Git and Branching Strategies, Jenkins, GitHub Actions, Build Pipelines and Artifact Repositories',
      [
        blk(`<h3>Git and branching strategies</h3>
• <b>Trunk-based development</b>: short-lived branches (hours to 2 days) merged to <code>main</code> via pull requests, feature flags for unfinished work; fits continuous delivery. <b>GitHub Flow</b>: feature branch → PR → review → merge → deploy. <b>Git Flow</b> (develop/release/hotfix) suits scheduled releases but slows CI/CD.<br>
• <b>Repository layout</b>: <b>polyrepo</b> (one repo per service: independent pipelines, clear ownership) vs <b>monorepo</b> (shared code, atomic refactors; needs path-filtered pipelines and tooling like Nx/Bazel/Maven reactor). Protect <code>main</code>: required reviews and status checks, signed commits, no force-push, CODEOWNERS. <b>Conventional Commits</b> + <b>semantic versioning</b> automate changelogs and versions.`,
          `git switch -c feature/enrollment-events
git commit -m "feat(learning): publish EnrollmentCreated via outbox"
git push -u origin feature/enrollment-events          # open a pull request: CI runs, reviewers approve, squash-merge
git tag -a v1.4.2 -m "Release 1.4.2" && git push origin v1.4.2

# CODEOWNERS (required reviewers per service)
# /catalogue-service/   @javaschoollab/catalogue-team
# /payment-service/     @javaschoollab/payments-team @javaschoollab/security

# Branch protection (GitHub): require PR + 1 approval + status checks "build", "test", "sonar"; require linear history`,
        ),
      ],
      [
        blk(`<h3>Build pipelines: GitHub Actions and Jenkins</h3>
• A pipeline per service: <b>checkout → build/compile → unit tests → static analysis (Sonar) → package → build image → scan image → push to registry → deploy to dev → integration/contract tests → deploy to staging → (approval) → production</b>. <b>CI</b> = integrate and verify every change; <b>CD</b> = deliver (always releasable) or deploy (automatically to production).<br>
• <b>GitHub Actions</b>: YAML workflows in <code>.github/workflows</code>, hosted/self-hosted runners, reusable workflows, environments with approvals, OIDC to the cloud (no long-lived keys), caching (<code>actions/setup-java</code> with Maven cache). <b>Jenkins</b>: <code>Jenkinsfile</code> (declarative pipeline), agents (Kubernetes pod agents), shared libraries, a huge plugin ecosystem: common in enterprises. Either way: <b>pipeline as code</b>, ephemeral build agents, fast feedback (&lt; 10 min), no secrets in logs.`,
          `# .github/workflows/catalogue-service.yml
name: catalogue-service
on:
  push: { branches: [main], paths: ["catalogue-service/**"] }
  pull_request: { paths: ["catalogue-service/**"] }
env: { REGISTRY: ghcr.io, IMAGE: ghcr.io/javaschoollab/catalogue-service }
jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21, cache: maven }
      - run: ./mvnw -B -pl catalogue-service verify              # unit + integration tests (Testcontainers)
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: \${{ github.actor }}, password: \${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v6
        with: { context: catalogue-service, push: \${{ github.ref == 'refs/heads/main' }}, tags: "\${{ env.IMAGE }}:\${{ github.sha }}", cache-from: type=gha, cache-to: type=gha,mode=max }`,
        ),
      ],
      [
        blk(`<h3>Jenkins pipeline and artifact repositories</h3>
• <b>Jenkins</b> declarative pipeline: stages with <code>agent</code> (a Kubernetes pod with Maven, Docker/Kaniko), <code>tools</code>, <code>environment</code> using <b>credentials binding</b>, <code>post</code> actions (notify), <code>when</code> conditions (branch), parallel stages, <code>input</code> approval before production, shared libraries for common steps.<br>
• <b>Artifact repositories</b> store build outputs: <b>Maven artifacts</b> (JARs/libraries: Nexus, JFrog Artifactory, GitHub Packages, Maven Central proxy), <b>container images</b> (registry: Harbor, ECR, GHCR, Artifactory), Helm charts (OCI). Benefits: immutable versioned artifacts, caching/proxying upstream, access control, retention and vulnerability metadata, <b>build once, promote the same artifact</b> through environments (never rebuild per environment). Use <b>semantic versions</b> for releases and unique tags (commit SHA) for images; sign and keep an <b>SBOM</b>.`,
          `// Jenkinsfile
pipeline {
  agent { kubernetes { yamlFile 'ci/pod.yaml' } }               // pod with maven + kaniko containers
  options { timeout(time: 30, unit: 'MINUTES'); disableConcurrentBuilds() }
  environment { IMAGE = "registry.jsl.com/catalogue:\${env.GIT_COMMIT.take(8)}" }
  stages {
    stage('Build & Test') { steps { container('maven') { sh './mvnw -B verify' } } post { always { junit '**/target/surefire-reports/*.xml' } } }
    stage('Sonar')        { steps { container('maven') { withSonarQubeEnv('sonar') { sh './mvnw sonar:sonar' } } } }
    stage('Quality Gate') { steps { timeout(time: 5, unit: 'MINUTES') { waitForQualityGate abortPipeline: true } } }
    stage('Image')        { steps { container('kaniko') { sh '/kaniko/executor --context . --destination $IMAGE' } } }
    stage('Deploy Staging') { when { branch 'main' } steps { sh 'helm upgrade --install catalogue charts/catalogue -n staging --set image.tag=$GIT_COMMIT' } }
    stage('Approve')      { when { branch 'main' } steps { input message: 'Deploy to production?', ok: 'Deploy' } }
    stage('Deploy Prod')  { when { branch 'main' } steps { sh 'helm upgrade --install catalogue charts/catalogue -n prod --set image.tag=$GIT_COMMIT' } }
  }
  post { failure { slackSend channel: '#builds', message: "FAILED \${env.JOB_NAME} #\${env.BUILD_NUMBER}" } }
}`,
        ),
      ],
      [
        ['Trunk-based development vs Git Flow?', 'Trunk-based uses short-lived branches merged to main frequently with feature flags, enabling continuous delivery; Git Flow uses long-lived develop/release branches suited to scheduled releases but slows integration.'],
        ['What does "build once, deploy many" mean?', 'Build and test an artifact (image) once, store it immutably in a registry, and promote that same artifact through environments with only configuration changing, instead of rebuilding per environment.'],
        ['Jenkins vs GitHub Actions?', 'Both implement pipeline-as-code. GitHub Actions is hosted and tightly integrated with GitHub; Jenkins is a self-hosted, plugin-rich server common in enterprises. Choose by existing tooling, control and compliance needs.'],
      ],
    ),
    topic(
      'ms-quality-security-scanning',
      'Automated Testing in Pipelines, SonarQube, Checkmarx and Container Image Scanning',
      [
        blk(`<h3>Automated testing in the pipeline</h3>
• Run the <b>test pyramid</b> automatically: <b>unit</b> (seconds, every commit), <b>integration</b> with Testcontainers (minutes), <b>contract</b> tests (provider verification, consumer stubs), <b>end-to-end/smoke</b> on a deployed environment (few), <b>performance</b> (nightly or pre-release), <b>security</b> (SAST, SCA, DAST). Fail fast: cheap checks first; <b>parallelise</b>; quarantine flaky tests (and fix them); publish reports (JUnit XML, coverage).<br>
• Quality gates: tests pass, <b>coverage on new code</b> (e.g. ≥ 80%), no new blocker/critical issues, no high vulnerabilities, license policy, build reproducible. <b>Mutation testing</b> (PIT) measures test strength.`,
          `<!-- pom.xml: JaCoCo coverage + failsafe for integration tests -->
<plugin>
  <groupId>org.jacoco</groupId><artifactId>jacoco-maven-plugin</artifactId>
  <executions>
    <execution><goals><goal>prepare-agent</goal></goals></execution>
    <execution><id>report</id><phase>verify</phase><goals><goal>report</goal></goals></execution>
    <execution><id>check</id><phase>verify</phase><goals><goal>check</goal></goals>
      <configuration><rules><rule><element>BUNDLE</element><limits><limit><counter>LINE</counter><value>COVEREDRATIO</value><minimum>0.75</minimum></limit></limits></rule></rules></configuration></execution>
  </executions>
</plugin>
# unit tests: *Test (surefire), integration tests: *IT (failsafe, needs Docker for Testcontainers)
./mvnw -B verify`,
        ),
      ],
      [
        blk(`<h3>SonarQube and Checkmarx</h3>
• <b>SonarQube</b> (static analysis): finds <b>bugs</b>, <b>code smells</b>, <b>security hotspots/vulnerabilities</b> (OWASP rules), duplication and tracks <b>coverage</b> and <b>technical debt</b>. The <b>Quality Gate</b> (conditions on <b>new code</b>) blocks the merge/deploy. Run <code>sonar:sonar</code> in CI with the JaCoCo report; PR decoration comments on diffs. Tune rules and avoid false-positive fatigue; treat the gate as policy.<br>
• <b>Checkmarx</b> (commercial <b>SAST</b>, also SCA/IaC/API security in Checkmarx One): scans source for security flaws (SQL injection, XSS, insecure deserialisation, hard-coded secrets) by analysing data flow; integrates with Jenkins/GitHub, gates on severity, provides remediation guidance. Alternatives: <b>Semgrep</b>, <b>CodeQL</b> (GitHub), Snyk Code, Fortify. <b>SAST</b> (static code) + <b>SCA</b> (dependencies: OWASP Dependency-Check, Snyk, Dependabot, Trivy) + <b>DAST</b> (running app: OWASP ZAP) + <b>secret scanning</b> (gitleaks) = layered "shift-left" security.`,
          `# Sonar in the pipeline
./mvnw -B verify sonar:sonar \\
  -Dsonar.host.url=https://sonar.jsl.com -Dsonar.token=$SONAR_TOKEN \\
  -Dsonar.projectKey=catalogue-service -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml \\
  -Dsonar.qualitygate.wait=true                       # fail the build if the quality gate fails

# GitHub CodeQL (SAST) + Dependabot (SCA) + gitleaks (secrets)
# - uses: github/codeql-action/init@v3   with: { languages: java }
# - uses: github/codeql-action/analyze@v3
# - uses: gitleaks/gitleaks-action@v2

# Checkmarx (CLI) in Jenkins
# sh 'cx scan create --project-name catalogue-service -s . --branch $BRANCH_NAME --threshold "sast-high=1;sast-critical=1"'    # fail on high/critical findings`,
        ),
      ],
      [
        blk(`<h3>Container image scanning and supply-chain security</h3>
• Scan images for <b>known CVEs</b> in the OS packages and libraries: <b>Trivy</b> (open source, also IaC/secret scan), Grype, Snyk Container, Clair, registry scanners (Harbor/ECR/Artifactory Xray). Scan at <b>build time</b> (fail on HIGH/CRITICAL with a fix available), in the <b>registry</b> continuously (new CVEs appear daily) and at <b>admission time</b> (Kyverno/OPA Gatekeeper reject unsigned/vulnerable/<code>latest</code> images).<br>
• Reduce risk: minimal/distroless base images, non-root, no package managers in runtime, <b>pinned versions + digests</b>, regular rebuilds (renovate), <b>SBOM</b> (CycloneDX/SPDX via Syft), <b>image signing</b> (cosign/Sigstore) and provenance (SLSA), private registries, scan IaC (Checkov, tfsec) and Helm charts.`,
          `# Trivy in CI: fail on fixable HIGH/CRITICAL
trivy image --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed ghcr.io/javaschoollab/catalogue-service:$GITHUB_SHA
trivy fs --scanners vuln,secret,config .                                # repo files, secrets, IaC misconfigurations

# SBOM and signing
syft ghcr.io/javaschoollab/catalogue-service:$GITHUB_SHA -o cyclonedx-json > sbom.json
cosign sign --yes ghcr.io/javaschoollab/catalogue-service@$DIGEST

# Kubernetes admission policy (Kyverno): only signed images from our registry
# apiVersion: kyverno.io/v1  kind: ClusterPolicy  spec: { validationFailureAction: Enforce, rules: [ { name: verify-signature, match: {...}, verifyImages: [ { imageReferences: ["ghcr.io/javaschoollab/*"], attestors: [ ... ] } ] } ] }`,
        ),
      ],
      [
        ['What does SonarQube do and what is a quality gate?', 'SonarQube statically analyses code for bugs, vulnerabilities, smells, duplication and coverage; a quality gate is a set of pass/fail conditions (usually on new code) that blocks merging or deployment when not met.'],
        ['SAST vs SCA vs DAST?', 'SAST analyses your source for security flaws; SCA checks third-party dependencies for known vulnerabilities and licenses; DAST tests the running application from outside. Together they provide layered shift-left security.'],
        ['How do you secure container images?', 'Use minimal pinned base images, run as non-root, scan for CVEs in build and registry, generate SBOMs, sign images and enforce admission policies so only trusted, scanned images run.'],
      ],
    ),
    topic(
      'ms-deployment-strategies',
      'Blue-Green, Canary Deployments and Rollback Strategies',
      [
        blk(`<h3>Deployment strategies compared</h3>
<table ${TABLE}>
<tr><th>Strategy</th><th>How</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>Rolling</b></td><td>Replace instances gradually</td><td>No extra capacity, default in Kubernetes</td><td>Two versions live together; slower rollback</td></tr>
<tr><td><b>Blue-Green</b></td><td>Two full environments; switch traffic from blue (old) to green (new)</td><td>Instant switch and rollback, test green before exposing</td><td>2× infrastructure, database compatibility, session/cache warm-up</td></tr>
<tr><td><b>Canary</b></td><td>Send a small % of traffic to the new version, increase while metrics are healthy</td><td>Real-traffic validation, limited blast radius</td><td>Needs traffic splitting + metrics/automation</td></tr>
<tr><td><b>Recreate</b></td><td>Stop old, start new</td><td>Simple</td><td>Downtime</td></tr>
<tr><td><b>Shadow / dark launch</b></td><td>Mirror traffic to the new version without returning its responses</td><td>Safe performance/behaviour test</td><td>Side effects must be disabled</td></tr>
<tr><td><b>Feature flags</b></td><td>Deploy code off; enable per user/percentage</td><td>Decouples deploy from release</td><td>Flag debt, testing combinations</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Blue-green and canary on Kubernetes</h3>
• <b>Blue-green</b>: run two Deployments (<code>catalogue-blue</code>, <code>catalogue-green</code>) and point the Service/Ingress selector to one; switch by changing the selector label or Ingress backend; keep blue for fast rollback. <b>Canary</b>: <b>Argo Rollouts</b> or <b>Flagger</b> automate traffic shifting (5% → 25% → 50% → 100%) with an <b>analysis</b> step querying Prometheus (error rate, latency) and <b>auto-rollback</b> on failure; ingress-nginx canary annotations or a mesh (Istio <code>VirtualService</code> weights) split traffic.<br>
• Database changes must be <b>backward compatible</b> (expand/contract) because old and new versions run at the same time.`,
          `# Argo Rollouts: canary with automated analysis
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata: { name: catalogue }
spec:
  replicas: 5
  selector: { matchLabels: { app: catalogue } }
  template: { metadata: { labels: { app: catalogue } }, spec: { containers: [ { name: catalogue, image: ghcr.io/javaschoollab/catalogue-service:1.5.0 } ] } }
  strategy:
    canary:
      canaryService: catalogue-canary
      stableService: catalogue-stable
      trafficRouting: { istio: { virtualService: { name: catalogue-vs } } }
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - analysis: { templates: [ { templateName: success-rate } ] }     # Prometheus query: error rate < 1%
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }                                          # then 100%; any failed analysis => automatic rollback

# Blue-green switch with a Service selector
# kubectl patch svc catalogue -p '{"spec":{"selector":{"app":"catalogue","version":"green"}}}'`,
        ),
      ],
      [
        blk(`<h3>Rollback strategies</h3>
• <b>Always plan the way back before deploying</b>. Fast rollback options: <code>kubectl rollout undo</code> / Helm <code>rollback</code> / Argo CD revert to the previous Git commit (GitOps), switch blue-green back, set canary weight to 0, <b>disable a feature flag</b> (fastest, no deploy). Automate: <b>health-gated rollouts</b> (stop and revert when readiness/error-rate thresholds are breached), <b>progressive delivery</b>, <b>synthetic checks</b> after deploy.<br>
• <b>Hard parts</b>: <b>database migrations</b> (rolling back code is easy, rolling back data/schema is not: use expand/contract, keep destructive changes a release later, take backups, forward-fix instead of reverse migrations); <b>message schemas</b> (new producers must stay readable by old consumers); <b>externally visible side effects</b> (emails sent); caches and sessions.<br>
• Practice rollbacks regularly; define <b>rollback criteria</b> (SLO breach, error rate &gt; X% for Y minutes); keep <b>previous N versions</b> available; write a deployment <b>runbook</b> and run post-deploy verification.`,
          `# Helm
helm history catalogue -n prod
helm rollback catalogue 12 -n prod --wait

# Kubernetes
kubectl rollout undo deployment/catalogue --to-revision=7
kubectl rollout status deployment/catalogue

# GitOps (Argo CD): revert the commit that changed the image tag, Argo syncs the cluster back
git revert <deploy-commit> && git push

# Feature flag kill switch (no deployment)
curl -X PATCH https://flags.javaschoollab.com/api/flags/new-checkout -d '{"enabled": false}'

-- schema safety: expand first, contract later
-- release N:   ADD COLUMN new_status   (nullable)  <- old and new code both work
-- release N+1: backfill + switch reads/writes
-- release N+2: DROP COLUMN old_status  (only when rollback to N is no longer needed)`,
        ),
      ],
      [
        ['Blue-green vs canary?', 'Blue-green switches all traffic at once between two full environments (instant rollback, double capacity); canary shifts traffic gradually to the new version while monitoring metrics, limiting the impact of a bad release.'],
        ['Why are database migrations the hardest part of rollbacks?', 'Code can be reverted instantly but data and schema changes cannot, and old and new versions overlap during rollouts; use expand/contract, backward-compatible changes and forward fixes.'],
        ['What is the fastest way to roll back a problematic feature?', 'A feature flag kill switch: turning the flag off disables the behaviour immediately without redeploying; otherwise redeploy the previous version (rollout undo, Helm rollback, GitOps revert).'],
      ],
    ),
  ]),

  ms(13, 'Microservices Testing', 'Core', [
    topic(
      'ms-testing-unit-integration',
      'Unit Testing, JUnit 5, Mockito, Spring Boot Test and Integration Testing',
      [
        blk(`<h3>Testing strategy for microservices</h3>
• Test at several levels (the <b>test pyramid</b>): many fast <b>unit tests</b> (pure logic, no Spring), <b>slice tests</b> (<code>@WebMvcTest</code>, <code>@DataJpaTest</code>, <code>@JsonTest</code>), <b>integration tests</b> with real infrastructure in containers, <b>contract tests</b> between services, a handful of <b>end-to-end</b> tests, plus performance and fault-injection tests. Avoid the "ice-cream cone" (mostly slow end-to-end tests).<br>
• Principles: test behaviour not implementation; independent, repeatable, fast tests; arrange-act-assert; meaningful names; no shared mutable state; no sleeping (use Awaitility); <b>real dependencies in containers rather than mocks</b> where integration matters (databases, Kafka).`,
          `Unit        : service/domain classes with Mockito       ms        thousands
Slice       : @WebMvcTest, @DataJpaTest (partial context)  100s of ms  hundreds
Integration : @SpringBootTest + Testcontainers (real DB/Kafka)  seconds  dozens
Contract    : provider verification + consumer stubs          seconds   per API
End-to-end  : deployed system, critical journeys only         minutes   a few`,
        ),
      ],
      [
        blk(`<h3>JUnit 5 and Mockito</h3>
• <b>JUnit 5</b> (Jupiter): <code>@Test</code>, <code>@BeforeEach</code>, <code>@ParameterizedTest</code> (<code>@CsvSource</code>, <code>@MethodSource</code>), <code>@Nested</code>, <code>@DisplayName</code>, <code>@Tag</code>, assertions (<code>assertThrows</code>, <code>assertAll</code>) with <b>AssertJ</b> for fluent assertions. <b>Mockito</b>: <code>@Mock</code>, <code>@InjectMocks</code>, <code>when(...).thenReturn</code>, <code>verify(mock).method(...)</code>, <code>ArgumentCaptor</code>, <code>BDDMockito</code>; use <code>@ExtendWith(MockitoExtension.class)</code> (strict stubs report unused stubbings).<br>
• Mock <b>collaborators</b> (repositories, remote clients), not the class under test; do not over-mock (tests that mirror the implementation); prefer <b>fakes</b> for simple dependencies; do not mock value objects.`,
          `@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {
    @Mock EnrollmentRepository enrollments;
    @Mock CatalogueClient catalogue;
    @Mock OutboxPublisher outbox;
    @InjectMocks EnrollmentService service;

    @Test @DisplayName("enrolls a student and publishes an event")
    void enrolls() {
        UUID student = UUID.randomUUID(), course = UUID.randomUUID();
        when(catalogue.get(course)).thenReturn(new CourseDto(course, "Spring Boot", true));
        when(enrollments.existsByStudentIdAndCourseId(student, course)).thenReturn(false);
        when(enrollments.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Enrollment e = service.enroll(student, course);

        assertThat(e.getStatus()).isEqualTo(Status.ACTIVE);
        ArgumentCaptor<EnrollmentCreated> event = ArgumentCaptor.forClass(EnrollmentCreated.class);
        verify(outbox).publish(event.capture());
        assertThat(event.getValue().courseId()).isEqualTo(course);
    }

    @Test void rejectsDuplicates() {
        when(catalogue.get(any())).thenReturn(new CourseDto(UUID.randomUUID(), "x", true));
        when(enrollments.existsByStudentIdAndCourseId(any(), any())).thenReturn(true);
        assertThatThrownBy(() -> service.enroll(UUID.randomUUID(), UUID.randomUUID())).isInstanceOf(AlreadyEnrolledException.class);
        verifyNoInteractions(outbox);
    }

    @ParameterizedTest @CsvSource({"0,FREE", "999,STANDARD", "5000,PREMIUM"})
    void tiers(int price, Tier expected) { assertThat(Tier.of(BigDecimal.valueOf(price))).isEqualTo(expected); }
}`,
        ),
      ],
      [
        blk(`<h3>Spring Boot Test and slice tests</h3>
• <b><code>@SpringBootTest</code></b> starts the full application context (use <code>webEnvironment = RANDOM_PORT</code> with <code>TestRestTemplate</code>/<code>WebTestClient</code>/<code>RestTestClient</code>); slow: use it for a few integration tests. <b>Slice tests</b> load only part: <code>@WebMvcTest(Controller.class)</code> (MVC + <code>MockMvc</code>, <code>@MockitoBean</code> services), <code>@DataJpaTest</code> (JPA + repositories, in a transaction rolled back), <code>@JsonTest</code>, <code>@RestClientTest</code>. <code>@MockBean</code> is replaced by <code>@MockitoBean</code> in Spring Boot 3.4+.<br>
• Test <b>security</b> (<code>spring-security-test</code>: <code>@WithMockUser</code>, <code>jwt()</code>), <b>validation</b> and <b>error responses</b> (status + Problem Details), <b>serialisation</b> of DTOs, and <b>repository queries</b> against the real database type (not H2 if production is PostgreSQL).`,
          `@WebMvcTest(CourseController.class)
class CourseControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean CourseService service;                       // Spring Boot 3.4+ (was @MockBean)

    @Test void returnsCourse() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.get(id)).thenReturn(new CourseResponse(id, "Spring Boot", BigDecimal.TEN, "BEGINNER", Instant.now()));
        mvc.perform(get("/api/v1/courses/{id}", id).with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_courses.read"))))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.title").value("Spring Boot"));
    }

    @Test void validatesInput() throws Exception {
        mvc.perform(post("/api/v1/courses").with(jwt()).with(csrf()).contentType(APPLICATION_JSON).content("{\\"title\\":\\"\\",\\"price\\":-1}"))
           .andExpect(status().isUnprocessableEntity())
           .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test void anonymousGets401() throws Exception { mvc.perform(get("/api/v1/courses")).andExpect(status().isUnauthorized()); }
}

@DataJpaTest @AutoConfigureTestDatabase(replace = Replace.NONE)      // use the real DB (Testcontainers), not an embedded one
class CourseRepositoryTest { @Autowired CourseRepository repo; /* query and constraint tests */ }`,
        ),
      ],
      [
        ['Unit test vs slice test vs integration test in Spring Boot?', 'A unit test exercises one class without Spring; a slice test (@WebMvcTest, @DataJpaTest) loads only the relevant part of the context; an integration test (@SpringBootTest) starts the full application, ideally with real infrastructure in containers.'],
        ['Why not test repositories against H2 when production uses PostgreSQL?', 'Dialect, SQL features, locking and constraint behaviour differ, so H2 can pass tests that fail in production; use Testcontainers with the real database engine.'],
        ['What should you mock in a unit test?', 'Collaborators such as repositories and remote clients, not the class under test or simple value objects; avoid over-mocking that just mirrors the implementation.'],
      ],
    ),
    topic(
      'ms-testcontainers-wiremock',
      'Testcontainers and WireMock',
      [
        blk(`<h3>Testcontainers</h3>
• <b>Testcontainers</b> starts real services (PostgreSQL, MySQL, Kafka, Redis, RabbitMQ, Keycloak, LocalStack, Elasticsearch) in Docker containers for tests: <b>production-like</b>, disposable, no shared test environment. With Spring Boot 3.1+ use <b><code>@ServiceConnection</code></b> (auto-wires the datasource/Kafka properties) or <code>@DynamicPropertySource</code>. Share containers across tests (singleton/static or reusable) to keep the suite fast; run Flyway migrations on the real DB.<br>
• Docker must be available in CI (GitHub Actions ubuntu runners have it; Jenkins agents need a Docker socket or Testcontainers Cloud).`,
          `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class EnrollmentFlowIT {

    @Container @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Container @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("apache/kafka:3.8.0"));

    @Autowired TestRestTemplate rest;
    @Autowired EnrollmentRepository repo;

    @Test void enrollmentIsPersistedAndEventPublished() {
        ResponseEntity<EnrollmentResponse> res = rest.postForEntity("/api/v1/enrollments", new EnrollRequest(studentId, courseId), EnrollmentResponse.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repo.findByStudentId(studentId)).hasSize(1);

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> assertThat(consumer.received()).anyMatch(e -> e.type().equals("EnrollmentCreated")));   // Awaitility, no sleep()
    }
}

// Spring Boot 3.1+ local dev: start containers with the app
// @TestConfiguration(proxyBeanMethods = false) class DevContainers { @Bean @ServiceConnection PostgreSQLContainer<?> db() { return new PostgreSQLContainer<>("postgres:16"); } }
// SpringApplication.from(Application::main).with(DevContainers.class).run(args);`,
        ),
      ],
      [
        blk(`<h3>WireMock</h3>
• <b>WireMock</b> is an HTTP mock server: stub responses of <b>other services</b> (or third-party APIs: payment gateway) so your service can be tested in isolation: define request matchers (URL, headers, body) and canned responses, <b>simulate failures</b> (500, <b>delays</b>, connection reset, malformed body, <b>fault injection</b>), <b>stateful scenarios</b> (first call fails, second succeeds: test retries), and <b>verify</b> the calls made. Use <code>@WireMockTest</code> (JUnit 5) or <code>spring-cloud-contract-wiremock</code>/<code>wiremock-spring-boot</code>.<br>
• Point the client base URL at the WireMock port via properties. Record/playback is useful for exploration but keep stubs hand-crafted for stability.`,
          `@SpringBootTest
@WireMockTest(httpPort = 8089)
class PaymentClientIT {
    @Autowired PaymentGateway gateway;

    @DynamicPropertySource static void props(DynamicPropertyRegistry r) { r.add("jsl.clients.payment.url", () -> "http://localhost:8089"); }

    @Test void retriesTransientFailuresThenSucceeds() {
        stubFor(post("/api/v1/payments").inScenario("flaky").whenScenarioStateIs(STARTED)
            .willReturn(serverError()).willSetStateTo("recovered"));
        stubFor(post("/api/v1/payments").inScenario("flaky").whenScenarioStateIs("recovered")
            .willReturn(okJson("{\\"status\\":\\"CAPTURED\\",\\"id\\":\\"p-1\\"}")));

        PaymentResult result = gateway.charge(new PaymentRequest(orderId, BigDecimal.TEN));

        assertThat(result.status()).isEqualTo("CAPTURED");
        verify(2, postRequestedFor(urlEqualTo("/api/v1/payments")));          // one failure + one retry
    }

    @Test void opensTheCircuitOnTimeouts() {
        stubFor(post("/api/v1/payments").willReturn(ok().withFixedDelay(5_000)));   // slower than our 2s timeout
        for (int i = 0; i < 12; i++) gateway.charge(request());
        assertThat(circuitBreakerRegistry.circuitBreaker("paymentService").getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
}`,
        ),
      ],
      [
        blk(`<h3>Combining them: a robust integration test setup</h3>
• Use <b>Testcontainers for infrastructure you own</b> (your database, broker, cache, auth server) and <b>WireMock for other teams' services and third parties</b> (you cannot start their whole stack). Together they let each service be tested <b>in isolation but realistically</b> in CI in a few minutes.<br>
• Tips: one shared container setup (abstract base class or <code>@ImportTestcontainers</code>); reset state between tests (truncate tables, reset WireMock, purge topics); randomise ports; keep stubs near the tests; test <b>timeouts, 5xx, slow, malformed</b> responses explicitly; run in parallel carefully (isolated schemas/topics per test).`,
          `abstract class IntegrationTestBase {
    @ServiceConnection static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16").withReuse(true);
    @ServiceConnection static final KafkaContainer KAFKA = new KafkaContainer(DockerImageName.parse("apache/kafka:3.8.0")).withReuse(true);
    static { Startables.deepStart(POSTGRES, KAFKA).join(); }                      // started once per JVM for the whole suite

    @RegisterExtension static WireMockExtension payment = WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();
    @DynamicPropertySource static void urls(DynamicPropertyRegistry r) { r.add("jsl.clients.payment.url", payment::baseUrl); }

    @Autowired JdbcTemplate jdbc;
    @BeforeEach void clean() { jdbc.execute("TRUNCATE enrollment, outbox_event, inbox CASCADE"); payment.resetAll(); }
}`,
        ),
      ],
      [
        ['Why use Testcontainers instead of embedded databases?', 'Tests run against the same database engine and version as production (SQL dialect, locking, constraints, extensions), giving realistic results; containers are disposable and need no shared environment.'],
        ['What is WireMock used for?', 'Stubbing HTTP dependencies (other services, third-party APIs) with controlled responses, delays and faults so a service can be tested in isolation, including retry and circuit-breaker behaviour, and verifying the requests it sends.'],
        ['How do you test retry behaviour?', 'With WireMock scenarios: make the first call fail (500 or delay) and the next succeed, then assert the final result and verify the number of requests made.'],
      ],
    ),
    topic(
      'ms-contract-e2e-performance-faults',
      'Contract Testing, Spring Cloud Contract, End-to-End, Performance and Fault-Injection Testing',
      [
        blk(`<h3>Contract testing</h3>
• Problem: service A calls service B; each team tests with mocks, but the mocks drift from reality, so integration breaks in staging. <b>Consumer-driven contract testing</b>: the <b>consumer</b> states what it needs (request → response); the <b>provider</b> verifies it still satisfies every consumer's contract in its own build. Breaking changes fail the provider's CI <b>before</b> deployment, without running both services together.<br>
• Tools: <b>Spring Cloud Contract</b> (contracts in Groovy/YAML/Kotlin on the provider side; generates provider tests and <b>WireMock stubs</b> published as a jar for consumers), <b>Pact</b> (consumer-written pact files, a <b>Pact Broker</b> with <code>can-i-deploy</code> checks; polyglot), OpenAPI-based schema checks (Schemathesis, <code>oasdiff</code> for breaking-change detection).`,
          `# provider: src/test/resources/contracts/course/shouldReturnCourse.yml (Spring Cloud Contract)
request:
  method: GET
  url: /api/v1/courses/11111111-1111-1111-1111-111111111111
response:
  status: 200
  headers: { Content-Type: application/json }
  body:
    id: "11111111-1111-1111-1111-111111111111"
    title: "Spring Boot"
    price: 999
  matchers:
    body: [ { path: $.title, type: by_regex, value: ".+" } ]

// generated provider test (base class provides the setup)
abstract class ContractBase {
    @BeforeEach void setup(@Autowired CourseController c) { RestAssuredMockMvc.standaloneSetup(c); /* arrange mock service data */ }
}

// consumer test: uses the stubs jar from the provider (no real provider needed)
@SpringBootTest
@AutoConfigureStubRunner(ids = "com.javaschoollab:catalogue-service:+:stubs:8090", stubsMode = StubRunnerProperties.StubsMode.LOCAL)
class CatalogueClientContractTest {
    @Autowired CatalogueClient client;
    @Test void parsesTheContract() { assertThat(client.get(UUID.fromString("11111111-1111-1111-1111-111111111111")).title()).isEqualTo("Spring Boot"); }
}`,
        ),
      ],
      [
        blk(`<h3>End-to-end and performance testing</h3>
• <b>End-to-end (E2E)</b> tests drive the deployed system through the UI/API for <b>a few critical journeys</b> (sign up, enrol, pay, certificate): Playwright/Cypress/Selenium or REST-assured against staging with seeded data. They are slow and flaky, so keep few, make them independent and robust (wait for conditions), and use <b>synthetic monitoring</b> in production. Prefer <b>consumer-driven contracts</b> + integration tests for coverage.<br>
• <b>Performance testing</b>: <b>load</b> (expected traffic), <b>stress</b> (beyond capacity to find breaking points), <b>spike</b>, <b>soak/endurance</b> (hours: memory leaks, connection leaks), and <b>scalability</b> tests. Tools: <b>k6</b> (JavaScript), <b>Gatling</b> (Scala/Java DSL), JMeter, Locust. Define SLOs (p95 &lt; 300 ms at 500 rps), test in a production-like environment with realistic data, watch <b>metrics, traces and resource saturation</b> during the run, make tests part of the pipeline (smoke-level on every release, full runs nightly).`,
          `// k6 load test
import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  stages: [ { duration: '2m', target: 100 }, { duration: '10m', target: 100 }, { duration: '1m', target: 0 } ],
  thresholds: { http_req_duration: ['p(95)<300'], http_req_failed: ['rate<0.01'] },          // the build fails if the SLO is missed
};
export default function () {
  const res = http.get('https://staging.javaschoollab.com/api/v1/courses?size=20', { headers: { Authorization: 'Bearer ' + __ENV.TOKEN } });
  check(res, { 'status is 200': r => r.status === 200 });
  sleep(1);
}

// Gatling (Java DSL)
// ScenarioBuilder scn = scenario("browse").exec(http("courses").get("/api/v1/courses").check(status().is(200))).pause(1);
// setUp(scn.injectOpen(rampUsers(500).during(120))).protocols(http.baseUrl("https://staging...")).assertions(global().responseTime().percentile(95).lt(300));`,
        ),
      ],
      [
        blk(`<h3>Fault-injection and chaos testing</h3>
• Resilience patterns are only trustworthy if <b>proven under failure</b>. <b>Fault-injection testing</b> deliberately injects failures: latency, errors (500/503), dropped connections, timeouts, malformed responses, dependency outages, pod/node failures, network partitions, CPU/memory pressure, clock skew. <b>Chaos engineering</b> runs controlled experiments in staging (and carefully production): hypothesis ("if payments is down checkout still accepts orders") → inject → observe SLOs → fix.<br>
• Tools: <b>WireMock faults</b> and <b>Toxiproxy</b> (network faults in integration tests with Testcontainers), <b>Chaos Monkey for Spring Boot</b> (assaults on latency/exceptions/kill app), <b>Chaos Mesh</b> / <b>LitmusChaos</b> / <b>Gremlin</b> (Kubernetes), <b>Istio fault injection</b> (HTTP delay/abort), AWS FIS. Verify: circuit breakers open, fallbacks work, retries do not storm, queues drain, alerts fire, runbooks work, recovery is automatic.`,
          `// Toxiproxy with Testcontainers: add 3s latency between the service and its database
try (var toxiproxy = new ToxiproxyContainer("ghcr.io/shopify/toxiproxy:2.9.0").withNetwork(network)) {
    ToxiproxyClient client = new ToxiproxyClient(toxiproxy.getHost(), toxiproxy.getControlPort());
    Proxy dbProxy = client.createProxy("db", "0.0.0.0:8666", "postgres:5432");
    dbProxy.toxics().latency("slow", ToxicDirection.DOWNSTREAM, 3_000);
    // run the request and assert it fails fast with 503 and the circuit breaker opens, instead of hanging
}

# Istio: inject a 50% delay of 5s and 10% aborts for one route
# http:
# - fault: { delay: { percentage: { value: 50 }, fixedDelay: 5s }, abort: { percentage: { value: 10 }, httpStatus: 503 } }
#   route: [ { destination: { host: payment-service } } ]

# Chaos Monkey for Spring Boot
# chaos.monkey.enabled=true  chaos.monkey.assaults.latencyActive=true  chaos.monkey.assaults.latencyRangeStart=1000  chaos.monkey.watcher.service=true`,
        ),
      ],
      [
        ['What is consumer-driven contract testing and why use it?', 'The consumer defines the requests and responses it relies on; the provider verifies these contracts in its own build. It catches breaking API changes before deployment without running all services together.'],
        ['Spring Cloud Contract vs Pact?', 'Spring Cloud Contract is provider-driven (contracts in the provider repo, generates provider tests and WireMock stubs) and Spring-centric; Pact is consumer-driven, polyglot, with a Pact Broker and can-i-deploy checks. Both prevent consumer/provider drift.'],
        ['Why do fault-injection and chaos tests matter?', 'They prove resilience mechanisms (timeouts, retries, circuit breakers, fallbacks, autoscaling) actually work under failure, by injecting latency, errors and outages and checking that SLOs hold and recovery is automatic.'],
      ],
    ),
  ]),

  ms(14, 'Advanced Architecture Patterns', 'Advanced', [
    topic(
      'ms-strangler-bff-composition',
      'Strangler Fig, Backend for Frontend and API Composition',
      [
        blk(`<h3>Strangler Fig pattern</h3>
• <b>Incrementally replace a monolith</b>: put a <b>facade/proxy</b> (gateway) in front; route one capability at a time to a new microservice while the rest still goes to the monolith; when a capability is fully migrated, delete it from the monolith; eventually the monolith is "strangled". Avoids risky big-bang rewrites.<br>
• Steps: (1) identify a <b>seam</b> (a bounded context with few dependencies; e.g. notifications, catalogue search), (2) add the routing layer, (3) build the new service and <b>synchronise data</b> (CDC/events, dual-run, <b>anti-corruption layer</b> to translate models), (4) shadow/canary traffic and compare results, (5) switch, (6) remove old code and data. Migrate <b>data ownership</b> carefully (the hardest part: start with read-only data, then writes).`,
          `Phase 1: all traffic -> monolith
Phase 2: gateway routes  /api/notifications/** -> new notification-service;  everything else -> monolith
Phase 3: more routes migrated (catalogue, assessment); monolith shrinks
Phase 4: monolith retired

# Spring Cloud Gateway: strangle by path, with a weighted canary for the new service
spring.cloud.gateway.routes:
  - id: notifications-new
    uri: lb://notification-service
    predicates: [ Path=/api/notifications/**, Weight=notif, 20 ]       # 20% to the new service
  - id: notifications-old
    uri: http://legacy-monolith:8080
    predicates: [ Path=/api/notifications/**, Weight=notif, 80 ]
  - id: legacy-default
    uri: http://legacy-monolith:8080
    predicates: [ Path=/** ]`,
        ),
      ],
      [
        blk(`<h3>Backend for Frontend (BFF)</h3>
• Different clients (web, mobile, partner API, smart TV) need <b>different data shapes, payload sizes and auth flows</b>. A <b>BFF</b> is a <b>backend per frontend</b> owned by that frontend's team: it aggregates calls to microservices, trims/reshapes responses, handles client-specific auth (the web BFF keeps tokens server-side and issues an HttpOnly session cookie), caches, and absorbs API changes. Avoids a one-size-fits-all gateway and overly chatty clients.<br>
• Rules: keep the BFF <b>thin</b> (no core business logic), one per client type, owned by the client team, resilient (timeouts, fallbacks), and use the <b>gateway</b> for generic edge concerns (TLS, rate limiting) in front. Technologies: Spring Boot/WebFlux, Node.js/NestJS, GraphQL (a natural BFF), <b>Spring Cloud Gateway MVC</b> with aggregation.`,
          `// Mobile BFF: one call returns exactly the home screen data
@RestController
@RequestMapping("/mobile/v1")
@RequiredArgsConstructor
class MobileHomeController {
    private final CatalogueClient catalogue; private final LearningClient learning; private final NotificationClient notifications;

    @GetMapping("/home")
    MobileHome home(@AuthenticationPrincipal Jwt jwt) throws Exception {
        UUID user = UUID.fromString(jwt.getSubject());
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {                         // Java 21 structured concurrency
            var courses = scope.fork(() -> catalogue.featured(5));
            var progress = scope.fork(() -> learning.continueLearning(user));
            var unread = scope.fork(() -> safe(() -> notifications.unreadCount(user), 0));      // optional: degrade to 0
            scope.joinUntil(Instant.now().plusMillis(800));                                      // overall timeout budget
            scope.throwIfFailed();
            return new MobileHome(courses.get(), progress.get(), unread.get());                  // small, mobile-shaped payload
        }
    }
}`,
        ),
      ],
      [
        blk(`<h3>API Composition</h3>
• Queries spanning several services (an order page needing order + customer + payment + shipment data) cannot use joins. <b>API composition</b>: a <b>composer</b> (gateway, BFF or an aggregator service) calls the owning services (in <b>parallel</b>), then <b>joins the results in memory</b> and returns one response. Simple and good for small/medium data and few services.<br>
• Drawbacks: higher latency (slowest call dominates), reduced availability (needs timeouts/fallbacks and partial results), in-memory joins for large lists are inefficient, no cross-service consistency, N+1 call patterns (use batch endpoints: <code>GET /customers?ids=...</code>), no cross-service sorting/filtering. For heavy cross-service querying use <b>CQRS read models/materialized views</b> instead (next lesson).`,
          `@Service
@RequiredArgsConstructor
class OrderDetailsComposer {
    private final OrderClient orders; private final CustomerClient customers; private final PaymentClient payments; private final ShipmentClient shipments;

    OrderDetails compose(UUID orderId) {
        Order order = orders.get(orderId);                                    // needed first
        try (var scope = new StructuredTaskScope<Object>()) {
            var customer = scope.fork(() -> customers.get(order.customerId()));
            var payment  = scope.fork(() -> orElse(() -> payments.forOrder(orderId), PaymentInfo.unknown()));     // partial result on failure
            var shipment = scope.fork(() -> orElse(() -> shipments.forOrder(orderId), ShipmentInfo.unknown()));
            scope.joinUntil(Instant.now().plusSeconds(1));
            return new OrderDetails(order, customer.get(), payment.get(), shipment.get());
        } catch (InterruptedException | TimeoutException e) { throw new ServiceUnavailableException("order details", e); }
    }
}
// avoid N+1 calls: customers.byIds(order lines' ids) with a batch endpoint, not one call per line`,
        ),
      ],
      [
        ['What is the strangler fig pattern?', 'Gradually migrating a monolith by routing individual capabilities through a facade to new services and retiring the old code piece by piece, avoiding a risky big-bang rewrite.'],
        ['What is a Backend for Frontend?', 'A thin backend dedicated to one client type (web, mobile) that aggregates and reshapes data from microservices and handles client-specific concerns, owned by that frontend\'s team.'],
        ['When is API composition not enough?', 'When queries need joins, sorting or filtering across large datasets from several services, because in-memory composition is slow and fragile; use CQRS read models or materialized views.'],
      ],
    ),
    topic(
      'ms-eventsourcing-acl-materialized',
      'Event Sourcing, Anti-Corruption Layer and Materialized Views',
      [
        blk(`<h3>Event Sourcing</h3>
• Instead of storing the <b>current state</b>, store the <b>sequence of events</b> that led to it (<code>OrderPlaced</code>, <code>ItemAdded</code>, <code>OrderPaid</code>) in an <b>append-only event store</b>; current state = <b>replay (fold)</b> of events. Benefits: complete <b>audit log</b>, time travel/temporal queries, easy <b>projections</b> for new read models (replay history), natural fit with CQRS and event-driven integration, debugging by replay. Costs: learning curve, <b>event schema evolution</b> (upcasters), eventual consistency of projections, storage growth (use <b>snapshots</b>), complex queries need projections, GDPR deletion (crypto-shredding).<br>
• Use for domains where history matters (finance, orders, compliance); do <b>not</b> use it everywhere. Tools: <b>Axon Framework/Axon Server</b>, EventStoreDB, Kafka as a log (with care), a PostgreSQL events table, Marten (.NET).`,
          `// aggregate rebuilt from events
class Order {
    private OrderId id; private Status status = Status.NEW; private final List<Line> lines = new ArrayList<>();
    static Order from(List<DomainEvent> history) { Order o = new Order(); history.forEach(o::apply); return o; }

    List<DomainEvent> addLine(Course c) { var e = new LineAdded(id, c.id(), c.price()); apply(e); return List.of(e); }     // command -> events
    List<DomainEvent> pay(Payment p)  { if (status != Status.NEW) throw new IllegalStateException(); var e = new OrderPaid(id, p.id()); apply(e); return List.of(e); }

    private void apply(DomainEvent e) {                                          // state changes ONLY through events
        switch (e) {
            case OrderPlaced p -> { id = p.orderId(); }
            case LineAdded l   -> lines.add(new Line(l.courseId(), l.price()));
            case OrderPaid p   -> status = Status.PAID;
            default -> {}
        }
    }
}
-- event store table: append-only, optimistic concurrency via (aggregate_id, version)
CREATE TABLE event_store (aggregate_id UUID, version INT, type VARCHAR(80), data JSONB, occurred_at TIMESTAMP, PRIMARY KEY (aggregate_id, version));`,
        ),
      ],
      [
        blk(`<h3>Anti-Corruption Layer (ACL)</h3>
• When integrating with a <b>legacy system, third-party API or another team's model</b> you do not want its concepts, naming and quirks leaking into your domain. An <b>anti-corruption layer</b> is a translation boundary: <b>adapters/facades + translators/mappers</b> convert between the external model and your own domain model, so changes on the other side affect only the ACL. Essential in strangler migrations (new service ↔ monolith) and when wrapping payment gateways, ERP, SOAP services.<br>
• Implementation: define a <b>port</b> (interface in your domain language: <code>PaymentProvider.charge(Money, Card)</code>), implement it with an <b>adapter</b> that calls the external API and maps request/response/errors/status codes into domain types; keep mapping code and external DTOs <b>inside</b> the adapter package; this is the <b>Hexagonal</b> idea applied to integration.`,
          `// Domain port (our language)
public interface PaymentProvider {
    PaymentOutcome charge(Money amount, PaymentMethod method, OrderId reference);
}

// Adapter / ACL for a legacy SOAP-ish "GatewayX" API with ugly codes and naming
@Component
class GatewayXPaymentAdapter implements PaymentProvider {
    private final GatewayXClient client;
    @Override
    public PaymentOutcome charge(Money amount, PaymentMethod method, OrderId reference) {
        GxChargeRequest req = new GxChargeRequest();                          // external DTO stays inside this package
        req.setAmt(amount.minorUnits()); req.setCur(amount.currency().code()); req.setTok(method.token()); req.setRef(reference.value());
        GxChargeResponse res = client.charge(req);
        return switch (res.getRc()) {                                         // translate vendor codes to domain outcomes
            case "00"        -> PaymentOutcome.captured(res.getTxn());
            case "05", "51"  -> PaymentOutcome.declined(DeclineReason.INSUFFICIENT_FUNDS_OR_DO_NOT_HONOUR);
            case "91", "96"  -> PaymentOutcome.temporarilyUnavailable();       // retryable
            default          -> PaymentOutcome.failed("Unknown gateway code " + res.getRc());
        };
    }
}`,
        ),
      ],
      [
        blk(`<h3>Materialized views</h3>
• A <b>materialized view</b> is a <b>pre-computed, stored result of a query</b> (denormalised) that is refreshed as source data changes, trading <b>storage and staleness</b> for fast reads. In microservices it is the standard way to answer <b>cross-service queries without runtime joins</b>: a service subscribes to events of several services and maintains its own <b>read-optimised table/document/index</b> (the read side of CQRS), e.g. <code>order_summary</code> with customer name, course titles and payment status in one row.<br>
• Maintaining them: <b>event-driven projections</b> (idempotent handlers, versioned, rebuildable by replaying the event log), <b>CDC</b> (Debezium → Kafka → projector), database <b>materialized views</b> (<code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code>, scheduled or triggered), search indexes (Elasticsearch), caches (Redis). Handle <b>rebuilds</b> (reset + replay), <b>lag monitoring</b>, <b>idempotency</b>, <b>out-of-order events</b> (versions), and clear <b>ownership</b> (the projection owner is responsible for its correctness).`,
          `-- PostgreSQL materialized view for a dashboard (single service)
CREATE MATERIALIZED VIEW course_stats AS
  SELECT c.id AS course_id, c.title, count(e.id) AS enrolments, coalesce(avg(e.progress), 0) AS avg_progress
  FROM course c LEFT JOIN enrollment e ON e.course_id = c.id GROUP BY c.id, c.title;
CREATE UNIQUE INDEX ON course_stats (course_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY course_stats;                          -- schedule it (pg_cron / Spring @Scheduled)

// Cross-service projection built from events (reporting-service)
@Component
class OrderSummaryProjector {
    @KafkaListener(topics = {"orders.events", "payments.events", "identity.events"}, groupId = "reporting")
    @Transactional
    void on(EventEnvelope<?> e) {
        if (!inbox.firstTime(e.eventId())) return;                            // idempotent
        switch (e.payload()) {
            case OrderPlaced p      -> summaries.upsert(p.orderId(), s -> s.placed(p.total(), p.customerId(), e.occurredAt()));
            case PaymentCompleted p -> summaries.upsert(p.orderId(), s -> s.paid(p.method(), e.occurredAt()));
            case CustomerRenamed c  -> summaries.renameCustomer(c.customerId(), c.name());                  // denormalised data kept in sync
            default -> {}
        }
    }
}
// Rebuild: truncate order_summary; reset the consumer group offset to earliest; the projector replays history.`,
        ),
      ],
      [
        ['Event sourcing vs traditional state storage?', 'Event sourcing stores an append-only sequence of domain events and derives the current state by replaying them, giving a full audit trail and easy new projections but adding complexity (schema evolution, snapshots, eventual consistency). Traditional storage keeps only the latest state.'],
        ['What is an anti-corruption layer?', 'A translation boundary (ports, adapters and mappers) that shields your domain model from the models, codes and quirks of legacy or third-party systems so changes there do not leak into your domain.'],
        ['What is a materialized view used for in microservices?', 'To serve cross-service or heavy queries quickly from a pre-computed, denormalised read model that is kept up to date by events or CDC, avoiding runtime joins and distributed queries.'],
      ],
    ),
    topic(
      'ms-sidecar-ambassador-hexagonal',
      'Sidecar, Ambassador and Hexagonal Architecture',
      [
        blk(`<h3>Sidecar pattern</h3>
• A <b>sidecar</b> is a helper container deployed <b>alongside the main application container</b> in the same Pod (sharing network and volumes) providing <b>cross-cutting capabilities</b> without changing the app or its language: <b>proxy/service mesh</b> (Envoy in Istio/Linkerd: mTLS, retries, metrics), <b>log shipping</b> (Fluent Bit), <b>config/secret refresh</b> (Vault agent), <b>certificate rotation</b>, <b>metrics exporters</b>, <b>Dapr</b> (building blocks via a sidecar API: pub/sub, state, secrets), <b>OAuth proxy</b>. Benefits: polyglot support, separate lifecycle and ownership (platform team), consistent behaviour across services. Costs: extra resource use and latency, complexity, startup/shutdown ordering (Kubernetes native sidecar containers in 1.29+ solve ordering).`,
          `apiVersion: apps/v1
kind: Deployment
metadata: { name: catalogue }
spec:
  template:
    spec:
      containers:
        - name: catalogue                                   # the application
          image: ghcr.io/javaschoollab/catalogue-service:1.4.2
          volumeMounts: [ { name: logs, mountPath: /var/log/app } ]
        - name: log-shipper                                 # sidecar: ships logs written by the app
          image: fluent/fluent-bit:3.1
          volumeMounts: [ { name: logs, mountPath: /var/log/app, readOnly: true } ]
      initContainers:
        - name: envoy-proxy                                 # Kubernetes native sidecar (1.29+): starts first, runs for the pod's lifetime
          image: envoyproxy/envoy:v1.31
          restartPolicy: Always
      volumes: [ { name: logs, emptyDir: {} } ]

# Istio injects an Envoy sidecar automatically: kubectl label namespace jsl istio-injection=enabled`,
        ),
      ],
      [
        blk(`<h3>Ambassador pattern</h3>
• An <b>ambassador</b> is a helper (often a sidecar) that acts as an <b>out-of-process proxy for outgoing connections</b> from the app to remote services: it handles <b>retries, timeouts, circuit breaking, TLS/mTLS, authentication, routing/service discovery, rate limiting, request logging and tracing</b> so the application just calls <code>localhost:port</code>. Typical uses: legacy apps that cannot be modified, polyglot fleets needing uniform resilience, connecting to databases/brokers through a secure proxy (Cloud SQL Auth Proxy, Envoy), offloading client-side concerns.<br>
• Sidecar vs ambassador: <b>sidecar</b> = general "helper next to the app"; <b>ambassador</b> = a specific role of the helper: <b>represents the app to the outside</b> (egress proxy). A service mesh combines both (Envoy handles ingress and egress).`,
          `# Cloud SQL / database access via an ambassador proxy in the pod
containers:
  - name: app
    image: ghcr.io/javaschoollab/reporting:2.0.1
    env: [ { name: DB_URL, value: "jdbc:postgresql://127.0.0.1:5432/reporting" } ]       # the app talks to localhost
  - name: db-proxy                                           # ambassador: authenticated, encrypted tunnel to the real database
    image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.11
    args: ["--private-ip", "jsl-project:asia-south1:reporting-db"]

# Envoy ambassador config idea: the app calls http://localhost:9001, Envoy adds retries/timeouts/mTLS to payment-service
# route: { timeout: 2s, retry_policy: { retry_on: "5xx,connect-failure", num_retries: 2, per_try_timeout: 0.8s } }`,
        ),
      ],
      [
        blk(`<h3>Hexagonal architecture (ports and adapters)</h3>
• <b>Hexagonal architecture</b> (Alistair Cockburn; also Clean/Onion) keeps the <b>domain/application core independent of technology</b>. The core defines <b>ports</b> (interfaces): <b>inbound/driving ports</b> (use cases: <code>EnrollStudent</code>) and <b>outbound/driven ports</b> (<code>EnrollmentRepository</code>, <code>PaymentProvider</code>, <code>EventPublisher</code>). <b>Adapters</b> implement them: inbound adapters (REST controller, Kafka listener, CLI) call use cases; outbound adapters (JPA, Kafka producer, HTTP client) implement the driven ports. Dependencies point <b>inward</b>: the domain knows nothing about Spring, JPA or HTTP.<br>
• Benefits: <b>testable core</b> (unit-test use cases with fake adapters, no containers), replaceable infrastructure (swap Kafka for RabbitMQ, JPA for jOOQ), clear boundaries inside a microservice, easier to evolve and to move to/from a monolith. Costs: more interfaces and mapping; do not over-engineer simple CRUD services.<br>
• Package layout: <code>domain</code> (entities, value objects, domain services), <code>application</code> (use cases + ports), <code>adapter.in.web</code>, <code>adapter.out.persistence</code>, <code>adapter.out.messaging</code>, <code>config</code>. Enforce with <b>ArchUnit</b> tests.`,
          `// application/port/in
public interface EnrollStudentUseCase { Enrollment enroll(EnrollCommand command); }
// application/port/out
public interface EnrollmentStore { boolean exists(StudentId s, CourseId c); Enrollment save(Enrollment e); }
public interface CourseDirectory { CourseInfo find(CourseId id); }
public interface DomainEventPublisher { void publish(DomainEvent event); }

// application: the use case depends only on ports (no Spring, no JPA)
public class EnrollStudentService implements EnrollStudentUseCase {
    private final EnrollmentStore store; private final CourseDirectory courses; private final DomainEventPublisher events;
    public Enrollment enroll(EnrollCommand cmd) {
        if (!courses.find(cmd.courseId()).published()) throw new CourseNotAvailableException(cmd.courseId());
        if (store.exists(cmd.studentId(), cmd.courseId())) throw new AlreadyEnrolledException();
        Enrollment e = store.save(Enrollment.create(cmd.studentId(), cmd.courseId()));
        events.publish(new EnrollmentCreated(e.id(), e.studentId(), e.courseId()));
        return e;
    }
}
// adapter/in/web: REST controller calls EnrollStudentUseCase; adapter/out/persistence: JpaEnrollmentStore implements EnrollmentStore

// ArchUnit: the domain must not depend on adapters or frameworks
@ArchTest static final ArchRule domain_is_pure = noClasses().that().resideInAPackage("..domain..").or().resideInAPackage("..application..")
    .should().dependOnClassesThat().resideInAnyPackage("..adapter..", "org.springframework..", "jakarta.persistence..");`,
        ),
      ],
      [
        ['What is the sidecar pattern?', 'Deploying a helper container beside the application container in the same pod to provide cross-cutting capabilities (proxying/mTLS, log shipping, secret refresh) without changing the application code.'],
        ['What is hexagonal architecture?', 'An architecture where the domain core is isolated behind ports (interfaces) and technology is attached through adapters (REST, JPA, messaging), with dependencies pointing inward so the core is testable and infrastructure replaceable.'],
        ['Sidecar vs ambassador?', 'A sidecar is any helper container alongside the app; an ambassador is a specific kind of helper that acts as an outbound proxy on behalf of the app, adding retries, TLS, routing and resilience to its remote calls.'],
      ],
    ),
  ]),

  ms(15, 'Microservices Interview Questions', 'Interview', [
    topic(
      'ms-interview-design',
      'Interview Q&A: Architecture, Communication and Resilience (159-165)',
      [
        blk(`<h3>How to answer microservices questions</h3>
• Interviewers look for <b>trade-off thinking</b>: state the pattern, <b>when to use it and when not</b>, a concrete Spring Boot/Kafka/Kubernetes implementation, and the <b>failure modes</b>. Use a real example (order, payment, enrolment) and mention monitoring and testing.<br>
• Questions here: monolith vs microservices, how services communicate, how Eureka works, what an API gateway is, how a circuit breaker works, the Saga pattern, distributed transactions.`),
      ],
      [
        blk(`<h3>Model answers</h3>
<table ${TABLE}>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Monolith vs microservices</td><td>A monolith is one deployable with one database: simple to build, test and deploy at small scale. Microservices are independently deployable services around business capabilities, each owning its data: independent scaling and releases and team autonomy, at the cost of distributed-system complexity (network failures, data consistency, operations). Start with a modular monolith; split when boundaries and needs are clear.</td></tr>
<tr><td>How do microservices communicate?</td><td><b>Synchronously</b> via REST/gRPC (RestClient, WebClient, OpenFeign) for queries and immediate answers, with timeouts, retries and circuit breakers; <b>asynchronously</b> via events/messages (Kafka, RabbitMQ) for decoupling and eventual consistency, with idempotent consumers and the outbox pattern.</td></tr>
<tr><td>How does Eureka work?</td><td>Services register with the Eureka server (name, host, port, health URL) and renew a lease with heartbeats; the server evicts expired leases and replicates to peers. Clients fetch and cache the registry and use a client-side load balancer to pick an instance. Self-preservation mode avoids mass eviction during network problems. On Kubernetes, Services/DNS replace it.</td></tr>
<tr><td>What is an API Gateway?</td><td>The single entry point that routes requests to services and centralises cross-cutting concerns: authentication (JWT validation), rate limiting, TLS, CORS, logging/tracing and resilience filters. Spring Cloud Gateway uses routes (predicates + filters). Keep it thin and run several instances.</td></tr>
<tr><td>How does a circuit breaker work?</td><td>It monitors calls; when the failure/slow-call rate exceeds a threshold it opens and fails fast (optionally returning a fallback) for a wait period, then half-opens to allow trial calls and closes again if they succeed. Resilience4j implements it (with retry, timeout, bulkhead, rate limiter).</td></tr>
<tr><td>What is the Saga pattern?</td><td>A sequence of local transactions across services, each triggering the next via events or commands, with compensating transactions to undo previous steps on failure. Choreography (event-driven) or orchestration (central coordinator). Results in eventual consistency; compensations must be idempotent.</td></tr>
<tr><td>How do you handle distributed transactions?</td><td>Avoid 2PC; use sagas with compensations, the transactional outbox for reliable event publishing, idempotent consumers, and design aggregates so one transaction affects one service; accept eventual consistency and expose pending states.</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Likely follow-up questions</h3>
• "What happens if payment succeeds but publishing <code>PaymentCompleted</code> fails?" → the <b>outbox</b>: the event is stored in the same DB transaction and relayed later.<br>
• "How do you stop a slow service from taking down the whole system?" → timeouts, bulkheads, circuit breakers, async events, load shedding, fallbacks.<br>
• "When would you not use microservices?" → small team, unclear domain, low operational maturity: use a modular monolith.<br>
• "How do you version APIs and events without breaking consumers?" → additive changes, tolerant readers, versioned endpoints/topics, schema registry, consumer-driven contracts.`,
          `// Whiteboard: place-order flow with resilience and consistency
// client -> gateway (JWT, rate limit) -> order-service
//   @Transactional { save Order(PENDING); save OutboxEvent(OrderPlaced) }              // atomic
//   outbox relay -> Kafka "orders.events" (key = orderId)
// payment-service (idempotent consumer, inbox table) -> charge via ResilientClient (timeout 2s, retry x2 with jitter, circuit breaker, fallback queue)
//   -> PaymentCompleted / PaymentFailed event
// order-service consumes -> CONFIRMED or REJECTED (+ compensation: release stock)
// observability: traceId in every log, metrics for lag/breaker state/saga duration, alerts on stuck PENDING orders (> 5 min)`,
        ),
      ],
      [
        ['Monolith vs microservices?', 'Monolith: one deployable, simple, ACID, scales as a whole; microservices: independently deployable, scalable and owned services with database per service, at the cost of distributed complexity. Choose based on team size, domain clarity and operational maturity.'],
        ['How do you handle distributed transactions?', 'Use the saga pattern with compensating transactions (choreography or orchestration), the transactional outbox for reliable events and idempotent consumers; avoid 2PC and accept eventual consistency.'],
        ['How does a circuit breaker help?', 'It fails fast when a dependency is unhealthy, protecting threads and latency, lets the dependency recover, and enables fallbacks; it moves through closed, open and half-open states.'],
      ],
    ),
    topic(
      'ms-interview-ops',
      'Interview Q&A: Security, Observability, Consistency and Operations (166-173)',
      [
        blk(`<h3>Questions 166-173</h3>
• How do you secure microservices? How do you trace requests across services? How do you prevent duplicate message processing? How do you handle service failures? How do you resolve database consistency issues? How do you prevent cascading failures? How do you deploy microservices independently? How do you troubleshoot production issues?<br>
• Strong answers combine <b>principles + tooling + a concrete incident</b>.`),
      ],
      [
        blk(`<h3>Model answers</h3>
<table ${TABLE}>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>How do you secure microservices?</td><td>Centralised identity (OAuth2/OIDC, Keycloak); JWT validated at the gateway and in every service (zero trust); service-to-service auth with client credentials or mTLS; RBAC and method-level security plus ownership checks; TLS everywhere; secrets in Vault/secret managers; network policies; rate limiting; dependency/image scanning; audit logging.</td></tr>
<tr><td>How do you trace requests across services?</td><td>Instrument with OpenTelemetry/Micrometer Tracing, propagate W3C traceparent through HTTP and message headers, export to Jaeger/Tempo/Zipkin, include trace ids in logs and error responses so logs, metrics and traces correlate; sample sensibly (tail sampling for errors/slow).</td></tr>
<tr><td>How do you prevent duplicate message processing?</td><td>Idempotent consumers: inbox table with unique message id in the same transaction, naturally idempotent upserts/conditional updates, idempotency keys for APIs, producer idempotence, commit offsets after processing, DLQ for poison messages.</td></tr>
<tr><td>How do you handle service failures?</td><td>Timeouts, retries with backoff and jitter for idempotent calls, circuit breakers, bulkheads, fallbacks/graceful degradation, asynchronous messaging, health probes with automatic restart/replacement, redundancy across zones, and runbooks/alerts.</td></tr>
<tr><td>How do you resolve database consistency issues?</td><td>Keep one owner per piece of data; use sagas/outbox for cross-service flows; reconcile with periodic jobs and compensating actions; detect drift with consistency checks; optimistic locking inside a service; make operations idempotent; define acceptable consistency windows.</td></tr>
<tr><td>How do you prevent cascading failures?</td><td>Timeouts shorter than callers', circuit breakers, bulkheads, rate limiting/load shedding, retry budgets with jitter, async decoupling, caches/fallbacks, autoscaling and capacity limits; verify with chaos tests.</td></tr>
<tr><td>How do you deploy microservices independently?</td><td>Per-service repo/pipeline and versioned image; backward-compatible APIs, events and DB schema (expand/contract); contract tests; rolling/canary/blue-green with health gates; feature flags; GitOps; automated rollback.</td></tr>
<tr><td>How do you troubleshoot production issues?</td><td>Start from alerts/SLO dashboards (RED metrics), find the failing service and time window, follow traces to the slow/failing hop, read correlated logs by trace id, check recent deployments/config changes, dependencies (DB pool, Kafka lag, breakers), resource saturation and thread/heap dumps; mitigate first (rollback, scale, flag off), then root-cause and write a post-mortem.</td></tr>
</table>`),
      ],
      [
        blk(`<h3>A production troubleshooting walkthrough</h3>
• <b>Symptom</b>: users report slow enrolment; alert "p95 latency &gt; 1 s for 10 min" on <code>learning-service</code>.<br>
• <b>1. Scope</b>: Grafana RED dashboard: error rate normal, latency up only for <code>POST /enrollments</code>, started 14:05. <b>2. Recent change</b>: deployment of <code>catalogue-service</code> v1.5.0 at 14:03. <b>3. Trace</b>: slow traces show 900 ms in <code>catalogue-service GET /courses/{id}</code> → a new query without an index. <b>4. Dependencies</b>: Hikari pool of catalogue at 100% active, circuit breaker in learning still closed but slow-call rate climbing. <b>5. Mitigate</b>: roll back catalogue (<code>rollout undo</code>) or raise the flag off. <b>6. Fix</b>: add the index via migration, add a query-count/perf test, adjust the breaker's slow-call threshold and timeouts, write the post-mortem.`,
          `# useful commands during an incident
kubectl get pods -n jsl -o wide && kubectl top pods -n jsl
kubectl describe pod <pod> -n jsl                       # events: OOMKilled? probe failures? image pull?
kubectl logs <pod> -n jsl --previous                    # logs of the crashed container
kubectl rollout history deploy/catalogue -n jsl && kubectl rollout undo deploy/catalogue -n jsl
kubectl exec -it <pod> -- jcmd 1 Thread.print           # thread dump (blocked threads, pool exhaustion)
curl -s localhost:9090/actuator/metrics/hikaricp.connections.pending
# PromQL: histogram_quantile(0.99, sum by (le, uri) (rate(http_server_requests_seconds_bucket[5m])))
# Kibana: trace.id:"<id>" and log.level:ERROR`,
        ),
      ],
      [
        ['How do you troubleshoot production issues in microservices?', 'Begin with alerts and RED dashboards to scope the problem, correlate with recent deployments, follow distributed traces to the slow or failing hop, read logs by trace id, check dependencies and resource saturation (DB pool, Kafka lag, breakers, memory/threads), mitigate first (rollback, scale, flag off) and then root-cause and document.'],
        ['How do you prevent cascading failures?', 'Timeouts, circuit breakers, bulkheads, rate limiting and load shedding, retries with backoff and budgets, asynchronous decoupling, fallbacks and capacity limits, verified by fault-injection tests.'],
        ['How do you secure a microservices system end to end?', 'Centralised OAuth2/OIDC identity, JWT validation in gateway and services, service-to-service authentication (client credentials/mTLS), RBAC and ownership checks, TLS, managed secrets, network policies, scanning in CI and audit logging.'],
      ],
    ),
  ]),
];

export const microservicesRoadmap3: SubTopic[] = [...microservicesRoadmap3Base, ...microservicesExamplesFull];
