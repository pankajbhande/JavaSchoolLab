Grafana-managed alert rules would be provisioned from YAML files in this folder. JavaSchoolLab does not use any: its alerts are
Prometheus rules (docker/monitoring/prometheus/rules) delivered by Alertmanager, and Grafana only displays them.
The folder exists so Grafana does not log an error about a missing provisioning directory at start.
