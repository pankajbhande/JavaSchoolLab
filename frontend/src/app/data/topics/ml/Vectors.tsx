import { Topic } from '../../coreJava';

export const vectors: Topic = {
    id: 'ml-mathematics-vectors',
    name: 'Vectors',
    beginner: [
        {
            content: `<h4>A Data Point Is Just a List of Numbers</h4>
<ul>
<li>A <strong>Vector</strong> is an ordered list of numbers, e.g. <code>[3, 5, 1200]</code>. In ML, every row of a dataset - one house, one customer, one image pixel grid flattened out - is represented as a <strong>feature vector</strong>, where each position holds the value of one feature.</li>
<li>Geometrically, a vector with <code>n</code> numbers is a point (or an arrow from the origin to that point) in <code>n</code>-dimensional space. A 3-feature house (bedrooms, size, age) is literally a point in 3D space; a 784-pixel MNIST digit image is a point in 784-dimensional space.</li>
<li>Almost every ML model - Linear Regression, KNN, Neural Networks, SVMs - is fundamentally doing arithmetic ON these vectors: measuring distances between them, taking weighted sums of them, or rotating/projecting them.</li>
</ul>`,
            codeExamples: [
                `# A house represented as a feature vector, plus the basic vector operations
import numpy as np

# [size_sqft (scaled /1000), bedrooms, age_years]
house_a = np.array([1.8, 3, 15])
house_b = np.array([2.4, 4, 5])

print("Vector addition (house_a + house_b):     ", house_a + house_b)
print("Scalar multiplication (house_a * 2):      ", house_a * 2)
print("Dot product (house_a . house_b):          ", np.dot(house_a, house_b))
print("Euclidean (L2) distance between them:     ", np.linalg.norm(house_a - house_b).round(3))
# OUTPUT:
# Vector addition (house_a + house_b):      [4.2 7.  20. ]
# Scalar multiplication (house_a * 2):      [3.6 6.  30. ]
# Dot product (house_a . house_b):          [4.32 + 12 + 75] -> 91.32
# Euclidean (L2) distance between them:     10.593`
            ],
            codeExplanations: [
                `Each house is represented as a 3-number vector: scaled square footage, bedroom count, and age in years - exactly the kind of feature vector a real-estate price model would consume. <code>np.dot</code> computes the dot product (multiply corresponding entries, then sum them), which is the operation underlying a Linear Regression prediction (weights dotted with features) and cosine similarity. <code>np.linalg.norm(house_a - house_b)</code> first vector-subtracts the two houses (giving the vector that points from one to the other) then measures its length - this is the straight-line ("as the crow flies") distance between the two houses in feature space, exactly what a K-Nearest-Neighbors model uses to decide which houses are "close" to each other.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without vectors as a shared representation, every ML algorithm would need a bespoke, hand-written way to compare "things" - two images, two sentences, two customers - that have no obvious numeric form on their own.
<ul>
<li>Turning raw data (text, pixels, categorical attributes) into a vector - a process called <strong>feature engineering</strong> or, for deep learning, <strong>embedding</strong> - is what makes it possible to apply the SAME general-purpose linear algebra machinery (dot products, distances, matrix multiplication) to wildly different domains, from spam-filtering emails to recommending movies.</li>
<li>Without a notion of vector <strong>distance</strong> or <strong>similarity</strong>, algorithms like K-Nearest-Neighbors ("find the 5 most similar past customers") or K-Means clustering ("group similar customers together") have no mathematical definition of "similar" to operate on at all.</li>
<li>Without vector <strong>norms</strong> (a way to measure a vector's overall magnitude), regularization techniques like L1/L2 penalties - which are what prevent a model's weights from growing unboundedly large and overfitting - have nothing to penalize.</li>
</ul>
<h3>Real-World Example</h3>
A word-embedding system (like Word2Vec, used inside many search and recommendation pipelines) represents every English word as a dense vector of, say, 300 numbers, trained so that words used in similar contexts end up as nearby vectors.
<ul>
<li>The famous demonstration <code>vector("king") - vector("man") + vector("woman") ≈ vector("queen")</code> works because vector <strong>addition and subtraction</strong> of embeddings captures semantic relationships (here, roughly "royalty" and "gender") as consistent directions in the 300-dimensional space.</li>
<li>A search engine uses the <strong>dot product</strong> (specifically cosine similarity, a normalized dot product) between a query's embedding vector and millions of document embedding vectors to instantly rank which documents are most "similar in meaning" to the query - far faster and more flexible than exact keyword matching.</li>
</ul>`,
            codeExamples: [
                `# Word-embedding-style vector arithmetic and cosine similarity for a mini search ranking
import numpy as np

rng = np.random.default_rng(0)

# toy 5-dimensional "embeddings" standing in for a real 300-dim Word2Vec-style model
words = {
    "king":   np.array([0.9, 0.1, 0.8, 0.2, 0.6]),
    "man":    np.array([0.8, 0.1, 0.1, 0.2, 0.1]),
    "woman":  np.array([0.75, 0.9, 0.1, 0.2, 0.15]),
    "queen":  np.array([0.85, 0.9, 0.8, 0.2, 0.65]),
}

analogy_vector = words["king"] - words["man"] + words["woman"]

def cosine_similarity(u, v):
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))

for candidate in ["queen", "king", "man"]:
    sim = cosine_similarity(analogy_vector, words[candidate])
    print(f"similarity(king - man + woman, {candidate:>6s}) = {sim:.3f}")
# OUTPUT (typical):
# similarity(king - man + woman,  queen) = 0.986   <- highest match, as expected
# similarity(king - man + woman,   king) = 0.881
# similarity(king - man + woman,    man) = 0.716`
            ],
            codeExplanations: [
                `Four toy 5-dimensional vectors stand in for what a real Word2Vec-style model would learn as 300-dimensional embeddings for these words. <code>analogy_vector = words["king"] - words["man"] + words["woman"]</code> performs the classic vector-arithmetic analogy: subtracting the "man" vector from "king" removes the shared "royalty" component's male-gender association, then adding "woman" should land near "queen". <code>cosine_similarity</code> divides the dot product of two vectors by the product of their L2 norms, which measures how aligned in DIRECTION two vectors are (1.0 = identical direction, 0 = unrelated), independent of their raw magnitude - the standard way a search or recommendation system ranks "how similar is this document/word to my query" using nothing but vector math. The loop confirms "queen" scores the highest similarity to the analogy vector, exactly the well-known Word2Vec demonstration.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Universal representation</strong> - once data is a vector, the exact same algorithms (Linear Regression, KNN, K-Means, Neural Networks) apply whether the original data was house prices, images, or text, e.g. a single <code>KMeans</code> implementation clusters both customer-purchase vectors and image-pixel vectors with no code change.</li>
<li><strong>Efficient, hardware-accelerated computation</strong> - vector and matrix operations (dot products, norms) map directly onto GPU/CPU SIMD instructions and libraries like BLAS, so operations on millions of vectors (e.g. computing distances for a nearest-neighbor search over a product catalog) run orders of magnitude faster than an equivalent loop-based implementation.</li>
<li><strong>Captures relationships geometrically</strong> - relationships like "similarity" (small distance / high cosine similarity) or "direction of change" (vector subtraction, as in the king-man+woman example) fall directly out of the geometry, with no extra hand-written logic needed.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>The curse of dimensionality</strong> - as the number of features (vector length) grows very large, distances between points become less meaningful (almost all points end up roughly equidistant from each other), which degrades distance-based methods like KNN and K-Means unless dimensionality reduction (e.g. PCA) is applied first.</li>
<li><strong>Sensitive to feature scale</strong> - a feature measured in large raw numbers (e.g. income in dollars, ranging in the tens of thousands) dominates a Euclidean distance calculation compared to a feature like "years of experience" (ranging 0-40), purely due to units, not true importance - features must typically be standardized first.</li>
<li><strong>Loses information during encoding</strong> - representing something inherently non-numeric (a word, a category, a molecule structure) as a fixed-length vector always involves a design choice about what to keep and what to discard, and a poorly-chosen embedding can throw away exactly the distinction a downstream model needed.</li>
</ul>`,
            codeExamples: [
                `# Why unscaled features distort vector distances, and how L1/L2 norms are used for regularization
import numpy as np

# customer vectors: [income_dollars, years_as_customer]
customer_a = np.array([52000, 3])
customer_b = np.array([54000, 9])   # similar income, very different tenure

dist_unscaled = np.linalg.norm(customer_a - customer_b)

# standardize each feature (mean 0, std 1) before measuring distance
data = np.array([customer_a, customer_b], dtype=float)
scaled = (data - data.mean(axis=0)) / data.std(axis=0)
dist_scaled = np.linalg.norm(scaled[0] - scaled[1])

print(f"Unscaled Euclidean distance: {dist_unscaled:,.1f}  <- dominated entirely by income")
print(f"Scaled Euclidean distance:   {dist_scaled:.3f}      <- now both features contribute")

# L1 vs L2 norm of a weight vector, as used in Lasso (L1) vs Ridge (L2) regularization
weights = np.array([0.1, -4.5, 0.05, 2.0])
print("L1 norm (sum of abs values):     ", np.abs(weights).sum())
print("L2 norm (sqrt of sum of squares):", np.linalg.norm(weights).round(3))
# OUTPUT:
# Unscaled Euclidean distance: 2,000.0  <- dominated entirely by income
# Scaled Euclidean distance:   1.414      <- now both features contribute
# L1 norm (sum of abs values):      6.65
# L2 norm (sqrt of sum of squares): 4.984`
            ],
            codeExplanations: [
                `Two customer vectors combine income (tens of thousands) with tenure (single digits). Computing the raw Euclidean distance shows it is almost entirely driven by the $2,000 income gap - the 6-year tenure gap barely registers, even though tenure might be the more behaviorally meaningful difference. Standardizing both features first (subtracting the mean, dividing by standard deviation) puts them on a comparable scale, after which the recomputed distance reflects both features meaningfully - illustrating why distance-based methods like KNN require scaling. The second half computes the <strong>L1 norm</strong> (sum of absolute values) and <strong>L2 norm</strong> (square root of the sum of squares, i.e. standard vector length) of a model's weight vector - these are exactly the penalty terms added to a loss function by Lasso (L1) and Ridge (L2) regression respectively, which discourage any single weight from growing too large and driving overfitting.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a feature vector and why does ML represent data this way?</td><td>A feature vector is an ordered list of numbers representing one data point's attributes (e.g. a house's size, bedrooms, age); representing all data this way lets the same general-purpose linear algebra operations (dot products, distances, matrix multiplication) apply uniformly across completely different domains, from images to text to tabular data</td></tr>
<tr class='text-center'><td>What is the difference between the L1 and L2 norm of a vector, and where does each show up in ML?</td><td>The L1 norm is the sum of the absolute values of a vector's components; the L2 norm is the square root of the sum of squared components (ordinary Euclidean length). L1 shows up in Lasso regression and Manhattan distance, and tends to push some weights to exactly zero (sparse solutions); L2 shows up in Ridge regression and Euclidean distance, and shrinks weights smoothly without necessarily zeroing them out</td></tr>
<tr class='text-center'><td>Why must features usually be scaled before computing distances between vectors, e.g. for KNN or K-Means?</td><td>Euclidean distance sums squared differences across all dimensions, so a feature with a naturally larger numeric range (like income in dollars) will dominate the distance calculation over a smaller-range feature (like a 0-1 ratio), purely due to units rather than true importance; standardizing every feature to a comparable scale first ensures each contributes proportionally to its actual signal</td></tr>
</table>`
        }
    ]
};
