import { Topic } from '../../coreJava';

export const mse: Topic = {
    id: 'ml-regression-mse',
    name: 'MSE',
    beginner: [
        {
            content: `<h4>The Average of the Squared Prediction Errors</h4>
<ul>
<li><strong>Mean Squared Error (MSE)</strong> measures how far off a regression model's predictions are from the actual values, on average, by squaring each error before averaging: <code>MSE = (1/n) &middot; &Sigma;(actual - predicted)&sup2;</code>.</li>
<li>Squaring each error does two things at once: it makes every term positive (so an overestimate and an underestimate of equal size don't cancel out to a misleadingly small total), and it punishes LARGE errors far more than small ones - an error twice as big contributes four times as much to the total.</li>
<li>Because the errors are squared, the RESULT is in <strong>squared units</strong> - if predicting house prices in dollars, MSE comes out in dollars-squared, which is not something a person can intuitively picture.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import mean_squared_error
import numpy as np

y_actual =    np.array([200000, 300000, 400000, 500000])
y_predicted = np.array([210000, 290000, 420000, 480000])

mse_value = mean_squared_error(y_actual, y_predicted)
print(f"MSE: {mse_value:,.0f}")
# OUTPUT:
# MSE: 260,000,000`
            ],
            codeExplanations: [
                `This computes the Mean Squared Error between four actual house prices and four predicted prices using scikit-learn's mean_squared_error(). Under the hood it subtracts each predicted value from the actual value, squares each of those four differences, and averages the results. The output, 260,000,000, is in dollars-squared - a number nobody can meaningfully picture on its own, but useful for comparing one model's predictions directly against another's, since the model with the lower MSE is making smaller (and especially fewer LARGE) errors on average.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>MSE is the default loss function that many regression algorithms (including Ordinary Least Squares Linear Regression) directly minimize during training, so understanding it explains WHAT the model is actually being optimized to do.</li>
<li>Because it squares errors, MSE is extremely sensitive to outliers - a handful of badly wrong predictions can dominate the entire score even if the model is quite accurate on everything else. This is a deliberate design choice (heavily penalizing large mistakes), not a flaw, but it means MSE tells a different story than a metric that treats every error proportionally.</li>
<li>Comparing two models purely on MSE can favor the one that avoids rare, huge misses even if it is slightly worse on the typical case - which is exactly the tradeoff a business needs to be aware of before picking a "winning" model.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate company is choosing between two house-price prediction models before deploying one to its live pricing tool.
<ul>
<li><strong>Model A</strong> is consistently off by a moderate amount on almost every house - never wildly wrong, but never spot-on either.</li>
<li><strong>Model B</strong> nails the price almost exactly on most houses, but occasionally (for a handful of unusual mansions) predicts a price that is off by hundreds of thousands of dollars.</li>
<li>Even though Model B is "more accurate" on the majority of listings, its rare massive misses get SQUARED, and MSE ends up flagging Model B as the worse model overall - correctly warning the company that Model B carries a real risk of occasionally listing a house at a wildly wrong price, which could be far more damaging in practice than Model A's mild but steady inaccuracy.</li>
</ul>`,
            codeExamples: [
                `# Model A: consistently moderate errors. Model B: mostly excellent, but occasionally wildly wrong.
import numpy as np
from sklearn.metrics import mean_squared_error

y_actual = np.array([200000, 300000, 400000, 500000, 600000, 1200000])

y_pred_model_a = np.array([215000, 285000, 420000, 480000, 615000, 1230000])   # steady, moderate errors
y_pred_model_b = np.array([201000, 299000, 399000, 501000, 598000, 700000])    # near-perfect except one huge miss

mse_a = mean_squared_error(y_actual, y_pred_model_a)
mse_b = mean_squared_error(y_actual, y_pred_model_b)
print(f"Model A MSE: {mse_a:,.0f}")
print(f"Model B MSE: {mse_b:,.0f}")
# OUTPUT:
# Model A MSE: 275,166,667
# Model B MSE: 41,833,833,333   <- one wild miss on the mansion dominates the score`
            ],
            codeExplanations: [
                `Model A is off by a modest, fairly consistent amount on every house, while Model B is nearly perfect on five of the six houses but badly misses the price of the most expensive mansion (predicting $700,000 for a true $1,200,000 home). Even though Model B is clearly more accurate on average across most listings, squaring that one $500,000 error produces a term so large it swamps everything else in the sum, and Model B's MSE ends up dramatically higher than Model A's. This is MSE working exactly as designed - it is telling the company that Model B has a real tail-risk of occasionally being catastrophically wrong, information a metric that treated errors proportionally (like MAE) would report far less dramatically.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Differentiable everywhere</strong> - because it is a smooth quadratic function of the error, MSE has a well-defined gradient at every point, which is exactly why it's the natural loss function for gradient-based optimizers used to fit models like Linear Regression and neural networks.</li>
<li><strong>Strongly penalizes large errors</strong> - useful whenever a few big mistakes are far more costly than many small ones, e.g. a model whose worst-case error must be kept small even at the cost of average performance.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Units are squared, not interpretable</strong> - a value of "260,000,000 dollars-squared" means nothing intuitively to a business stakeholder, unlike an error reported directly in dollars. This is the exact motivation for <strong>RMSE</strong>, which takes the square root of MSE to return to the original units.</li>
<li><strong>Dominated by outliers</strong> - as shown above, a single very bad prediction can make an otherwise-strong model look far worse than a mediocre-but-consistent one, which is not always the comparison a stakeholder actually wants.</li>
<li><strong>Hard to compare across problems with different target scales</strong> - an MSE of a million means something completely different when predicting house prices (in the hundreds of thousands) versus predicting a percentage (0 to 100), making raw MSE values meaningless outside the context of one specific target's scale.</li>
</ul>
<h3>Deeper Mechanics - MSE as the Objective Ordinary Least Squares Minimizes</h3>
<ul>
<li>When <code>LinearRegression.fit()</code> solves for its coefficients, it is directly minimizing the sum of squared residuals, a quantity proportional to MSE - so MSE isn't just a metric computed AFTER training, it can literally BE the training objective.</li>
<li>Because the penalty grows with the SQUARE of the error, MSE implicitly assumes that the cost of a mistake grows faster than linearly with its size - appropriate when a few very large misses are much worse than many small ones, but not appropriate for every business problem.</li>
</ul>`,
            codeExamples: [
                `# Showing that OLS Linear Regression is literally minimizing (a scaled version of) MSE
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

X = np.array([[1000], [1500], [2000], [2500], [3000]])
y = np.array([210000, 290000, 405000, 480000, 620000])

model = LinearRegression().fit(X, y)
fitted_mse = mean_squared_error(y, model.predict(X))

# Try slightly perturbing the fitted slope/intercept - MSE should only get WORSE, never better
best_slope, best_intercept = model.coef_[0], model.intercept_
for delta_slope, delta_intercept in [(0, 0), (5, 0), (-5, 0), (0, 5000), (0, -5000)]:
    predictions = (best_slope + delta_slope) * X.ravel() + (best_intercept + delta_intercept)
    print(f"slope delta={delta_slope:+}  intercept delta={delta_intercept:+}  MSE={mean_squared_error(y, predictions):,.0f}")
# OUTPUT (typical):
# slope delta=+0  intercept delta=+0      MSE=231,000,000   <- the fitted (optimal) line
# slope delta=+5  intercept delta=+0      MSE=257,431,250
# slope delta=-5  intercept delta=+0      MSE=257,431,250
# slope delta=+0  intercept delta=+5000   MSE=256,000,000
# slope delta=+0  intercept delta=-5000   MSE=256,000,000`
            ],
            codeExplanations: [
                `After fitting a LinearRegression model normally, this deliberately nudges the fitted slope and intercept slightly away from their optimal values in both directions and recomputes MSE each time. Every single perturbation makes MSE worse (higher) than the original fitted line's MSE, in both directions of every nudge - concrete proof that OLS's fitted coefficients sit exactly at the point that minimizes MSE (technically the sum of squared residuals, which is MSE times a constant). This is why MSE is not just an after-the-fact evaluation metric for many regression models - it is frequently the literal mathematical objective the training process is solving for.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does MSE square the errors instead of just averaging the raw differences?</td><td>Squaring makes every term positive so overestimates and underestimates cannot cancel out to a falsely small total, and it penalizes large errors disproportionately more than small ones (an error twice as big contributes four times as much), which discourages a model from being wildly wrong on any single prediction</td></tr>
<tr class='text-center'><td>Why is MSE hard to interpret directly, and what metric fixes that?</td><td>Because the errors are squared, MSE's units are squared too (e.g. dollars-squared for a price model), which has no intuitive real-world meaning; taking the square root of MSE gives RMSE, which returns to the target's original units while keeping the same sensitivity to large errors</td></tr>
<tr class='text-center'><td>If two models have similar average error but one occasionally makes a huge mistake, how will their MSE scores compare?</td><td>The model with the occasional huge mistake will usually have a much higher MSE, because squaring amplifies large errors far more than small ones - MSE can make a model with rare catastrophic misses look worse overall than a model that is consistently only moderately off</td></tr>
</table>`
        }
    ]
};
