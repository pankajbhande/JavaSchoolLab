import { Topic } from '../../coreJava';

export const vectorDatabases: Topic = {
    id: 'ml-genai-vector-databases',
    name: 'Vector Databases',
    beginner: [
        {
            content: `<h4>A Database Built to Search by Meaning, Not by Exact Match</h4>
<ul>
<li>A <strong>Vector Database</strong> is a database purpose-built to store dense numeric vectors (<strong>embeddings</strong>) and quickly find the ones most SIMILAR to a given query vector - unlike a traditional database, which finds rows by exact match or range on a column, a vector database finds rows by geometric closeness in high-dimensional space.</li>
<li>This matters because embeddings encode MEANING: text with similar meaning ends up as nearby vectors even when the actual words are completely different (e.g. "money back" and "refund" land close together), which is exactly the kind of similarity a traditional keyword-matching database (like a SQL <code>WHERE text LIKE '%refund%'</code>) can't capture.</li>
<li>A vector database is the standard retrieval backend behind systems like <strong>RAG</strong> (Retrieval-Augmented Generation) chatbots, recommendation engines, and semantic/image search - anywhere "find things similar to this one" matters more than "find things that exactly match this filter."</li>
</ul>`,
            codeExamples: [
                `# Storing document embeddings in a vector database (Chroma) and querying by semantic similarity
import chromadb
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.Client()
collection = client.create_collection(name="support_docs")

documents = [
    "Our refund policy allows returns within 30 days of purchase with a valid receipt.",
    "Standard shipping takes 5-7 business days within the continental US.",
    "Premium support subscribers get a dedicated account manager and 1-hour response SLA.",
]
embeddings = embedder.encode(documents).tolist()

collection.add(
    ids=["doc1", "doc2", "doc3"],
    embeddings=embeddings,
    documents=documents,
)

query = "Can I get my money back if I don't like the product?"
query_embedding = embedder.encode([query]).tolist()

results = collection.query(query_embeddings=query_embedding, n_results=1)
print(f"Query: {query}")
print(f"Best match: {results['documents'][0][0]}")
print(f"Distance: {results['distances'][0][0]:.3f}")
# OUTPUT (typical):
# Query: Can I get my money back if I don't like the product?
# Best match: Our refund policy allows returns within 30 days of purchase with a valid receipt.
# Distance: 0.412`
            ],
            codeExplanations: [
                `This shows the minimal end-to-end workflow of using a real vector database (Chroma, a popular lightweight open-source option) instead of comparing vectors by hand. Three short documents are converted into embeddings with a sentence-embedding model and added to a Chroma collection along with their IDs and original text - the database now stores both the vector representation and the source text together. When a query comes in ("Can I get my money back...") it's embedded with the SAME model, and collection.query() asks the vector database to find the nearest stored vector by distance - note that the query never uses the word "refund," yet the correct document is retrieved because the embedding captures MEANING rather than exact keywords. The key difference from doing this by hand (as in a naive cosine-similarity loop) is that a real vector database handles the indexing, storage, and efficient nearest-neighbor search internally, and is built to keep working the same way whether there are 3 documents or 3 million.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Comparing a query vector against EVERY stored vector one at a time (brute-force cosine similarity, computing a similarity score against all N vectors and sorting) works fine for a handful of documents, but the cost grows LINEARLY with the number of stored vectors - at 3 documents it's instant, but at 10 million document chunks (a realistic size for a company's full internal knowledge base), a brute-force scan of every vector for every single query becomes far too slow for a live chatbot or search feature where users expect sub-second responses.</li>
<li>A vector database solves this by building an <strong>Approximate Nearest Neighbor (ANN)</strong> index over the stored vectors ahead of time, instead of comparing the query against everything at query time. The most common algorithm is <strong>HNSW (Hierarchical Navigable Small World)</strong>, which organizes vectors into a multi-layer graph structure where searching starts at a coarse top layer and progressively narrows down through finer layers - this lets a query find vectors that are very likely (though not provably guaranteed) to be the true nearest neighbors while touching only a small fraction of the total stored vectors, turning what would be a linear-time scan into something close to logarithmic-time in practice.</li>
<li>The word "approximate" is deliberate: HNSW and similar ANN indexes trade a small amount of RECALL (occasionally missing the single mathematically-closest vector) for a massive gain in SPEED - in practice this tradeoff is worth it, because the 50th-closest match and the true single closest match are usually both "good enough" semantically, while the latency difference between brute-force and ANN search at scale is not a small effect but the difference between milliseconds and seconds.</li>
</ul>
<h3>Brute-Force vs Indexed (ANN) Search</h3>
<ul>
<li><strong>Brute-force</strong> - compute similarity against every stored vector, every query, then sort. Exact (always finds the true nearest neighbors), but time cost scales linearly with the number of stored vectors (O(N) per query).</li>
<li><strong>ANN indexing (e.g. HNSW)</strong> - build a graph or tree structure over the vectors once, ahead of time (index build time is a one-time or incremental cost), and use it to answer each query in roughly logarithmic time by navigating the structure instead of scanning everything.</li>
<li>This is directly analogous to the difference between scanning every row of an un-indexed SQL table versus using a B-tree index on that column - a vector database's ANN index is the same kind of idea, applied to high-dimensional geometric similarity instead of exact/range matching.</li>
</ul>`,
            codeExamples: [
                `# Timing brute-force cosine similarity vs an HNSW-backed ANN index (FAISS) as the dataset grows
import time
import numpy as np
import faiss

def brute_force_search(query_vec, vectors, top_k=5):
    sims = vectors @ query_vec / (np.linalg.norm(vectors, axis=1) * np.linalg.norm(query_vec))
    return np.argsort(-sims)[:top_k]

rng = np.random.default_rng(0)
dim = 384  # typical sentence-embedding dimensionality

for n_vectors in [1_000, 100_000, 1_000_000]:
    vectors = rng.normal(size=(n_vectors, dim)).astype("float32")
    query = rng.normal(size=dim).astype("float32")

    start = time.perf_counter()
    brute_force_search(query, vectors)
    brute_time = time.perf_counter() - start

    index = faiss.IndexHNSWFlat(dim, 32)   # HNSW ANN index, 32 neighbors per graph node
    index.add(vectors)
    start = time.perf_counter()
    index.search(query.reshape(1, -1), 5)
    ann_time = time.perf_counter() - start

    print(f"n={n_vectors:>9,}  brute-force={brute_time*1000:7.2f}ms  HNSW={ann_time*1000:6.2f}ms")
# OUTPUT (illustrative - exact numbers depend on hardware, but the pattern holds):
# n=    1,000  brute-force=   0.85ms  HNSW=  0.09ms
# n=  100,000  brute-force=  42.10ms  HNSW=  0.15ms
# n=1,000,000  brute-force= 410.30ms  HNSW=  0.22ms
# (brute-force time grows roughly linearly with n; HNSW query time stays nearly flat)`
            ],
            codeExplanations: [
                `This directly demonstrates the scaling problem that motivates ANN indexing. brute_force_search computes cosine similarity between the query and EVERY stored vector, then sorts - a straightforward but O(N) operation per query. The loop runs this at three dataset sizes (1 thousand, 100 thousand, and 1 million random 384-dimensional vectors, a realistic embedding dimensionality) and times both the brute-force approach and a FAISS IndexHNSWFlat, which builds an HNSW graph index over the same vectors before searching. The printed timings show the key pattern: brute-force search time grows roughly proportionally with the number of stored vectors (getting noticeably slower at each step), while HNSW query time stays nearly flat regardless of dataset size, because it navigates a pre-built graph structure touching only a small fraction of vectors rather than comparing against all of them. This is exactly why a production RAG system or semantic search feature over millions of documents relies on an ANN-indexed vector database rather than a hand-rolled brute-force loop - the brute-force approach that works fine in a small demo becomes completely impractical at real production scale.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>A company builds a RAG-powered support chatbot (see the companion <strong>RAG</strong> topic on this site) backed by their entire internal documentation - hundreds of thousands of product manual pages, help-center articles, and past resolved support tickets, chunked and embedded into millions of vectors. When a customer asks a question, the chatbot needs to find the handful of most relevant chunks out of millions in well under a second, since users expect a chat response, not a multi-second wait.</li>
<li>They choose <strong>Pinecone</strong> (a fully managed cloud vector database) as the retrieval backend rather than rolling their own brute-force search: it handles ANN indexing (HNSW-based), horizontal scaling as the document set grows, and importantly <strong>metadata filtering</strong> - alongside each vector, they store metadata like <code>{"product": "wireless_mouse", "doc_type": "manual", "last_updated": "2026-01"}</code>, so a query can be restricted to "only search chunks where product = wireless_mouse AND doc_type = manual" BEFORE (or combined with) the similarity search, instead of retrieving from the entire corpus and hoping the nearest vectors happen to be relevant to that specific product.</li>
<li>This combination - fast ANN similarity search plus structured metadata filtering - is what lets the chatbot correctly answer "what's the battery life on the wireless mouse?" using only wireless-mouse documentation, instead of accidentally retrieving a similarly-worded but wrong chunk about a completely different product's battery.</li>
</ul>`,
            codeExamples: [
                `# Vector search combined with metadata filtering (Pinecone-style pseudocode)
class FakePineconeIndex:
    """Stand-in for a real Pinecone/Weaviate index to illustrate the query pattern."""
    def __init__(self):
        self.records = []  # each: (id, vector, metadata, text)

    def upsert(self, records):
        self.records.extend(records)

    def query(self, vector, top_k, filter=None):
        import numpy as np
        candidates = self.records
        if filter:
            candidates = [r for r in candidates if all(r[2].get(k) == v for k, v in filter.items())]
        sims = [(r, float(np.dot(vector, r[1])) / (np.linalg.norm(vector) * np.linalg.norm(r[1])))
                for r in candidates]
        sims.sort(key=lambda x: -x[1])
        return sims[:top_k]

import numpy as np
rng = np.random.default_rng(0)
index = FakePineconeIndex()

docs = [
    ("chunk1", "Wireless mouse battery lasts approximately 6 months on 2 AA batteries.", {"product": "wireless_mouse"}),
    ("chunk2", "Wireless keyboard battery lasts approximately 8 months on a single AAA battery.", {"product": "wireless_keyboard"}),
    ("chunk3", "Wireless mouse Bluetooth pairing: hold the button for 3 seconds until the LED blinks.", {"product": "wireless_mouse"}),
]
index.upsert([(doc_id, rng.normal(size=384), meta, text) for doc_id, text, meta in docs])

query_vec = rng.normal(size=384)  # in reality this would be embed("battery life of wireless mouse")

# WITHOUT metadata filtering - could retrieve battery info about the WRONG product
unfiltered = index.query(query_vec, top_k=1)
print("Unfiltered top match:", unfiltered[0][0][0])

# WITH metadata filtering - restrict search to only wireless_mouse chunks first
filtered = index.query(query_vec, top_k=1, filter={"product": "wireless_mouse"})
print("Filtered top match:", filtered[0][0][0])
# OUTPUT (illustrative - exact winner among unfiltered candidates depends on the random vectors,
# but the pattern holds: unfiltered search can select any product's chunk, filtered cannot):
# Unfiltered top match: chunk2
# Filtered top match: chunk1`
            ],
            codeExplanations: [
                `This models the metadata-filtering capability that distinguishes a production vector database from a bare nearest-neighbor search library. FakePineconeIndex stores each vector alongside structured metadata (which product it belongs to) and its source text, mirroring how Pinecone, Weaviate, and similar systems let you attach arbitrary key-value metadata to every stored vector. The query method demonstrates the two ways a real query can run: an unfiltered similarity search across the entire corpus, versus a filtered search that first restricts candidates to only those matching a metadata condition (here, product == "wireless_mouse") and only THEN ranks by vector similarity. Because the random vectors used here as a stand-in for real embeddings don't reliably favor the semantically correct chunk, the unfiltered search can end up matching a chunk from the wrong product entirely (chunk2, about the keyboard) - exactly the failure mode described in the real-world scenario, where a similarity-only search over a mixed-product corpus can retrieve confidently-wrong context. The filtered query eliminates that risk structurally by never considering out-of-scope candidates in the first place, which is why production RAG systems combine vector similarity with metadata filters rather than relying on embedding similarity alone to enforce scope.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Scales to millions/billions of vectors with low query latency</strong> - ANN indexing (HNSW and similar algorithms) keeps query time close to flat as the dataset grows, which is what makes real-time semantic search or RAG retrieval feasible over a company's entire knowledge base rather than just a small demo dataset.</li>
<li><strong>Retrieval by meaning, not just keywords</strong> - because embeddings capture semantic similarity, a vector database finds relevant results even when the query's wording differs entirely from the stored document's wording (e.g. "money back" finding a document about "refunds"), something traditional keyword search structurally cannot do.</li>
<li><strong>Metadata filtering combined with vector search</strong> - purpose-built vector databases (Pinecone, Weaviate) let you combine semantic similarity with structured filters (by category, date, user permissions, product line), which is essential for keeping retrieval scoped correctly in any real multi-tenant or multi-category application.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Approximate means occasionally imperfect recall</strong> - ANN indexes like HNSW are explicitly a speed/accuracy tradeoff; they can occasionally miss the single mathematically closest vector in favor of a very close (but not truly closest) one, which is usually an acceptable tradeoff but is a real accuracy cost compared to brute-force exact search.</li>
<li><strong>Index build and update cost</strong> - inserting new vectors into an HNSW-style graph index isn't free, and for some index types, bulk-rebuilding the index for large-scale changes can be resource-intensive; a corpus that changes very frequently (near real-time updates) needs to account for this rather than assuming inserts are instantaneous at any scale.</li>
<li><strong>Operational complexity and cost of a new system</strong> - a managed vector database (like Pinecone) is another paid, monitored, scaled infrastructure component in the stack, and even a self-hosted option (FAISS, Chroma) requires real engineering effort to run reliably in production - it's genuinely more moving parts than a traditional application database for teams not already running one.</li>
</ul>`,
            codeExamples: [
                `# Illustrating approximate recall: HNSW occasionally misses the TRUE nearest neighbor vs brute-force
import numpy as np
import faiss

rng = np.random.default_rng(42)
dim = 128
n_vectors = 50_000
vectors = rng.normal(size=(n_vectors, dim)).astype("float32")

# ground truth: exact brute-force nearest neighbor
flat_index = faiss.IndexFlatL2(dim)
flat_index.add(vectors)

# approximate: HNSW index with a smaller construction/search effort (lower ef -> faster but less recall)
hnsw_index = faiss.IndexHNSWFlat(dim, 16)
hnsw_index.hnsw.efSearch = 8   # deliberately low search effort to make the approximation visible
hnsw_index.add(vectors)

n_queries = 200
queries = rng.normal(size=(n_queries, dim)).astype("float32")

_, exact_ids = flat_index.search(queries, 1)
_, approx_ids = hnsw_index.search(queries, 1)

matches = np.sum(exact_ids.ravel() == approx_ids.ravel())
print(f"HNSW found the TRUE nearest neighbor in {matches}/{n_queries} queries "
      f"({matches / n_queries * 100:.1f}% recall@1)")
print("The rest returned a very close, but not mathematically closest, match - the speed/accuracy tradeoff.")
# OUTPUT (illustrative - exact recall depends on parameters, but is reliably less than 100% at low efSearch):
# HNSW found the TRUE nearest neighbor in 187/200 queries (93.5% recall@1)
# The rest returned a very close, but not mathematically closest, match - the speed/accuracy tradeoff.`
            ],
            codeExplanations: [
                `This makes the "approximate" in Approximate Nearest Neighbor concrete and measurable rather than a vague caveat. An exact brute-force index (IndexFlatL2) is built as the ground truth, alongside an HNSW index deliberately configured with a low efSearch value (the parameter that controls how much of the graph is explored per query - lower means faster but less thorough). Running the same 200 random queries against both indexes and comparing which single nearest vector each one returns reveals that HNSW doesn't always agree with the exact brute-force answer - the printed recall@1 percentage shows how often the two methods matched. This is the real, quantifiable cost of choosing an ANN index: in exchange for query times that stay nearly flat regardless of dataset size (as shown in the earlier scaling example), HNSW occasionally returns the second- or third-closest vector instead of the true closest one. In practice this tradeoff is tunable (increasing efSearch or the HNSW graph's connectivity parameter improves recall at the cost of some speed), and for most real applications the resulting handful of "very close but not literally closest" retrievals are still semantically good enough - but it's a real accuracy tradeoff a team explicitly chooses, not a hidden bug.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't brute-force cosine similarity search scale to millions of vectors in a production system?</td><td>Brute-force search compares the query vector against every single stored vector and sorts the results, which is an O(N) operation per query - as N grows into the millions, per-query latency grows roughly linearly and becomes far too slow for a live application expecting sub-second responses. A vector database instead builds an Approximate Nearest Neighbor (ANN) index, such as HNSW, ahead of time so each query can be answered by navigating a pre-built graph structure rather than scanning every stored vector, keeping query time close to flat as the dataset grows</td></tr>
<tr class='text-center'><td>What does "approximate" mean in Approximate Nearest Neighbor search, and why is that an acceptable tradeoff?</td><td>ANN algorithms like HNSW don't guarantee finding the mathematically exact closest vector on every query - they navigate a graph or tree structure that's very likely, but not provably certain, to surface the true nearest neighbors, occasionally returning the second- or third-closest instead. This is an acceptable tradeoff because the resulting near-closest matches are usually still semantically good enough for the downstream use case (e.g. RAG retrieval), while the latency savings versus exact brute-force search at scale (milliseconds vs. hundreds of milliseconds or worse) are essential for any real-time application</td></tr>
<tr class='text-center'><td>Why would a production RAG system combine vector similarity search with metadata filtering, rather than relying on vector similarity alone?</td><td>Vector similarity alone can retrieve a chunk that's semantically close in wording but from the wrong scope entirely - e.g. battery-life text about the wrong product, or a document a given user shouldn't have access to. Metadata filtering (by product, category, date, permission level, etc.) lets a query restrict the candidate set to only relevant/authorized records before or alongside the similarity ranking, which structurally prevents cross-scope retrieval errors that pure embedding similarity cannot reliably avoid on its own</td></tr>
</table>`
        }
    ]
};
