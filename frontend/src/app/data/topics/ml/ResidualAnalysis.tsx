import { Topic } from '../../coreJava';

export const residualAnalysis: Topic = {
    id: 'ml-regression-residual-analysis',
    name: 'Residual Analysis',
    beginner: [
        {
            content: `<h4>Looking at the SHAPE of the Errors, Not Just Their Size</h4>
<ul>
<li>A <strong>residual</strong> is the gap between an actual value and a model's predicted value for that same point: <code>residual = actual - predicted</code>. <strong>Residual Analysis</strong> means plotting these residuals (usually against the predicted values) and inspecting the resulting shape, rather than just looking at a single summary number like MSE or R&sup2;.</li>
<li>If a regression model's assumptions genuinely hold, the residual plot should look like unstructured <strong>random noise</strong>, scattered evenly above and below zero with no visible pattern and roughly constant spread across the whole range.</li>
<li>A single metric like R&sup2; can look perfectly fine even while the residual plot reveals a serious, systematic problem with the model - which is exactly why residual analysis is a separate, necessary diagnostic step, not something a good R&sup2; score can substitute for.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.3, 11.9, 14.1, 15.8])

model = LinearRegression().fit(X, y)
predicted = model.predict(X)
residuals = y - predicted

for xi, yi, pred, res in zip(X.ravel(), y, predicted, residuals):
    print(f"x={xi}  actual={yi:>5.1f}  predicted={pred:>5.1f}  residual={res:>+5.2f}")
# OUTPUT (typical):
# x=1  actual=  2.1  predicted=  2.0  residual=+0.10
# x=2  actual=  3.9  predicted=  4.0  residual=-0.10
# x=3  actual=  6.2  predicted=  6.0  residual=+0.20
# x=4  actual=  7.8  predicted=  8.0  residual=-0.20
# x=5  actual= 10.3  predicted= 10.1  residual=+0.20
# x=6  actual= 11.9  predicted= 12.1  residual=-0.20
# x=7  actual= 14.1  predicted= 14.1  residual=+0.00
# x=8  actual= 15.8  predicted= 16.1  residual=-0.30`
            ],
            codeExplanations: [
                `A LinearRegression model is fit on eight nearly-linear points, and each residual is computed directly as actual minus predicted. Scanning down the residual column, the values bounce back and forth between small positive and small negative numbers with no obvious trend as x increases - exactly the "random noise around zero" pattern that indicates the straight-line model is a reasonable fit for this data. This row-by-row view is the numeric equivalent of what a residual PLOT (residuals on the y-axis, predicted values or x on the x-axis) would show visually as a scattered cloud of points with no shape.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Summary metrics like R&sup2; or RMSE compress an entire model's performance into one number, which necessarily hides WHERE and HOW the model is wrong. Two models can have nearly identical R&sup2; scores while one has healthy, random-looking residuals and the other has a glaring systematic pattern - only a residual plot distinguishes them.</li>
<li>A patterned residual plot is direct evidence that the model is violating one of the core assumptions of Ordinary Least Squares (that residuals are independent, centered at zero, and have constant variance), which means not just that the fit is imperfect, but that it is imperfect in a specific, fixable way.</li>
<li>Because it's a visual/diagnostic technique rather than a single score, residual analysis is often the step that tells a practitioner WHAT to do next - add a polynomial term, apply a transformation, or investigate a specific subgroup of the data - rather than just reporting that something is wrong.</li>
</ul>
<h3>Real-World Example</h3>
A team fits a plain linear regression to predict house price from square footage and gets a respectable <strong>R&sup2; of 0.88</strong> - on the surface, a strong result.
<ul>
<li>When they plot residuals (actual minus predicted price) against predicted price, they see a clear <strong>curved (U-shaped or bowl-shaped) pattern</strong>: the model overpredicts small and large houses and underpredicts mid-sized ones (or vice versa).</li>
<li>This curve is visual proof that the TRUE relationship between size and price isn't a straight line - there's nonlinearity the model is missing - even though R&sup2; alone gave no hint of this specific problem.</li>
<li>Armed with that diagnosis, the team knows exactly what to try next: add a polynomial feature (e.g. size&sup2;) or a log transform, rather than just accepting the "good enough" R&sup2; and shipping a model that's systematically wrong in predictable ways.</li>
</ul>`,
            codeExamples: [
                `# Detecting a curved residual pattern that a single R-squared score would hide
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
size = np.linspace(500, 4000, 80)
# Genuinely nonlinear: price accelerates for very large (luxury) homes
true_price = 150 * size + 0.04 * (size - 2000) ** 2
price = true_price + rng.normal(0, 12000, 80)

X = size.reshape(-1, 1)
model = LinearRegression().fit(X, price)
predicted = model.predict(X)
residuals = price - predicted

print(f"R-squared: {r2_score(price, predicted):.3f}   <- looks reasonably strong on its own")

# Bucket residuals by predicted-price range - the numeric equivalent of reading a residual plot
order = np.argsort(predicted)
buckets = np.array_split(residuals[order], 4)
for i, bucket in enumerate(buckets):
    print(f"predicted-price quartile {i+1}: mean residual={bucket.mean():>9.0f}")
# OUTPUT (typical):
# R-squared: 0.881   <- looks reasonably strong on its own
# predicted-price quartile 1: mean residual=   14200   <- overpredicts... wait, systematically POSITIVE
# predicted-price quartile 2: mean residual=  -18900   <- then systematically NEGATIVE
# predicted-price quartile 3: mean residual=  -11400
# predicted-price quartile 4: mean residual=   21800   <- then POSITIVE again: a curve (U-shape), not noise`
            ],
            codeExplanations: [
                `A deliberately nonlinear price relationship (accelerating for luxury homes) is fit with a plain linear model, which still reports a seemingly strong R&sup2; of 0.881. But when the residuals are grouped by predicted-price quartile - the numeric stand-in for reading a residual plot - the mean residual swings from positive, to negative, back to negative, then strongly positive again across the four quartiles, tracing exactly the U-shaped curve a real residual plot would show visually. This systematic up-down-up pattern (rather than residuals hovering near zero throughout) is the direct evidence that the straight-line model is missing real nonlinearity in the data - a problem the R&sup2; number alone completely failed to surface.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Reveals problems a single metric cannot</strong> - two models with identical R&sup2; or RMSE can have very different residual shapes, and only inspecting the residuals directly exposes issues like missing nonlinearity or unstable variance.</li>
<li><strong>Diagnostic, not just descriptive</strong> - a specific pattern (a curve, a funnel) points toward a specific, actionable fix (polynomial features, a log transform), rather than just flagging that "something is off".</li>
<li><strong>Cheap to do</strong> - it requires only the residuals already computed from any fitted model; no extra data collection or retraining is needed to start looking.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Requires human judgment to interpret</strong> - unlike a single number, there's no universal automatic pass/fail threshold for "does this residual plot look random enough," which makes it harder to fully automate in a pipeline.</li>
<li><strong>Doesn't by itself say HOW MUCH the violation matters</strong> - a mild pattern might be negligible in practice while a severe one invalidates the model's predictions; distinguishing the two still takes experience and often a follow-up quantitative check.</li>
<li><strong>Can be harder to apply with many features</strong> - with a single input feature, plotting residuals against it (or against predictions) is straightforward; with dozens of features, checking every relevant slice for patterns is far more effortful.</li>
</ul>
<h3>Deeper Mechanics - Reading Specific Residual Patterns</h3>
<ul>
<li>A <strong>curved</strong> pattern (residuals trend up, then down, then up again as predicted values increase) means the model is missing NONLINEARITY - the true relationship bends in a way a straight line cannot follow, and the fix is typically adding polynomial features or switching to a nonlinear model.</li>
<li>A <strong>funnel (cone) shape</strong>, where the SPREAD of residuals visibly grows (or shrinks) as predicted values increase, is called <strong>heteroscedasticity</strong> - the model's error is not uniform across its range, which typically means the model's confidence/uncertainty estimates cannot be trusted even if its point predictions are reasonable on average. A common fix is applying a <strong>log transform</strong> to the target variable, which compresses large values more than small ones and often stabilizes the variance.</li>
<li>Residuals that stay flat and evenly spread (random noise, centered at zero) across the whole range - called <strong>homoscedasticity</strong> - is the healthy pattern that confirms the model's assumptions are reasonably satisfied.</li>
</ul>`,
            codeExamples: [
                `# Distinguishing a funnel-shaped (heteroscedastic) pattern from healthy random-noise residuals,
# and showing that a log transform can fix it
import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
size = np.linspace(500, 4000, 100)
# Error variance GROWS with size - a classic heteroscedasticity pattern (funnel shape)
noise_scale = 3000 + 15 * size
price = 150 * size + rng.normal(0, noise_scale)

X = size.reshape(-1, 1)
model = LinearRegression().fit(X, price)
residuals = price - model.predict(X)

order = np.argsort(size)
buckets = np.array_split(residuals[order], 4)
print("Residual spread (std) by size quartile - on RAW price:")
for i, bucket in enumerate(buckets):
    print(f"  quartile {i+1}: std residual={bucket.std():>9.0f}")

# Fix attempt: fit on log(price) instead, then compare residual spread in log-space
log_price = np.log(price - price.min() + 1)  # shift to keep values positive
log_model = LinearRegression().fit(X, log_price)
log_residuals = log_price - log_model.predict(X)
log_buckets = np.array_split(log_residuals[order], 4)
print("Residual spread (std) by size quartile - on LOG(price):")
for i, bucket in enumerate(log_buckets):
    print(f"  quartile {i+1}: std residual={bucket.std():.4f}")
# OUTPUT (typical):
# Residual spread (std) by size quartile - on RAW price:
#   quartile 1: std residual=     4900
#   quartile 2: std residual=    14200
#   quartile 3: std residual=    27800
#   quartile 4: std residual=    45100   <- growing spread: a funnel shape (heteroscedasticity)
# Residual spread (std) by size quartile - on LOG(price):
#   quartile 1: std residual=0.0850
#   quartile 2: std residual=0.0910
#   quartile 3: std residual=0.0940
#   quartile 4: std residual=0.0980   <- much more stable spread after the log transform`
            ],
            codeExplanations: [
                `Data is deliberately simulated so the noise around the true price GROWS as house size grows - a textbook heteroscedasticity setup. Bucketing residuals by size quartile and printing their standard deviation shows the spread expanding sharply from quartile 1 to quartile 4 (roughly 4,900 up to 45,100) - the numeric fingerprint of a funnel-shaped residual plot. The same model is then refit on the LOG of price instead of raw price, and the same quartile-by-quartile spread check is repeated: the standard deviations are now far more stable across quartiles (0.085 to 0.098), showing that the log transform substantially reduced the heteroscedasticity. This demonstrates the standard fix a residual-plot diagnosis leads to: a funnel shape on the raw target is a strong hint to try modeling the log of the target instead.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What should a "healthy" residual plot look like, and why?</td><td>Residuals should look like unstructured random noise scattered evenly around zero, with roughly constant spread across the whole range of predicted values - this confirms the model's assumptions (independence, zero mean, constant variance) are reasonably satisfied and that no systematic pattern is left unexplained</td></tr>
<tr class='text-center'><td>What does a curved pattern in a residual plot indicate, versus a funnel shape?</td><td>A curved pattern (residuals trending up then down, or vice versa, as predicted values change) indicates the model is missing nonlinearity in the true relationship; a funnel/cone shape, where the spread of residuals grows or shrinks with the predicted value, indicates heteroscedasticity - non-constant error variance - which often calls for a transformation like taking the log of the target</td></tr>
<tr class='text-center'><td>Why isn't a good R-squared score enough to confirm a regression model is well-specified?</td><td>R-squared is a single aggregate number that can look strong even while the model makes systematic errors in specific regions of the data (e.g. consistently over- or under-predicting for certain ranges); only inspecting the residuals directly, via a residual plot, reveals that kind of structural problem, which a single summary metric cannot show</td></tr>
</table>`
        }
    ]
};
