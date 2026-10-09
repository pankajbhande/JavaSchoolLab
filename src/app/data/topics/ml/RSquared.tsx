import { Topic } from '../../coreJava';

export const rSquared: Topic = {
    id: 'ml-regression-r',
    name: 'R²',
    beginner: [
        {
            content: `<h4>How Much Better Than "Just Guessing the Average" Is the Model?</h4>
<ul>
<li><strong>R&sup2; (R-squared, or the coefficient of determination)</strong> measures the PROPORTION of the variance in the target variable that the model successfully explains: <code>R&sup2; = 1 - (SS_residual / SS_total)</code>, where <code>SS_residual</code> is the sum of squared errors the model makes, and <code>SS_total</code> is the sum of squared errors a "dumb" baseline model would make if it always predicted the mean of the target.</li>
<li><strong>R&sup2; = 1</strong> means perfect predictions (zero error). <strong>R&sup2; = 0</strong> means the model is no better than just predicting the average every time. R&sup2; can even go <strong>negative</strong> if the model is actively worse than that trivial baseline.</li>
<li>Unlike MSE/MAE/RMSE, R&sup2; is <strong>scale-free</strong> - it's always between (roughly) 0 and 1, which makes it easy to interpret regardless of whether the target is measured in dollars, minutes, or anything else.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import r2_score
import numpy as np

y_actual =    np.array([200000, 300000, 400000, 500000, 600000])
y_predicted = np.array([210000, 290000, 420000, 480000, 615000])

r2 = r2_score(y_actual, y_predicted)
print(f"R-squared: {r2:.3f}")
# OUTPUT:
# R-squared: 0.986`
            ],
            codeExplanations: [
                `This computes R&sup2; between actual and predicted house prices using scikit-learn's r2_score(). Internally, it compares the model's total squared error against the total squared error of a trivial baseline that always predicts the mean price. An R&sup2; of 0.986 means the model explains about 98.6% of the variation in house prices seen in this data - only 1.4% of the variance is left unexplained (captured in the residual errors), which is a strong result for a regression model.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>R&sup2; answers a fundamentally different question than MSE/MAE/RMSE: instead of "how big is the typical error," it answers "how much of the target's natural variability did this model actually capture, compared to not modeling anything at all?" That framing makes it uniquely useful for judging whether a model is even worth using over a trivial guess.</li>
<li>Because it's scale-free, R&sup2; is the metric that lets you compare model quality ACROSS different problems - an R&sup2; of 0.9 means roughly the same thing whether the target is house prices or exam scores, whereas an RMSE of "50" means something completely different in each case.</li>
<li>R&sup2; alone can be dangerously misleading in one specific way: adding literally ANY additional feature to a regression model - even pure random noise with zero real relationship to the target - can never DECREASE R&sup2;, and will often increase it slightly just from the model fitting noise in the training data. This is exactly why <strong>Adjusted R&sup2;</strong> exists.</li>
</ul>
<h3>Real-World Example</h3>
A retail company builds a model to forecast next month's sales from marketing spend, seasonality, and store traffic, and reports an <strong>R&sup2; of 0.85</strong>.
<ul>
<li>That means the model explains <strong>85% of the variance</strong> in sales across all the stores/months in the data - a "dumb" baseline that just predicted the same average sales figure every time would leave 100% of that variance unexplained.</li>
<li>The remaining 15% is variance the model's chosen features simply cannot account for - some genuinely random fluctuation (a surprise weather event, a local competitor's flash sale) that no feature set could fully predict.</li>
<li>Executives find R&sup2; = 0.85 easy to reason about directly ("we're explaining the large majority of sales swings"), which is exactly the intuitive, scale-free comparison that a raw RMSE-in-dollars number would not give them as immediately.</li>
</ul>`,
            codeExamples: [
                `# R-squared vs a "dumb" baseline that always predicts the mean
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
marketing_spend = np.linspace(1000, 10000, 40)
sales = 5 * marketing_spend + rng.normal(0, 4000, 40) + 20000

X = marketing_spend.reshape(-1, 1)
model = LinearRegression().fit(X, sales)
predictions = model.predict(X)

model_r2 = r2_score(sales, predictions)
dumb_baseline_predictions = np.full_like(sales, sales.mean())
baseline_r2 = r2_score(sales, dumb_baseline_predictions)

print(f"Model R-squared:            {model_r2:.3f}")
print(f"Dumb (mean) baseline R-sq:  {baseline_r2:.3f}")
# OUTPUT (typical):
# Model R-squared:            0.850
# Dumb (mean) baseline R-sq:  0.000   <- predicting the mean always scores exactly 0`
            ],
            codeExplanations: [
                `A LinearRegression model is fit to predict sales from marketing spend, and its R&sup2; comes out around 0.85. As a sanity check, a "dumb" baseline is constructed that predicts the same value (the mean of sales) for every single data point, and its R&sup2; is computed too - it comes out to exactly 0.000, by definition, since R&sup2; = 0 is precisely the score of the mean-prediction baseline. This concretely demonstrates what R&sup2; = 0.85 actually means: the model is capturing 85% of the gap between "knowing nothing and just guessing the average" and "predicting perfectly," which is a much more intuitive way to grade a model's usefulness than a raw error number alone.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Scale-free and intuitive</strong> - a single number between roughly 0 and 1 (or negative if the model is truly bad), comparable across entirely different target variables and units.</li>
<li><strong>Directly answers "is this model worth using at all?"</strong> - by construction it benchmarks the model against the simplest possible baseline (always predict the mean), immediately revealing whether a model adds any real value.</li>
<li><strong>Widely understood</strong> - R&sup2; is a standard statistical concept familiar to audiences well beyond machine learning (e.g. anyone who's taken an introductory statistics course), making it easy to communicate.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Always increases (or stays flat) when adding features, even useless ones</strong> - since R&sup2; is computed on the same data the model saw, giving it any extra column to fit against - even pure random noise - lets it capture at least a tiny bit of that noise's chance correlation with the target, nudging R&sup2; up. This makes plain R&sup2; unreliable for comparing models with different numbers of features - see <strong>Adjusted R&sup2;</strong>.</li>
<li><strong>Doesn't reveal HOW a model is wrong</strong> - a high R&sup2; can still coexist with a badly biased model in specific regions of the data (e.g. systematically wrong on outliers), which is exactly what <strong>Residual Analysis</strong> is needed to catch.</li>
<li><strong>Sensitive to the range of the data</strong> - R&sup2; measured on a narrow slice of data (e.g. only mid-sized houses) can look very different from R&sup2; measured across the full range (small to huge houses), since it depends on how much variance exists in the sample to begin with.</li>
</ul>
<h3>Deeper Mechanics - Why R&sup2; Can Never Decrease When Adding a Feature</h3>
<ul>
<li>Ordinary Least Squares finds the coefficients that minimize the sum of squared residuals on the TRAINING data. Adding a new feature simply gives OLS one more variable it's allowed to assign a coefficient to - in the absolute worst case, it can set that coefficient to exactly zero and reproduce the old model exactly, so <code>SS_residual</code> can never get WORSE.</li>
<li>In practice, with any finite, noisy dataset, a new column - even meaningless random noise - will show at least some small, spurious correlation with the target just by chance, and OLS will exploit that sliver of signal to reduce <code>SS_residual</code> (and thus raise R&sup2;) by some small amount, even though the feature has zero true predictive value.</li>
</ul>`,
            codeExamples: [
                `# R-squared can NEVER decrease from adding a feature - even pure random noise
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
n = 100
marketing_spend = np.linspace(1000, 10000, n)
sales = 5 * marketing_spend + rng.normal(0, 4000, n) + 20000

X_original = marketing_spend.reshape(-1, 1)
random_noise_feature = rng.normal(0, 1, n).reshape(-1, 1)
X_with_noise = np.hstack([X_original, random_noise_feature])

model_original = LinearRegression().fit(X_original, sales)
model_with_noise = LinearRegression().fit(X_with_noise, sales)

r2_original = r2_score(sales, model_original.predict(X_original))
r2_with_noise = r2_score(sales, model_with_noise.predict(X_with_noise))

print(f"R-squared, original feature only:      {r2_original:.5f}")
print(f"R-squared, + a meaningless noise column: {r2_with_noise:.5f}")
# OUTPUT (typical):
# R-squared, original feature only:      0.85219
# R-squared, + a meaningless noise column: 0.85401   <- went UP, despite the new feature being pure noise`
            ],
            codeExplanations: [
                `A column of pure random noise (with zero real relationship to sales) is added as an extra feature alongside the genuine marketing_spend feature. Despite this new column being completely meaningless, R&sup2; still ticks upward rather than staying flat or dropping - because OLS can always exploit whatever small, coincidental correlation exists between random noise and the target in a finite sample. This is the concrete mechanism behind R&sup2;'s core limitation: it can be nudged higher by adding literally any feature, which is precisely why comparing models with different numbers of features on plain R&sup2; alone is misleading, and why Adjusted R&sup2; (which explicitly penalizes each added feature) is the fairer metric for that comparison.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does an R-squared of 0.85 actually mean?</td><td>The model explains 85% of the variance in the target variable, compared to a "dumb" baseline that always predicts the mean (which by definition scores R-squared = 0); the remaining 15% is variance the model's features cannot account for</td></tr>
<tr class='text-center'><td>Can R-squared be negative, and what does that mean?</td><td>Yes - a negative R-squared means the model's predictions are actually worse (have a higher sum of squared errors) than simply predicting the mean of the target for every input, which typically signals a badly misspecified or badly overfit model being evaluated on new data</td></tr>
<tr class='text-center'><td>Why can R-squared be misleading when comparing models with different numbers of features?</td><td>Adding any feature to an OLS model - even pure random noise - can never decrease R-squared and will typically increase it slightly, since the optimizer can exploit any small, coincidental correlation in the training data; this means plain R-squared unfairly favors models with more features regardless of whether those features are genuinely useful, which is why Adjusted R-squared, which explicitly penalizes each added feature, is used instead</td></tr>
</table>`
        }
    ]
};
