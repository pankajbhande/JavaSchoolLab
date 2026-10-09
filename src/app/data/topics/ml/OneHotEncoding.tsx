import { Topic } from '../../coreJava';

export const oneHotEncoding: Topic = {
    id: 'ml-data-preprocessing-one-hot-encoding',
    name: 'One-Hot Encoding',
    beginner: [
        {
            content: `<h4>Turning Categories Into Numbers Without Lying About Order</h4>
<ul>
<li>Machine learning models need numeric input, but many real columns are <strong>categorical</strong> - e.g. <code>city</code> with values like "Mumbai", "Delhi", "Bangalore". <strong>One-Hot Encoding</strong> converts a single categorical column into MULTIPLE new binary columns, one per category, where exactly one column is <code>1</code> (the category present in that row) and all others are <code>0</code>.</li>
<li>The naive alternative - <strong>Label Encoding</strong> - simply assigns each category an integer (Mumbai=1, Delhi=2, Bangalore=3). This is dangerous for categories with no natural order, because it tells the model "Bangalore > Delhi > Mumbai" numerically, a false relationship the model will try to learn from.</li>
<li>One-Hot Encoding avoids this entirely: each category gets its own independent 0/1 column, so no category is numerically "bigger" or "closer" to any other.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

df = pd.DataFrame({
    "city": ["Mumbai", "Delhi", "Bangalore", "Mumbai", "Delhi"],
    "price_lakhs": [85, 120, 95, 90, 130],
})

encoded = pd.get_dummies(df, columns=["city"])
print(encoded)
# OUTPUT:
#    price_lakhs  city_Bangalore  city_Delhi  city_Mumbai
# 0           85           False       False         True
# 1          120           False        True        False
# 2           95            True       False        False
# 3           90           False       False         True
# 4          130           False        True        False`
            ],
            codeExplanations: [
                `<code>pd.get_dummies</code> is pandas' one-hot encoding function - it looks at the <code>city</code> column, finds every unique category present ("Mumbai", "Delhi", "Bangalore"), and replaces the single <code>city</code> column with one new binary column per category (<code>city_Bangalore</code>, <code>city_Delhi</code>, <code>city_Mumbai</code>). In each row, exactly one of those three columns is <code>True</code> (1) - whichever city that row actually had - and the rest are <code>False</code> (0). No numeric ordering or distance is implied between the cities; the model simply sees three independent yes/no signals.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without one-hot encoding, the only way to feed categorical data into most models is to convert it to numbers some other way, and the obvious shortcut - label encoding with arbitrary integers - actively damages model quality for algorithms that use those numbers arithmetically.
<ul>
<li><strong>False ordinality corrupts distance and gradient calculations</strong> - if Mumbai=1, Delhi=2, Bangalore=3, a KNN model computing distance now believes Bangalore is "3 units" away from Mumbai and only "1 unit" from Delhi - a completely fabricated numeric relationship that has nothing to do with the real world, since city names have no inherent order.</li>
<li><strong>Linear models learn a nonsensical single coefficient</strong> - a Linear Regression fit on label-encoded city would learn ONE coefficient for the whole "city" column, implicitly assuming that moving from Mumbai(1) to Delhi(2) to Bangalore(3) has a consistent, additive linear effect on price - e.g. that Bangalore's effect is exactly double Delhi's - which is almost never true for unordered categories.</li>
<li>One-hot encoding fixes this at the root: because each category becomes its own independent feature, the model can freely learn a completely separate, unconstrained effect for Mumbai, Delhi, and Bangalore individually, with no artificial ordering or spacing assumption baked in.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate pricing model uses <code>city</code> (Mumbai, Delhi, Bangalore, ...) as one of its inputs to predict <code>house_price</code>. If <code>city</code> were label-encoded as Mumbai=1, Delhi=2, Bangalore=3, a Linear Regression model would be mathematically forced to treat Bangalore's price effect as "three times" Mumbai's and "1.5 times" Delhi's - a completely invented numeric relationship with no basis in reality, since the actual price differences between cities depend on local market conditions, not on which arbitrary integer a city happened to be assigned. One-hot encoding <code>city</code> into separate <code>city_Mumbai</code>, <code>city_Delhi</code>, <code>city_Bangalore</code> columns lets the model learn each city's true, independent effect on price directly from the data, with no artificial ordering assumption distorting the result.`,
            codeExamples: [
                `# Label encoding vs one-hot encoding for a city feature in a price model
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder

df = pd.DataFrame({
    "city": ["Mumbai", "Delhi", "Bangalore", "Mumbai", "Delhi", "Bangalore", "Mumbai", "Delhi"],
    "sqft": [800, 1000, 1200, 750, 1100, 1300, 900, 950],
    "price_lakhs": [95, 110, 70, 88, 118, 75, 100, 112],   # Bangalore is actually CHEAPER here, not "highest"
})

# Label encoding: Bangalore=0, Delhi=1, Mumbai=2 (alphabetical, arbitrary)
df["city_label"] = LabelEncoder().fit_transform(df["city"])
label_model = LinearRegression().fit(df[["sqft", "city_label"]], df["price_lakhs"])
print(f"Label-encoded city coefficient: {label_model.coef_[1]:.2f}  (forces one single linear effect per unit of arbitrary code)")

# One-hot encoding: each city gets its own independent coefficient
onehot = pd.get_dummies(df[["sqft", "city"]], columns=["city"], drop_first=True)  # drop_first avoids the dummy trap
onehot_model = LinearRegression().fit(onehot, df["price_lakhs"])
print("One-hot city coefficients:", dict(zip(onehot.columns[1:], np.round(onehot_model.coef_[1:], 2))))
# OUTPUT (typical):
# Label-encoded city coefficient: -3.10   <- one constrained slope, can't capture Bangalore being a special case
# One-hot city coefficients: {'city_Delhi': 20.4, 'city_Mumbai': 8.1}   <- each city's true independent effect (relative to Bangalore, the dropped baseline)`
            ],
            codeExplanations: [
                `The price data is deliberately set up so Bangalore is NOT simply "highest" or "lowest" in a way that fits a straight numeric order - it's genuinely cheaper despite alphabetically coming first. With <code>LabelEncoder</code>, city becomes a single arbitrary integer column, and <code>LinearRegression</code> is forced to learn just ONE coefficient for it, implying a constant linear effect per unit of that arbitrary code - a relationship that doesn't match the real (non-ordered) price differences between cities. With <code>pd.get_dummies</code> (one-hot encoding, using <code>drop_first=True</code> to avoid the dummy variable trap explained next), each city instead gets its OWN independent coefficient relative to the dropped baseline city (Bangalore here), letting the model freely learn that Delhi commands a real premium and Mumbai a smaller one, without any artificial ordering constraint.`
            ]
        },
        {
            content: `<h3>The Dummy Variable Trap</h3>
When one-hot encoding a categorical column with <code>k</code> categories, creating all <code>k</code> binary columns introduces <strong>perfect multicollinearity</strong>: the last category's column is always exactly derivable from the others (if you know a row is NOT Mumbai and NOT Delhi, it MUST be Bangalore) - so the <code>k</code> columns together carry only <code>k-1</code> independent pieces of information.
<ul>
<li>For models that compute a matrix inverse internally (like the closed-form / normal-equation solution to Linear Regression), this redundancy makes the underlying matrix <strong>singular (non-invertible)</strong>, or numerically unstable, causing the model to fail or produce unreliable, arbitrarily-inflated coefficients.</li>
<li>The standard fix is to <strong>drop one column</strong> per encoded feature (<code>drop_first=True</code> in <code>pd.get_dummies</code>, or <code>drop='first'</code> in scikit-learn's <code>OneHotEncoder</code>) - the dropped category becomes the implicit "baseline", and every remaining column's coefficient is interpreted relative to it.</li>
<li>This mainly matters for linear models and other algorithms sensitive to multicollinearity; tree-based models and most gradient-descent-based deep learning setups are far more tolerant of the redundant column and often keep all <code>k</code> columns without issue.</li>
</ul>
<h3>Curse of Dimensionality with High-Cardinality Columns</h3>
One-hot encoding works cleanly for a column with a handful of categories (like 3 cities), but becomes a real liability as the number of unique categories grows into the hundreds or thousands.
<ul>
<li>A column like <code>zip_code</code> (tens of thousands of unique US zip codes) or <code>product_id</code> (potentially millions of values) would explode into an equally massive number of new sparse binary columns - most of them almost entirely zero for any given row, ballooning memory use and training time.</li>
<li>This sparsity also hurts model quality: with thousands of near-empty columns, a model has very few training examples per category to learn a reliable individual effect from, making estimates noisy and increasing overfitting risk.</li>
<li><strong>Target Encoding</strong> is a common alternative for high-cardinality columns: instead of one column per category, it replaces each category with a single number - typically the mean of the target variable for that category (e.g. replace each zip code with the average house price seen in that zip code during training) - keeping dimensionality low while still capturing category-specific signal. It requires care to avoid leakage (computed only from training folds) but scales far better than one-hot encoding for very high-cardinality features.</li>
</ul>`,
            codeExamples: [
                `# The dummy variable trap: perfect multicollinearity when all k columns are kept
import numpy as np
import pandas as pd

df = pd.DataFrame({"city": ["Mumbai", "Delhi", "Bangalore", "Mumbai", "Delhi"]})

full = pd.get_dummies(df, columns=["city"]).astype(int)          # keeps all 3 columns
reduced = pd.get_dummies(df, columns=["city"], drop_first=True).astype(int)  # drops city_Bangalore

print("All columns kept:\\n", full)
print("city_Bangalore can be derived as: 1 - city_Delhi - city_Mumbai ->",
      (1 - full["city_Delhi"] - full["city_Mumbai"] == full["city_Bangalore"]).all())
print("\\nWith drop_first=True:\\n", reduced)
# OUTPUT:
# All columns kept:
#    city_Bangalore  city_Delhi  city_Mumbai
# 0               0           0            1
# 1               0           1            0
# 2               1           0            0
# 3               0           0            1
# 4               0           1            0
# city_Bangalore can be derived as: 1 - city_Delhi - city_Mumbai -> True
#
# With drop_first=True:
#    city_Delhi  city_Mumbai
# 0           0            1
# 1           1            0
# 2           0            0
# 3           0            1
# 4           1            0`
            ],
            codeExplanations: [
                `The first encoding keeps all three city columns; the printed check confirms that <code>city_Bangalore</code> is always exactly equal to <code>1 - city_Delhi - city_Mumbai</code> - proving the redundancy directly, since knowing any two of the three columns always tells you the third with certainty. That perfect linear relationship between columns is what makes the underlying feature matrix singular for models relying on matrix inversion. The second encoding, with <code>drop_first=True</code>, removes <code>city_Bangalore</code> entirely - Bangalore rows are now represented implicitly as "0 in both remaining columns" (the baseline case), eliminating the redundancy while losing no actual information about which city each row belongs to.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Eliminates false ordinality</strong> - no category is treated as numerically "greater than" or "closer to" another, correctly reflecting that categories like city names, colors, or product types have no inherent order.</li>
<li><strong>Lets a model learn a fully independent effect per category</strong> - e.g. each city can have its own separate, unconstrained impact on predicted price, rather than being forced into one linear relationship implied by an arbitrary integer code.</li>
<li><strong>Simple, well-supported, and works with virtually every ML library</strong> - <code>pandas.get_dummies</code> and scikit-learn's <code>OneHotEncoder</code> make it a one-line, well-understood transformation that fits cleanly into standard preprocessing pipelines.</li>
<li><strong>Safe default for low-to-moderate cardinality categorical features</strong> - for columns with a handful to a few dozen categories (city, product category, day of week), it reliably avoids the pitfalls of label encoding with minimal downside.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Curse of dimensionality for high-cardinality columns</strong> - a column with thousands of unique values (zip code, user ID) explodes into thousands of new sparse columns, drastically increasing memory usage and training time, and giving the model very few examples per category to learn from reliably.</li>
<li><strong>Dummy variable trap if all k columns are kept</strong> - introduces perfect multicollinearity, which destabilizes or breaks models relying on matrix inversion (like closed-form Linear Regression); must be handled by dropping one column per feature.</li>
<li><strong>New/unseen categories at inference time need explicit handling</strong> - if a category appears in production data that was never seen during training (e.g. a brand-new city), the encoder has no column for it; scikit-learn's <code>OneHotEncoder(handle_unknown='ignore')</code> must be configured deliberately, or the pipeline will error out.</li>
<li><strong>Loses any ordinal information a category might actually have</strong> - for a genuinely ordered category like <code>education_level</code> (High School &lt; Bachelor's &lt; Master's &lt; PhD), one-hot encoding throws away that real ordering information that a simpler ordinal encoding could have preserved and exploited.</li>
</ul>`,
            codeExamples: [
                `# scikit-learn's OneHotEncoder in a pipeline: handling unseen categories safely at inference time
import numpy as np
from sklearn.preprocessing import OneHotEncoder

train_cities = np.array([["Mumbai"], ["Delhi"], ["Bangalore"], ["Mumbai"]])
test_cities = np.array([["Delhi"], ["Chennai"]])   # "Chennai" never appeared in training

encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
encoder.fit(train_cities)

encoded_test = encoder.transform(test_cities)
print("Learned categories:", encoder.categories_[0])
print("Encoded test rows:\\n", encoded_test)
# OUTPUT:
# Learned categories: ['Bangalore' 'Delhi' 'Mumbai']
# Encoded test rows:
#  [[0. 1. 0.]     <- Delhi correctly encoded
#   [0. 0. 0.]]    <- Chennai (unseen) safely becomes all-zeros instead of raising an error`
            ],
            codeExplanations: [
                `The encoder is fit only on the three training cities, so it only knows about "Bangalore", "Delhi", and "Mumbai" (stored in <code>encoder.categories_</code>). At transform time, the test set includes "Chennai", a city never seen during training. With <code>handle_unknown="ignore"</code>, instead of raising an error (the default behavior), the encoder represents the unseen category as an all-zero row across every known-category column - the model receives a valid, well-formed input (rather than a crash) even though it has no learned signal specifically for Chennai, which is the standard safe way to keep a one-hot-encoded production pipeline from breaking on genuinely new category values.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is label encoding dangerous for an unordered categorical feature like city, and how does one-hot encoding fix it?</td><td>Label encoding assigns arbitrary integers (Mumbai=1, Delhi=2, Bangalore=3), which falsely implies a numeric order and consistent spacing between categories that don't actually have one - distance-based and linear models will treat that fabricated ordering as real signal; one-hot encoding instead creates one independent binary column per category, so no category is treated as numerically greater than or closer to another, and each gets its own unconstrained learned effect</td></tr>
<tr class='text-center'><td>What is the dummy variable trap, and how do you avoid it?</td><td>Encoding all k categories of a feature into k binary columns creates perfect multicollinearity - the last column is always fully derivable from the rest (e.g. if not Mumbai and not Delhi, it must be Bangalore) - which makes the feature matrix singular for models relying on matrix inversion like closed-form linear regression; the fix is to drop one column per encoded feature (drop_first=True in pandas, or drop='first' in scikit-learn's OneHotEncoder), keeping only k-1 columns with the dropped category as an implicit baseline</td></tr>
<tr class='text-center'><td>Why is one-hot encoding a poor choice for a very high-cardinality column like zip code, and what's an alternative?</td><td>A column with thousands of unique values explodes into thousands of new, mostly-empty (sparse) binary columns, ballooning memory and training time while leaving very few training examples per category to learn a reliable effect from, increasing overfitting risk; target encoding is a common alternative - it replaces each category with a single number (e.g. the mean target value for that category from training data), keeping dimensionality low while still capturing category-specific signal, though it must be computed carefully from training folds only to avoid leakage</td></tr>
</table>`
        }
    ]
};
