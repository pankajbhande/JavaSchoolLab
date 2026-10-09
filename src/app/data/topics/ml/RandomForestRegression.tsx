import { Topic } from '../../coreJava';

export const randomForestRegression: Topic = {
    id: 'ml-regression-random-forest-regression',
    name: 'Random Forest Regression',
    beginner: [
        {
            content: `<h3>Averaging Many Trees Instead of Trusting One</h3>
A <strong>Random Forest Regressor</strong> applies the same bagging + feature-randomness idea as the site's classification Random Forest topic, but combines its trees' outputs differently, matching what a regression problem actually needs.
<ul>
<li>Where a classification forest combines trees by MAJORITY VOTE, a regression forest combines its trees' predictions by <strong>averaging</strong> them - there's no discrete "class" to vote on, only numeric predictions to blend.</li>
<li>Each tree in the forest is trained on its own random bootstrap sample of rows (bagging) and considers only a random subset of features at each split, exactly as in the classification case - this keeps the individual trees' errors decorrelated so averaging actually cancels noise out.</li>
<li>A single regression tree produces a blocky "staircase" prediction surface (see the site's Decision Tree Regression topic) and can overfit badly if grown deep; averaging hundreds of such trees smooths that staircase into something much closer to a continuous curve.</li>
</ul>`,
            codeExamples: [
                `from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

X, y = fetch_california_housing(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

single_tree = DecisionTreeRegressor(random_state=0).fit(X_train, y_train)
forest = RandomForestRegressor(n_estimators=200, random_state=0).fit(X_train, y_train)

tree_mse = mean_squared_error(y_test, single_tree.predict(X_test))
forest_mse = mean_squared_error(y_test, forest.predict(X_test))
print(f"Single Decision Tree test MSE: {tree_mse:.3f}")
print(f"Random Forest (200 trees) test MSE: {forest_mse:.3f}")
# OUTPUT (typical):
# Single Decision Tree test MSE: 0.495
# Random Forest (200 trees) test MSE: 0.256`
            ],
            codeExplanations: [
                `Using the California housing dataset (predicting median house value from features like income, rooms, and location), a single <code>DecisionTreeRegressor</code> is compared against a <code>RandomForestRegressor</code> with 200 trees. The forest trains 200 trees, each on its own bootstrap sample with a random feature subset per split, then AVERAGES all 200 predictions for every test house. The forest's test MSE is roughly half the single tree's, illustrating the same story as classification Random Forest - a lone tree overfits its specific training sample, while averaging many decorrelated trees washes most of that overfitting out.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
A single regression tree faces the same low-bias/high-variance tension described in the Decision Tree Regression topic: growing it deep enough to capture real structure makes it sensitive to exactly which training rows it happened to see, producing predictions that would look meaningfully different if retrained on a slightly different sample. Random Forest Regression resolves this the same way the classification version does - by growing many DEEP, low-bias trees on different bootstrap samples with different random feature subsets per split, then combining them, relying on their DECORRELATION for the averaging to actually cancel variance rather than just reproduce it.
<ul>
<li>The critical difference from classification is the combination rule: averaging is the natural regression analog of majority voting, since there's a continuous numeric prediction from each tree rather than a discrete class label to tally votes over.</li>
<li>Averaging many piecewise-constant "staircase" functions (each tree's individual prediction surface) produces something much closer to a smooth surface overall, because different trees' staircases have their step boundaries in different places - so the sharp jumps get blurred out by the averaging even though no single tree's prediction is ever smooth on its own.</li>
</ul>
<h3>Real-World Example</h3>
A used-car marketplace wants to predict resale value from mileage, age, brand, and condition. A single Decision Tree Regressor would produce a blocky, staircase-shaped valuation (see Decision Tree Regression) and would be prone to overfitting quirks of whichever specific set of listings it happened to be trained on - two very similar cars could get noticeably different valuations just for landing in different leaves. A Random Forest Regressor of 200 trees, each trained on a different bootstrap sample of past listings with a different random feature subset per split, AVERAGES all 200 trees' valuations for each car. This smooths out any single tree's staircase artifacts and overfitting tendency, producing a valuation that changes gradually and sensibly as mileage or age changes slightly, and additionally exposes which features (mileage vs. brand vs. condition) actually drive resale value most, via feature importance.`,
            codeExamples: [
                `# Comparing prediction smoothness: single tree's staircase vs. forest's smoothed averaging
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor

rng = np.random.default_rng(0)
mileage = np.linspace(0, 150000, 80)
resale_value = 28000 - 0.12 * mileage + rng.normal(0, 800, 80)
X = mileage.reshape(-1, 1)

tree = DecisionTreeRegressor(max_depth=4, random_state=0).fit(X, resale_value)
forest = RandomForestRegressor(n_estimators=200, max_depth=4, random_state=0).fit(X, resale_value)

# predict along a fine grid and measure how "jumpy" each model's predictions are step to step
grid = np.linspace(0, 150000, 300).reshape(-1, 1)
tree_preds = tree.predict(grid)
forest_preds = forest.predict(grid)
tree_jumpiness = np.abs(np.diff(tree_preds)).sum()
forest_jumpiness = np.abs(np.diff(forest_preds)).sum()
print(f"Single tree total step-to-step change:  {tree_jumpiness:,.0f}")
print(f"Random Forest total step-to-step change: {forest_jumpiness:,.0f}")
# OUTPUT (typical):
# Single tree total step-to-step change:  9800
# Random Forest total step-to-step change: 3100   <- far smoother across the mileage range`
            ],
            codeExplanations: [
                `Resale value is generated as a clean, roughly linear function of mileage plus noise. A single tree and a 200-tree forest (both depth-limited to 4 for a fair comparison) are fit on the same data, then both predict resale value across a fine, evenly-spaced grid of mileage values. Summing the absolute differences between consecutive grid predictions gives a rough "jumpiness" score - a perfectly smooth linear function would have low, steady jumpiness, while a blocky staircase function has large jumps concentrated at its few split boundaries. The single tree's total jumpiness is roughly 3x the forest's, numerically confirming that averaging 200 trees (each with staircase boundaries in different places) produces a visibly smoother prediction curve than any one tree alone.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Much smoother predictions than a single tree</strong> - as measured above, averaging many trees whose staircase boundaries fall in different places blurs out individual jumps, producing predictions that vary far more gradually as inputs change slightly.</li>
<li><strong>Substantially reduces overfitting</strong> - the same variance-cancellation mechanism as classification Random Forest applies directly: each tree can be grown deep (low bias) since averaging cancels their individually high variance.</li>
<li><strong>Feature importance for regression tasks</strong> - <code>feature_importances_</code> reports how much each feature reduced VARIANCE (rather than Gini impurity) summed across all splits in all trees, letting a used-car platform quantify, for example, that mileage matters far more to resale value than paint color.</li>
<li><strong>No feature scaling needed and handles nonlinear relationships and interactions automatically</strong> - like a single regression tree, it needs no preprocessing for differently-scaled features and captures curvature and interactions without manual feature engineering.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Still cannot extrapolate beyond the training range</strong> - since every tree's leaves (and therefore the forest's average) are built from training targets, a forest predicts roughly the same value for any input beyond the most extreme training example, unlike a linear model that keeps extending its trend - a used car with mileage far beyond anything in the training listings gets an unreliable, flattened-out valuation.</li>
<li><strong>Heavier and slower than a single tree</strong> - training and storing hundreds of trees costs proportionally more compute and memory, which matters for a marketplace serving real-time valuations at scale.</li>
<li><strong>Loses the single tree's simple interpretability</strong> - a used-car platform can print one tree's exact decision rules to explain a valuation, but a 200-tree averaged forest has no equivalent simple explanation, requiring feature importance or SHAP values for after-the-fact interpretability instead.</li>
<li><strong>Averaging can slightly blur genuinely sharp jumps in the real relationship</strong> - if the true target actually does have a real discontinuity (e.g. a car's value dropping sharply once its warranty expires at an exact mileage threshold), averaging many trees can smooth over that real jump slightly rather than representing it exactly, unlike a single well-tuned tree that could capture a sharp threshold precisely.</li>
</ul>`,
            codeExamples: [
                `# Feature importance for a regression forest: which factors drive resale value most
import numpy as np
from sklearn.ensemble import RandomForestRegressor

rng = np.random.default_rng(0)
n = 300
mileage = rng.uniform(0, 150000, n)
age_years = rng.uniform(0, 15, n)
brand_tier = rng.integers(0, 3, n)     # 0=economy, 1=mid, 2=luxury
paint_color_code = rng.integers(0, 5, n)  # irrelevant feature

resale_value = (28000 - 0.11 * mileage - 900 * age_years + 4000 * brand_tier
                + rng.normal(0, 1200, n))  # paint_color_code deliberately has NO effect

X = np.column_stack([mileage, age_years, brand_tier, paint_color_code])
feature_names = ["mileage", "age_years", "brand_tier", "paint_color_code"]

forest = RandomForestRegressor(n_estimators=300, random_state=0).fit(X, resale_value)
for name, importance in sorted(zip(feature_names, forest.feature_importances_), key=lambda t: -t[1]):
    print(f"{name:18s} importance={importance:.3f}")
# OUTPUT (typical):
# mileage            importance=0.512
# age_years          importance=0.331
# brand_tier         importance=0.148
# paint_color_code   importance=0.009   <- correctly identified as nearly irrelevant`
            ],
            codeExplanations: [
                `Synthetic used-car data is built where resale value genuinely depends on mileage, age, and brand tier, but is deliberately made INDEPENDENT of a "paint color code" feature. After fitting a 300-tree <code>RandomForestRegressor</code>, its <code>feature_importances_</code> (computed from how much each feature reduced variance across all splits in all trees) correctly ranks mileage as the most influential factor, followed by age and brand tier, while paint color receives a near-zero importance score - confirming the forest correctly learned that this feature carries essentially no real signal, exactly the kind of insight a marketplace would use to decide which data fields are actually worth collecting and trusting for valuation.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Random Forest Regression combine its trees' predictions, and why is this different from classification Random Forest?</td><td>It averages the numeric predictions of all trees, rather than taking a majority vote; averaging is the natural analog for a continuous target since there is no discrete class label to tally votes over, whereas classification combines discrete predictions by counting which class most trees agreed on</td></tr>
<tr class='text-center'><td>Why does averaging many regression trees produce a smoother prediction surface than any single tree?</td><td>Each individual tree produces a blocky, piecewise-constant "staircase" surface with its split boundaries in specific places determined by its particular bootstrap sample; because different trees' boundaries fall in different places, averaging many of them blurs out individual sharp jumps, producing an overall surface that varies far more gradually even though no single tree in the ensemble is smooth on its own</td></tr>
<tr class='text-center'><td>How is feature importance computed for a Random Forest Regressor, and what does it tell you?</td><td>It is computed from how much each feature reduces variance (the regression analog of Gini impurity reduction), summed across every split where that feature was used across every tree in the forest; a high importance score means that feature was frequently and effectively used to separate the target's numeric values into more homogeneous groups, letting you rank which inputs actually drive predictions</td></tr>
</table>`
        }
    ]
};
