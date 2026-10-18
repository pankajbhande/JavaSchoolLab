// Module 25 (Networking): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m25a: Record<string, DeepDive> = {
    'HTTP Fundamentals': dd(
        [`<b>HTTP</b> is a text-based request/response protocol on top of TCP. A client sends a method (GET, POST...), a path, headers and an optional body; the server answers with a status code, headers and a body. It is stateless: each request stands alone.`,
            r`# A raw HTTP/1.1 request and response are just text lines
request = (
    "GET /hello HTTP/1.1\r\n"                # method, path, version
    "Host: example.com\r\n"                  # required header in HTTP/1.1
    "Accept: text/plain\r\n"
    "\r\n"                                   # blank line ends the headers
)
response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 5\r\n\r\nhello"

print(request.splitlines()[0])
print(response.split("\r\n")[0])

# OUTPUT:
# GET /hello HTTP/1.1
# HTTP/1.1 200 OK`],
        [`Everything on the web, every REST API and most microservice traffic speaks HTTP. Understanding methods, status codes and headers is needed to debug any client or server.`,
            r`from http import HTTPStatus

for code in (200, 201, 301, 404, 500):
    s = HTTPStatus(code)
    print(code, s.phrase, "-", s.description[:34])

# Families: 1xx info | 2xx success | 3xx redirect | 4xx client error | 5xx server error

# OUTPUT:
# 200 OK - Request fulfilled, document follows
# 201 Created - Document created, URL follows
# 301 Moved Permanently - Object moved permanently -- see URI list
# 404 Not Found - Nothing matches the given URI
# 500 Internal Server Error - Server got itself in trouble`],
        [`Real use: browsers loading pages, mobile apps calling APIs, webhooks from payment providers, health checks from load balancers. Here is a minimal real server and a stdlib client.`,
            r`import threading, urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"hello"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def log_message(self, *a): pass         # silence request logging

srv = HTTPServer(("127.0.0.1", 0), H)        # port 0 = pick a free port
threading.Thread(target=srv.serve_forever, daemon=True).start()

with urllib.request.urlopen(f"http://127.0.0.1:{srv.server_port}/") as resp:
    print(resp.status, resp.headers["Content-Type"], resp.read())
srv.shutdown()

# OUTPUT:
# 200 text/plain b'hello'`],
        [`<b>Advantages:</b> simple, human-readable, universal tooling (curl, browsers, proxies, CDNs), cacheable, firewall friendly, scales horizontally because requests are stateless.`,
            r`# Idempotent methods (GET, PUT, DELETE) are safe to retry; POST is not.
SAFE_TO_RETRY = {"GET", "HEAD", "PUT", "DELETE", "OPTIONS"}

def should_retry(method, status):
    return method in SAFE_TO_RETRY and status in (502, 503, 504)

print(should_retry("GET", 503))
print(should_retry("POST", 503))

# OUTPUT:
# True
# False`],
        [`<b>Disadvantages:</b> text headers repeat on each request (overhead), plain HTTP is readable by anyone on the network, and request/response only (server cannot push unprompted without extra tech).`,
            r`# Headers are re-sent every time: measure the overhead for a tiny payload
headers = (
    "GET /api/ping HTTP/1.1\r\nHost: api.example.com\r\n"
    "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36\r\n"
    "Accept: application/json\r\nAccept-Encoding: gzip, deflate, br\r\n"
    "Authorization: Bearer eyJhbGciOi...\r\n\r\n"
)
body = '{"ok":true}'
print(f"header bytes {len(headers)} vs body bytes {len(body)}")

# OUTPUT (example):
# header bytes 232 vs body bytes 11`],
        [`<b>Limitations:</b> stateless means sessions need cookies or tokens, large uploads need chunking, HTTP/1.1 has head-of-line blocking per connection, and a fixed request-then-response order.`,
            r`import urllib.request, urllib.error

try:
    urllib.request.urlopen("http://127.0.0.1:9/", timeout=1)   # nothing listens on port 9
except urllib.error.URLError as e:
    print("network errors are not HTTP statuses:", type(e.reason).__name__)

# OUTPUT (example):
# network errors are not HTTP statuses: ConnectionRefusedError`],
        `
   Client                                       Server
     │ ── GET /users/7 HTTP/1.1 ─────────────►   │
     │    Host, Accept, Authorization            │
     │ ◄───────── 200 OK ────────────────────── │
     │    Content-Type: application/json         │
     │    {"id": 7, "name": "Abaji"}             │
   (new request = new, independent conversation)
`,
        `Design APIs around HTTP semantics (correct verbs, status codes, caching headers, idempotency keys for POST) so proxies, CDNs and retries work for free. Always use TLS, set timeouts and consider HTTP/2 or HTTP/3 for many small requests. For bidirectional streaming prefer WebSockets or gRPC.`
    ),

    'TCP/IP Basics': dd(
        [`<b>IP</b> routes packets between machines using addresses; <b>TCP</b> sits on top and gives a reliable, ordered byte stream between two ports (handshake, retransmission, flow control). <b>UDP</b> is the lightweight, unreliable alternative.`,
            r`import ipaddress

ip = ipaddress.ip_address("192.168.1.25")
net = ipaddress.ip_network("192.168.1.0/24")
print("version:", ip.version, "| private:", ip.is_private)
print("in network:", ip in net, "| hosts:", net.num_addresses - 2)

# OUTPUT:
# version: 4 | private: True
# in network: True | hosts: 254`],
        [`Applications cannot send data directly over wires. The stack splits responsibilities: IP finds the machine, TCP ensures complete in-order delivery, ports select the program. Developers need this model to reason about timeouts, connection limits and firewalls.`,
            r`import socket

# A "socket address" is (IP, port). Well-known ports identify services.
for name in ("http", "https", "ssh", "smtp"):
    print(f"{name:6} -> port {socket.getservbyname(name)}")

# OUTPUT:
# http   -> port 80
# https  -> port 443
# ssh    -> port 22
# smtp   -> port 25`],
        [`Real use: DNS lookups before every connection, load balancers working at TCP level, health probes checking whether a port is open, and tuning TCP options (keep-alive, Nagle) for latency.`,
            r`import socket

def port_open(host, port, timeout=0.5):
    try:
        with socket.create_connection((host, port), timeout=timeout):   # TCP handshake
            return True
    except OSError:
        return False

srv = socket.socket(); srv.bind(("127.0.0.1", 0)); srv.listen()
port = srv.getsockname()[1]
print("listening port open:", port_open("127.0.0.1", port))
srv.close()
print("closed port open   :", port_open("127.0.0.1", port))

# OUTPUT:
# listening port open: True
# closed port open   : False`],
        [`<b>Advantages of TCP:</b> reliable delivery, ordering, congestion control, works everywhere. Advantages of UDP: no handshake, low latency, broadcast, ideal for DNS, video, games.`,
            r`import socket

# UDP: no connection, just datagrams (may be lost in real networks)
rx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); rx.bind(("127.0.0.1", 0))
tx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
tx.sendto(b"ping", rx.getsockname())         # fire and forget
data, addr = rx.recvfrom(1024)
print(data, "from", addr[0])
rx.close(); tx.close()

# OUTPUT:
# b'ping' from 127.0.0.1`],
        [`<b>Disadvantages:</b> TCP handshake adds a round trip, head-of-line blocking on loss, and no message boundaries (a byte stream, so you must frame messages yourself). UDP offers no reliability.`,
            r`import socket

a, b = socket.socketpair()                   # connected pair of stream sockets
a.sendall(b"hello"); a.sendall(b"world")     # two sends ...
print(b.recv(100))                           # ... may arrive merged: no message boundaries
a.close(); b.close()

# OUTPUT (example - usually merged):
# b'helloworld'`],
        [`<b>Limitations:</b> a port range of 65535 per IP caps simultaneous outgoing connections to one destination, TIME_WAIT sockets linger, and NAT/firewalls can silently drop idle connections.`,
            r`import socket

s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)   # probe idle connections
print("keepalive on:", bool(s.getsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE)))
try:
    socket.create_connection(("10.255.255.1", 80), timeout=0.3)   # unroutable address
except OSError as e:
    print("no route/timeout:", type(e).__name__)
s.close()

# OUTPUT (example):
# keepalive on: True
# no route/timeout: TimeoutError`],
        `
   Application   HTTP, SMTP, your protocol
   Transport     TCP (reliable stream) | UDP (datagrams)     ports: 0-65535
   Internet      IP  (addresses, routing)                     192.168.1.25
   Link          Ethernet / Wi-Fi (frames, MAC)

   TCP handshake:  SYN ──► ; ◄── SYN-ACK ; ACK ──►   then data flows both ways
`,
        `Most application designs should stay at HTTP or higher, but know the transport underneath: connection reuse (keep-alive, pooling) removes handshake cost, timeouts must be set at connect and read level, and framing is your job on raw TCP. Choose UDP/QUIC only when you can tolerate or handle loss yourself.`
    ),

    'Sockets & the socket Module': dd(
        [`A <b>socket</b> is the programming handle for one end of a network connection. The <code>socket</code> module exposes the BSD socket API: <code>bind</code>, <code>listen</code>, <code>accept</code>, <code>connect</code>, <code>send</code>, <code>recv</code>.`,
            r`import socket, threading

srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)   # IPv4 + TCP
srv.bind(("127.0.0.1", 0)); srv.listen()
port = srv.getsockname()[1]

def serve():
    conn, _ = srv.accept()                   # blocks until a client connects
    conn.sendall(conn.recv(1024).upper())    # echo back in upper case
    conn.close()
threading.Thread(target=serve, daemon=True).start()

with socket.create_connection(("127.0.0.1", port)) as c:
    c.sendall(b"hello socket")
    print(c.recv(1024))
srv.close()

# OUTPUT:
# b'HELLO SOCKET'`],
        [`Frameworks and HTTP libraries are built on sockets. When you need a custom protocol, a game server, an IoT link or to understand a failing connection, you need socket-level control.`,
            r`import socket

# Name resolution is the first socket step of every connection
print(socket.gethostbyname("localhost"))
info = socket.getaddrinfo("localhost", 80, socket.AF_INET, socket.SOCK_STREAM)
print(info[0][4])                            # (ip, port) tuple ready for connect()

# OUTPUT:
# 127.0.0.1
# ('127.0.0.1', 80)`],
        [`Real use: custom TCP protocols (line-based commands), service health checks, proxies, port scanners, chat servers, and test doubles for network clients. Message framing with a length prefix is the standard pattern.`,
            r`import socket, struct

def send_msg(sock, payload: bytes):
    sock.sendall(struct.pack("!I", len(payload)) + payload)   # 4-byte length prefix

def recv_exact(sock, n):
    buf = b""
    while len(buf) < n:                      # recv may return fewer bytes than asked
        chunk = sock.recv(n - len(buf))
        if not chunk: raise ConnectionError("closed early")
        buf += chunk
    return buf

def recv_msg(sock):
    (n,) = struct.unpack("!I", recv_exact(sock, 4))
    return recv_exact(sock, n)

a, b = socket.socketpair()
send_msg(a, b"first"); send_msg(a, b"second message")
print(recv_msg(b), recv_msg(b))

# OUTPUT:
# b'first' b'second message'`],
        [`<b>Advantages:</b> total control and the lowest overhead, works for any protocol, portable across operating systems, included in the standard library.`,
            r`import socket

with socket.socket() as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)   # restart server quickly
    s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)   # disable Nagle: lower latency
    s.settimeout(2.0)                                         # never block forever
    print("timeout:", s.gettimeout())

# OUTPUT:
# timeout: 2.0`],
        [`<b>Disadvantages:</b> low level - you handle framing, partial reads, timeouts, reconnection, encoding, security and concurrency yourself. The blocking accept/recv model needs one thread per client.`,
            r`import socket

a, b = socket.socketpair()
a.sendall(b"x" * 10)
data = b.recv(4)                             # asked for 4, got 4: the rest is still queued
print(len(data), "bytes now; remaining is NOT lost, but recv never promises a full message")
b.settimeout(0.2)
b.recv(100)                                  # drain
try: b.recv(1)
except socket.timeout: print("recv blocks/times out when no data")

# OUTPUT:
# 4 bytes now; remaining is NOT lost, but recv never promises a full message
# recv blocks/times out when no data`],
        [`<b>Limitations:</b> no built-in encryption (wrap with <code>ssl</code>), blocking sockets do not scale to thousands of clients (use selectors/asyncio), and a closed peer shows only as empty bytes or an error.`,
            r`import socket

a, b = socket.socketpair()
a.close()                                    # peer hangs up
print("recv after close ->", b.recv(10))     # b'' means orderly shutdown
try:
    b.sendall(b"x"); b.sendall(b"y")         # writing to a closed peer
except OSError as e:
    print("send failed:", type(e).__name__)

# OUTPUT (example):
# recv after close -> b''
# send failed: BrokenPipeError`],
        `
   SERVER                                CLIENT
   socket()                              socket()
   bind((ip, port))
   listen()
   accept()  ◄══ TCP handshake ══════►   connect((ip, port))
   recv() ◄───── data ───────────────    send()
   send() ─────── reply ────────────►    recv()
   close()                               close()
`,
        `Use raw sockets for protocols and learning, not for ordinary web work. For many clients choose asyncio streams or selectors over thread-per-connection; wrap in TLS; define explicit framing, versioning and timeouts. Prefer established protocols (HTTP, gRPC, MQTT) instead of inventing one.`
    ),

    'HTTP Clients with requests': dd(
        [`<b>requests</b> (<code>pip install requests</code>) is the most popular synchronous HTTP client: <code>requests.get(url)</code> returns a Response with <code>status_code</code>, <code>headers</code>, <code>text</code> and <code>json()</code>.`,
            r`import threading, json, requests
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):             # tiny local API so the demo is offline
    def do_GET(self):
        body = json.dumps({"name": "Abaji", "q": self.path}).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self, *a): pass

srv = HTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_port}"

resp = requests.get(BASE + "/users", params={"page": 2}, timeout=5)
print(resp.status_code, resp.json())
srv.shutdown()

# OUTPUT:
# 200 {'name': 'Abaji', 'q': '/users?page=2'}`],
        [`The standard <code>urllib</code> works but is verbose. requests gives a human API: automatic query encoding, JSON, cookies, sessions, redirects, file upload and sensible defaults.`,
            r`import requests

# Compare: building a URL and body safely by hand vs the library
req = requests.Request("POST", "http://example.com/api", params={"q": "a b&c"},
                       json={"x": 1}, headers={"X-Id": "7"}).prepare()
print(req.url)                               # encoded for you
print(req.headers["Content-Type"], req.body)

# OUTPUT:
# http://example.com/api?q=a+b%26c
# application/json b'{"x": 1}'`],
        [`Real use: calling payment/SMS/maps APIs, scraping pages, CI scripts, microservice calls from sync frameworks (Flask, Django), uploading files, authenticated sessions with retry logic.`,
            r`import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()                 # reuses TCP connections (keep-alive)
session.headers.update({"User-Agent": "my-app/1.0"})
retry = Retry(total=3, backoff_factor=0.5, status_forcelist=[502, 503, 504])
session.mount("https://", HTTPAdapter(max_retries=retry))   # automatic retries

print(session.headers["User-Agent"])
print(session.get_adapter("https://x.com").max_retries.total)

# OUTPUT:
# my-app/1.0
# 3`],
        [`<b>Advantages:</b> very readable, huge community, Session pooling, built-in JSON, auth helpers, streaming downloads, and works with mocking tools (responses, requests-mock).`,
            r`import requests
from unittest import mock

fake = mock.Mock(status_code=200, json=lambda: {"ok": True})
with mock.patch("requests.get", return_value=fake):          # test without a network
    r_ = requests.get("http://anything")
    print(r_.status_code, r_.json())

# OUTPUT:
# 200 {'ok': True}`],
        [`<b>Disadvantages:</b> synchronous (blocks the thread), no HTTP/2, no async support, and <b>no default timeout</b>: a hung server can block your program forever.`,
            r`import socket, threading, requests

srv = socket.socket(); srv.bind(("127.0.0.1", 0)); srv.listen()   # accepts but never replies
port = srv.getsockname()[1]
try:
    requests.get(f"http://127.0.0.1:{port}/", timeout=0.5)          # ALWAYS pass timeout
except requests.exceptions.ReadTimeout:
    print("ReadTimeout: server never answered")
srv.close()

# OUTPUT:
# ReadTimeout: server never answered`],
        [`<b>Limitations:</b> in maintenance mode (feature-frozen), one blocking call per thread, limited streaming of request bodies, and error handling needs <code>raise_for_status()</code> since 4xx/5xx do not raise by default.`,
            r`import threading, requests
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(404); self.send_header("Content-Length", "0"); self.end_headers()
    def log_message(self, *a): pass
srv = HTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()

resp = requests.get(f"http://127.0.0.1:{srv.server_port}/missing", timeout=5)
print("no exception yet, status", resp.status_code)
try: resp.raise_for_status()                 # turn 4xx/5xx into exceptions
except requests.HTTPError as e: print("HTTPError:", e.response.status_code)
srv.shutdown()

# OUTPUT:
# no exception yet, status 404
# HTTPError: 404`],
        `
   your code ──► requests.Session ──► connection pool ──► TCP/TLS ──► server
        ▲              │ headers, cookies, retries, auth
        └─── Response (status_code, headers, .json(), .text) ◄──────────┘
        (the calling thread BLOCKS until the response arrives)
`,
        `requests is ideal for scripts and sync services. Always set timeouts, use a Session, retry only idempotent calls with backoff, and call raise_for_status. When you need concurrency at scale, HTTP/2 or async frameworks, switch to httpx or aiohttp; the API is nearly identical so migration is cheap.`
    ),

    'httpx & aiohttp': dd(
        [`<b>httpx</b> is a modern client with a requests-like API that supports both sync and async plus HTTP/2. <b>aiohttp</b> is an async-first client AND server framework. Both work with <code>async/await</code> so thousands of requests overlap on one thread.`,
            r`import asyncio, httpx

async def main():
    # MockTransport serves canned responses: the demo needs no network
    transport = httpx.MockTransport(lambda req: httpx.Response(200, json={"path": req.url.path}))
    async with httpx.AsyncClient(transport=transport, base_url="http://api.test") as client:
        r_ = await client.get("/users/7")
        print(r_.status_code, r_.json())

asyncio.run(main())

# OUTPUT:
# 200 {'path': '/users/7'}`],
        [`requests blocks the thread per call, so 100 calls to a 200 ms API take 20 s serially. Async clients fire them concurrently and finish in about 200 ms with the same hardware.`,
            r`import asyncio, time, httpx

async def slow_handler(request):
    await asyncio.sleep(0.2)                 # simulate a 200 ms API
    return httpx.Response(200, json={"id": request.url.path})

async def main():
    client = httpx.AsyncClient(transport=httpx.MockTransport(slow_handler), base_url="http://x")
    t0 = time.perf_counter()
    rs = await asyncio.gather(*(client.get(f"/{i}") for i in range(50)))
    print(len(rs), f"responses in {time.perf_counter() - t0:.1f}s")
    await client.aclose()

asyncio.run(main())

# OUTPUT (example):
# 50 responses in 0.2s`],
        [`Real use: API gateways and aggregators, async FastAPI services calling other services, crawlers, bulk data ingestion. aiohttp is also used to build lightweight servers and websockets.`,
            r`import asyncio
from aiohttp import web, ClientSession

async def hello(request):
    return web.json_response({"hello": request.match_info["name"]})

async def main():
    app = web.Application(); app.add_routes([web.get("/hi/{name}", hello)])
    runner = web.AppRunner(app); await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", 0); await site.start()
    port = site._server.sockets[0].getsockname()[1]
    async with ClientSession() as s:
        async with s.get(f"http://127.0.0.1:{port}/hi/abaji") as resp:
            print(resp.status, await resp.json())
    await runner.cleanup()

asyncio.run(main())

# OUTPUT:
# 200 {'hello': 'abaji'}`],
        [`<b>Advantages:</b> high concurrency, connection pooling, streaming, HTTP/2 (httpx with <code>http2=True</code>), timeouts by default in httpx (5 s), and a sync API in httpx for easy migration from requests.`,
            r`import httpx

c = httpx.Client(transport=httpx.MockTransport(lambda r_: httpx.Response(200, text="sync ok")))
print(c.get("http://t/").text)               # same code style as requests
print(httpx.Timeout(5.0))                    # timeouts enabled by default

# OUTPUT:
# sync ok
# Timeout(timeout=5.0)`],
        [`<b>Disadvantages:</b> async code colours your whole call stack, a blocking call anywhere stalls all requests, and unbounded <code>gather</code> can overwhelm servers or file-descriptor limits.`,
            r`import asyncio, httpx

async def main():
    limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
    async with httpx.AsyncClient(limits=limits) as client:     # pool cap protects you
        print("max connections:", limits.max_connections)
    sem = asyncio.Semaphore(20)                                # plus a task-level cap
    print("semaphore permits:", sem._value)

asyncio.run(main())

# OUTPUT:
# max connections: 20
# semaphore permits: 20`],
        [`<b>Limitations:</b> aiohttp has its own API (not requests-like) and requires a ClientSession per app (not per request); httpx is slower than aiohttp in raw throughput; neither fixes slow servers.`,
            r`import asyncio, aiohttp

async def main():
    # Correct: ONE session reused for many requests (pooling). Creating a session per
    # request wastes connections and triggers an "Unclosed client session" warning.
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as s:
        print("session closed?", s.closed)
    print("session closed?", s.closed)

asyncio.run(main())

# OUTPUT:
# session closed? False
# session closed? True`],
        `
   async def main():                                   one event loop, one thread
     gather( client.get(a), client.get(b), client.get(c) )
        │            │            │
        ▼            ▼            ▼                  all three requests are in flight
     [conn pool: keep-alive sockets] ──► server(s)   while the loop waits, no thread blocked
`,
        `Pick httpx when you want one library for sync and async plus HTTP/2; pick aiohttp when you also need a server or the highest throughput. Share one client per service, bound concurrency with limits and semaphores, set total and per-phase timeouts, and add retries with jitter. Do not go async for a handful of calls.`
    ),

    'Consuming REST APIs': dd(
        [`Consuming a <b>REST API</b> means calling URLs that represent resources (<code>/users/7</code>) with HTTP verbs (GET read, POST create, PUT/PATCH update, DELETE remove) and exchanging JSON. Good clients handle auth, errors, pagination, retries and rate limits.`,
            r`import threading, json, requests
from http.server import BaseHTTPRequestHandler, HTTPServer

USERS = {1: {"id": 1, "name": "Abaji"}}
class API(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        uid = int(self.path.rsplit("/", 1)[1])
        self._send(200, USERS[uid]) if uid in USERS else self._send(404, {"error": "not found"})
    def do_POST(self):
        data = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        data["id"] = max(USERS) + 1; USERS[data["id"]] = data
        self._send(201, data)
    def log_message(self, *a): pass
srv = HTTPServer(("127.0.0.1", 0), API)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_port}"

print(requests.get(f"{BASE}/users/1", timeout=5).json())
print(requests.post(f"{BASE}/users/", json={"name": "Raoji"}, timeout=5).status_code)
print(requests.get(f"{BASE}/users/99", timeout=5).status_code)
srv.shutdown()

# OUTPUT:
# {'id': 1, 'name': 'Abaji'}
# 201
# 404`],
        [`Almost every product integrates third-party services (payments, maps, auth, messaging). A naive client that ignores failures, timeouts or pagination breaks in production under real conditions.`,
            r`import time, random

def call_with_retry(fn, attempts=4, base=0.1):
    for n in range(attempts):
        try:
            return fn()
        except ConnectionError as e:
            if n == attempts - 1: raise
            delay = base * 2 ** n + random.uniform(0, base)   # exponential backoff + jitter
            print(f"attempt {n + 1} failed, retry in {delay:.2f}s")
            time.sleep(delay)

state = {"calls": 0}
def flaky():
    state["calls"] += 1
    if state["calls"] < 3: raise ConnectionError("503")
    return "success"

print(call_with_retry(flaky))

# OUTPUT (example):
# attempt 1 failed, retry in 0.15s
# attempt 2 failed, retry in 0.27s
# success`],
        [`Real use: pulling GitHub or Stripe data, syncing CRM records, posting Slack alerts. Most list endpoints are <b>paginated</b>; you loop until no next page.`,
            r`def fake_api(page):                          # stands in for GET /items?page=N
    data = {1: ["a", "b"], 2: ["c", "d"], 3: ["e"]}
    return {"items": data.get(page, []), "next": page + 1 if page < 3 else None}

def fetch_all():
    page, out = 1, []
    while page:                               # follow the "next" pointer
        resp = fake_api(page)
        out.extend(resp["items"]); page = resp["next"]
    return out

print(fetch_all())

# OUTPUT:
# ['a', 'b', 'c', 'd', 'e']`],
        [`<b>Advantages:</b> uniform, language-neutral, cacheable, easy to explore with curl, scales statelessly, and JSON maps directly to Python dicts.`,
            r`import json

raw = '{"id": 7, "tags": ["x", "y"], "profile": {"city": "Pune"}}'
user = json.loads(raw)                        # JSON text -> dict
print(user["profile"]["city"], len(user["tags"]))
print(json.dumps(user, separators=(",", ":")))   # dict -> compact JSON

# OUTPUT:
# Pune 2
# {"id":7,"tags":["x","y"],"profile":{"city":"Pune"}}`],
        [`<b>Disadvantages:</b> over-fetching or under-fetching data, versioning pain, inconsistent error formats between vendors, rate limits (429) and flaky networks you must handle.`,
            r`import time

def respect_rate_limit(status, headers):
    if status == 429:                         # Too Many Requests
        wait = int(headers.get("Retry-After", "1"))
        print(f"rate limited, sleeping {wait}s")
        return wait
    return 0

print(respect_rate_limit(429, {"Retry-After": "2"}))
print(respect_rate_limit(200, {}))

# OUTPUT:
# rate limited, sleeping 2s
# 2
# 0`],
        [`<b>Limitations:</b> REST has no standard schema (rely on OpenAPI), no push, and large JSON is slow to parse; validate responses because remote data is untrusted and may change shape.`,
            r`from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

def parse_user(d):
    try:
        return User(id=int(d["id"]), name=str(d["name"]))
    except (KeyError, ValueError, TypeError) as e:
        raise ValueError(f"bad API payload: {e!r}") from None

print(parse_user({"id": "7", "name": "Abaji"}))
try: parse_user({"id": "x"})
except ValueError as e: print(e)

# OUTPUT:
# User(id=7, name='Abaji')
# bad API payload: ValueError("invalid literal for int() with base 10: 'x'")`],
        `
   client code ─► API client class ─► Session (auth, timeout, retry) ─► HTTPS ─► API
        ▲               │ pagination loop, rate-limit wait, error mapping       │
        └── typed models (dataclass/pydantic) ◄── JSON ◄─────────────────────────┘
`,
        `Wrap each vendor in a thin client class (one place for auth, timeouts, retries, logging, error mapping) and return typed models, so the rest of the code never sees raw HTTP. Use idempotency keys for POST retries, circuit breakers for failing vendors, and contract tests or recorded responses in CI. Do not call remote APIs inside tight loops or request paths without caching.`
    ),

    'WebSockets': dd(
        [`A <b>WebSocket</b> is a persistent, full-duplex connection over a single TCP socket, started with an HTTP upgrade handshake. Both sides can send messages at any time. In Python use the <code>websockets</code> library (<code>pip install websockets</code>).`,
            r`import asyncio, websockets

async def echo(ws):                          # handler: runs once per connection
    async for message in ws:
        await ws.send(f"echo: {message}")

async def main():
    async with websockets.serve(echo, "127.0.0.1", 0) as server:
        port = server.sockets[0].getsockname()[1]
        async with websockets.connect(f"ws://127.0.0.1:{port}") as ws:
            await ws.send("hello")
            print(await ws.recv())

asyncio.run(main())

# OUTPUT:
# echo: hello`],
        [`HTTP is request/response: to get live updates the client must poll, wasting requests and adding delay. WebSockets let the server push data the instant it exists.`,
            r`import asyncio, websockets

async def ticker(ws):                        # server pushes without being asked
    for price in (101.5, 101.7, 101.4):
        await ws.send(str(price)); await asyncio.sleep(0.05)

async def main():
    async with websockets.serve(ticker, "127.0.0.1", 0) as srv:
        port = srv.sockets[0].getsockname()[1]
        async with websockets.connect(f"ws://127.0.0.1:{port}") as ws:
            async for msg in ws:             # ends when the server closes
                print("price", msg)

asyncio.run(main())

# OUTPUT:
# price 101.5
# price 101.7
# price 101.4`],
        [`Real use: chat apps, live dashboards, stock tickers, multiplayer games, collaborative editors, notifications, and streaming LLM tokens. Servers usually keep a set of connected clients for broadcasting.`,
            r`import asyncio, websockets

clients = set()

async def chat(ws):
    clients.add(ws)
    try:
        async for msg in ws:
            websockets.broadcast(clients, msg)     # send to everyone connected
    finally:
        clients.discard(ws)

async def main():
    async with websockets.serve(chat, "127.0.0.1", 0) as srv:
        url = f"ws://127.0.0.1:{srv.sockets[0].getsockname()[1]}"
        async with websockets.connect(url) as a, websockets.connect(url) as b:
            await a.send("hi all")
            print("b received:", await b.recv())

asyncio.run(main())

# OUTPUT:
# b received: hi all`],
        [`<b>Advantages:</b> low latency, small per-message overhead after the handshake, bidirectional, supports text and binary frames, and works through most proxies on port 80/443.`,
            r`import asyncio, websockets

async def handler(ws):
    data = await ws.recv()
    await ws.send(data)                       # binary frames are supported too

async def main():
    async with websockets.serve(handler, "127.0.0.1", 0) as srv:
        async with websockets.connect(f"ws://127.0.0.1:{srv.sockets[0].getsockname()[1]}") as ws:
            await ws.send(b"\x00\x01\x02")
            print(await ws.recv())

asyncio.run(main())

# OUTPUT:
# b'\x00\x01\x02'`],
        [`<b>Disadvantages:</b> stateful connections are harder to scale and load-balance, you need your own reconnect logic and message protocol, and idle connections can be dropped by proxies.`,
            r`import asyncio, websockets

async def handler(ws):
    await ws.close()                          # server drops the connection

async def main():
    async with websockets.serve(handler, "127.0.0.1", 0) as srv:
        url = f"ws://127.0.0.1:{srv.sockets[0].getsockname()[1]}"
        async with websockets.connect(url) as ws:
            try:
                await ws.recv()
            except websockets.ConnectionClosed as e:
                print("connection closed -> client must reconnect, code", e.rcvd.code)

asyncio.run(main())

# OUTPUT:
# connection closed -> client must reconnect, code 1000`],
        [`<b>Limitations:</b> no built-in message framing semantics, authentication or topic routing (you design them), no automatic delivery guarantee or replay after reconnect, and browsers cannot set custom headers on the handshake.`,
            r`import json

# You must define the protocol yourself: typed envelopes, ids, versions
def make_msg(kind, payload, msg_id):
    return json.dumps({"v": 1, "id": msg_id, "type": kind, "data": payload})

def handle(raw):
    m = json.loads(raw)
    if m.get("v") != 1: return "unsupported version"
    return {"ping": "pong", "chat": "stored"}.get(m["type"], "unknown type")

print(handle(make_msg("ping", None, 1)))
print(handle(make_msg("chat", {"text": "hi"}, 2)))

# OUTPUT:
# pong
# stored`],
        `
   Client                                          Server
     │ ── HTTP GET + Upgrade: websocket ───────►    │
     │ ◄───────── 101 Switching Protocols ───────   │
     │ ◄═══════════ full-duplex frames ═══════════► │
     │   send ───►  ◄─── push, any time             │
     │ ──── close frame (code 1000) ────────────►   │
`,
        `Use WebSockets for genuinely interactive, low-latency, two-way flows; use Server-Sent Events for simple one-way push and plain HTTP polling when updates are rare. Plan for scale: sticky sessions or a pub/sub backplane (Redis, NATS), heartbeats (ping/pong), authentication on connect, backpressure and reconnect with resume tokens.`
    )
};
