// Module 36 (Security), part A: identity, tokens, crypto, transport.
import { dd, r, type DeepDive } from './deepDive';

export const m36a: Record<string, DeepDive> = {
    'Authentication vs Authorization': dd(
        [`<b>Authentication (AuthN)</b> answers "who are you?" (password, token, biometrics). <b>Authorization (AuthZ)</b> answers "what are you allowed to do?" (roles, permissions, policies). AuthN comes first; AuthZ is checked on every action.`,
            r`USERS = {"ada": {"password_ok": True, "role": "admin"}, "baji": {"password_ok": True, "role": "viewer"}}

def authenticate(name):            # identity: who?
    u = USERS.get(name)
    return name if u and u["password_ok"] else None

def authorize(name, action):       # permission: allowed?
    perms = {"admin": {"read", "delete"}, "viewer": {"read"}}
    return action in perms[USERS[name]["role"]]

who = authenticate("baji")
print(who, authorize(who, "read"), authorize(who, "delete"))

# OUTPUT:
# baji True False`],
        [`Confusing the two is a top vulnerability class (OWASP "Broken Access Control"). A logged-in user must still be prevented from reading another user's data.`,
            r`ORDERS = {1: "ada", 2: "baji"}          # order id -> owner

def get_order(current_user, order_id):
    if ORDERS[order_id] != current_user:   # object-level authorization (stops IDOR)
        raise PermissionError("forbidden")
    return f"order {order_id}"

print(get_order("ada", 1))
try:
    get_order("ada", 2)                    # authenticated, but NOT authorised
except PermissionError as e:
    print("403", e)

# OUTPUT:
# order 1
# 403 forbidden`],
        [`Web APIs: 401 Unauthorized means not authenticated, 403 Forbidden means authenticated but not allowed. FastAPI uses dependencies for both; enterprises add RBAC, ABAC, and SSO.`,
            r`from functools import wraps
def require_role(role):
    def deco(fn):
        @wraps(fn)
        def inner(user, *a, **k):
            if user.get("role") != role:
                raise PermissionError(f"needs {role}")
            return fn(user, *a, **k)
        return inner
    return deco

@require_role("admin")
def delete_user(user, uid): return f"deleted {uid}"
print(delete_user({"name": "ada", "role": "admin"}, 7))

# OUTPUT:
# deleted 7`],
        [`<b>Advantages of separating them:</b> change login (add MFA/SSO) without touching permission rules, centralise policies, easier audits and least privilege.`,
            r`# Policy as data: one place to change who can do what
POLICY = {"admin": {"users:read", "users:write"}, "support": {"users:read"}}
can = lambda role, perm: perm in POLICY.get(role, set())
print(can("support", "users:read"), can("support", "users:write"))

# OUTPUT:
# True False`],
        [`<b>Disadvantages:</b> authorization logic scattered in handlers is easy to forget on one endpoint; complex policies (per-object, per-tenant) are hard to test and reason about.`,
            r`# Forgotten check on a new endpoint = vulnerability
endpoints = {"/users": "checked", "/export": "FORGOT check"}
print([e for e, s in endpoints.items() if s != "checked"])

# OUTPUT:
# ['/export']`],
        [`<b>Limitations:</b> RBAC cannot express "owner of this record" rules alone; stateless tokens carry permissions that go stale until they expire; client-side checks are never trusted.`,
            r`# Token says admin; the user was demoted 1 minute ago but the token lives 15 min
token_claims = {"sub": "ada", "role": "admin", "exp_in_min": 15}
db_role_now = "viewer"
print("stale privilege:", token_claims["role"] != db_role_now)

# OUTPUT:
# stale privilege: True`],
        `
   request ──► [ AuthN ] ──► identity known? ──no──► 401 Unauthorized
                  │ yes
                  ▼
              [ AuthZ ] ──► allowed (role / owner / policy)? ──no──► 403 Forbidden
                  │ yes
                  ▼
              business logic
`,
        `Authenticate once at the edge (gateway or middleware) and authorize at every layer that touches data, deny by default. Prefer a central policy engine (OPA, Cedar, Casbin) over ad-hoc ifs when rules grow, and always verify object ownership server-side. Use short-lived tokens plus revocation lists for sensitive actions.`
    ),

    'JWT': dd(
        [`A <b>JSON Web Token</b> is a signed string <code>header.payload.signature</code> (each Base64URL). The server signs claims (user id, expiry) so it can later verify them without a session lookup. Signed is not encrypted: anyone can read the payload.`,
            r`import base64, json, hmac, hashlib

def b64(b): return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
payload = b64(json.dumps({"sub": "42", "exp": 1900000000}).encode())
sig = b64(hmac.new(b"secret", f"{header}.{payload}".encode(), hashlib.sha256).digest())
token = f"{header}.{payload}.{sig}"
print(token.count("."), "dots;", "payload readable:", json.loads(base64.urlsafe_b64decode(payload + "==")))

# OUTPUT:
# 2 dots; payload readable: {'sub': '42', 'exp': 1900000000}`],
        [`Servers with many instances would need a shared session store. A signed, self-contained token lets any instance verify identity locally, ideal for APIs and microservices.`,
            r`import hmac, hashlib, base64
def b64(b): return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
def sign(msg, key): return b64(hmac.new(key, msg.encode(), hashlib.sha256).digest())

msg = "header.payload"
good = sign(msg, b"secret")
print("valid  :", hmac.compare_digest(good, sign(msg, b"secret")))     # constant-time compare
print("forged :", hmac.compare_digest(good, sign("header.TAMPERED", b"secret")))

# OUTPUT:
# valid  : True
# forged : False`],
        [`Use PyJWT: short-lived access tokens (5-15 min) plus refresh tokens, with <code>exp</code>, <code>iss</code> and <code>aud</code> validated. FastAPI endpoints read the Bearer token from the Authorization header.`,
            r`# pip install pyjwt
import jwt, time
SECRET = "change-me-32-bytes-minimum-secret!!"
token = jwt.encode({"sub": "42", "exp": time.time() + 900}, SECRET, algorithm="HS256")
claims = jwt.decode(token, SECRET, algorithms=["HS256"])     # ALWAYS pin algorithms
print(claims["sub"])

# OUTPUT:
# 42`],
        [`<b>Advantages:</b> stateless verification, scales horizontally, carries claims, standard across languages, works for cross-service auth and SSO.`,
            r`import jwt, time
SECRET = "change-me-32-bytes-minimum-secret!!"
t = jwt.encode({"sub": "1", "exp": time.time() - 10}, SECRET, algorithm="HS256")   # already expired
try:
    jwt.decode(t, SECRET, algorithms=["HS256"])
except jwt.ExpiredSignatureError:
    print("expired token rejected automatically")

# OUTPUT:
# expired token rejected automatically`],
        [`<b>Disadvantages:</b> cannot be revoked before expiry without extra state, payload is public, large tokens on every request, easy to misuse (alg confusion, long lifetimes, storing in localStorage).`,
            r`import jwt
SECRET = "change-me-32-bytes-minimum-secret!!"
forged = jwt.encode({"sub": "admin"}, "", algorithm="none")        # alg=none attack
try:
    jwt.decode(forged, SECRET, algorithms=["HS256"])               # pinned algorithms block it
except jwt.InvalidTokenError as e:
    print("rejected:", type(e).__name__)

# OUTPUT:
# rejected: InvalidAlgorithmError`],
        [`<b>Limitations:</b> logout/revocation needs a denylist or short expiry; HS256 shares one secret between signer and verifier (use RS256/EdDSA with a public key for many verifiers); never put secrets in claims.`,
            r`import base64, json
payload = base64.urlsafe_b64encode(json.dumps({"sub": "1", "ssn": "123-45-6789"}).encode()).decode()
print("anyone can decode:", json.loads(base64.urlsafe_b64decode(payload))["ssn"])

# OUTPUT:
# anyone can decode: 123-45-6789`],
        `
   client                                      API server
   ┌────────┐  POST /login (user+pass)         ┌──────────────┐
   │        │ ───────────────────────────────► │ verify, sign │
   │        │ ◄─────── JWT (exp 15 min) ────── │ with key     │
   │        │                                  └──────────────┘
   │        │  GET /data  Authorization: Bearer <JWT>
   │        │ ───────────────────────────────► verify signature + exp
   └────────┘ ◄────────────── 200 / 401 ─────── (no DB lookup)
`,
        `Use JWTs for short-lived access tokens between services; for browser sessions server-side sessions in HttpOnly cookies are often simpler and revocable. Pin algorithms, validate iss/aud/exp, rotate keys with a kid header and JWKS, keep lifetimes short and use refresh-token rotation. Do not store sensitive data in claims.`
    ),

    'OAuth2': dd(
        [`<b>OAuth 2.0</b> is a delegation framework: a user lets an app access their data at another service (Google, GitHub) without sharing their password. The app receives an <b>access token</b> with limited scopes. OpenID Connect adds identity (ID token) on top.`,
            r`from urllib.parse import urlencode
# Step 1 of the Authorization Code flow: send the user to the provider
params = {"response_type": "code", "client_id": "my-app", "redirect_uri": "https://app.example.com/cb",
          "scope": "openid email", "state": "r4nd0m-csrf-value", "code_challenge_method": "S256",
          "code_challenge": "E9Melhoa..."}
print("https://auth.example.com/authorize?" + urlencode(params)[:70] + "...")

# OUTPUT:
# https://auth.example.com/authorize?response_type=code&client_id=my-app&redirect_u...`],
        [`Without OAuth, third-party apps would ask for your password, gaining full, unrevocable access. OAuth gives scoped, revocable, time-limited access and enables "Sign in with Google".`,
            r`granted_scopes = {"email", "profile"}
def can_read_calendar(scopes): return "calendar.read" in scopes
print("calendar access:", can_read_calendar(granted_scopes))      # least privilege

# OUTPUT:
# calendar access: False`],
        [`Social login, API access between SaaS products, mobile apps (Authorization Code + PKCE), server-to-server (Client Credentials), and FastAPI's OAuth2PasswordBearer for your own tokens.`,
            r`# Authorization Code exchange (server side) - using requests
def exchange(code, verifier):
    import requests
    return requests.post("https://auth.example.com/token", data={
        "grant_type": "authorization_code", "code": code,
        "redirect_uri": "https://app.example.com/cb", "client_id": "my-app",
        "code_verifier": verifier}, timeout=10).json()
print("returns {access_token, refresh_token, expires_in, id_token}")

# OUTPUT:
# returns {access_token, refresh_token, expires_in, id_token}`],
        [`<b>Advantages:</b> no password sharing, scoped and revocable tokens, delegated trust, wide ecosystem and libraries (Authlib), enables SSO.`,
            r`import secrets, hashlib, base64
# PKCE: proves the app that started the flow is the one finishing it
verifier = secrets.token_urlsafe(32)
challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
print(len(challenge), "char challenge sent first; verifier revealed only at token exchange")

# OUTPUT:
# 43 char challenge sent first; verifier revealed only at token exchange`],
        [`<b>Disadvantages:</b> complex with many grant types and easy to implement wrongly (open redirects, missing state, token leakage), OAuth itself is not authentication without OIDC.`,
            r`import secrets
# state parameter blocks CSRF on the callback
sent_state = secrets.token_urlsafe(16)
received_state = "attacker-controlled"
print("callback accepted:", secrets.compare_digest(sent_state, received_state))

# OUTPUT:
# callback accepted: False`],
        [`<b>Limitations:</b> bearer tokens grant access to whoever holds them; depends on provider availability; implicit and password grants are deprecated; refresh tokens need secure storage.`,
            r`deprecated = ["implicit", "resource owner password"]
recommended = ["authorization code + PKCE", "client credentials (machines)", "device code (TVs)"]
print("use:", recommended[0], "| avoid:", deprecated)

# OUTPUT:
# use: authorization code + PKCE | avoid: ['implicit', 'resource owner password']`],
        `
   User        Your App (client)        Auth Server         Resource API
    │  click login   │                        │                    │
    │───────────────►│ redirect + state+PKCE  │                    │
    │◄───────────────┴───────────────────────►│ user logs in,consents
    │                │◄── redirect + code ────│                    │
    │                │── code + verifier ────►│                    │
    │                │◄── access token ───────│                    │
    │                │────── Bearer token ───────────────────────►│
`,
        `Do not write your own authorization server: use a proven IdP (Keycloak, Auth0, Cognito, Entra ID) and a maintained library. Use Authorization Code + PKCE everywhere, exact-match redirect URIs, short token lifetimes, and scoped tokens per service. Add token introspection or JWT validation at resource servers.`
    ),

    'Password Hashing': dd(
        [`Never store passwords, store a <b>slow, salted hash</b>. Hashing is one-way; a unique random <b>salt</b> per user defeats rainbow tables; a deliberately slow algorithm (argon2id, bcrypt, scrypt, PBKDF2) makes brute force costly.`,
            r`import hashlib, os
salt = os.urandom(16)
h = hashlib.scrypt(b"correct horse", salt=salt, n=2**14, r=8, p=1)   # stdlib, memory-hard
print(len(salt), len(h), "bytes | stored as salt+hash, never the password")

# OUTPUT:
# 16 32 bytes | stored as salt+hash, never the password`],
        [`Databases leak. If passwords are plaintext or fast-hashed (MD5, SHA-1), a breach exposes every account within hours because users reuse passwords across sites.`,
            r`import hashlib
# Fast hashes are cracked at billions per second on GPUs
print(hashlib.md5(b"password123").hexdigest())          # same input -> same hash -> lookup tables
print(hashlib.md5(b"password123").hexdigest() == hashlib.md5(b"password123").hexdigest())

# OUTPUT:
# 482c811da5d5b4bc6d497ffa98491e38
# True`],
        [`Use <code>argon2-cffi</code> or <code>passlib</code>/<code>bcrypt</code> in web apps; the hash string embeds algorithm, parameters and salt so you can upgrade later.`,
            r`# pip install argon2-cffi
from argon2 import PasswordHasher
ph = PasswordHasher()
stored = ph.hash("s3cret!")                 # includes salt + params
print(stored.startswith("$argon2id$"))
print(ph.verify(stored, "s3cret!"))         # raises on mismatch
print(ph.check_needs_rehash(stored))        # upgrade params on next login

# OUTPUT:
# True
# True
# False`],
        [`<b>Advantages:</b> breach resilience, unique hashes per user, tunable cost, parameters stored with the hash, standard libraries.`,
            r`import hashlib, os
pw = b"same-password"
h1 = hashlib.pbkdf2_hmac("sha256", pw, os.urandom(16), 600_000)
h2 = hashlib.pbkdf2_hmac("sha256", pw, os.urandom(16), 600_000)
print("same password, different hashes:", h1 != h2)

# OUTPUT:
# same password, different hashes: True`],
        [`<b>Disadvantages:</b> intentionally uses CPU/memory so login endpoints can be DoS targets; you cannot recover forgotten passwords (only reset); high cost needs tuning per hardware.`,
            r`import hashlib, os, time
t = time.perf_counter()
hashlib.scrypt(b"pw", salt=os.urandom(16), n=2**15, r=8, p=1, maxmem=64 * 1024 * 1024)
print("ms per hash is intentionally noticeable:", (time.perf_counter() - t) * 1000 > 5)

# OUTPUT (varies):
# ms per hash is intentionally noticeable: True`],
        [`<b>Limitations:</b> a weak password stays weak even if hashed well; hashing does not stop credential stuffing or phishing; bcrypt truncates inputs at 72 bytes.`,
            r`import hashlib, os
common = ["123456", "password", "qwerty"]
salt = b"x" * 16
stolen = hashlib.pbkdf2_hmac("sha256", b"qwerty", salt, 1000)
for guess in common:                                   # dictionary attack still works on weak pw
    if hashlib.pbkdf2_hmac("sha256", guess.encode(), salt, 1000) == stolen:
        print("cracked:", guess)

# OUTPUT:
# cracked: qwerty`],
        `
   password ──► + random salt ──► argon2id(cost) ──► "$argon2id$v=19$m=65536,t=3,p=4$salt$hash"
                                                         │ stored in DB
   login attempt ──► same params + salt ──► compare constant-time ──► OK / reject
`,
        `Use argon2id with parameters tuned to roughly 100-500 ms, plus rate limiting, lockouts or CAPTCHAs, breached-password checks (HIBP k-anonymity) and MFA/passkeys. Consider delegating to an IdP so you never store passwords. Add an optional server-side pepper in an HSM/secret store, and plan for rehash-on-login upgrades.`
    ),

    'Encryption Basics': dd(
        [`<b>Encryption</b> turns readable data into ciphertext using a key. <b>Symmetric</b> (AES-GCM, Fernet) uses one shared key; <b>asymmetric</b> (RSA, ECC) uses a public/private pair. Hashing is different: one-way, no key to decrypt.`,
            r`# pip install cryptography
from cryptography.fernet import Fernet
key = Fernet.generate_key()                  # keep this secret
f = Fernet(key)
token = f.encrypt(b"credit card 4111")
print(token[:6], f.decrypt(token))

# OUTPUT (token varies):
# b'gAAAAA' b'credit card 4111'`],
        [`Data at rest (disks, databases, backups) and in transit must stay confidential and tamper-proof even if storage or network is compromised. Authenticated encryption provides both secrecy and integrity.`,
            r`from cryptography.fernet import Fernet, InvalidToken
f = Fernet(Fernet.generate_key())
t = bytearray(f.encrypt(b"balance=100"))
t[20] ^= 1                                    # attacker flips one bit
try:
    f.decrypt(bytes(t))
except InvalidToken:
    print("tampering detected")

# OUTPUT:
# tampering detected`],
        [`Field-level encryption of PII in databases, encrypting backups, envelope encryption with KMS (data key encrypts data, master key encrypts the data key), and signing/verifying with public keys.`,
            r`from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
key = AESGCM.generate_key(bit_length=256)
aes = AESGCM(key)
nonce = os.urandom(12)                        # MUST be unique per message with the same key
ct = aes.encrypt(nonce, b"patient record", b"user:42")   # 3rd arg = authenticated metadata
print(aes.decrypt(nonce, ct, b"user:42"))

# OUTPUT:
# b'patient record'`],
        [`<b>Advantages:</b> confidentiality plus integrity (AEAD), fast symmetric speed, public-key crypto enables key exchange and signatures, mature audited libraries.`,
            r`from cryptography.hazmat.primitives.asymmetric import ed25519
priv = ed25519.Ed25519PrivateKey.generate()
sig = priv.sign(b"release-1.0.tar.gz")
priv.public_key().verify(sig, b"release-1.0.tar.gz")      # raises if invalid
print("signature valid; anyone with the public key can verify")

# OUTPUT:
# signature valid; anyone with the public key can verify`],
        [`<b>Disadvantages:</b> key management is the hard part, mistakes (nonce reuse, ECB mode, rolling your own) destroy security, encrypted data cannot be searched or indexed directly.`,
            r`from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
aes = AESGCM(AESGCM.generate_key(256))
nonce = os.urandom(12)
c1 = aes.encrypt(nonce, b"A" * 16, None)
c2 = aes.encrypt(nonce, b"B" * 16, None)       # nonce reuse = catastrophic leak (XOR of plaintexts)
print("same nonce twice: NEVER do this ->", len(c1) == len(c2))

# OUTPUT:
# same nonce twice: NEVER do this -> True`],
        [`<b>Limitations:</b> encryption does not hide metadata (size, timing); the key must exist where decryption happens; quantum computers threaten RSA/ECC (post-quantum migration ahead); secrets in memory are exposed to a compromised host.`,
            r`# Key and data must live apart
bad = {"db": "ciphertext", "key": "same server .env"}      # attacker gets both
good = {"db": "ciphertext", "key": "KMS / HSM, access audited"}
print("separate key custody:", bad["key"] != good["key"])

# OUTPUT:
# separate key custody: True`],
        `
   Symmetric  (one key)            Asymmetric (key pair)
   plaintext ─[key]─► ciphertext   plaintext ─[PUBLIC key]─► ciphertext
   ciphertext ─[key]─► plaintext   ciphertext ─[PRIVATE key]─► plaintext
   fast, bulk data                 slow, key exchange + signatures

   Envelope:  KMS master key ─encrypts─► data key ─encrypts─► your data
`,
        `Do not invent crypto: use high-level libraries (cryptography, libsodium/PyNaCl), authenticated modes only (AES-GCM, ChaCha20-Poly1305), unique nonces and a KMS for key custody with rotation. Encrypt at the right layer (TLS in transit, disk/DB at rest, field-level for sensitive data) and plan for key loss and recovery.`
    ),

    'HTTPS': dd(
        [`<b>HTTPS</b> is HTTP over <b>TLS</b>: the client verifies the server's certificate chain, both sides negotiate keys, and all traffic is encrypted and integrity-protected. Python's <code>ssl</code> module and <code>requests</code>/<code>httpx</code> use it.`,
            r`import ssl, socket
ctx = ssl.create_default_context()           # verifies cert chain + hostname by default
with socket.create_connection(("www.python.org", 443), timeout=5) as raw:
    with ctx.wrap_socket(raw, server_hostname="www.python.org") as tls:
        print(tls.version(), tls.getpeercert()["subject"][0][0][1][:3])

# OUTPUT (needs internet, example):
# TLSv1.3 www`],
        [`Plain HTTP exposes passwords, cookies and tokens to anyone on the network path (Wi-Fi, ISPs) and allows modification of content. HTTPS gives confidentiality, integrity and server authenticity.`,
            r`import requests
# Verification is ON by default; never turn it off to "fix" an error
try:
    requests.get("https://expired.badssl.com/", timeout=5)
except requests.exceptions.SSLError:
    print("certificate rejected - correct behaviour")

# OUTPUT (needs internet):
# certificate rejected - correct behaviour`],
        [`Terminate TLS at a reverse proxy or load balancer (nginx, Caddy, ALB) with automatic Let's Encrypt certificates, set HSTS, and redirect HTTP to HTTPS. Internal services use mTLS in zero-trust networks.`,
            r`# Security headers a proxy/app adds for HTTPS sites
headers = {"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
           "X-Content-Type-Options": "nosniff"}
for k, v in headers.items():
    print(f"{k}: {v}")

# OUTPUT:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Content-Type-Options: nosniff`],
        [`<b>Advantages:</b> encryption, integrity, authentication, required by browsers for HTTP/2, geolocation, service workers and Secure cookies; boosts user trust and SEO.`,
            r`from http.cookies import SimpleCookie
c = SimpleCookie()
c["session"] = "abc"
c["session"]["secure"] = True        # only sent over HTTPS
c["session"]["httponly"] = True      # invisible to JavaScript
c["session"]["samesite"] = "Lax"
print(c.output())

# OUTPUT:
# Set-Cookie: session=abc; HttpOnly; SameSite=Lax; Secure`],
        [`<b>Disadvantages:</b> handshake latency and CPU (small with TLS 1.3), certificate lifecycle management (expiry outages), debugging encrypted traffic is harder.`,
            r`from datetime import date
expires = date(2026, 12, 1)
days_left = (expires - date(2026, 10, 5)).days
print("renew now" if days_left < 30 else f"{days_left} days left", "- automate with ACME")

# OUTPUT:
# 57 days left - automate with ACME`],
        [`<b>Limitations:</b> encrypts the channel only, not the server's logic (SQLi and XSS still work), metadata like hostnames/IPs stays visible, trust depends on certificate authorities.`,
            r`# HTTPS does not validate your inputs
url = "https://shop.example.com/search?q=' OR 1=1 --"
print("encrypted in transit, still an injectable query:", "OR 1=1" in url)

# OUTPUT:
# encrypted in transit, still an injectable query: True`],
        `
   browser                                   server
      │── ClientHello (TLS versions, ciphers) ─►│
      │◄─ ServerHello + certificate chain ─────│  verify: CA signed? hostname? expiry?
      │── key exchange (ECDHE) ───────────────►│  -> shared session key
      │◄════ encrypted HTTP request/response ═►│
`,
        `Terminate TLS 1.2+ (prefer 1.3) at the edge with automated ACME renewal, enable HSTS, disable legacy protocols, and monitor expiry. Use mTLS between services where identity matters (service mesh). Never disable verification in code; pin a private CA bundle instead for internal endpoints.`
    ),
};
