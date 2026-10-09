import { Topic } from '../../coreJava';

export const rag: Topic = {
    id: 'ml-genai-rag',
    name: 'RAG',
    beginner: [
        {
            content: `<h4>Giving an LLM Access to Facts It Was Never Trained On</h4>
<ul>
<li>A Large Language Model (<strong>LLM</strong>) like GPT generates text by predicting the next token based purely on patterns learned during training on a huge but FIXED text corpus - it has no live connection to your company's internal documents, today's news, or anything created after its training cutoff.</li>
<li>Ask it something outside that training data (e.g. "what is our company's 2026 refund policy?") and it will often <strong>hallucinate</strong> - confidently generate a plausible-sounding but fabricated answer - rather than admit it doesn't know.</li>
<li><strong>RAG (Retrieval-Augmented Generation)</strong> fixes this by, at query time, first RETRIEVING relevant real documents (or document chunks) from a knowledge base, then GENERATING an answer with those documents inserted into the prompt as grounding context - so the model answers using actual retrieved text instead of only its trained-in memory.</li>
</ul>`,
            codeExamples: [
                `# A minimal RAG pipeline: embed documents, retrieve the most relevant ones, inject into the prompt
from sentence_transformers import SentenceTransformer
import numpy as np

embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Our small "knowledge base" - documents the LLM was never trained on
documents = [
    "Our refund policy allows returns within 30 days of purchase with a valid receipt.",
    "Standard shipping takes 5-7 business days within the continental US.",
    "Premium support subscribers get a dedicated account manager and 1-hour response SLA.",
]
doc_embeddings = embedder.encode(documents)   # one vector per document

def retrieve(query, top_k=1):
    query_embedding = embedder.encode([query])[0]
    # cosine similarity between the query and every document
    sims = doc_embeddings @ query_embedding / (
        np.linalg.norm(doc_embeddings, axis=1) * np.linalg.norm(query_embedding)
    )
    best_idx = np.argsort(-sims)[:top_k]
    return [documents[i] for i in best_idx], sims[best_idx]

query = "Can I get my money back if I don't like the product?"
retrieved_docs, scores = retrieve(query, top_k=1)

prompt = f"""Answer the question using ONLY the context below. If the context doesn't contain the answer, say you don't know.

Context: {retrieved_docs[0]}

Question: {query}
Answer:"""

print(f"Retrieved (similarity={scores[0]:.3f}): {retrieved_docs[0]}")
print("---")
print("Prompt sent to the LLM:")
print(prompt)
# OUTPUT (typical):
# Retrieved (similarity=0.612): Our refund policy allows returns within 30 days of purchase with a valid receipt.
# ---
# Prompt sent to the LLM:
# Answer the question using ONLY the context below. If the context doesn't contain the answer, say you don't know.
#
# Context: Our refund policy allows returns within 30 days of purchase with a valid receipt.
#
# Question: Can I get my money back if I don't like the product?
# Answer:`
            ],
            codeExplanations: [
                `This builds the two core stages of RAG by hand on a tiny 3-document knowledge base. First, every document is converted into a dense numeric vector (an "embedding") using a pretrained sentence-embedding model, where semantically similar text ends up as nearby vectors even if the wording differs. When a user query comes in, it's embedded the same way, and cosine similarity is computed between the query vector and every document vector - the document with the highest similarity is the one most semantically relevant to the question, even though the query never uses the word "refund" (it says "money back"), which is exactly why embedding-based retrieval beats simple keyword matching. Finally, the retrieved document text is inserted directly into the prompt as "Context" before the question, explicitly instructing the LLM to answer ONLY from that context - this retrieve-then-generate pattern is the entire mechanism of RAG, grounding the model's answer in a real, verifiable source document instead of whatever it happened to memorize during training.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>An LLM's knowledge is frozen at whatever point its training data was collected, and it was trained on public internet-scale text - it has NEVER seen your company's internal wiki, private policy documents, or proprietary codebase, no matter how large or capable the model is. Fine-tuning the model on that private data is one option, but it's expensive, needs to be repeated every time the documents change, and still doesn't reliably teach a model to recall exact facts (fine-tuning is better at teaching STYLE/behavior than reliably injecting FACTS).</li>
<li>Without grounding, asking an LLM a factual question outside its training data produces <strong>hallucination</strong> - the model doesn't know it doesn't know, and language-model next-token-prediction will happily produce a fluent, confident-sounding, entirely made-up answer (e.g. inventing a plausible-sounding but nonexistent policy clause, or citing a court case that doesn't exist) because "sounding plausible" is literally what it was trained to optimize for, not "being factually verified."</li>
<li>RAG sidesteps both problems: no retraining is needed when documents change (just re-index the updated document), and answers are grounded in retrieved TEXT the model can be instructed to quote or stay faithful to - making it dramatically easier to trace an answer back to its source and catch when the model strays from the provided context.</li>
</ul>
<h3>The Retrieve-Then-Generate Pipeline in Detail</h3>
<ul>
<li><strong>Chunking</strong> - documents are split into smaller pieces (e.g. a few hundred tokens each, often with some overlap between consecutive chunks) rather than embedded whole, because embedding models have limited input length and because retrieval works better when each stored unit is topically focused rather than a huge mixed-topic document.</li>
<li><strong>Embedding + Vector Database</strong> - each chunk is converted to a dense vector via an embedding model and stored in a <strong>vector database</strong> (e.g. Pinecone, Weaviate, FAISS, Chroma) that supports fast approximate-nearest-neighbor search over potentially millions of vectors.</li>
<li><strong>Retrieval</strong> - at query time, the user's question is embedded with the SAME embedding model, and the vector database returns the top-K most similar chunks by vector distance (cosine similarity or similar).</li>
<li><strong>Augmentation + Generation</strong> - the retrieved chunks are inserted into the LLM's prompt as context (often with an instruction like "answer only using this context"), and the LLM generates its final answer conditioned on that injected context plus the original question.</li>
</ul>`,
            codeExamples: [
                `# A slightly more complete RAG pipeline with chunking and a FAISS-style vector index
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

embedder = SentenceTransformer("all-MiniLM-L6-v2")

long_doc = """
Our platform's API rate limit is 1000 requests per minute for standard tier accounts.
Enterprise tier accounts get 10000 requests per minute and priority queueing.
If you exceed your rate limit, requests receive a 429 status code and should be retried
with exponential backoff. Rate limits reset on a rolling one-minute window, not a fixed clock minute.
Authentication uses OAuth 2.0 bearer tokens which expire after 24 hours and must be refreshed.
"""

def chunk_text(text, chunk_size=120, overlap=20):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        chunk = " ".join(words[start:start + chunk_size])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

chunks = chunk_text(long_doc)
embeddings = np.array(embedder.encode(chunks)).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])   # simple exact nearest-neighbor index
index.add(embeddings)

def rag_retrieve(query, top_k=2):
    q_vec = np.array(embedder.encode([query])).astype("float32")
    distances, indices = index.search(q_vec, top_k)
    return [chunks[i] for i in indices[0]]

query = "What happens if I go over my API limit?"
retrieved = rag_retrieve(query)
context = "\\n---\\n".join(retrieved)

final_prompt = f"Context:\\n{context}\\n\\nQuestion: {query}\\nAnswer using only the context above:"
print(f"Retrieved {len(retrieved)} chunk(s) from {len(chunks)} total chunks")
print(final_prompt)
# OUTPUT (typical):
# Retrieved 2 chunk(s) from 1 total chunks
# Context:
# Our platform's API rate limit is 1000 requests per minute ... retried with exponential backoff. ...
#
# Question: What happens if I go over my API limit?
# Answer using only the context above:`
            ],
            codeExplanations: [
                `This extends the basic retrieval example into the more realistic pipeline: chunk_text splits a longer document into overlapping word-count-based chunks (overlap prevents a fact from being awkwardly cut in half right at a chunk boundary and lost to retrieval), each chunk is embedded, and the embeddings are loaded into a FAISS IndexFlatL2 - a real vector index library used in production RAG systems for fast nearest-neighbor search, here using simple exact L2 distance search since the dataset is tiny (production systems with millions of vectors use approximate indexes for speed). rag_retrieve embeds the incoming query the same way and asks the FAISS index for the top-K closest chunks by vector distance. The retrieved chunks are then joined together and inserted into the final prompt template as context, with the model explicitly told to answer only from what's given - this is the same retrieve-then-generate structure as the first example, just with the chunking and proper vector-index search that a real production RAG system needs when there are far more documents than can be compared with individually one at a time.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>A company builds an internal chatbot for employees to ask questions about HR policy, IT procedures, and benefits - documents an LLM was never trained on and that change over time (a new parental-leave policy rolled out this quarter, for instance). Without RAG, the chatbot would either refuse to answer specific policy questions or, worse, hallucinate a plausible-sounding but wrong policy - which is a real liability if an employee acts on incorrect HR guidance.</li>
<li>With RAG: all internal policy PDFs and wiki pages are chunked and embedded into a vector database once (and re-indexed whenever a document is updated - no model retraining needed). When an employee asks "how many weeks of parental leave do I get?", the system embeds that question, retrieves the specific policy paragraph(s) about parental leave, and passes them to the LLM as context, which answers from the ACTUAL current policy text rather than from whatever it happened to see about "typical" parental leave policies during training.</li>
<li>Critically, this also gives the company an audit trail: the chatbot's answer can cite exactly which document and section it pulled from, so an employee (or HR) can verify the answer against the source - something a fine-tuned-only model, which blends facts into opaque neural network weights with no traceable source, cannot easily provide.</li>
</ul>`,
            codeExamples: [
                `# Full retrieve-then-generate call including citation of the source document (LangChain-style pseudocode)
from sentence_transformers import SentenceTransformer
import numpy as np

embedder = SentenceTransformer("all-MiniLM-L6-v2")

policy_docs = {
    "parental_leave_policy.pdf": "Employees are eligible for 16 weeks of paid parental leave "
                                  "following the birth or adoption of a child, effective Q3 2026.",
    "pto_policy.pdf": "Full-time employees accrue 15 days of paid time off per year, "
                       "increasing to 20 days after 3 years of tenure.",
    "remote_work_policy.pdf": "Employees may work remotely up to 3 days per week with manager approval.",
}
doc_names = list(policy_docs.keys())
doc_texts = list(policy_docs.values())
doc_vecs = embedder.encode(doc_texts)

def retrieve_with_citation(query, top_k=1):
    q_vec = embedder.encode([query])[0]
    sims = doc_vecs @ q_vec / (np.linalg.norm(doc_vecs, axis=1) * np.linalg.norm(q_vec))
    top_idx = np.argsort(-sims)[:top_k]
    return [(doc_names[i], doc_texts[i], sims[i]) for i in top_idx]

def call_llm(prompt):
    # Placeholder for a real LLM call, e.g. client.messages.create(...) or openai.ChatCompletion.create(...)
    return "Based on the current parental leave policy, you are eligible for 16 weeks of paid leave."

query = "How many weeks of parental leave do I get?"
results = retrieve_with_citation(query)
source_name, source_text, score = results[0]

prompt = f"Context from '{source_name}': {source_text}\\n\\nQuestion: {query}\\nAnswer:"
answer = call_llm(prompt)

print(f"Answer: {answer}")
print(f"Source: {source_name} (retrieval similarity {score:.3f})")
# OUTPUT (typical):
# Answer: Based on the current parental leave policy, you are eligible for 16 weeks of paid leave.
# Source: parental_leave_policy.pdf (retrieval similarity 0.687)`
            ],
            codeExplanations: [
                `This models the internal HR-chatbot scenario end to end, keeping track of WHICH document each chunk came from so the final answer can be cited. Three short policy documents are embedded and stored alongside their filenames; retrieve_with_citation returns not just the best-matching text but also its source filename and similarity score. call_llm is a placeholder standing in for a real call to an LLM API (e.g. Anthropic's Messages API or OpenAI's chat completions) - in a real system this line would send the constructed prompt to the model and return its generated response. The final print statements show the two things a production RAG chatbot needs to surface together: the generated answer AND its source document, so an employee (or an auditor) can verify the chatbot's claim against the actual current policy text rather than trusting an unverifiable, opaque answer - the traceability that makes RAG preferable to relying on an LLM's fine-tuned-in "memory" alone for facts that matter.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>No retraining needed when knowledge changes</strong> - updating the knowledge base just means re-embedding and re-indexing the changed document (seconds to minutes), versus fine-tuning a model which requires a training run, evaluation, and redeployment every time underlying facts change.</li>
<li><strong>Grounded, traceable answers</strong> - because the model is instructed to answer from retrieved text, the system can show users exactly which source document(s) an answer came from, letting them verify claims - critical in regulated domains like legal, medical, or financial advice where an unverifiable answer is a liability.</li>
<li><strong>Reduces (though doesn't eliminate) hallucination</strong> - grounding the model in real retrieved text measurably reduces fabricated facts compared to relying purely on the model's trained-in parametric memory, especially for narrow, private, or rapidly-changing knowledge the model was never trained on at all.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Retrieval quality is a hard bottleneck</strong> - if the retriever pulls the WRONG or irrelevant chunk (e.g. because the query is phrased very differently from how the answer is worded, or the top-K cutoff misses the truly relevant chunk), the LLM will generate a confident-sounding answer from bad context - the system is only as good as what gets retrieved, and "the LLM answered fluently" is no guarantee retrieval succeeded.</li>
<li><strong>Context window limits how much can be injected</strong> - even with large modern context windows, there's still a limit to how many retrieved chunks can be stuffed into one prompt, and stuffing in too much irrelevant context can actually distract the model or bury the truly relevant fact (a phenomenon sometimes called "lost in the middle"), so retrieval has to be selective, not just "grab everything that might be relevant."</li>
<li><strong>Added system complexity and latency</strong> - a RAG system has more moving parts than a plain LLM call (an embedding step, a vector database, a chunking/indexing pipeline that needs to be kept in sync with source documents), each of which is another place for something to go stale or break, and each retrieval step adds latency before the LLM call even starts.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating the retrieval-quality bottleneck: a badly-phrased query can retrieve the wrong chunk
from sentence_transformers import SentenceTransformer
import numpy as np

embedder = SentenceTransformer("all-MiniLM-L6-v2")

docs = [
    "The maximum file upload size for free-tier accounts is 25 MB per file.",
    "Password reset links expire after 1 hour for security reasons.",
    "Free-tier accounts can create up to 3 projects; paid tiers are unlimited.",
]
doc_vecs = embedder.encode(docs)

def best_match(query):
    q_vec = embedder.encode([query])[0]
    sims = doc_vecs @ q_vec / (np.linalg.norm(doc_vecs, axis=1) * np.linalg.norm(q_vec))
    best_i = np.argmax(sims)
    return docs[best_i], sims[best_i], sims

# A well-phrased query that matches the vocabulary of the right document
clear_query = "What's the file size limit for uploads?"
match, score, all_scores = best_match(clear_query)
print(f"Clear query   -> retrieved: '{match}' (score={score:.3f})")

# A vaguely-phrased query using different vocabulary than any document - retrieval can get it WRONG
vague_query = "How big can my stuff be?"
match2, score2, all_scores2 = best_match(vague_query)
print(f"Vague query   -> retrieved: '{match2}' (score={score2:.3f})")
print(f"All similarity scores for the vague query: {all_scores2.round(3)}")
# OUTPUT (illustrative - exact scores depend on the embedding model, but the pattern holds):
# Clear query   -> retrieved: 'The maximum file upload size for free-tier accounts is 25 MB per file.' (score=0.583)
# Vague query   -> retrieved: 'Free-tier accounts can create up to 3 projects; paid tiers are unlimited.' (score=0.301)
# All similarity scores for the vague query: [0.298 0.112 0.301]
# (the vague query's TOP similarity score, 0.301, is much lower and nearly tied with a WRONG
#  document - a low-confidence, ambiguous retrieval the LLM will still confidently answer from)`
            ],
            codeExplanations: [
                `This deliberately constructs a case where retrieval quality breaks down, to make the "retrieval is the bottleneck" limitation concrete rather than abstract. Two versions of essentially the same underlying question are embedded and compared against the same three documents: a "clear" query using vocabulary close to the correct document's wording, and a "vague" query using very different, colloquial phrasing for the same real intent. The clear query retrieves the right document with a reasonably confident similarity score, but the vague query's best match is meaningfully lower and, in this run, nearly tied with an unrelated document - meaning the retriever has effectively picked close to randomly among plausible-looking candidates. Because the downstream LLM has no way to know the retrieval was low-confidence or possibly wrong (it just receives whatever text was handed to it as "the context"), it will still generate a fluent, confident answer based on that possibly-wrong document - illustrating exactly why RAG system quality depends heavily on retrieval quality (good chunking, a well-matched embedding model, sometimes query rewriting) and not just on how capable the underlying LLM is.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why do LLMs hallucinate, and how does RAG address that?</td><td>An LLM generates text by predicting the statistically most plausible next token based on patterns learned during training, with no built-in mechanism to check facts against a live source of truth - so on questions outside (or beyond the freshness of) its training data, it produces fluent but fabricated answers. RAG addresses this by retrieving real, relevant documents at query time and injecting them into the prompt as context, grounding the model's answer in verifiable retrieved text rather than only its trained-in parametric memory</td></tr>
<tr class='text-center'><td>Why not just fine-tune the LLM on your private documents instead of using RAG?</td><td>Fine-tuning is expensive and slow to repeat every time underlying documents change, is generally better at teaching a model STYLE or behavior than reliably encoding exact, retrievable FACTS, and gives no easy way to trace an answer back to a specific source document for verification - RAG updates instantly by re-indexing changed documents and keeps answers traceable to their source, which fine-tuning alone does not provide</td></tr>
<tr class='text-center'><td>What is the biggest practical bottleneck in a RAG system, and how would you diagnose it?</td><td>Retrieval quality - if the retriever fetches the wrong or irrelevant chunks (due to chunking that splits facts awkwardly, a query phrased very differently from the document's wording, or too small a top-K), the LLM will still generate a fluent, confident-sounding answer from bad context with no obvious sign anything went wrong. Diagnosing it means inspecting what was actually retrieved for a given query (not just the final generated answer), checking similarity scores for low-confidence matches, and evaluating retrieval accuracy separately from generation quality</td></tr>
</table>`
        }
    ]
};
