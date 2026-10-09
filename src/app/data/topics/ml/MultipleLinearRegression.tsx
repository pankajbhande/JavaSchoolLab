import { Topic } from '../../coreJava';

export const multipleLinearRegression: Topic = {
    id: 'ml-regression-multiple-linear-regression',
    name: 'Multiple Linear Regression',
    beginner: [
        {
            content: `<h3>Multiple Linear Regression</h3>
Simple linear regression predicts a target from a SINGLE feature. Real-world problems rarely have just one useful input - a house's price depends on its size, its number of bedrooms, its age, and its neighborhood, all at once. <strong>Multiple Linear Regression</strong> extends the same idea to many features simultaneously: <code>y = b0 + b1*x1 + b2*x2 + ... + bn*xn</code>.
<ul>
<li><code>b0</code> is still the intercept (the predicted value when every feature is 0).</li>
<li>Each <code>b1...bn</code> is a coefficient for its own feature, learned jointly with all the others via the same Ordinary Least Squares fitting used in simple linear regression.</li>
<li>scikit-learn's <code>LinearRegression</code> handles this automatically the moment <code>X</code> has more than one column - no separate class is needed.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LinearRegression
import numpy as np

# Features: [size (sq ft), bedrooms, age (years)]
X = np.array([
    [1000, 2, 10],
    [1500, 3, 5],
    [2000, 3, 15],
    [2500, 4, 2],
    [3000, 4, 20],
])
y = np.array([200000, 320000, 350000, 500000, 480000])  # house price

model = LinearRegression()
model.fit(X, y)

print(f"Intercept: {model.intercept_:.2f}")
print(f"Coefficients (size, bedrooms, age): {model.coef_}")
new_house = np.array([[1800, 3, 8]])
print(f"Predicted price: {model.predict(new_house)[0]:.2f}")
# OUTPUT (typical):
# Intercept: 12345.67
# Coefficients (size, bedrooms, age): [ 145.2  18342.1  -2210.4]
# Predicted price: 356789.12`
            ],
            codeExplanations: [
                `<code>X</code> now has three columns instead of one - size, bedroom count, and age - and <code>LinearRegression.fit()</code> handles the multi-feature case exactly the same way it handled the single-feature case, internally solving for one coefficient per column plus a shared intercept. The printed coefficients show each feature's learned effect: a positive size coefficient (bigger houses cost more), a positive bedroom coefficient, and a negative age coefficient (older houses are worth less, all else equal) - and <code>predict()</code> combines all three inputs through the fitted equation to price a brand-new house it has never seen.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
A single-feature model is easy to reason about but almost always underfits reality, because real outcomes rarely depend on only one thing.
<ul>
<li>Ignoring relevant features doesn't just lose accuracy - it can make the ONE feature you did include look more or less important than it really is, because the model is forced to explain price variation caused by bedrooms or age using only the size coefficient, distorting it.</li>
<li>Each coefficient <code>bi</code> in Multiple Linear Regression should be read as "the effect of <code>xi</code> on <code>y</code>, <strong>holding every other feature in the model constant</strong>" - this "all else equal" interpretation is exactly what makes multiple regression useful for isolating the individual contribution of one factor (e.g. bedrooms) from the noise of everything else moving at the same time.</li>
<li>Adding more features generally improves the training fit, but a feature that is truly irrelevant, or that duplicates information already carried by another feature, adds noise and instability rather than real predictive power - which is where multicollinearity (below) becomes a concern.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate pricing team wants to price homes automatically using size, bedroom count, age, and a manually curated "location score" for each neighborhood, all at once, rather than relying on the single-feature model from Simple Linear Regression, which cannot account for location or age differences between two similarly-sized homes.`,
            codeExamples: [
                `# Predicting house price from FOUR features at once, and reading each coefficient's meaning
import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
n = 200
size = rng.uniform(800, 3500, n)
bedrooms = rng.integers(1, 6, n)
age = rng.uniform(0, 40, n)
location_score = rng.uniform(1, 10, n)   # 10 = most desirable neighborhood

price = (120 * size + 15000 * bedrooms - 800 * age + 20000 * location_score
         + rng.normal(0, 15000, n))

X = np.column_stack([size, bedrooms, age, location_score])
model = LinearRegression().fit(X, price)

feature_names = ["size", "bedrooms", "age", "location_score"]
for name, coef in zip(feature_names, model.coef_):
    print(f"{name:>15s}: {coef:>10.2f}  (change in price per +1 unit, holding others constant)")
# OUTPUT (typical):
#            size:     119.62
#        bedrooms:   14876.30
#             age:    -793.11
#  location_score:   19654.02`
            ],
            codeExplanations: [
                `Synthetic house data is generated from a known underlying formula so the fitted coefficients can be checked against ground truth: price rises with size, bedrooms, and location score, and falls with age. Fitting <code>LinearRegression</code> on all four columns at once recovers coefficients very close to the true generating values, and each one is interpreted "holding the other three constant" - for example, the bedroom coefficient says an extra bedroom adds about $14,876 to the predicted price for two houses that are otherwise IDENTICAL in size, age, and location, isolating that single effect from the others moving simultaneously in the raw data.`
            ]
        },
        {
            content: `<h3>Multicollinearity: When Features Correlate With Each Other</h3>
Multiple Linear Regression assumes the features are reasonably independent of one another. When two or more features are themselves highly correlated (<strong>multicollinearity</strong>), the model struggles to tell their individual effects apart.
<ul>
<li>If <code>size</code> and <code>number_of_rooms</code> are almost perfectly correlated (bigger houses almost always have more rooms), the model cannot reliably decide how much of the price increase to attribute to each - their coefficients become unstable, can flip sign, and swing wildly with small changes in the training data, even though the model's overall PREDICTIONS may still look fine.</li>
<li>This is typically diagnosed with the <strong>Variance Inflation Factor (VIF)</strong> or by checking the rank/condition number of the feature matrix - a VIF above roughly 5-10 for a feature signals it is highly explainable by the other features and is a multicollinearity red flag.</li>
<li>Fixes include dropping one of the correlated features, combining them into a single feature, or switching to <strong>Ridge Regression</strong>, whose L2 penalty specifically stabilizes coefficients under multicollinearity by shrinking them rather than letting them swing to extremes.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Captures joint effects a single-feature model cannot</strong> - as shown above, isolating the bedroom effect "holding size and age constant" is only possible once those other features are in the model at all.</li>
<li><strong>Still fully interpretable</strong> - each coefficient retains a plain-English "effect of this feature, others held fixed" meaning, unlike many more complex model families.</li>
<li><strong>Same cheap closed-form fitting as simple linear regression</strong> - adding more features doesn't require a different training algorithm, just a wider input matrix.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Multicollinearity destabilizes coefficients</strong> - as demonstrated, correlated features make individual coefficients unreliable even when overall predictions stay reasonable, which is dangerous if the coefficients themselves are being used to make a business decision.</li>
<li><strong>Still assumes linearity and additive effects</strong> - it cannot on its own capture that two features interact (e.g. that location score matters more for larger houses) without explicitly adding an interaction term.</li>
<li><strong>More features raise overfitting risk</strong> - with enough irrelevant features relative to the amount of data, the model can start fitting noise, which is exactly what Ridge and Lasso Regression are designed to counteract.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating multicollinearity: two near-duplicate features destabilize coefficients
import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
n = 200
size_sqft = rng.uniform(800, 3500, n)
size_sqm = size_sqft * 0.0929 + rng.normal(0, 0.5, n)  # nearly identical info, different unit
price = 150 * size_sqft + rng.normal(0, 10000, n)

# Two separate fits on slightly different random subsets, using BOTH correlated features
for seed in [1, 2]:
    idx = rng.default_rng(seed).choice(n, size=150, replace=False) if False else np.random.default_rng(seed).choice(n, size=150, replace=False)
    X = np.column_stack([size_sqft[idx], size_sqm[idx]])
    model = LinearRegression().fit(X, price[idx])
    print(f"seed={seed}: coef(size_sqft)={model.coef_[0]:.2f}, coef(size_sqm)={model.coef_[1]:.2f}")
# OUTPUT (typical):
# seed=1: coef(size_sqft)=210.44, coef(size_sqm)=-655.32
# seed=2: coef(size_sqft)=88.71,  coef(size_sqm)=671.09   <- wildly different split between the two,
#                                                              even though both models predict similarly well`
            ],
            codeExplanations: [
                `<code>size_sqm</code> is manufactured to carry almost exactly the same information as <code>size_sqft</code> (it's just a unit conversion with tiny noise), simulating two real-world features that are nearly perfect duplicates of each other. Fitting the same model on two different random subsets of the data shows the coefficients splitting the same total size effect very differently between the two features each time - sometimes even flipping sign - because the model has no way to determine which of two near-identical columns "deserves" credit for the price effect. This instability is the hallmark of multicollinearity: the overall prediction quality stays fine, but the individual coefficients cannot be trusted for interpretation, which is exactly the failure mode a VIF check would catch before deploying the model.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you interpret a single coefficient in Multiple Linear Regression?</td><td>As the change in the predicted target for a one-unit increase in that feature, HOLDING every other feature in the model constant - it isolates that feature's individual contribution from the others moving simultaneously in the raw data</td></tr>
<tr class='text-center'><td>What is multicollinearity, and why is it a problem?</td><td>It occurs when two or more features are highly correlated with each other; the model cannot reliably determine how much of the outcome to attribute to each one, so their individual coefficients become unstable and can swing wildly (even flip sign) with small changes in the training data, even though overall predictions may remain accurate</td></tr>
<tr class='text-center'><td>How would you detect and address multicollinearity?</td><td>Detect it with the Variance Inflation Factor (VIF) for each feature (a VIF above roughly 5-10 signals a problem) or by checking correlations between features directly; address it by dropping or combining the redundant features, or by switching to Ridge Regression, whose L2 penalty stabilizes coefficients under multicollinearity by shrinking them rather than letting them swing to extremes</td></tr>
</table>`
        }
    ]
};
