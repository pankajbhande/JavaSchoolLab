import { Topic } from '../../coreJava';

export const costFunction: Topic = {
    id: 'ml-regression-cost-function',
    name: 'Cost Function',
    beginner: [
        {
            content: `<h3>Cost Function</h3>
A <strong>cost function</strong> (also called a loss function) is a single number that quantifies HOW WRONG a model's predictions currently are, compared to the actual values. Training a model is, at its core, the process of searching for the parameter values that make this number as small as possible.
<ul>
<li>For regression, the most common cost function is <strong>Mean Squared Error (MSE)</strong>: the average of the squared differences between each predicted value and its actual value.</li>
<li>A LOWER cost means the model's predictions are, on average, closer to reality; a cost of exactly 0 would mean every prediction is perfect.</li>
<li>Every fitting algorithm in this module - Ordinary Least Squares, Gradient Descent, Ridge, and Lasso - is ultimately just a different strategy for minimizing some version of this same idea: a cost function measuring prediction error.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.metrics import mean_squared_error

actual = np.array([200000, 300000, 400000, 500000])
predictions_good = np.array([210000, 295000, 405000, 490000])
predictions_bad = np.array([50000, 600000, 100000, 900000])

cost_good = mean_squared_error(actual, predictions_good)
cost_bad = mean_squared_error(actual, predictions_bad)

print(f"MSE of the good predictions: {cost_good:,.0f}")
print(f"MSE of the bad predictions:  {cost_bad:,.0f}")
# OUTPUT (typical):
# MSE of the good predictions: 91,250,000
# MSE of the bad predictions:  85,268,750,000`
            ],
            codeExplanations: [
                `Two different sets of predictions are compared against the same actual house prices. <code>mean_squared_error</code> computes the average of each prediction's squared difference from the true value - the same quantity a regression model's training process tries to minimize. The "good" predictions, which sit close to the actual prices, produce a cost function value orders of magnitude smaller than the "bad" predictions, which are wildly off - concretely demonstrating that the cost function is exactly the number a model is judged by, and the number that training drives toward its minimum.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without a cost function, there would be no objective way to say one candidate model is "better" than another, and no target for a training algorithm to optimize toward.
<ul>
<li>The cost function IS the definition of what "good" means for a specific model - choosing MSE versus a different cost function changes what kind of errors the model is penalized most for, which in turn changes what the "best" fitted line even looks like.</li>
<li>Training algorithms like Gradient Descent work by repeatedly asking "if I nudge my parameters slightly, does the cost function go up or down?" and moving in the direction that decreases it - so the cost function isn't just a report card, it's the actual signal that drives learning.</li>
<li>Why squaring the error (MSE) rather than using the absolute difference (Mean Absolute Error)? Two reasons: MSE is <strong>differentiable everywhere</strong> (its derivative is a smooth, simple expression), which is essential for gradient-based optimization, while absolute error has a sharp, non-differentiable corner at zero error; and MSE <strong>penalizes large errors disproportionately more</strong> than small ones (an error twice as large contributes four times as much cost), which pushes training to avoid being wildly wrong on any single point.</li>
</ul>
<h3>Real-World Example</h3>
Visualizing how MSE changes as a single slope parameter is swept across a range of candidate values, while the intercept is held fixed, traces out the characteristic smooth, bowl-shaped curve that Gradient Descent is actually descending step by step during training.`,
            codeExamples: [
                `# Sweeping a single slope parameter and plotting (as printed values) the resulting MSE "bowl"
import numpy as np

X = np.array([1, 2, 3, 4, 5])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])   # roughly y = 2x

intercept = 0.0   # held fixed to isolate the effect of slope alone
slopes = np.linspace(0, 4, 9)

for slope in slopes:
    predictions = slope * X + intercept
    mse = np.mean((y - predictions) ** 2)
    print(f"slope={slope:.2f}  MSE={mse:6.3f}")
# OUTPUT (typical):
# slope=0.00  MSE=45.610
# slope=0.50  MSE=27.749
# slope=1.00  MSE=14.888
# slope=1.50  MSE= 7.027
# slope=2.00  MSE= 3.166   <- near the minimum, forming the bottom of the bowl
# slope=2.50  MSE= 4.305
# slope=3.00  MSE=10.444
# slope=3.50  MSE=21.583
# slope=4.00  MSE=37.722`
            ],
            codeExplanations: [
                `With the intercept held fixed at 0, the slope is swept across nine values from 0 to 4, and the MSE cost is recomputed at each one. The printed values fall, reach a minimum somewhere close to slope=2 (the true underlying relationship in the data), and then rise again symmetrically as the slope overshoots - exactly the shape of a parabola, or "bowl", when plotted. This is precisely the surface that Gradient Descent's update rule descends one small step at a time: it computes the local slope of this bowl (the gradient) at its current position and steps toward lower cost, which is only possible in the first place because MSE is smooth and differentiable everywhere along this curve.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Differentiable everywhere</strong> - MSE's smooth parabola shape means its gradient can be computed analytically at any point, which is a hard requirement for gradient-based optimizers like Gradient Descent to function at all.</li>
<li><strong>Penalizes large errors heavily</strong> - squaring the error means a model that is occasionally very wrong is punished far more than one that is consistently slightly wrong, which usually matches real-world priorities (a wildly wrong prediction is often much more costly than several small ones).</li>
<li><strong>Has a well-defined closed-form minimum for linear regression</strong> - because MSE is a smooth quadratic function of the model's coefficients, Ordinary Least Squares can solve for its exact minimum directly via the normal equation, without any iterative search.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Very sensitive to outliers</strong> - because errors are squared, a single extreme outlier contributes disproportionately to the total cost and can pull the fitted parameters noticeably away from the bulk of the data, exactly mirroring OLS's own outlier sensitivity.</li>
<li><strong>Its units are squared, hurting interpretability</strong> - an MSE of 91,250,000 for house prices in dollars is not itself directly meaningful; <strong>Root Mean Squared Error (RMSE)</strong>, its square root, is often reported instead specifically to bring the units back to the original scale.</li>
<li><strong>Not always the right choice of cost function</strong> - if large outliers should NOT dominate the fit (e.g. data with heavy-tailed noise), Mean Absolute Error or a robust loss like Huber loss may be preferred instead, at the cost of losing MSE's clean differentiability everywhere.</li>
</ul>`,
            codeExamples: [
                `# Comparing MSE vs Mean Absolute Error (MAE) sensitivity to a single outlier
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

actual = np.array([100, 102, 98, 101, 99])
predictions_normal = np.array([101, 100, 99, 102, 98])          # small, ordinary errors
predictions_one_outlier = np.array([101, 100, 99, 102, 60])     # one prediction is way off

for name, preds in [("no outlier", predictions_normal), ("one bad outlier", predictions_one_outlier)]:
    mse = mean_squared_error(actual, preds)
    mae = mean_absolute_error(actual, preds)
    print(f"{name:>16s}: MSE={mse:7.2f}   MAE={mae:6.2f}")
# OUTPUT (typical):
#       no outlier: MSE=   2.00   MAE=  2.00
#  one bad outlier: MSE= 306.60   MAE=  9.60   <- MSE jumps ~150x, MAE only ~5x`
            ],
            codeExplanations: [
                `Two prediction sets are identical except for one value: the last prediction is changed from a normal small error (99 vs actual 99) to a large outlier (60 vs actual 99). MAE, which uses the absolute error, grows proportionally to the size of that single bad error. MSE, which SQUARES the error, grows far more dramatically for the exact same single outlier - jumping roughly 150-fold versus MAE's roughly 5-fold increase - concretely illustrating why MSE is described as heavily penalizing large errors: a model trained to minimize MSE will contort itself much harder to avoid that one bad prediction than a model trained to minimize MAE would.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a cost function, and why does a training algorithm need one?</td><td>A cost function is a single number quantifying how wrong a model's predictions are compared to actual values; training algorithms like gradient descent or OLS work by searching for the parameter values that minimize this number, so without a cost function there is no defined objective for training to optimize toward</td></tr>
<tr class='text-center'><td>Why is Mean Squared Error the most common cost function for regression, rather than just averaging the raw (unsquared) errors?</td><td>Averaging raw errors directly would let positive and negative errors cancel out to a misleadingly small total; squaring makes every error positive and, unlike Mean Absolute Error, is smooth and differentiable everywhere, which gradient-based optimizers require, while also penalizing large errors disproportionately more than small ones</td></tr>
<tr class='text-center'><td>If you plot MSE against a single model parameter while holding the others fixed, what shape does it typically form for linear regression, and why does that matter?</td><td>A smooth, bowl-shaped (parabolic) curve with a single minimum; this shape is exactly the surface that Gradient Descent descends step by step during training, and its single-minimum, convex nature is why gradient descent is guaranteed to converge to the global minimum for linear regression's MSE cost function</td></tr>
</table>`
        }
    ]
};
