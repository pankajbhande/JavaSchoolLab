import { Topic } from '../../coreJava';

export const univariateAnalysis: Topic = {
    id: 'ml-eda-univariate-analysis',
    name: 'Univariate Analysis',
    beginner: [
        {
            content: `<h4>Looking at One Column at a Time</h4>
<ul>
<li><strong>Univariate Analysis</strong> examines a SINGLE variable in isolation, before looking at how it relates to anything else. It's always the first step in Exploratory Data Analysis (EDA), because a model built on a column you don't understand yet is a model built on guesswork.</li>
<li>For a <strong>numerical</strong> column, univariate analysis means checking central tendency (mean, median), spread (standard deviation, range, IQR), and shape (histogram, box plot).</li>
<li>For a <strong>categorical</strong> column, it means checking value counts and their proportions (bar chart), since mean/median don't apply to categories.</li>
<li>The goal isn't just to describe the column - it's to catch surprises (skew, multiple peaks, rare categories, impossible values) early, before they quietly corrupt every model built on top of them.</li>
</ul>`,
            codeExamples: [
                `# Univariate analysis of a single "customer age" column, before touching any other variable
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)

# Simulate a customer base with two distinct groups: students (~20) and retirees (~68)
students = rng.normal(loc=20, scale=2, size=500)
retirees = rng.normal(loc=68, scale=4, size=500)
age = pd.Series(np.concatenate([students, retirees]), name="age")

print(age.describe())
print()
print(f"Skewness: {age.skew():.3f}")
# OUTPUT (typical):
# count    1000.000000
# mean       44.02...
# std        23.9...
# min        13.1...
# 25%        20.4...
# 50%        44.0...
# 75%        67.6...
# max        79.8...
# Name: age, dtype: float64
#
# Skewness: -0.02   <- near zero, which HIDES the fact that this is actually two separate clusters, not one smooth spread`
            ],
            codeExplanations: [
                `Only ONE column, <code>age</code>, is examined here - no other variable is involved yet, which is the defining feature of univariate analysis. <code>.describe()</code> reports the standard numeric summary (mean, std, quartiles), and at first glance the numbers look like an ordinary, moderately spread-out age column: mean around 44, a plausible-looking std of 24. But the mean of 44 and a skewness near zero are both misleading - they describe a population that isn't actually clustered around 44 at all. The dataset was deliberately built from TWO separate groups (students around 20, retirees around 68), and summary statistics alone completely hide that structure - the number 44 doesn't describe a single real customer in the dataset. This is exactly why univariate analysis must include a look at SHAPE (a histogram), not just summary numbers, which the next example shows.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Skipping univariate analysis - or replacing it with a glance at summary statistics only - means the very first assumptions a model makes about a column can be silently wrong.
<ul>
<li><strong>Summary statistics alone can hide multimodal structure.</strong> As the age example shows, a mean of 44 and a "normal-looking" standard deviation describe a column that is actually two separate clusters (students and retirees) with almost nobody actually near 44 - a histogram reveals this instantly, while <code>.describe()</code> alone completely conceals it.</li>
<li><strong>It determines which preprocessing steps even make sense.</strong> If univariate analysis shows a numeric column is heavily skewed, that flags a candidate for a log transform; if it shows a categorical column has one dominant category and dozens of rare ones, that flags a candidate for grouping rare categories into "Other" before one-hot encoding explodes the feature space.</li>
<li><strong>It's the only way to catch impossible or corrupted values early.</strong> A univariate check of a "delivery_days" column immediately surfaces a max of -5 or 9999 - values that would otherwise sit quietly inside averages and confuse a model into learning nonsense patterns.</li>
<li><strong>It sets the baseline before any relationship is examined.</strong> Bivariate and multivariate analysis (examined between two or more variables) are only meaningful once each variable's own individual behavior is understood - you can't correctly interpret "does age relate to spending" if you don't first know that "age" itself is secretly bimodal.</li>
</ul>
<h3>Real-World Example</h3>
A retail analyst examines the <strong>"customer age"</strong> column in isolation, before looking at how age relates to purchase amount, product category, or anything else. Plotting a histogram (rather than trusting the mean alone) reveals the distribution is clearly <strong>bimodal</strong> - one cluster of customers around age 20 (mostly students) and another around age 68 (mostly retirees), with very few customers actually near the mean of 44.
<ul>
<li>This single univariate discovery changes the modeling strategy before any relationship analysis even begins: treating "age" as one smooth numeric feature would blur two genuinely different customer segments together, whereas recognizing the two clusters suggests either segmenting customers first, or engineering a categorical "age group" feature that respects the natural split.</li>
</ul>`,
            codeExamples: [
                `# Visual univariate analysis reveals what summary statistics hid: a bimodal distribution
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
students = rng.normal(loc=20, scale=2, size=500)
retirees = rng.normal(loc=68, scale=4, size=500)
age = pd.Series(np.concatenate([students, retirees]), name="age")

plt.figure(figsize=(6, 4))
plt.hist(age, bins=30, color="steelblue", edgecolor="white")
plt.axvline(age.mean(), color="red", linestyle="--", label=f"mean = {age.mean():.1f}")
plt.title("Customer Age - Univariate Distribution")
plt.xlabel("age")
plt.legend()
plt.show()

# Categorical univariate analysis, for comparison: value counts, not mean/std
device_type = pd.Series(rng.choice(
    ["mobile", "desktop", "tablet"], size=1000, p=[0.65, 0.30, 0.05]
))
print(device_type.value_counts(normalize=True))
# OUTPUT:
# A histogram with two clearly separate humps, one near age 20 and one near age 68 - the
# red dashed "mean" line at 44 sits in the EMPTY valley between them, visually proving the
# mean is not a "typical" value for this column at all.
#
# mobile     0.652
# desktop    0.297
# tablet     0.051
# Name: proportion, dtype: float64`
            ],
            codeExplanations: [
                `The histogram is the key univariate tool that summary statistics alone can't replace: plotting <code>age</code> as a distribution (rather than reducing it to a single mean/std pair) makes the bimodal shape immediately visible as two separate humps, with the red mean line landing in the empty gap between them - visual proof that "44" is not representative of any real customer. The second half switches to a <strong>categorical</strong> column, <code>device_type</code>: since mean and median are undefined for categories, univariate analysis instead uses <code>.value_counts(normalize=True)</code> to show the proportion of each category, immediately revealing that "tablet" is a rare category (5.1%) that might need special handling (e.g. grouping into "Other") before modeling - the categorical equivalent of the numeric histogram check.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Cheap and fast to compute.</strong> A histogram, a bar chart, or <code>.describe()</code> takes seconds even on large datasets, making univariate analysis a near-zero-cost first step that should be run on every single column before any modeling begins.</li>
<li><strong>Catches data quality issues in isolation, with no ambiguity about cause.</strong> An impossible value (age = 150, delivery_days = -5) is immediately attributable to that one column - there's no confusion about whether the problem lies in the variable itself or in its relationship with something else, unlike bivariate anomalies which can be harder to trace.</li>
<li><strong>Directly informs per-column preprocessing decisions.</strong> Seeing a right-skewed numeric column flags a log-transform candidate; seeing a categorical column dominated by one value flags a near-constant feature that may add little predictive value.</li>
<li><strong>Provides the essential baseline for every later analysis stage.</strong> Bivariate and multivariate analysis only make sense in light of what's already known about each variable individually - discovering "age is bimodal" first is what makes a later finding like "age relates to spending differently in each cluster" interpretable rather than confusing.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>It can never reveal relationships between variables.</strong> Univariate analysis of "age" alone and "spending" alone would never show that older customers spend more on certain categories - that requires bivariate analysis; treating univariate findings as the whole picture risks missing the interactions that often matter most for prediction.</li>
<li><strong>Summary statistics can still mislead even within a single variable if shape isn't checked.</strong> As the age example shows, relying on mean/std/skewness numbers without ever plotting a histogram would have missed the bimodal structure entirely - the numeric summary looked unremarkable.</li>
<li><strong>Binning choices affect what a histogram appears to show.</strong> Too few bins can smooth away a real second peak; too many bins can make ordinary sampling noise look like meaningful multimodal structure, so histogram-based conclusions should be checked across a few different bin counts.</li>
<li><strong>It doesn't scale well as a manual process across hundreds of columns.</strong> Wide datasets (hundreds or thousands of features) make it impractical to manually eyeball every histogram and bar chart, requiring automated summary reports or dimensionality reduction before univariate review becomes feasible again.</li>
</ul>`,
            codeExamples: [
                `# Automating univariate analysis across every column in a wide dataset
import numpy as np
import pandas as pd

rng = np.random.default_rng(3)
df = pd.DataFrame({
    "age": np.concatenate([rng.normal(20, 2, 500), rng.normal(68, 4, 500)]),
    "income": rng.lognormal(mean=10.5, sigma=0.6, size=1000),
    "device_type": rng.choice(["mobile", "desktop", "tablet"], size=1000, p=[0.65, 0.30, 0.05]),
})

for col in df.columns:
    if pd.api.types.is_numeric_dtype(df[col]):
        print(f"{col:12s} numeric   skew={df[col].skew():+.2f}  min={df[col].min():.1f}  max={df[col].max():.1f}")
    else:
        top = df[col].value_counts(normalize=True).idxmax()
        top_share = df[col].value_counts(normalize=True).max()
        print(f"{col:12s} category  most common='{top}' ({top_share:.0%} of rows)")
# OUTPUT (typical):
# age          numeric   skew=-0.02  min=13.4  max=79.9
# income       numeric   skew=+2.10  min=8300.1  max=210554.7
# device_type  category  most common='mobile' (65% of rows)`
            ],
            codeExplanations: [
                `This loop mimics an automated univariate-analysis pass across an entire dataset, which is exactly how it's done in practice on wide, real-world tables where manually plotting every column isn't feasible. Each column is routed to the appropriate summary based on its type: numeric columns get skewness plus min/max (flagging <code>income</code>'s strongly positive skew of +2.10 as a log-transform candidate, and cheaply surfacing any impossible min/max values), while the categorical <code>device_type</code> column gets its dominant category and share instead, since mean/skew don't apply. Note that even this automated pass reports <code>age</code>'s skew as near zero (-0.02), the same trap as before - which is exactly why an automated numeric summary should still be paired with at least a quick histogram check on columns intended for serious feature engineering, not relied on alone.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is univariate analysis, and why is it always performed before bivariate or multivariate analysis?</td><td>Univariate analysis examines a single variable in isolation - its central tendency, spread, and shape for numeric columns, or its value counts for categorical columns. It comes first because understanding relationships between variables (bivariate/multivariate analysis) is only meaningful once each variable's own individual behavior is already understood; discovering a variable is bimodal or skewed changes how any later relationship involving it should be interpreted</td></tr>
<tr class='text-center'><td>Why can a mean and standard deviation look completely unremarkable even when the underlying data has serious structure, like being bimodal?</td><td>Mean and standard deviation summarize a distribution with just two numbers, which can look "normal" even when the actual shape is two separate clusters with almost nothing near the mean - as with a customer age column that's really two groups (students around 20, retirees around 68) averaging to a mean of 44 where hardly any customer actually sits. A histogram or box plot is needed to catch this, since numeric summaries alone can hide multimodal shape</td></tr>
<tr class='text-center'><td>How does univariate analysis differ between a numerical column and a categorical column?</td><td>For numerical columns, it involves computing summary statistics (mean, median, std, quartiles) and visualizing shape with a histogram or box plot. For categorical columns, mean/median are undefined, so it instead involves counting how often each category occurs (value_counts) and visualizing with a bar chart, with particular attention to whether any category is rare enough to need special handling before encoding</td></tr>
</table>`
        }
    ]
};
