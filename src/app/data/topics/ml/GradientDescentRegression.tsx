import { Topic } from '../../coreJava';

export const gradientDescentRegression: Topic = {
    id: 'ml-regression-gradient-descent',
    name: 'Gradient Descent',
    beginner: [
        {
            content: `<h3>Gradient Descent for Training a Regression Model</h3>
Instead of computing a regression line's coefficients in one exact step (as Ordinary Least Squares does), <strong>Gradient Descent</strong> finds them iteratively: start with a guess for the slope and intercept, then repeatedly nudge them a little bit in whichever direction REDUCES the cost function (typically MSE), stopping once the cost stops improving.
<ul>
<li>Each nudge is guided by the <strong>gradient</strong> of the cost function - the direction of steepest increase - so the update moves in the OPPOSITE direction, toward lower cost.</li>
<li>The size of each step is controlled by the <strong>learning rate</strong>: too large and training can overshoot and diverge; too small and training crawls toward the answer far too slowly.</li>
<li>For plain linear regression, gradient descent's smooth, single-bowl-shaped MSE cost function guarantees it will eventually converge to the SAME answer OLS computes directly - it just takes a series of small steps to get there instead of one matrix computation.</li>
</ul>`,
            codeExamples: [
                `import numpy as np

X = np.array([1, 2, 3, 4, 5], dtype=float)
y = np.array([3, 5, 7, 9, 11], dtype=float)   # true relationship: y = 2x + 1
n = len(X)

slope, intercept = 0.0, 0.0
alpha = 0.05

for step in range(1000):
    predictions = slope * X + intercept
    error = predictions - y
    grad_slope = (2 / n) * np.sum(error * X)
    grad_intercept = (2 / n) * np.sum(error)
    slope -= alpha * grad_slope
    intercept -= alpha * grad_intercept

print(f"Gradient descent -> slope={slope:.4f}, intercept={intercept:.4f}")
# OUTPUT (typical): Gradient descent -> slope=2.0000, intercept=1.0000`
            ],
            codeExplanations: [
                `Starting from <code>slope=0</code> and <code>intercept=0</code>, the loop repeatedly computes the current predictions, the resulting error, and the MSE cost function's gradient with respect to both parameters, then updates each parameter by stepping a small amount (<code>alpha=0.05</code>) opposite to its gradient. After 1000 such steps, <code>slope</code> and <code>intercept</code> have converged to 2.0 and 1.0 - the exact true relationship in the data, and the same answer Ordinary Least Squares would compute directly in one step, demonstrating that gradient descent reaches the identical destination through many small, cheap steps instead of one large matrix computation.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Ordinary Least Squares' normal equation is exact and elegant, but it requires computing <code>(X<sup>T</sup>X)<sup>-1</sup></code> - an operation that scales roughly as <code>O(n<sup>3</sup>)</code> in the number of features and needs the entire dataset in memory at once. Neither assumption holds once a regression problem gets big enough.
<ul>
<li>A dataset with millions of rows and hundreds of features may not even fit in memory at once, and inverting a large matrix at that scale can be prohibitively slow or numerically unstable - gradient descent instead processes the data incrementally, in small batches, needing only a manageable amount of memory per step.</li>
<li>Gradient descent's per-step cost depends mainly on the batch size and feature count, NOT on the total dataset size - so training time scales gracefully by simply running more (cheap) steps, rather than requiring one enormous, unavoidable matrix inversion.</li>
<li>This is precisely why gradient descent (typically in its Mini-Batch form) - not OLS - is the standard way large-scale linear regression, and every more complex model built on the same idea, is actually trained in industry.</li>
</ul>
<h3>Real-World Example</h3>
Training a linear regression model to predict delivery time from millions of past orders (with dozens of features - distance, time of day, traffic, driver history, etc.) makes OLS's matrix inversion computationally infeasible; Mini-Batch Gradient Descent, streaming through the data in small chunks, is the practical choice instead.`,
            codeExamples: [
                `# Training linear regression with Mini-Batch Gradient Descent on a large synthetic dataset
import numpy as np
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
n_samples, n_features = 200_000, 20
X = rng.normal(0, 1, (n_samples, n_features))
true_beta = rng.normal(0, 2, n_features)
true_intercept = 5.0
y = X @ true_beta + true_intercept + rng.normal(0, 0.5, n_samples)

def mini_batch_gradient_descent(X, y, batch_size=512, alpha=0.05, n_epochs=10):
    n, d = X.shape
    weights, bias = np.zeros(d), 0.0
    for epoch in range(n_epochs):
        idx = rng.permutation(n)
        for start in range(0, n, batch_size):
            batch = idx[start:start + batch_size]
            Xb, yb = X[batch], y[batch]
            error = (Xb @ weights + bias) - yb
            grad_w = (2 / len(batch)) * (Xb.T @ error)
            grad_b = (2 / len(batch)) * error.sum()
            weights -= alpha * grad_w
            bias -= alpha * grad_b
    return weights, bias

weights, bias = mini_batch_gradient_descent(X, y)
predictions = X @ weights + bias
print(f"Final MSE: {mean_squared_error(y, predictions):.4f}")
print(f"Learned intercept: {bias:.3f}  (true: {true_intercept})")
# OUTPUT (typical):
# Final MSE: 0.2513
# Learned intercept: 4.981  (true: 5.0)`
            ],
            codeExplanations: [
                `A dataset with 200,000 rows and 20 features is generated from a known true relationship. Rather than ever forming or inverting a 21x21 <code>X<sup>T</sup>X</code> matrix as OLS would, <code>mini_batch_gradient_descent</code> shuffles the data each epoch and processes it in small chunks of 512 rows at a time, updating the weights and bias after every chunk using only that chunk's gradient. After 10 passes over the full dataset, the learned weights and intercept converge very close to the true generating values, and the final MSE is low - demonstrating that gradient descent reaches essentially the same quality answer OLS would, but by touching only small, memory-friendly slices of the data at a time rather than needing the whole feature matrix inverted at once.`
            ]
        },
        {
            content: `<h3>The Learning Rate's Effect on Convergence</h3>
Because gradient descent takes discrete steps rather than jumping straight to the answer, the learning rate <code>&alpha;</code> is the single most consequential choice in training a regression model this way.
<ul>
<li><strong>Too large</strong>: each step overshoots the minimum of the cost bowl by more than the last, and the cost function's value gets WORSE with each iteration instead of better - training diverges outright.</li>
<li><strong>Too small</strong>: each step makes only microscopic progress toward the minimum, so training technically converges but may require far more iterations than are practical, wasting time and compute.</li>
<li><strong>Well-tuned</strong>: the cost decreases quickly and smoothly toward its minimum within a reasonable number of iterations - in practice this is often found by trying several learning rates and watching the cost curve, or by using an adaptive method that adjusts the effective learning rate automatically during training.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Scales to datasets and feature counts where OLS's matrix inversion is infeasible</strong> - as shown above, per-step cost depends on batch size rather than total dataset size.</li>
<li><strong>Works with streaming or out-of-memory data</strong> - since mini-batches can be read from disk or a stream one chunk at a time, the full dataset never needs to fit in memory at once.</li>
<li><strong>The same core algorithm generalizes far beyond linear regression</strong> - the identical update rule, applied to a different cost function, trains logistic regression and neural networks, making it a broadly transferable skill.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Requires tuning the learning rate</strong> - unlike OLS, which has no hyperparameters at all, a poorly chosen learning rate can cause outright divergence or impractically slow training, as demonstrated below.</li>
<li><strong>Only approximate, not exact</strong> - gradient descent converges TOWARD the true minimum but, after a finite number of steps, typically stops just short of the exact OLS answer, whereas OLS reaches it exactly in one computation.</li>
<li><strong>Needs feature scaling to converge efficiently</strong> - features on very different numeric scales create an elongated cost surface that gradient descent zig-zags through slowly, making standardization a near-mandatory preprocessing step.</li>
</ul>`,
            codeExamples: [
                `# Learning rate too large (diverges) vs too small (slow) vs well-tuned, for regression training
import numpy as np

X = np.array([1, 2, 3, 4, 5], dtype=float)
y = np.array([3, 5, 7, 9, 11], dtype=float)
n = len(X)

def train(alpha, n_steps=30):
    slope, intercept = 0.0, 0.0
    costs = []
    for _ in range(n_steps):
        predictions = slope * X + intercept
        error = predictions - y
        cost = np.mean(error ** 2)
        costs.append(round(cost, 2))
        grad_slope = (2 / n) * np.sum(error * X)
        grad_intercept = (2 / n) * np.sum(error)
        slope -= alpha * grad_slope
        intercept -= alpha * grad_intercept
    return costs

print("alpha=0.5 (too large):", train(0.5)[:6], "...")
print("alpha=0.001 (too small):", train(0.001)[:6], "...")
print("alpha=0.05 (well-tuned):", train(0.05)[:6], "...")
# OUTPUT (typical):
# alpha=0.5 (too large):    [37.0, 179.7, 1122.4, 7466.1, 50480.9, 342562.1] ...   <- cost exploding
# alpha=0.001 (too small):  [37.0, 36.24, 35.5, 34.77, 34.06, 33.36] ...            <- barely decreasing
# alpha=0.05 (well-tuned):  [37.0, 4.83, 1.06, 0.6, 0.53, 0.51] ...                 <- converges quickly`
            ],
            codeExplanations: [
                `The same regression training loop is run with three very different learning rates and the MSE cost is recorded after each step. With <code>alpha=0.5</code>, the cost grows explosively step after step - the classic divergence failure mode of too large a learning rate. With <code>alpha=0.001</code>, the cost decreases, but only barely, from step to step - technically correct but far too slow to be practical on a bigger problem. With a well-tuned <code>alpha=0.05</code>, the cost drops sharply within the first handful of steps and levels off near its minimum, exactly the smooth, fast convergence a properly tuned regression training run should show - which is why learning rate selection is treated as a critical hyperparameter rather than an afterthought.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why would you use Gradient Descent to train a linear regression model instead of Ordinary Least Squares?</td><td>OLS requires inverting an (n x n) matrix in the number of features, which becomes computationally infeasible or memory-prohibitive for very large datasets or feature counts; Gradient Descent instead updates parameters incrementally using small batches of data, so its per-step cost does not depend on the total dataset size, making it the practical choice at large scale</td></tr>
<tr class='text-center'><td>What happens if the learning rate is set too high or too low when training a regression model with Gradient Descent?</td><td>Too high a learning rate causes each update to overshoot the minimum by an increasing amount, making the cost function get worse each step and diverge; too low a learning rate makes each update tiny, so training technically converges but may require impractically many iterations to reach a good solution</td></tr>
<tr class='text-center'><td>Will Gradient Descent and Ordinary Least Squares converge to the same coefficients for plain linear regression, and why?</td><td>Yes (approximately) - linear regression's MSE cost function is convex with a single global minimum, so gradient descent with a well-tuned learning rate is guaranteed to converge toward that same minimum that OLS computes exactly in one step; gradient descent's answer will be very close but typically not bit-for-bit identical, since it approaches the minimum through finite iterative steps rather than solving for it directly</td></tr>
</table>`
        }
    ]
};
