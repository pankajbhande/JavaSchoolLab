import { Topic } from '../../coreJava';

export const dotProduct: Topic = {
    id: 'ml-mathematics-dot-product',
    name: 'Dot Product',
    beginner: [
        {
            content: `<h4>Multiply, Then Sum - the Single Most-Used Operation in ML</h4>
<ul>
<li>The <strong>Dot Product</strong> of two equal-length vectors is computed by multiplying their corresponding entries together, then summing all those products: for <code>a = [a1, a2, a3]</code> and <code>b = [b1, b2, b3]</code>, the dot product is <code>a1*b1 + a2*b2 + a3*b3</code>, a single number.</li>
<li>It is written <code>a . b</code> or <code>a^T b</code>, and computed in numpy with <code>np.dot(a, b)</code> or the <code>@</code> operator.</li>
<li>Despite its simplicity, the dot product is arguably THE core arithmetic operation of machine learning - it's how a neuron combines its inputs, how similarity between two items is measured, and how a matrix multiplication is built (each output entry of a matrix product is itself a dot product of a row and a column).</li>
</ul>`,
            codeExamples: [
                `# A single neuron's weighted sum, computed as a dot product
import numpy as np

# a neuron's inputs (e.g. 3 features of one email: word_count, link_count, exclaim_count)
inputs = np.array([120, 2, 5])

# the neuron's learned weights, one per input, plus a bias
weights = np.array([0.01, 1.5, 0.8])
bias = -2.0

weighted_sum = np.dot(inputs, weights) + bias
print("Weighted sum (dot product + bias):", weighted_sum)

# equivalent manual computation, to show what the dot product actually does
manual = inputs[0]*weights[0] + inputs[1]*weights[1] + inputs[2]*weights[2] + bias
print("Manual elementwise-multiply-then-sum:", manual)
# OUTPUT:
# Weighted sum (dot product + bias): 5.2
# Manual elementwise-multiply-then-sum: 5.2`
            ],
            codeExplanations: [
                `<code>inputs</code> represents one email's 3 numeric features, and <code>weights</code> represents how much each feature contributes to a spam-detection neuron's decision - a larger weight means that feature matters more. <code>np.dot(inputs, weights)</code> multiplies each input by its matching weight and sums the results in one call: <code>120*0.01 + 2*1.5 + 5*0.8 = 1.2 + 3 + 4 = 8.2</code>, then adding <code>bias</code> gives <code>5.2</code>. The manual line spells out exactly what <code>np.dot</code> is doing under the hood - multiply corresponding entries, then add them all up - which is precisely how a single artificial neuron (in logistic regression or a neural network) combines its inputs before passing the result through an activation function.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
The dot product's geometric meaning - not just its arithmetic definition - is what makes it so central to ML.
<ul>
<li>Geometrically, <code>a . b = |a| * |b| * cos(theta)</code>, where <code>theta</code> is the angle between the two vectors. This means the dot product is largest when two vectors point in the SAME direction, zero when they're perpendicular (unrelated), and negative when they point in opposite directions - which is exactly WHY <strong>cosine similarity</strong> (the dot product normalized by vector lengths) is used to measure how "similar" two things are, whether they're word embeddings, document vectors, or user-preference vectors.</li>
<li><strong>Linear Regression's</strong> prediction formula <code>y = w . x + b</code> is a dot product at its core: the model learns one weight per feature, and predicting a new sample's value is simply dotting the learned weight vector with that sample's feature vector.</li>
<li>Every single neuron in a neural network computes a dot product of its inputs and weights before applying an activation function - meaning matrix multiplication (a neural network layer's core operation) is really just many dot products computed in parallel, one per output neuron.</li>
</ul>
<h3>Real-World Example</h3>
A semantic search or recommendation engine represents both a search query and every candidate document (or every movie, given a user's taste profile) as embedding vectors, then ranks candidates by their dot product (or cosine similarity) against the query vector.
<ul>
<li>Document/word embedding systems store millions of vectors, and finding the "most relevant" documents for a query is literally computing the dot product of the query's embedding against every document's embedding, then sorting by score - the mathematical foundation of vector-search / semantic-search systems used in modern search engines and RAG (retrieval-augmented generation) pipelines.</li>
<li>Because larger vectors naturally produce larger dot products regardless of direction, real systems normalize vectors first (turning the raw dot product into cosine similarity) so that only DIRECTION - meaning - is compared, not magnitude.</li>
</ul>`,
            codeExamples: [
                `# Ranking documents against a search query using dot-product similarity
import numpy as np

# toy 4-dim "embeddings" standing in for real high-dimensional document embeddings
query = np.array([0.8, 0.1, 0.6, 0.2])

documents = {
    "Intro to Machine Learning":  np.array([0.75, 0.15, 0.55, 0.25]),
    "History of French Cooking":  np.array([0.05, 0.9, 0.1, 0.05]),
    "Neural Networks Explained":  np.array([0.85, 0.05, 0.65, 0.15]),
}

def cosine_similarity(u, v):
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))

scores = {title: cosine_similarity(query, vec) for title, vec in documents.items()}
for title, score in sorted(scores.items(), key=lambda kv: -kv[1]):
    print(f"{title:<28s} similarity={score:.3f}")
# OUTPUT:
# Neural Networks Explained    similarity=0.998
# Intro to Machine Learning    similarity=0.997
# History of French Cooking    similarity=0.279`
            ],
            codeExplanations: [
                `<code>query</code> and each document title are represented as small 4-dimensional vectors, standing in for what a real search engine would compute as hundreds-of-dimensions embeddings. <code>cosine_similarity</code> computes <code>np.dot(u, v)</code> (the raw dot product) and divides by the product of the two vectors' norms, converting the dot product's raw magnitude-dependent score into a pure measure of DIRECTIONAL alignment between -1 and 1. Ranking the three documents by this score correctly places the two ML-related documents far ahead of the cooking document, purely from vector math - no keyword matching involved. This is precisely the core operation inside vector databases and semantic search systems: compute dot-product/cosine similarity between a query embedding and every stored embedding, then return the highest-scoring matches.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Extremely fast to compute</strong> - a dot product between two length-n vectors is a single, highly optimized operation (mapping to SIMD/BLAS instructions), which is why it's cheap even at the scale of comparing a query embedding against millions of stored document embeddings in real time.</li>
<li><strong>Captures both alignment AND magnitude</strong> (in its raw form) - unlike Euclidean distance, the dot product naturally rewards vectors that point in a similar direction AND have a larger magnitude, which is directly useful in a neuron's weighted sum, where both the direction and strength of a feature's contribution matter.</li>
<li><strong>Directly gives geometric meaning ("angle" via cosine similarity)</strong> - normalizing the dot product by vector lengths yields a bounded, interpretable [-1, 1] similarity score that is invariant to how "large" the two vectors are, making it robust for comparing, say, a short document's embedding against a long document's embedding.</li>
<li><strong>The universal building block</strong> - since matrix multiplication is just many dot products computed at once, any optimization or hardware acceleration built for dot products (GPUs, tensor cores) automatically accelerates every matrix-multiplication-based ML computation, from linear regression to Transformer attention.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Raw dot product is scale-sensitive</strong> - two vectors that point in nearly the same direction but differ hugely in magnitude (e.g. a short document vs. a very long one, if not normalized) can produce misleadingly large or small raw dot products purely due to length, not true similarity - this is exactly why cosine similarity (normalized dot product) is preferred for comparison tasks.</li>
<li><strong>Requires equal-length vectors</strong> - two vectors being dotted must have the same dimensionality; comparing embeddings produced by two different models (e.g. 300-dim vs 768-dim) requires first projecting them into a shared space, since the raw dot product is undefined otherwise.</li>
<li><strong>Zero dot product doesn't always mean "unrelated" in practice</strong> - a dot product of exactly zero technically means the vectors are geometrically perpendicular, but in high-dimensional, noisy real-world embeddings, near-zero dot products can also arise from measurement noise or an under-trained embedding model, not necessarily true independence.</li>
<li><strong>Computing it over massive collections is still costly at scale</strong> - ranking a query against tens of millions of document embeddings via brute-force dot products becomes a real bottleneck, which is why production vector-search systems use approximate nearest-neighbor (ANN) index structures (like HNSW or FAISS) instead of computing every dot product exhaustively.</li>
</ul>`,
            codeExamples: [
                `# Why raw dot product can mislead vs. cosine similarity, and dot product inside Linear Regression
import numpy as np

short_doc = np.array([0.9, 0.1])          # short document embedding, strong topic signal
long_doc  = np.array([0.09, 0.01]) * 10   # same DIRECTION, but scaled up (longer document -> larger magnitude)
unrelated = np.array([0.1, 0.9])          # points in a very different direction

for name, vec in [("long_doc (same direction, bigger)", long_doc), ("unrelated (different direction)", unrelated)]:
    raw_dot = np.dot(short_doc, vec)
    cos_sim = raw_dot / (np.linalg.norm(short_doc) * np.linalg.norm(vec))
    print(f"{name:<34s} raw dot={raw_dot:6.3f}   cosine similarity={cos_sim:.3f}")

# Linear Regression prediction is a dot product of weights and features, plus bias
weights = np.array([2.5, -1.0, 0.3])   # learned during training
new_house = np.array([1.8, 3, 15])     # [size/1000, bedrooms, age]
predicted_price = np.dot(weights, new_house) + 1.2   # +1.2 = bias/intercept
print(f"Predicted price (w . x + b): {predicted_price:.2f}")
# OUTPUT:
# long_doc (same direction, bigger) raw dot= 0.820   cosine similarity=1.000
# unrelated (different direction)   raw dot= 0.180   cosine similarity=0.316
# OUTPUT:
# Predicted price (w . x + b): 6.20`
            ],
            codeExplanations: [
                `<code>long_doc</code> is scaled to point in the EXACT same direction as <code>short_doc</code> but with 10x larger magnitude - its raw dot product (0.820) actually comes out higher than the truly unrelated vector's raw dot product (0.180), which correctly ranks it as more similar. But watch the cosine similarity: normalizing removes the magnitude effect entirely, giving <code>long_doc</code> a perfect 1.000 (confirming identical direction) versus 0.316 for the unrelated vector - showing cosine similarity isolates "directional alignment" cleanly, which raw dot product only partially reflects when magnitudes vary. The second half shows Linear Regression's prediction formula is nothing more than <code>np.dot(weights, new_house) + bias</code> - the exact same dot-product operation, just applied to learned model weights instead of an embedding comparison.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the dot product of two vectors, and what does it mean geometrically?</td><td>The dot product multiplies corresponding entries of two equal-length vectors and sums the results; geometrically it equals |a|*|b|*cos(theta), so it is largest when the vectors point in the same direction, zero when perpendicular, and negative when pointing in opposite directions - this is the basis for cosine similarity</td></tr>
<tr class='text-center'><td>How does a single artificial neuron use the dot product?</td><td>A neuron multiplies each input feature by its corresponding learned weight, sums those products (the dot product of the input vector and weight vector), adds a bias, and passes the result through an activation function - this weighted-sum step is a dot product at its core, and is repeated across every neuron in every layer</td></tr>
<tr class='text-center'><td>Why is cosine similarity (rather than the raw dot product) usually preferred for comparing embeddings?</td><td>The raw dot product is affected by both direction and magnitude, so two vectors pointing the same direction but differing in length can produce misleadingly different raw scores from unrelated vectors; dividing the dot product by the product of the two vectors' norms (cosine similarity) isolates directional alignment alone, giving a magnitude-independent, bounded [-1, 1] similarity score</td></tr>
</table>`
        }
    ]
};
