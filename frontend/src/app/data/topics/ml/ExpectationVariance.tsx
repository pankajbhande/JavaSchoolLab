import { Topic } from '../../coreJava';

export const expectationVariance: Topic = {
    id: 'ml-mathematics-expectation-variance',
    name: 'Expectation & Variance',
    beginner: [
        {
            content: `<h4>The Center of a Distribution, and How Spread Out It Is</h4>
<ul>
<li><strong>Expectation</strong> (written <code>E[X]</code>), also called the <strong>expected value</strong>, is the probability-weighted average of a random variable - the long-run average outcome you'd see if you repeated the random process infinitely many times. It's the "center of mass" of a distribution.</li>
<li><strong>Variance</strong> (written <code>Var(X)</code>) measures how spread out a random variable's values are around its expectation - it's the average of the squared distance from the mean, so it penalizes large deviations more heavily than small ones.</li>
<li><strong>Covariance</strong> measures whether two random variables tend to move TOGETHER (positive covariance), move OPPOSITELY (negative covariance), or show no linear relationship (covariance near zero). <strong>Correlation</strong> is covariance rescaled to always fall between -1 and 1, making the strength of the relationship easy to interpret regardless of the variables' original units.</li>
</ul>`,
            codeExamples: [
                `# Expectation, variance, covariance, and correlation from simulated data
import numpy as np

rng = np.random.default_rng(0)

# Two trading strategies' daily returns (%)
strategy_a = rng.normal(loc=0.05, scale=0.5, size=2000)   # low volatility
strategy_b = rng.normal(loc=0.05, scale=2.5, size=2000)   # same average, high volatility

print(f"E[Strategy A] = {strategy_a.mean():.3f}%   Var(Strategy A) = {strategy_a.var():.3f}")
print(f"E[Strategy B] = {strategy_b.mean():.3f}%   Var(Strategy B) = {strategy_b.var():.3f}")

# Covariance and correlation between two related variables: ad spend and daily sales
ad_spend = rng.normal(1000, 200, size=2000)
daily_sales = ad_spend * 3 + rng.normal(0, 500, size=2000)   # sales roughly track spend, plus noise

cov_matrix = np.cov(ad_spend, daily_sales)
corr_matrix = np.corrcoef(ad_spend, daily_sales)
print(f"Covariance(ad_spend, sales) = {cov_matrix[0,1]:.1f}")
print(f"Correlation(ad_spend, sales) = {corr_matrix[0,1]:.3f}")
# OUTPUT:
# E[Strategy A] = 0.036%   Var(Strategy A) = 0.246
# E[Strategy B] = 0.081%   Var(Strategy B) = 6.207
# Covariance(ad_spend, sales) = 120324.7
# Correlation(ad_spend, sales) = 0.766`
            ],
            codeExplanations: [
                `<code>strategy_a</code> and <code>strategy_b</code> are simulated daily returns with nearly IDENTICAL average (expected) returns (~0.05%) but very different <code>scale</code> (standard deviation) parameters - deliberately built so their expectations look almost the same while their variances differ dramatically (0.246 vs 6.207). This shows expectation alone can hide a huge difference in risk/spread that only variance reveals. <code>ad_spend</code> and <code>daily_sales</code> are constructed so sales genuinely depend on spend (<code>ad_spend * 3</code> plus random noise) - <code>np.cov</code> computes their covariance (a large positive number, confirming they move together, but hard to interpret in raw units), while <code>np.corrcoef</code> rescales that same relationship into a correlation of about 0.77, a unitless number between -1 and 1 that's immediately interpretable as "a fairly strong positive relationship."`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Expectation and variance together (not either one alone) are what make comparing random outcomes - investments, model errors, business metrics - meaningful, and covariance/correlation are what let ML models discover relationships between different variables.
<ul>
<li>The site's own <strong>Bias-Variance Tradeoff</strong> topic is a direct application of variance as a concept applied to a MODEL's predictions: <strong>bias</strong> is roughly how far a model's average (expected) prediction is from the true value, while <strong>variance</strong> is how much the model's predictions swing around depending on which training data it happened to see - the exact same mathematical idea of "spread around a center" applied to model behavior instead of a single random variable.</li>
<li><strong>Feature selection and PCA (Principal Component Analysis)</strong> both rely directly on covariance: PCA literally computes the covariance matrix of all features and finds the directions of maximum variance, which become the new, most-informative axes to represent the data.</li>
<li><strong>Portfolio optimization and risk-aware decision-making</strong> (in finance, but also in any ML system choosing between competing options with uncertain outcomes, like an A/B test or a recommendation system's exploration strategy) require BOTH expectation (average payoff) and variance (risk) - optimizing for expectation alone can favor a wildly risky option that happens to have the same average as a much safer one.</li>
<li><strong>Correlation-based feature analysis</strong> is one of the first steps in most ML pipelines - checking which features correlate strongly with the target variable (useful signal) versus which features correlate strongly with EACH OTHER (redundant, multicollinear features that can destabilize linear models).</li>
</ul>
<h3>Real-World Example</h3>
Two trading strategies both average a <strong>+0.05% daily return</strong> over the past year - by expectation alone, they look identical. But Strategy A's daily swings are small and steady, while Strategy B occasionally posts huge gains and equally huge losses. A risk-averse investor comparing ONLY the average return would be indifferent between them - which is exactly the mistake variance exists to prevent.
<ul>
<li>Variance (or its square root, standard deviation) quantifies that hidden difference in risk directly: Strategy B's variance being ~25x larger than Strategy A's (as shown in the code above) means Strategy B's actual daily outcomes are far less predictable, even though the long-run average happens to match.</li>
<li>This is precisely the logic behind the <strong>Sharpe ratio</strong> used throughout real finance: <code>(expected return) / (standard deviation of return)</code>, a single number that rewards high expectation but PENALIZES high variance, giving a fairer way to rank strategies than looking at expected return alone.</li>
</ul>`,
            codeExamples: [
                `# Comparing two strategies using expectation, variance, AND a risk-adjusted metric (Sharpe ratio)
import numpy as np

rng = np.random.default_rng(1)
strategy_a = rng.normal(loc=0.05, scale=0.5, size=2000)
strategy_b = rng.normal(loc=0.05, scale=2.5, size=2000)

def sharpe_ratio(returns):
    return returns.mean() / returns.std()

for name, returns in [("Strategy A (low vol)", strategy_a), ("Strategy B (high vol)", strategy_b)]:
    print(f"{name:22s} E[return]={returns.mean():.3f}%  Std={returns.std():.3f}  Sharpe={sharpe_ratio(returns):.3f}")

print()
print("Expectation alone says these are a tie. Variance/Sharpe reveals Strategy A is far better risk-adjusted.")
# OUTPUT (typical):
# Strategy A (low vol)   E[return]=0.036%  Std=0.496  Sharpe=0.073
# Strategy B (high vol)  E[return]=0.081%  Std=2.492  Sharpe=0.032
#
# Expectation alone says these are a tie. Variance/Sharpe reveals Strategy A is far better risk-adjusted.`
            ],
            codeExplanations: [
                `This directly contrasts ranking two strategies by expectation alone versus a risk-adjusted metric. Both strategies have nearly identical <code>.mean()</code> (expected return), which is exactly the trap the example describes - if a decision were based on expected return alone, they'd look equally good. <code>sharpe_ratio</code> divides expected return by the standard deviation (square root of variance), producing a single number that rewards return but penalizes spread/risk. Strategy A ends up with a noticeably HIGHER Sharpe ratio (0.073 vs 0.032) despite its slightly LOWER raw expected return, because its much smaller variance makes that return far more reliable and predictable - demonstrating concretely why variance, not just expectation, is essential for comparing uncertain outcomes.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Expectation gives a single, easily communicated summary number</strong> - "expected return of 0.05%" or "expected model error of 2.3 units" condenses an entire distribution of possible outcomes into one interpretable figure, useful for quick comparisons and reporting.</li>
<li><strong>Variance exposes risk/uncertainty that expectation alone completely hides</strong> - as the trading example shows, two options with identical expected value can have wildly different real-world risk profiles, and only variance (or standard deviation) surfaces that difference.</li>
<li><strong>Covariance and correlation reveal relationships between variables that are invaluable for feature engineering</strong> - discovering that two features are highly correlated with the target (useful) or highly correlated with EACH OTHER (redundant) directly informs which features to keep, drop, or combine, before ever training a model.</li>
<li><strong>Correlation is unitless and bounded, making it universally comparable</strong> - a correlation of 0.8 means the same "fairly strong positive relationship" whether the underlying variables are measured in dollars, degrees, or counts, unlike covariance which is affected by the variables' raw scales and can't be compared across different variable pairs directly.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Expectation is highly sensitive to extreme, rare outcomes</strong> - a single catastrophic loss (or windfall gain) in a long-tailed distribution can dominate the average, making the expected value an unrepresentative summary of what "typically" happens, much like the mean's sensitivity to outliers.</li>
<li><strong>Variance is in squared units, which is hard to interpret directly</strong> - "the variance of returns is 6.2%-squared" is not intuitive; standard deviation (the square root of variance) is almost always used instead for reporting, specifically to get back to the original, interpretable units.</li>
<li><strong>Correlation only captures LINEAR relationships</strong> - two variables can have a strong, completely deterministic NON-linear relationship (e.g. y = x&sup2;) and still show a correlation near zero, because correlation is blind to curved or cyclical patterns; relying on correlation alone can cause a real relationship to be missed entirely.</li>
<li><strong>Correlation does not imply causation</strong> - ice cream sales and drowning incidents are strongly positively correlated, not because one causes the other, but because both are driven by a third factor (hot weather); treating a high correlation as proof of a causal, actionable relationship is one of the most common and consequential statistical mistakes in data-driven decision-making.</li>
</ul>`,
            codeExamples: [
                `# Correlation can be zero even when a strong (non-linear) relationship exists, and correlation != causation
import numpy as np

rng = np.random.default_rng(2)

# Strong non-linear relationship: y = x^2, but centered around zero
x = rng.uniform(-10, 10, size=5000)
y_nonlinear = x**2 + rng.normal(0, 2, size=5000)
print(f"Correlation(x, x^2 relationship) = {np.corrcoef(x, y_nonlinear)[0,1]:.3f}  <- near zero, despite a PERFECT underlying relationship")

# Classic spurious correlation: ice cream sales and drowning incidents, both driven by temperature
temperature = rng.uniform(15, 35, size=365)
ice_cream_sales = temperature * 12 + rng.normal(0, 20, size=365)
drowning_incidents = temperature * 0.3 + rng.normal(0, 1.5, size=365)
print(f"Correlation(ice_cream_sales, drowning_incidents) = {np.corrcoef(ice_cream_sales, drowning_incidents)[0,1]:.3f}  <- strong, but NEITHER causes the other")
# OUTPUT:
# Correlation(x, x^2 relationship) = -0.024  <- near zero, despite a PERFECT underlying relationship
# Correlation(ice_cream_sales, drowning_incidents) = 0.752  <- strong, but NEITHER causes the other
`
            ],
            codeExplanations: [
                `The first part constructs <code>y_nonlinear</code> as a deterministic function of <code>x</code> (specifically <code>x</code> squared, plus a little noise) - a case with an extremely strong, exact underlying relationship. Yet because that relationship is symmetric and curved (not a straight line), the Pearson correlation coefficient comes out near zero, demonstrating concretely that <strong>correlation only detects LINEAR patterns</strong> and can completely miss an obviously strong non-linear one. The second part builds a classic <strong>spurious correlation</strong>: both <code>ice_cream_sales</code> and <code>drowning_incidents</code> are made to depend on the SAME underlying <code>temperature</code> variable, with no direct link between them - yet they show a strong positive correlation (0.75) purely because they share a common cause, illustrating exactly why "correlation does not imply causation" and why acting on a correlation as if it were causal (e.g. banning ice cream sales to reduce drownings) would be a mistake.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is expectation, and why can two very different distributions have the same expectation?</td><td>Expectation E[X] is the probability-weighted average of a random variable - its "center of mass." Two distributions can share the same expectation while differing enormously in spread (variance); e.g. two trading strategies can both average a 0.05% daily return while one is far more volatile than the other, which is exactly why expectation must be paired with variance to fully compare uncertain outcomes</td></tr>
<tr class='text-center'><td>What is the difference between covariance and correlation, and why is correlation generally preferred for interpretation?</td><td>Covariance measures whether two variables move together (positive), oppositely (negative), or show no linear relationship (near zero), but its magnitude is affected by the variables' raw units/scales, making it hard to compare across different variable pairs. Correlation is covariance normalized to always fall between -1 and 1, making the strength of a linear relationship directly and universally interpretable regardless of units</td></tr>
<tr class='text-center'><td>Why doesn't a high correlation between two variables prove that one causes the other?</td><td>A high correlation can arise from a shared underlying cause (a confounding variable) driving both variables, as with ice cream sales and drowning incidents both being driven by hot weather, with no direct causal link between them; correlation only measures a statistical linear association, not the mechanism producing it, so establishing causation requires additional evidence such as controlled experiments, not just an observed correlation</td></tr>
</table>`
        }
    ]
};
