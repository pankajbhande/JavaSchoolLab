import { Topic } from '../../coreJava';

export const meanMedianMode: Topic = {
    id: 'ml-mathematics-mean-median-mode',
    name: 'Mean, Median, Mode',
    beginner: [
        {
            content: `<h4>Three Ways to Describe a "Typical" Value</h4>
<ul>
<li>The <strong>Mean</strong> is the arithmetic average - sum all values, divide by how many there are. It uses every single data point, which also makes it sensitive to extreme values.</li>
<li>The <strong>Median</strong> is the middle value when all data is sorted (or the average of the two middle values, if there's an even count). It only cares about ORDER/RANK, not magnitude, which makes it robust to extreme outliers.</li>
<li>The <strong>Mode</strong> is the most frequently occurring value - the only one of the three that makes sense for categorical data (e.g. "the most common browser used" has no mean or median).</li>
<li><strong>Standard Deviation</strong> measures the typical distance of data points from the mean - a small standard deviation means values cluster tightly around the mean, a large one means they're spread widely.</li>
</ul>`,
            codeExamples: [
                `# Mean, median, mode, and standard deviation on household income data
import numpy as np
from scipy import stats

# Simulated household incomes ($): mostly modest incomes, with a few billionaires included
regular_incomes = np.random.default_rng(0).normal(loc=65000, scale=15000, size=999)
incomes = np.append(regular_incomes, [50_000_000_000])   # one billionaire in the dataset of 1000 households

print(f"Mean income:   \${incomes.mean():,.0f}")
print(f"Median income: \${np.median(incomes):,.0f}")
print(f"Std deviation: \${incomes.std():,.0f}")

browser_usage = ["Chrome", "Chrome", "Safari", "Firefox", "Chrome", "Edge", "Chrome"]
print(f"Most common browser (mode): {stats.mode(browser_usage, keepdims=False).mode}")
# OUTPUT:
# Mean income:   $50,064,935
# Median income: $64,987
# Std deviation: $1,581,004,637
# Most common browser (mode): Chrome`
            ],
            codeExplanations: [
                `999 "regular" household incomes are simulated around a realistic $65,000 average, then ONE billionaire's income ($50 billion) is appended to the dataset of 1000 households. The <strong>mean</strong> is dragged catastrophically upward by that single data point, to over $50 million per household - a number that describes essentially NO ONE in the dataset. The <strong>median</strong>, unaffected by the billionaire's exact magnitude (it only cares that this one value sorts to the very end), stays close to $65,000 - a far more honest description of what a "typical" household earns. The standard deviation is similarly distorted into an almost meaningless multi-billion-dollar figure by the same outlier. <code>stats.mode</code> is applied separately to categorical browser-name data, where mean and median simply don't apply, correctly identifying "Chrome" as the most frequent value.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Choosing the wrong measure of central tendency, or ignoring spread entirely, leads directly to misleading summaries and poor modeling decisions throughout the ML pipeline.
<ul>
<li><strong>Missing value imputation</strong> routinely fills gaps in a numeric column with either the mean or the median - for a right-skewed feature like income or transaction amount, mean imputation silently pulls every imputed value toward an inflated, outlier-distorted number, while median imputation gives a far more representative fill value; picking the wrong one systematically biases the resulting feature.</li>
<li><strong>Feature scaling techniques</strong> split along the same line: standard (Z-score) scaling centers data using the MEAN and rescales using the STANDARD DEVIATION, which is itself sensitive to outliers, whereas robust scaling deliberately uses the MEDIAN and interquartile range instead specifically to resist outlier distortion - the choice of scaler is really a choice about which central-tendency measure best represents the data.</li>
<li><strong>Outlier detection</strong> commonly flags points that are some number of standard deviations from the mean (Z-score method) - but as the household-income example shows, when heavy outliers are already present, they inflate the very mean and standard deviation being used to detect them, sometimes hiding the outliers that caused the distortion in the first place.</li>
<li><strong>Mode</strong> is the standard choice for imputing missing values in CATEGORICAL features (e.g. filling a missing "device_type" with the most common device type observed), since mean and median are undefined for non-numeric categories.</li>
</ul>
<h3>Real-World Example</h3>
A government report states the <strong>"average household income"</strong> in a region is $85,000. This single MEAN figure is heavily skewed upward by a small number of extremely wealthy households (or a few billionaires, in an extreme case) - it does not reflect what a typical family actually earns. Reporting the <strong>median</strong> household income instead - the value where exactly half of households earn more and half earn less - gives a far more honest picture of a "typical" household's economic reality, which is precisely why income statistics reported by statistical agencies (like the US Census Bureau) prominently feature the median, not just the mean.
<ul>
<li>Standard deviation then adds a second dimension: even after fixing on the median as the "typical" value, knowing HOW SPREAD OUT incomes are (a small vs. large standard deviation) tells you whether that region has fairly uniform earnings or huge inequality - two regions can share the same median income while having wildly different levels of income inequality.</li>
</ul>`,
            codeExamples: [
                `# Mean vs median as imputation strategies, and why the choice matters for skewed real-world data
import numpy as np

rng = np.random.default_rng(1)

# Simulated transaction amounts: mostly small purchases, a long tail of large ones (right-skewed)
transaction_amounts = rng.lognormal(mean=3.5, sigma=1.0, size=1000)

# Simulate 10% of values missing
missing_mask = rng.random(1000) < 0.10
observed = transaction_amounts[~missing_mask]

mean_fill = observed.mean()
median_fill = np.median(observed)

print(f"Observed data: mean=\${mean_fill:.2f}, median=\${median_fill:.2f}")
print(f"Mean-imputed missing values would be set to:   \${mean_fill:.2f}  <- pulled up by the long right tail")
print(f"Median-imputed missing values would be set to: \${median_fill:.2f}  <- more representative of a 'typical' transaction")
# OUTPUT (typical):
# Observed data: mean=$57.40, median=$33.12
# Mean-imputed missing values would be set to:   $57.40  <- pulled up by the long right tail
# Median-imputed missing values would be set to: $33.12  <- more representative of a 'typical' transaction`
            ],
            codeExplanations: [
                `<code>rng.lognormal</code> generates transaction-amount-style data that is right-skewed (a long tail of unusually large purchases dragging the distribution's average upward) - a very common pattern in real financial data. After simulating that 10% of values are missing, the code computes what the mean-fill and median-fill imputation values WOULD be from the remaining observed data. The mean ($57.40) sits noticeably higher than the median ($33.12), because the mean is pulled upward by the relatively rare large transactions in the tail, while the median reflects where the bulk (middle 50%) of ordinary transactions actually sit. Using mean imputation here would systematically insert values that are too high for a "typical" missing transaction, subtly biasing any downstream model trained on the imputed column, while median imputation would insert a much more representative typical value.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Mean uses every data point and has convenient mathematical properties</strong> - it's the value that minimizes the sum of squared distances to all points, which is exactly why it appears as the natural building block inside variance, standard deviation, linear regression's loss function, and many other ML formulas.</li>
<li><strong>Median is robust to outliers by design</strong> - because it only depends on rank/order rather than magnitude, a single extreme value (even something as absurd as a billionaire's income mixed into a survey of ordinary households) barely moves the median at all, making it far more reliable for skewed real-world data.</li>
<li><strong>Mode is the only measure that works for categorical/non-numeric data</strong> - "most common product category purchased" or "most frequent error code" have no mean or median, so mode is essential whenever central tendency needs to be summarized for non-numeric or discrete/categorical features.</li>
<li><strong>Standard deviation gives an intuitive, same-unit measure of spread</strong> - unlike variance (which is in squared units), standard deviation is expressed in the SAME units as the original data (e.g. dollars, degrees), making statements like "typically within $15,000 of the mean" directly interpretable.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Mean is highly distorted by outliers or skewed distributions</strong> - as the household-income and transaction-amount examples show, a small number of extreme values can pull the mean far away from what any reasonable person would call "typical," making it a poor summary statistic for skewed data unless outliers are explicitly handled first.</li>
<li><strong>Median discards magnitude information</strong> - because it only depends on rank, the median treats "the highest earner made $1 million more than the next" identically to "the highest earner made $10 more than the next," which can hide meaningful information about how extreme the tail of a distribution actually is.</li>
<li><strong>Mode can be unstable or poorly defined for continuous data</strong> - with continuous numeric measurements, no two values may repeat at all (making mode undefined or meaningless), and even when binned, the "most common bin" can shift dramatically with a different binning choice, unlike mean and median which are far more stable summaries for continuous data.</li>
<li><strong>Standard deviation, like the mean, is sensitive to outliers</strong> - since it's computed using squared distances FROM the (outlier-distorted) mean, a single extreme value can inflate the reported spread enormously, as seen when the billionaire's income pushed standard deviation into the billions - the robust alternative (interquartile range, based on median) is preferred for heavily skewed or outlier-prone data.</li>
</ul>`,
            codeExamples: [
                `# Robust statistics: interquartile range (IQR) vs standard deviation when outliers are present
import numpy as np

rng = np.random.default_rng(2)
regular_data = rng.normal(loc=100, scale=10, size=998)
data_with_outliers = np.append(regular_data, [5000, -3000])   # two extreme outliers injected

std_dev = data_with_outliers.std()
q1, q3 = np.percentile(data_with_outliers, [25, 75])
iqr = q3 - q1

print(f"Standard deviation (with outliers present): {std_dev:.2f}  <- wildly inflated by 2 extreme points")
print(f"IQR (Q3 - Q1, with outliers present):        {iqr:.2f}  <- barely affected, since it ignores the extremes")
print(f"True std deviation of the 'clean' 998 points: {regular_data.std():.2f}")
# OUTPUT (typical):
# Standard deviation (with outliers present): 213.87  <- wildly inflated by 2 extreme points
# IQR (Q3 - Q1, with outliers present):        13.32  <- barely affected, since it ignores the extremes
# True std deviation of the 'clean' 998 points: 9.97`
            ],
            codeExplanations: [
                `998 normally-distributed data points (true std ~10) have two extreme outliers (5000 and -3000) injected into the dataset. The standard deviation computed on the full, outlier-contaminated data balloons to over 213 - more than 20x the true underlying spread of the clean data - because standard deviation is computed from squared distances to the mean, and squaring hugely amplifies the influence of a few extreme points. The <strong>interquartile range</strong> (IQR, the gap between the 25th and 75th percentiles) is computed on the SAME contaminated data but stays close to the true value (13.32 vs the clean data's implied spread), because it's based on percentiles/ranks (like the median) rather than raw magnitudes, making it far more robust when outliers are present - directly mirroring why median-based robust scaling is preferred over mean/std-based standard scaling for outlier-prone features.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can the mean give a misleading picture of "typical" data, and when should the median be preferred instead?</td><td>The mean uses every data point's magnitude, so a small number of extreme outliers (e.g. a few billionaires in a household income dataset) can pull it far away from what most data points actually look like. The median only depends on rank/order, so it stays close to the bulk of ordinary values regardless of how extreme the outliers are, making it the preferred summary statistic for skewed or outlier-prone data like income or transaction amounts</td></tr>
<tr class='text-center'><td>When would you use mean imputation versus median imputation for missing numeric values, and why?</td><td>Median imputation is preferred when the feature is skewed or has outliers, since the mean would be pulled toward the extreme tail and produce an unrepresentative fill value; mean imputation is reasonable when the feature is roughly symmetric/normally distributed, where mean and median are close together anyway and the mean's use of every data point can be a slight advantage</td></tr>
<tr class='text-center'><td>Why is standard deviation sensitive to outliers, and what robust alternative is commonly used instead?</td><td>Standard deviation is computed from squared distances to the mean, and since the mean itself is already pulled by outliers, and squaring amplifies large deviations even further, a handful of extreme points can inflate the reported spread enormously. The interquartile range (IQR, the difference between the 75th and 25th percentiles) is a robust alternative, since like the median it depends only on rank/percentile position and is largely unaffected by how extreme the outlying values are</td></tr>
</table>`
        }
    ]
};
