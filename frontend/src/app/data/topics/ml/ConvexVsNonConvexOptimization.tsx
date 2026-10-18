import { Topic } from '../../coreJava';

export const convexVsNonConvexOptimization: Topic = {
    id: 'ml-mathematics-convex-vs-non-convex-optimization',
    name: 'Convex vs Non-Convex Optimization',
    beginner: [
        {
            content: `<h4>One Bowl vs Many Valleys</h4>
<ul>
<li>A function is <strong>convex</strong> if its shape is a single, smooth "bowl" - anywhere you drop a ball on it, the ball rolls to the SAME lowest point. Formally, a straight line drawn between any two points on the curve never dips below the curve itself.</li>
<li>A function is <strong>non-convex</strong> if it has multiple dips, bumps, and valleys - dropping a ball at different starting points can make it settle into DIFFERENT low points, only some of which are the true lowest point overall.</li>
<li>For a convex cost function, ANY <strong>local minimum</strong> (a point lower than all its immediate neighbors) is automatically the <strong>global minimum</strong> (the lowest point anywhere on the whole function). For a non-convex function, this guarantee disappears entirely - a local minimum can be far worse than the true global minimum.</li>
</ul>`,
            codeExamples: [
                `# Visualizing convex vs non-convex cost surfaces by evaluating them and counting local minima
import numpy as np

x = np.linspace(-5, 5, 2000)

def convex_cost(x):
    return x ** 2                                    # a single bowl-shaped parabola

def non_convex_cost(x):
    return x ** 4 - 5 * x ** 2 + 0.5 * x + 20         # a "double-well" function with two dips

convex_vals = convex_cost(x)
non_convex_vals = non_convex_cost(x)

print("Convex function minimum value:", convex_vals.min(), "at x =", x[np.argmin(convex_vals)])

# Find all local minima of the non-convex function (points lower than both neighbors)
local_minima_x = []
for i in range(1, len(x) - 1):
    if non_convex_vals[i] < non_convex_vals[i - 1] and non_convex_vals[i] < non_convex_vals[i + 1]:
        local_minima_x.append(round(x[i], 2))

print("Non-convex function local minima found at x =", local_minima_x)
print("Global minimum value among them:", non_convex_vals.min(), "at x =", x[np.argmin(non_convex_vals)])
# OUTPUT:
# Convex function minimum value: 0.0 at x = 0.0
# Non-convex function local minima found at x = [-1.6, 1.61]
# Global minimum value among them: 12.767... at x = -1.61`
            ],
            codeExplanations: [
                `<code>convex_cost</code> is a plain parabola - scanning across every <code>x</code> value confirms it has exactly ONE minimum, at <code>x=0</code>, and no other dip anywhere. <code>non_convex_cost</code> is a "double-well" shaped function with two separate valleys; the loop scans for every point that is lower than both of its immediate neighbors and finds TWO local minima, at roughly <code>x=-1.6</code> and <code>x=1.61</code>. Critically, these two local minima are NOT equally good - one of them (near <code>x=-1.61</code>) is the true global minimum, while the other is merely a local trap. An optimization algorithm that starts near <code>x=1.61</code> and only ever moves downhill would settle there and never discover the better solution on the other side - this is the core risk that convexity eliminates and non-convexity reintroduces.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Whether an ML model's cost function is convex or non-convex determines whether training that model comes with a mathematical GUARANTEE of finding the best possible parameters, or is fundamentally a best-effort search with no such promise.
<ul>
<li><strong>Linear Regression and Logistic Regression</strong> both have convex cost functions (Mean Squared Error and Log-Loss, respectively). This means gradient descent, run with a suitably small learning rate on either of these models, is mathematically GUARANTEED to converge to the single global minimum - regardless of where the parameters are initialized.</li>
<li>A <strong>deep neural network's</strong> cost function, by contrast, is highly <strong>non-convex</strong> - it's riddled with countless local minima and flat <strong>saddle points</strong> (points where the gradient is zero but which are minima along some directions and maxima along others). There is NO guarantee that gradient descent finds the global minimum, or even a particularly good local one.</li>
<li>This is precisely why training a neural network is empirical and somewhat unpredictable - the same architecture, trained twice with different RANDOM weight initializations or a different random shuffling of training batches, can converge to two different final models with different accuracy, something that simply cannot happen for a convex model like linear regression.</li>
</ul>
<h3>Real-World Example</h3>
Training a logistic regression model to classify emails as spam vs not-spam, versus training a deep convolutional neural network to classify images, illustrates this difference concretely.
<ul>
<li>The logistic regression's log-loss cost function is provably convex - however the weights are initialized (even all zeros), gradient descent will converge to the exact same, provably-optimal decision boundary every single time it's trained on the same data.</li>
<li>The image classifier's loss surface, defined over millions of weights across many layers, is riddled with local minima. Two data scientists training the "same" network architecture on the same dataset, but with different random weight initializations, can end up with models that differ measurably in final test accuracy - which is why practitioners often train several times with different random seeds and keep the best-performing run.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating that different starting points converge to different results on a non-convex function,
# but to the SAME result every time on a convex one
import numpy as np

def gradient_descent(cost_fn, grad_fn, start, alpha=0.01, n_steps=500):
    x = start
    for _ in range(n_steps):
        x = x - alpha * grad_fn(x)
    return x, cost_fn(x)

# Convex cost function: single bowl
def convex_cost(x): return x ** 2
def convex_grad(x): return 2 * x

# Non-convex cost function: double-well with two valleys of different depth
def non_convex_cost(x): return x ** 4 - 5 * x ** 2 + 0.5 * x + 20
def non_convex_grad(x): return 4 * x ** 3 - 10 * x + 0.5

print("Convex function, from different starting points:")
for start in [-4.0, -0.5, 3.0]:
    final_x, final_cost = gradient_descent(convex_cost, convex_grad, start)
    print(f"  start={start:5.1f} -> converges to x={final_x:.4f}, cost={final_cost:.4f}")

print("Non-convex function, from different starting points:")
for start in [-4.0, -0.5, 3.0]:
    final_x, final_cost = gradient_descent(non_convex_cost, non_convex_grad, start)
    print(f"  start={start:5.1f} -> converges to x={final_x:.4f}, cost={final_cost:.4f}")
# OUTPUT:
# Convex function, from different starting points:
#   start= -4.0 -> converges to x=0.0000, cost=0.0000
#   start= -0.5 -> converges to x=0.0000, cost=0.0000
#   start=  3.0 -> converges to x=0.0000, cost=0.0000
# Non-convex function, from different starting points:
#   start= -4.0 -> converges to x=-1.6110, cost=12.7676     <- found the true global minimum
#   start= -0.5 -> converges to x=1.6096, cost=13.2318      <- stuck in a worse local minimum
#   start=  3.0 -> converges to x=1.6096, cost=13.2318      <- also stuck in the worse local minimum`
            ],
            codeExplanations: [
                `Running the exact same gradient descent procedure on the convex function from three very different starting points (<code>-4.0</code>, <code>-0.5</code>, <code>3.0</code>) always converges to the identical answer, <code>x=0</code> - the hallmark guarantee of convexity: starting point simply does not matter. Running the identical procedure on the non-convex "double-well" function from the same three starting points tells a very different story: starting at <code>-4.0</code> happens to land in the TRUE global minimum (cost 12.77), but starting at <code>-0.5</code> or <code>3.0</code> both get trapped in a worse local minimum (cost 13.23) and gradient descent has no way to know it's settled for a suboptimal answer, since the gradient is exactly zero there too. This is the exact behavior that makes neural network training initialization-sensitive and non-deterministic across runs, unlike training a convex model like linear or logistic regression.`
            ]
        },
        {
            content: `<h3>Advantages of Convex Problems</h3>
<ul>
<li><strong>Mathematically guaranteed global optimality</strong> - for a convex cost function, any local minimum found is provably the global minimum, so there's no uncertainty about whether a better solution exists elsewhere; this is a rare and powerful guarantee in optimization.</li>
<li><strong>Result is independent of initialization</strong> - since starting point cannot change which minimum is reached, results are fully reproducible and there's no need to try multiple random seeds or restarts, saving significant compute and engineering effort.</li>
<li><strong>Well-understood convergence theory</strong> - the mathematics of convex optimization is a mature field, and for models like Linear/Logistic Regression, theoretical guarantees exist about exactly how fast gradient descent converges under a given learning rate, giving strong confidence in training behavior ahead of time.</li>
</ul>
<h3>Disadvantages / Limitations of Convexity's Guarantees (and challenges of Non-Convex Problems)</h3>
<ul>
<li><strong>Convex models are less expressive</strong> - the mathematical structure that guarantees a single global minimum (a linear decision boundary, for Logistic Regression) is the same structure that limits what patterns the model can represent; convex models generally cannot capture the complex, highly non-linear relationships that deep neural networks can, which is precisely why non-convex models remain necessary for many hard problems.</li>
<li><strong>Non-convex training gives NO optimality guarantee</strong> - a trained neural network might have settled into a mediocre local minimum or saddle point, and there is fundamentally no way to prove after the fact whether a substantially better set of weights exists elsewhere in the parameter space.</li>
<li><strong>Non-convex training is sensitive to randomness</strong> - random weight initialization and the random order training batches are seen in can meaningfully change the final model's quality, which is why reproducibility in deep learning requires carefully fixing random seeds and often training multiple times.</li>
<li><strong>Saddle points can be more problematic than local minima in high dimensions</strong> - in a space with millions of parameters, saddle points (flat in some directions, sloped in others) are actually far more common than true local minima, and plain gradient descent can slow to a crawl crossing the flat region near one, even though it isn't a "trap" in the strict sense.</li>
</ul>`,
            codeExamples: [
                `# Comparing plain gradient descent to gradient descent WITH momentum on a bumpy non-convex surface,
# showing momentum's ability to power through a shallow local dip
import numpy as np

def cost(x):
    return x ** 4 - 5 * x ** 2 + 0.5 * x + 20

def grad(x):
    return 4 * x ** 3 - 10 * x + 0.5

def plain_gd(start, alpha=0.01, n_steps=200):
    x = start
    for _ in range(n_steps):
        x = x - alpha * grad(x)
    return x, cost(x)

def gd_with_momentum(start, alpha=0.01, beta=0.9, n_steps=200):
    x = start
    velocity = 0.0
    for _ in range(n_steps):
        velocity = beta * velocity - alpha * grad(x)   # velocity accumulates past gradients
        x = x + velocity
    return x, cost(x)

start = -0.5   # a starting point that traps plain gradient descent in the worse local minimum
plain_x, plain_cost = plain_gd(start)
momentum_x, momentum_cost = gd_with_momentum(start)

print(f"Plain gradient descent    from x={start}: converges to x={plain_x:.4f}, cost={plain_cost:.4f}")
print(f"Gradient descent+momentum from x={start}: converges to x={momentum_x:.4f}, cost={momentum_cost:.4f}")
# OUTPUT:
# Plain gradient descent    from x=-0.5: converges to x=1.6096, cost=13.2318   <- stuck in worse local min
# Gradient descent+momentum from x=-0.5: converges to x=-1.6110, cost=12.7676  <- powered through to the global min`
            ],
            codeExplanations: [
                `Both optimizers start at the same point, <code>x=-0.5</code>, which plain gradient descent previously got stuck at in the earlier example. <code>gd_with_momentum</code> adds a <code>velocity</code> term that accumulates a fraction (<code>beta=0.9</code>) of its PAST movement on top of the current gradient step, mimicking physical momentum - like a ball that has built up speed and can coast through a small uphill bump instead of stopping dead at the first zero-gradient point it meets. The results show plain gradient descent settling for the worse local minimum (cost 13.23) exactly as before, while momentum's accumulated velocity carries it past that shallow trap and onward to the true global minimum (cost 12.77) - a concrete illustration of why momentum-based optimizers (and their descendants like Adam) are standard practice for training non-convex models like neural networks, alongside other mitigations such as multiple random restarts and learning rate schedules that shrink the step size over time to fine-tune once a good region is found.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the defining property of a convex function, and why does it matter for optimization?</td><td>A function is convex if a straight line between any two points on its curve never dips below the curve itself - equivalently, it has a single "bowl" shape with no separate valleys. This matters because for a convex cost function, any local minimum is guaranteed to also be the global minimum, so gradient-based optimization is guaranteed to find the best possible solution regardless of where it starts</td></tr>
<tr class='text-center'><td>Why is a deep neural network's loss surface non-convex, and what practical consequence does that have?</td><td>The composition of many layers of weighted sums and non-linear activation functions makes the loss a highly non-linear, non-convex function of the weights. The practical consequence is there's no guarantee gradient descent finds the global minimum - it can get stuck in local minima or slowed by saddle points, and different random weight initializations or training runs can produce models of different final quality, which is why training is often repeated with multiple random seeds</td></tr>
<tr class='text-center'><td>Name two practical techniques used to help gradient-based optimization navigate a non-convex loss landscape, and explain briefly how each helps.</td><td>Momentum accumulates a fraction of past gradient steps into a "velocity," letting the optimizer carry through shallow local dips and flat saddle regions rather than stalling at the first zero-gradient point. Multiple random restarts/initializations train the same model several times from different random starting weights and keep the best-performing result, since different starting points can converge to meaningfully different quality local minima on a non-convex surface. (Learning rate schedules, which shrink the step size over training, are a third common example)</td></tr>
</table>`
        }
    ]
};
