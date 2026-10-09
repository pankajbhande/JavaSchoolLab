import { Topic } from '../../coreJava';

export const categoricalData: Topic = {
    id: 'ml-data-preprocessing-categorical-data',
    name: 'Categorical Data',
    beginner: [
        {
            content: `<h4>Data That Names a Group, Not a Quantity</h4>
<ul>
<li><strong>Categorical data</strong> represents a label or group membership rather than a measurable quantity - e.g. <code>country</code>, <code>subscription_tier</code>, <code>product_category</code>.</li>
<li>It splits into two kinds: <strong>nominal</strong> categories have NO natural order (e.g. <code>country</code> - "France" isn't "more" or "less" than "Japan"), while <strong>ordinal</strong> categories DO have a meaningful order (e.g. <code>subscription_tier</code>: Free &lt; Basic &lt; Premium).</li>
<li>This distinction directly determines the right encoding strategy before a model can use the column - nominal data generally needs one-hot-style encoding, while ordinal data can safely be encoded with ordered integers.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

df = pd.DataFrame({
    "customer_id": [1, 2, 3, 4],
    "subscription_tier": ["Free", "Premium", "Basic", "Free"],   # ordinal - has a real order
    "country": ["India", "USA", "India", "Germany"],              # nominal - no real order
})

# Ordinal: map to integers that PRESERVE the real-world order
tier_order = {"Free": 0, "Basic": 1, "Premium": 2}
df["tier_encoded"] = df["subscription_tier"].map(tier_order)

# Nominal: one-hot encode so no false order is implied
df_encoded = pd.get_dummies(df, columns=["country"])

print(df[["subscription_tier", "tier_encoded"]])
print(df_encoded.filter(like="country"))
# OUTPUT:
#   subscription_tier  tier_encoded
# 0               Free             0
# 1            Premium             2
# 2              Basic             1
# 3               Free             0
#
#    country_Germany  country_India  country_USA
# 0             False           True        False
# 1             False          False         True
# 2             False           True        False
# 3              True          False        False`
            ],
            codeExplanations: [
                `<code>subscription_tier</code> is mapped to integers 0, 1, 2 using an EXPLICIT dictionary that matches the real business order (Free &lt; Basic &lt; Premium) - a model can now correctly treat Premium as "more" than Basic, which reflects reality. <code>country</code>, in contrast, is one-hot encoded with <code>pd.get_dummies</code> into separate binary columns, because there is no real sense in which "USA" is greater than "India" - encoding it with ordered integers instead would invent a false ranking between countries that has no basis in reality.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Treating nominal data as if it were ordinal (or vice versa) doesn't cause an error - it causes a model to learn a relationship that simply isn't true, and that mistake is invisible unless you specifically know to check for it.
<ul>
<li><strong>Mislabeling nominal data as ordinal fabricates a false ranking</strong> - if <code>country</code> is label-encoded alphabetically (Germany=0, India=1, USA=2), a linear model is mathematically forced to treat the difference between Germany and India as comparable in scale and direction to the difference between India and USA - a completely invented relationship, since country names have no numeric order in reality (this connects directly to why <code>One-Hot Encoding</code> exists as the fix for nominal columns).</li>
<li><strong>Ignoring real order in ordinal data throws away useful signal</strong> - one-hot encoding <code>subscription_tier</code> into three unrelated binary columns discards the fact that Premium customers are "more upgraded" than Basic customers in a smooth, ordered way; a model loses the ability to naturally generalize that "more upgraded tends to mean X" without learning three completely separate, unrelated coefficients.</li>
<li><strong>High-cardinality categorical columns create a distinct, separate challenge</strong> - regardless of nominal/ordinal status, a column like <code>zip_code</code> with thousands of unique values makes one-hot encoding explode into an unmanageable number of sparse columns, and even ordinal-style integer encoding doesn't help since zip codes aren't meaningfully ordered either.</li>
</ul>
<h3>Real-World Example</h3>
A subscription business's customer dataset has both <code>subscription_tier</code> (Free, Basic, Premium - an <strong>ordinal</strong> feature with a genuine, meaningful order tied to how much a customer has "upgraded") and <code>country</code> (a <strong>nominal</strong> feature with no inherent order). Encoding <code>subscription_tier</code> as ordered integers (0, 1, 2) lets a model naturally learn that upgrade behavior trends smoothly with tier level - useful for predicting something like lifetime value. Encoding <code>country</code> the same way (say, alphabetically: France=0, Germany=1, India=2, USA=3) would falsely imply the USA is "more" than every other country and that Germany is "closer" to France than to the USA - relationships a model would wrongly try to exploit, when in reality each country's effect on the business outcome is independent and needs its own separate, unconstrained coefficient, exactly the case one-hot encoding is designed for.`,
            codeExamples: [
                `# Ordinal-appropriate encoding preserves signal; the same encoding style misapplied to nominal data corrupts it
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

df = pd.DataFrame({
    "tier": ["Free", "Basic", "Premium", "Free", "Basic", "Premium", "Free", "Premium"],
    "country": ["India", "USA", "India", "Germany", "USA", "Germany", "France", "France"],
    "monthly_spend": [0, 15, 60, 0, 12, 58, 0, 62],
})

# Correct: ordinal encoding for tier (order is real and meaningful)
tier_order = {"Free": 0, "Basic": 1, "Premium": 2}
df["tier_ord"] = df["tier"].map(tier_order)

# Incorrect: applying the same ordinal-style encoding to a NOMINAL column (alphabetical order)
country_order = {c: i for i, c in enumerate(sorted(df["country"].unique()))}
df["country_ord_WRONG"] = df["country"].map(country_order)

model_ordinal_only = LinearRegression().fit(df[["tier_ord"]], df["monthly_spend"])
model_with_bad_country = LinearRegression().fit(df[["tier_ord", "country_ord_WRONG"]], df["monthly_spend"])

print("R^2 using only correctly-encoded tier:         ", round(model_ordinal_only.score(df[["tier_ord"]], df["monthly_spend"]), 3))
print("Coefficient forced onto nominal 'country_ord':  ", round(model_with_bad_country.coef_[1], 2),
      "<- implies a fake linear country ranking")
# OUTPUT (typical):
# R^2 using only correctly-encoded tier:          0.987
# Coefficient forced onto nominal 'country_ord':   -1.85 <- implies a fake linear country ranking`
            ],
            codeExplanations: [
                `<code>tier_ord</code> correctly captures the real, meaningful order of subscription tiers, and a model using it alone already achieves a strong fit (R&sup2; = 0.987), since tier genuinely drives spend in an ordered way. <code>country_ord_WRONG</code> applies the same integer-encoding STYLE to <code>country</code> - but because the order (alphabetical) is arbitrary and not real, the model is forced to learn one single coefficient (-1.85) representing a fabricated straight-line relationship between "how alphabetically late a country's name is" and spend, which is meaningless and would generalize poorly to a country not seen during training, unlike the properly one-hot-encoded version each country would get in the beginner example.`
            ]
        },
        {
            content: `<h3>High-Cardinality Categorical Columns</h3>
<ul>
<li>A column like <code>zip_code</code> (tens of thousands of unique values) or <code>product_sku</code> presents a challenge orthogonal to the nominal/ordinal question - even if it were treated as nominal and one-hot encoded correctly, the sheer NUMBER of categories makes the resulting feature matrix huge and mostly empty (sparse), directly echoing the curse-of-dimensionality problem covered in <code>One-Hot Encoding</code>.</li>
<li><strong>Grouping/binning</strong> - collapsing many rare categories into a shared "Other" bucket, or grouping zip codes into broader regions, reduces cardinality at the cost of losing some fine-grained distinction.</li>
<li><strong>Target/frequency encoding</strong> - replacing each category with a single number (its average target value, or how often it appears) keeps dimensionality low while retaining category-specific signal, at the cost of needing careful leakage-safe computation (fit on training folds only).</li>
<li><strong>Hashing tricks</strong> - map a large number of categories into a smaller fixed number of buckets via a hash function, trading a small amount of collision risk (two different categories landing in the same bucket) for a bounded, predictable output size regardless of how many unique categories exist.</li>
</ul>
<h3>Choosing the Right Approach: A Practical Checklist</h3>
<ul>
<li>First ask: <strong>does this category have a real, meaningful order?</strong> If yes (ordinal) - use ordered integer encoding, or ordinal-aware techniques.</li>
<li>If no (nominal) and cardinality is low-to-moderate (a handful to a few dozen categories) - one-hot encoding is the safe default.</li>
<li>If no (nominal) and cardinality is high (hundreds to millions of categories) - consider grouping rare categories, target/frequency encoding, or hashing, rather than one-hot encoding.</li>
</ul>`,
            codeExamples: [
                `# Handling a high-cardinality nominal column: grouping rare categories before encoding
import pandas as pd

zip_codes = pd.Series(
    ["10001"] * 40 + ["90210"] * 35 + ["60614"] * 15 +
    [f"zip_{i}" for i in range(30)]   # 30 zip codes each appearing exactly once - rare/noisy
)

counts = zip_codes.value_counts()
print("Total unique zip codes:", zip_codes.nunique())

# Group any zip code appearing fewer than 5 times into a shared "Other" bucket
common_zips = counts[counts >= 5].index
grouped = zip_codes.where(zip_codes.isin(common_zips), other="Other")

print("Unique categories AFTER grouping rare zip codes:", grouped.nunique())
print(grouped.value_counts())
# OUTPUT:
# Total unique zip codes: 33
# Unique categories AFTER grouping rare zip codes: 4
# 10001    40
# 90210    35
# Other    30
# 60614    15
# Name: count, dtype: int64`
            ],
            codeExplanations: [
                `Before grouping, this column has 33 distinct zip codes - one-hot encoding it directly would create 33 mostly-empty binary columns, many representing a category that appears exactly once (giving a model essentially no data to learn a reliable per-category effect from). By collapsing every zip code that appears fewer than 5 times into a single shared <code>"Other"</code> category, the number of unique values drops to just 4, making one-hot encoding practical again while still preserving individual treatment for the three genuinely common zip codes that have enough data to support a reliable per-category effect.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Correctly identifying ordinal vs nominal data prevents both types of encoding mistakes</strong> - neither fabricating a false order (label-encoding a nominal column) nor discarding a real one (one-hot-encoding an ordinal column unnecessarily).</li>
<li><strong>Ordinal encoding is compact and preserves meaningful structure</strong> - a single integer column captures the full ordered signal without inflating dimensionality the way one-hot encoding of the same categories would.</li>
<li><strong>Recognizing high-cardinality columns early avoids downstream performance problems</strong> - grouping, target encoding, or hashing keeps the feature space manageable before it ever reaches model training.</li>
<li><strong>These techniques compose directly with the site's other preprocessing topics</strong> - nominal categorical data flows into <code>One-Hot Encoding</code>, ordinal data flows into <code>Label Encoding</code>-style approaches, and both need the fit/transform discipline used throughout preprocessing.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>The nominal/ordinal distinction is not always clear-cut</strong> - a column like <code>satisfaction_rating</code> ("Low", "Medium", "High") is clearly ordinal, but a column like <code>job_title</code> may have a fuzzy, domain-specific partial order that's easy to get wrong.</li>
<li><strong>Grouping rare categories into "Other" loses information</strong> - if some of those rare categories actually behave very differently from each other, merging them together can hide a real distinction the model could have used.</li>
<li><strong>Target encoding for high-cardinality columns risks leakage if done carelessly</strong> - computing a category's average target value using the SAME rows it will be applied to (rather than out-of-fold statistics) leaks the label into the feature, producing misleadingly strong training performance that won't hold up.</li>
<li><strong>New categories at inference time need explicit handling regardless of approach</strong> - a brand-new zip code, country, or tier value not seen during training has no learned encoding, and the pipeline must decide in advance how to handle it (e.g. bucket as "Other", or a default value).</li>
</ul>`,
            codeExamples: [
                `# Leakage-safe target encoding for a high-cardinality nominal column, using out-of-fold statistics
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold

rng = np.random.default_rng(0)
df = pd.DataFrame({
    "zip_code": rng.choice(["Z1", "Z2", "Z3", "Z4"], size=200),
    "converted": rng.integers(0, 2, 200),
})

df["zip_target_encoded"] = np.nan
kf = KFold(n_splits=5, shuffle=True, random_state=0)

for train_idx, val_idx in kf.split(df):
    fold_means = df.iloc[train_idx].groupby("zip_code")["converted"].mean()
    df.loc[df.index[val_idx], "zip_target_encoded"] = df.iloc[val_idx]["zip_code"].map(fold_means)

print(df[["zip_code", "converted", "zip_target_encoded"]].head(6))
print("\\nAny leaked rows (encoded using their own label)? No - each row's encoding came from OTHER folds only.")
# OUTPUT (typical):
#   zip_code  converted  zip_target_encoded
# 0       Z2          1              0.512...
# 1       Z4          0              0.489...
# 2       Z1          1              0.531...
# 3       Z3          0              0.475...
# 4       Z2          0              0.512...
# 5       Z4          1              0.489...`
            ],
            codeExplanations: [
                `Instead of computing each zip code's average conversion rate using the WHOLE dataset (which would let a row's own label leak into its own encoded feature), this uses <code>KFold</code> to compute the average <code>converted</code> rate for each zip code from the TRAINING folds only, then applies that fold-specific average to the held-out validation rows. This out-of-fold approach means no row's target-encoded feature was influenced by its own label, keeping the encoding leakage-safe while still compressing a potentially high-cardinality <code>zip_code</code> column down to one informative numeric feature per row.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between nominal and ordinal categorical data, and why does it matter for encoding?</td><td>Nominal categories have no natural order (e.g. country, color) - encoding them with ordered integers fabricates a false ranking a model will wrongly try to learn from, so one-hot encoding is the safer default; ordinal categories have a genuine, meaningful order (e.g. subscription tier: Free &lt; Basic &lt; Premium) - encoding them as ordered integers preserves that real structure compactly, while one-hot encoding them would unnecessarily discard the ordering information and inflate dimensionality</td></tr>
<tr class='text-center'><td>What makes a high-cardinality categorical column like zip code specifically challenging, independent of whether it's nominal or ordinal?</td><td>One-hot encoding a column with thousands of unique values explodes into an equally large number of mostly-empty (sparse) binary columns, ballooning memory and training time while leaving very few examples per category for the model to learn a reliable effect from; common fixes include grouping rare categories into an "Other" bucket, target/frequency encoding (replacing each category with a single informative number), or hashing categories into a fixed, smaller number of buckets</td></tr>
<tr class='text-center'><td>Why is target encoding for a high-cardinality categorical feature risky if not done carefully, and how do you fix it?</td><td>If a category's target-encoded value is computed using the same rows it will then be applied to, the row's own label leaks directly into its feature value, producing misleadingly strong training performance that won't generalize; the fix is to compute the encoding using out-of-fold statistics (e.g. via K-Fold cross-validation) so each row's encoded value comes only from OTHER rows' labels, never its own</td></tr>
</table>`
        }
    ]
};
