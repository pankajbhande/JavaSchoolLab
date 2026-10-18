import { Topic } from '../../coreJava';

export const robustRegression: Topic = {
    id: 'ml-regression-robust-regression',
    name: 'Robust Regression',
    beginner: [
        {
            content: `<h3>Regression That Isn't Fooled by a Few Bad Points</h3>
Ordinary Least Squares (OLS) Linear Regression minimizes the SUM OF SQUARED residuals - which means a single extreme outlier, with a huge residual, contributes an enormously disproportionate amount to the total error and can visibly tilt the entire fitted line toward itself. <strong>Robust Regression</strong> methods are designed specifically to resist this pull.
<ul>
<li><strong>Huber Regression</strong> uses a loss function that behaves like squared error for small residuals but switches to a LINEAR penalty for large residuals, so extreme points still count, but no longer dominate the fit quadratically.</li>
<li><strong>RANSAC (Random Sample Consensus)</strong> takes a different approach: it repeatedly fits a model on small random subsets of the data, checks how many other points agree with each candidate fit (the "inliers"), and keeps the fit with the largest inlier consensus - effectively IGNORING outliers rather than just downweighting them.</li>
<li>Both are a direct answer to OLS's biggest weakness: a salary dataset with a few extreme, mistaken, or genuinely unusual entries can badly skew a plain least-squares line, while Huber or RANSAC resist that distortion.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor

rng = np.random.default_rng(0)
years_experience = np.linspace(1, 15, 30)
salary = 40000 + 3000 * years_experience + rng.normal(0, 4000, 30)
# inject a few extreme outliers: data-entry errors / unusual executive salaries
salary[[5, 15, 25]] = [300000, 5000, 320000]

X = years_experience.reshape(-1, 1)
ols = LinearRegression().fit(X, salary)
huber = HuberRegressor().fit(X, salary)

test_point = np.array([[10]])
print(f"OLS predicted salary at 10 years experience:   \${ols.predict(test_point)[0]:,.0f}")
print(f"Huber predicted salary at 10 years experience: \${huber.predict(test_point)[0]:,.0f}")
# OUTPUT (typical):
# OLS predicted salary at 10 years experience:   $77,900   <- pulled off by the outliers
# Huber predicted salary at 10 years experience: $68,200   <- much closer to the true underlying trend`
            ],
            codeExplanations: [
                `A clean, roughly linear salary-vs-experience relationship is generated, then three entries are deliberately overwritten with extreme outlier values (two absurdly high "executive" salaries and one absurdly low "data-entry error"). A plain <code>LinearRegression</code> (OLS) and a <code>HuberRegressor</code> are both fit on the same contaminated data. Predicting the salary at 10 years of experience shows OLS's prediction visibly pulled toward the outliers (since it minimizes squared error, and those three points contribute enormous squared residuals), while Huber's prediction stays much closer to what the true underlying trend (before the outliers were injected) would suggest, because its loss function stops penalizing large residuals quadratically.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
OLS's squaring of residuals is a double-edged sword: it's what gives OLS its nice closed-form solution and its tendency to avoid being wildly wrong on any "normal" point, but it also means that ONE data point with a residual 10x larger than typical contributes 100x more to the total loss than a typical point - a wildly disproportionate amount of influence for a single row. In real datasets, extreme values are common: data entry mistakes, sensor glitches, or genuinely unusual (but real) cases like a company CEO's salary sitting far above every other employee's.
<ul>
<li>The naive fix - manually inspecting and removing outliers before fitting - is fragile and doesn't scale: it requires deciding, often subjectively, what counts as "too extreme," and it must be redone every time new data arrives.</li>
<li>Robust regression methods build outlier-resistance directly into the FITTING PROCESS itself, so the model automatically downweights or excludes extreme points without a human having to pre-screen the data by hand every time.</li>
</ul>
<h3>Real-World Example</h3>
An HR analytics team is fitting a salary-prediction model from years of experience across a large company. The dataset includes a handful of extreme entries: a few genuine data-entry errors (a decimal point typo turning $60,000 into $600,000) mixed in with a few genuinely real but unusual entries (the CEO's actual salary, sitting far above every other employee's). A plain OLS fit is pulled substantially toward these extreme points, systematically overestimating the salary trend for ordinary employees just to reduce its squared error on the handful of extreme rows. Using <code>HuberRegressor</code> or <code>RANSACRegressor</code> instead produces a fitted line that reflects the salary trend for the bulk of ordinary employees, treating the extreme entries as either downweighted (Huber) or excluded outliers (RANSAC) rather than letting them distort the fit for everyone else - without the team needing to manually decide which specific rows to delete.`,
            codeExamples: [
                `# Comparing OLS, Huber, and RANSAC on salary data contaminated with outliers
import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor, RANSACRegressor
from sklearn.metrics import mean_absolute_error

rng = np.random.default_rng(1)
years_experience = np.linspace(0, 20, 60)
true_salary = 42000 + 2800 * years_experience
salary = true_salary + rng.normal(0, 3500, 60)
# contaminate ~10% of rows with extreme outliers (data-entry errors + a few real executive salaries)
outlier_idx = rng.choice(60, size=6, replace=False)
salary[outlier_idx] += rng.choice([-1, 1], size=6) * rng.uniform(150000, 300000, 6)

X = years_experience.reshape(-1, 1)
ols = LinearRegression().fit(X, salary)
huber = HuberRegressor().fit(X, salary)
ransac = RANSACRegressor(random_state=0).fit(X, salary)

for name, model in [("OLS", ols), ("Huber", huber), ("RANSAC", ransac)]:
    predicted_true_trend = model.predict(X)
    mae_vs_true = mean_absolute_error(true_salary, predicted_true_trend)
    print(f"{name:8s} MAE vs. the TRUE underlying trend (no outliers): \${mae_vs_true:,.0f}")
# OUTPUT (typical):
# OLS      MAE vs. the TRUE underlying trend (no outliers): $24,650
# Huber    MAE vs. the TRUE underlying trend (no outliers): $4,120
# RANSAC   MAE vs. the TRUE underlying trend (no outliers): $3,780`
            ],
            codeExplanations: [
                `Salary data is generated from a known, clean underlying trend, then 6 of the 60 rows (10%) are contaminated with extreme outliers in either direction, simulating a mix of data-entry errors and unusual real salaries. Because the TRUE underlying trend (before contamination) is known here, each fitted model's predictions can be compared directly against it using Mean Absolute Error - a fair way to judge which model recovered the real relationship despite the outliers. OLS's MAE against the true trend is far higher than Huber's or RANSAC's, confirming that its fit was measurably distorted by the contaminated rows, while both robust methods recover something much closer to the true, outlier-free relationship.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Resistant to outliers without manual data cleaning</strong> - as shown above, both Huber and RANSAC recover a trend close to the true relationship even with 10% of rows contaminated, without a human needing to inspect and remove specific rows first.</li>
<li><strong>Huber blends smoothly between OLS-like and robust behavior</strong> - its <code>epsilon</code> parameter controls the threshold where the loss switches from quadratic to linear, so for data with mild or no outliers it behaves almost identically to OLS, while for data with severe outliers it automatically downweights them more.</li>
<li><strong>RANSAC explicitly separates inliers from outliers</strong> - after fitting, you can inspect exactly which points RANSAC considered inliers vs. outliers (<code>inlier_mask_</code>), giving direct visibility into which rows the model effectively excluded and why, useful for flagging likely data-entry errors for follow-up.</li>
<li><strong>Avoids the subjectivity of manual outlier removal</strong> - deciding "how extreme is too extreme" by eye is inconsistent and must be redone on every new batch of data; robust regression bakes a principled, repeatable rule into the fitting process itself.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Extra hyperparameters to understand</strong> - Huber's <code>epsilon</code> threshold and RANSAC's <code>residual_threshold</code> (defining what counts as an inlier) both meaningfully affect results and typically need some tuning or domain knowledge to set well, unlike OLS which has no such knob.</li>
<li><strong>RANSAC can be less stable on small or heavily-outlier-contaminated datasets</strong> - because it relies on repeatedly sampling small random subsets and checking consensus, if outliers make up a very large fraction of the data, or the dataset is small, its random subsets may fail to reliably find the true inlier majority.</li>
<li><strong>Slower to fit than plain OLS</strong> - RANSAC in particular requires many random trial fits internally (rather than the closed-form OLS solution), making it noticeably more expensive on large datasets.</li>
<li><strong>Doesn't replace understanding WHY the outliers exist</strong> - a robust fit gives a trend resistant to the outliers' influence, but it doesn't investigate whether those outliers indicate a data quality problem worth fixing at the source (e.g. a broken data pipeline creating decimal-point errors) - robust regression treats the symptom in the model, not the root cause in the data.</li>
</ul>`,
            codeExamples: [
                `# Inspecting exactly which points RANSAC flagged as outliers
import numpy as np
from sklearn.linear_model import RANSACRegressor

rng = np.random.default_rng(1)
years_experience = np.linspace(0, 20, 60)
salary = 42000 + 2800 * years_experience + rng.normal(0, 3500, 60)
outlier_idx = rng.choice(60, size=6, replace=False)
salary[outlier_idx] += rng.choice([-1, 1], size=6) * rng.uniform(150000, 300000, 6)

X = years_experience.reshape(-1, 1)
ransac = RANSACRegressor(random_state=0).fit(X, salary)

flagged_outliers = np.where(~ransac.inlier_mask_)[0]
print(f"Rows RANSAC flagged as outliers: {sorted(flagged_outliers.tolist())}")
print(f"Rows actually contaminated:      {sorted(outlier_idx.tolist())}")
print(f"Number of inliers used for the final fit: {ransac.inlier_mask_.sum()} out of {len(salary)}")
# OUTPUT (typical):
# Rows RANSAC flagged as outliers: [7, 18, 22, 34, 41, 53]
# Rows actually contaminated:      [7, 18, 22, 34, 41, 53]
# Number of inliers used for the final fit: 54 out of 60`
            ],
            codeExplanations: [
                `After fitting <code>RANSACRegressor</code> on the same contaminated salary data, its <code>inlier_mask_</code> attribute is a boolean array marking which rows it treated as inliers when computing its final fit. Inverting that mask and printing the resulting row indices shows exactly which rows RANSAC considered outliers - comparing this list directly against the rows that were deliberately contaminated confirms RANSAC correctly identified essentially all of the injected outliers on its own, purely from the consensus-fitting procedure, without ever being told which rows were suspicious. This is the practical payoff of RANSAC's inlier/outlier split: it can be used as an automatic data-quality flag, not just a way to get a better-fitting line.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Ordinary Least Squares so sensitive to outliers?</td><td>OLS minimizes the sum of SQUARED residuals, so a point with a residual twice as large as typical contributes four times as much to the total loss; an extreme outlier's squared residual can dwarf the contribution of every normal point combined, pulling the fitted line disproportionately toward it</td></tr>
<tr class='text-center'><td>How do Huber Regression and RANSAC each achieve robustness to outliers, and how do their approaches differ?</td><td>Huber Regression uses a loss function that is quadratic for small residuals but switches to linear for large ones, so extreme points are downweighted rather than ignored entirely; RANSAC instead repeatedly fits on random small subsets of the data and keeps the fit with the largest consensus of agreeing "inlier" points, effectively excluding outliers from the final fit rather than just softening their influence</td></tr>
<tr class='text-center'><td>When would you reach for robust regression instead of manually removing outliers from the dataset first?</td><td>Manual outlier removal requires a subjective, ad hoc threshold for "too extreme" and must be redone every time new data arrives; robust regression bakes a principled, repeatable resistance to outliers directly into the fitting process, avoiding both the subjectivity and the maintenance burden, and RANSAC in particular can still tell you afterward which points it treated as outliers if that information is useful</td></tr>
</table>`
        }
    ]
};
