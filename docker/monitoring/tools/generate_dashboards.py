#!/usr/bin/env python3
"""Generates the Grafana dashboards in ../grafana/dashboards/*.json.

The JSON files are what Grafana loads (one sub-folder per application: dashboards/JavaSchoolLab/); this script is how they are kept
consistent (same colours, units, layout) and is the place to change a panel. Run it from this folder:   python generate_dashboards.py
Every PromQL / LogQL / TraceQL query is written once here, with the metric names Spring Boot Actuator (Micrometer), the MySQL, Redis and
OpenSearch exporters and the blackbox exporter really emit.
"""
import json
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grafana', 'dashboards', 'JavaSchoolLab')

PROM = {'type': 'prometheus', 'uid': 'prometheus'}
LOKI = {'type': 'loki', 'uid': 'loki'}
TEMPO = {'type': 'tempo', 'uid': 'tempo'}

APP = 'application="javaschoollab"'
R = '$__rate_interval'

GREEN, YELLOW, ORANGE, RED, BLUE = 'green', '#EAB839', 'orange', 'red', 'blue'


def steps(*pairs):
    """steps((None,'green'), (80,'red')) -> Grafana threshold steps."""
    return [{'color': c, 'value': v} for v, c in pairs]


class Board:
    def __init__(self, uid, title, description, tags, variables=None, refresh='30s', time_from='now-3h'):
        self.uid, self.title, self.description, self.tags = uid, title, description, tags
        self.variables = variables or []
        self.refresh, self.time_from = refresh, time_from
        self.panels = []
        self._id = 0
        self._x = 0
        self._y = 0
        self._rowh = 0

    def _next_id(self):
        self._id += 1
        return self._id

    def row(self, title):
        self._wrap()
        self.panels.append({'id': self._next_id(), 'type': 'row', 'title': title, 'collapsed': False,
                            'gridPos': {'h': 1, 'w': 24, 'x': 0, 'y': self._y}, 'panels': []})
        self._y += 1

    def _wrap(self):
        if self._x:
            self._x = 0
            self._y += self._rowh
            self._rowh = 0

    def add(self, panel, w, h):
        if self._x + w > 24:
            self._wrap()
        panel['id'] = self._next_id()
        panel['gridPos'] = {'h': h, 'w': w, 'x': self._x, 'y': self._y}
        self.panels.append(panel)
        self._x += w
        self._rowh = max(self._rowh, h)

    def to_json(self):
        return {
            'uid': self.uid, 'title': self.title, 'description': self.description, 'tags': self.tags,
            'schemaVersion': 39, 'version': 1, 'editable': True, 'graphTooltip': 1,
            'refresh': self.refresh, 'time': {'from': self.time_from, 'to': 'now'},
            'timepicker': {'refresh_intervals': ['10s', '30s', '1m', '5m', '15m', '1h']},
            'timezone': 'browser', 'fiscalYearStartMonth': 0, 'liveNow': False,
            'annotations': {'list': [{'builtIn': 1, 'datasource': {'type': 'grafana', 'uid': '-- Grafana --'}, 'enable': True,
                                      'hide': True, 'iconColor': 'rgba(0, 211, 255, 1)', 'name': 'Annotations & Alerts', 'type': 'dashboard'}]},
            'templating': {'list': self.variables},
            'links': [{'title': 'JavaSchoolLab dashboards', 'type': 'dashboards', 'tags': ['javaschoollab'], 'asDropdown': True,
                       'includeVars': False, 'keepTime': True}],
            'panels': self.panels,
        }

    def write(self, filename):
        os.makedirs(OUT, exist_ok=True)
        with open(os.path.join(OUT, filename), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(self.to_json(), f, indent=2, ensure_ascii=False)
            f.write('\n')


# ------------------------------------------------------------------------------------------------------------------------------
#  panel builders
# ------------------------------------------------------------------------------------------------------------------------------
def tgt(expr, legend='', ref='A', instant=False, fmt=None, ds=PROM):
    t = {'datasource': ds, 'expr': expr, 'legendFormat': legend, 'refId': ref, 'editorMode': 'code'}
    if instant:
        t.update({'instant': True, 'range': False})
    else:
        t.update({'instant': False, 'range': True})
    if fmt:
        t['format'] = fmt
    return t


def targets(queries, ds=PROM, instant=False):
    """queries: a str, or a list of (expr, legend)."""
    if isinstance(queries, str):
        queries = [(queries, '')]
    return [tgt(e, l, chr(ord('A') + i), instant=instant, ds=ds) for i, (e, l) in enumerate(queries)]


def stat(title, queries, unit='short', desc='', thresholds=None, decimals=None, mappings=None, spark=True, calc='lastNotNull',
         color_mode='value', instant=False, min_=None, max_=None):
    th = thresholds or steps((None, GREEN))
    d = {'unit': unit, 'thresholds': {'mode': 'absolute', 'steps': th}, 'color': {'mode': 'thresholds'}, 'mappings': mappings or []}
    if decimals is not None:
        d['decimals'] = decimals
    if min_ is not None:
        d['min'] = min_
    if max_ is not None:
        d['max'] = max_
    return {'type': 'stat', 'title': title, 'description': desc, 'datasource': PROM, 'targets': targets(queries, instant=instant),
            'fieldConfig': {'defaults': d, 'overrides': []},
            'options': {'reduceOptions': {'calcs': [calc], 'fields': '', 'values': False}, 'colorMode': color_mode,
                        'graphMode': 'area' if spark else 'none', 'textMode': 'auto', 'justifyMode': 'auto', 'orientation': 'auto',
                        'wideLayout': True, 'showPercentChange': False}}


def timeseries(title, queries, unit='short', desc='', stack=False, min_=None, max_=None, fill=12, legend_calcs=('mean', 'max'),
               legend='table', thresholds=None, ds=PROM, decimals=None, draw='line'):
    custom = {'drawStyle': draw, 'lineInterpolation': 'smooth', 'lineWidth': 1, 'fillOpacity': fill, 'showPoints': 'never',
              'spanNulls': True, 'axisPlacement': 'auto',
              'stacking': {'mode': 'normal' if stack else 'none', 'group': 'A'}}
    d = {'unit': unit, 'custom': custom, 'color': {'mode': 'palette-classic'}}
    if min_ is not None:
        d['min'] = min_
    if max_ is not None:
        d['max'] = max_
    if decimals is not None:
        d['decimals'] = decimals
    if thresholds:
        d['thresholds'] = {'mode': 'absolute', 'steps': thresholds}
        custom['thresholdsStyle'] = {'mode': 'line'}
    return {'type': 'timeseries', 'title': title, 'description': desc, 'datasource': ds, 'targets': targets(queries, ds=ds),
            'fieldConfig': {'defaults': d, 'overrides': []},
            'options': {'legend': {'displayMode': legend, 'placement': 'bottom', 'showLegend': True, 'calcs': list(legend_calcs)},
                        'tooltip': {'mode': 'multi', 'sort': 'desc'}}}


def bargauge(title, queries, unit='short', desc='', max_=None, thresholds=None):
    d = {'unit': unit, 'thresholds': {'mode': 'absolute', 'steps': thresholds or steps((None, BLUE))}, 'color': {'mode': 'continuous-BlPu'}}
    if max_ is not None:
        d['max'] = max_
    d['min'] = 0
    return {'type': 'bargauge', 'title': title, 'description': desc, 'datasource': PROM, 'targets': targets(queries, instant=True),
            'fieldConfig': {'defaults': d, 'overrides': []},
            'options': {'reduceOptions': {'calcs': ['lastNotNull'], 'fields': '', 'values': False}, 'orientation': 'horizontal',
                        'displayMode': 'gradient', 'valueMode': 'color', 'showUnfilled': True, 'namePlacement': 'auto', 'minVizHeight': 16,
                        'minVizWidth': 8, 'sizing': 'auto'}}


def gauge(title, expr, unit='percentunit', desc='', thresholds=None, min_=0, max_=1):
    return {'type': 'gauge', 'title': title, 'description': desc, 'datasource': PROM, 'targets': targets(expr),
            'fieldConfig': {'defaults': {'unit': unit, 'min': min_, 'max': max_, 'color': {'mode': 'thresholds'},
                                          'thresholds': {'mode': 'absolute', 'steps': thresholds or steps((None, GREEN), (0.7, YELLOW), (0.9, RED))}},
                            'overrides': []},
            'options': {'reduceOptions': {'calcs': ['lastNotNull'], 'fields': '', 'values': False}, 'showThresholdLabels': False,
                        'showThresholdMarkers': True, 'orientation': 'auto'}}


def table(title, queries, desc='', rename=None, exclude=None, unit_by_col=None, sort_by=None):
    """A table of instant queries, one row per series."""
    transforms = [{'id': 'merge', 'options': {}}]
    org = {'excludeByName': {c: True for c in (exclude or ['Time'])}, 'renameByName': rename or {}, 'indexByName': {}}
    transforms.append({'id': 'organize', 'options': org})
    overrides = []
    for col, unit in (unit_by_col or {}).items():
        overrides.append({'matcher': {'id': 'byName', 'options': col}, 'properties': [{'id': 'unit', 'value': unit}]})
    t = {'type': 'table', 'title': title, 'description': desc, 'datasource': PROM, 'targets': [dict(x, format='table') for x in targets(queries, instant=True)],
         'transformations': transforms,
         'fieldConfig': {'defaults': {'custom': {'align': 'auto', 'cellOptions': {'type': 'auto'}, 'inspect': False}}, 'overrides': overrides},
         'options': {'showHeader': True, 'cellHeight': 'sm', 'footer': {'show': False, 'reducer': ['sum'], 'fields': ''}}}
    if sort_by:
        t['options']['sortBy'] = [{'displayName': sort_by, 'desc': True}]
    return t


def heatmap(title, expr, desc=''):
    return {'type': 'heatmap', 'title': title, 'description': desc, 'datasource': PROM,
            'targets': [dict(tgt(expr, '{{le}}'), format='heatmap')],
            'fieldConfig': {'defaults': {'custom': {'hideFrom': {'legend': False, 'tooltip': False, 'viz': False}, 'scaleDistribution': {'type': 'linear'}}}, 'overrides': []},
            'options': {'calculate': False, 'cellGap': 1, 'color': {'mode': 'scheme', 'scheme': 'Spectral', 'fill': 'dark-orange', 'scale': 'exponential',
                                                                       'exponent': 0.5, 'steps': 64, 'reverse': False},
                        'rowsFrame': {'layout': 'auto'}, 'yAxis': {'axisPlacement': 'left', 'unit': 's', 'reverse': False},
                        'tooltip': {'mode': 'single', 'yHistogram': False, 'showColorScale': False}, 'legend': {'show': True},
                        'exemplars': {'color': 'rgba(255,0,255,0.7)'}}}


def logs(title, expr, desc=''):
    return {'type': 'logs', 'title': title, 'description': desc, 'datasource': LOKI,
            'targets': [{'datasource': LOKI, 'expr': expr, 'queryType': 'range', 'refId': 'A', 'maxLines': 500}],
            'options': {'showTime': True, 'showLabels': False, 'showCommonLabels': False, 'wrapLogMessage': True, 'prettifyLogMessage': True,
                        'enableLogDetails': True, 'dedupStrategy': 'none', 'sortOrder': 'Descending', 'enableInfiniteScrolling': False}}


def loki_series(title, expr, legend='{{level}}', unit='short', desc='', stack=True):
    p = timeseries(title, [(expr, legend)], unit=unit, desc=desc, stack=stack, ds=LOKI, draw='bars', fill=70, legend_calcs=('sum',))
    p['fieldConfig']['defaults']['custom']['stacking'] = {'mode': 'normal' if stack else 'none', 'group': 'A'}
    return p


def trace_table(title, query, desc=''):
    return {'type': 'table', 'title': title, 'description': desc, 'datasource': TEMPO,
            'targets': [{'datasource': TEMPO, 'queryType': 'traceql', 'query': query, 'limit': 20, 'tableType': 'traces', 'refId': 'A'}],
            'fieldConfig': {'defaults': {'custom': {'align': 'auto', 'cellOptions': {'type': 'auto'}, 'inspect': False}}, 'overrides': []},
            'options': {'showHeader': True, 'cellHeight': 'sm'}}


def node_graph(title, desc=''):
    return {'type': 'nodeGraph', 'title': title, 'description': desc, 'datasource': TEMPO,
            'targets': [{'datasource': TEMPO, 'queryType': 'serviceMap', 'refId': 'A'}], 'options': {}}


def alert_list(title, desc=''):
    return {'type': 'alertlist', 'title': title, 'description': desc,
            'options': {'alertName': '', 'dashboardAlerts': False, 'groupBy': [], 'groupMode': 'default', 'maxItems': 25, 'sortOrder': 1,
                        'stateFilter': {'firing': True, 'pending': True, 'noData': False, 'normal': False, 'error': True}, 'viewMode': 'list',
                        'showInstances': True}}


def text(title, md):
    return {'type': 'text', 'title': title, 'options': {'mode': 'markdown', 'content': md}}


def var_query(name, label, query, multi=True, include_all=True, ds=PROM):
    return {'name': name, 'label': label, 'type': 'query', 'datasource': ds, 'query': {'query': query, 'refId': 'v'}, 'definition': query,
            'refresh': 2, 'sort': 1, 'multi': multi, 'includeAll': include_all, 'allValue': '.*',
            'current': {'selected': True, 'text': 'All', 'value': '$__all'}, 'options': [], 'regex': '', 'hide': 0, 'skipUrlSync': False}


def var_custom(name, label, values, default):
    opts = [{'selected': v == default, 'text': v, 'value': v} for v in values]
    return {'name': name, 'label': label, 'type': 'custom', 'query': ','.join(values), 'multi': True, 'includeAll': True, 'allValue': '.*',
            'current': {'selected': True, 'text': 'All', 'value': '$__all'}, 'options': opts, 'hide': 0}


def var_text(name, label):
    return {'name': name, 'label': label, 'type': 'textbox', 'query': '', 'current': {'selected': False, 'text': '', 'value': ''},
            'options': [{'selected': True, 'text': '', 'value': ''}], 'hide': 0}


# ---- query fragments --------------------------------------------------------------------------------------------------------
def http(kind, extra='', uri=True):
    """http_server_requests_seconds_<kind>{application, extra, uri=~"$uri"}"""
    parts = [APP]
    if extra:
        parts.append(extra)
    if uri:
        parts.append('uri=~"$uri"')
    return 'http_server_requests_seconds_%s{%s}' % (kind, ','.join(parts))


def rate_all():
    return 'sum(rate(%s[%s]))' % (http('count'), R)


def quantile(q, by=''):
    grp = 'le' + (', ' + by if by else '')
    return 'histogram_quantile(%s, sum by (%s) (rate(%s[%s])))' % (q, grp, http('bucket'), R)


def svc(metric, extra='', by='service, method'):
    sel = APP + (',' + extra if extra else '')
    return 'sum by (%s) (rate(jsl_service_seconds_%s{%s}[%s]))' % (by, metric, sel, R)


# ==============================================================================================================================
#  1. OVERVIEW
# ==============================================================================================================================
def overview():
    b = Board('jsl-overview', 'JavaSchoolLab - Overview: traffic, latency, errors',
              'How many requests arrive, how long they take, how many fail, and what the business operations (sign-up, login, quiz, certificate) are doing. '
              'Pick endpoints with the "Endpoint" filter.', ['javaschoollab', 'overview', 'spring-boot'],
              variables=[var_query('uri', 'Endpoint', 'label_values(http_server_requests_seconds_count{%s}, uri)' % APP)])

    b.row('Right now')
    b.add(stat('Application', 'up{job="javaschoollab-app"}', desc='1 = Prometheus can scrape the application, 0 = it cannot.',
               mappings=[{'type': 'value', 'options': {'0': {'text': 'DOWN', 'color': RED}, '1': {'text': 'UP', 'color': GREEN}}}],
               thresholds=steps((None, RED), (1, GREEN)), spark=False, color_mode='background'), 3, 4)
    b.add(stat('Requests / second', rate_all(), unit='reqps', desc='All HTTP requests handled by the application (the Endpoint filter applies).', decimals=2), 3, 4)
    b.add(stat('Server errors (5xx)', '100 * (sum(rate(%s[%s])) or vector(0)) / %s' % (http('count', 'status=~"5.."'), R, rate_all()),
               unit='percent', desc='Share of requests that failed with an HTTP 5xx server error.', decimals=2,
               thresholds=steps((None, GREEN), (1, YELLOW), (5, RED))), 3, 4)
    b.add(stat('Client errors (4xx)', '100 * (sum(rate(%s[%s])) or vector(0)) / %s' % (http('count', 'status=~"4.."'), R, rate_all()),
               unit='percent', desc='Share of requests answered with HTTP 4xx (bad input, not found, not logged in). Normally not a fault of the server.', decimals=2,
               thresholds=steps((None, GREEN), (25, YELLOW), (50, ORANGE))), 3, 4)
    b.add(stat('Latency p95', quantile(0.95), unit='s', desc='95% of requests are answered faster than this.', decimals=3,
               thresholds=steps((None, GREEN), (0.5, YELLOW), (1, RED))), 3, 4)
    b.add(stat('Latency p99', quantile(0.99), unit='s', desc='99% of requests are answered faster than this.', decimals=3,
               thresholds=steps((None, GREEN), (1, YELLOW), (3, RED))), 3, 4)
    b.add(stat('Requests in flight', 'sum(http_server_requests_active_seconds_gcount{%s})' % APP, desc='Requests being processed at this moment.'), 3, 4)
    b.add(stat('Uptime', 'process_uptime_seconds{%s}' % APP, unit='s', spark=False, desc='Time since the application started.'), 3, 4)

    b.row('Traffic: how many requests are coming in')
    b.add(timeseries('Requests per second by outcome', [('sum by (outcome) (rate(%s[%s]))' % (http('count'), R), '{{outcome}}')], unit='reqps', stack=True,
                     desc='SUCCESS = 2xx, REDIRECTION = 3xx, CLIENT_ERROR = 4xx, SERVER_ERROR = 5xx.'), 8, 8)
    b.add(timeseries('Requests per second by HTTP status', [('sum by (status) (rate(%s[%s]))' % (http('count'), R), '{{status}}')], unit='reqps', stack=True), 8, 8)
    b.add(timeseries('Requests per second by method', [('sum by (method) (rate(%s[%s]))' % (http('count'), R), '{{method}}')], unit='reqps', stack=True), 8, 8)
    b.add(stat('Requests in the selected time range', 'sum(increase(%s[$__range]))' % http('count'), unit='short', decimals=0, spark=False,
               desc='Total number of requests between the start and the end of the time range at the top right.'), 4, 8)
    b.add(bargauge('Busiest endpoints (requests / second)', [('topk(10, sum by (uri) (rate(%s[%s])))' % (http('count'), R), '{{uri}}')], unit='reqps'), 10, 8)
    b.add(timeseries('Requests per second by endpoint (top 8)', [('topk(8, sum by (uri) (rate(%s[%s])))' % (http('count'), R), '{{uri}}')], unit='reqps', legend='list'), 10, 8)

    b.row('Latency: how long requests take')
    b.add(timeseries('Response time percentiles', [(quantile(0.50), 'p50 (median)'), (quantile(0.90), 'p90'), (quantile(0.95), 'p95'), (quantile(0.99), 'p99')],
                     unit='s', desc='p95 = 95% of requests were faster than this line.', legend_calcs=('mean', 'max', 'lastNotNull'),
                     thresholds=steps((None, GREEN), (1, RED))), 12, 8)
    b.add(timeseries('Average and slowest response', [
        ('sum(rate(%s[%s])) / sum(rate(%s[%s]))' % (http('sum'), R, http('count'), R), 'average'),
        ('max(max_over_time(%s[%s]))' % (http('max'), R), 'slowest (max)')], unit='s'), 12, 8)
    b.add(heatmap('Response time distribution', 'sum by (le) (increase(%s[%s]))' % (http('bucket'), R),
                  desc='Each column is a moment in time, each row a response-time band, the colour how many requests fell in it.'), 12, 8)
    b.add(timeseries('Share of requests answered within 300 ms', [('sum(rate(%s[%s])) / sum(rate(%s[%s]))' % (http('bucket', 'le="0.3"'), R, http('count'), R), '<= 300 ms'),
                                                                   ('sum(rate(%s[%s])) / sum(rate(%s[%s]))' % (http('bucket', 'le="1.0"'), R, http('count'), R), '<= 1 s')],
                     unit='percentunit', min_=0, max_=1, desc='A "fast enough" view: the closer to 100% the better.'), 12, 8)
    b.add(bargauge('Slowest endpoints: average response time', [
        ('topk(10, sum by (uri) (rate(%s[%s])) / sum by (uri) (rate(%s[%s])))' % (http('sum'), R, http('count'), R), '{{uri}}')], unit='s',
        thresholds=steps((None, GREEN), (0.5, YELLOW), (1, RED))), 12, 8)
    b.add(timeseries('p95 response time by endpoint (top 8)', [('topk(8, %s)' % quantile(0.95, 'uri'), '{{uri}}')], unit='s', legend='list'), 12, 8)

    b.row('Errors')
    b.add(timeseries('Server errors (5xx) per second by endpoint', [('sum by (uri) (rate(%s[%s]))' % (http('count', 'status=~"5.."'), R), '{{uri}} {{status}}')],
                     unit='reqps', stack=True, desc='A fault of the server. Should stay at zero.'), 8, 8)
    b.add(timeseries('Client errors (4xx) per second by endpoint', [('sum by (uri, status) (rate(%s[%s]))' % (http('count', 'status=~"4.."'), R), '{{uri}} {{status}}')],
                     unit='reqps', stack=True, desc='401 = not logged in, 403 = not allowed, 404 = not found, 429 = rate limited.'), 8, 8)
    b.add(timeseries('Exceptions per second by type', [('sum by (exception) (rate(%s[%s]))' % (http('count', 'exception!="none"'), R), '{{exception}}')],
                     unit='reqps', stack=True), 8, 8)
    b.add(timeseries('Log lines by level (per second)', [('sum by (level) (rate(logback_events_total{%s}[%s]))' % (APP, R), '{{level}}')], unit='logs/s', stack=True,
                     desc='A rising ERROR line is the first sign of trouble. Open the Logs & Traces dashboard to read them.'), 12, 7)
    b.add(table('Failing endpoints (5xx and 4xx in the selected range)', [
        ('topk(15, sum by (uri, method, status) (increase(%s[$__range])))' % http('count', 'status=~"4..|5.."'), '')],
        rename={'uri': 'Endpoint', 'method': 'Method', 'status': 'Status', 'Value': 'Requests'}, exclude=['Time'], sort_by='Requests'), 12, 7)

    b.row('Business operations (every *Service method, measured by ServiceObservationAspect)')
    ok = 'error="none"'
    b.add(stat('Sign-ups', 'sum(increase(jsl_service_seconds_count{%s,service="AuthService",method=~"register.*",%s}[$__range])) or vector(0)' % (APP, ok),
               decimals=0, spark=False, desc='Accounts created in the selected time range.'), 4, 4)
    b.add(stat('Successful logins', 'sum(increase(jsl_service_seconds_count{%s,service="AuthService",method=~"login.*",%s}[$__range])) or vector(0)' % (APP, ok),
               decimals=0, spark=False), 4, 4)
    b.add(stat('Failed logins', 'sum(increase(jsl_service_seconds_count{%s,service="AuthService",method=~"login.*",error!="none"}[$__range])) or vector(0)' % APP,
               decimals=0, spark=False, thresholds=steps((None, GREEN), (20, YELLOW), (100, RED)), desc='Wrong password, unknown user or bad code.'), 4, 4)
    b.add(stat('One-time codes sent', 'sum(increase(jsl_service_seconds_count{%s,service="OtpService",method="send",%s}[$__range])) or vector(0)' % (APP, ok),
               decimals=0, spark=False), 4, 4)
    b.add(stat('Quiz attempts', 'sum(increase(jsl_service_seconds_count{%s,service="QuizService",method="recordAttempt",%s}[$__range])) or vector(0)' % (APP, ok),
               decimals=0, spark=False), 4, 4)
    b.add(stat('Certificates issued or read', 'sum(increase(jsl_service_seconds_count{%s,service="CertificateService",method="issue",%s}[$__range])) or vector(0)' % (APP, ok),
               decimals=0, spark=False), 4, 4)
    b.add(timeseries('Business operation calls per second (top 10)', [('topk(10, %s)' % svc('count'), '{{service}}.{{method}}')], unit='ops', legend='list'), 12, 8)
    b.add(timeseries('Business operation average duration (top 10)', [
        ('topk(10, %s / %s)' % (svc('sum'), svc('count')), '{{service}}.{{method}}')], unit='s', legend='list'), 12, 8)
    b.add(timeseries('Business operation p95 duration (top 10)', [
        ('topk(10, histogram_quantile(0.95, sum by (le, service, method) (rate(jsl_service_seconds_bucket{%s}[%s]))))' % (APP, R), '{{service}}.{{method}}')],
        unit='s', legend='list'), 12, 8)
    b.add(timeseries('Business operation failures per second (rejected or errored)', [
        ('topk(10, %s)' % svc('count', 'error!="none"'), '{{service}}.{{method}}')], unit='ops', legend='list',
        desc='Includes rules that reject bad input (for example a wrong password), not only crashes.'), 12, 8)

    b.row('Dependencies the requests rely on')
    b.add(gauge('Database pool in use', 'sum(hikaricp_connections_active{%s}) / sum(hikaricp_connections_max{%s})' % (APP, APP),
                desc='Share of MySQL connections currently busy. Near 100% means requests queue for a connection.'), 4, 6)
    b.add(timeseries('SQL statements per second', [('sum(rate(jdbc_query_seconds_count{%s}[%s]))' % (APP, R), 'queries/s')], unit='ops', legend='list'), 5, 6)
    b.add(timeseries('SQL average duration', [('sum(rate(jdbc_query_seconds_sum{%s}[%s])) / sum(rate(jdbc_query_seconds_count{%s}[%s]))' % (APP, R, APP, R), 'average'),
                                              ('max(jdbc_query_seconds_max{%s})' % APP, 'slowest')], unit='s'), 5, 6)
    b.add(gauge('Cache hit ratio', 'sum(rate(cache_gets_total{%s,result="hit"}[%s])) / sum(rate(cache_gets_total{%s}[%s]))' % (APP, R, APP, R),
                thresholds=steps((None, RED), (0.5, YELLOW), (0.8, GREEN)), desc='Share of cache lookups that found the answer. Empty until the first cached call.'), 4, 6)
    b.add(stat('Search index', 'jsl_search_ready{%s}' % APP, spark=False, color_mode='background',
               mappings=[{'type': 'value', 'options': {'0': {'text': 'NOT READY', 'color': YELLOW}, '1': {'text': 'READY', 'color': GREEN}}}],
               thresholds=steps((None, YELLOW), (1, GREEN)), desc='Server-side search (OpenSearch). The site still works without it.'), 3, 6)
    b.add(stat('Topics indexed', 'jsl_search_topics_indexed{%s}' % APP, spark=False, decimals=0), 3, 6)

    b.row('Alerts')
    b.add(table('Alerts firing or pending', [('ALERTS{alertstate=~"firing|pending"}', '')], rename={'alertname': 'Alert', 'severity': 'Severity', 'alertstate': 'State'},
                exclude=['Time', 'Value', '__name__', 'job', 'instance', 'environment', 'stack', 'application', 'method', 'service', 'uri']), 24, 6)
    return b


# ==============================================================================================================================
#  2. JVM & RUNTIME
# ==============================================================================================================================
def runtime():
    b = Board('jsl-runtime', 'JavaSchoolLab - JVM, Tomcat, database pool and cache',
              'The inside of the application: memory, garbage collection, threads, CPU, the web server, the MySQL connection pool, SQL and the cache.',
              ['javaschoollab', 'jvm', 'spring-boot'])
    heap_used, heap_max = 'sum(jvm_memory_used_bytes{%s,area="heap"})' % APP, 'sum(jvm_memory_max_bytes{%s,area="heap"})' % APP

    b.row('Memory')
    b.add(gauge('Heap used', '%s / %s' % (heap_used, heap_max), desc='Used heap as a share of the maximum. Above 85% for long = memory pressure.',
                thresholds=steps((None, GREEN), (0.7, YELLOW), (0.85, RED))), 4, 7)
    b.add(timeseries('Heap: used, committed, max', [(heap_used, 'used'), ('sum(jvm_memory_committed_bytes{%s,area="heap"})' % APP, 'committed'), (heap_max, 'max')],
                     unit='bytes', legend_calcs=('lastNotNull', 'max')), 10, 7)
    b.add(timeseries('Heap by memory pool', [('sum by (id) (jvm_memory_used_bytes{%s,area="heap"})' % APP, '{{id}}')], unit='bytes', stack=True), 10, 7)
    b.add(timeseries('Non-heap (metaspace, code cache) by pool', [('sum by (id) (jvm_memory_used_bytes{%s,area="nonheap"})' % APP, '{{id}}')], unit='bytes', stack=True), 8, 7)
    b.add(timeseries('Live data after GC', [('jvm_gc_live_data_size_bytes{%s}' % APP, 'live data'), ('jvm_gc_max_data_size_bytes{%s}' % APP, 'max old gen')], unit='bytes',
                     desc='What is still in use after a full collection. A line that keeps rising = a memory leak.'), 8, 7)
    b.add(timeseries('Direct and mapped buffers', [('sum by (id) (jvm_buffer_memory_used_bytes{%s})' % APP, '{{id}}')], unit='bytes'), 8, 7)

    b.row('Garbage collection')
    b.add(timeseries('Time spent in GC pauses (share of time)', [('sum by (cause) (rate(jvm_gc_pause_seconds_sum{%s}[%s]))' % (APP, R), '{{cause}}')], unit='percentunit',
                     stack=True, desc='Above 10% the application spends too much time collecting garbage.'), 8, 7)
    b.add(timeseries('GC pauses per second', [('sum by (gc) (rate(jvm_gc_pause_seconds_count{%s}[%s]))' % (APP, R), '{{gc}}')], unit='ops'), 8, 7)
    b.add(timeseries('Longest GC pause', [('max(jvm_gc_pause_seconds_max{%s})' % APP, 'max pause')], unit='s'), 8, 7)
    b.add(timeseries('Allocation and promotion rate', [('rate(jvm_gc_memory_allocated_bytes_total{%s}[%s])' % (APP, R), 'allocated / s'),
                                                       ('rate(jvm_gc_memory_promoted_bytes_total{%s}[%s])' % (APP, R), 'promoted to old gen / s')], unit='Bps'), 12, 7)
    b.add(timeseries('Classes loaded', [('jvm_classes_loaded_classes{%s}' % APP, 'loaded')], legend='list'), 12, 7)

    b.row('Threads and CPU')
    b.add(timeseries('JVM threads', [('jvm_threads_live_threads{%s}' % APP, 'live'), ('jvm_threads_daemon_threads{%s}' % APP, 'daemon'),
                                    ('jvm_threads_peak_threads{%s}' % APP, 'peak')], legend_calcs=('lastNotNull', 'max')), 8, 7)
    b.add(timeseries('Threads by state', [('sum by (state) (jvm_threads_states_threads{%s})' % APP, '{{state}}')], stack=True), 8, 7)
    b.add(timeseries('CPU usage', [('process_cpu_usage{%s}' % APP, 'application process'), ('system_cpu_usage{%s}' % APP, 'whole machine')], unit='percentunit',
                     min_=0, max_=1, thresholds=steps((None, GREEN), (0.85, RED))), 8, 7)
    b.add(timeseries('Open file descriptors', [('process_files_open_files{%s}' % APP, 'open'), ('process_files_max_files{%s}' % APP, 'limit')], legend_calcs=('lastNotNull',),
                     desc='Linux only. Close to the limit = connections or files are leaking.'), 8, 6)
    b.add(timeseries('Background task executors', [('executor_active_threads{%s}' % APP, '{{name}} active'), ('executor_queued_tasks{%s}' % APP, '{{name}} queued')], legend='list'), 8, 6)
    b.add(timeseries('Disk space', [('disk_free_bytes{%s}' % APP, 'free {{path}}'), ('disk_total_bytes{%s}' % APP, 'total {{path}}')], unit='bytes', legend='list'), 8, 6)

    b.row('Web server (Tomcat)')
    b.add(timeseries('Tomcat threads', [('tomcat_threads_busy_threads{%s}' % APP, 'busy'), ('tomcat_threads_current_threads{%s}' % APP, 'current'),
                                        ('tomcat_threads_config_max_threads{%s}' % APP, 'maximum')], legend_calcs=('lastNotNull', 'max'),
                     desc='Busy close to maximum = new requests wait. Alert: TomcatThreadsSaturated.'), 8, 7)
    b.add(timeseries('Tomcat connections', [('tomcat_connections_current_connections{%s}' % APP, 'open'), ('tomcat_connections_keepalive_current_connections{%s}' % APP, 'keep-alive'),
                                            ('tomcat_connections_config_max_connections{%s}' % APP, 'maximum')], legend_calcs=('lastNotNull', 'max')), 8, 7)
    b.add(timeseries('Network traffic of the web server', [('rate(tomcat_global_received_bytes_total{%s}[%s])' % (APP, R), 'received'),
                                                           ('rate(tomcat_global_sent_bytes_total{%s}[%s])' % (APP, R), 'sent')], unit='Bps'), 8, 7)

    b.row('Database connection pool (HikariCP) and SQL')
    b.add(timeseries('Connections: active, idle, pending', [('sum(hikaricp_connections_active{%s})' % APP, 'active'), ('sum(hikaricp_connections_idle{%s})' % APP, 'idle'),
                                                            ('sum(hikaricp_connections_pending{%s})' % APP, 'pending (waiting)'), ('sum(hikaricp_connections_max{%s})' % APP, 'maximum')],
                     legend_calcs=('lastNotNull', 'max'), desc='"Pending" above zero = requests are waiting for a free connection.'), 8, 7)
    b.add(timeseries('Time to get a connection', [('sum(rate(hikaricp_connections_acquire_seconds_sum{%s}[%s])) / sum(rate(hikaricp_connections_acquire_seconds_count{%s}[%s]))' % (APP, R, APP, R), 'average'),
                                                  ('max(hikaricp_connections_acquire_seconds_max{%s})' % APP, 'slowest')], unit='s'), 8, 7)
    b.add(timeseries('How long a connection is held', [('sum(rate(hikaricp_connections_usage_seconds_sum{%s}[%s])) / sum(rate(hikaricp_connections_usage_seconds_count{%s}[%s]))' % (APP, R, APP, R), 'average'),
                                                       ('max(hikaricp_connections_usage_seconds_max{%s})' % APP, 'longest')], unit='s'), 8, 7)
    b.add(timeseries('Connection timeouts', [('sum(increase(hikaricp_connections_timeout_total{%s}[%s]))' % (APP, R), 'timeouts')], legend='list',
                     desc='A request gave up waiting for a database connection. Should stay at zero.'), 8, 6)
    b.add(timeseries('SQL statements per second', [('sum(rate(jdbc_query_seconds_count{%s}[%s]))' % (APP, R), 'all'),
                                                   ('sum(rate(jdbc_query_seconds_count{%s,error!="none"}[%s]))' % (APP, R), 'failed')], unit='ops'), 8, 6)
    b.add(timeseries('SQL duration', [('sum(rate(jdbc_query_seconds_sum{%s}[%s])) / sum(rate(jdbc_query_seconds_count{%s}[%s]))' % (APP, R, APP, R), 'average'),
                                      ('max(jdbc_query_seconds_max{%s})' % APP, 'slowest')], unit='s'), 8, 6)

    b.row('Cache and logging')
    b.add(timeseries('Cache lookups per second', [('sum by (result) (rate(cache_gets_total{%s}[%s]))' % (APP, R), '{{result}}')], unit='ops', stack=True,
                     desc='hit = answered from the cache, miss = had to ask MySQL.'), 8, 7)
    b.add(timeseries('Cache size', [('sum by (cache) (cache_size{%s})' % APP, '{{cache}}')], legend='list'), 8, 7)
    b.add(timeseries('Log lines by level (per second)', [('sum by (level) (rate(logback_events_total{%s}[%s]))' % (APP, R), '{{level}}')], unit='logs/s', stack=True), 8, 7)
    return b


# ==============================================================================================================================
#  3. INFRASTRUCTURE
# ==============================================================================================================================
def infrastructure():
    b = Board('jsl-infrastructure', 'JavaSchoolLab - MySQL, Redis, OpenSearch and uptime checks',
              'The shared services the application depends on (through their exporters) and the synthetic checks of the site from outside.',
              ['javaschoollab', 'mysql', 'redis', 'opensearch', 'blackbox'])

    b.row('Uptime checks (blackbox probes from outside)')
    b.add(stat('Probes succeeding', 'sum(probe_success{job="blackbox-http"})', desc='How many of the 4 checks answer with HTTP 2xx.', spark=False, decimals=0,
               thresholds=steps((None, RED), (4, GREEN))), 4, 5)
    b.add(table('Every check', [('probe_success{job="blackbox-http"}', ''), ('probe_duration_seconds{job="blackbox-http"}', ''), ('probe_http_status_code{job="blackbox-http"}', '')],
                rename={'instance': 'Check', 'Value #A': 'Up (1=yes)', 'Value #B': 'Seconds', 'Value #C': 'HTTP status'},
                exclude=['Time', 'job', '__name__', 'environment', 'stack']), 12, 5)
    b.add(timeseries('Answer time of each check', [('probe_duration_seconds{job="blackbox-http"}', '{{instance}}')], unit='s', legend='list'), 8, 5)

    b.row('MySQL')
    b.add(stat('MySQL', 'mysql_up', mappings=[{'type': 'value', 'options': {'0': {'text': 'DOWN', 'color': RED}, '1': {'text': 'UP', 'color': GREEN}}}],
               thresholds=steps((None, RED), (1, GREEN)), spark=False, color_mode='background'), 3, 4)
    b.add(stat('Uptime', 'mysql_global_status_uptime', unit='s', spark=False), 3, 4)
    b.add(gauge('Connections used', 'mysql_global_status_threads_connected / mysql_global_variables_max_connections', desc='Open connections as a share of max_connections.',
                thresholds=steps((None, GREEN), (0.6, YELLOW), (0.8, RED))), 4, 4)
    b.add(stat('Queries / second', 'rate(mysql_global_status_questions[%s])' % R, unit='ops', decimals=1), 4, 4)
    b.add(stat('Slow queries / second', 'rate(mysql_global_status_slow_queries[%s])' % R, unit='ops', decimals=2, thresholds=steps((None, GREEN), (0.05, YELLOW), (0.1, RED))), 5, 4)
    b.add(stat('Buffer pool hit ratio', '1 - (rate(mysql_global_status_innodb_buffer_pool_reads[%s]) / rate(mysql_global_status_innodb_buffer_pool_read_requests[%s]))' % (R, R),
               unit='percentunit', decimals=2, thresholds=steps((None, RED), (0.9, YELLOW), (0.99, GREEN)), desc='Share of reads served from memory. Below 99% the buffer pool may be too small.'), 5, 4)
    b.add(timeseries('Connections', [('mysql_global_status_threads_connected', 'connected'), ('mysql_global_status_threads_running', 'running'),
                                     ('mysql_global_status_max_used_connections', 'highest ever'), ('mysql_global_variables_max_connections', 'limit')], legend_calcs=('lastNotNull', 'max')), 8, 7)
    b.add(timeseries('Statements per second by type', [('sum by (command) (rate(mysql_global_status_commands_total{command=~"select|insert|update|delete"}[%s]))' % R, '{{command}}')],
                     unit='ops', stack=True), 8, 7)
    b.add(timeseries('Network traffic', [('rate(mysql_global_status_bytes_received[%s])' % R, 'received'), ('rate(mysql_global_status_bytes_sent[%s])' % R, 'sent')], unit='Bps'), 8, 7)
    b.add(timeseries('Aborted connections and failed logins', [('rate(mysql_global_status_aborted_connects[%s])' % R, 'aborted connects (failed login)'),
                                                               ('rate(mysql_global_status_aborted_clients[%s])' % R, 'aborted clients (dropped)')], unit='ops'), 8, 6)
    b.add(timeseries('Row locks and temporary tables on disk', [('rate(mysql_global_status_innodb_row_lock_waits[%s])' % R, 'row lock waits'),
                                                                ('rate(mysql_global_status_created_tmp_disk_tables[%s])' % R, 'tmp tables on disk')], unit='ops'), 8, 6)
    b.add(timeseries('InnoDB buffer pool reads from disk', [('rate(mysql_global_status_innodb_buffer_pool_reads[%s])' % R, 'disk reads / s')], unit='ops', legend='list'), 8, 6)

    b.row('Redis')
    b.add(stat('Redis', 'redis_up', mappings=[{'type': 'value', 'options': {'0': {'text': 'DOWN', 'color': RED}, '1': {'text': 'UP', 'color': GREEN}}}],
               thresholds=steps((None, RED), (1, GREEN)), spark=False, color_mode='background'), 3, 4)
    b.add(stat('Uptime', 'redis_uptime_in_seconds', unit='s', spark=False), 3, 4)
    b.add(stat('Connected clients', 'redis_connected_clients', decimals=0), 4, 4)
    b.add(gauge('Memory used', 'redis_memory_used_bytes / redis_memory_max_bytes', desc='Share of REDIS_MAXMEMORY in use.', thresholds=steps((None, GREEN), (0.7, YELLOW), (0.9, RED))), 4, 4)
    b.add(stat('Commands / second', 'rate(redis_commands_processed_total[%s])' % R, unit='ops', decimals=1), 5, 4)
    b.add(stat('Cache hit ratio', 'rate(redis_keyspace_hits_total[%s]) / (rate(redis_keyspace_hits_total[%s]) + rate(redis_keyspace_misses_total[%s]))' % (R, R, R),
               unit='percentunit', decimals=1, thresholds=steps((None, RED), (0.5, YELLOW), (0.8, GREEN))), 5, 4)
    b.add(timeseries('Memory', [('redis_memory_used_bytes', 'used'), ('redis_memory_max_bytes', 'limit')], unit='bytes', legend_calcs=('lastNotNull', 'max')), 8, 7)
    b.add(timeseries('Commands per second', [('rate(redis_commands_processed_total[%s])' % R, 'commands')], unit='ops', legend='list'), 8, 7)
    b.add(timeseries('Keys', [('sum by (db) (redis_db_keys)', '{{db}} keys'), ('rate(redis_expired_keys_total[%s])' % R, 'expired / s'), ('rate(redis_evicted_keys_total[%s])' % R, 'evicted / s')], legend='list'), 8, 7)
    b.add(timeseries('Network traffic', [('rate(redis_net_input_bytes_total[%s])' % R, 'in'), ('rate(redis_net_output_bytes_total[%s])' % R, 'out')], unit='Bps'), 8, 6)
    b.add(timeseries('Clients: connected, blocked, rejected', [('redis_connected_clients', 'connected'), ('redis_blocked_clients', 'blocked'),
                                                               ('increase(redis_rejected_connections_total[%s])' % R, 'rejected')]), 8, 6)
    b.add(timeseries('Time per command type (top 6)', [('topk(6, rate(redis_commands_duration_seconds_total[%s]) / rate(redis_commands_total[%s]))' % (R, R), '{{cmd}}')], unit='s', legend='list'), 8, 6)

    b.row('OpenSearch')
    b.add(stat('Cluster status', 'max(elasticsearch_cluster_health_status{color="green"}) * 2 + max(elasticsearch_cluster_health_status{color="yellow"}) * 1',
               mappings=[{'type': 'value', 'options': {'0': {'text': 'RED', 'color': RED}, '1': {'text': 'YELLOW', 'color': YELLOW}, '2': {'text': 'GREEN', 'color': GREEN}}}],
               thresholds=steps((None, RED), (1, YELLOW), (2, GREEN)), spark=False, color_mode='background',
               desc='GREEN = all shards allocated, YELLOW = replicas missing (normal on one node with replicas), RED = data missing.'), 4, 4)
    b.add(stat('Nodes', 'elasticsearch_cluster_health_number_of_nodes', decimals=0, spark=False), 3, 4)
    b.add(stat('Active shards', 'elasticsearch_cluster_health_active_shards', decimals=0, spark=False), 3, 4)
    b.add(stat('Topics in the index', 'sum(elasticsearch_indices_docs_total{index="jsl-topics"})', decimals=0, spark=False), 4, 4)
    b.add(gauge('JVM heap used', 'sum(elasticsearch_jvm_memory_used_bytes{area="heap"}) / sum(elasticsearch_jvm_memory_max_bytes{area="heap"})', thresholds=steps((None, GREEN), (0.7, YELLOW), (0.9, RED))), 5, 4)
    b.add(stat('Index size', 'sum(elasticsearch_indices_store_size_bytes)', unit='bytes', spark=False), 5, 4)
    b.add(timeseries('Searches per second', [('rate(elasticsearch_indices_search_query_total[%s])' % R, 'queries')], unit='ops', legend='list'), 8, 6)
    b.add(timeseries('Average search time', [('rate(elasticsearch_indices_search_query_time_seconds[%s]) / rate(elasticsearch_indices_search_query_total[%s])' % (R, R), 'per query')], unit='s', legend='list'), 8, 6)
    b.add(timeseries('JVM heap', [('sum(elasticsearch_jvm_memory_used_bytes{area="heap"})', 'used'), ('sum(elasticsearch_jvm_memory_max_bytes{area="heap"})', 'max')], unit='bytes'), 8, 6)

    b.row('The monitoring stack itself')
    b.add(table('Is every target being scraped?', [('up', '')], rename={'job': 'Job', 'instance': 'Target', 'Value': 'Up (1=yes)'},
                exclude=['Time', '__name__', 'environment', 'stack', 'application']), 12, 8)
    b.add(timeseries('Prometheus: stored series and samples per second', [('prometheus_tsdb_head_series', 'series in memory'),
                                                                          ('rate(prometheus_tsdb_head_samples_appended_total[%s])' % R, 'samples / s')], legend_calcs=('lastNotNull',)), 6, 8)
    b.add(timeseries('Scrape duration by job', [('avg by (job) (scrape_duration_seconds)', '{{job}}')], unit='s', legend='list'), 6, 8)
    return b


# ==============================================================================================================================
#  4. LOGS & TRACES
# ==============================================================================================================================
def logs_traces():
    b = Board('jsl-logs-traces', 'JavaSchoolLab - Logs and traces',
              'Search the application logs, find slow or failing requests as traces, and jump from a log line to its trace (and back). '
              'In production the application writes one JSON object per log line, with the traceId of the request.',
              ['javaschoollab', 'logs', 'traces', 'loki', 'tempo'],
              variables=[var_custom('level', 'Log level', ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'], 'All'), var_text('search', 'Search text')],
              time_from='now-1h')

    # The JSON encoder writes "/" as "\/" inside the line, so a plain text filter would never find a path like /api/auth/login.
    # "| json" decodes the line first and the filter then runs on the real message text (case-insensitive).
    app = '{container="javaschoollab-app", level=~"$level"} | json | message=~"(?i).*$search.*"'
    b.row('Application logs')
    b.add(loki_series('Application log lines by level', 'sum by (level) (count_over_time({container="javaschoollab-app"} [$__interval]))',
                      desc='Click a bar to zoom. ERROR bars need attention.'), 16, 7)
    b.add({'type': 'stat', 'title': 'Errors in the selected range', 'datasource': LOKI,
           'targets': [{'datasource': LOKI, 'expr': 'sum(count_over_time({container="javaschoollab-app", level="ERROR"} [$__range]))', 'queryType': 'instant', 'refId': 'A'}],
           'fieldConfig': {'defaults': {'unit': 'short', 'decimals': 0, 'color': {'mode': 'thresholds'}, 'thresholds': {'mode': 'absolute', 'steps': steps((None, GREEN), (1, ORANGE), (20, RED))}}, 'overrides': []},
           'options': {'reduceOptions': {'calcs': ['lastNotNull'], 'fields': '', 'values': False}, 'colorMode': 'background', 'graphMode': 'none', 'textMode': 'auto'}}, 4, 7)
    b.add({'type': 'stat', 'title': 'Warnings in the selected range', 'datasource': LOKI,
           'targets': [{'datasource': LOKI, 'expr': 'sum(count_over_time({container="javaschoollab-app", level="WARN"} [$__range]))', 'queryType': 'instant', 'refId': 'A'}],
           'fieldConfig': {'defaults': {'unit': 'short', 'decimals': 0, 'color': {'mode': 'thresholds'}, 'thresholds': {'mode': 'absolute', 'steps': steps((None, GREEN), (1, YELLOW), (100, ORANGE))}}, 'overrides': []},
           'options': {'reduceOptions': {'calcs': ['lastNotNull'], 'fields': '', 'values': False}, 'colorMode': 'background', 'graphMode': 'none', 'textMode': 'auto'}}, 4, 7)
    b.add(logs('Application logs (use the Log level and Search text filters above)', app,
               desc='Expand a line, then use "View trace" on the traceId to open the whole request in Tempo.'), 24, 14)

    b.row('All containers')
    b.add(loki_series('Log lines per container', 'sum by (container) (count_over_time({compose_project=~"javaschoollab.*"} [$__interval]))', legend='{{container}}'), 12, 7)
    b.add(logs('Warnings and errors from every container', '{compose_project=~"javaschoollab.*"} |~ "(?i)(error|exception|fatal|warn)" | container != "javaschoollab-alloy"'), 12, 7)

    b.row('Traces (Tempo)')
    b.add(trace_table('Latest traces of the application', '{ resource.service.name = "javaschoollab" }', desc='Click a trace id to see every step of that request.'), 12, 9)
    b.add(trace_table('Slow requests (longer than 500 ms)', '{ resource.service.name = "javaschoollab" && duration > 500ms }'), 12, 9)
    b.add(trace_table('Failed requests', '{ resource.service.name = "javaschoollab" && status = error }'), 12, 9)
    b.add(trace_table('Slow SQL (longer than 200 ms)', '{ resource.service.name = "javaschoollab" && name =~ "query.*" && duration > 200ms }',
                      desc='Spans created for every SQL statement by the JDBC observation.'), 12, 9)
    b.add(node_graph('Service map', desc='Built from the span metrics Tempo writes to Prometheus: the application and the databases it calls.'), 24, 10)
    return b


# ==============================================================================================================================
#  5. ALERTS & SLO
# ==============================================================================================================================
def alerts_slo():
    b = Board('jsl-alerts-slo', 'JavaSchoolLab - Alerts and service level objective',
              'What is alerting right now, and how much of the error budget is left. SLO: 99.5% of requests must not end in a server error (5xx).',
              ['javaschoollab', 'alerts', 'slo'], time_from='now-24h')
    err = 'sum(increase(%s[$__range]))' % http('count', 'status=~"5.."', uri=False)
    tot = 'sum(increase(%s[$__range]))' % http('count', uri=False)
    b.row('Alerts')
    b.add(stat('Critical alerts firing', 'count(ALERTS{alertstate="firing",severity="critical"}) or vector(0)', decimals=0, spark=False, color_mode='background',
               thresholds=steps((None, GREEN), (1, RED))), 4, 4)
    b.add(stat('Warnings firing', 'count(ALERTS{alertstate="firing",severity="warning"}) or vector(0)', decimals=0, spark=False, color_mode='background',
               thresholds=steps((None, GREEN), (1, YELLOW))), 4, 4)
    b.add(stat('Pending (about to fire)', 'count(ALERTS{alertstate="pending"}) or vector(0)', decimals=0, spark=False), 4, 4)
    b.add(stat('Rules loaded (alert + recording)', 'sum(prometheus_rule_group_rules)', decimals=0, spark=False), 4, 4)
    b.add(stat('Alertmanager', 'up{job="alertmanager"}', spark=False, color_mode='background',
               mappings=[{'type': 'value', 'options': {'0': {'text': 'DOWN', 'color': RED}, '1': {'text': 'UP', 'color': GREEN}}}], thresholds=steps((None, RED), (1, GREEN))), 4, 4)
    b.add(stat('Alerts sent in range', 'sum(increase(alertmanager_notifications_total[$__range])) or vector(0)', decimals=0, spark=False), 4, 4)
    b.add(table('Firing and pending alerts', [('ALERTS{alertstate=~"firing|pending"}', '')],
                rename={'alertname': 'Alert', 'severity': 'Severity', 'alertstate': 'State', 'instance': 'Target'},
                exclude=['Time', 'Value', '__name__', 'job', 'environment', 'stack']), 24, 6)
    b.add(alert_list('Alert list (Prometheus rules)', 'All alert rules and their current state.'), 24, 9)

    b.row('Service level objective: 99.5% of requests without a 5xx')
    b.add(stat('Availability in the selected range', '1 - ((%s or vector(0)) / %s)' % (err, tot), unit='percentunit', decimals=3, spark=False, color_mode='background',
               thresholds=steps((None, RED), (0.99, ORANGE), (0.995, GREEN)), desc='Share of requests that did NOT end in a server error. Target 99.5%.'), 6, 5)
    b.add(stat('Error budget left', '1 - (((%s or vector(0)) / %s) / 0.005)' % (err, tot), unit='percentunit', decimals=1, spark=False, color_mode='background',
               thresholds=steps((None, RED), (0.1, ORANGE), (0.5, GREEN)), desc='The budget is 0.5% of requests. 100% = no error used, 0% = all used.'), 6, 5)
    b.add(stat('Requests in the range', tot, decimals=0, spark=False), 6, 5)
    b.add(stat('Server errors in the range', '%s or vector(0)' % err, decimals=0, spark=False, thresholds=steps((None, GREEN), (1, ORANGE))), 6, 5)
    b.add(timeseries('Error budget burn rate (1 = using the budget exactly as fast as it refills)', [
        ('jsl:http_error_ratio:rate1h / 0.005', '1 hour'), ('jsl:http_error_ratio:rate6h / 0.005', '6 hours'), ('jsl:http_error_ratio:rate30m / 0.005', '30 minutes')],
        desc='Above 14.4 for an hour pages (critical); above 6 for 6 hours warns.', thresholds=steps((None, GREEN), (6, ORANGE), (14.4, RED)), legend_calcs=('lastNotNull', 'max')), 12, 8)
    b.add(timeseries('Share of requests answered within 300 ms', [('jsl:http_fast_ratio:rate5m', '<= 300 ms')], unit='percentunit', min_=0, max_=1, legend='list'), 12, 8)
    b.add(timeseries('Latency percentiles (recorded rules)', [('jsl:http_request_duration_seconds:p50_5m', 'p50'), ('jsl:http_request_duration_seconds:p95_5m', 'p95'),
                                                              ('jsl:http_request_duration_seconds:p99_5m', 'p99')], unit='s'), 12, 7)
    b.add(timeseries('Requests and server errors per second (recorded rules)', [('jsl:http_requests:rate5m', 'requests / s'), ('jsl:http_requests_5xx:rate5m', '5xx / s')], unit='reqps'), 12, 7)
    return b


# ==============================================================================================================================
#  6. SERVER, CONTAINERS AND BACKUPS
# ==============================================================================================================================
def server():
    b = Board('jsl-server', 'JavaSchoolLab - Server, containers and backups',
              'The machine everything runs on (CPU, memory, disk, load, network), every container (CPU, memory, restarts) and the freshness of the nightly backups.',
              ['javaschoollab', 'server', 'containers', 'backup'])
    cores = 'count(count by (cpu) (node_cpu_seconds_total))'
    root = 'mountpoint="/"'
    ctr = 'name=~"javaschoollab-.+"'

    b.row('Server')
    b.add(stat('CPU in use', '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[%s])) * 100)' % R, unit='percent', decimals=0,
               thresholds=steps((None, GREEN), (70, YELLOW), (90, RED))), 4, 4)
    b.add(stat('Memory in use', '100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)', unit='percent', decimals=0,
               thresholds=steps((None, GREEN), (75, YELLOW), (90, RED))), 4, 4)
    b.add(stat('Disk in use (/)', '100 * (1 - node_filesystem_avail_bytes{%s} / node_filesystem_size_bytes{%s})' % (root, root), unit='percent', decimals=0,
               thresholds=steps((None, GREEN), (70, YELLOW), (85, RED)), desc='Alerts at 85% (warning) and 95% (critical).'), 4, 4)
    b.add(stat('Load (1 min)', 'node_load1', decimals=2, desc='Compare with the number of CPU cores.', thresholds=steps((None, GREEN), (2, YELLOW), (4, RED))), 4, 4)
    b.add(stat('CPU cores', cores, decimals=0, spark=False), 4, 4)
    b.add(stat('Server uptime', 'time() - node_boot_time_seconds', unit='s', spark=False), 4, 4)
    b.add(timeseries('CPU by activity', [('sum by (mode) (rate(node_cpu_seconds_total{mode!="idle"}[%s])) / %s' % (R, cores), '{{mode}}')], unit='percentunit', stack=True, max_=1), 8, 7)
    b.add(timeseries('Memory', [('node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes', 'used'), ('node_memory_Cached_bytes', 'cache'),
                                ('node_memory_MemAvailable_bytes', 'available'), ('node_memory_SwapTotal_bytes - node_memory_SwapFree_bytes', 'swap used')], unit='bytes'), 8, 7)
    b.add(timeseries('Disk space used (/)', [('100 * (1 - node_filesystem_avail_bytes{%s} / node_filesystem_size_bytes{%s})' % (root, root), 'used %')], unit='percent', min_=0, max_=100,
                     thresholds=steps((None, GREEN), (85, RED)), legend='list'), 8, 7)
    b.add(timeseries('Load average', [('node_load1', '1 min'), ('node_load5', '5 min'), ('node_load15', '15 min')]), 8, 6)
    b.add(timeseries('Disk throughput', [('sum(rate(node_disk_read_bytes_total[%s]))' % R, 'read'), ('sum(rate(node_disk_written_bytes_total[%s]))' % R, 'write')], unit='Bps'), 8, 6)
    b.add(timeseries('Network traffic (all interfaces)', [('sum(rate(node_network_receive_bytes_total{device!~"lo|veth.*"}[%s]))' % R, 'received'),
                                                          ('sum(rate(node_network_transmit_bytes_total{device!~"lo|veth.*"}[%s]))' % R, 'sent')], unit='Bps'), 8, 6)

    b.row('Containers')
    b.add(stat('Containers running', 'count(container_memory_working_set_bytes{%s,image!=""})' % ctr, decimals=0, spark=False), 4, 5)
    b.add(timeseries('CPU per container (cores)', [('sum by (name) (rate(container_cpu_usage_seconds_total{%s}[%s]))' % (ctr, R), '{{name}}')], unit='short', legend='list', stack=True), 10, 8)
    b.add(timeseries('Memory per container', [('sum by (name) (container_memory_working_set_bytes{%s})' % ctr, '{{name}}')], unit='bytes', legend='list', stack=True), 10, 8)
    b.add(bargauge('Memory used compared with the container limit', [
        ('sum by (name) (container_memory_working_set_bytes{%s}) / (sum by (name) (container_spec_memory_limit_bytes{%s}) > 0)' % (ctr, ctr), '{{name}}')],
        unit='percentunit', max_=1, thresholds=steps((None, GREEN), (0.7, YELLOW), (0.9, RED)), desc='A container is killed when it reaches 100%.'), 12, 8)
    b.add(table('Restarts in the selected range', [('sum by (name) (changes(container_start_time_seconds{%s}[$__range]))' % ctr, '')],
                rename={'name': 'Container', 'Value': 'Restarts'}, exclude=['Time'], sort_by='Restarts'), 6, 8)
    b.add(timeseries('Network per container', [('sum by (name) (rate(container_network_receive_bytes_total{%s}[%s]))' % (ctr, R), '{{name}} in'),
                                               ('sum by (name) (rate(container_network_transmit_bytes_total{%s}[%s]))' % (ctr, R), '{{name}} out')], unit='Bps', legend='list'), 12, 7)

    b.row('Backups (written by the backup scripts, read through node-exporter)')
    ok = {'type': 'value', 'options': {'0': {'text': 'FAILED', 'color': RED}, '1': {'text': 'OK', 'color': GREEN}}}
    b.add(stat('Database: last good backup', 'time() - jsl_backup_last_success_timestamp_seconds{kind="database"}', unit='s', spark=False, color_mode='background',
               thresholds=steps((None, GREEN), (93600, RED)), desc='How long ago. The nightly backup runs at 00:00; alert after 26 hours.'), 6, 5)
    b.add(stat('Database: last run', 'jsl_backup_last_run_success{kind="database"}', spark=False, color_mode='background', mappings=[ok],
               thresholds=steps((None, RED), (1, GREEN))), 3, 5)
    b.add(stat('Database: backups kept', 'jsl_backup_files{kind="database"}', decimals=0, spark=False, desc='Newest 3 are kept.'), 3, 5)
    b.add(stat('Database: newest size', 'jsl_backup_last_size_bytes{kind="database"}', unit='bytes', spark=False), 4, 5)
    b.add(stat('Images: last good backup', 'time() - jsl_backup_last_success_timestamp_seconds{kind="images"}', unit='s', spark=False, color_mode='background',
               thresholds=steps((None, GREEN), (93600, RED))), 5, 5)
    b.add(stat('Images: last run', 'jsl_backup_last_run_success{kind="images"}', spark=False, color_mode='background', mappings=[ok], thresholds=steps((None, RED), (1, GREEN))), 3, 5)
    return b


if __name__ == '__main__':
    for fname, board in (('javaschoollab-overview.json', overview()), ('javaschoollab-runtime.json', runtime()),
                         ('javaschoollab-infrastructure.json', infrastructure()), ('javaschoollab-server.json', server()), ('javaschoollab-logs-traces.json', logs_traces()),
                         ('javaschoollab-alerts-slo.json', alerts_slo())):
        board.write(fname)
        panels = [p for p in board.panels if p['type'] != 'row']
        print(f'{fname}: {len(panels)} panels')
