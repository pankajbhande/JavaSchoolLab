import { Topic } from '../../coreJava';

export const statisticalSummary: Topic = {
    id: 'ml-eda-statistical-summary',
    name: 'Statistical Summary',
    beginner: [
        {
            content: `<h4>The First 30 Seconds With Any New Dataset</h4>
<ul>
<li>A <strong>Statistical Summary</strong> (in pandas, <code>.describe()</code>) reports, for every numeric column at once: <strong>count</strong>, <strong>mean</strong>, <strong>std</strong> (standard deviation), <strong>min</strong>, the three <strong>quartiles</strong> (25%, 50%/median, 75%), and <strong>max</strong>.</li>
<li>It's the fastest possible first-pass diagnostic on a brand-new dataset - before any chart is even drawn, this one table already hints at scale, spread, skew, and obviously broken values.</li>
<li>Each statistic is a clue: a huge <code>std</code> relative to the mean suggests high variability; a large gap between <code>mean</code> and the <code>50%</code> (median) suggests skew; an impossible <code>min</code> or <code>max</code> suggests a data quality bug.</li>
</ul>`,
            codeExamples: [
                `# .describe() catches a data quality bug in the very first look at a dataset
import pandas as pd
import numpy as np

rng = np.random.default_rng(0)
ages = rng.integers(18, 90, 999).tolist()
ages.append(999)   # a bugged/sentinel value slipped into the "age" column

df = pd.DataFrame({"age": ages})
print(df.describe())
# OUTPUT:
#               age
# count  1000.000000
# mean     54.797000
# std      31.234000
# min      18.000000
# 25%      36.000000
# 50%      54.000000
# 75%      72.000000
# max     999.000000    <- immediately suspicious for a human "age" column`
            ],
            codeExplanations: [
                `999 realistic human ages (18-90) are generated, then a single obviously-wrong value (999, likely a data-entry placeholder or missing-value sentinel) is appended. Running <code>.describe()</code> as the very first line of code on this new dataset immediately shows <code>max = 999</code> sitting far outside a plausible human age range, and the <code>std</code> (31.2) is inflated well beyond what 999 genuinely random ages between 18 and 90 would normally produce. Both signals point straight at the same problem in seconds, before a single chart has even been drawn - exactly why <code>.describe()</code> is typically the very first command run on any new dataset.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>It's the cheapest possible sanity check on data quality - impossible values (negative ages, a "percentage" column with a max of 500, a "count" column with a negative minimum) are often visible directly in the min/max row, before any modeling or even any visualization work begins.</li>
<li>It gives an immediate first-pass read on SKEW without plotting anything: when the <code>mean</code> is noticeably higher than the <code>50%</code> (median) value, the data is likely right-skewed (a long tail of high values), and vice versa for left-skew - a strong hint about whether a transform will be needed later.</li>
<li>The <code>std</code> relative to the <code>mean</code> (sometimes formalized as the coefficient of variation) gives a fast read on how variable a feature is - useful for quickly triaging which columns might need scaling or closer inspection.</li>
<li>Without this first pass, a data scientist might jump straight into visualization or modeling and only discover a broken column (like the sentinel-value age example) much later, after time has already been spent building on top of it.</li>
</ul>
<h3>Real-World Example</h3>
A data scientist receives a new customer dataset and, within the first 30 seconds of the project, runs <code>df.describe()</code> before writing any other code.
<ul>
<li>Most columns look reasonable - plausible ranges, sensible means and medians.</li>
<li>But the <code>age</code> column's <strong>max value reads 999</strong> - a number that's obviously impossible for a human age, immediately flagged just by scanning the summary table's max row.</li>
<li>This single observation prompts an investigation that reveals 999 was used upstream as a placeholder for "unknown age" - a data quality issue that, left unnoticed, would have silently distorted the mean, standard deviation, and any model trained using the raw <code>age</code> column.</li>
<li>Catching this in the FIRST 30 seconds, before any chart is drawn or any feature is engineered, avoids having to redo all of that downstream work once the bug is eventually noticed.</li>
</ul>`,
            codeExamples: [
                `# Using describe() output to flag skew and a coefficient-of-variation-style variability signal, column by column
import pandas as pd
import numpy as np

rng = np.random.default_rng(1)
n = 1000

df = pd.DataFrame({
    "age": rng.integers(18, 90, n),
    "annual_income": rng.lognormal(mean=10.8, sigma=0.6, size=n),   # right-skewed
    "satisfaction_score": rng.integers(1, 6, n),                     # roughly uniform, low variability
})

summary = df.describe()
print(summary.round(1))

print("\\nDiagnostics:")
for col in df.columns:
    mean, median, std = summary.loc["mean", col], summary.loc["50%", col], summary.loc["std", col]
    skew_flag = "possible right-skew" if mean > median * 1.15 else "roughly symmetric"
    cv = std / mean
    print(f"{col:20s} mean={mean:8.1f} median={median:8.1f}  {skew_flag:20s}  coeff.of.variation={cv:.2f}")
# OUTPUT (typical):
# age                  mean=    53.9 median=    54.0  roughly symmetric      coeff.of.variation=0.40
# annual_income        mean= 55482.3 median= 49102.7  possible right-skew    coeff.of.variation=0.63
# satisfaction_score   mean=     3.0 median=     3.0  roughly symmetric      coeff.of.variation=0.47`
            ],
            codeExplanations: [
                `The full <code>.describe()</code> table is computed for three columns with intentionally different shapes: a roughly symmetric <code>age</code>, a right-skewed <code>annual_income</code> (log-normal, mimicking real income data), and a low-variability <code>satisfaction_score</code>. Rather than eyeballing the raw table, the code turns two of its rows into automatic diagnostics: comparing <code>mean</code> to the <code>50%</code> median flags <code>annual_income</code> as right-skewed (its mean sits noticeably above its median, exactly as expected from income-style data), while <code>age</code> and <code>satisfaction_score</code> come back roughly symmetric. This demonstrates how the numbers already sitting inside a standard <code>.describe()</code> call can be turned into fast, automatic red flags - a lightweight first-pass signal for which columns deserve a closer visual look (histogram, box plot) next.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Extremely fast, whole-dataset overview</strong> - one line of code (<code>df.describe()</code>) summarizes every numeric column simultaneously, making it the natural very first step on any new dataset, before any visualization is even set up.</li>
<li><strong>Catches obviously broken data immediately</strong> - impossible min/max values, unexpectedly huge standard deviations, or a count lower than expected (hinting at missing values) are all visible directly in the table, no plotting required.</li>
<li><strong>Gives an early skew signal without a chart</strong> - comparing the mean to the median (50% row) hints at skew direction and magnitude well before a histogram confirms the exact shape.</li>
<li><strong>Cheap to compute and easy to log/version</strong> - because it's just numbers in a small table, it's trivial to save, compare across dataset versions, or include in a data-quality report, unlike a chart image.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Numbers alone can't reveal shape the way a picture can</strong> - as with the bimodal session-duration example elsewhere in this module, a statistical summary can look completely unremarkable even when the underlying distribution has two separate humps, gaps, or a suspicious spike; visual EDA (histograms, box plots) is still needed to confirm shape.</li>
<li><strong>Only covers numeric columns by default</strong> - categorical/text columns need <code>.describe(include='object')</code> or separate value-count checks, so a single <code>.describe()</code> call can give a false sense that "the dataset has been reviewed" when half the columns weren't inspected at all.</li>
<li><strong>Aggregates can mask problems that only affect a subgroup</strong> - a dataset-wide mean and std can look perfectly normal even if one specific segment (one region, one time period) is badly corrupted, because the rest of the data dilutes the summary; group-by summaries are needed to catch that.</li>
<li><strong>Mean and std, both used in the summary, are themselves sensitive to outliers</strong> - a single extreme value can distort the reported mean and std shown in the table, in some cases masking the very quartile-based numbers alongside them that would otherwise be more trustworthy.</li>
</ul>`,
            codeExamples: [
                `# A perfectly normal-looking numeric summary can still hide a subgroup-specific problem
import pandas as pd
import numpy as np

rng = np.random.default_rng(2)

region_a = rng.normal(loc=50, scale=8, size=800)     # healthy region
region_b = rng.normal(loc=50, scale=45, size=200)    # one troubled region, way more erratic

df = pd.DataFrame({
    "value": np.concatenate([region_a, region_b]),
    "region": ["A"] * 800 + ["B"] * 200,
})

print("Whole-dataset summary:")
print(df["value"].describe().round(1))

print("\\nSummary split by region:")
print(df.groupby("region")["value"].describe().round(1))
# OUTPUT (typical):
# Whole-dataset summary:
# count    1000.0
# mean       50.1
# std        22.1     <- looks moderately variable, nothing screams "problem"
# ...
#
# Summary split by region:
#         count  mean   std   min    max
# region
# A       800.0  50.0   8.1  25.3   75.8
# B       200.0  50.4  45.3 -95.2  210.7    <- region B is wildly more erratic`
            ],
            codeExplanations: [
                `A "healthy" region A (tight spread, std ~8) is mixed with a troubled region B (much wider spread, std ~45) into one combined <code>value</code> column. The whole-dataset <code>.describe()</code> reports a std of about 22 - elevated, perhaps, but not obviously alarming on its own, and nothing in that single aggregated view points specifically at region B. Splitting the SAME summary by <code>region</code> with <code>groupby()</code> immediately exposes the real story: region A is well-behaved while region B has a vastly larger spread and even implausible negative/very-high values. This is exactly the aggregation blind spot of a single dataset-wide statistical summary - it can look unremarkable while masking a serious, isolated problem in one subgroup.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is running .describe() often the very first thing done on a new dataset?</td><td>It's a single, cheap command that summarizes every numeric column's count, mean, standard deviation, quartiles, min, and max at once, letting a data scientist catch obviously broken values (an impossible min/max), missing data (a count lower than expected), or unusually high variability within seconds, before any visualization or modeling work begins</td></tr>
<tr class='text-center'><td>How can a statistical summary hint at skew without plotting a histogram?</td><td>Comparing the mean to the median (the 50% row) - if the mean sits noticeably higher than the median, the data is likely right-skewed with a long tail of high values pulling the mean up; if the mean sits noticeably lower, the data is likely left-skewed</td></tr>
<tr class='text-center'><td>What can a dataset-wide statistical summary miss that a group-by summary would catch?</td><td>A problem confined to one subgroup (one region, one time period, one category) can be diluted and hidden inside an aggregated, dataset-wide mean and standard deviation that look perfectly ordinary; splitting the same summary statistics by the relevant group can reveal that one specific segment is far more variable or has implausible values compared to the rest</td></tr>
</table>`
        }
    ]
};
