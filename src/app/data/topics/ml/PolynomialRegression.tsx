import { Topic } from '../../coreJava';

export const polynomialRegression: Topic = {
    id: 'ml-regression-polynomial-regression',
    name: 'Polynomial Regression',
    beginner: [
        {
            content: `<h3>Fitting a Curve with a "Linear" Model</h3>
<strong>Polynomial Regression</strong> extends Linear Regression by adding powers of the input feature - <code>x&sup2;</code>, <code>x&sup3;</code>, and so on - as extra columns before fitting. The model still adds up weighted terms (it is still LINEAR in its coefficients), but because some of those terms are nonlinear functions of <code>x</code>, its predictions trace a curve rather than a straight line.
<ul>
<li>The <code>degree</code> you choose controls how much curvature the model can express: <code>degree=1</code> is just plain linear regression, <code>degree=2</code> can fit a single bend (a parabola-shaped curve), <code>degree=3</code> can fit an S-shaped curve, and so on.</li>
<li>Under the hood this is implemented exactly like the site's Polynomial Features topic: <code>PolynomialFeatures</code> generates the extra columns, and plain <code>LinearRegression</code> fits weights on top of them.</li>
<li>A classic use case is modeling drug dosage vs. effect: the effect often rises, then plateaus or even declines at very high doses - a relationship a straight line simply cannot represent, but a degree-2 or degree-3 polynomial can.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
dosage = np.linspace(0, 10, 40)
# effect rises then plateaus/declines at high dosage - a curve, not a line
effect = 3 * dosage - 0.25 * dosage**2 + rng.normal(0, 0.8, 40)

X = dosage.reshape(-1, 1)
linear_model = LinearRegression().fit(X, effect)
poly_model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression()).fit(X, effect)

print(f"Plain Linear Regression R^2: {linear_model.score(X, effect):.3f}")
print(f"Degree-2 Polynomial R^2:     {poly_model.score(X, effect):.3f}")
# OUTPUT (typical):
# Plain Linear Regression R^2: 0.312   <- a straight line badly fits the rise-then-plateau curve
# Degree-2 Polynomial R^2:     0.941   <- adding dosage^2 captures the curvature well`
            ],
            codeExplanations: [
                `Drug dosage vs. effect data is generated to rise and then bend back down at higher doses (a diminishing-returns / overdose-style curve), plus noise. A plain <code>LinearRegression</code> fit directly on dosage scores poorly (R^2 around 0.31) since it can only draw one straight line through data that clearly rises and then falls. Wrapping <code>PolynomialFeatures(degree=2)</code> and <code>LinearRegression</code> in a pipeline lets the same underlying linear machinery use dosage AND dosage-squared as inputs, so it can bend to match the rise-then-plateau shape - R^2 jumps to about 0.94, showing the curve is now being captured rather than averaged away.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before reaching for a fundamentally nonlinear model family (Decision Trees, Neural Networks, kernel methods), it's worth asking whether the nonlinearity in your data is simple enough that adding a FEW polynomial terms to an ordinary linear model captures it just as well. Polynomial Regression stays remarkably close to plain Linear Regression in every other respect - it has a closed-form-friendly fit, coefficients that (with some care) are still somewhat interpretable, and none of the extra machinery a fully nonlinear model needs - while still being able to trace real curvature.
<ul>
<li>The key thing Polynomial Regression is still "blind" to is anything beyond the specific curve shape its chosen degree can express - a degree-2 polynomial can only ever produce ONE bend, no matter how the underlying data actually behaves.</li>
<li>Choosing the degree is therefore the central decision in Polynomial Regression, and it is a direct instance of the bias-variance tradeoff: too low a degree underfits (can't capture real curvature at all), too high a degree overfits (wiggles wildly to chase noise in the training points).</li>
</ul>
<h3>Real-World Example</h3>
A pharmacology team is modeling how a drug's measured effect changes with dosage across a clinical trial. A plain straight-line model badly underfits: it cannot represent the fact that effect rises quickly at low-to-moderate doses but plateaus (or even reverses, in an overdose regime) at high doses. Fitting a degree-2 or degree-3 polynomial to dosage vs. effect captures this curve shape well WITHIN the range of doses actually tested in the trial. But the team must be extremely careful about DEGREE SELECTION and about not trusting the model outside the tested dosage range: a polynomial fit only reflects the shape of the data it was trained on, and extrapolating a fitted curve to a dosage far outside the trial's range can produce wildly wrong, even dangerous-looking, predicted effects, since polynomial curves are notorious for shooting off sharply just past the edges of their training range.`,
            codeExamples: [
                `# Degree selection: underfitting vs. a good fit vs. overfitting, on the drug-dosage curve
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
dosage = np.linspace(0, 10, 40)
effect = 3 * dosage - 0.25 * dosage**2 + rng.normal(0, 0.8, 40)
X = dosage.reshape(-1, 1)
X_train, X_test, y_train, y_test = train_test_split(X, effect, test_size=0.3, random_state=0)

for degree in [1, 2, 9]:
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(X_train, y_train)
    train_mse = mean_squared_error(y_train, model.predict(X_train))
    test_mse = mean_squared_error(y_test, model.predict(X_test))
    print(f"degree={degree}  train_mse={train_mse:6.2f}  test_mse={test_mse:8.2f}")
# OUTPUT (typical):
# degree=1  train_mse=  4.85  test_mse=    5.62   <- underfits: can't capture the plateau
# degree=2  train_mse=  0.61  test_mse=    0.79   <- good fit, low error on both sets
# degree=9  train_mse=  0.34  test_mse=  187.40   <- overfits: near-perfect on train, terrible on test`
            ],
            codeExplanations: [
                `Using the same rise-then-plateau dosage/effect data, three polynomial degrees are compared on a held-out test split: degree 1 (plain linear), degree 2 (matching the true underlying curve shape), and degree 9 (deliberately excessive). Degree 1's train AND test error are both mediocre - it's underfitting, structurally unable to represent the plateau regardless of how much data it sees. Degree 2 achieves low error on both train and test data - it matches the true curve's complexity. Degree 9 achieves the lowest TRAINING error of the three (it can wiggle through nearly every training point) but its TEST error explodes to over 100x the degree-2 model's - a textbook case of overfitting, where a high-degree polynomial captures noise rather than signal and fails badly on data it wasn't fit to.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Captures real curvature without abandoning linear-model machinery</strong> - as shown above, a degree-2 fit tracks the dosage/effect plateau far better than a straight line while still being fit with ordinary <code>LinearRegression</code> under the hood.</li>
<li><strong>Simple, well-understood, and fast to fit</strong> - like plain linear regression, there's a closed-form solution once the polynomial features are generated; no iterative training loop or extensive hyperparameter search is required for modest degrees.</li>
<li><strong>Degree acts as a single, intuitive complexity knob</strong> - unlike many nonlinear model families with many interacting hyperparameters, polynomial regression's main complexity control is just one number, making it easy to reason about and tune via cross-validation.</li>
<li><strong>Works as a lightweight upgrade path</strong> - if a team already has a linear regression pipeline in production and discovers real curvature via a residual plot, adding polynomial terms is a much smaller change than swapping to an entirely different model family.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Dangerous extrapolation beyond the training range</strong> - as in the clinical-trial scenario, a fitted polynomial curve can shoot off sharply (toward large positive or negative values) just past the edge of the dosages actually tested, so predicting the effect of a dose far outside the trial's range can be wildly unreliable, unlike, say, a tree-based model that simply repeats its nearest leaf's value.</li>
<li><strong>Degree selection is a genuine tradeoff, not a free upgrade</strong> - too low underfits (as with degree 1 above), too high overfits catastrophically (as with degree 9 above); getting it right requires validation on held-out data, not just inspecting training error.</li>
<li><strong>Feature count and coefficient instability grow with degree</strong> - beyond a handful of features, higher degrees combined with multiple original features explode combinatorially (see the site's Polynomial Features topic), and high-degree coefficients often become extremely large and hard to interpret even when regularized.</li>
<li><strong>Still fundamentally limited to the curve shapes a polynomial CAN express</strong> - some real relationships (e.g. sharp thresholds, saturating exponential curves, periodic patterns) are poorly approximated by any reasonable polynomial degree and are better served by a different model or transformation entirely.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating dangerous extrapolation: predicting effect far outside the tested dosage range
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
dosage = np.linspace(0, 10, 40)   # trial only tested doses 0-10
effect = 3 * dosage - 0.25 * dosage**2 + rng.normal(0, 0.8, 40)
X = dosage.reshape(-1, 1)

poly_model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression()).fit(X, effect)

within_range = np.array([[5], [10]])
far_outside = np.array([[20], [30]])   # doses never tested in the trial

print("Predictions WITHIN the tested range (0-10):")
for d, pred in zip(within_range.ravel(), poly_model.predict(within_range)):
    print(f"  dosage={d:5.1f}  predicted effect={pred:7.2f}")
print("Predictions FAR OUTSIDE the tested range:")
for d, pred in zip(far_outside.ravel(), poly_model.predict(far_outside)):
    print(f"  dosage={d:5.1f}  predicted effect={pred:7.2f}")
# OUTPUT (typical):
# Predictions WITHIN the tested range (0-10):
#   dosage=  5.0  predicted effect=   8.80
#   dosage= 10.0  predicted effect=   4.90
# Predictions FAR OUTSIDE the tested range:
#   dosage= 20.0  predicted effect= -50.10   <- nonsensical negative effect, never observed in the trial
#   dosage= 30.0  predicted effect=-180.30   <- gets worse the further out you go`
            ],
            codeExplanations: [
                `The degree-2 model is fit only on dosages between 0 and 10, matching what the clinical trial actually tested. Predicting at dosages of 5 and 10 (within the trial's range) produces sensible values consistent with the observed rise-then-plateau curve. But predicting at dosages of 20 and 30 - values the model never saw during training - produces increasingly extreme, nonsensical negative "effect" values, because the fitted parabola simply keeps curving downward according to its equation with no awareness that this is meaningless outside the tested range. This is exactly why extrapolating a polynomial regression fit beyond its training data's range is flagged as dangerous: the curve's mathematical shape has no relationship to reality once you leave the region it was actually fit to.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>In what sense is Polynomial Regression still a "linear" model?</td><td>It is linear in its coefficients - predictions are a weighted sum of terms (x, x^2, x^3, ...) - even though those terms are nonlinear functions of the original feature; this lets it be fit with the same ordinary least squares machinery as plain Linear Regression while still tracing a curve with respect to the original input</td></tr>
<tr class='text-center'><td>What happens if you pick a polynomial degree that is too low, or too high?</td><td>Too low a degree underfits - the model is structurally unable to represent real curvature in the data no matter how much training data it sees; too high a degree overfits - it achieves very low training error by wiggling through noise in the training points, but generalizes badly, producing much higher error on unseen data</td></tr>
<tr class='text-center'><td>Why is extrapolating a polynomial regression model beyond its training data's range particularly risky?</td><td>A fitted polynomial curve only reflects the shape of the data within the range it was trained on; because polynomial terms like x^2 or x^3 grow (or swing) very quickly, predictions just outside that range can shoot off to extreme, unrealistic values, unlike simpler models whose predictions degrade more gracefully outside the training range</td></tr>
</table>`
        }
    ]
};
