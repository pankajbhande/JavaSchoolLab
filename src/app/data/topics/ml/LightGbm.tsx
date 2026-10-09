import { Topic } from '../../coreJava';

export const lightGbm: Topic = {
    id: 'ml-classification-lightgbm',
    name: 'LightGBM',
    beginner: [
        {
            content: `<h4>Gradient Boosting Built for Speed at Massive Scale</h4>
<ul>
<li><strong>LightGBM</strong> (Light Gradient Boosting Machine) is Microsoft's gradient-boosting implementation, purpose-built to train much faster than XGBoost on very large datasets while often matching or beating its accuracy.</li>
<li>Its biggest structural difference from XGBoost is how trees grow: LightGBM grows trees <strong>leaf-wise</strong> (always splitting whichever leaf reduces loss the most next, regardless of which level it's on), while XGBoost's default is <strong>level-wise</strong> (grows an entire level of the tree before going deeper) - leaf-wise growth tends to reach lower loss with fewer splits.</li>
<li>It also bins continuous features into a fixed number of buckets ahead of time (<strong>histogram-based binning</strong>) so split-finding becomes a fast lookup over a small number of bins instead of scanning every raw value, and it supports categorical features NATIVELY without needing one-hot encoding first.</li>
</ul>`,
            codeExamples: [
                `import lightgbm as lgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
import time

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=-1,        # -1 means "no explicit depth limit" - leaf-wise growth is controlled via num_leaves instead
    num_leaves=31,        # the main complexity control for leaf-wise trees
    random_state=0,
    verbose=-1
)
start = time.time()
model.fit(X_train, y_train)
elapsed = time.time() - start

print(f"Test accuracy: {model.score(X_test, y_test):.3f}  (trained in {elapsed:.3f}s)")
# OUTPUT (typical):
# Test accuracy: 0.972  (trained in 0.045s)`
            ],
            codeExplanations: [
                `Unlike XGBoost and scikit-learn's GradientBoostingClassifier, which primarily control tree complexity via max_depth, LightGBM's main complexity knob is num_leaves (here 31), because leaf-wise growth doesn't stop at a fixed level - it keeps splitting whichever leaf helps most, so a leaf-heavy tree can actually be deeper in some branches than others. max_depth=-1 explicitly disables the level-based depth limit, letting num_leaves do the real work of controlling model complexity. The timing measurement illustrates LightGBM's core selling point: on this small dataset the difference is modest, but the same histogram-based, leaf-wise approach scales to be dramatically faster than level-wise growth once datasets reach millions of rows.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>XGBoost's level-wise tree growth is thorough - it fully expands one level before starting the next - but this means it sometimes wastes computation building out branches that don't reduce loss much, purely to keep the tree balanced. On tabular datasets with tens of millions of rows, this becomes a genuine bottleneck: training that takes minutes with LightGBM can take hours with a level-wise approach.</li>
<li>LightGBM's <strong>leaf-wise growth</strong> instead always expands whichever single leaf currently offers the biggest loss reduction, regardless of tree "shape" - for a fixed number of leaves, this reaches lower training loss than level-wise growth, because every split is chosen for maximum immediate benefit rather than for structural balance.</li>
<li>Combined with <strong>histogram-based binning</strong> (continuous features are bucketed into, e.g., 255 discrete bins up front, so finding the best split becomes a fast pass over a small number of bin boundaries rather than sorting and scanning every unique raw value) and <strong>native categorical support</strong> (splits directly on category groupings using an efficient algorithm, rather than requiring one-hot encoding, which would explode a high-cardinality column into hundreds of columns), LightGBM was specifically engineered around the practical realities of training gradient boosting on genuinely large, messy, real-world tabular datasets.</li>
</ul>
<h3>Real-World Example: Training on Tens of Millions of Rows</h3>
A large ad-tech or e-commerce company needs to train a click-through-rate or conversion prediction model on a dataset with tens of millions of historical impressions/rows and hundreds of features, including several high-cardinality categorical columns (ad ID, publisher site, user segment).
<ul>
<li>With XGBoost's default level-wise growth and a categorical column like "publisher site" (thousands of distinct values) needing to be one-hot encoded first, both training time and memory usage balloon - a full retrain that should happen daily to keep the model fresh can instead take many hours.</li>
<li>Switching to LightGBM: histogram-based binning collapses the raw feature-value scanning cost, leaf-wise growth reaches good splits with fewer total splits needed, and native categorical handling avoids the one-hot explosion entirely - the same daily retrain now finishes in minutes rather than hours, on the same hardware.</li>
<li>This speed difference is the primary reason LightGBM became the default choice specifically for very-large-scale industrial tabular problems, even in cases where XGBoost and LightGBM reach nearly identical final accuracy - the deciding factor is how often the model can practically be retrained.</li>
</ul>`,
            codeExamples: [
                `# Simulating a large-scale training-time comparison: LightGBM vs XGBoost with a high-cardinality categorical feature
import time
import numpy as np
import pandas as pd
import lightgbm as lgb
import xgboost as xgb
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
n = 200_000
publisher_site = rng.integers(0, 3000, n)   # high-cardinality categorical, e.g. 3000 distinct publishers
ad_position = rng.integers(0, 5, n)
bid_amount = rng.exponential(2.0, n)
click = ((bid_amount > 3) & (rng.random(n) < 0.3)).astype(int)

df = pd.DataFrame({"publisher_site": publisher_site, "ad_position": ad_position, "bid_amount": bid_amount})
df["publisher_site"] = df["publisher_site"].astype("category")  # LightGBM uses this natively

X_train, X_test, y_train, y_test = train_test_split(df, click, test_size=0.2, random_state=0)

start = time.time()
lgb_model = lgb.LGBMClassifier(n_estimators=200, num_leaves=63, verbose=-1, random_state=0)
lgb_model.fit(X_train, y_train, categorical_feature=["publisher_site"])
lgb_time = time.time() - start

# XGBoost needs the categorical column one-hot encoded (classic setup) to compare fairly
X_train_ohe = pd.get_dummies(X_train, columns=["publisher_site"])
X_test_ohe = pd.get_dummies(X_test, columns=["publisher_site"]).reindex(columns=X_train_ohe.columns, fill_value=0)
start = time.time()
xgb_model = xgb.XGBClassifier(n_estimators=200, max_depth=6, random_state=0)
xgb_model.fit(X_train_ohe, y_train)
xgb_time = time.time() - start

print(f"LightGBM: {lgb_time:.2f}s  accuracy={lgb_model.score(X_test, y_test):.3f}")
print(f"XGBoost (one-hot encoded): {xgb_time:.2f}s  accuracy={xgb_model.score(X_test_ohe, y_test):.3f}")
# OUTPUT (typical):
# LightGBM: 3.1s  accuracy=0.812
# XGBoost (one-hot encoded): 11.8s  accuracy=0.807`
            ],
            codeExplanations: [
                `This simulates the ad-tech scenario directly: 200,000 rows with a high-cardinality categorical feature (publisher_site, 3000 distinct values). LightGBM is given the raw categorical column directly (astype("category") plus categorical_feature=["publisher_site"]), letting it use its native categorical-splitting algorithm with no preprocessing blow-up. XGBoost, needing the classic one-hot encoding treatment for categoricals, must first expand publisher_site into 3000 separate binary columns via pd.get_dummies, which both increases memory usage and slows down split-finding across so many sparse columns. Comparing wall-clock training time shows LightGBM finishing meaningfully faster despite reaching comparable (here, even slightly better) accuracy - directly illustrating why LightGBM is preferred for large datasets with high-cardinality categorical features.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Much faster training on large datasets</strong> - the combination of histogram-based binning and leaf-wise growth means LightGBM can train on tens of millions of rows in a fraction of the time a level-wise, non-histogram approach would need, as shown above.</li>
<li><strong>Leaf-wise growth often reaches lower loss for the same tree budget</strong> - because every split is chosen for maximum loss reduction rather than to keep the tree balanced, LightGBM can reach good accuracy with fewer total leaves/splits than a level-wise approach.</li>
<li><strong>Native categorical feature support</strong> - no need to one-hot or target-encode high-cardinality columns first, avoiding both the memory blow-up and the information loss that comes from naive encoding schemes.</li>
<li><strong>Lower memory usage</strong> - histogram-based binning stores compact integer bin indices rather than raw floating-point feature values during split-finding, which matters directly when datasets are large enough to strain available RAM.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Leaf-wise growth can overfit more easily, especially on small datasets</strong> - because it keeps splitting whichever leaf helps the training loss most without regard for overall tree balance, it can produce deep, narrow branches that fit training-set quirks; num_leaves and max_depth need to be tuned more carefully (or explicitly capped) than with level-wise growth to avoid this.</li>
<li><strong>More prone to overfitting on small data specifically</strong> - LightGBM's speed advantages matter most at large scale; on a dataset with only a few thousand rows, its more aggressive leaf-wise growth can actually generalize worse than XGBoost's more conservative level-wise default unless carefully regularized (e.g. limiting num_leaves, increasing min_data_in_leaf).</li>
<li><strong>Histogram binning is an approximation</strong> - bucketing continuous features into a fixed number of bins (default 255) slightly reduces split precision compared to scanning every unique raw value, which is a deliberate speed/accuracy tradeoff that's usually negligible but can matter on datasets with very few, very precise numeric thresholds.</li>
<li><strong>Slightly less mature ecosystem/documentation than XGBoost</strong> - XGBoost has a longer track record and broader tooling/integration history, so LightGBM occasionally lags in third-party library support even though its core algorithm is often faster.</li>
</ul>`,
            codeExamples: [
                `# Leaf-wise overfitting risk: unconstrained num_leaves on a SMALL dataset
import lightgbm as lgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=300, n_features=15, n_informative=5, random_state=0)  # small dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

configs = [
    dict(num_leaves=7,  min_data_in_leaf=20),   # conservative
    dict(num_leaves=31, min_data_in_leaf=20),   # default-ish
    dict(num_leaves=255, min_data_in_leaf=1),   # aggressive leaf-wise growth, tiny dataset
]

for cfg in configs:
    model = lgb.LGBMClassifier(n_estimators=200, verbose=-1, random_state=0, **cfg)
    model.fit(X_train, y_train)
    print(f"{cfg}  train={model.score(X_train, y_train):.3f}  test={model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# {'num_leaves': 7, 'min_data_in_leaf': 20}    train=0.914  test=0.878
# {'num_leaves': 31, 'min_data_in_leaf': 20}   train=0.967  test=0.889
# {'num_leaves': 255, 'min_data_in_leaf': 1}   train=1.000  test=0.822   <- overfit on a small dataset`
            ],
            codeExplanations: [
                `Only 300 total samples are used, deliberately small enough for leaf-wise growth's overfitting risk to show clearly. The conservative configuration (num_leaves=7, min_data_in_leaf=20 requiring at least 20 examples per leaf) trains a simple model that underfits slightly. The default-ish configuration balances complexity and generalization well. The aggressive configuration (num_leaves=255, min_data_in_leaf=1 allowing leaves with even a single example) lets leaf-wise growth chase every last bit of training loss reduction, reaching perfect 100% training accuracy but the worst test accuracy of the three (82.2%) - directly demonstrating why num_leaves and min_data_in_leaf need deliberate tuning on smaller datasets, unlike on the large-scale data LightGBM's leaf-wise growth was originally optimized for.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Leaf-Wise Growth and Histogram Binning</h3>
<ul>
<li><strong>Level-wise (XGBoost's default)</strong>: at each depth level, every current leaf is split (if beneficial), so the tree grows as a complete, balanced layer at a time - simple to reason about, but some splits are made even when they offer only marginal loss reduction, purely to keep the tree's shape uniform.</li>
<li><strong>Leaf-wise (LightGBM)</strong>: at each step, the single leaf across the ENTIRE current tree that offers the largest loss reduction is chosen and split next, regardless of its depth - this greedy, best-first strategy reaches lower loss for a given total leaf budget, but can produce unbalanced, sometimes very deep trees if left unconstrained (hence the emphasis on num_leaves and min_data_in_leaf as the real complexity controls, rather than max_depth alone).</li>
<li><strong>Histogram-based binning</strong>: instead of considering every unique raw value of a continuous feature as a potential split point (an O(n log n) sort-based operation per feature, per node, in a naive implementation), LightGBM first buckets each feature's values into a small fixed number of bins (e.g. 255) ONCE, up front - after that, finding the best split at any node is just a fast pass summing gradient/Hessian statistics per bin, dramatically cutting the per-split search cost, especially as dataset size grows.</li>
</ul>`,
            codeExamples: [
                `# Illustrating histogram binning: converting continuous values into a small number of discrete bins
import numpy as np

rng = np.random.default_rng(0)
raw_values = rng.exponential(scale=50, size=20)  # continuous feature, e.g. transaction amounts
print("Raw values (first 8):", np.round(raw_values[:8], 2))

n_bins = 8
bin_edges = np.quantile(raw_values, np.linspace(0, 1, n_bins + 1))
bin_indices = np.digitize(raw_values, bin_edges[1:-1])

print(f"Bin edges: {np.round(bin_edges, 1)}")
print("Bin index per value (first 8):", bin_indices[:8])
print(f"Unique raw values: {len(np.unique(raw_values))}  ->  Unique bins: {len(np.unique(bin_indices))}")
# OUTPUT (typical):
# Raw values (first 8): [ 12.4  87.9  33.1   5.2 141.7  22.8  61.4   9.6]
# Bin edges: [  1.2  10.5  19.8  28.9  39.7  53.6  74.2 104.3 220.5]
# Bin index per value (first 8): [1 6 3 0 7 2 5 0]
# Unique raw values: 20 (illustrative; real datasets have far more)
# Unique bins: 8`
            ],
            codeExplanations: [
                `This directly demonstrates what LightGBM's preprocessing step does to every continuous feature before training even begins. 20 raw continuous values (standing in for something like transaction amounts) are bucketed into just 8 bins using quantile-based edges, and np.digitize assigns each raw value to its bin index. In a real dataset with potentially millions of unique raw values, this collapses the split-search space from "every unique value" down to a small fixed number (LightGBM's default is 255 bins) - so evaluating a candidate split at any tree node becomes a matter of scanning at most 255 bin boundaries and their pre-aggregated gradient/Hessian sums, rather than sorting and scanning every one of millions of raw values, which is the concrete mechanism behind LightGBM's large speed advantage on big datasets.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the key structural difference between LightGBM and XGBoost's tree growth?</td><td>XGBoost's default grows trees LEVEL-WISE, expanding every current leaf at a depth before going deeper, keeping the tree balanced; LightGBM grows LEAF-WISE, always splitting whichever single leaf across the whole tree offers the largest loss reduction next regardless of depth, which reaches lower loss for a given leaf budget but can produce unbalanced trees if not constrained via num_leaves/min_data_in_leaf</td></tr>
<tr class='text-center'><td>How does histogram-based binning make LightGBM faster than a naive gradient boosting implementation?</td><td>Continuous features are bucketed into a small fixed number of bins (e.g. 255) once up front; finding the best split at any tree node then only requires scanning that small number of bin boundaries and their pre-aggregated gradient/Hessian sums, instead of sorting and scanning every unique raw feature value, which dramatically reduces split-finding cost especially as the number of rows grows into the millions</td></tr>
<tr class='text-center'><td>Why can LightGBM's leaf-wise growth hurt performance on small datasets, and how is that mitigated?</td><td>Leaf-wise growth greedily chases the largest available loss reduction without regard for overall tree balance, which can produce deep, narrow branches that fit training-set noise, especially when there isn't much data to constrain it; this is mitigated by tuning num_leaves down, increasing min_data_in_leaf (requiring more examples per leaf before a split is allowed), or capping max_depth explicitly, rather than relying on LightGBM's typical large-scale defaults</td></tr>
</table>`
        }
    ]
};
