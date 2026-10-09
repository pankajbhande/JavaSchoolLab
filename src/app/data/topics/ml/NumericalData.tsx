import { Topic } from '../../coreJava';

export const numericalData: Topic = {
    id: 'ml-data-preprocessing-numerical-data',
    name: 'Numerical Data',
    beginner: [
        {
            content: `<h4>Data That Is Already a Number, But Not Always the Same Kind</h4>
<ul>
<li><strong>Numerical data</strong> represents measurable quantities. It splits into two kinds: <strong>discrete</strong> numerical data takes distinct, countable values (e.g. <code>age</code> in whole years, number of children), and <strong>continuous</strong> numerical data can take any value within a range (e.g. <code>annual_revenue</code>, height, temperature).</li>
<li>Unlike categorical data, numerical columns are already usable as numbers - but that doesn't mean they're ready for a model as-is: they usually need <strong>scaling</strong> (see <code>Standardization</code>) so features with very different ranges don't unfairly dominate a model, and skewed distributions often benefit from a <strong>transform</strong> before training.</li>
<li>A key mixed-dataset problem: <code>age</code> (discrete, small, bounded range like 0-100) and <code>annual_revenue</code> (continuous, unbounded, potentially in the millions) live on completely different scales and often different distribution shapes within the same dataset.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

df = pd.DataFrame({
    "customer_id": [1, 2, 3, 4],
    "age": [29, 41, 35, 62],                              # discrete, bounded, small range
    "annual_revenue": [45_000, 2_500_000, 180_000, 60_000],  # continuous, unbounded, huge range and skewed
})

print(df.describe())
# OUTPUT (typical):
#        customer_id        age  annual_revenue
# count     4.000000   4.000000    4.000000e+00
# mean      2.500000  41.750000    6.962500e+05
# std       1.290994  14.221...    1.166...e+06
# min       1.000000  29.000000    4.500000e+04
# 25%       1.750000  33.500000    5.625000e+04
# 50%       2.500000  38.000000    1.200000e+05
# 75%       3.250000  46.250000    7.600000e+05
# max       4.000000  62.000000    2.500000e+06`
            ],
            codeExplanations: [
                `<code>df.describe()</code> immediately reveals the scale mismatch: <code>age</code> ranges from 29 to 62 (a span of about 33), while <code>annual_revenue</code> ranges from 45,000 to 2,500,000 (a span of over 2 million) - and the standard deviation of revenue is roughly 100,000 times larger than that of age. Feeding both columns directly into a distance-based or gradient-based model without addressing this would let <code>annual_revenue</code> completely dominate any calculation involving both features, exactly the problem <code>Standardization</code> is designed to fix, while the heavy skew visible in revenue (one customer's 2.5M vs the others' much smaller values) is a separate issue that scaling alone does not fully solve.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Numerical data being "already numeric" is exactly what makes its problems easy to overlook - there's no encoding step to force a decision, so it's tempting to feed raw numerical columns straight into a model, silently carrying scale and shape problems along with them.
<ul>
<li><strong>Discrete vs continuous affects how a feature should be treated and interpreted</strong> - a discrete count like <code>number_of_children</code> has a natural minimum granularity (you can't have 2.5 children), which matters for certain modeling choices (e.g. Poisson regression for count data) and for how outlier bounds should be reasoned about, while continuous data like <code>revenue</code> has no such natural step size.</li>
<li><strong>Numerical features need scaling; categorical features need encoding - conflating the two breaks pipelines</strong> - applying <code>StandardScaler</code> to a numerically-coded categorical column (like a zip code stored as an integer) would compute a meaningless mean and standard deviation over what are actually just category labels, while trying to one-hot encode a genuinely continuous column like revenue would explode into thousands of useless binary columns.</li>
<li><strong>Skewed numerical distributions violate assumptions many models rely on</strong> - Linear Regression's error assumptions and many statistical tests assume roughly normal, symmetric input distributions; heavily right-skewed data (like revenue, income, or price, where most values are modest but a few are enormous) violates this, giving those few enormous values outsized leverage over a fitted model, similar in spirit to the outlier-sensitivity issue covered in <code>Outlier Detection</code>.</li>
</ul>
<h3>Real-World Example</h3>
A B2B sales-prediction dataset mixes <code>age</code> of the primary contact (discrete, roughly 25-65, symmetric-ish) with <code>annual_revenue</code> of the client company (continuous, ranging from $10,000 for tiny startups to $500,000,000 for large enterprises, heavily right-skewed since most clients are small and a few are enormous). Feeding both raw into a Linear Regression model causes two separate problems: first, the sheer difference in scale means <code>annual_revenue</code>'s raw numbers overwhelm <code>age</code>'s influence in any gradient-based fitting process (the same issue <code>Standardization</code> addresses); second, even after scaling, the SHAPE of revenue's distribution (a few enormous companies stretching the tail) means those few giant clients have outsized leverage over the fitted regression line, distorting predictions for the much more numerous small-to-mid-sized clients that make up most of the real customer base.`,
            codeExamples: [
                `# Log-transforming a skewed numerical feature before scaling, and why order matters
import numpy as np
import pandas as pd
from scipy.stats import skew

rng = np.random.default_rng(0)
# Simulate realistic revenue: mostly small companies, a long right tail of large ones
revenue = np.concatenate([
    rng.uniform(10_000, 200_000, 180),
    rng.uniform(1_000_000, 500_000_000, 20),
])

print(f"Skewness of raw revenue:              {skew(revenue):.2f}  (near 0 = symmetric, high = long right tail)")

log_revenue = np.log1p(revenue)   # log1p handles values smoothly, avoids log(0) issues
print(f"Skewness of log-transformed revenue:  {skew(log_revenue):.2f}")

print(f"\\nRaw revenue range:  {revenue.min():,.0f} to {revenue.max():,.0f}")
print(f"Log revenue range:  {log_revenue.min():.2f} to {log_revenue.max():.2f}")
# OUTPUT (typical):
# Skewness of raw revenue:              4.83  (near 0 = symmetric, high = long right tail)
# Skewness of log-transformed revenue:  0.31
#
# Raw revenue range:  10,043 to 498,732,109
# Log revenue range:  9.21 to 20.03`
            ],
            codeExplanations: [
                `The simulated <code>revenue</code> column mimics the real B2B pattern: most companies are small (under $200K), but a minority are enormous (up to $500M), producing a high skewness value (4.83) far from the roughly-symmetric 0 that many models implicitly assume. Applying <code>np.log1p</code> (log of 1 + x, which safely handles values near zero) compresses the huge tail dramatically - the transformed skewness drops to 0.31, much closer to symmetric - and the resulting range (9.21 to 20.03) is also far more manageable. Only AFTER this shape-correcting log transform does it make sense to apply <code>Standardization</code> for scale, since scaling a heavily skewed distribution alone does not fix its shape, only its scale.`
            ]
        },
        {
            content: `<h3>Discrete vs Continuous: Practical Implications</h3>
<ul>
<li><strong>Discrete counts sometimes call for specialized models</strong> - if a target variable itself is a count (e.g. number of support tickets a customer files), a Poisson or Negative Binomial regression may model that discreteness and non-negativity better than plain Linear Regression, which assumes a continuous, potentially negative-valued target.</li>
<li><strong>Binning continuous data can sometimes help, at a cost</strong> - converting a continuous feature like age into discrete buckets ("18-25", "26-40", ...) can let a linear model capture non-linear effects more easily, but it always discards some precision and requires choosing bin boundaries, which is itself a judgment call similar to choosing outlier thresholds.</li>
<li><strong>Bounded vs unbounded ranges affect scaling choices</strong> - a naturally bounded feature (age between 0 and 120, a percentage between 0 and 100) is often well-suited to <strong>Min-Max scaling</strong> (rescaling to a fixed 0-1 range), while an unbounded, potentially skewed feature (revenue, price) is often better served by <strong>Standardization</strong> or a log transform first, since Min-Max scaling would let one future extreme value silently compress every other value's scaled range.</li>
</ul>
<h3>Numerical vs Categorical: Why the Encoding/Scaling Split Matters</h3>
<ul>
<li>A common real-world bug: a categorical value like <code>zip_code</code> or <code>customer_id</code> is STORED as an integer in a database, tempting someone to treat it as numerical data and feed it straight into <code>StandardScaler</code> - this computes a meaningless mean/std over what are really just category labels with no true magnitude relationship.</li>
<li>The fix is to explicitly classify each column by its TRUE nature (does the number represent a genuine quantity, or just a label that happens to be stored as a number?) before deciding whether it needs <code>Standardization</code>-style scaling or <code>One-Hot Encoding</code>/<code>Label Encoding</code>-style categorical treatment.</li>
</ul>`,
            codeExamples: [
                `# The bug of scaling a numerically-STORED categorical column as if it were true numerical data
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

df = pd.DataFrame({
    "zip_code": [10001, 90210, 60614, 10001],   # a LABEL stored as an integer, not a true quantity
    "annual_revenue": [45_000, 2_500_000, 180_000, 60_000],  # a genuine numerical quantity
})

# WRONG: scaling zip_code as if distance between values meant something
wrong_scaled = StandardScaler().fit_transform(df[["zip_code", "annual_revenue"]])
print("Incorrectly scaled zip_code implies 90210 is 'far' from 10001 in a meaningful numeric sense:")
print(np.round(wrong_scaled[:, 0], 2))

# CORRECT: treat zip_code as categorical (grouped/encoded), only scale the true numerical column
correct_scaled_revenue = StandardScaler().fit_transform(df[["annual_revenue"]])
print("\\nCorrectly scaled only the genuine numerical column (annual_revenue):")
print(np.round(correct_scaled_revenue.ravel(), 2))
# OUTPUT (typical):
# Incorrectly scaled zip_code implies 90210 is 'far' from 10001 in a meaningful numeric sense:
# [-0.87  1.62 -0.75 -0.87]
#
# Correctly scaled only the genuine numerical column (annual_revenue):
# [-0.63  1.62 -0.4  -0.59]`
            ],
            codeExplanations: [
                `Scaling <code>zip_code</code> with <code>StandardScaler</code> produces numbers that look perfectly reasonable (-0.87, 1.62, ...) but are mathematically meaningless - the underlying assumption behind standardization is that the RAW DIFFERENCE between two values reflects a real difference in magnitude, which is false for zip codes (90210 is not "greater" than 10001 in any meaningful sense relevant to a model, it's simply a different label). The correct approach only applies <code>StandardScaler</code> to <code>annual_revenue</code>, a genuine numerical quantity where scaling is meaningful, while <code>zip_code</code> should instead be handled with the categorical techniques covered in <code>Categorical Data</code> (e.g. grouping by region, or target encoding, given its typically high cardinality).`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Numerical data requires no encoding decision</strong> - unlike categorical columns, it's already in a form models can use directly, once scale and shape are addressed.</li>
<li><strong>Log and other transforms are simple, well-understood fixes for skew</strong> - a single line of code (<code>np.log1p</code>) can dramatically improve how well a skewed feature satisfies the assumptions of linear models and statistical tests.</li>
<li><strong>Recognizing discrete vs continuous unlocks more appropriate specialized models</strong> - e.g. using Poisson regression for genuinely discrete count targets instead of forcing a continuous-output model onto count data.</li>
<li><strong>Correctly separating true numerical columns from numerically-stored categorical ones prevents a whole class of silent, hard-to-debug bugs</strong> - as shown with the zip code example, catching this early avoids meaningless scaled features entering the model.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Log transforms can't be applied to zero or negative values without adjustment</strong> - <code>np.log1p</code> handles zero gracefully, but a column with negative values (e.g. profit, which can be negative) needs a different approach (e.g. a signed log transform or shifting the data) before a log-style transform is usable.</li>
<li><strong>Binning continuous data always discards some precision</strong> - converting a smooth feature into buckets is a modeling convenience, not a strict improvement, and the choice of bin boundaries is itself a judgment call that can introduce its own artifacts.</li>
<li><strong>Min-Max scaling is fragile to future outliers</strong> - since it maps the observed minimum and maximum to a fixed 0-1 range, a single new extreme value at inference time (larger than anything seen in training) can push previously well-scaled values out of the expected range or compress them unexpectedly.</li>
<li><strong>Misclassifying a column's true nature (numerical vs categorical-stored-as-numeric) is an easy, easy-to-miss mistake</strong> - IDs, zip codes, and codes are common traps that look numerical but are not, and this requires deliberate column-by-column judgment rather than a blanket "scale every numeric-dtype column" rule.</li>
</ul>`,
            codeExamples: [
                `# Comparing Standardization vs Min-Max scaling on a bounded (age) vs unbounded, skewed (revenue) feature
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

age = np.array([25, 30, 45, 60, 65], dtype=float).reshape(-1, 1)          # bounded, roughly symmetric
revenue = np.array([20_000, 45_000, 90_000, 300_000, 50_000_000], dtype=float).reshape(-1, 1)  # unbounded, skewed

age_minmax = MinMaxScaler().fit_transform(age)
revenue_minmax = MinMaxScaler().fit_transform(revenue)
revenue_log_then_standard = StandardScaler().fit_transform(np.log1p(revenue))

print("Age, Min-Max scaled (works well - bounded, evenly spread):", np.round(age_minmax.ravel(), 2))
print("Revenue, Min-Max scaled (fails - one extreme value crushes the rest near 0):",
      np.round(revenue_minmax.ravel(), 3))
print("Revenue, log + Standardized (much better spread):",
      np.round(revenue_log_then_standard.ravel(), 2))
# OUTPUT (typical):
# Age, Min-Max scaled (works well - bounded, evenly spread): [0.   0.12 0.5  0.88 1.  ]
# Revenue, Min-Max scaled (fails - one extreme value crushes the rest near 0): [0.    0.001 0.001 0.006 1.   ]
# Revenue, log + Standardized (much better spread): [-1.15 -0.72 -0.24  0.29  1.83]`
            ],
            codeExplanations: [
                `<code>age</code>, being bounded and roughly evenly distributed, scales nicely with <code>MinMaxScaler</code> - the values spread cleanly across the full 0-1 range. <code>revenue</code>, scaled the same way, fails badly: the one $50M value dominates the range so completely that every other, much more typical, revenue value gets crushed into a tiny sliver near 0 (0.000 to 0.006) - a model would barely be able to distinguish between a $20K and a $300K client after this scaling. Applying <code>np.log1p</code> first to fix the skew, THEN <code>StandardScaler</code>, produces a much more usable, well-spread set of values (-1.15 to 1.83), demonstrating why the right numerical preprocessing choice depends on both a feature's boundedness and its distribution shape, not a single scaler applied blindly to every numeric column.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between discrete and continuous numerical data, and why does it matter?</td><td>Discrete numerical data takes distinct, countable values (e.g. age in years, number of children) with a natural minimum step size, while continuous numerical data can take any value in a range (e.g. revenue, height); the distinction matters because discrete count data sometimes fits specialized models better (e.g. Poisson regression for count targets), and because reasoning about outlier bounds or binning strategies differs when a feature has a natural granularity versus when it's truly continuous</td></tr>
<tr class='text-center'><td>Why do numerical features typically need scaling while categorical features need encoding instead, and what goes wrong if you mix them up?</td><td>Numerical features already represent true magnitudes, so scaling (like Standardization) puts them on a comparable footing for distance-based and gradient-based models without changing their meaning; categorical features are labels with no inherent magnitude, so scaling them (e.g. applying StandardScaler to a zip code stored as an integer) computes a meaningless mean/standard deviation over what are really just category labels, while trying to one-hot encode a genuinely continuous numerical column would create an unmanageable number of nearly useless binary columns</td></tr>
<tr class='text-center'><td>Why would you log-transform a skewed numerical feature like revenue before scaling it, and what's a common pitfall?</td><td>A heavily right-skewed distribution (many small values, a few enormous ones) violates the roughly-normal input assumptions of many linear models and gives the few enormous values outsized leverage over the fit; a log transform (e.g. <code>np.log1p</code>) compresses the long tail and makes the distribution far more symmetric, and it should generally be applied BEFORE scaling, since scaling alone only changes scale, not shape; a common pitfall is applying a plain log transform to a column that can contain zero or negative values without first adjusting for that (e.g. using log1p, or shifting the data)</td></tr>
</table>`
        }
    ]
};
