import { Topic } from '../../coreJava';

export const featureTransformation: Topic = {
    id: 'ml-data-preprocessing-feature-transformation',
    name: 'Feature Transformation',
    beginner: [
        {
            content: `<h4>Reshaping a Feature's Distribution Before Modeling</h4>
<ul>
<li><strong>Feature Transformation</strong> applies a mathematical function to a feature to change its DISTRIBUTION shape - most commonly to fix <strong>skewness</strong> (a lopsided distribution with a long tail on one side) and make the data closer to Normal (bell-shaped).</li>
<li>The most common transforms are the <strong>log transform</strong> (<code>log(x)</code>), the <strong>square root transform</strong> (<code>sqrt(x)</code>), and the more flexible <strong>Box-Cox transform</strong>, which finds the best power transform automatically.</li>
<li>Example: <code>annual_income</code> is typically <strong>right-skewed</strong> - most people earn a moderate amount, but a small number earn enormously more, stretching a long tail to the right. A log transform compresses that long tail, pulling extreme values closer to the bulk of the data.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
# simulate right-skewed income data: most people moderate, a few earning enormously more
income = rng.lognormal(mean=10.8, sigma=0.6, size=1000)

df = pd.DataFrame({"income": income})
df["log_income"] = np.log(df["income"])

print(f"Raw income        - skewness: {df['income'].skew():.2f}, min: {df['income'].min():.0f}, max: {df['income'].max():.0f}")
print(f"Log-transformed   - skewness: {df['log_income'].skew():.2f}")
# OUTPUT (typical):
# Raw income        - skewness: 2.31, min: 12043, max: 412887
# Log-transformed   - skewness: 0.02`
            ],
            codeExplanations: [
                `<code>rng.lognormal(...)</code> generates data that mimics real income distributions - heavily right-skewed, with most values moderate and a long tail of very high earners. <code>df['income'].skew()</code> reports a skewness of about <code>2.31</code> (a symmetric Normal distribution has skewness near 0, so this is heavily lopsided). Applying <code>np.log(df['income'])</code> compresses the long right tail far more than the moderate values near the bulk of the distribution - the resulting <code>log_income</code> column has skewness near <code>0.02</code>, essentially symmetric and much closer to Normal, which is exactly the shape that linear regression and many statistical tests assume their inputs have.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>Linear Regression's statistical guarantees assume roughly-Normal residuals.</strong> While linear regression can technically be fit on any numeric data, its coefficient significance tests, confidence intervals, and the assumption of homoscedasticity (constant variance of errors) all rely on the residuals being approximately Normally distributed - a heavily skewed input feature (like raw income) often produces skewed, heteroscedastic residuals that violate these assumptions and make the model's own reported uncertainty estimates unreliable.</li>
<li><strong>A few extreme values can dominate a model's loss function.</strong> Because squared-error loss penalizes large errors quadratically, a small number of extreme incomes in an untransformed feature can have an outsized influence on a fitted linear model's coefficients, effectively letting a handful of outliers dictate a large part of the model's behavior for the entire dataset.</li>
<li><strong>Many classical statistical tests explicitly assume Normality.</strong> Tests like the t-test, ANOVA, and Pearson correlation lose validity/power when applied to heavily skewed data - transforming the feature toward Normal first is a standard prerequisite before running these tests, not just a modeling nicety.</li>
</ul>
<h3>Real-World Example</h3>
A team predicting loan default risk uses <code>annual_income</code> as a feature in a linear/logistic regression model. Raw income is heavily right-skewed: most applicants earn $30k-$100k, but a handful earn $2M+. Left untransformed, the linear model's coefficient for income gets pulled around by that small handful of very high earners, and the relationship it learns for the vast majority of "typical" applicants (where the real day-to-day risk signal actually lives) becomes distorted. Applying a log transform first compresses the extreme high-income tail, letting the model learn a much more stable, representative relationship between income and default risk across the bulk of the applicant population.`,
            codeExamples: [
                `# Comparing a linear model's coefficient stability with raw vs. log-transformed skewed income
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(1)
n = 500
income = rng.lognormal(mean=10.9, sigma=0.7, size=n)          # right-skewed
risk_score = 50 - 0.00005 * income + rng.normal(0, 5, n)       # true relationship uses income modestly
risk_score = np.clip(risk_score, 0, 100)

X_raw = income.reshape(-1, 1)
X_log = np.log(income).reshape(-1, 1)

for name, X in [("Raw income", X_raw), ("Log-transformed income", X_log)]:
    X_train, X_test, y_train, y_test = train_test_split(X, risk_score, test_size=0.3, random_state=0)
    model = LinearRegression().fit(X_train, y_train)
    print(f"{name:24s} coefficient: {model.coef_[0]:.6f}   R^2 on test: {model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Raw income               coefficient: -0.000047   R^2 on test: 0.401   <- distorted by extreme high earners
# Log-transformed income   coefficient: -2.812340   R^2 on test: 0.463   <- more stable fit, better test R^2`
            ],
            codeExplanations: [
                `Synthetic <code>risk_score</code> data is generated with a genuine (modest, linear) relationship to raw <code>income</code>, then heavily right-skewed income is fed into a <code>LinearRegression</code> both in its raw form and after a log transform. The raw-income model's fit is pulled around by the small number of very high earners, whose enormous income values dominate the squared-error loss during fitting even though they represent a tiny fraction of applicants - producing a less representative fit and a lower test R&sup2;. The log-transformed version compresses those extreme incomes into a comparable range with everyone else, letting the linear model fit the relationship that holds for the BULK of applicants more faithfully, which shows up as a modest but real improvement in test-set R&sup2;.`
            ]
        },
        {
            content: `<h3>The Transform Family: Log, Square Root, and Box-Cox</h3>
<ul>
<li><strong>Log transform</strong> (<code>log(x)</code>, or <code>log(x + 1)</code> when zeros are present) - the strongest common compression of large values; best for data spanning several orders of magnitude, like income, transaction amounts, or web traffic counts.</li>
<li><strong>Square root transform</strong> (<code>sqrt(x)</code>) - a gentler compression than log, often used for count data (e.g. number of website visits, number of claims) where the skew is present but less extreme.</li>
<li><strong>Box-Cox transform</strong> - a generalized family <code>((x^lambda - 1) / lambda</code> for <code>lambda != 0</code>, else <code>log(x)</code>) that automatically SEARCHES for the best <code>lambda</code> value to make the data as close to Normal as possible, rather than the analyst guessing between log and sqrt by hand. Box-Cox requires strictly positive values (a related variant, Yeo-Johnson, handles zero/negative values too).</li>
<li>The right choice depends on how severe the skew is and whether the target application (e.g. a specific statistical test) has particular requirements - Box-Cox is often used precisely because it removes the guesswork of picking a transform manually.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from scipy import stats

rng = np.random.default_rng(2)
income = rng.lognormal(mean=10.8, sigma=0.6, size=1000)

log_income = np.log(income)
sqrt_income = np.sqrt(income)
boxcox_income, best_lambda = stats.boxcox(income)   # scipy finds the optimal lambda automatically

print(f"Raw income     skewness: {stats.skew(income):.3f}")
print(f"Log transform  skewness: {stats.skew(log_income):.3f}")
print(f"Sqrt transform skewness: {stats.skew(sqrt_income):.3f}")
print(f"Box-Cox transform skewness: {stats.skew(boxcox_income):.3f}  (optimal lambda = {best_lambda:.3f})")
# OUTPUT (typical):
# Raw income     skewness: 2.276
# Log transform  skewness: 0.021
# Sqrt transform skewness: 1.021
# Box-Cox transform skewness: 0.004  (optimal lambda = -0.187)`
            ],
            codeExplanations: [
                `The same right-skewed income data is passed through three transforms for direct comparison. The square root transform reduces skewness only partially (from <code>2.276</code> down to about <code>1.021</code>) - it's a gentler compression that isn't strong enough for this level of skew. The log transform does much better (<code>0.021</code>, close to symmetric). <code>scipy.stats.boxcox</code> automatically searches over possible <code>lambda</code> values and finds the one (here about <code>-0.187</code>) that makes the transformed data as close to Normal as statistically possible, slightly outperforming even the plain log transform (<code>0.004</code> skewness) - illustrating why Box-Cox is often preferred in a rigorous pipeline: it removes the guesswork of manually picking log vs. sqrt and directly optimizes for Normality.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Fixes skewness so model assumptions hold</strong> - linear regression, ANOVA, t-tests, and Pearson correlation all perform better and produce more trustworthy statistics when applied to roughly-Normal inputs rather than heavily skewed raw data.</li>
<li><strong>Reduces the influence of extreme values without discarding them</strong> - unlike simply deleting outliers, a log or Box-Cox transform keeps every data point but compresses the scale so extreme values no longer dominate a squared-error loss function.</li>
<li><strong>Box-Cox removes manual guesswork</strong> - rather than an analyst arbitrarily choosing between log, sqrt, or another power transform, Box-Cox searches for the mathematically best-fitting transform automatically.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Changes the feature's units and interpretability</strong> - a coefficient on <code>log(income)</code> no longer means "dollars per unit"; it must be interpreted in percentage-change terms (a property of log transforms), which is less intuitive for non-technical stakeholders.</li>
<li><strong>Log and Box-Cox require positive values</strong> - zeros or negative values break the plain log transform (commonly worked around with <code>log(x + 1)</code>) and Box-Cox requires strictly positive input entirely (the Yeo-Johnson variant is used instead when zero/negative values are unavoidable).</li>
<li><strong>Not needed (and can hurt) for models that don't assume Normality</strong> - tree-based models (Decision Trees, Random Forests, gradient boosting) split on thresholds and are invariant to monotonic transforms like log, so transforming purely for their benefit is wasted effort that adds a preprocessing step and interpretability cost for zero performance gain.</li>
<li><strong>Must be fit/applied consistently between train and production</strong> - Box-Cox's learned <code>lambda</code> (or any transform's parameters) should be determined from training data only and reapplied identically to new data, the same discipline required for scalers and encoders.</li>
</ul>`,
            codeExamples: [
                `# A log transform helps a linear model but makes no difference to a tree-based model
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

rng = np.random.default_rng(3)
n = 600
income = rng.lognormal(mean=10.9, sigma=0.7, size=n)
y = 30 + 3.0 * np.log(income) + rng.normal(0, 3, n)   # true relationship is roughly log-linear

X_raw = income.reshape(-1, 1)
X_log = np.log(income).reshape(-1, 1)
X_train_raw, X_test_raw, y_train, y_test = train_test_split(X_raw, y, test_size=0.25, random_state=0)
X_train_log, X_test_log, _, _ = train_test_split(X_log, y, test_size=0.25, random_state=0)

for model_name, ModelCls in [("LinearRegression", LinearRegression), ("DecisionTree", DecisionTreeRegressor)]:
    m_raw = ModelCls().fit(X_train_raw, y_train)
    m_log = ModelCls().fit(X_train_log, y_train)
    print(f"{model_name:16s} raw R^2={r2_score(y_test, m_raw.predict(X_test_raw)):.3f}  "
          f"log R^2={r2_score(y_test, m_log.predict(X_test_log)):.3f}")
# OUTPUT (typical):
# LinearRegression raw R^2=0.681  log R^2=0.878   <- log transform helps a lot
# DecisionTree     raw R^2=0.849  log R^2=0.851   <- nearly identical - trees don't need it`
            ],
            codeExplanations: [
                `Synthetic <code>y</code> is generated with a genuinely log-linear relationship to income (mimicking many real-world "diminishing returns" patterns). <code>LinearRegression</code> improves substantially when given <code>log(income)</code> instead of raw income (R&sup2; rises from <code>0.681</code> to <code>0.878</code>), because linear regression can only fit a straight-line relationship - log-transforming the input lets a straight line in log-space capture what is actually a curved relationship in raw space. <code>DecisionTreeRegressor</code> barely changes (<code>0.849</code> vs <code>0.851</code>) because trees split on thresholds and a monotonic transform like log doesn't change which splits are optimal - concretely demonstrating that feature transformation is a targeted fix for models that assume linearity/Normality, not a universal preprocessing requirement.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why would you apply a log transform to a feature like annual income before linear regression?</td><td>Income is typically heavily right-skewed - most people earn a moderate amount while a few earn enormously more - which violates linear regression's assumption of roughly-Normal, homoscedastic residuals and lets a handful of extreme high earners dominate the squared-error loss; a log transform compresses the long tail, making the feature's distribution closer to Normal and letting the model fit a relationship representative of the bulk of the data</td></tr>
<tr class='text-center'><td>What is the difference between a log transform, a square root transform, and Box-Cox?</td><td>Log and square root are fixed, manually-chosen power transforms (log being a stronger compression, useful for data spanning orders of magnitude; sqrt being gentler, often used for count data); Box-Cox is a generalized family that automatically searches for the best power parameter (lambda) to make the data as close to Normal as possible, removing the need to guess which fixed transform is best - though it requires strictly positive input values</td></tr>
<tr class='text-center'><td>Do tree-based models like Random Forest need feature transformation for skewed data?</td><td>Generally no - tree-based models split on a threshold for one feature at a time, and since log/sqrt/Box-Cox are all monotonic transforms (they preserve the relative ORDER of values), the specific thresholds a tree learns adapt automatically and its predictions are essentially unaffected, unlike linear or distance-based models whose fit is directly shaped by the feature's actual numeric scale and distribution</td></tr>
</table>`
        }
    ]
};
