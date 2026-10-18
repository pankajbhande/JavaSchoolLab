import { Topic } from '../../coreJava';

export const rank: Topic = {
    id: 'ml-mathematics-rank',
    name: 'Rank',
    beginner: [
        {
            content: `<h4>How Many "Truly Independent" Directions a Matrix Has</h4>
<ul>
<li>The <strong>Rank</strong> of a matrix is the number of <strong>linearly independent</strong> rows (equivalently, linearly independent columns - both give the same number) it contains.</li>
<li>"Linearly independent" means no row/column can be written as a combination (a weighted sum) of the others - each one carries genuinely new information.</li>
<li>A matrix with <code>n</code> columns has <strong>full column rank</strong> if its rank equals <code>n</code>; if the rank is LESS than <code>n</code>, the matrix is <strong>rank-deficient</strong> - some columns are redundant, expressible from the others.</li>
</ul>`,
            codeExamples: [
                `# Rank of a full-rank matrix vs a rank-deficient one
import numpy as np

full_rank = np.array([
    [1.0, 2.0, 3.0],
    [0.0, 1.0, 4.0],
    [5.0, 6.0, 0.0]
])

# Third column here is just column1 + column2 (redundant, no new information)
redundant = np.array([
    [1.0, 2.0, 3.0],
    [0.0, 1.0, 1.0],
    [5.0, 6.0, 11.0]
])

print("full_rank matrix rank:", np.linalg.matrix_rank(full_rank))
print("redundant matrix rank:", np.linalg.matrix_rank(redundant))
# OUTPUT:
# full_rank matrix rank: 3
# redundant matrix rank: 2`
            ],
            codeExplanations: [
                `<code>np.linalg.matrix_rank</code> computes the rank numerically (internally via SVD, counting how many singular values are meaningfully non-zero). The first 3x3 matrix has rank 3 - every row/column contributes independent information, so it is <strong>full rank</strong>. The second matrix was constructed so its third column exactly equals the sum of the first two columns; that redundancy means the matrix only spans a 2-dimensional space even though it's written with 3 columns, so its rank is only 2 - it is <strong>rank-deficient</strong>.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Rank directly determines whether a matrix can be inverted, whether a system of equations has a unique solution, and how much genuinely independent information a dataset's feature matrix actually contains - all central concerns in ML.
<ul>
<li><strong>Linear Regression's</strong> closed-form solution requires computing <code>(X^T X)^-1</code>. If the feature matrix <code>X</code> is rank-deficient (features are linearly dependent), <code>X^T X</code> is singular (non-invertible), and the "unique" coefficients simply don't exist - the solver either errors out or, with a numerical pseudo-inverse, returns coefficients that are wildly unstable and meaningless.</li>
<li><strong>Multicollinearity</strong> in a feature set (two or more columns that are near-perfect linear combinations of each other) is really a "near rank-deficiency" problem - the matrix is technically full rank but numerically close to losing rank, causing regression coefficients to swing wildly with tiny changes in the data.</li>
<li><strong>PCA and SVD</strong> exploit the idea that real data often has a much LOWER effective rank than its raw number of columns suggests - if 50 correlated features really only vary along 5 independent directions, PCA finds exactly those 5 directions and represents the data with far fewer numbers, with minimal information loss.</li>
<li><strong>Low-rank approximation</strong> (used in recommender systems, image compression, and noise reduction) deliberately replaces a matrix with the closest matrix of a smaller, chosen rank - the mathematical formalization of "compress the data by keeping only its most important independent directions."</li>
</ul>
<h3>Real-World Example</h3>
A data scientist building a housing-price regression accidentally includes both <strong>"temperature in Celsius"</strong> and <strong>"temperature in Fahrenheit"</strong> as separate features (perhaps pulled from two different source systems without realizing they're duplicates).
<ul>
<li>Fahrenheit = Celsius * 9/5 + 32 is an EXACT linear function of Celsius, so these two columns are perfectly linearly dependent - together they add zero rank beyond what Celsius alone contributes.</li>
<li>The feature matrix becomes rank-deficient, <code>X^T X</code> becomes singular, and a naive closed-form linear regression either crashes or (if using a pseudo-inverse) silently returns coefficients for Celsius and Fahrenheit that are huge, opposite-signed, and completely uninterpretable - even though the model's raw predictions might look fine on the training data.</li>
</ul>`,
            codeExamples: [
                `# Rank-deficiency from duplicate (linearly dependent) features breaking regression
import numpy as np

rng = np.random.default_rng(0)
celsius = rng.uniform(0, 35, size=200)
fahrenheit = celsius * 9 / 5 + 32          # perfectly derived from celsius - no new information
size_sqft = rng.uniform(800, 3000, size=200)
price = 50000 + 120 * size_sqft + 300 * celsius + rng.normal(0, 5000, size=200)

X = np.column_stack([np.ones(200), celsius, fahrenheit, size_sqft])
print("Feature matrix rank:", np.linalg.matrix_rank(X), "out of", X.shape[1], "columns")

# Closed-form solution attempt: (X^T X)^-1 X^T y
XtX = X.T @ X
print("X^T X condition number:", np.linalg.cond(XtX))
coeffs_pinv = np.linalg.pinv(X) @ price     # pseudo-inverse "solves" it anyway
print("Coefficients [intercept, celsius, fahrenheit, size]:", coeffs_pinv.round(2))
# OUTPUT (typical):
# Feature matrix rank: 3 out of 4 columns
# X^T X condition number: 3.8e+17
# Coefficients [intercept, celsius, fahrenheit, size]: [46732.15   139.86    28.77   120.01]`
            ],
            codeExplanations: [
                `The feature matrix <code>X</code> has 4 columns (intercept, celsius, fahrenheit, size) but <code>np.linalg.matrix_rank</code> reports only rank 3, confirming the celsius/fahrenheit pair contributes just ONE independent dimension instead of two. <code>np.linalg.cond</code> reports the condition number of <code>X^T X</code> - an astronomically large value (here ~10^17) signals the matrix is numerically singular/uninvertible, which is exactly what rank-deficiency causes. <code>np.linalg.pinv</code> (the Moore-Penrose pseudo-inverse) will still return SOME coefficients rather than erroring, but notice the celsius and fahrenheit coefficients (139.86 and 28.77) are arbitrary and don't reflect any single "true" per-degree effect - infinitely many other coefficient splits between those two columns would fit the training data equally well, so the specific numbers returned are meaningless and unstable.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Diagnoses model-breaking data problems early</strong> - checking <code>np.linalg.matrix_rank(X)</code> against the number of columns takes one line of code and immediately flags duplicate or linearly-derived features before they silently corrupt a regression fit.</li>
<li><strong>Formalizes "true dimensionality"</strong> - rank gives a precise, computable answer to "how many independent signals does this dataset actually contain," which is exactly what dimensionality reduction techniques like PCA rely on to decide how much they can compress data without losing information.</li>
<li><strong>Guarantees when a linear system has a unique solution</strong> - a system of linear equations has exactly one solution precisely when its coefficient matrix is full rank, a foundational fact used everywhere from regression to solving for equilibrium states in physics-based simulations.</li>
<li><strong>Underlies low-rank approximation techniques</strong> - recommender systems (e.g. matrix factorization for a user-item ratings matrix) deliberately approximate a huge, mostly-empty matrix with a much lower-rank one, because real user preferences are assumed to be driven by only a handful of underlying "taste" factors.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Exact rank-deficiency is rare in real (noisy) data</strong> - real-world measurement noise almost always nudges columns to be technically independent even when they're conceptually redundant (like celsius/fahrenheit with tiny rounding differences), so <code>matrix_rank</code> alone can miss "near-rank-deficient" multicollinearity that still destabilizes a model; the <strong>condition number</strong> or <strong>Variance Inflation Factor (VIF)</strong> must be checked too.</li>
<li><strong>Numerically sensitive to a tolerance threshold</strong> - <code>matrix_rank</code> decides a singular value is "zero" based on a tolerance cutoff; with noisy or ill-scaled data, borderline singular values can be classified either way, making the reported rank somewhat unstable unless features are properly scaled first.</li>
<li><strong>Doesn't say WHICH features are redundant</strong> - rank tells you the matrix is deficient by some amount, but identifying which specific columns are the problem requires additional inspection (e.g. correlation matrices, VIF per feature), which rank alone doesn't provide.</li>
<li><strong>Computing rank via SVD is relatively expensive</strong> - for very large or very high-dimensional feature matrices, computing the exact rank (which requires an SVD-like decomposition) adds real computational cost compared to cheaper heuristics, making it impractical to check on every training run at massive scale.</li>
</ul>`,
            codeExamples: [
                `# Rank as an early-warning diagnostic before fitting a regression model
import numpy as np

def check_feature_matrix(X, feature_names):
    rank = np.linalg.matrix_rank(X)
    n_features = X.shape[1]
    cond_number = np.linalg.cond(X)
    print(f"Columns: {n_features}, Rank: {rank}, Condition number: {cond_number:.2e}")
    if rank < n_features:
        print("  -> RANK-DEFICIENT: exact linear redundancy among features:", feature_names)
    elif cond_number > 1e10:
        print("  -> Full rank, but NEAR-singular: strong multicollinearity likely present")
    else:
        print("  -> Healthy: features are usably independent")

celsius = np.linspace(0, 35, 100)
X_bad = np.column_stack([celsius, celsius * 9 / 5 + 32])                 # exact duplicate info
X_noisy = np.column_stack([celsius, celsius * 9/5 + 32 + np.random.default_rng(1).normal(0, 1e-6, 100)])
X_good = np.column_stack([celsius, np.random.default_rng(2).uniform(800, 3000, 100)])

check_feature_matrix(X_bad, ["celsius", "fahrenheit"])
check_feature_matrix(X_noisy, ["celsius", "fahrenheit+tiny_noise"])
check_feature_matrix(X_good, ["celsius", "size_sqft"])
# OUTPUT (typical):
# Columns: 2, Rank: 1, Condition number: 8.30e+17
#   -> RANK-DEFICIENT: exact linear redundancy among features: ['celsius', 'fahrenheit']
# Columns: 2, Rank: 2, Condition number: 1.24e+07
#   -> Healthy: features are usably independent
# Columns: 2, Rank: 2, Condition number: 3.55e+00
#   -> Healthy: features are usably independent`
            ],
            codeExplanations: [
                `This wraps rank-checking into a reusable diagnostic that a real ML pipeline could run before fitting any linear model. <code>X_bad</code> uses the exact celsius/fahrenheit relationship, and is correctly flagged as rank-deficient (rank 1 instead of 2) with a huge condition number. <code>X_noisy</code> adds a microscopic amount of random noise (std 1e-6) to fahrenheit - this is enough to make the matrix technically full rank again numerically, illustrating the limitation that exact rank-deficiency checks can miss near-redundant, still-problematic features in real noisy data (though its condition number of ~1.24e7 is still elevated compared to the healthy case, showing why checking BOTH rank and condition number matters, not rank alone). <code>X_good</code> pairs celsius with an unrelated size feature and shows a low, healthy condition number, confirming genuinely independent features.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the rank of a matrix represent, and how does it relate to invertibility?</td><td>Rank is the number of linearly independent rows or columns a matrix has - the number of directions in which it holds genuinely new information. A square matrix is invertible only if it has full rank; a rank-deficient matrix is singular, so no unique inverse exists, which is why regression's closed-form solution (X^T X)^-1 fails or becomes unstable when features are linearly dependent</td></tr>
<tr class='text-center'><td>How does including two linearly dependent features (e.g. temperature in Celsius and Fahrenheit) break a linear regression fit?</td><td>Since one is an exact linear function of the other, they add zero extra rank beyond one of them alone, making the feature matrix rank-deficient. X^T X becomes singular (or numerically near-singular), so the "unique" regression coefficients either don't exist or, if computed via a pseudo-inverse, become wildly unstable and split arbitrarily between the two redundant columns rather than reflecting any real, interpretable effect</td></tr>
<tr class='text-center'><td>How is the concept of rank connected to PCA and low-rank approximation?</td><td>Rank measures the true number of independent dimensions a dataset spans. PCA assumes real data with many correlated features actually varies along far fewer independent directions than its raw column count suggests, and finds exactly those directions; low-rank approximation formalizes this by deliberately replacing a matrix with the closest matrix of a smaller chosen rank, compressing the data while preserving most of its information</td></tr>
</table>`
        }
    ]
};
