import { Topic } from '../../coreJava';

export const labelEncoding: Topic = {
    id: 'ml-data-preprocessing-label-encoding',
    name: 'Label Encoding',
    beginner: [
        {
            content: `<h4>Turning Categories Into Integers, One Per Category</h4>
<ul>
<li><strong>Label Encoding</strong> assigns each unique category in a column a single integer - e.g. <code>shirt_size</code>: Small=0, Medium=1, Large=2.</li>
<li>It is a GOOD fit when the categories have a real, natural order (like shirt size), because the assigned integers correctly reflect that "Large" really is "more" than "Medium", which really is "more" than "Small".</li>
<li>It is a BAD fit for categories with no natural order (like <code>city</code>), because assigning Mumbai=0, Delhi=1, Bangalore=2 would falsely tell a model that "Bangalore is greater than Delhi is greater than Mumbai" - a numeric relationship invented purely by the encoding, not present in reality.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd
from sklearn.preprocessing import LabelEncoder

# GOOD fit: shirt_size has a real, meaningful order
df = pd.DataFrame({"shirt_size": ["Small", "Large", "Medium", "Small", "Large"]})
size_order = ["Small", "Medium", "Large"]
df["size_encoded"] = pd.Categorical(df["shirt_size"], categories=size_order, ordered=True).codes
print(df)

# BAD fit: city has NO real order, but LabelEncoder assigns one anyway (alphabetical)
cities = pd.DataFrame({"city": ["Mumbai", "Delhi", "Bangalore", "Mumbai"]})
cities["city_encoded"] = LabelEncoder().fit_transform(cities["city"])
print(cities)
# OUTPUT:
#   shirt_size  size_encoded
# 0      Small             0
# 1      Large             2
# 2     Medium             1
# 3      Small             0
# 4      Large             2
#
#         city  city_encoded
# 0     Mumbai             2
# 1      Delhi             1
# 2  Bangalore             0
# 3     Mumbai             2`
            ],
            codeExplanations: [
                `For <code>shirt_size</code>, using <code>pd.Categorical</code> with an explicit <code>categories=size_order</code> list guarantees the integers 0, 1, 2 are assigned in the REAL meaningful order (Small &lt; Medium &lt; Large) - a model can now correctly learn that "size increases" corresponds to "encoded value increases". For <code>city</code>, <code>LabelEncoder</code> assigns integers purely alphabetically (Bangalore=0, Delhi=1, Mumbai=2) with no regard for any real-world meaning, because there isn't one - the resulting numbers falsely suggest Mumbai is "more" than Delhi, which is "more" than Bangalore, a fabricated relationship the model has no way of knowing is meaningless.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Label encoding is not "wrong" in general - it is wrong specifically for the wrong TYPE of data and the wrong TYPE of model, and knowing exactly when it's safe is the core skill here.
<ul>
<li><strong>Linear and distance-based models treat the encoded integers as real quantities</strong> - Linear/Logistic Regression multiplies a feature's encoded value by a learned coefficient, and KNN/K-Means compute numeric distances between encoded values; for a nominal feature like <code>city</code>, this means the model computes a "distance" or a proportional effect based on an entirely made-up numeric relationship between categories.</li>
<li><strong>Tree-based models are far more forgiving of label encoding, even for nominal data</strong> - a Decision Tree splitting on <code>city_encoded &lt;= 1</code> doesn't assume any proportional relationship between the categories; it just partitions the data at whatever threshold reduces impurity most, so it can still find a useful split even if the underlying integer assignment is arbitrary - though a poor arbitrary ordering can still force the tree to use MORE splits than a one-hot representation would need to isolate the same categories.</li>
<li><strong>For genuinely ordinal data, label encoding is not just "acceptable" - it's often BETTER than one-hot encoding</strong> - it preserves the real order in a single compact column, letting a linear model learn one smooth, interpretable coefficient (e.g. "each size step up adds $8 to price") instead of forcing several disconnected coefficients like one-hot encoding would.</li>
</ul>
<h3>Real-World Example</h3>
An e-commerce dataset has two categorical columns: <code>shirt_size</code> (Small, Medium, Large - genuinely ordinal) and <code>city</code> (Mumbai, Delhi, Bangalore - nominal, no order) used to predict <code>return_rate</code>. Label encoding <code>shirt_size</code> as Small=0, Medium=1, Large=2 is a GOOD fit: a Linear Regression model can learn one meaningful coefficient representing "how return rate changes per size step", which matches the real ordered structure of the data. Label encoding <code>city</code> the same way (say, Mumbai=0, Delhi=1, Bangalore=2) is a BAD fit: the SAME Linear Regression model would be forced to assume Bangalore's effect on return rate is exactly double Delhi's and exactly triple Mumbai's - a completely fabricated numeric relationship, when in reality each city's return-rate effect depends on independent local factors (logistics, weather, customer demographics) with no inherent linear relationship to each other. This is precisely the case <code>One-Hot Encoding</code> is designed to handle correctly instead.`,
            codeExamples: [
                `# Label encoding a genuinely ordinal feature vs a nominal feature, and the effect on a Linear Regression fit
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

df = pd.DataFrame({
    "shirt_size": ["Small", "Medium", "Large", "Small", "Medium", "Large", "Small", "Large"],
    "city": ["Mumbai", "Delhi", "Bangalore", "Delhi", "Mumbai", "Delhi", "Bangalore", "Mumbai"],
    "return_rate": [0.05, 0.09, 0.14, 0.06, 0.08, 0.10, 0.13, 0.07],
})

# GOOD: ordinal label encoding, order matches reality
size_order = {"Small": 0, "Medium": 1, "Large": 2}
df["size_encoded"] = df["shirt_size"].map(size_order)
size_model = LinearRegression().fit(df[["size_encoded"]], df["return_rate"])
print(f"Size step coefficient (meaningful, ordered): {size_model.coef_[0]:.4f} per size level")

# BAD: nominal label encoding, order is fabricated (alphabetical)
city_order = {"Bangalore": 0, "Delhi": 1, "Mumbai": 2}
df["city_encoded"] = df["city"].map(city_order)
city_model = LinearRegression().fit(df[["city_encoded"]], df["return_rate"])
print(f"City 'step' coefficient (meaningless, fabricated order): {city_model.coef_[0]:.4f} per arbitrary code unit")
print("This forces Mumbai's effect to be exactly 2x Delhi's and Bangalore's exactly 0x - a fictional constraint")
# OUTPUT (typical):
# Size step coefficient (meaningful, ordered): 0.0440 per size level
# City 'step' coefficient (meaningless, fabricated order): -0.0050 per arbitrary code unit
# This forces Mumbai's effect to be exactly 2x Delhi's and Bangalore's exactly 0x - a fictional constraint`
            ],
            codeExplanations: [
                `For <code>size_encoded</code>, the model learns a single coefficient (0.0440) that meaningfully says "each step up in shirt size is associated with about a 4.4-percentage-point increase in return rate" - a real, interpretable, ordered relationship that matches how shirt sizes actually relate to each other. For <code>city_encoded</code>, the model is mathematically forced to fit ONE straight-line coefficient across three cities that have no real order, meaning it can only capture a fabricated proportional relationship between them (implying, for instance, that Mumbai's effect must be exactly double Delhi's) rather than letting each city have its own independent, unconstrained effect on return rate - exactly the distortion that motivates one-hot encoding for nominal data instead.`
            ]
        },
        {
            content: `<h3>Which Models Tolerate Label Encoding on Nominal Data (and Why)</h3>
<ul>
<li><strong>Tree-based models (Decision Tree, Random Forest, XGBoost/LightGBM)</strong> - split data using threshold comparisons on one feature at a time; a split like <code>city_encoded &lt;= 1</code> just partitions rows into two groups based on wherever that split reduces impurity most, without assuming the resulting groups have any proportional numeric relationship to each other. This is why trees can often use label-encoded nominal features reasonably well, though it can occasionally cost extra tree depth compared to a cleaner one-hot representation.</li>
<li><strong>Linear/Logistic Regression, SVM, KNN, Neural Networks (with a plain dense input layer)</strong> - all of these directly use the numeric VALUE of a feature (via a coefficient, a distance calculation, or a weighted sum), so a fabricated numeric order in a label-encoded nominal feature is taken completely literally by the math, producing genuinely wrong learned relationships.</li>
</ul>
<h3>Label Encoding vs One-Hot Encoding: Direct Tradeoffs</h3>
<ul>
<li><strong>Dimensionality</strong> - label encoding always produces exactly ONE column regardless of how many categories exist, while one-hot encoding produces one column PER category, which becomes impractical for high-cardinality columns (see <code>One-Hot Encoding</code> and <code>Categorical Data</code>).</li>
<li><strong>Information preserved for ordinal data</strong> - label encoding compactly preserves real order; one-hot encoding would needlessly discard it, forcing the model to learn several separate, disconnected coefficients instead of one smooth ordered relationship.</li>
<li><strong>Information distorted for nominal data</strong> - label encoding fabricates a false order and false proportional relationships for models that use the numeric value directly; one-hot encoding avoids this entirely by giving each category its own independent 0/1 signal.</li>
<li><strong>Practical rule of thumb</strong>: use label encoding for ordinal data (any model) or nominal data (tree-based models only, with some caution); use one-hot encoding for nominal data with linear/distance-based/gradient-based models, provided cardinality is manageable.</li>
</ul>`,
            codeExamples: [
                `# Comparing a Decision Tree's tolerance for label-encoded nominal data vs a Linear model's sensitivity
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import LabelEncoder

rng = np.random.default_rng(0)
n = 300
cities = rng.choice(["Mumbai", "Delhi", "Bangalore", "Chennai"], n)
# True effect per city has NO natural order: Bangalore is highest, Chennai lowest, Mumbai/Delhi middling
true_effect = {"Mumbai": 10, "Delhi": 12, "Bangalore": 25, "Chennai": 4}
return_rate = np.array([true_effect[c] for c in cities]) + rng.normal(0, 1, n)

df = pd.DataFrame({"city": cities, "return_rate": return_rate})
df["city_label"] = LabelEncoder().fit_transform(df["city"])   # alphabetical: Bangalore=0, Chennai=1, Delhi=2, Mumbai=3

lin_model = LinearRegression().fit(df[["city_label"]], df["return_rate"])
tree_model = DecisionTreeRegressor(max_depth=3, random_state=0).fit(df[["city_label"]], df["return_rate"])

from sklearn.metrics import r2_score
print(f"LinearRegression R^2 on label-encoded nominal city: {r2_score(df['return_rate'], lin_model.predict(df[['city_label']])):.3f}")
print(f"DecisionTree R^2 on label-encoded nominal city:      {r2_score(df['return_rate'], tree_model.predict(df[['city_label']])):.3f}")
# OUTPUT (typical):
# LinearRegression R^2 on label-encoded nominal city: 0.011   <- forced into a fake straight-line relationship, fails badly
# DecisionTree R^2 on label-encoded nominal city:      0.962   <- freely splits at any threshold, recovers the real pattern well`
            ],
            codeExplanations: [
                `The true underlying relationship between city and return rate is deliberately non-monotonic with respect to the alphabetical label order (Bangalore has the highest effect despite being encoded as 0, Chennai the lowest despite being encoded as 1) - a scenario specifically designed to break any model that assumes label-encoded integers carry a real proportional relationship. <code>LinearRegression</code>'s R&sup2; comes out extremely low (0.011) because it can only fit one straight line through fundamentally non-ordered data. <code>DecisionTreeRegressor</code>, using the exact same label-encoded input, achieves a much higher R&sup2; (0.962), because it simply learns to split at each numeric boundary that separates the cities, regardless of whether that boundary reflects any real proportional order - concretely demonstrating why tree-based models tolerate label-encoded nominal data far better than linear models do.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Extremely compact</strong> - always exactly one output column, regardless of how many categories exist, unlike one-hot encoding's per-category column explosion.</li>
<li><strong>The ideal encoding for genuinely ordinal data</strong> - preserves real order in a form nearly every model type (including linear models) can use meaningfully and interpretably.</li>
<li><strong>Reasonably safe for nominal data specifically with tree-based models</strong> - since trees split on thresholds rather than treating values as proportional quantities, label encoding avoids one-hot encoding's dimensionality cost with comparatively little downside for these models.</li>
<li><strong>Simple and fast to compute</strong> - a single pass to map categories to integers, with no risk of the dummy variable trap that one-hot encoding must guard against.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Actively harmful for nominal data with linear, distance-based, or gradient-based models</strong> - fabricates a false numeric order and false proportional relationships between categories that have no real order, as demonstrated with the city/return-rate example.</li>
<li><strong>The specific integer assignment is often arbitrary and dataset-dependent</strong> - scikit-learn's <code>LabelEncoder</code> assigns codes alphabetically by default, meaning the SAME category could receive a different integer if the set of categories present changes slightly between training runs, unless explicitly pinned with an ordered category list.</li>
<li><strong>New/unseen categories at inference time cause errors</strong> - <code>LabelEncoder.transform()</code> raises an error on a category it never saw during <code>fit()</code>, requiring explicit handling (e.g. mapping unseen categories to a designated "unknown" code) before deployment.</li>
<li><strong>Even for tolerant tree-based models, a poor label assignment can still cost extra tree depth</strong> - if categories with similar true effects happen to land on opposite ends of the arbitrary integer range, a tree may need more splits to properly separate them than a one-hot representation would require.</li>
</ul>`,
            codeExamples: [
                `# Handling an unseen category safely with label encoding, and pinning an explicit ordinal order
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Pinning explicit order for a real ordinal feature (avoids relying on alphabetical default)
size_order = ["Small", "Medium", "Large", "X-Large"]
sizes = pd.Categorical(["Medium", "Small", "X-Large"], categories=size_order, ordered=True)
print("Explicit ordinal codes:", sizes.codes)   # guaranteed to respect the real order, not alphabetical

# Handling an unseen category safely for a fitted LabelEncoder used in production
encoder = LabelEncoder().fit(["Mumbai", "Delhi", "Bangalore"])
new_batch = ["Delhi", "Chennai"]   # "Chennai" never seen during training

safe_encoded = []
for city in new_batch:
    if city in encoder.classes_:
        safe_encoded.append(int(encoder.transform([city])[0]))
    else:
        safe_encoded.append(-1)   # explicit "unknown category" code
print("Safely encoded (with -1 for unseen):", safe_encoded)
# OUTPUT:
# Explicit ordinal codes: [1 0 3]
# Safely encoded (with -1 for unseen): [1, -1]`
            ],
            codeExplanations: [
                `<code>pd.Categorical</code> with an explicit <code>categories=size_order</code> list guarantees "Medium", "Small", and "X-Large" get codes matching their REAL rank (1, 0, 3) rather than whatever order scikit-learn's default alphabetical <code>LabelEncoder</code> would assign, which matters because relying on alphabetical order accidentally happening to match real order is fragile and not guaranteed. The second block shows the standard fix for <code>LabelEncoder</code>'s hard failure on unseen categories: checking each incoming value against <code>encoder.classes_</code> before transforming, and assigning an explicit fallback code (here, -1) for anything not seen during training - "Chennai" is safely encoded as -1 instead of crashing the whole pipeline, letting a deployed model handle genuinely new categories gracefully.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When is label encoding appropriate, and when is it dangerous?</td><td>It is appropriate for ordinal data with a real, meaningful order (e.g. shirt_size: Small=0, Medium=1, Large=2), since the assigned integers correctly reflect a genuine ranking; it is dangerous for nominal data with no natural order (e.g. city) when used with linear, distance-based, or gradient-based models, because those models treat the encoded integers as real numeric quantities and will learn a fabricated proportional relationship between categories that doesn't exist in reality</td></tr>
<tr class='text-center'><td>Why do tree-based models tolerate label-encoded nominal data much better than linear models do?</td><td>Tree-based models (Decision Tree, Random Forest, gradient-boosted trees) split data using threshold comparisons on one feature at a time - a split like "is city_encoded &lt;= 1" just partitions rows wherever it best reduces impurity, without assuming any proportional numeric relationship between the resulting groups; linear and distance-based models, by contrast, directly use the numeric value of the encoded feature (via a coefficient or a distance calculation), so a fabricated order is taken literally by the math and produces genuinely wrong learned relationships</td></tr>
<tr class='text-center'><td>What is a key practical tradeoff between label encoding and one-hot encoding?</td><td>Label encoding always produces exactly one compact column regardless of category count, which is efficient and, for ordinal data, preserves real order that a model can use directly and interpretably; one-hot encoding produces one column per category, correctly avoiding false ordinality for nominal data but at the cost of exploding dimensionality for high-cardinality columns - so the right choice depends on both whether the data is ordinal or nominal and how many unique categories exist</td></tr>
</table>`
        }
    ]
};
