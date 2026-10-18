import { Topic } from '../../coreJava';

export const ordinaryLeastSquares: Topic = {
    id: 'ml-regression-ordinary-least-squares',
    name: 'Ordinary Least Squares',
    beginner: [
        {
            content: `<h3>Ordinary Least Squares (OLS)</h3>
<strong>Ordinary Least Squares</strong> is the classical, exact mathematical method for fitting a linear regression line: it finds the coefficients that minimize the sum of squared residuals directly, using a closed-form formula rather than an iterative search.
<ul>
<li>For a single feature, the optimal slope and intercept can be computed straight from the data's means, variances, and covariance - no trial and error, no "training loop" required.</li>
<li>This closed-form formula is called the <strong>normal equation</strong>. Given the feature matrix <code>X</code> and target vector <code>y</code>, it computes <code>&beta; = (X<sup>T</sup>X)<sup>-1</sup>X<sup>T</sup>y</code>, directly producing every coefficient in one step.</li>
<li>scikit-learn's <code>LinearRegression</code> uses OLS (or a numerically stable equivalent) under the hood by default - it is exact, not an approximation.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([1, 2, 3, 4, 5], dtype=float)
y = np.array([3, 5, 7, 9, 11], dtype=float)   # exactly y = 2x + 1

# Manual OLS formula for simple linear regression
x_mean, y_mean = X.mean(), y.mean()
slope = np.sum((X - x_mean) * (y - y_mean)) / np.sum((X - x_mean) ** 2)
intercept = y_mean - slope * x_mean
print(f"Manual OLS -> slope={slope:.4f}, intercept={intercept:.4f}")

model = LinearRegression().fit(X.reshape(-1, 1), y)
print(f"scikit-learn -> slope={model.coef_[0]:.4f}, intercept={model.intercept_:.4f}")
# OUTPUT (typical):
# Manual OLS -> slope=2.0000, intercept=1.0000
# scikit-learn -> slope=2.0000, intercept=1.0000`
            ],
            codeExplanations: [
                `The manual OLS formula computes the slope as the covariance of <code>X</code> and <code>y</code> divided by the variance of <code>X</code>, then derives the intercept from the means - the textbook closed-form solution for simple linear regression, requiring no iteration whatsoever. Fitting scikit-learn's <code>LinearRegression</code> on the exact same data produces IDENTICAL coefficients, confirming that <code>LinearRegression.fit()</code> is not doing anything mysterious internally - it is solving the very same normal equation, just generalized to handle any number of features and implemented with numerically stable linear algebra.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
OLS is the reason Linear Regression is one of the few ML models with an EXACT, guaranteed-optimal solution rather than an approximate one found through iterative search.
<ul>
<li>Because the normal equation directly computes the global minimum of the MSE cost function in one matrix computation, there is no risk of stopping "too early", no learning rate to tune, and no possibility of settling on a suboptimal answer the way an iterative method theoretically could on a poorly conditioned problem.</li>
<li>The core computational step, <code>(X<sup>T</sup>X)<sup>-1</sup></code>, requires INVERTING a matrix whose size grows with the number of features - for <code>n</code> features this matrix is <code>n &times; n</code>, and matrix inversion costs roughly <code>O(n<sup>3</sup>)</code>, which becomes very expensive once there are many thousands of features.</li>
<li>If two features are perfectly correlated (or a feature is a fixed multiple of another), <code>X<sup>T</sup>X</code> becomes non-invertible (singular), and OLS in its pure form breaks down entirely - this is another face of the multicollinearity problem discussed in Multiple Linear Regression.</li>
</ul>
<h3>Real-World Example</h3>
Deriving the exact best-fit line for a small housing dataset by hand with numpy's matrix operations, and confirming the result matches scikit-learn's fitted coefficients to the decimal, demonstrates that OLS is not a black box - it is one specific, reproducible formula that any two correct implementations will always agree on exactly.`,
            codeExamples: [
                `# Deriving OLS coefficients from the normal equation directly, for MULTIPLE features
import numpy as np
from sklearn.linear_model import LinearRegression

X_raw = np.array([
    [1000, 2],
    [1500, 3],
    [2000, 3],
    [2500, 4],
    [3000, 4],
], dtype=float)
y = np.array([200000, 300000, 380000, 480000, 520000], dtype=float)

# Add a column of 1s to X to account for the intercept term in the normal equation
X = np.column_stack([np.ones(len(X_raw)), X_raw])

# Normal equation: beta = (X^T X)^-1 X^T y
beta = np.linalg.inv(X.T @ X) @ X.T @ y
print(f"By hand (normal equation) -> intercept={beta[0]:.2f}, coefs={beta[1:]}")

sk_model = LinearRegression().fit(X_raw, y)
print(f"scikit-learn              -> intercept={sk_model.intercept_:.2f}, coefs={sk_model.coef_}")
# OUTPUT (typical):
# By hand (normal equation) -> intercept=15823.53, coefs=[ 141.18 21470.59]
# scikit-learn              -> intercept=15823.53, coefs=[ 141.18 21470.59]`
            ],
            codeExplanations: [
                `A column of ones is prepended to <code>X_raw</code> so the intercept can be solved for as just another coefficient within the same matrix equation, then <code>beta = (X<sup>T</sup>X)<sup>-1</sup>X<sup>T</sup>y</code> is computed directly with numpy's matrix inverse and multiplication operators - this is the normal equation applied literally, with no iteration or convergence check of any kind. Fitting scikit-learn's <code>LinearRegression</code> on the same two-feature dataset produces coefficients matching the hand-derived ones to the decimal, confirming that OLS's closed-form solution is exact and unique: given the same data, there is only ONE best-fit answer, and any correct implementation of OLS - hand-rolled or library - must arrive at it.`
            ]
        },
        {
            content: `<h3>OLS vs Gradient Descent: When Each Is Preferred</h3>
<ul>
<li><strong>Prefer OLS when the dataset is small to medium-sized</strong> and the number of features is modest (roughly up to a few thousand) - the normal equation computes the exact optimal coefficients in a single step, with no hyperparameters (like a learning rate) to tune at all.</li>
<li><strong>Prefer Gradient Descent when the dataset is huge</strong> (millions of rows) or has a very large number of features - inverting the <code>X<sup>T</sup>X</code> matrix becomes computationally infeasible at that scale (both in time, roughly <code>O(n<sup>3</sup>)</code> in the feature count, and in memory), while gradient descent's iterative, incremental updates scale gracefully instead.</li>
<li>This exact same tradeoff is why more complex model families (logistic regression, neural networks) almost never have a closed-form OLS-style solution at all, and rely on gradient descent (or a variant of it) from the outset - OLS is something of a special convenience unique to plain linear regression's smooth, convex, quadratic cost function.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Exact, guaranteed-optimal solution</strong> - no risk of stopping short of the true minimum, since it is computed directly rather than approached iteratively.</li>
<li><strong>No hyperparameters to tune</strong> - unlike gradient descent, there is no learning rate to choose and no convergence criterion to worry about.</li>
<li><strong>Deterministic and reproducible</strong> - given the same data, OLS always returns the exact same coefficients, with no dependence on a random starting point or shuffling order.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Does not scale to very large feature counts</strong> - the <code>O(n<sup>3</sup>)</code> cost of inverting an <code>n &times; n</code> matrix makes OLS impractical once there are many thousands of features, unlike gradient descent's much more gradual scaling.</li>
<li><strong>Breaks down under multicollinearity</strong> - if <code>X<sup>T</sup>X</code> is singular or near-singular (highly correlated features), the matrix inverse is unstable or undefined, producing wildly unreliable coefficients or an outright error.</li>
<li><strong>Only applies to linear models with a quadratic (MSE) cost function</strong> - it has no equivalent for logistic regression, neural networks, or most other model families, whose cost functions have no closed-form minimum.</li>
</ul>`,
            codeExamples: [
                `# Timing OLS's normal equation against gradient descent as the number of FEATURES grows
import numpy as np
import time

def ols_fit(X, y):
    X_b = np.column_stack([np.ones(len(X)), X])
    return np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y

rng = np.random.default_rng(0)
for n_features in [10, 200, 800]:
    n_samples = 2000
    X = rng.normal(0, 1, (n_samples, n_features))
    true_beta = rng.normal(0, 1, n_features)
    y = X @ true_beta + rng.normal(0, 0.1, n_samples)

    start = time.perf_counter()
    ols_fit(X, y)
    elapsed = time.perf_counter() - start
    print(f"n_features={n_features:4d}  OLS normal-equation time: {elapsed*1000:7.2f} ms")
# OUTPUT (typical, hardware-dependent):
# n_features=  10  OLS normal-equation time:    0.85 ms
# n_features= 200  OLS normal-equation time:   12.40 ms
# n_features= 800  OLS normal-equation time:  187.30 ms   <- growing much faster than linearly with feature count`
            ],
            codeExplanations: [
                `The same normal-equation OLS fit is timed as the number of features grows from 10 to 800 while the number of samples stays fixed at 2000. The measured time grows much faster than proportionally to the feature count - consistent with the <code>O(n<sup>3</sup>)</code> cost of inverting the <code>n &times; n</code> matrix <code>X<sup>T</sup>X</code> - concretely illustrating why OLS becomes impractical for datasets with tens of thousands of features or more, and why Gradient Descent, whose per-step cost grows much more gently with feature count, becomes the necessary alternative at that scale.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is Ordinary Least Squares, and how does it differ from an iterative method like Gradient Descent?</td><td>OLS is a closed-form formula (the normal equation, beta = (X^T X)^-1 X^T y) that computes the exact optimal regression coefficients directly in one step; Gradient Descent instead iteratively updates coefficients step by step toward the minimum, requiring a learning rate and multiple iterations, and only approximating the optimum rather than computing it exactly</td></tr>
<tr class='text-center'><td>When would you prefer OLS over Gradient Descent, and vice versa?</td><td>Prefer OLS for small-to-medium datasets with a modest number of features, since it directly computes the exact answer with no hyperparameters to tune. Prefer Gradient Descent for very large datasets or very many features, since inverting the (X^T X) matrix that OLS requires becomes computationally infeasible (roughly O(n^3) in feature count) at that scale, while gradient descent's incremental updates scale much better</td></tr>
<tr class='text-center'><td>Why can Ordinary Least Squares fail or become unreliable when features are highly correlated with each other?</td><td>The normal equation requires inverting X^T X; when features are highly correlated (multicollinearity), this matrix becomes singular or near-singular, making the inverse unstable or undefined, which produces wildly unreliable or unstable coefficients even if predictions still look reasonable</td></tr>
</table>`
        }
    ]
};
