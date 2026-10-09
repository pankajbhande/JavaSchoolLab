import { Topic } from '../../coreJava';

export const distributionAnalysis: Topic = {
    id: 'ml-eda-distribution-analysis',
    name: 'Distribution Analysis',
    beginner: [
        {
            content: `<h4>Examining the SHAPE of a Variable</h4>
<ul>
<li><strong>Distribution Analysis</strong> looks specifically at the SHAPE of a variable's values - is it symmetric, skewed to one side, has multiple peaks (multimodal), or spread evenly (uniform)?</li>
<li>It goes deeper than basic univariate summary statistics: two columns can share the exact same mean and standard deviation while having completely different shapes, and shape is often what matters most for choosing preprocessing and models.</li>
<li>A <strong>symmetric</strong> distribution (like the classic bell curve) has its mean, median, and mode roughly equal. A <strong>skewed</strong> distribution has a long tail pulling to one side - <strong>right-skewed</strong> (long tail toward high values, mean > median) or <strong>left-skewed</strong> (long tail toward low values, mean < median).</li>
<li>Histograms and density plots (KDE plots) are the primary tools for examining shape; skewness and kurtosis statistics quantify it numerically.</li>
</ul>`,
            codeExamples: [
                `# Distribution analysis: transaction amounts turn out to be heavily right-skewed
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)

# Most purchases are small, a long tail of occasional large purchases
transaction_amount = rng.lognormal(mean=3.2, sigma=1.1, size=2000)
s = pd.Series(transaction_amount, name="transaction_amount")

print(f"Mean:   \${s.mean():.2f}")
print(f"Median: \${s.median():.2f}")
print(f"Skewness: {s.skew():.2f}")
# OUTPUT (typical):
# Mean:   $42.18
# Median: $24.55
# Skewness: 3.87   <- strongly positive (right-skewed): a long tail of large transactions
#                     pulls the mean well above the median`
            ],
            codeExplanations: [
                `<code>rng.lognormal</code> simulates realistic transaction-amount data: most purchases cluster at small values, with a long tail of occasionally very large ones. The gap between mean ($42.18) and median ($24.55) is the first clue about shape - when the mean sits noticeably above the median, the distribution is being pulled rightward by a tail of large values. The skewness statistic (3.87, far from zero) confirms and quantifies this numerically: a strongly right-skewed shape. This single distribution-analysis finding - not just "the average is $42" but "the shape is heavily right-skewed" - is what would prompt an analyst to consider a log transform before feeding this column into a model that assumes roughly normal, symmetric input.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
The SHAPE of a variable's distribution - not just its mean or spread - directly determines which preprocessing steps and which models are appropriate, and skipping this check leads to models trained on data they don't actually match the assumptions of.
<ul>
<li><strong>Skewed features often need a transform before certain models perform well.</strong> Linear regression, and any technique that assumes roughly normal residuals or uses distance-based calculations sensitive to scale (like k-nearest neighbors or k-means), tends to perform poorly on heavily skewed raw features - a log transform (or Box-Cox/Yeo-Johnson) can make the shape far more symmetric, directly ties to the site's <strong>Feature Transformation</strong> and <strong>Normal Distribution</strong> topics.</li>
<li><strong>Multimodal shape is a warning sign to treat with suspicion, not just transform away.</strong> A column with two or more distinct peaks (like the bimodal "customer age" example in Univariate Analysis) usually signals that the data actually contains two or more different underlying populations mixed together - the right fix is often segmenting the data or adding a categorical feature that captures the split, not applying a transform that assumes one smooth population.</li>
<li><strong>Distribution shape informs which summary statistics are trustworthy.</strong> As covered in the site's Mean/Median/Mode topic, the mean is a poor "typical value" for a heavily skewed distribution - distribution analysis is precisely the step that reveals whether that caution even applies to a given column.</li>
<li><strong>Tree-based models are largely indifferent to skew, so distribution analysis also informs when NOT to bother transforming.</strong> Decision trees and their ensembles (random forests, gradient boosting) split on thresholds and are invariant to monotonic transforms, so knowing a downstream model is tree-based can mean a discovered skew safely doesn't need fixing at all - a time-saving decision only possible once the shape has actually been examined.</li>
</ul>
<h3>Real-World Example</h3>
An analyst examines the SHAPE of the <strong>"transaction amount"</strong> column and discovers it is heavily <strong>right-skewed</strong>: the vast majority of purchases are small, with a long tail of occasional large transactions dragging the mean well above the median. A linear regression model trained directly on this raw column performs poorly, with residuals that violate the model's normality assumptions.
<ul>
<li>Applying a <strong>log transform</strong> to the column - <code>log(1 + transaction_amount)</code> - compresses the long right tail and pulls the distribution's shape much closer to symmetric/normal, directly addressing the exact problem the distribution-analysis step diagnosed. Only after examining shape (not just computing mean/std) does the correct fix - transform, not just "clean the data more" - become obvious.</li>
</ul>`,
            codeExamples: [
                `# Diagnosing shape with skewness/kurtosis, then confirming a log transform fixes it
import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(1)
transaction_amount = rng.lognormal(mean=3.2, sigma=1.1, size=2000)

raw_skew = stats.skew(transaction_amount)
raw_kurtosis = stats.kurtosis(transaction_amount)

log_amount = np.log1p(transaction_amount)   # log(1 + x), safe even if x could be 0
log_skew = stats.skew(log_amount)
log_kurtosis = stats.kurtosis(log_amount)

print(f"Raw:            skew={raw_skew:.2f}  kurtosis={raw_kurtosis:.2f}")
print(f"After log1p:    skew={log_skew:.2f}  kurtosis={log_kurtosis:.2f}")
# OUTPUT (typical):
# Raw:            skew=3.62  kurtosis=25.41   <- heavily right-skewed with a very heavy tail
# After log1p:    skew=0.03  kurtosis=-0.08   <- now nearly symmetric, close to a normal shape`
            ],
            codeExplanations: [
                `<strong>Skewness</strong> quantifies asymmetry (0 = symmetric, positive = right tail, negative = left tail), and <strong>kurtosis</strong> quantifies how heavy a distribution's tails are relative to a normal distribution (0 = normal-like tails, high = heavier/more extreme tails). The raw transaction data shows both a strongly positive skew (3.62) and very heavy tails (kurtosis 25.41), numerically confirming the right-skewed shape suspected from the histogram. After applying <code>np.log1p</code> (log of 1+x, which safely handles values at or near zero), both statistics collapse close to zero - skew of 0.03 and kurtosis of -0.08 - meaning the transformed column now closely resembles a symmetric, normal-like shape. This before/after comparison is exactly how distribution analysis both diagnoses a problem (shape check) and verifies a fix (re-checking shape after a transform), rather than transforming blindly and hoping it helped.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Diagnoses the RIGHT preprocessing fix, rather than guessing.</strong> Knowing precisely that a column is right-skewed (not just "the model isn't working well") points directly at a log or Box-Cox transform as the fix, rather than trial-and-error preprocessing.</li>
<li><strong>Prevents wasted effort transforming data that doesn't need it.</strong> Confirming a feature's distribution is already roughly symmetric, or confirming the downstream model is tree-based and transform-invariant, can save the effort of unnecessary preprocessing.</li>
<li><strong>Catches multimodal populations that a transform would only paper over.</strong> Distribution analysis distinguishes "this needs a mathematical transform" (skew) from "this is actually two different populations mixed together" (multimodal) - two very different problems that call for very different fixes.</li>
<li><strong>Numeric skewness/kurtosis statistics scale to automated checks across many columns.</strong> Unlike manually eyeballing every histogram, skewness and kurtosis can be computed and thresholded programmatically to flag which of hundreds of columns are worth a closer visual look.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Skewness and kurtosis are themselves sensitive to outliers.</strong> A handful of extreme values can inflate skewness and kurtosis dramatically even if the bulk of the distribution is fairly well-behaved, so these statistics should be interpreted alongside a visual check (histogram), not read in isolation.</li>
<li><strong>A transform that fixes shape can hurt interpretability.</strong> After a log transform, a linear model's coefficient represents "effect on log(transaction amount)," which is less immediately intuitive to a business stakeholder than a coefficient in the original dollar units - a real cost that has to be weighed against the improved model fit.</li>
<li><strong>No single transform fixes every shape problem.</strong> A log transform helps right-skewed, strictly positive data, but is the wrong tool for left-skewed data, bimodal data, or data containing negative or zero values without adjustment (like <code>log1p</code>'s "+1" workaround) - the choice of transform still requires judgment based on what distribution analysis reveals.</li>
<li><strong>Distribution shape can change between training and future data (distribution shift).</strong> A transform or model tuned to a distribution's shape at training time can degrade if the real-world data's shape drifts over time (e.g. a change in typical purchase size), so distribution analysis is not a one-time check but one worth periodically repeating in production.</li>
</ul>`,
            codeExamples: [
                `# Automated distribution-shape screening across multiple columns, flagging which need a transform
import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(2)
df = pd.DataFrame({
    "transaction_amount": rng.lognormal(mean=3.2, sigma=1.1, size=1000),   # right-skewed
    "customer_satisfaction": rng.normal(loc=7.5, scale=1.0, size=1000),     # roughly symmetric
    "wait_time_minutes": rng.exponential(scale=5, size=1000),               # right-skewed, different shape
})

SKEW_THRESHOLD = 1.0
for col in df.columns:
    skew = stats.skew(df[col])
    flag = "NEEDS TRANSFORM CHECK" if abs(skew) > SKEW_THRESHOLD else "roughly symmetric, likely fine as-is"
    print(f"{col:22s} skew={skew:+.2f}  -> {flag}")
# OUTPUT (typical):
# transaction_amount    skew=+3.51  -> NEEDS TRANSFORM CHECK
# customer_satisfaction skew=+0.02  -> roughly symmetric, likely fine as-is
# wait_time_minutes     skew=+1.98  -> NEEDS TRANSFORM CHECK`
            ],
            codeExplanations: [
                `This shows how distribution analysis scales beyond eyeballing one histogram at a time: a simple skewness threshold (here, absolute skew greater than 1.0) is applied programmatically across every column, automatically flagging <code>transaction_amount</code> and <code>wait_time_minutes</code> as candidates worth a closer look and a possible transform, while leaving <code>customer_satisfaction</code> (already roughly symmetric) alone. This is a practical middle ground between manually inspecting every histogram (thorough but slow) and never checking shape at all (fast but risky) - the threshold approach quickly narrows attention to the columns where distribution shape is actually likely to matter for modeling.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is distribution analysis, and why is examining a variable's shape more informative than just checking its mean and standard deviation?</td><td>Distribution analysis examines the SHAPE of a variable's values - symmetric, skewed, multimodal, or uniform - using tools like histograms, skewness, and kurtosis. Two columns can share an identical mean and standard deviation while having completely different shapes (e.g. one symmetric, one heavily skewed), and shape is what actually determines which preprocessing steps and models are appropriate, so relying on mean/std alone can miss the information that matters most</td></tr>
<tr class='text-center'><td>What does it mean for a distribution to be right-skewed, and what's a common fix?</td><td>A right-skewed distribution has a long tail of unusually large values pulling the mean above the median, common in data like transaction amounts or wait times. A log transform (or log1p to safely handle zero/near-zero values) is a common fix, since it compresses the long tail and pulls the shape closer to symmetric/normal, which helps models that assume roughly normal input or use scale-sensitive distance calculations</td></tr>
<tr class='text-center'><td>If a column's distribution turns out to be multimodal (multiple peaks), why is applying a mathematical transform usually the wrong fix?</td><td>A multimodal shape usually signals the column actually contains two or more distinct underlying populations mixed together (e.g. a bimodal age column mixing students and retirees), not a single skewed population. A mathematical transform like log or Box-Cox assumes one smooth underlying distribution and would not merge or separate the populations correctly; the more appropriate fix is typically segmenting the data or engineering a categorical feature that captures the split</td></tr>
</table>`
        }
    ]
};
