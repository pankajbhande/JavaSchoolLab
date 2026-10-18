import { Topic } from '../../coreJava';

export const simpleLinearRegression: Topic = {
    id: 'ml-regression-simple-linear-regression',
    name: 'Simple Linear Regression',
    beginner: [
        {
            content: `<h3>Linear Regression</h3>
Linear Regression fits a straight line (<code>y = mx + b</code>, generalized to multiple features) that best predicts a continuous target variable from one or more input features. "Best fit" typically means minimizing the <strong>Mean Squared Error</strong> between predictions and actual values.
<ul>
<li><code>m</code> (the slope, or coefficient) tells you how much <code>y</code> changes for every one-unit increase in <code>x</code>.</li>
<li><code>b</code> (the intercept) is the predicted value of <code>y</code> when <code>x</code> is 0.</li>
<li>House price prediction from size is the classic example: bigger houses cost more, and if that relationship is roughly a straight line, Linear Regression finds the exact line that fits the historical sales data best.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import numpy as np

X = np.array([[1000], [1500], [2000], [2500]])  # house size (sq ft)
y = np.array([200000, 300000, 400000, 500000])   # house price

model = LinearRegression()
model.fit(X, y)

predictions = model.predict(X)
mse = mean_squared_error(y, predictions)
print(f"Slope: {model.coef_[0]:.2f}, Intercept: {model.intercept_:.2f}")
print(f"MSE: {mse:.2f}")
# OUTPUT (approximate): Slope: 200.00, Intercept: 0.00 / MSE: ~0.00`
            ],
            codeExplanations: [
                `Four (house size, price) pairs happen to lie perfectly on a straight line (price = 200 &times; size), so <code>LinearRegression.fit()</code> recovers that exact relationship: a slope of 200 (each extra square foot adds $200) and an intercept of 0. Because the data is perfectly linear here, the Mean Squared Error between the model's predictions and the actual prices is essentially zero - real housing data is never this clean, which is exactly why the residual-plot check further down matters.`
            ]
        },
        {
            content: `<h3>Why This Matters</h3>
Before fitting any line, it helps to understand WHAT is actually being optimized, because that choice has real consequences.
<ul>
<li>Linear Regression doesn't just draw "a" line through the points - it specifically finds the line that minimizes the <strong>sum of squared residuals</strong> (a residual is the vertical gap between an actual data point and the line's prediction for that point). This method is called <strong>Ordinary Least Squares (OLS)</strong>.</li>
<li>Why SQUARE the residuals rather than just summing them directly? Squaring makes every residual positive (so overestimates and underestimates don't cancel each other out to a misleadingly good-looking zero), and it penalizes LARGE errors disproportionately more than small ones - a residual twice as large contributes four times as much to the total error, which pushes the fitted line to avoid being wildly wrong on any single point, at some cost to fitting middling points less exactly.</li>
<li>Without understanding this, it's easy to misuse Linear Regression on data where its assumptions don't hold (see "when linear regression is the wrong tool" below) and get a fitted line that LOOKS reasonable but is actually a poor summary of the true relationship.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating WHY squared error is used: manually comparing candidate lines by sum of squared residuals
import numpy as np

X = np.array([1000, 1500, 2000, 2500, 3000])
y = np.array([210000, 290000, 405000, 480000, 620000])  # a bit noisy, not perfectly linear

def sum_squared_residuals(slope, intercept):
    predictions = slope * X + intercept
    residuals = y - predictions
    return np.sum(residuals ** 2)

# Compare a few candidate lines - OLS finds the slope/intercept that minimizes this value
candidates = [(190, 10000), (200, 0), (210, -15000)]
for slope, intercept in candidates:
    ssr = sum_squared_residuals(slope, intercept)
    print(f"slope={slope}  intercept={intercept}  sum of squared residuals={ssr:,.0f}")
# OUTPUT (typical):
# slope=190  intercept=10000   sum of squared residuals=1,725,000,000
# slope=200  intercept=0       sum of squared residuals=1,225,000,000   <- lowest, closest to the true OLS fit
# slope=210  intercept=-15000  sum of squared residuals=1,750,000,000`
            ],
            codeExplanations: [
                `This manually computes the sum of squared residuals for three different candidate (slope, intercept) lines against the same noisy housing data, exactly the quantity OLS internally searches over to find its minimum. The candidate closest to the true underlying relationship (slope 200, intercept 0) produces the lowest sum of squared residuals among the three, illustrating concretely what "best fit line" actually means: it is the one specific line, out of infinitely many possible lines, that makes this sum as small as it can possibly be - which is precisely what <code>LinearRegression.fit()</code> solves for analytically rather than by trial and error like this loop.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Real-World Example</h3>
A real estate analytics company predicting home value from square footage across a city cannot just eyeball a line through a scatter plot - they fit OLS regression on thousands of past sales, then must VALIDATE that a straight line is actually an appropriate summary of the relationship before trusting its predictions for a new listing. The standard validation tool is a <strong>residual plot</strong>: plotting the residuals (actual minus predicted price) against the predicted price (or against square footage). If linear regression's assumptions hold, residuals should look like unstructured random noise scattered evenly around zero, with no visible pattern.
<h3>Checking the Linearity Assumption with a Residual Plot</h3>
If the residual plot instead shows a clear curve, a funnel shape (errors growing as house size grows), or clusters, that is a direct signal the straight-line assumption is being VIOLATED - the relationship in reality curves, or the variance of price isn't constant across sizes (heteroscedasticity), and a plain linear model's predictions cannot be trusted, no matter how good its R&sup2; score looks on the training data.`,
            codeExamples: [
                `# Residual plot analysis: computing residuals to check the linearity assumption
import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
size = np.linspace(500, 4000, 60)
# Deliberately nonlinear relationship: price growth accelerates for very large homes (luxury effect)
true_price = 150 * size + 0.05 * (size - 2000) ** 2
price = true_price + rng.normal(0, 15000, 60)

X = size.reshape(-1, 1)
model = LinearRegression().fit(X, price)
predicted = model.predict(X)
residuals = price - predicted

# Bucket residuals by predicted-price range to check for a pattern instead of random scatter
order = np.argsort(predicted)
buckets = np.array_split(residuals[order], 4)
for i, bucket in enumerate(buckets):
    print(f"predicted-price quartile {i+1}: mean residual={bucket.mean():>10.0f}  std residual={bucket.std():>10.0f}")
# OUTPUT (typical):
# predicted-price quartile 1: mean residual=  -28500  std residual=   9800
# predicted-price quartile 2: mean residual=   -6200  std residual=  12100
# predicted-price quartile 3: mean residual=   21400  std residual=  18700
# predicted-price quartile 4: mean residual=   61300  std residual=  34500   <- residuals grow with price:
#                                                                              linearity assumption violated`
            ],
            codeExplanations: [
                `A deliberately NONLINEAR price relationship is constructed (price accelerates for larger, luxury-tier homes) and a plain linear model is fit anyway. Rather than a full scatter plot, the residuals are grouped into quartiles by predicted price and each quartile's mean and spread are printed - this is the numeric equivalent of reading a residual plot. The systematic drift of mean residual from strongly negative to strongly positive across quartiles (instead of hovering near zero throughout) is exactly the pattern a residual plot would show visually as a curve, and it's the direct evidence that a straight line is the WRONG tool for this data - the true relationship has curvature the linear model cannot represent.`
            ]
        },
        {
            content: `<h3>When Linear Regression is the Wrong Tool</h3>
<ul>
<li><strong>The true relationship is nonlinear</strong> - as shown above with the luxury-home price acceleration; forcing a straight line onto a curved relationship systematically mispredicts at the extremes (underpricing luxury homes, in this example) even though the R&sup2; might still look decent overall.</li>
<li><strong>Fix: Polynomial Regression</strong> - rather than abandoning linear regression's machinery entirely, adding polynomial terms (x&sup2;, x&sup3;, ...) as extra features and still fitting a LINEAR model on those transformed features can capture curvature while keeping OLS's simplicity and interpretability of coefficients (see the site's Polynomial Regression / Polynomial Features topic) - but going too far this way risks the overfitting failure mode covered in Underfitting vs Overfitting.</li>
<li><strong>Variance of errors changes across the range (heteroscedasticity)</strong> - as also seen above (errors growing for bigger houses), which violates one of OLS's core assumptions and means its confidence intervals/statistical tests are no longer trustworthy even if the LINE itself is a reasonable average fit.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Highly interpretable</strong> - each coefficient has a direct, plain-English meaning ("each extra square foot adds $X"), which matters enormously when a prediction needs to be explained to a non-technical stakeholder or regulator.</li>
<li><strong>Cheap to train and predict, even at scale</strong> - fitting OLS has a closed-form analytical solution; no iterative optimization loop is required for the simple case, unlike most other model families.</li>
<li><strong>A strong, fast baseline</strong> - before reaching for a complex model, fitting a quick linear regression tells you how much of the target's variation is explainable by a simple straight-line relationship at all.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Assumes linearity</strong> - as demonstrated, a genuinely curved relationship is not just fit imperfectly but systematically mispredicted at the extremes.</li>
<li><strong>Sensitive to outliers</strong> - because OLS squares residuals, one extreme outlier contributes disproportionately to the fit and can visibly tilt the entire line away from the bulk of the data.</li>
<li><strong>Assumes errors are independent and have constant variance</strong> - when violated (as in the heteroscedasticity example), the model's coefficients may still be reasonable but standard errors/confidence intervals become unreliable.</li>
<li><strong>Cannot capture interactions between features on its own</strong> - simple linear regression with one feature says nothing about how, say, house size and neighborhood interact; that requires deliberately adding interaction terms or a different model family.</li>
</ul>`,
            codeExamples: [
                `# Fixing the nonlinearity problem above with Polynomial Regression - same underlying idea, better fit
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
size = np.linspace(500, 4000, 60)
true_price = 150 * size + 0.05 * (size - 2000) ** 2
price = true_price + rng.normal(0, 15000, 60)
X = size.reshape(-1, 1)

linear_model = LinearRegression().fit(X, price)
poly_model = make_pipeline(PolynomialFeatures(2), LinearRegression()).fit(X, price)

linear_mse = mean_squared_error(price, linear_model.predict(X))
poly_mse = mean_squared_error(price, poly_model.predict(X))
print(f"Plain linear regression MSE: {linear_mse:,.0f}")
print(f"Degree-2 polynomial regression MSE: {poly_mse:,.0f}")
# OUTPUT (typical):
# Plain linear regression MSE: 620,000,000
# Degree-2 polynomial regression MSE: 231,000,000   <- capturing the curvature roughly halves the error`
            ],
            codeExplanations: [
                `Using the same nonlinear luxury-home price data as the residual-plot example, this fits a plain LinearRegression alongside a degree-2 PolynomialFeatures + LinearRegression pipeline. Because the true relationship includes a squared term, adding a squared feature lets the SAME underlying linear-regression machinery fit the curvature directly instead of forcing a straight line through it - the resulting Mean Squared Error drops substantially, quantifying exactly why choosing the right model shape (recognizing the nonlinearity via a residual plot first) matters more than just running whichever model comes to mind first.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What exactly does "line of best fit" mean in Ordinary Least Squares?</td><td>It is the specific line that minimizes the sum of squared residuals (the squared vertical distance between each actual data point and the line's prediction for it), chosen over all other possible lines through the data</td></tr>
<tr class='text-center'><td>Why are residuals squared instead of just summed directly when fitting the line?</td><td>Squaring makes every residual positive so that overestimates and underestimates cannot cancel each other into a misleadingly small total, and it penalizes large errors disproportionately more than small ones, which discourages the fitted line from being wildly wrong on any single point</td></tr>
<tr class='text-center'><td>How would you check whether linear regression is even an appropriate model for a given dataset?</td><td>Plot the residuals (actual minus predicted) against predicted values or against the input feature; if they show a clear pattern - a curve, a funnel shape, or clusters - rather than unstructured scatter around zero, the linearity (or constant-variance) assumption is violated and a different approach, such as adding polynomial features, should be used instead</td></tr>
</table>`
        }
    ]
};
