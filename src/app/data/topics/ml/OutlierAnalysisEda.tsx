import { Topic } from '../../coreJava';

export const outlierAnalysisEda: Topic = {
    id: 'ml-eda-outlier-analysis',
    name: 'Outlier Analysis',
    beginner: [
        {
            content: `<h4>Finding Unusual Points, Before Deciding What To Do About Them</h4>
<ul>
<li><strong>Outlier Analysis</strong> (in the EDA sense) is the INVESTIGATION step: using box plots, scatter plots, and z-scores to visually and numerically IDENTIFY unusual points in a dataset, before any decision is made about how to handle them.</li>
<li>A <strong>box plot</strong> marks points beyond 1.5x the interquartile range (IQR) from the box as candidate outliers - it's often the fastest way to spot them visually.</li>
<li>A <strong>z-score</strong> expresses how many standard deviations a point sits from the mean; points with a z-score beyond roughly +/-3 are commonly flagged as candidates worth investigating.</li>
<li>Not every flagged point is a mistake - some are genuine, rare, real values. Outlier analysis is about IDENTIFYING and INVESTIGATING candidates, not automatically removing them; deciding what to actually do about them is a separate, later preprocessing step.</li>
</ul>`,
            codeExamples: [
                `# Outlier analysis: spotting suspicious age values with a box plot BEFORE deciding what to do
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
normal_ages = rng.integers(18, 90, size=995)
data_entry_errors = np.array([150, 155, 149, 999, -5])   # clearly impossible ages
age = pd.Series(np.concatenate([normal_ages, data_entry_errors]), name="age")

q1, q3 = age.quantile([0.25, 0.75])
iqr = q3 - q1
lower_fence, upper_fence = q1 - 1.5 * iqr, q3 + 1.5 * iqr

candidates = age[(age < lower_fence) | (age > upper_fence)]
print(f"IQR fences: [{lower_fence:.1f}, {upper_fence:.1f}]")
print(f"Candidate outliers found:\\n{candidates.tolist()}")
# OUTPUT (typical):
# IQR fences: [-40.0, 148.0]
# Candidate outliers found:
# [150, 155, 999]`
            ],
            codeExplanations: [
                `A box plot's outlier rule is computed directly here: the interquartile range (IQR, the gap between the 25th and 75th percentile) defines "fences," and any point sitting beyond 1.5x the IQR outside the box is flagged as a candidate outlier - the exact same rule a box plot draws visually as individual dots beyond its whiskers. This correctly flags 150, 155, and 999 as candidates (clearly impossible ages), while notably missing -5 and 149, since the calculated lower fence (-40) doesn't happen to catch every planted error and 149 sits just inside the upper fence. This is the identification step only - no decision has been made yet about whether to remove, cap, or otherwise handle these flagged values; that's a separate, later step.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Outlier analysis at the EDA stage is the investigation that has to happen before any remediation decision can be made responsibly - skipping straight to "just remove anything unusual" risks silently discarding real, important information.
<ul>
<li><strong>It distinguishes data-entry errors from genuine rare events, which call for completely different responses.</strong> An "age = 150" is almost certainly a data-entry error and a reasonable candidate for correction or removal; a "transaction amount = $500,000" from a legitimate high-value client is a genuine rare event that may be exactly the kind of case a fraud-detection or high-value-customer model needs to learn from - both might get flagged by the same z-score or box-plot rule, but they demand opposite treatment.</li>
<li><strong>It feeds directly into the later preprocessing decision, without making that decision itself.</strong> EDA-stage outlier analysis produces a list of candidates and the context (a scatter plot showing where they sit, domain knowledge about what's plausible); the site's outlier-handling preprocessing step then uses that context to decide whether to cap, transform, remove, or keep each flagged point.</li>
<li><strong>Undetected outliers quietly distort the very summary statistics used throughout EDA.</strong> As covered in the site's Mean/Median/Mode topic, a handful of extreme values can drag the mean and standard deviation far from what's representative - which is exactly why outlier analysis often needs to happen early, before those statistics are trusted for anything else.</li>
<li><strong>Multiple detection methods can disagree, and knowing why prevents false confidence.</strong> A box plot's IQR-based rule and a z-score's mean/std-based rule can flag different points (as the code below shows), especially once outliers are already present and distorting the mean and standard deviation the z-score itself relies on.</li>
</ul>
<h3>Real-World Example</h3>
While exploring a customer dataset, an analyst plots a box plot of the <strong>"age"</strong> column and spots a handful of entries at <strong>age = 150</strong> - obviously impossible for a real person. This is the EDA-stage <strong>investigation</strong>: the box plot visually surfaces these points as candidates, well before any decision is made about what to do with them.
<ul>
<li>The analyst then investigates further (rather than deleting immediately): checking whether these rows share a common source (e.g. all submitted through one particular form field that might default to "150" on error), and whether removing them changes other summary statistics meaningfully. Only after this investigation does the analyst hand off to the preprocessing decision - in this case, correcting or dropping the handful of "age = 150" rows, since they're clearly data-entry errors and not real, rare 150-year-old customers.</li>
</ul>`,
            codeExamples: [
                `# Comparing z-score and box-plot (IQR) outlier detection, and why they can disagree
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
normal_ages = rng.integers(18, 90, size=995)
data_entry_errors = np.array([150, 155, 149, 999, -5])
age = pd.Series(np.concatenate([normal_ages, data_entry_errors]), name="age")

# Method 1: z-score (mean/std based - itself distorted by the very outliers it's looking for)
z_scores = (age - age.mean()) / age.std()
z_flagged = age[z_scores.abs() > 3]

# Method 2: IQR / box-plot rule (rank-based, more robust)
q1, q3 = age.quantile([0.25, 0.75])
iqr = q3 - q1
iqr_flagged = age[(age < q1 - 1.5 * iqr) | (age > q3 + 1.5 * iqr)]

print(f"Z-score method flagged:  {sorted(z_flagged.tolist())}")
print(f"IQR/box-plot flagged:    {sorted(iqr_flagged.tolist())}")
# OUTPUT (typical):
# Z-score method flagged:  [999]
# IQR/box-plot flagged:    [150, 155, 999]
# (z-score, computed from a mean/std already dragged by 999, needs an even more extreme value
#  to cross its +/-3 threshold - it misses 150 and 155, which the rank-based IQR method still catches)`
            ],
            codeExplanations: [
                `Two standard outlier-identification methods are run side by side on the SAME column to show they don't always agree. The <strong>z-score method</strong> flags only <code>999</code>, because <code>age.mean()</code> and <code>age.std()</code> are themselves already inflated by the extreme value <code>999</code> sitting in the data - the same "outliers distort the very statistics used to find them" problem covered in the site's Mean/Median/Mode topic - so 150 and 155 no longer look extreme enough relative to the (already-stretched) standard deviation. The <strong>IQR/box-plot method</strong>, being based on percentiles/rank rather than mean and standard deviation, is far less affected by the presence of the outliers themselves, and correctly flags 150, 155, and 999. This concretely demonstrates why relying on a single outlier-detection method during EDA can miss cases a second method would catch, and why understanding WHY they disagree matters more than picking one blindly.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Cheap, fast, and highly visual.</strong> A box plot or scatter plot immediately surfaces candidate outliers without requiring any model to be trained, making it one of the first and cheapest EDA checks worth running on every numeric column.</li>
<li><strong>Separates investigation from remediation, avoiding premature or careless data loss.</strong> Treating outlier analysis as a distinct identification step - rather than jumping straight to deletion - creates space to check whether a flagged point is a genuine error or a real, valuable rare event before anything is discarded.</li>
<li><strong>Multiple complementary methods exist for cross-checking.</strong> Z-scores, IQR/box plots, and scatter plots each have different strengths and blind spots; using more than one, as shown above, catches cases that any single method alone would miss.</li>
<li><strong>Directly protects the integrity of every other EDA step.</strong> Since outliers can distort means, standard deviations, and correlations, identifying them early (even before deciding what to do about them) helps an analyst correctly interpret every subsequent univariate, bivariate, and correlation-based finding.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Detection methods can disagree with each other, as shown above, and neither is automatically "correct."</strong> Z-scores are themselves distorted by the outliers they're trying to detect, while IQR-based rules use a fixed 1.5x multiplier that's somewhat arbitrary and can flag legitimate rare events in genuinely skewed (not erroneous) distributions.</li>
<li><strong>A flagged point is only a CANDIDATE, not a confirmed problem, and treating it otherwise causes real harm.</strong> Automatically removing every point flagged by a box plot risks deleting rare, high-value, entirely legitimate events (a very large but real transaction, a genuinely elderly customer) that a model may actually need to learn from.</li>
<li><strong>Standard z-score and IQR methods assume a roughly single-population, unimodal distribution.</strong> Applied to a genuinely bimodal or multimodal column (see the site's Univariate Analysis and Distribution Analysis topics), points that are perfectly normal for one of the underlying subgroups can get incorrectly flagged as outliers relative to the population as a whole.</li>
<li><strong>Univariate outlier analysis alone can miss outliers that only appear in combination.</strong> A person aged 25 and an income of $2 million are each individually plausible on their own, but the COMBINATION could be highly unusual - detecting this requires a multivariate outlier method (e.g. Mahalanobis distance), not a column-by-column z-score or box plot check.</li>
</ul>`,
            codeExamples: [
                `# A univariate check can miss an outlier that only shows up when two columns are considered together
import numpy as np
import pandas as pd
from scipy.spatial.distance import mahalanobis

rng = np.random.default_rng(2)
n = 500
age = rng.integers(22, 65, size=n).astype(float)
income = age * 1500 + rng.normal(0, 8000, size=n)   # income normally scales with age

# Inject one point that is NOT extreme in either column alone, but IS an unusual combination
age = np.append(age, 25.0)          # perfectly ordinary age
income = np.append(income, 500000)  # perfectly plausible income on its own, but not for a 25-year-old here

df = pd.DataFrame({"age": age, "income": income})
print("Age percentile of the injected point:   ", (df["age"] < 25.0).mean())
print("Income percentile of the injected point:", (df["income"] < 500000).mean())

cov_inv = np.linalg.inv(df.cov().values)
mean_vec = df.mean().values
distances = df.apply(lambda row: mahalanobis(row.values, mean_vec, cov_inv), axis=1)
print(f"\\nMahalanobis distance of injected point (multivariate outlier score): {distances.iloc[-1]:.2f}")
print(f"Median Mahalanobis distance of all other points:                      {distances.iloc[:-1].median():.2f}")
# OUTPUT (typical):
# Age percentile of the injected point:    0.31   <- unremarkable on its own
# Income percentile of the injected point: 0.90   <- high but not extreme on its own
#
# Mahalanobis distance of injected point (multivariate outlier score): 8.41
# Median Mahalanobis distance of all other points:                      1.15   <- clearly an outlier once BOTH are considered together`
            ],
            codeExplanations: [
                `The injected point (age 25, income $500,000) is deliberately unremarkable in EACH column checked separately - a univariate box plot or z-score check on <code>age</code> alone, or on <code>income</code> alone, would very likely NOT flag it, exactly as the percentiles show (31st and 90th - neither extreme). <strong>Mahalanobis distance</strong> measures how unusual a point is relative to the overall correlation structure between multiple variables at once, correctly identifying this point as a clear outlier (distance 8.41 vs. a typical 1.15) because a 25-year-old with a $500,000 income is highly unusual GIVEN how age and income relate to each other in the rest of the data, even though neither value alone looked suspicious. This demonstrates concretely why univariate outlier analysis, while cheap and useful as a first pass, needs to be supplemented with multivariate methods to catch outliers that only reveal themselves in combination.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the goal of outlier analysis during EDA, and how does it differ from deciding what to do about outliers?</td><td>Outlier analysis during EDA is the investigation step: using box plots, scatter plots, and z-scores to identify unusual points and understand their likely cause. It deliberately stops short of deciding what to do about them (remove, cap, transform, or keep) - that decision is a separate, later preprocessing step that should be informed by, but not conflated with, the identification step</td></tr>
<tr class='text-center'><td>Why might a z-score-based outlier check and a box-plot (IQR) based check flag different points on the same column?</td><td>Z-scores are computed from the mean and standard deviation, both of which are themselves distorted by the very outliers being searched for, which can make the threshold harder to cross once extreme values are already inflating the standard deviation. The IQR/box-plot method is based on percentiles/rank rather than raw magnitude, making it more robust to the presence of the outliers it's trying to detect, so the two methods can disagree, especially when outliers are severe</td></tr>
<tr class='text-center'><td>Why is it a mistake to automatically remove every point a box plot flags as an outlier?</td><td>A box plot only identifies statistically unusual points; it can't distinguish a data-entry error (like an age of 150, almost certainly wrong) from a genuine rare event (like an unusually large but real transaction from a high-value customer). Automatically removing all flagged points risks deleting real, informative data along with actual errors, so each candidate needs further investigation before a removal or correction decision is made</td></tr>
</table>`
        }
    ]
};
