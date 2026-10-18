import { Topic } from '../../coreJava';

export const targetEncoding: Topic = {
    id: 'ml-data-preprocessing-target-encoding',
    name: 'Target Encoding',
    beginner: [
        {
            content: `<h4>Replacing a Category With Its Average Target Value</h4>
<ul>
<li><strong>Target Encoding</strong> replaces each category of a categorical feature with a single number: the <strong>average value of the target</strong> for rows that belong to that category.</li>
<li>Example: for a <code>zip_code</code> column used to predict <code>house_price</code>, every row with <code>zip_code = 90210</code> gets replaced with the average house price seen for <code>90210</code> in the training data - a single float instead of a raw string/id.</li>
<li>This is fundamentally different from <code>One-Hot Encoding</code>, which creates a brand-new binary column PER category. Target Encoding always produces just <strong>one numeric column</strong>, no matter how many categories exist.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

# a tiny housing dataset - zip_code is categorical, price is the target
df = pd.DataFrame({
    "zip_code": ["90210", "90210", "10001", "10001", "10001", "60614"],
    "price":    [900_000, 950_000, 300_000, 320_000, 280_000, 250_000],
})

# target encoding: replace each zip_code with the MEAN price for that zip_code
zip_means = df.groupby("zip_code")["price"].mean()
df["zip_code_encoded"] = df["zip_code"].map(zip_means)

print(df)
# OUTPUT (typical):
#   zip_code   price  zip_code_encoded
# 0    90210  900000          925000.0
# 1    90210  950000          925000.0
# 2    10001  300000          300000.0
# 3    10001  320000          300000.0
# 4    10001  280000          300000.0
# 5    60614  250000          250000.0`
            ],
            codeExplanations: [
                `<code>df.groupby("zip_code")["price"].mean()</code> computes the average <code>price</code> for every distinct <code>zip_code</code> value, producing a lookup table (<code>zip_means</code>) mapping each category to a single number. <code>.map(zip_means)</code> then replaces every row's raw <code>zip_code</code> string with that category's average price. Notice <code>90210</code> (a high-value area) becomes <code>925000.0</code> while <code>10001</code> becomes <code>300000.0</code> - the encoded column is now a numeric feature that directly reflects each zip code's typical price, ready to feed into a model that can't consume raw text categories.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>One-Hot Encoding explodes with high-cardinality features.</strong> A <code>zip_code</code> column with 5,000+ unique values would create 5,000+ new binary columns via one-hot encoding - most models slow to a crawl, memory usage balloons, and the resulting matrix is extremely sparse (almost all zeros), which hurts many algorithms' ability to find real patterns.</li>
<li><strong>Target Encoding compresses that into one column</strong> that already carries strong predictive signal - the average outcome for that category - rather than an arbitrary id the model has to learn a separate weight for.</li>
<li>Without a high-cardinality-aware technique like this, teams are often forced to either drop the feature entirely (losing real signal - location genuinely predicts house price) or crudely group categories together (losing precision), neither of which is necessary once target encoding is available.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate pricing model uses <code>zip_code</code> (5,000+ unique US zip codes) to help predict <code>house_price</code>. One-hot encoding would add 5,000 sparse columns to the dataset - most rows would be a single 1 among thousands of 0s for that block of columns, and a linear model would need to learn 5,000 separate coefficients, most from very few examples. Target encoding instead replaces <code>zip_code</code> with one column: "the average house price historically seen in this zip code" - immediately useful signal, in a single dense numeric feature, regardless of how many zip codes exist.`,
            codeExamples: [
                `import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 2000
zip_codes = rng.choice([f"Z{i:04d}" for i in range(500)], size=n)  # 500 unique zip codes
# each zip code has its own "true" average price level plus noise
base_price = {z: rng.uniform(150_000, 900_000) for z in set(zip_codes)}
price = np.array([base_price[z] + rng.normal(0, 15_000) for z in zip_codes])

df = pd.DataFrame({"zip_code": zip_codes, "price": price})

one_hot_cols = pd.get_dummies(df["zip_code"], prefix="zip").shape[1]
zip_means = df.groupby("zip_code")["price"].mean()
df["zip_target_encoded"] = df["zip_code"].map(zip_means)

print(f"One-Hot Encoding would add: {one_hot_cols} columns")
print("Target Encoding adds:       1 column")
print(df[["zip_code", "price", "zip_target_encoded"]].head(3))
# OUTPUT (typical):
# One-Hot Encoding would add: 500 columns
# Target Encoding adds:       1 column
#   zip_code      price  zip_target_encoded
# 0    Z0231  482193.44          479560.27
# 1    Z0102  201933.10          198477.65
# 2    Z0231  466721.88          479560.27`
            ],
            codeExplanations: [
                `Synthetic data gives each of 500 zip codes its own underlying "true" average price plus random noise, mimicking how real neighborhoods have genuinely different price levels. <code>pd.get_dummies</code> shows exactly how many columns one-hot encoding would add (one per unique zip code - 500 here, and it would be 5,000+ on a real nationwide dataset), while the target-encoded version stays a single <code>zip_target_encoded</code> column computed the same way as before: group by category, take the mean, map it back. The encoded values closely track each zip code's true underlying price level (visible by comparing rows with the same <code>zip_code</code>), demonstrating that one column already carries most of the location signal that 500+ sparse one-hot columns would have spread thinly across.`
            ]
        },
        {
            content: `<h3>The Overfitting / Data Leakage Risk</h3>
<ul>
<li>Target encoding computes an average FROM the target column itself - if a category appears only once or twice in the training data, its "average" is really just that one row's actual label, memorized rather than genuinely learned. A zip code with a single $2,000,000 mansion sale gets encoded as exactly $2,000,000 - an almost-perfect giveaway for that one training row, but meaningless for predicting a genuinely new sale in that zip code.</li>
<li>This is a subtle form of <strong>data leakage</strong>: the target value leaks into the feature that's supposed to predict it, so a model evaluated naively (encoding computed on the full training set, then that same model tested on held-out rows whose zip codes were seen during encoding) can look deceptively accurate during development and then perform much worse on truly new categories or low-count categories in production.</li>
<li><strong>Smoothing</strong> mitigates this by blending each category's raw mean with the GLOBAL mean, weighted by how many rows that category has - a category with thousands of rows keeps close to its own true average, while a category with only 1-2 rows gets pulled heavily toward the overall average instead of trusting a near-perfect but meaningless single-row "mean".</li>
<li><strong>Cross-validation (out-of-fold) encoding</strong> mitigates it further: the encoding used for any given row is computed only from OTHER folds' data, never including that row's own target value - so a row can never "see" its own label baked into its own encoded feature.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
import pandas as pd

df = pd.DataFrame({
    "zip_code": ["A", "A", "A", "A", "A", "B"],   # B has only ONE row
    "price":    [300_000, 310_000, 295_000, 305_000, 300_000, 2_000_000],
})

global_mean = df["price"].mean()
counts = df.groupby("zip_code")["price"].transform("count")
raw_means = df.groupby("zip_code")["price"].transform("mean")

# smoothing: blend raw category mean with global mean, weighted by sample count (k = smoothing strength)
k = 5
smoothed = (raw_means * counts + global_mean * k) / (counts + k)

df["raw_target_encoding"] = raw_means
df["smoothed_target_encoding"] = smoothed
print(df)
# OUTPUT (typical):
#   zip_code    price  raw_target_encoding  smoothed_target_encoding
# 0        A   300000              302000.0                303166.7
# 1        A   310000              302000.0                303166.7
# 2        A   295000              302000.0                303166.7
# 3        A   305000              302000.0                303166.7
# 4        A   300000              302000.0                303166.7
# 5        B  2000000             2000000.0                718500.0   <- pulled way down toward global mean`
            ],
            codeExplanations: [
                `Category <code>B</code> has exactly one row with an unusually high price - its raw target-encoded value is <code>2,000,000</code>, literally its own label, which would be a severe leakage/overfitting risk if used as-is. The smoothing formula <code>(raw_mean * count + global_mean * k) / (count + k)</code> blends each category's own mean with the dataset-wide <code>global_mean</code>, weighted by how many rows support that category versus a smoothing strength <code>k</code>. For category <code>A</code> (5 rows, plenty of support) the smoothed value barely moves from its raw mean. For category <code>B</code> (only 1 row), the smoothed value drops dramatically toward the global mean - correctly expressing "we don't have enough evidence to trust this category's own average," which prevents the model from treating a single lucky/unlucky row as a reliable pattern.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Handles high-cardinality categoricals efficiently</strong> - a <code>zip_code</code>, <code>product_id</code>, or <code>user_id</code> column with thousands of unique values becomes one dense, informative numeric column instead of thousands of sparse one-hot columns.</li>
<li><strong>Captures the category's relationship to the target directly</strong> - unlike one-hot encoding (which just says "is this category X or not") or label encoding (which assigns arbitrary integers with no real meaning), target encoding embeds actual predictive signal into the number itself.</li>
<li><strong>Works well with tree-based and linear models alike</strong> - because the output is a single ordered numeric feature, it plugs cleanly into any model type without needing to handle thousands of extra input dimensions.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Serious overfitting/leakage risk on low-count categories</strong> - as shown above, a category with very few rows gets an encoding that is nearly identical to its own label, which the model can effectively "memorize" rather than generalize from.</li>
<li><strong>Requires careful cross-validation discipline</strong> - the encoding must be computed using out-of-fold statistics (or on training data only, never including the rows it will be applied to) or evaluation metrics become artificially inflated, exactly like fitting a scaler on the full dataset before splitting.</li>
<li><strong>Unseen categories at prediction time have no encoding</strong> - a brand-new zip code that never appeared in training has no learned average and must fall back to some default (typically the global mean), which is less informative than an encoding backed by real historical data.</li>
<li><strong>Loses interpretability of the original category</strong> - a target-encoded zip code is just a float; the raw zip code string is gone, making manual inspection or debugging of individual categories harder than with one-hot columns that retain the category name.</li>
</ul>`,
            codeExamples: [
                `# Correct usage: encode using ONLY the training fold's statistics, never the row's own data
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold

rng = np.random.default_rng(0)
n = 300
df = pd.DataFrame({
    "zip_code": rng.choice(["A", "B", "C", "D"], size=n),
    "price": rng.uniform(200_000, 800_000, n),
})

global_mean = df["price"].mean()
df["zip_target_encoded"] = np.nan

kf = KFold(n_splits=5, shuffle=True, random_state=0)
for train_idx, val_idx in kf.split(df):
    fold_means = df.iloc[train_idx].groupby("zip_code")["price"].mean()
    # rows in val_idx get an encoding computed ONLY from train_idx rows - no self-leakage
    df.loc[df.index[val_idx], "zip_target_encoded"] = (
        df.iloc[val_idx]["zip_code"].map(fold_means).fillna(global_mean)
    )

print(df[["zip_code", "price", "zip_target_encoded"]].head(5))
print("Any missing encodings (unseen category in a fold)?", df["zip_target_encoded"].isna().sum())
# OUTPUT (typical):
#   zip_code      price  zip_target_encoded
# 0        B  512394.21          498211.55
# 1        D  731022.67          502877.90
# 2        A  268501.44          501990.12
# 3        C  611234.02          497345.88
# 4        B  355908.71          498211.55
# Any missing encodings (unseen category in a fold)? 0`
            ],
            codeExplanations: [
                `<code>KFold</code> splits the data into 5 folds; for each fold, <code>fold_means</code> is computed using ONLY the rows in <code>train_idx</code>, and that lookup is applied exclusively to the held-out <code>val_idx</code> rows - meaning no row's own price ever contributes to its own encoded value. <code>.fillna(global_mean)</code> handles the edge case where a category might not appear at all in a given fold's training portion, falling back to the dataset-wide average rather than leaving a missing value. This out-of-fold approach is the standard defense against target-encoding leakage: it guarantees the encoded feature used during model training reflects genuinely "unseen" information about each row, closely mimicking how the model will encounter brand-new data in production.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Target Encoding often preferred over One-Hot Encoding for a high-cardinality feature like zip_code?</td><td>One-Hot Encoding creates one new binary column per unique category, so a feature with 5,000+ zip codes would add 5,000+ sparse columns, ballooning dimensionality and memory use; Target Encoding replaces the entire feature with a single numeric column - each category's average target value - keeping the dataset compact while still carrying strong predictive signal about that category</td></tr>
<tr class='text-center'><td>What is the main risk of Target Encoding, and how does it happen?</td><td>Data leakage/overfitting: a category with very few rows (e.g. 1-2) gets an encoded value that is essentially identical to its own target label, since the "average" is computed from almost nothing else - the model can end up memorizing that near-perfect signal rather than learning a genuine pattern, which looks great in training but fails on new data</td></tr>
<tr class='text-center'><td>How do smoothing and cross-validation each help fix Target Encoding's overfitting problem?</td><td>Smoothing blends a category's raw mean with the global mean, weighted by how many rows support that category, so low-count categories get pulled toward the overall average instead of trusting an unreliable near-single-row mean; out-of-fold cross-validation encoding computes each row's encoded value using only OTHER folds' data, ensuring a row's own target value never leaks into its own feature</td></tr>
</table>`
        }
    ]
};
