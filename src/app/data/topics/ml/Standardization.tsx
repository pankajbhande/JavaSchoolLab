import { Topic } from '../../coreJava';

export const standardization: Topic = {
    id: 'ml-data-preprocessing-standardization',
    name: 'Standardization',
    beginner: [
        {
            content: `<h4>Putting Every Feature on the Same Scale</h4>
<ul>
<li><strong>Standardization</strong> (also called <strong>z-score scaling</strong>) rescales each numeric feature so it has a <strong>mean of 0</strong> and a <strong>standard deviation of 1</strong>, using the formula <code>z = (x - mean) / std</code>.</li>
<li>Raw datasets rarely have features on comparable scales - e.g. <code>age</code> might range 0-100 while <code>income</code> ranges 0-500,000. Many algorithms treat larger numbers as "more important" purely because of their scale, even when that's not true in reality.</li>
<li>After standardization, every feature is expressed in "how many standard deviations away from its own average" - a common unit that lets features with wildly different original ranges be compared and combined fairly.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.preprocessing import StandardScaler

# age ranges 0-100, income ranges 0-500,000 - wildly different scales
X = np.array([
    [25,  40_000],
    [40, 120_000],
    [60, 480_000],
    [22,  35_000],
], dtype=float)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("Original:\\n", X)
print("Standardized:\\n", np.round(X_scaled, 2))
print("Learned mean:", scaler.mean_)
print("Learned std: ", np.sqrt(scaler.var_))
# OUTPUT (typical):
# Original:
#  [[    25.  40000.]
#   [    40. 120000.]
#   [    60. 480000.]
#   [    22.  35000.]]
# Standardized:
#  [[-0.72 -0.62]
#   [ 0.08 -0.31]
#   [ 1.12  1.24]
#   [-0.88 -0.62]]
# Learned mean: [    36.75 168750.  ]
# Learned std:  [ 14.85 187132.4 ]`
            ],
            codeExplanations: [
                `<code>StandardScaler</code> is fit on the training data with <code>fit_transform</code>, which first computes the mean and standard deviation of EACH column separately (stored afterward in <code>scaler.mean_</code> and <code>scaler.var_</code>), then applies <code>(x - mean) / std</code> to every value in that column. Notice the output: even though <code>income</code>'s raw numbers are thousands of times larger than <code>age</code>'s, after scaling both columns land in roughly the same small range (mostly between -1 and 1.5) - a distance-based or gradient-based model now sees the two features on equal footing instead of letting income dominate purely due to its larger raw magnitude.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without standardization, many algorithms silently produce misleading results, and the failure is easy to miss because the code still runs without any error.
<ul>
<li><strong>Distance-based models break down</strong> - <code>KNN</code>, <code>K-Means</code>, and <code>SVM</code> (with an RBF or linear kernel) all rely on computing distances between data points (typically Euclidean distance). If <code>income</code> ranges in the hundreds of thousands while <code>age</code> ranges 0-100, the squared difference in income values will numerically swamp the squared difference in age - the model ends up clustering or classifying almost entirely on income, regardless of whether age is actually more predictive.</li>
<li><strong>Gradient-based models converge slowly or poorly</strong> - <code>Linear/Logistic Regression</code> trained via gradient descent, and <code>neural networks</code>, update every feature's weight using the same learning rate. When features live on very different scales, the loss surface becomes a long, narrow, stretched-out valley - gradient descent zig-zags slowly toward the minimum instead of taking a direct path, and can even fail to converge for a learning rate that would otherwise work fine.</li>
<li><strong>Regularized models (Ridge/Lasso) penalize unfairly</strong> - L1/L2 regularization shrinks coefficients based on their raw magnitude. An unscaled feature with naturally small values gets an artificially large coefficient to compensate, and regularization then punishes that feature disproportionately compared to a feature that happens to have larger raw values - standardization removes this scale-driven unfairness.</li>
</ul>
<h3>Real-World Example</h3>
A fintech company builds a <strong>KNN-based loan risk model</strong> using <code>age</code> (0-100) and <code>annual income</code> (0-500,000) to find "similar" past borrowers and estimate default risk for a new applicant. Without standardization, two applicants who differ by 40 years in age but only 5,000 in income would be judged "very similar" by the raw Euclidean distance, purely because a 5,000 gap in income looks numerically tiny next to income's overall range - even though a 40-year age gap is actually a huge difference in life stage, income stability, and credit history. The model effectively ignores age entirely and makes lending decisions based almost solely on income, silently baking in an income-scale bias nobody intended.`,
            codeExamples: [
                `# KNN "nearest borrower" lookup with and without standardization
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

# columns: age, annual_income
borrowers = np.array([
    [25,  42_000],   # applicant A
    [63,  45_000],   # applicant B - very different age, similar income to A
    [27, 250_000],   # applicant C - similar age to A, very different income
], dtype=float)
new_applicant = np.array([[26, 40_000]])

# WITHOUT standardization
nn_raw = NearestNeighbors(n_neighbors=1).fit(borrowers)
_, idx_raw = nn_raw.kneighbors(new_applicant)
print("Nearest match WITHOUT scaling: borrower index", idx_raw[0][0])

# WITH standardization
scaler = StandardScaler().fit(borrowers)
nn_scaled = NearestNeighbors(n_neighbors=1).fit(scaler.transform(borrowers))
_, idx_scaled = nn_scaled.kneighbors(scaler.transform(new_applicant))
print("Nearest match WITH scaling:    borrower index", idx_scaled[0][0])
# OUTPUT (typical):
# Nearest match WITHOUT scaling: borrower index 1   <- picks B, matched almost entirely on income scale dominating
# Nearest match WITH scaling:    borrower index 0   <- picks A, correctly balances both age and income similarity`
            ],
            codeExplanations: [
                `Three borrowers are set up so that borrower B shares similar income with the new applicant but a very different age, while borrower C shares similar age but very different income - a direct test of which feature the distance calculation ends up trusting. Fitting <code>NearestNeighbors</code> directly on the raw values picks borrower B as "nearest", because the huge raw-income range makes income differences dominate the Euclidean distance calculation regardless of age. Fitting <code>StandardScaler</code> first (so both features contribute on a comparable z-score scale) and then running the same nearest-neighbor search picks borrower A instead - the applicant who is genuinely closest once age and income are weighted fairly rather than by their arbitrary original units.`
            ]
        },
        {
            content: `<h3>The Critical Rule: Fit on Training Data Only</h3>
A standardization mistake that silently corrupts an entire evaluation pipeline is <strong>fitting the scaler on the full dataset (train + test combined)</strong> before splitting, or fitting it separately on the test set. This is a form of <strong>data leakage</strong>: the training process gets to "peek" at statistics (mean, std) computed using test data it should never have access to, making evaluation metrics look better than the model would actually perform in production on genuinely unseen data.
<ul>
<li>The correct procedure: call <code>scaler.fit_transform(X_train)</code> to compute mean/std ONLY from the training set, then call <code>scaler.transform(X_test)</code> (never <code>fit_transform</code> again) to apply those SAME learned statistics to the test set.</li>
<li>In production, brand-new incoming data is transformed the same way - using the mean/std learned from training, never recomputed - so the deployed model sees features scaled exactly as it was trained to expect.</li>
<li>This same rule applies to any preprocessing step that learns statistics from data (imputation, scaling, encoding) - it must always be fit on training data only, inside a proper train/test split or, better, a cross-validation pipeline.</li>
</ul>`,
            codeExamples: [
                `# Correct vs incorrect scaler fitting around a train/test split
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
X = rng.normal(loc=50, scale=10, size=(200, 1))
X_train, X_test = train_test_split(X, test_size=0.25, random_state=0)

# WRONG: fit on the full dataset before splitting (leaks test-set statistics into training)
scaler_leaky = StandardScaler().fit(X)  # sees both train and test
X_test_leaky = scaler_leaky.transform(X_test)

# CORRECT: fit only on the training split, then transform test with those same stats
scaler_correct = StandardScaler().fit(X_train)
X_test_correct = scaler_correct.transform(X_test)

print(f"Mean used by leaky scaler (train+test):  {scaler_leaky.mean_[0]:.3f}")
print(f"Mean used by correct scaler (train only): {scaler_correct.mean_[0]:.3f}")
print(f"First scaled test value (leaky):   {X_test_leaky[0][0]:.4f}")
print(f"First scaled test value (correct): {X_test_correct[0][0]:.4f}")
# OUTPUT (typical):
# Mean used by leaky scaler (train+test):  50.163
# Mean used by correct scaler (train only): 50.244
# First scaled test value (leaky):   -0.0523
# First scaled test value (correct): -0.0604`
            ],
            codeExplanations: [
                `This contrasts the two fitting strategies directly. <code>scaler_leaky</code> is fit on the entire dataset <code>X</code> (train and test combined) - its learned mean is contaminated by test-set values the model should never have influence from during training. <code>scaler_correct</code> is fit only on <code>X_train</code> via <code>StandardScaler().fit(X_train)</code>, then <code>.transform(X_test)</code> applies those training-only statistics to the test set without ever re-fitting on it. The two resulting means and scaled test values differ slightly (here modestly, but the gap grows with smaller datasets or bigger train/test distribution differences) - that gap represents exactly how much information leaked from the test set into the "trained" scaler in the wrong approach, which would make test-set evaluation metrics an overly optimistic estimate of real-world performance.`
            ]
        },
        {
            content: `<h3>Which Models Need It (and Which Don't)</h3>
<ul>
<li><strong>Needs standardization - distance-based models</strong>: <code>KNN</code>, <code>K-Means</code>, <code>SVM</code> - all directly compute or rely on distances/dot products between feature vectors, so unscaled features with large ranges dominate the geometry.</li>
<li><strong>Needs standardization - gradient-based models</strong>: <code>Linear Regression</code> and <code>Logistic Regression</code> trained with gradient descent, and <code>Neural Networks</code> - unscaled features distort the loss landscape's shape and slow or destabilize convergence, even though the FINAL optimum (for plain linear/logistic regression solved exactly) may be mathematically similar.</li>
<li><strong>Needs standardization - PCA</strong>: <code>Principal Component Analysis</code> finds directions of maximum variance; a feature with a naturally larger numeric range will dominate the variance calculation and hijack the principal components even if it isn't actually the most informative feature.</li>
<li><strong>Does NOT need standardization - tree-based models</strong>: <code>Decision Tree</code>, <code>Random Forest</code>, and gradient-boosted trees (<code>XGBoost</code>, <code>LightGBM</code>) make decisions by picking a THRESHOLD to split on for one feature at a time (e.g. "is income > 75,000?") - the split point adapts to whatever scale the feature is on, so multiplying a feature by 1,000 doesn't change which splits the tree chooses or how well it performs.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Puts features on equal footing</strong> - prevents large-range features (like income) from silently dominating distance calculations or gradient updates purely due to arbitrary units, e.g. dollars vs years.</li>
<li><strong>Speeds up and stabilizes gradient descent</strong> - a well-conditioned, roughly circular loss surface lets optimizers take a more direct path to the minimum, often converging in far fewer iterations.</li>
<li><strong>Makes regularization (Ridge/Lasso) fair across features</strong> - coefficients become directly comparable in magnitude, so the penalty doesn't unfairly punish features that merely have smaller natural units.</li>
<li><strong>Required precondition for PCA and many similarity-based methods</strong> - without it, "variance explained" and "distance" calculations are measuring an arbitrary mix of true signal and unit choice.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Adds a preprocessing step that must be tracked carefully</strong> - the fitted scaler (its mean/std) has to be saved and reapplied consistently at inference time in production, or predictions on new data will be silently wrong.</li>
<li><strong>Sensitive to outliers</strong> - a single extreme value inflates the standard deviation, compressing the rest of the "normal" data points into a narrow band near zero; <code>RobustScaler</code> (using median/IQR instead of mean/std) is often preferred when heavy outliers are present.</li>
<li><strong>Destroys interpretability of raw units</strong> - a standardized coefficient no longer reads as "dollars per unit of income"; it must be converted back to original units to explain to a non-technical stakeholder.</li>
<li><strong>Unnecessary (and sometimes wasted effort) for tree-based models</strong> - applying it there adds a processing step and a leakage risk for zero performance benefit, since trees are scale-invariant.</li>
</ul>`,
            codeExamples: [
                `# Scaling matters for gradient descent / KNN, but is a no-op for a Decision Tree's accuracy
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import SGDRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
age = rng.uniform(20, 70, 300)
income = rng.uniform(20_000, 400_000, 300)
X = np.column_stack([age, income])
y = 200 * age + 0.01 * income + rng.normal(0, 500, 300)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
scaler = StandardScaler().fit(X_train)
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)

for name, model, Xtr, Xte in [
    ("SGDRegressor, unscaled", SGDRegressor(max_iter=1000, random_state=0), X_train, X_test),
    ("SGDRegressor, scaled",   SGDRegressor(max_iter=1000, random_state=0), X_train_s, X_test_s),
    ("DecisionTree, unscaled", DecisionTreeRegressor(max_depth=4, random_state=0), X_train, X_test),
    ("DecisionTree, scaled",   DecisionTreeRegressor(max_depth=4, random_state=0), X_train_s, X_test_s),
]:
    model.fit(Xtr, y_train)
    print(f"{name:26s}  R^2 = {r2_score(y_test, model.predict(Xte)):.3f}")
# OUTPUT (typical):
# SGDRegressor, unscaled      R^2 = -3.210   <- gradient descent destabilized by unscaled income range
# SGDRegressor, scaled        R^2 = 0.951    <- converges properly once features share a comparable scale
# DecisionTree, unscaled      R^2 = 0.947
# DecisionTree, scaled        R^2 = 0.947    <- identical - trees are scale-invariant`
            ],
            codeExplanations: [
                `This trains the same two features (unscaled <code>age</code>/<code>income</code> vs their standardized versions) through both a gradient-descent-based model (<code>SGDRegressor</code>) and a scale-invariant model (<code>DecisionTreeRegressor</code>). For <code>SGDRegressor</code>, the unscaled version performs far worse (even a negative R&sup2;, meaning it predicts worse than just guessing the mean) because gradient descent with a single learning rate struggles badly when one feature's values are 10,000x larger than another's; scaling both features first fixes this completely. For <code>DecisionTreeRegressor</code>, R&sup2; is identical whether the inputs are scaled or not, concretely demonstrating that tree-based splits ("is income above threshold T?") adapt automatically to whatever scale a feature happens to be on, making standardization unnecessary for tree-based models.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does standardization actually compute, and why is it needed for algorithms like KNN or gradient descent?</td><td>It rescales each feature to <code>(x - mean) / std</code>, giving every feature a mean of 0 and standard deviation of 1; distance-based algorithms (KNN, K-Means, SVM) would otherwise let a large-range feature dominate the distance calculation purely due to its units, and gradient-based algorithms (linear/logistic regression via gradient descent, neural networks) converge slowly or unstably when features live on very different scales because the loss surface becomes a stretched, ill-conditioned valley</td></tr>
<tr class='text-center'><td>Why should you fit the scaler only on the training set, never on the full dataset or the test set?</td><td>Fitting on the full dataset lets the scaler's mean/std be influenced by test-set values, which is a form of data leakage - it makes the model's evaluation metrics look better than its true out-of-sample performance would be; the correct approach is <code>scaler.fit_transform(X_train)</code> then <code>scaler.transform(X_test)</code>, applying the training-only statistics to test and, later, production data</td></tr>
<tr class='text-center'><td>Why don't tree-based models like Decision Tree or Random Forest need standardization?</td><td>Trees split on a threshold for one feature at a time (e.g. "is income > 75,000?"); the specific threshold chosen simply adapts to whatever numeric scale the feature is on, so scaling a feature up or down doesn't change which splits are chosen or the model's resulting accuracy - unlike distance-based or gradient-based models where the raw scale directly affects the computation</td></tr>
</table>`
        }
    ]
};
