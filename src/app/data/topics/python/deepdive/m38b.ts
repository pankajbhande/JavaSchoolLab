// Module 38 (AI / LLM Development), part B: agents, evaluation, architecture, PyTorch, frameworks.
import { dd, r, type DeepDive } from './deepDive';

export const m38b: Record<string, DeepDive> = {
    'AI Agents': dd(
        [`An <b>AI agent</b> is an LLM running in a loop: it decides an action (usually a tool call), observes the result, and repeats until the goal is met or a limit is reached.`,
            r`# The core agent loop, with a scripted "model" so the control flow is visible
def fake_llm(history):
    """Pretend model: first asks for a tool, then answers using the result."""
    if not any(m["role"] == "tool" for m in history):
        return {"tool": "add", "args": {"a": 2, "b": 3}}
    return {"final": "The sum is 5."}

tools = {"add": lambda a, b: a + b}
history = [{"role": "user", "content": "What is 2 + 3?"}]
for step in range(5):                                   # hard step limit
    out = fake_llm(history)
    if "final" in out:
        print(out["final"]); break
    result = tools[out["tool"]](**out["args"])          # act
    history.append({"role": "tool", "content": str(result)})   # observe

# OUTPUT:
# The sum is 5.`],
        [`Some tasks cannot be done in one prompt: they need searching, reading, computing and deciding the next step based on what was found. Agents add planning and iteration.`,
            r`# One-shot cannot adapt; a loop can react to results
steps_taken = []
goal_met = False
while not goal_met and len(steps_taken) < 3:
    steps_taken.append(f"step {len(steps_taken) + 1}")
    goal_met = len(steps_taken) == 2        # in real agents the LLM judges this
print(steps_taken)

# OUTPUT:
# ['step 1', 'step 2']`],
        [`Coding assistants that edit and test code, research agents that browse and summarise, support agents that look up orders and issue refunds, and data agents that write and run SQL.`,
            r`# A real call: the model chooses among tools each turn (OpenAI SDK shape)
from openai import OpenAI
client = OpenAI()
history = [{"role": "user", "content": "Refund order 42 if it was damaged."}]
resp = client.chat.completions.create(
    model="gpt-4o-mini", messages=history,
    tools=[{"type": "function", "function": {
        "name": "lookup_order", "description": "Fetch an order",
        "parameters": {"type": "object",
                       "properties": {"id": {"type": "integer"}}, "required": ["id"]}}}])
msg = resp.choices[0].message
print(msg.tool_calls[0].function.name if msg.tool_calls else msg.content)

# OUTPUT (example):
# lookup_order`],
        [`<b>Advantages:</b> handle open-ended multi-step tasks, adapt to intermediate results, combine many tools, and reduce hand-written workflow code.`,
            r`# Memory: keep the transcript so each step sees earlier observations
memory = []
def remember(role, text):
    memory.append({"role": role, "text": text})
    return memory[-6:]                       # sliding window controls token cost

remember("user", "find cheapest flight")
remember("tool", "search -> 3 results")
print(len(remember("assistant", "cheapest is 120 USD")), "messages in context")

# OUTPUT:
# 3 messages in context`],
        [`<b>Disadvantages:</b> unpredictable, expensive (many calls), slow, hard to debug and test, and errors compound over steps (a small error early derails the whole run).`,
            r`# Compounding error: 95% per-step reliability over 10 steps
p_step, steps = 0.95, 10
print(round(p_step ** steps, 3))

# OUTPUT:
# 0.599`],
        [`<b>Limitations:</b> they can loop forever, burn budget, take harmful actions, or be hijacked by injected instructions in tool output. Always bound steps, time and spend.`,
            r`import time

class Budget:
    def __init__(self, max_steps=5, max_usd=0.50, max_seconds=30):
        self.steps, self.usd, self.t0 = 0, 0.0, time.time()
        self.max_steps, self.max_usd, self.max_seconds = max_steps, max_usd, max_seconds
    def ok(self, cost=0.0):
        self.steps += 1; self.usd += cost
        return (self.steps <= self.max_steps and self.usd <= self.max_usd
                and time.time() - self.t0 <= self.max_seconds)

b = Budget(max_steps=2)
print([b.ok() for _ in range(3)])

# OUTPUT:
# [True, True, False]`],
        `
          +--------------------------------------------+
          |                AGENT LOOP                  |
   goal ->|  think (LLM) --> choose action             |
          |      ^                |                    |
          |      |                v                    |
          |  observe  <----  tool / API / code         |
          +-------|------------------------------------+
                  v   stop: answer reached | budget hit | human approval
              final answer
`,
        `Use the simplest thing that works: a fixed workflow or single prompt beats an agent when the steps are known. When autonomy is needed, constrain it: small toolset, step and cost budgets, approvals for side effects, sandboxed execution, traces for every step, and evaluations on whole trajectories. Prefer deterministic code for control flow and let the model handle only the ambiguous decisions.`
    ),

    'Evaluating LLM Applications': dd(
        [`<b>Evaluation</b> measures whether an LLM application meets quality targets using a fixed dataset of inputs with expected outputs or criteria, scored automatically, by humans, or by an LLM judge.`,
            r`# Smallest useful eval harness: dataset + scorer + aggregate
dataset = [
    {"q": "Capital of France?", "expected": "paris"},
    {"q": "2 + 2?",             "expected": "4"},
]
def app(q):                                   # the system under test (stub)
    return {"Capital of France?": "Paris", "2 + 2?": "5"}[q]

scores = [int(app(d["q"]).lower() == d["expected"]) for d in dataset]
print("accuracy:", sum(scores) / len(scores))

# OUTPUT:
# accuracy: 0.5`],
        [`LLM output is non-deterministic and prompts change often. Without measurement every tweak is a guess, and regressions reach users unnoticed.`,
            r`# Compare two prompt versions on the same dataset instead of eyeballing a few chats
results = {"prompt_v1": [1, 0, 1, 1, 0], "prompt_v2": [1, 1, 1, 1, 0]}
for name, s in results.items():
    print(name, sum(s) / len(s))

# OUTPUT:
# prompt_v1 0.6
# prompt_v2 0.8`],
        [`CI gates on prompt changes, RAG retrieval metrics (recall@k), groundedness checks, safety red-teaming, A/B tests, and production sampling with human review.`,
            r`# Retrieval metric for RAG: did the right document appear in the top-k?
def recall_at_k(retrieved, relevant, k=3):
    return int(any(doc in relevant for doc in retrieved[:k]))

cases = [(["d9", "d2", "d7"], {"d2"}), (["d1", "d4", "d8"], {"d5"})]
hits = [recall_at_k(r_, rel) for r_, rel in cases]
print(hits, sum(hits) / len(hits))

# OUTPUT:
# [1, 0] 0.5`],
        [`<b>Advantages:</b> objective comparison of prompts, models and retrievers, safe refactoring, regression detection, and evidence for cost/quality trade-offs.`,
            r`# LLM-as-judge: a second model grades answers against a rubric
from openai import OpenAI
client = OpenAI()

def judge(question, answer):
    rubric = ("Score 1-5 for factual correctness. Reply with the number only.\n"
              f"Question: {question}\nAnswer: {answer}")
    r = client.chat.completions.create(model="gpt-4o-mini", temperature=0,
                                       messages=[{"role": "user", "content": rubric}])
    return int(r.choices[0].message.content.strip())

print(judge("Capital of France?", "Paris"))

# OUTPUT (example):
# 5`],
        [`<b>Disadvantages:</b> building a good dataset is work, exact-match metrics miss valid paraphrases, and LLM judges have biases (prefer long answers, prefer their own style).`,
            r`expected, got = "Paris", "The capital is Paris."
print(got == expected)                       # exact match: harsh and wrong here
print(expected.lower() in got.lower())       # containment: more lenient

# OUTPUT:
# False
# True`],
        [`<b>Limitations:</b> a small eval set gives noisy scores, datasets go stale as usage shifts, and passing offline tests does not guarantee user satisfaction.`,
            r`import math

# 95% confidence half-width for an accuracy measured on n cases
def margin(p, n):
    return 1.96 * math.sqrt(p * (1 - p) / n)

print(round(margin(0.8, 20), 3), round(margin(0.8, 500), 3))   # 20 cases is very noisy

# OUTPUT:
# 0.175 0.035`],
        `
   golden dataset --> run app --> outputs --> scorers ----> report
   (inputs+expected)   v1 / v2             - exact / regex   accuracy
         ^                                 - metric (recall) cost, latency
         |                                 - LLM judge       regressions?
         +---- add failures from production logs <--------------+
                       CI gate: block release if score drops
`,
        `Start evaluating on day one with 30 to 100 real, representative cases and grow it from production failures. Separate component metrics (retrieval, tool choice, format validity) from end-to-end quality, calibrate LLM judges against human labels, and track cost and latency next to quality. Tools such as pytest, promptfoo, Ragas or LangSmith can run the loop in CI.`
    ),

    'AI Application Architecture': dd(
        [`An <b>AI application architecture</b> arranges the LLM, retrieval, tools, prompts, guardrails, caching and observability into a reliable service, instead of one prompt in one script.`,
            r`# Layered shape of a typical AI endpoint (each layer is replaceable)
def handle(request):
    safe   = guard_input(request)             # 1. validate / PII / injection checks
    ctx    = retrieve(safe)                   # 2. RAG or tools
    answer = call_model(safe, ctx)            # 3. LLM via a provider abstraction
    return guard_output(answer)               # 4. schema + policy checks

def guard_input(x):   return x.strip()[:2000]
def retrieve(x):      return ["policy: refunds in 5 days"]
def call_model(x, c): return f"Based on {c[0]}: yes."
def guard_output(a):  return a if "password" not in a.lower() else "[blocked]"

print(handle("  Can I get a refund?  "))

# OUTPUT:
# Based on policy: refunds in 5 days: yes.`],
        [`Models fail, change, cost money and leak data. Architecture contains those risks: fallbacks, caching, budgets, monitoring and clear boundaries keep the product stable.`,
            r`# Fallback chain: try the best model, degrade gracefully
def primary(q):  raise TimeoutError("slow")
def backup(q):   return "backup model answer"
def canned(q):   return "Sorry, try again later."

def answer(q):
    for fn in (primary, backup, canned):
        try:
            return fn(q)
        except Exception:
            continue

print(answer("hi"))

# OUTPUT:
# backup model answer`],
        [`Customer-support copilots, document Q and A, code review bots and internal search: all use queues for long jobs, streaming for UX, caches for repeated questions, and tracing for debugging.`,
            r`from functools import lru_cache

calls = 0
@lru_cache(maxsize=1024)
def cached_answer(normalized_question: str) -> str:
    global calls
    calls += 1                                  # stands in for a paid LLM call
    return "answer to " + normalized_question

for q in ["what is rag", "what is rag", "what is rag"]:
    cached_answer(q)
print("paid calls:", calls)

# OUTPUT:
# paid calls: 1`],
        [`<b>Advantages:</b> swap models without rewriting the app, control cost and latency, enforce safety in one place, and debug with traces.`,
            r`from typing import Protocol

class LLM(Protocol):                           # provider-neutral interface
    def complete(self, prompt: str) -> str: ...

class FakeLLM:
    def complete(self, prompt: str) -> str: return "ok:" + prompt[:10]

def summarize(llm: LLM, text: str) -> str:    # app code depends on the interface only
    return llm.complete("Summarize: " + text)

print(summarize(FakeLLM(), "long text"))

# OUTPUT:
# ok:Summarize:`],
        [`<b>Disadvantages:</b> more components to build and operate, abstractions can hide provider-specific features, and over-engineering is costly for prototypes.`,
            r`# Latency budget adds up across stages (milliseconds)
stages = {"guard": 20, "embed": 80, "vector search": 40, "rerank": 150, "llm": 1800}
print(sum(stages.values()), "ms end to end")

# OUTPUT:
# 2090 ms end to end`],
        [`<b>Limitations:</b> you cannot fully test non-deterministic components, provider outages are outside your control, and data-residency or compliance rules can restrict which APIs you may use.`,
            r`import re

def redact(text):
    """Strip obvious PII before text leaves your network."""
    text = re.sub(r"[\w.]+@[\w.]+", "[EMAIL]", text)
    return re.sub(r"\b\d{10}\b", "[PHONE]", text)

print(redact("Mail asha@example.com or call 9876543210"))

# OUTPUT:
# Mail [EMAIL] or call [PHONE]`],
        `
   client --> API gateway (auth, rate limit)
                  |
                  v
          +--------------+     +-------------+     +--------------+
          | input guard  | --> | orchestrator| --> | output guard |--> client
          +--------------+     |  (prompts)  |     +--------------+
                               +--+-------+--+
                                  |       |
                       retriever / vector DB   LLM provider abstraction --> model A | B
            cache (Redis)   queue (long jobs)   tracing + evals + cost metrics
`,
        `Start as a modular monolith with a thin LLM interface; split services only when scaling or ownership demands it. Make the model call the most replaceable part, keep prompts and eval sets in version control, and put observability (traces, token cost, user feedback) in from the beginning. Decide early about data residency, PII handling and vendor exit strategy.`
    ),

    'PyTorch & Transformers': dd(
        [`<b>PyTorch</b> is a deep-learning library with tensors (GPU-capable arrays) and automatic differentiation. <b>Hugging Face Transformers</b> provides thousands of pretrained models behind a simple API.`,
            r`import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)   # track gradients
y = (x ** 2).sum()                                      # y = x1^2 + x2^2 + x3^2
y.backward()                                            # autograd computes dy/dx
print(y.item(), x.grad)

# OUTPUT:
# 14.0
# tensor([2., 4., 6.])`],
        [`Neural networks need gradients of millions of parameters. PyTorch computes them automatically and runs on GPUs, while Transformers saves weeks of training by reusing pretrained models.`,
            r`from transformers import pipeline          # pip install transformers torch

clf = pipeline("sentiment-analysis")        # downloads a default pretrained model
print(clf("I love this course!"))

# OUTPUT (example):
# [{'label': 'POSITIVE', 'score': 0.9998}]`],
        [`Image classification, speech recognition, translation, custom fine-tuned classifiers, embeddings, and self-hosted open LLMs where data must stay on premises.`,
            r`import torch, torch.nn as nn

torch.manual_seed(0)
model = nn.Sequential(nn.Linear(1, 8), nn.ReLU(), nn.Linear(8, 1))   # tiny network
opt = torch.optim.SGD(model.parameters(), lr=0.05)
X = torch.tensor([[1.], [2.], [3.], [4.]]); y = 2 * X                # learn y = 2x

for epoch in range(200):                    # the standard training loop
    opt.zero_grad()                         # reset gradients
    loss = nn.functional.mse_loss(model(X), y)
    loss.backward()                         # backpropagate
    opt.step()                              # update weights
print(loss.item() < 0.1)

# OUTPUT (the loss value varies with the seed and PyTorch version):
# True`],
        [`<b>Advantages:</b> Pythonic dynamic graphs, easy debugging, strong GPU support, a vast model hub, and the de facto research standard.`,
            r`import torch

dev = "cuda" if torch.cuda.is_available() else "cpu"     # same code on CPU or GPU
t = torch.ones(2, 2, device=dev)
print((t @ t).tolist(), "on", dev)

# OUTPUT (example, CPU machine):
# [[2.0, 2.0], [2.0, 2.0]] on cpu`],
        [`<b>Disadvantages:</b> large downloads and memory, GPUs are expensive, training loops are written by hand, and inference of big models needs careful optimization.`,
            r`import torch

# Memory = parameters x bytes per parameter (rough, weights only)
params = 7_000_000_000                     # a 7B-parameter LLM
print(params * 2 / 1e9, "GB in fp16")      # 2 bytes per weight
print(params * 0.5 / 1e9, "GB in 4-bit")   # quantized

# OUTPUT:
# 14.0 GB in fp16
# 3.5 GB in 4-bit`],
        [`<b>Limitations:</b> tensors must be on the same device and dtype to interact, the Python layer adds overhead for tiny models, and trained models are not automatically production-ready (export, serving, monitoring needed).`,
            r`import torch

a = torch.ones(2)                          # float32
b = torch.ones(2, dtype=torch.float64)
print((a + b).dtype)                       # promotion works for dtypes
try:
    a + torch.ones(3)                      # shape mismatch is an error
except RuntimeError as e:
    print("RuntimeError:", str(e)[:47])

# OUTPUT:
# torch.float64
# RuntimeError: The size of tensor a (2) must match the size of`],
        `
   data --> DataLoader (batches) --> model(x) --> loss(pred, y)
                                        ^               |
                                        |          loss.backward()  (autograd)
                                   optimizer.step() <---+
   Transformers:  tokenizer --> pretrained model --> head --> output
                  (hub: from_pretrained("name"))
`,
        `For most products, calling a hosted model or a fine-tuned small pretrained one beats training from scratch. Self-host only when privacy, latency or unit cost demand it, and then plan for quantization, batching and a serving stack (vLLM, TGI, Triton). Export and pin model versions, and treat GPU capacity as a budgeted resource.`
    ),

    'LangChain & LlamaIndex': dd(
        [`<b>LangChain</b> composes LLM apps from prompts, models, parsers, tools and agents (LCEL pipes with <code>|</code>). <b>LlamaIndex</b> focuses on data: loading, indexing and querying your documents for RAG.`,
            r`from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("Translate to French: {text}")
chain = prompt | ChatOpenAI(model="gpt-4o-mini") | StrOutputParser()   # LCEL pipeline
print(chain.invoke({"text": "good morning"}))

# OUTPUT (example):
# Bonjour`],
        [`Every LLM app repeats the same plumbing: templates, retries, parsers, document loaders, chunking, indexes and connectors. Frameworks provide ready-made, tested parts.`,
            r`from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

docs = SimpleDirectoryReader("./data").load_data()      # load files in a folder
index = VectorStoreIndex.from_documents(docs)           # chunk + embed + index
engine = index.as_query_engine()
print(engine.query("What is the refund policy?"))

# OUTPUT (example):
# Refunds are processed within 5 business days.`],
        [`Prototyping RAG bots quickly, connecting to dozens of vector stores and loaders, and building stateful agent graphs with LangGraph.`,
            r`from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=50, chunk_overlap=10)
chunks = splitter.split_text("Python is great. " * 6)
print(len(chunks) > 1, all(len(c) <= 50 for c in chunks))

# OUTPUT:
# True True`],
        [`<b>Advantages:</b> fast prototyping, large integration ecosystem, standard abstractions, and built-in tracing/streaming and agent tooling.`,
            r`from langchain_core.runnables import RunnableLambda

# Any function becomes a composable, streamable, batchable step
upper = RunnableLambda(lambda s: s.upper())
exclaim = RunnableLambda(lambda s: s + "!")
pipeline = upper | exclaim
print(pipeline.invoke("hello"), pipeline.batch(["a", "b"]))

# OUTPUT:
# HELLO! ['A!', 'B!']`],
        [`<b>Disadvantages:</b> deep abstraction layers make debugging harder, APIs change quickly between versions, and heavy dependency trees add weight for simple needs.`,
            r`# The framework-free equivalent of a simple chain is often just a function
from openai import OpenAI
client = OpenAI()

def translate(text: str) -> str:
    r = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Translate to French: {text}"}])
    return r.choices[0].message.content

print(translate("good morning"))

# OUTPUT (example):
# Bonjour`],
        [`<b>Limitations:</b> defaults (chunk sizes, prompts, retrievers) are generic and rarely optimal for your data, and version drift between packages breaks upgrades. Pin versions.`,
            r`# Pin exact versions so an upgrade cannot silently change behaviour
requirements = ["langchain-core==0.3.15", "llama-index-core==0.11.20"]
print(all("==" in r_ for r_ in requirements))

# OUTPUT:
# True`],
        `
   LangChain                              LlamaIndex
   prompt | model | parser                loader --> splitter --> embed --> index
      |       |                                                              |
      +--> tools / agents / memory                   query engine <----------+
   (orchestration of calls)               (data ingestion + retrieval)
          both: connectors to LLMs, vector stores, tracing
`,
        `Use frameworks for speed in discovery and integrations, but isolate them behind your own interfaces so you can drop to plain SDK calls where control matters. Pin versions, read the generated prompts, and keep evaluations independent of any framework. For simple pipelines the raw SDK is often clearer, smaller and easier to maintain.`
    )
};
