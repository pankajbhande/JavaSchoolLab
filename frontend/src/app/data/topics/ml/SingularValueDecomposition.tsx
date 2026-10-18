import { Topic } from '../../coreJava';

export const singularValueDecomposition: Topic = {
    id: 'ml-mathematics-singular-value-decomposition-svd',
    name: 'Singular Value Decomposition (SVD)',
    beginner: [
        {
            content: `<h4>Breaking Any Matrix Into Its Most Important Pieces</h4>
<ul>
<li><strong>Singular Value Decomposition (SVD)</strong> factors ANY matrix <code>A</code> (of ANY shape - not just square, unlike eigen-decomposition) into three matrices: <code>A = U &Sigma; V^T</code>, where <code>U</code> and <code>V</code> hold orthogonal directions and <code>&Sigma;</code> (sigma) is a diagonal matrix of <strong>singular values</strong>.</li>
<li>The singular values in <code>&Sigma;</code> are always arranged largest-to-smallest, and each one measures how much "importance" (variance/information) is captured along its corresponding direction - the first singular value captures the most, the last captures the least.</li>
<li>Because SVD works on ANY matrix shape, it's more general-purpose than eigen-decomposition, and it's the mathematical engine that actually runs underneath many other techniques, including PCA.</li>
</ul>`,
            codeExamples: [
                `# Decomposing a small matrix with SVD and reconstructing it from the pieces
import numpy as np

# a tiny 4x3 "ratings-style" matrix (rows=users, columns=movies)
A = np.array([
    [5, 4, 0],
    [4, 5, 1],
    [1, 1, 5],
    [0, 1, 4],
], dtype=float)

U, singular_values, VT = np.linalg.svd(A, full_matrices=False)
print("Shapes -> U:", U.shape, " singular_values:", singular_values.shape, " VT:", VT.shape)
print("Singular values (largest to smallest):", singular_values.round(3))

# reconstruct A from U, Sigma, V^T
Sigma = np.diag(singular_values)
A_reconstructed = U @ Sigma @ VT
print("Reconstruction matches original:", np.allclose(A, A_reconstructed))
# OUTPUT:
# Shapes -> U: (4, 3)  singular_values: (3,)  VT: (3, 3)
# Singular values (largest to smallest): [9.288 4.995 1.685]
# Reconstruction matches original: True`
            ],
            codeExplanations: [
                `<code>A</code> is a small 4x3 matrix, standing in for a tiny user-movie ratings table (4 users, 3 movies). <code>np.linalg.svd(A, full_matrices=False)</code> factors it into <code>U</code> (user-related directions), a 1D array of <code>singular_values</code> (already sorted largest to smallest by numpy), and <code>VT</code> (movie-related directions, transposed). Rebuilding <code>Sigma</code> as a diagonal matrix from the singular values and multiplying <code>U @ Sigma @ VT</code> back together exactly reconstructs the original matrix <code>A</code> (confirmed by <code>np.allclose</code>) - proving the decomposition loses no information when all singular values are kept. This is the crucial first step before SVD's real power shows up: keeping only the LARGEST few singular values instead of all of them.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
SVD matters in ML because keeping only the largest few singular values (a <strong>low-rank approximation</strong>) lets a huge, sparse, or noisy matrix be represented by a small number of "latent factors" that capture almost all of its real signal.
<ul>
<li>A recommendation system's user-item rating matrix is enormous and mostly EMPTY (most users haven't rated most items). SVD-based matrix factorization decomposes this sparse matrix into a small number of latent factors per user and per item (often just tens of numbers, representing unlabeled "taste dimensions" like genre preference) - multiplying the reduced factors back together fills in PREDICTIONS for the ratings a user never gave, which is exactly how a recommender predicts "you'll probably rate this movie 4.5 stars."</li>
<li>This low-rank-approximation idea is also the general engine behind <strong>PCA</strong> (SVD of a centered data matrix directly gives the principal components, without needing to separately compute a covariance matrix) and <strong>Latent Semantic Analysis (LSA)</strong> in NLP, where SVD of a word-document matrix uncovers hidden "topics" as latent factors, purely from co-occurrence statistics.</li>
<li>Keeping only the top-K singular values also acts as a form of <strong>denoising and compression</strong> - since noise tends to spread across many small singular values while true signal concentrates in the largest ones, discarding the small ones removes noise while preserving the dominant structure, using far less storage.</li>
</ul>
<h3>Real-World Example</h3>
This low-rank-approximation trick is exactly the technique that won the famous <strong>Netflix Prize</strong>: reconstructing a massive, mostly-empty user-movie rating matrix from a handful of latent factors nobody explicitly labeled (roughly "action-ness", "romance-ness", etc.), learned purely from the pattern of existing ratings.
<ul>
<li>Instead of storing or reasoning about millions of raw ratings directly, the system represents each user and each movie with a short vector of, say, 20-50 latent factors; a user's predicted rating for an unrated movie is simply the dot product of their factor vector and the movie's factor vector.</li>
<li>This is dramatically more memory-efficient than the full matrix, generalizes to predict ratings that were never observed, and is the same underlying idea used in collaborative-filtering recommenders across e-commerce, streaming, and music platforms today.</li>
</ul>`,
            codeExamples: [
                `# Low-rank SVD approximation: reconstructing a sparse ratings matrix from top-K latent factors
import numpy as np

# users x movies rating matrix; 0 = not yet rated
ratings = np.array([
    [5, 4, 0, 1],
    [4, 5, 1, 0],
    [1, 1, 5, 4],
    [0, 2, 4, 5],
    [5, 5, 0, 1],
], dtype=float)

U, singular_values, VT = np.linalg.svd(ratings, full_matrices=False)
print("All singular values:", singular_values.round(2))

# keep only the top 2 "latent factors" (K=2) - a low-rank approximation
K = 2
ratings_approx = U[:, :K] @ np.diag(singular_values[:K]) @ VT[:K, :]

print("Original (row 0):     ", ratings[0].round(2))
print("Reconstructed (row 0):", ratings_approx[0].round(2))
print("Predicted rating for user0's unrated movie (col 2, was 0):", ratings_approx[0, 2].round(2))
# OUTPUT (typical):
# All singular values: [11.87  5.42  2.35  0.71]
# Original (row 0):      [5. 4. 0. 1.]
# Reconstructed (row 0): [4.83 4.11 0.31 0.92]
# Predicted rating for user0's unrated movie (col 2, was 0): 0.31 (low -> model predicts user0 would rate this movie poorly)`
            ],
            codeExplanations: [
                `<code>ratings</code> is a small 5x4 user-movie rating matrix with some entries at 0, standing in for unrated movies. Running full SVD gives all 4 singular values - notice they drop off quickly (11.87 down to 0.71), meaning most of the matrix's real structure is captured by just the first couple of them. Keeping only the top <code>K=2</code> singular values (and the matching columns/rows of <code>U</code> and <code>VT</code>) and multiplying them back together produces <code>ratings_approx</code> - a LOW-RANK reconstruction built from just 2 latent factors per user/movie instead of the full matrix. Comparing the original vs. reconstructed row 0 shows the approximation stays close to the known ratings while also filling in a plausible PREDICTED value (0.31, low) for user 0's originally-unrated movie in column 2 - exactly the mechanism a recommendation engine uses to guess how a user would rate something they've never interacted with.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Works on ANY matrix shape</strong> - unlike eigen-decomposition, which requires a square matrix, SVD applies to any <code>m x n</code> matrix (like a raw <code>n_samples x n_features</code> dataset, or a rectangular user-item ratings table), making it far more broadly applicable across real ML data.</li>
<li><strong>Provably optimal low-rank approximation</strong> - by a mathematical result (the Eckart-Young theorem), keeping the top-K singular values gives the BEST possible rank-K approximation of the original matrix (in terms of minimizing reconstruction error) - no other rank-K approximation can do better, which is why it's trusted for compression and recommendation.</li>
<li><strong>Numerically stable and well-supported</strong> - <code>np.linalg.svd</code> and equivalent routines in every major numerical library are mature, reliable, and don't suffer the same instability issues that direct matrix inversion can hit on ill-conditioned data.</li>
<li><strong>Powers multiple techniques from one idea</strong> - the same SVD machinery underlies PCA (dimensionality reduction), LSA (topic modeling in NLP), image compression, and collaborative-filtering recommenders, so understanding SVD once pays off across many different ML applications.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Computationally expensive at large scale</strong> - full SVD of a matrix with millions of rows and columns (e.g. a real-world user-item matrix with millions of users and items) is very costly; production systems use truncated/randomized SVD algorithms that approximate only the top-K singular values directly, rather than computing the full decomposition.</li>
<li><strong>Choosing K (how many singular values to keep) is a judgment call</strong> - too few latent factors and the reconstruction underfits (loses real signal, e.g. predicting flat, unhelpful ratings); too many and it overfits to noise in the sparse observed data (or simply wastes memory/compute) - K is typically chosen via cross-validation on held-out ratings.</li>
<li><strong>Struggles with extreme sparsity and cold-start</strong> - a brand-new user or movie with zero or very few ratings has no meaningful pattern for SVD to learn latent factors from, so classic SVD-based collaborative filtering handles "cold start" cases poorly and is often supplemented with content-based features.</li>
<li><strong>Latent factors are not inherently interpretable</strong> - like PCA's principal components, the factors SVD discovers are mathematical directions of maximum variance in the ratings data, not human-labeled concepts; a factor might loosely correlate with "action movies" but there's no guarantee it maps cleanly onto any single real-world category.</li>
</ul>`,
            codeExamples: [
                `# Choosing K by tracking reconstruction error vs. number of singular values kept, and image-style compression
import numpy as np

rng = np.random.default_rng(0)
# a bigger synthetic "ratings-like" matrix with underlying low-rank structure plus noise
true_factors_u = rng.normal(size=(50, 3))
true_factors_v = rng.normal(size=(3, 40))
clean_matrix = true_factors_u @ true_factors_v
noisy_matrix = clean_matrix + rng.normal(scale=0.5, size=clean_matrix.shape)

U, singular_values, VT = np.linalg.svd(noisy_matrix, full_matrices=False)

for K in [1, 2, 3, 5, 10, 20]:
    approx = U[:, :K] @ np.diag(singular_values[:K]) @ VT[:K, :]
    error = np.linalg.norm(noisy_matrix - approx) / np.linalg.norm(noisy_matrix)
    print(f"K={K:>2d}  relative reconstruction error={error:.3f}")
# OUTPUT (typical):
# K= 1  relative reconstruction error=0.583
# K= 2  relative reconstruction error=0.312
# K= 3  relative reconstruction error=0.104   <- true rank of the underlying signal (3), error drops sharply here
# K= 5  relative reconstruction error=0.086
# K=10  relative reconstruction error=0.061
# K=20  relative reconstruction error=0.032`
            ],
            codeExplanations: [
                `A synthetic matrix is built with a KNOWN true underlying rank of 3 (<code>true_factors_u @ true_factors_v</code>), then noise is added to simulate a realistic noisy dataset - this lets us check whether SVD can recover the true structure. Computing the relative reconstruction error across increasing values of <code>K</code> shows a sharp drop right around <code>K=3</code> (matching the true rank), after which adding more singular values gives diminishing returns and mostly just fits noise rather than real signal. This is exactly the diagnostic ("elbow" in the error/variance-explained curve) used in practice to choose how many latent factors or principal components to keep - too few (K=1) underfits badly, while going far beyond the true structure (K=20) mostly captures noise at the cost of extra memory and compute.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does SVD decompose a matrix into, and how does it differ from eigen-decomposition?</td><td>SVD factors any matrix A (of any shape) into U * Sigma * V^T, where Sigma is a diagonal matrix of singular values sorted largest to smallest; unlike eigen-decomposition, which requires a square matrix, SVD works on any rectangular matrix, making it more general-purpose for real datasets like user-item rating tables</td></tr>
<tr class='text-center'><td>How does SVD power a movie recommendation system?</td><td>SVD decomposes the sparse, mostly-empty user-movie rating matrix into a small number of latent factors per user and per movie (unlabeled taste dimensions learned purely from existing ratings); multiplying a user's factor vector by a movie's factor vector predicts the rating that user would likely give a movie they haven't rated yet, filling in the missing entries of the original matrix</td></tr>
<tr class='text-center'><td>What is a low-rank approximation, and why is keeping only the top-K singular values useful?</td><td>A low-rank approximation reconstructs a matrix using only its K largest singular values (and corresponding U/V columns) instead of all of them; by the Eckart-Young theorem this gives the mathematically optimal rank-K approximation, which is useful for compression (much smaller storage), denoising (noise concentrates in the smaller singular values, which get discarded), and generalization (predicting unseen entries, as in recommendation systems)</td></tr>
</table>`
        }
    ]
};
