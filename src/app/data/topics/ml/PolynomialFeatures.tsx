import { Topic } from '../../coreJava';

export const polynomialFeatures: Topic = {
    id: 'ml-feature-engineering-polynomial-features',
    name: 'Polynomial Features',
    beginner: [
        {
            content: `<h4>Teaching a Straight Line to Fit a Curve</h4>
<ul>
<li><strong>Feature Engineering</strong> is the practice of creating NEW input features from the ones you already have, so a model can find patterns it couldn't see in the raw data. <strong>Polynomial Features</strong> is one of the most common examples: it generates new columns like <code>x&sup2;</code>, <code>x&sup3;</code>, or (with multiple features) interaction terms like <code>x&middot;y</code>.</li>
<li>A plain Linear Regression can only fit a straight line/plane - it cannot bend to match curved relationships in the data, no matter how obvious the curve is.</li>
<li>By adding <code>x&sup2;</code> as an extra column and handing BOTH <code>x</code> and <code>x&sup2;</code> to Linear Regression, the model is still "linear" in its coefficients, but its predictions can now trace a curve in terms of the original <code>x</code> - this trick is called <strong>Polynomial Regression</strong>.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = np.linspace(-3, 3, 40).reshape(-1, 1)
y = 2 * X.ravel()**2 - 3 * X.ravel() + 5 + rng.normal(0, 1, 40)   # true curve: quadratic

plain_model = LinearRegression().fit(X, y)
poly_model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression()).fit(X, y)

print(f"Plain Linear Regression R^2: {plain_model.score(X, y):.3f}")
print(f"Polynomial (degree=2) R^2:  {poly_model.score(X, y):.3f}")
# OUTPUT (typical):
# Plain Linear Regression R^2: 0.091   <- a straight line badly fits a curve
# Polynomial (degree=2) R^2:  0.968    <- adding x^2 lets the same LinearRegression trace the curve`
            ],
            codeExplanations: [
                `This generates data from a true QUADRATIC relationship (y depends on x squared, not just x), plus some noise, so a plain straight line is fundamentally the wrong shape for it. A plain LinearRegression is fit directly on X (just the raw x values) and scores very poorly (R^2 near 0.09, meaning it explains almost none of the variation) because it can only draw a straight line through clearly curved data. make_pipeline(PolynomialFeatures(degree=2), LinearRegression()) chains two steps: first PolynomialFeatures(degree=2) transforms each x into [x, x^2] (it also generates a bias/intercept term internally), then LinearRegression fits on that expanded feature set. Because the model now has access to x^2 as an input column, it can effectively fit a curve while still being a "linear" regression under the hood - and R^2 jumps to about 0.97, closely matching the true quadratic pattern.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before feature engineering techniques like this, practitioners faced a hard choice for nonlinear data: either use a fundamentally nonlinear model (Decision Tree, Neural Network, kernel SVM), which can be harder to interpret and needs more data, or accept a badly-fitting straight line from Linear Regression.</li>
<li>Polynomial Features lets you keep every benefit of a linear model - simplicity, fast training, easy-to-inspect coefficients, well-understood statistical guarantees - while still capturing curved and interaction effects that plain linear terms miss entirely.</li>
<li>Without engineered features, a linear model is BLIND to any relationship that isn't a straight line/plane - e.g. it cannot represent "risk increases faster and faster as debt grows" (a curve) or "the effect of advertising spend depends on which season it is" (an interaction between two features) unless those relationships are explicitly added as new columns.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate analytics firm is modeling <strong>house price vs. square footage</strong>. Early exploration shows price does NOT rise in a straight line with square footage - price rises steeply for the first 1,000-2,000 sq ft, but the marginal value of EXTRA space keeps growing even faster for very large homes (luxury mega-homes command a disproportionately higher price per square foot).
<ul>
<li>A plain Linear Regression on square footage alone systematically underpredicts both very small and very large homes, since it's forced to draw one straight best-fit line through a curved relationship.</li>
<li>Adding <code>sqft&sup2;</code> as an engineered feature lets the same linear-model machinery bend upward for large homes, closely tracking the true accelerating price curve.</li>
<li>If the firm also has a second feature like <code>lot_size</code>, an interaction term <code>sqft &times; lot_size</code> can capture effects like "extra house square footage is worth even more when the lot is also large" - a pattern that plain additive linear terms (sqft + lot_size, added separately) can never express, since they assume each feature's effect is independent of the other.</li>
</ul>`,
            codeExamples: [
                `# House price example: square footage vs price, with a real accelerating (convex) relationship
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

rng = np.random.default_rng(0)
sqft = rng.uniform(500, 6000, 300)
# true price curve accelerates for very large homes (convex, not a straight line)
price = 50_000 + 120 * sqft + 0.02 * sqft**2 + rng.normal(0, 25_000, 300)

X = sqft.reshape(-1, 1)
X_train, X_test, y_train, y_test = train_test_split(X, price, test_size=0.3, random_state=0)

linear_model = LinearRegression().fit(X_train, y_train)
poly_model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression()).fit(X_train, y_train)

print(f"Plain linear MAE:      \${mean_absolute_error(y_test, linear_model.predict(X_test)):,.0f}")
print(f"Polynomial (deg=2) MAE: \${mean_absolute_error(y_test, poly_model.predict(X_test)):,.0f}")

# predict a large luxury home (6000 sqft) with each model
big_home = np.array([[6000]])
print(f"Plain linear prediction for 6000 sqft:      \${linear_model.predict(big_home)[0]:,.0f}")
print(f"Polynomial prediction for 6000 sqft:         \${poly_model.predict(big_home)[0]:,.0f}")
# OUTPUT (typical):
# Plain linear MAE:      $61,200
# Polynomial (deg=2) MAE: $24,800
# Plain linear prediction for 6000 sqft:      $845,000   <- underestimates the true accelerating premium
# Polynomial prediction for 6000 sqft:         $1,062,000`
            ],
            codeExplanations: [
                `This simulates the real-estate scenario with a genuinely convex (accelerating) true price curve: price = 50,000 + 120*sqft + 0.02*sqft^2 + noise, meaning every extra square foot adds slightly more value than the last, especially at large sizes. A plain LinearRegression and a make_pipeline(PolynomialFeatures(degree=2), LinearRegression()) are both trained on the same train split and compared on held-out test data using Mean Absolute Error (MAE, in dollars) - the polynomial model's error is roughly 2.5x lower because it can actually represent the curve, while the plain linear model is structurally forced to average out the curvature into one straight line. The final two lines predict the price of a 6,000 sqft luxury home specifically: the plain linear model underestimates it (since it was fit to minimize average error across the whole range, sacrificing accuracy at the extremes) while the polynomial model tracks the true accelerating premium far more closely - concretely illustrating why the firm would prefer the engineered feature for pricing large homes.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Lets simple, interpretable linear models fit nonlinear patterns</strong> - you keep the speed and well-understood coefficients of Linear/Logistic Regression while still capturing curves, e.g. the house-price-vs-sqft example above, without switching to a harder-to-interpret model like a Neural Network.</li>
<li><strong>Captures interaction effects explicitly</strong> - a term like <code>sqft &times; lot_size</code> or <code>temperature &times; humidity</code> lets the model represent "the effect of one feature depends on the value of another", which plain additive linear terms cannot express at all.</li>
<li><strong>Works with any model that benefits from richer input features</strong>, not just Linear Regression - e.g. engineered polynomial terms can also help Logistic Regression draw a curved decision boundary for classification problems that aren't linearly separable.</li>
<li><strong>No architecture change needed</strong> - unlike switching to a nonlinear model family, adding polynomial features is a preprocessing step, so it drops into existing linear-model pipelines, tooling, and statistical diagnostics (p-values, confidence intervals) with minimal disruption.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Feature count explodes combinatorially</strong> - with <code>n</code> original features and degree <code>d</code>, the number of generated polynomial+interaction terms grows roughly as <code>C(n+d, d)</code>; e.g. just 10 original features at degree=3 produces 286 columns, and 50 features at degree=3 produces over 20,000 - quickly becoming computationally expensive and hard to manage.</li>
<li><strong>Strong overfitting risk at higher degrees</strong> - a high-degree polynomial has enough flexibility to wiggle through every training point almost perfectly while generalizing terribly to new data (the classic bias-variance tradeoff pushed toward high variance); this is why polynomial degree is rarely pushed past 2-3 without heavy regularization.</li>
<li><strong>Sensitive to extrapolation beyond the training range</strong> - polynomial curves can shoot off wildly (toward +/- infinity) just outside the range of x-values seen during training, so predictions for a 20,000 sqft mega-mansion (far outside the training data's range) could be wildly unreliable even if the fit looks great within-range.</li>
<li><strong>Loses some interpretability compared to plain linear terms</strong> - a coefficient on <code>sqft&sup2;</code> or <code>sqft &times; lot_size</code> is harder to explain in plain business language ("what does a one-unit increase in sqft-squared even mean?") than a coefficient on <code>sqft</code> alone.</li>
</ul>`,
            codeExamples: [
                `# Overfitting risk from pushing polynomial degree too high, and how it's controlled with Ridge regularization
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
X = np.linspace(-3, 3, 30).reshape(-1, 1)
y = 2 * X.ravel()**2 - 3 * X.ravel() + 5 + rng.normal(0, 2, 30)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

for degree in [2, 12]:
    plain = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(X_train, y_train)
    ridge = make_pipeline(PolynomialFeatures(degree), Ridge(alpha=5.0)).fit(X_train, y_train)
    for name, model in [("plain LinearRegression", plain), ("Ridge (regularized)", ridge)]:
        test_mse = mean_squared_error(y_test, model.predict(X_test))
        print(f"degree={degree:2d}  {name:24s}  test_mse={test_mse:.2f}")
# OUTPUT (typical):
# degree= 2  plain LinearRegression    test_mse=3.85
# degree= 2  Ridge (regularized)       test_mse=3.91
# degree=12  plain LinearRegression    test_mse=41.20   <- badly overfits, huge wiggly coefficients
# degree=12  Ridge (regularized)       test_mse=5.10     <- regularization reins the wiggle back in`
            ],
            codeExplanations: [
                `This demonstrates both the overfitting risk of high-degree polynomial features AND the standard fix (Ridge regularization). Data is generated from the same quadratic truth as the earlier example. For two polynomial degrees (a reasonable degree=2, matching the true relationship, and an excessive degree=12), the code fits both a plain LinearRegression and a Ridge regression (which adds an L2 penalty shrinking coefficients toward zero, controlled by alpha) on top of the polynomial-expanded features, then compares test-set MSE. At degree=2, both models perform similarly since there's little room to overfit. At degree=12, the plain LinearRegression's test MSE explodes (its 12-degree curve wiggles wildly to chase noise in the training points, matching the classic high-variance/overfitting pattern), while Ridge's penalty keeps the higher-order coefficients small, producing a much smoother curve and dramatically better test performance - concretely showing why polynomial features are almost always paired with Ridge or Lasso regularization once the degree climbs above 2-3.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - What PolynomialFeatures Actually Generates</h3>
<ul>
<li>For a single feature <code>x</code> and <code>degree=d</code>, PolynomialFeatures generates <code>[1, x, x&sup2;, x&sup3;, ..., x&#7488;]</code> (the leading 1 is a bias/intercept term, often dropped when <code>include_bias=False</code>, since LinearRegression already fits its own intercept).</li>
<li>For MULTIPLE features (e.g. <code>x</code> and <code>y</code>) with <code>degree=2</code>, it generates every combination up to that total degree: <code>[1, x, y, x&sup2;, x&middot;y, y&sup2;]</code> - notice <code>x&middot;y</code>, the pure INTERACTION term, appears automatically alongside the pure powers.</li>
<li>Setting <code>interaction_only=True</code> keeps ONLY the cross terms like <code>x&middot;y</code> and drops pure powers like <code>x&sup2;</code>/<code>y&sup2;</code> - useful when you specifically want "does the combination of A and B matter" without assuming either feature alone has a curved effect.</li>
<li>The number of output columns for <code>n</code> input features and degree <code>d</code> (including the bias term) is <code>C(n+d, d) = (n+d)! / (d! &middot; n!)</code> - this combinatorial growth is exactly why degree and feature count must both be kept modest in practice, and why regularization (Ridge/Lasso) or feature selection is standard practice once degree exceeds 2.</li>
</ul>`,
            codeExamples: [
                `# Inspecting exactly which columns PolynomialFeatures creates, including interaction terms
import numpy as np
from sklearn.preprocessing import PolynomialFeatures

X = np.array([[2.0, 3.0]])   # a single row with two features: x=2, y=3

for degree, interaction_only in [(2, False), (2, True), (3, False)]:
    poly = PolynomialFeatures(degree=degree, interaction_only=interaction_only, include_bias=False)
    transformed = poly.fit_transform(X)
    print(f"degree={degree}, interaction_only={interaction_only}")
    print("  feature names:", poly.get_feature_names_out(["x", "y"]))
    print("  values:       ", transformed.round(1))
# OUTPUT:
# degree=2, interaction_only=False
#   feature names: ['x' 'y' 'x^2' 'x y' 'y^2']
#   values:        [[2.  3.  4.  6.  9. ]]
# degree=2, interaction_only=True
#   feature names: ['x' 'y' 'x y']
#   values:        [[2. 3. 6.]]
# degree=3, interaction_only=False
#   feature names: ['x' 'y' 'x^2' 'x y' 'y^2' 'x^3' 'x^2 y' 'x y^2' 'y^3']
#   values:        [[2.  3.  4.  6.  9.  8. 12. 18. 27.]]`
            ],
            codeExplanations: [
                `This inspects PolynomialFeatures' output directly to make the combinatorial explosion and the interaction-vs-power distinction concrete, using one simple row with x=2, y=3 and include_bias=False (dropping the constant-1 column since it's not informative to display). With degree=2 and interaction_only=False, it produces all 5 terms up to total degree 2: the original x and y, the pure squares x^2 and y^2, and the interaction x*y - and the printed values (4.0 for x^2, 6.0 for x*y, 9.0 for y^2) confirm they're computed exactly as expected from x=2, y=3. Setting interaction_only=True at the same degree drops the pure-power terms and keeps only x*y, useful when only the combined effect of two features is of interest. Going to degree=3 with interaction_only=False shows the column count growing further (9 terms now, including x^2*y and x*y^2) - directly illustrating why, as feature count and degree both increase, the number of generated columns grows combinatorially and quickly becomes unwieldy without regularization or feature selection.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How can a "linear" model like Linear Regression fit a curved relationship?</td><td>By engineering new input columns such as x^2, x^3, or interaction terms like x*y via PolynomialFeatures before fitting; the model is still linear in its COEFFICIENTS (it just adds up weighted terms), but because some of those terms are nonlinear functions of the original x, the resulting predictions trace a curve with respect to the original feature</td></tr>
<tr class='text-center'><td>What happens to the number of features as you increase polynomial degree, and why does that matter?</td><td>The feature count grows combinatorially - C(n+d, d) terms for n original features and degree d - so even a modest number of original features can explode into hundreds or thousands of polynomial/interaction columns at degree 3+, which increases training cost, makes the model much more prone to overfitting, and generally requires regularization (Ridge/Lasso) to control</td></tr>
<tr class='text-center'><td>Why is Polynomial Features usually paired with Ridge or Lasso regularization?</td><td>High-degree polynomial terms give the model enough flexibility to fit training noise almost perfectly (very low bias but very high variance) - Ridge (L2) shrinks all coefficients toward zero to smooth out the fitted curve, while Lasso (L1) can shrink some coefficients to exactly zero, effectively performing automatic feature selection among the many generated polynomial/interaction terms; both curb overfitting that plain unregularized polynomial regression is highly prone to at higher degrees</td></tr>
</table>`
        }
    ]
};
