import { Topic } from '../../coreJava';

export const catBoost: Topic = {
    id: 'ml-classification-catboost',
    name: 'CatBoost',
    beginner: [
        {
            content: `<h4>Gradient Boosting Built Around Categorical Features</h4>
<ul>
<li><strong>CatBoost</strong> (Categorical Boosting), from Yandex, is a gradient-boosting implementation designed from the ground up to handle CATEGORICAL features natively and well - columns like city, product category, or browser type - without requiring manual one-hot or target encoding first.</li>
<li>Its trees are also structurally different: CatBoost builds <strong>symmetric (oblivious) trees</strong>, where every node at the same depth uses the SAME split condition across the whole tree, unlike XGBoost/LightGBM's trees where each node can split on a different feature/threshold.</li>
<li>Because of its native categorical handling and sensible defaults, CatBoost is often described as needing LESS hyperparameter tuning than XGBoost or LightGBM to get strong results out of the box.</li>
</ul>`,
            codeExamples: [
                `from catboost import CatBoostClassifier
import pandas as pd

# A small dataset with a genuine categorical column - no encoding needed
data = pd.DataFrame({
    "city": ["Mumbai", "Delhi", "Mumbai", "Bangalore", "Delhi", "Bangalore", "Mumbai", "Delhi"],
    "income": [45000, 62000, 48000, 71000, 55000, 68000, 51000, 59000],
    "bought": [0, 1, 0, 1, 1, 1, 0, 0]
})

X = data[["city", "income"]]
y = data["bought"]

model = CatBoostClassifier(iterations=100, depth=3, verbose=False, random_state=0)
model.fit(X, y, cat_features=["city"])   # tell CatBoost which column is categorical - that's it

print("Predictions:", model.predict(X).ravel())
# OUTPUT (typical):
# Predictions: [0 1 0 1 1 1 0 0]`
            ],
            codeExplanations: [
                `The "city" column is a genuine categorical feature with no natural numeric ordering (Mumbai isn't "less than" Delhi). Rather than one-hot encoding it into separate binary columns first, the raw string column is passed directly to fit() along with cat_features=["city"], which tells CatBoost exactly which columns to treat with its native categorical-handling algorithm. Internally, CatBoost converts the categorical values into numeric statistics using a special ordered-encoding scheme (covered below) rather than naive one-hot encoding, entirely automatically - the practitioner only needs to declare which columns are categorical, not preprocess them.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>The most common way to handle categorical features for gradient boosting is either one-hot encoding (which explodes into hundreds or thousands of sparse columns for high-cardinality features like "product category" or "user ID") or TARGET encoding (replacing each category with the average target value for that category) - but naive target encoding has a serious flaw: it uses the SAME rows' target values both to compute the encoding AND to train on, which leaks target information into the features and can cause severe overfitting, especially for rare categories.</li>
<li>CatBoost's key innovation is <strong>ordered target statistics</strong>: instead of computing a category's average target using ALL rows (leaking the current row's own target into its own feature), it computes the statistic using only rows that came BEFORE the current one in a randomly permuted order - mimicking how a model would genuinely only have access to past data at prediction time, entirely avoiding the leakage that naive target encoding introduces.</li>
<li>CatBoost's <strong>symmetric (oblivious) trees</strong> - where every node at a given depth shares the same split - are also a deliberate structural choice: they're faster to evaluate at prediction time (the whole path can be computed as a simple lookup) and act as a natural regularizer, since the same-depth-same-split constraint reduces the model's flexibility to overfit compared to fully flexible tree structures.</li>
</ul>
<h3>Real-World Example: A Dataset Dominated by High-Cardinality Categoricals</h3>
An e-commerce recommendation or churn-prediction model has features like city, product category, and user ID (potentially hundreds of thousands of distinct values) sitting alongside a handful of numeric features.
<ul>
<li>One-hot encoding "user ID" would create hundreds of thousands of new sparse columns, exploding both memory usage and training time for XGBoost or LightGBM - clearly impractical.</li>
<li>Naive target encoding ("average churn rate for this user ID") would be fit almost perfectly to each user's own historical outcome, since most users have very few historical rows - a direct target leak that causes severe overfitting on rare categories.</li>
<li>CatBoost's ordered target statistics compute each category's encoding using only "earlier" rows in a random ordering, avoiding this leakage while still capturing genuinely useful signal (e.g. "this product category tends to have a higher return rate"), which is why CatBoost consistently outperforms manually one-hot/target-encoded XGBoost on datasets dominated by high-cardinality categorical features.</li>
</ul>`,
            codeExamples: [
                `# CatBoost's native categorical handling vs XGBoost + naive target encoding, on high-cardinality data
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(0)
n = 4000
user_id = rng.integers(0, 800, n).astype(str)     # high-cardinality categorical, ~800 distinct users
product_category = rng.integers(0, 30, n).astype(str)
price = rng.exponential(40, n)

# true churn signal comes mostly from price, with mild per-user noise
churn = ((price > 60) & (rng.random(n) < 0.7)).astype(int)

df = pd.DataFrame({"user_id": user_id, "product_category": product_category, "price": price})
train_df, test_df, y_train, y_test = train_test_split(df, churn, test_size=0.25, random_state=0)

cat_model = CatBoostClassifier(iterations=200, depth=4, verbose=False, random_state=0)
cat_model.fit(train_df, y_train, cat_features=["user_id", "product_category"])
cat_auc = roc_auc_score(y_test, cat_model.predict_proba(test_df)[:, 1])

# naive target encoding for XGBoost: mean churn rate per user_id, computed on the FULL training set (leaky)
target_means = train_df.assign(churn=y_train).groupby("user_id")["churn"].mean()
train_encoded = train_df.copy()
train_encoded["user_id"] = train_df["user_id"].map(target_means)
test_encoded = test_df.copy()
test_encoded["user_id"] = test_df["user_id"].map(target_means).fillna(y_train.mean())
train_encoded["product_category"] = train_encoded["product_category"].astype(int)
test_encoded["product_category"] = test_encoded["product_category"].astype(int)

xgb_model = xgb.XGBClassifier(n_estimators=200, max_depth=4, random_state=0)
xgb_model.fit(train_encoded, y_train)
xgb_auc = roc_auc_score(y_test, xgb_model.predict_proba(test_encoded)[:, 1])

print(f"CatBoost (native categorical handling) ROC-AUC: {cat_auc:.3f}")
print(f"XGBoost (naive target-encoded)         ROC-AUC: {xgb_auc:.3f}")
# OUTPUT (typical):
# CatBoost (native categorical handling) ROC-AUC: 0.891
# XGBoost (naive target-encoded)         ROC-AUC: 0.847`
            ],
            codeExplanations: [
                `This simulates a churn dataset with two high-cardinality-ish categorical columns (user_id with 800 distinct values, product_category with 30) where the real signal is mostly driven by price, not the categorical columns themselves. CatBoost is given the raw categorical columns directly via cat_features, letting its internal ordered target statistics compute safe, leakage-resistant encodings automatically. For XGBoost, a naive target encoding is manually built - each user_id is replaced with its mean churn rate computed from the FULL training set - which leaks each user's own outcome into their own encoded feature value, especially damaging for users with very few rows. Comparing ROC-AUC on the held-out test set shows CatBoost's native, leakage-aware handling generalizing noticeably better than XGBoost paired with naive target encoding, which is exactly the scenario CatBoost's ordered-statistics approach was designed to solve.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Best-in-class native categorical feature handling</strong> - ordered target statistics avoid the target-leakage problem of naive target encoding while still capturing genuine per-category signal, without the memory explosion of one-hot encoding high-cardinality columns.</li>
<li><strong>Often needs less hyperparameter tuning</strong> - CatBoost's defaults (including automatic handling of categorical encoding, and built-in overfitting detection via early stopping on a validation set) are tuned to work well out of the box, reducing the tuning burden compared to XGBoost/LightGBM.</li>
<li><strong>Symmetric trees are fast at prediction time</strong> - because every node at a given depth shares the same split condition, a prediction can be computed as a simple, uniform lookup across the tree's structure, making inference notably fast - valuable for low-latency production serving.</li>
<li><strong>Reduced overfitting risk from tree symmetry</strong> - the oblivious-tree constraint acts as an implicit regularizer, since it restricts the space of possible tree structures compared to fully flexible per-node splits.</li>
<li><strong>Good default handling of overfitting via ordered boosting</strong> - CatBoost also offers an "ordered boosting" mode that reduces the subtle target leakage that can occur even in the boosting process itself (not just in categorical encoding), which further reduces the need for aggressive manual regularization tuning.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Symmetric trees are less flexible per split</strong> - forcing every node at a depth to share the same split can occasionally miss a locally-optimal split that a fully flexible tree (XGBoost/LightGBM) would find, trading some raw expressiveness for speed and regularization.</li>
<li><strong>Can be slower to train than LightGBM on very large, mostly-numeric datasets</strong> - CatBoost's ordered-statistics machinery and symmetric-tree construction add overhead that pays off most clearly when categorical features dominate; on huge, purely numeric datasets, LightGBM's leaf-wise histogram approach can train faster.</li>
<li><strong>Smaller ecosystem and community than XGBoost</strong> - despite strong performance, CatBoost has less third-party tooling, fewer Kaggle-kernel examples, and a smaller hiring/knowledge pool than the more established XGBoost.</li>
<li><strong>GPU training setup can be less mature/flexible in some environments</strong> - compared to XGBoost/LightGBM's more broadly battle-tested GPU support, though CatBoost's own GPU implementation is fast when it applies cleanly.</li>
</ul>`,
            codeExamples: [
                `# Symmetric (oblivious) trees: every node at a given depth in a CatBoost tree shares one split
from catboost import CatBoostClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

model = CatBoostClassifier(iterations=50, depth=3, verbose=False, random_state=0)
model.fit(X_train, y_train)

# Inspect the very first tree's structure: CatBoost exposes the shared per-depth split conditions
tree_splits = model.plot_tree(tree_idx=0) if hasattr(model, "plot_tree") else None
first_tree_leaf_values = model.get_leaf_values() if hasattr(model, "get_leaf_values") else None

print(f"Test accuracy: {model.score(X_test, y_test):.3f}")
print(f"Number of trees actually built: {model.tree_count_}")
print("Each tree of depth 3 has exactly 2^3 = 8 leaves, because every node at a given "
      "depth shares the same split condition across the whole tree (symmetric/oblivious).")
# OUTPUT (typical):
# Test accuracy: 0.972
# Number of trees actually built: 50
# Each tree of depth 3 has exactly 2^3 = 8 leaves, because every node at a given depth
# shares the same split condition across the whole tree (symmetric/oblivious).`
            ],
            codeExplanations: [
                `This trains a CatBoostClassifier with a fixed depth=3 and highlights a structural fact unique to CatBoost's symmetric trees: because every node at the same depth uses the identical split condition, a depth-3 tree always has EXACTLY 2^3 = 8 leaves, no more and no fewer - there's no such thing as an "unbalanced" CatBoost tree the way there can be with XGBoost's or LightGBM's per-node-flexible trees. model.tree_count_ confirms the ensemble built the requested 50 trees. This rigid, predictable structure is precisely what makes CatBoost's symmetric trees fast to evaluate (the same lookup pattern applies uniformly) and acts as a built-in regularizer, at the cost of the flexibility a non-symmetric tree would have to fit an oddly-shaped local pattern.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Ordered Target Statistics and Oblivious Trees</h3>
<ul>
<li><strong>Ordered Target Statistics</strong>: for each categorical value, CatBoost computes a numeric encoding as an average of the target, but crucially only using rows that appear BEFORE the current row in a randomly generated permutation of the training data - formally, for row <code>i</code> in permutation order, the encoding uses only rows <code>1...i-1</code> sharing that category. This mimics genuine "no future information" causality and is repeated across several random permutations to reduce variance, entirely avoiding the target leakage a naive full-dataset average would introduce.</li>
<li><strong>Ordered Boosting</strong> extends the same "no peeking at your own future" principle to the boosting process itself: computing the residual/gradient for a given row using a model that was NOT trained on that row (via the permutation scheme), which reduces a subtler form of target leakage called "prediction shift" that standard gradient boosting can suffer from.</li>
<li><strong>Symmetric (Oblivious) Trees</strong>: at each depth of the tree, ONE feature and ONE threshold are chosen and applied identically to every node at that depth, rather than choosing a separate best split for each node independently. This means a depth-D tree always has exactly 2^D leaves, and any input's path through the tree can be computed as a fixed sequence of D yes/no checks combined into a direct leaf-index lookup, making prediction extremely fast.</li>
</ul>`,
            codeExamples: [
                `# Manually illustrating ordered target statistics vs naive (leaky) target encoding
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
data = pd.DataFrame({
    "category": ["A", "B", "A", "A", "B", "B", "A", "B"],
    "target":   [1,   0,   1,   0,   1,   0,   1,   1]
})

# Naive target encoding: uses ALL rows (including the row's own target) - leaky
naive_encoding = data.groupby("category")["target"].transform("mean")

# Ordered target statistic: for each row, only use rows BEFORE it (in this fixed order) sharing its category
ordered_encoding = []
for i in range(len(data)):
    prior_rows = data.iloc[:i]
    same_cat_prior = prior_rows[prior_rows["category"] == data.iloc[i]["category"]]
    if len(same_cat_prior) == 0:
        ordered_encoding.append(data["target"].mean())  # global prior for the very first occurrence
    else:
        ordered_encoding.append(same_cat_prior["target"].mean())

data["naive_encoding"] = naive_encoding.round(3)
data["ordered_encoding"] = np.round(ordered_encoding, 3)
print(data)
# OUTPUT (typical):
#   category  target  naive_encoding  ordered_encoding
# 0        A       1           0.750             0.625   <- first "A": uses global mean, not its own target
# 1        B       0           0.500             0.625
# 2        A       1           0.750             1.000   <- uses only the prior "A" row (target=1)
# 3        A       0           0.750             1.000   <- uses only prior "A" rows (both target=1)
# 4        B       1           0.500             0.000   <- uses only the prior "B" row (target=0)
# 5        B       0           0.500             0.500
# 6        A       1           0.750             0.667
# 7        B       1           0.500             0.333`
            ],
            codeExplanations: [
                `The naive_encoding column uses groupby(...).transform("mean"), which computes each category's average target using ALL rows of that category, including the row's OWN target value - so row 0 (an "A" with target=1) has its encoding influenced by its own known outcome, a direct information leak. The ordered_encoding column instead walks through the rows in a fixed order and, for each row, only looks at PRIOR rows sharing the same category - the very first "A" (row 0) has no prior "A" rows at all, so it falls back to the overall global mean, genuinely reflecting "no information yet" rather than peeking at its own answer. This is a simplified single-permutation version of what CatBoost does internally across multiple random permutations of the data, and it's precisely this leakage-avoidance mechanism that lets CatBoost use raw categorical columns safely and effectively without one-hot encoding.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does CatBoost handle categorical features natively, and why does that avoid target leakage?</td><td>It computes "ordered target statistics" - for each row, a category's numeric encoding is the average target using only rows that come BEFORE it in a randomly permuted order, never the row's own target or later rows; this mimics genuine "no future information" causality, unlike naive target encoding which averages the target over ALL rows of a category (including the current row's own outcome), leaking information and causing overfitting especially on rare categories</td></tr>
<tr class='text-center'><td>What is a symmetric (oblivious) tree, and what's the tradeoff compared to XGBoost/LightGBM's trees?</td><td>Every node at a given depth in a CatBoost tree uses the SAME split feature and threshold across the whole tree, so a depth-D tree always has exactly 2^D leaves; this makes prediction very fast (a fixed sequence of checks maps directly to a leaf) and acts as an implicit regularizer, but trades away some flexibility since XGBoost/LightGBM can choose a different best split independently at every node, occasionally fitting local patterns a symmetric tree would miss</td></tr>
<tr class='text-center'><td>Why is CatBoost often said to need less hyperparameter tuning than XGBoost or LightGBM?</td><td>Its native categorical handling removes the need to manually choose and tune an encoding scheme (one-hot vs target encoding vs something else), its ordered boosting reduces a subtle prediction-shift form of overfitting that standard gradient boosting can suffer from, and its default settings (including built-in overfitting detection) are tuned to work well without extensive manual search - though it can still benefit from tuning depth, learning rate, and iterations for best results on a specific dataset</td></tr>
</table>`
        }
    ]
};
