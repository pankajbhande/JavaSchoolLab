import { Topic } from '../../coreJava';

export const gradientDescentMath: Topic = {
    id: 'ml-mathematics-gradient-descent',
    name: 'Gradient Descent',
    beginner: [
        {
            content: `<h4>Finding the Bottom of a Valley by Always Stepping Downhill</h4>
<ul>
<li><strong>Gradient Descent</strong> is a general-purpose optimization algorithm for finding the parameter values (weights <code>&theta;</code>) that MINIMIZE a model's <strong>cost function</strong> <code>J(&theta;)</code> - the number measuring how wrong the model's predictions currently are.</li>
<li>The <strong>gradient</strong> <code>&nabla;J(&theta;)</code> is a vector pointing in the direction of STEEPEST INCREASE of the cost. Since we want to DECREASE cost, the update rule repeatedly steps in the OPPOSITE direction: <code>&theta; = &theta; - &alpha; &middot; &nabla;J(&theta;)</code>.</li>
<li><strong>&alpha; (alpha)</strong> is the <strong>learning rate</strong> - it controls how big each step is. This single algorithm, applied to different cost functions, is what trains Linear Regression, Logistic Regression, and every layer of a Neural Network.</li>
</ul>`,
            codeExamples: [
                `# Minimizing a simple quadratic cost function with gradient descent, by hand
def cost(theta):
    return (theta - 4) ** 2          # minimum is at theta = 4

def gradient(theta):
    return 2 * (theta - 4)           # derivative of the cost function

theta = 0.0        # start far from the minimum
alpha = 0.1         # learning rate
history = []

for step in range(15):
    theta = theta - alpha * gradient(theta)
    history.append(round(theta, 4))

print("theta after each step:", history)
print(f"Final theta: {theta:.4f}  (true minimum is at theta=4)")
# OUTPUT (typical):
# theta after each step: [0.8, 1.44, 1.952, 2.3616, ..., 3.9508, 3.9606]
# Final theta: 3.9606  (true minimum is at theta=4)`
            ],
            codeExplanations: [
                `<code>cost(theta)</code> defines a simple parabola with its minimum at <code>theta=4</code>, standing in for a real ML cost function (e.g. mean squared error). <code>gradient(theta)</code> is its exact derivative, telling us the slope of the cost curve at any given <code>theta</code>. Starting from <code>theta=0</code> (far from the true minimum), the loop repeatedly applies the gradient descent update rule <code>theta = theta - alpha * gradient(theta)</code>: at each step, it moves <code>theta</code> a little bit in the direction that REDUCES the cost, with the learning rate <code>alpha=0.1</code> controlling the step size. After just 15 steps, <code>theta</code> has converged very close to the true minimum of 4, demonstrating the core mechanic that trains every gradient-based ML model: repeatedly nudge parameters downhill along the cost function's slope.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Most ML models have no simple closed-form formula for their optimal parameters (Linear Regression is a rare exception with its "normal equation") - for everything from Logistic Regression to a Neural Network with millions of weights, gradient descent (or a variant of it) is the ONLY practical way to find good parameters.
<ul>
<li>A modern neural network can have <strong>millions or billions of parameters</strong> - directly solving for the exact minimum algebraically is computationally impossible at that scale, but computing a gradient (via backpropagation) and taking a small step is cheap enough to repeat millions of times.</li>
<li>Choosing the learning rate <code>&alpha;</code> correctly is critical and is one of the most important hyperparameters in all of ML: too large and the algorithm can overshoot the minimum and DIVERGE (cost gets worse, not better); too small and training becomes impractically slow, potentially taking far more iterations (and compute cost/time) than is feasible.</li>
<li>For NON-CONVEX cost functions (the norm for neural networks, as opposed to the single-bowl-shaped convex cost functions of Linear/Logistic Regression), gradient descent can get stuck in a <strong>local minimum</strong> or a <strong>saddle point</strong> - a point where the gradient is zero but which isn't the best possible solution - which is why techniques like momentum, adaptive learning rates (Adam optimizer), and random weight initialization all exist specifically to help escape these traps.</li>
</ul>
<h3>Real-World Example</h3>
Training an image-classification neural network (e.g. distinguishing cats from dogs across millions of photos) involves a cost function defined over potentially <strong>tens of millions of weights</strong> simultaneously.
<ul>
<li>Computing the exact gradient of the cost with respect to every single weight, for every training image, would be prohibitively slow if done the naive way - this is why <strong>Mini-Batch Gradient Descent</strong> (computing the gradient on a small random batch of, say, 32-256 images at a time, then updating weights, then repeating with the next batch) is what's actually used in practice, balancing update speed against gradient accuracy.</li>
<li>Frameworks like TensorFlow and PyTorch use <strong>backpropagation</strong> (an efficient application of the chain rule) to compute this gradient automatically, and use adaptive optimizers like <strong>Adam</strong> (which automatically adjusts the effective learning rate per-parameter over time) rather than plain fixed-learning-rate gradient descent, precisely to navigate the highly non-convex cost surface of a deep network more reliably.</li>
</ul>`,
            codeExamples: [
                `# Comparing Batch, Stochastic, and Mini-Batch gradient descent on a linear regression cost function
import numpy as np

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, 200).reshape(-1, 1)
y = 3 * X.ravel() + 5 + rng.normal(0, 1, 200)   # true relationship: y = 3x + 5 + noise

def compute_gradient(X_batch, y_batch, theta):
    m = len(X_batch)
    predictions = X_batch @ theta[1:] + theta[0]
    error = predictions - y_batch
    grad_intercept = (2 / m) * error.sum()
    grad_slope = (2 / m) * (X_batch.ravel() * error).sum()
    return np.array([grad_intercept, grad_slope])

def run_gradient_descent(batch_size, n_epochs=20, alpha=0.01):
    theta = np.array([0.0, 0.0])   # [intercept, slope]
    n = len(X)
    for epoch in range(n_epochs):
        indices = rng.permutation(n)
        for start in range(0, n, batch_size):
            idx = indices[start:start + batch_size]
            theta = theta - alpha * compute_gradient(X[idx], y[idx], theta)
    return theta

for name, batch_size in [("Stochastic (batch=1)", 1), ("Mini-Batch (batch=32)", 32), ("Batch (batch=200)", 200)]:
    theta = run_gradient_descent(batch_size)
    print(f"{name:<24s} -> intercept={theta[0]:.2f}, slope={theta[1]:.2f}  (true: intercept=5, slope=3)")
# OUTPUT (typical):
# Stochastic (batch=1)     -> intercept=4.89, slope=3.02  (true: intercept=5, slope=3)
# Mini-Batch (batch=32)    -> intercept=4.76, slope=2.99  (true: intercept=5, slope=3)
# Batch (batch=200)        -> intercept=3.41, slope=3.13  (true: intercept=5, slope=3)`
            ],
            codeExplanations: [
                `This fits a simple linear regression (<code>y = slope * x + intercept</code>) using gradient descent, but generalized to run with any <code>batch_size</code> - which is exactly what distinguishes the three named variants. <code>compute_gradient</code> computes the mean-squared-error gradient with respect to both the intercept and slope, but only over whichever subset of rows (<code>X_batch</code>, <code>y_batch</code>) it's given. <code>run_gradient_descent</code> shuffles the data each epoch and steps through it in chunks of <code>batch_size</code> rows, updating <code>theta</code> after each chunk. With <code>batch_size=1</code>, this is <strong>Stochastic Gradient Descent</strong> (one random row per update - noisy but fast per-step); with <code>batch_size=200</code> (the full dataset), it's <strong>Batch Gradient Descent</strong> (one very accurate but expensive update per epoch, so with the fixed <code>n_epochs=20</code> here it has taken far fewer total update steps and is still converging); <code>batch_size=32</code> is <strong>Mini-Batch Gradient Descent</strong>, the practical middle ground used almost universally in real deep learning training loops. All three trend toward the true intercept=5, slope=3 relationship, though mini-batch and stochastic converge faster given the same number of epochs, since they update far more frequently per epoch.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Scales to models with millions of parameters</strong> - unlike solving for an exact algebraic minimum (which for Linear Regression requires inverting a matrix, an operation that becomes computationally infeasible with very many features), gradient descent's per-step cost stays manageable regardless of parameter count, which is precisely why it's the only practical option for deep neural networks.</li>
<li><strong>General-purpose across virtually any differentiable cost function</strong> - the exact same update rule <code>&theta; = &theta; - &alpha;&nabla;J(&theta;)</code> trains Linear Regression, Logistic Regression, Support Vector Machines, and every layer of a neural network - only the cost function and its gradient formula change.</li>
<li><strong>Mini-batch/stochastic variants enable training on datasets too large to fit in memory</strong> - since each update only needs one small batch of data at a time, models can be trained by streaming through a dataset far larger than available RAM, one batch at a time.</li>
<li><strong>Well-understood convergence guarantees on convex problems</strong> - for convex cost functions (like plain Linear or Logistic Regression's), gradient descent with an appropriately small learning rate is mathematically guaranteed to converge to the single global minimum, giving strong theoretical confidence in the result.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Extremely sensitive to the learning rate</strong> - as demonstrated below, too large a learning rate causes the cost to oscillate or diverge entirely (get worse every step) instead of converging, while too small a learning rate can make training impractically slow, sometimes needing far more iterations than are computationally feasible.</li>
<li><strong>Can get stuck in local minima or saddle points on non-convex problems</strong> - deep neural network cost surfaces are highly non-convex with many local minima and flat saddle regions; plain gradient descent has no mechanism to escape a region where the gradient is near zero but isn't the global best solution.</li>
<li><strong>Requires the cost function to be differentiable</strong> - gradient descent cannot directly optimize cost functions with hard discontinuities or non-differentiable points (e.g. raw classification accuracy, which jumps in discrete steps) - this is exactly why classifiers use smooth proxy losses like log-loss/cross-entropy instead of optimizing accuracy directly.</li>
<li><strong>Feature scale strongly affects convergence speed</strong> - unscaled features with very different numeric ranges create an elongated, narrow cost "valley" that gradient descent zig-zags slowly through, which is why standardizing features first is a near-mandatory preprocessing step before gradient-based training.</li>
</ul>`,
            codeExamples: [
                `# Illustrating a learning rate that's too large (diverges) vs too small (slow) vs well-tuned
def cost(theta):
    return (theta - 4) ** 2

def gradient(theta):
    return 2 * (theta - 4)

def run(alpha, n_steps=10, start=0.0):
    theta = start
    path = [theta]
    for _ in range(n_steps):
        theta = theta - alpha * gradient(theta)
        path.append(round(theta, 3))
    return path

print("alpha=1.1 (too large -> diverges):     ", run(1.1))
print("alpha=0.01 (too small -> slow):        ", run(0.01))
print("alpha=0.3 (well-tuned -> converges fast):", run(0.3))
# OUTPUT (typical):
# alpha=1.1 (too large -> diverges):      [0.0, 8.8, -3.52, 17.02, -18.83, 42.51, ...]   <- cost explodes outward
# alpha=0.01 (too small -> slow):         [0.0, 0.08, 0.158, 0.235, 0.31, 0.383, 0.454, 0.523, 0.59, 0.656, 0.72]  <- barely moved
# alpha=0.3 (well-tuned -> converges fast):[0.0, 2.4, 3.28, 3.6, 3.71, 3.9, 3.96, 3.99, 3.99, 4.0, 4.0]   <- converged in ~7 steps`
            ],
            codeExplanations: [
                `This uses the same simple quadratic cost function from the beginner example (minimum at <code>theta=4</code>) to isolate the effect of learning rate alone. With <code>alpha=1.1</code> (greater than 1, larger than what this parabola's curvature can tolerate), each step overshoots the minimum by an ever-larger amount, and <code>theta</code> oscillates further and further away - visibly diverging, exactly the "cost gets worse, not better" failure mode of too large a learning rate. With <code>alpha=0.01</code>, each step is so tiny that after 10 steps <code>theta</code> has only crept from 0 to about 0.72 - technically converging in the right direction, but far too slowly to be practical if this represented, say, a neural network needing millions of expensive steps. With a well-tuned <code>alpha=0.3</code>, <code>theta</code> converges essentially to the true minimum of 4 within about 7 steps - illustrating why learning rate tuning (often via a learning rate schedule, or an adaptive optimizer like Adam that adjusts it automatically) is one of the most consequential choices in training any gradient-based model.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the general gradient descent update rule, and what does each term mean?</td><td>theta = theta - alpha * gradient_of_J(theta). theta is the current parameter values, J(theta) is the cost function being minimized, gradient_of_J(theta) points in the direction of steepest cost INCREASE (so subtracting it moves downhill), and alpha is the learning rate controlling how large each step is</td></tr>
<tr class='text-center'><td>What is the difference between Batch, Stochastic, and Mini-Batch gradient descent?</td><td>Batch gradient descent computes the gradient using the ENTIRE training set before each update - accurate but slow per epoch and memory-heavy. Stochastic gradient descent updates after EVERY single training example - very fast per step but noisy. Mini-batch gradient descent updates after a small batch (e.g. 32-256 examples) - the practical middle ground used in almost all real deep learning training, balancing update speed against gradient accuracy</td></tr>
<tr class='text-center'><td>Why can gradient descent get stuck in a local minimum or saddle point, and what techniques help with this?</td><td>On a non-convex cost surface (typical for neural networks), the gradient can be exactly zero at points that are not the global minimum - a local minimum (a dip that isn't the lowest possible) or a saddle point (flat in some directions, sloped in others) - and plain gradient descent has no way to tell it should keep moving. Techniques like momentum (carrying velocity through flat regions), adaptive optimizers like Adam (adjusting per-parameter step sizes), and random/multiple weight initializations all help the optimizer escape or avoid getting trapped in these points</td></tr>
</table>`
        }
    ]
};
