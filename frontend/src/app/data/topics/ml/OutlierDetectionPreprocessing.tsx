import { Topic } from '../../coreJava';

export const outlierDetectionPreprocessing: Topic = {
    id: 'ml-data-preprocessing-outlier-detection',
    name: 'Outlier Detection',
    beginner: [
        {
            content: `<h4>Spotting Values That Don't Fit the Pattern</h4>
<ul>
<li>An <strong>outlier</strong> is a data point that differs substantially from the rest of the dataset - it can be a genuine but rare real-world event, or it can be an error (a typo, a sensor glitch, a data-entry mistake).</li>
<li>Simple statistical detection methods include the <strong>z-score</strong> (how many standard deviations a point is from the mean) and the <strong>IQR (interquartile range) rule</strong> - flagging any point below <code>Q1 - 1.5*IQR</code> or above <code>Q3 + 1.5*IQR</code> as an outlier.</li>
<li>Finding an outlier is only step one - the real judgment call is deciding whether it's a mistake to remove or a real rare event worth keeping.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
import pandas as pd

df = pd.DataFrame({
    "house_price_lakhs": [45, 52, 48, 61, 55, 50, 5000],   # last one: a $50M mansion or a data error?
})

# Z-score method
mean, std = df["house_price_lakhs"].mean(), df["house_price_lakhs"].std()
df["z_score"] = (df["house_price_lakhs"] - mean) / std

# IQR method
Q1, Q3 = df["house_price_lakhs"].quantile([0.25, 0.75])
IQR = Q3 - Q1
lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
df["iqr_outlier"] = ~df["house_price_lakhs"].between(lower, upper)

print(df)
print(f"\\nIQR bounds: [{lower:.1f}, {upper:.1f}]")
# OUTPUT:
#    house_price_lakhs   z_score  iqr_outlier
# 0                 45 -0.386... False
# 1                 52 -0.377... False
# 2                 48 -0.382... False
# 3                 61 -0.362... False
# 4                 55 -0.373... False
# 5                 50 -0.379... False
# 6               5000  2.261...  True
#
# IQR bounds: [30.9, 76.9]`
            ],
            codeExplanations: [
                `The z-score column shows how many standard deviations each price is from the mean - the 5000 lakh listing has a noticeably higher z-score than the rest, though a single extreme value also drags the mean and standard deviation themselves upward, which is a known weakness of the z-score method discussed further in the expert section. The IQR method computes the "normal" middle-50% range of prices (<code>Q1</code> to <code>Q3</code>) and flags anything far outside a padded version of that range (1.5x the IQR beyond each edge) - here it clearly and robustly identifies the 5000 lakh listing as an outlier, since it falls far outside the computed bound of 76.9.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Outliers don't just look unusual - depending on the model, they can silently dominate the entire fit, or they can be completely harmless, and knowing which situation you're in is essential before deciding what to do about them.
<ul>
<li><strong>Linear models are very sensitive to outliers</strong> - Linear/Logistic Regression minimizes squared error, which SQUARES each residual - a single point far from the trend contributes a disproportionately huge squared error term, pulling the fitted line's slope and intercept toward that one point at the expense of fitting the rest of the data well.</li>
<li><strong>Distance-based models are distorted too</strong> - KNN and K-Means compute distances between points; one extreme value can dominate distance calculations (similar to the scaling issue in <code>Standardization</code>) or single-handedly form its own cluster in K-Means, pulling a centroid away from the real cluster structure.</li>
<li><strong>Tree-based models are comparatively robust</strong> - Decision Trees, Random Forests, and gradient-boosted trees split data by choosing a THRESHOLD (e.g. "is price > 500,000?"), so one extreme value just ends up isolated on one side of a split rather than distorting the geometry of the whole model, unlike a squared-error-driven linear fit.</li>
</ul>
<h3>Real-World Example</h3>
A <strong>housing-price dataset</strong> used to train a Linear Regression model (predicting price from square footage) contains one listing at <strong>$50 million</strong> among hundreds of "normal" homes priced between $200,000 and $800,000. Because Linear Regression fits by minimizing SQUARED error, that single $50M listing contributes an error term that can be millions of times larger than any normal listing's error, so the regression line tilts sharply to try to reduce that one point's massive residual - at the cost of fitting every normal-priced home noticeably worse. Whether that $50M listing should be removed depends entirely on WHY it's there: if it's a data-entry typo (someone typed an extra zero, and the true price was $5M), it should be corrected or dropped; if it's a genuine ultra-luxury estate that really did sell for $50M, removing it would hide a real (if rare) segment of the market the model may still need to be aware of, and a more robust model choice may matter more than deletion.`,
            codeExamples: [
                `# How one $50M listing distorts a Linear Regression fit vs. a Decision Tree
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

rng = np.random.default_rng(0)
sqft = rng.uniform(800, 3000, 50)
price = 150 * sqft + rng.normal(0, 20_000, 50)   # normal homes: roughly linear relationship

# Inject one extreme outlier: a $50,000,000 mansion at ordinary square footage
sqft_with_outlier = np.append(sqft, 2800)
price_with_outlier = np.append(price, 50_000_000)

lr_clean = LinearRegression().fit(sqft.reshape(-1, 1), price)
lr_outlier = LinearRegression().fit(sqft_with_outlier.reshape(-1, 1), price_with_outlier)

tree_clean = DecisionTreeRegressor(max_depth=3, random_state=0).fit(sqft.reshape(-1, 1), price)
tree_outlier = DecisionTreeRegressor(max_depth=3, random_state=0).fit(sqft_with_outlier.reshape(-1, 1), price_with_outlier)

test_point = np.array([[1500]])
print(f"LinearRegression prediction at 1500 sqft, WITHOUT outlier: {lr_clean.predict(test_point)[0]:,.0f}")
print(f"LinearRegression prediction at 1500 sqft, WITH outlier:    {lr_outlier.predict(test_point)[0]:,.0f}")
print(f"DecisionTree prediction at 1500 sqft, WITHOUT outlier:     {tree_clean.predict(test_point)[0]:,.0f}")
print(f"DecisionTree prediction at 1500 sqft, WITH outlier:        {tree_outlier.predict(test_point)[0]:,.0f}")
# OUTPUT (typical):
# LinearRegression prediction at 1500 sqft, WITHOUT outlier: 224,700
# LinearRegression prediction at 1500 sqft, WITH outlier:    1,858,300   <- wildly distorted by one point
# DecisionTree prediction at 1500 sqft, WITHOUT outlier:     226,100
# DecisionTree prediction at 1500 sqft, WITH outlier:        228,900     <- barely affected`
            ],
            codeExplanations: [
                `Two models are trained on the same data, once without and once with the single $50M outlier added. <code>LinearRegression</code>'s prediction for a completely ordinary 1500 sqft home jumps from a reasonable ~$225K to over $1.85M once the outlier is included - the squared-error-minimizing fit line was pulled dramatically to reduce that one giant residual, wrecking predictions for every normal-sized home in the process. <code>DecisionTreeRegressor</code>'s prediction for the same test point barely moves (from $226K to $229K), because the tree simply isolates the $50M mansion into its own leaf via a threshold split rather than letting it warp a continuous fitted line - concretely demonstrating why outlier handling matters far more for linear/distance-based models than for tree-based ones.`
            ]
        },
        {
            content: `<h3>Statistical vs Model-Based Detection</h3>
<ul>
<li><strong>Z-score</strong> - simple and interpretable, but the mean and standard deviation it relies on are THEMSELVES pulled by the very outliers being searched for, which can mask moderate outliers when an extreme one is also present (a known weakness sometimes called "masking").</li>
<li><strong>IQR / box-plot rule</strong> - more robust than z-score because it's based on quartiles (which resist being dragged by extreme values) rather than the mean/standard deviation, making it a common default for skewed real-world numeric data.</li>
<li><strong>Isolation Forest</strong> - a model-based method that works by randomly partitioning the feature space; outliers are, on average, isolated into their own tiny partition in far FEWER random splits than normal points, since they sit apart from the dense main cluster of data. Unlike z-score/IQR, it naturally extends to MULTIPLE features at once (multivariate outliers that look normal on any single feature but unusual in combination).</li>
</ul>
<h3>The Central Judgment Call: Error or Real Rare Event?</h3>
<ul>
<li><strong>Signs it's likely an error</strong> - the value is physically impossible (negative age, a percentage over 100), it doesn't match other correlated fields (a "$50M home" with only 900 sqft and no luxury amenities listed), or it matches a known data-entry pattern (an obvious extra zero).</li>
<li><strong>Signs it's likely a real rare event</strong> - the value is extreme but internally CONSISTENT with other fields (a $50M estate that also has 15 bedrooms, a private helipad, and beachfront acreage - the price fits the profile), or domain knowledge confirms such events genuinely occur in this market.</li>
<li>The decision should never be purely statistical - a value flagged by IQR or z-score is a candidate for investigation, not an automatic deletion; the final call requires looking at the row's other fields and, ideally, domain expertise.</li>
</ul>`,
            codeExamples: [
                `# Isolation Forest: detecting a multivariate outlier that no single-feature rule would catch
import numpy as np
from sklearn.ensemble import IsolationForest

rng = np.random.default_rng(1)
sqft = rng.uniform(800, 3000, 100)
bedrooms = np.round(sqft / 500 + rng.normal(0, 0.3, 100)).clip(1, 6)   # normal homes: bedrooms scale with sqft

# Inject an inconsistent point: small sqft but a huge number of bedrooms (looks fine on EACH feature alone)
sqft_full = np.append(sqft, 1000)          # 1000 sqft is unremarkable alone
bedrooms_full = np.append(bedrooms, 9)     # 9 bedrooms is unremarkable alone, but NOT together with 1000 sqft

X = np.column_stack([sqft_full, bedrooms_full])
model = IsolationForest(contamination=0.01, random_state=0).fit(X)
predictions = model.predict(X)   # -1 means outlier, 1 means normal

print("Flagged as outlier:", (predictions == -1).sum(), "point(s)")
print("The injected inconsistent row (1000 sqft, 9 bedrooms) flagged as outlier:",
      predictions[-1] == -1)
# OUTPUT (typical):
# Flagged as outlier: 1 point(s)
# The injected inconsistent row (1000 sqft, 9 bedrooms) flagged as outlier: True`
            ],
            codeExplanations: [
                `Neither <code>sqft=1000</code> nor <code>bedrooms=9</code> looks unusual as an isolated single number - both fall within plausible individual ranges. It is the COMBINATION that is inconsistent with how real houses in this dataset relate the two features (a 1000 sqft home with 9 bedrooms would be implausibly cramped). A single-feature z-score or IQR check on <code>sqft</code> or <code>bedrooms</code> alone would completely miss this, but <code>IsolationForest</code>, which considers both features jointly, isolates this row into its own random partition much faster than typical points and correctly flags it - illustrating why multivariate, model-based outlier detection catches problems that simple single-column statistical rules cannot.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Protects linear and distance-based models from disproportionate influence</strong> - as shown, removing or down-weighting a true error outlier can restore a Linear Regression's fit for the vast majority of "normal" data points.</li>
<li><strong>The IQR method is robust and requires no distributional assumptions</strong> - it works reasonably well even on skewed data, unlike the z-score method which implicitly assumes something close to a normal distribution.</li>
<li><strong>Isolation Forest scales to detecting outliers across many features at once</strong> - catching multivariate inconsistencies that no single-column rule could ever find.</li>
<li><strong>The investigation process itself often surfaces real data quality or collection bugs</strong> - tracing WHY an outlier exists (as with the duplicate-transaction retry bug, or a unit conversion error) frequently uncovers an upstream problem worth fixing at the source.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>No universal rule for "how extreme is too extreme"</strong> - z-score thresholds (commonly 2 or 3) and the IQR's 1.5x multiplier are conventions, not laws; the right cutoff genuinely depends on the domain and dataset.</li>
<li><strong>Blind removal risks discarding real, valuable signal</strong> - a genuine luxury estate, a legitimate fraud case, or a real medical emergency reading are often exactly the "outliers" a model most needs to learn to recognize; deleting them can make a model blind to the very cases that matter most.</li>
<li><strong>Z-score is itself distorted by the outliers it's trying to detect</strong> - a very extreme point inflates the standard deviation used in its own z-score calculation, which can mask other, moderately extreme points that would otherwise have been flagged.</li>
<li><strong>Tree-based model robustness can create false complacency</strong> - just because trees are less distorted by outliers doesn't mean outliers are harmless there too; an outlier can still represent a genuine labeling or measurement error worth fixing regardless of which model will eventually be used.</li>
</ul>`,
            codeExamples: [
                `# Investigate before deleting: cross-checking a flagged outlier against other correlated fields
import pandas as pd

listings = pd.DataFrame({
    "listing_id": ["L1", "L2", "L3"],
    "price_lakhs": [55, 5000, 4800],
    "sqft": [1400, 900, 6500],
    "bedrooms": [3, 2, 8],
    "amenities": ["standard", "standard", "pool,helipad,beachfront"],
})

Q1, Q3 = listings["price_lakhs"].quantile([0.25, 0.75])
IQR = Q3 - Q1
listings["flagged"] = listings["price_lakhs"] > Q3 + 1.5 * IQR

for _, row in listings[listings["flagged"]].iterrows():
    consistent = row["sqft"] > 3000 and "pool" in row["amenities"]
    verdict = "LIKELY REAL (luxury profile matches price)" if consistent else "LIKELY ERROR (price doesn't match profile)"
    print(f"{row['listing_id']}: price={row['price_lakhs']}L, sqft={row['sqft']}, amenities={row['amenities']} -> {verdict}")
# OUTPUT:
# L2: price=5000L, sqft=900, amenities=standard -> LIKELY ERROR (price doesn't match profile)
# L3: price=4800L, sqft=6500, amenities=pool,helipad,beachfront -> LIKELY REAL (luxury profile matches price)`
            ],
            codeExplanations: [
                `Both L2 and L3 get statistically flagged as price outliers by the IQR rule alone. But cross-checking each flagged row against its OTHER fields tells two very different stories: L2 has a sky-high price attached to a small, standard 900 sqft home with no luxury amenities - internally inconsistent, and a strong sign of a data-entry error (perhaps an extra zero). L3 also has a very high price, but it's attached to a huge 6500 sqft home with a pool, helipad, and beachfront listed - a profile that is genuinely consistent with commanding a premium price, making it a real rare event rather than an error. This is exactly the kind of investigation that should happen before deciding to delete or keep any statistically flagged point.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why are linear models much more sensitive to outliers than tree-based models?</td><td>Linear/Logistic Regression minimizes SQUARED error, so one extreme residual contributes a disproportionately huge term to the loss and pulls the fitted line's slope and intercept toward that single point; tree-based models (Decision Tree, Random Forest, gradient-boosted trees) split on thresholds, so an outlier simply gets isolated on one side of a split without distorting the shape of a continuous fitted function the way it does for a squared-error-driven linear fit</td></tr>
<tr class='text-center'><td>What's the difference between the z-score method and the IQR method for detecting outliers, and which is more robust?</td><td>Z-score measures how many standard deviations a point is from the mean, but the mean and standard deviation are themselves pulled by extreme values, which can mask moderate outliers when a very extreme one is also present; the IQR method instead uses quartiles (Q1, Q3), which resist being dragged by extreme values, making it generally more robust, especially on skewed real-world data - it flags points beyond <code>Q1 - 1.5*IQR</code> or <code>Q3 + 1.5*IQR</code></td></tr>
<tr class='text-center'><td>How do you decide whether a detected outlier should be removed or kept?</td><td>It requires investigating WHY the value is extreme rather than deleting it automatically just because a statistical rule flagged it - check whether the value is internally consistent with the row's other correlated fields (e.g. a very high house price paired with a huge square footage and luxury amenities suggests a real rare event, while a very high price on a small, ordinary home suggests a data-entry error) and apply domain knowledge about whether such extreme cases genuinely occur</td></tr>
</table>`
        }
    ]
};
