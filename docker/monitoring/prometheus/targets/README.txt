HOW ANOTHER APPLICATION PLUGS INTO THE SHARED MONITORING
========================================================
Prometheus reads every *.yml file in these two folders by itself (no restart, every minute):

  targets/apps/    an application that exposes Prometheus metrics (a /metrics endpoint, no login)
  targets/probes/  URLs the blackbox exporter should check from outside (is the site up, how fast)

Example, apps/otherapp.yml  (the application must be on the Docker network "javaschoollab_shared"):
  - targets: ["otherapp:8080"]
    labels:
      application: otherapp

Example, probes/otherapp.yml:
  - targets: ["http://otherapp:8080/health"]
    labels:
      application: otherapp

Logs: Alloy collects the logs of every container on the machine (LOG_CONTAINER_REGEX in docker/.env) - nothing to do.
Dashboards: put the dashboard JSON files in  monitoring/grafana/dashboards/<AppName>/  - each folder becomes a Grafana folder.
