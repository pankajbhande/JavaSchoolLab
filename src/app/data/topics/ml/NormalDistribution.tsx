import { Topic } from '../../coreJava';

export const normalDistribution: Topic = {
    id: 'ml-mathematics-normal-distribution',
    name: 'Normal Distribution',
    beginner: [
        {
            content: `<h4>The Bell-Shaped Curve Behind Most Natural Data</h4>
<ul>
<li>The <strong>Normal Distribution</strong> (also called the <strong>Gaussian Distribution</strong>) is a symmetric, bell-shaped probability distribution where values near the <strong>mean</strong> are most common, and values get progressively rarer the further they are from it in either direction.</li>
<li>It's fully described by just two numbers: the <strong>mean (&mu;)</strong>, which sets where the peak/center sits, and the <strong>standard deviation (&sigma;)</strong>, which sets how wide or narrow the spread is.</li>
<li>Many real-world measurements - human height, blood pressure, measurement error from a sensor, test scores across a large population - approximately follow this shape, which is why it shows up constantly in statistics and ML.</li>
</ul>`,
            codeExamples: [
                `# Generating and visualizing a normal distribution: adult male heights (cm)
import numpy as np

rng = np.random.default_rng(0)
heights = rng.normal(loc=175, scale=7, size=10000)   # mean=175cm, std=7cm

print(f"Sample mean: {heights.mean():.2f} cm")
print(f"Sample std:  {heights.std():.2f} cm")
print(f"% of people between 168-182cm (mean +/- 1 std): {((heights > 168) & (heights < 182)).mean() * 100:.1f}%")
print(f"% of people between 161-189cm (mean +/- 2 std): {((heights > 161) & (heights < 189)).mean() * 100:.1f}%")
# OUTPUT (typical):
# Sample mean: 175.02 cm
# Sample std:  6.98 cm
# % of people between 168-182cm (mean +/- 1 std): 68.2%
# % of people between 161-189cm (mean +/- 2 std): 95.4%`
            ],
            codeExplanations: [
                `<code>rng.normal(loc=175, scale=7, size=10000)</code> draws 10,000 simulated adult heights from a normal distribution with mean 175cm and standard deviation 7cm, standing in for a real population height measurement. Checking the sample's own mean and standard deviation confirms the generated data matches the requested parameters closely (with 10,000 samples, sampling noise is small). The last two lines empirically verify the famous <strong>68-95-99.7 rule</strong>: about 68% of values fall within 1 standard deviation of the mean (168-182cm here), and about 95% fall within 2 standard deviations (161-189cm) - a property that holds for EVERY normal distribution, regardless of its specific mean or spread.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Many of the statistical and ML techniques used every day quietly assume, or are built around, data being roughly normally distributed - understanding when that assumption holds (and when it breaks) is critical to using them correctly.
<ul>
<li><strong>Linear Regression's</strong> standard error estimates, confidence intervals, and p-values are derived assuming the model's residuals (errors) are normally distributed; violating this doesn't necessarily break the point predictions, but it invalidates the statistical significance tests built on top of them.</li>
<li><strong>Gaussian Naive Bayes</strong> explicitly assumes each numeric feature, within each class, follows a normal distribution, and uses that assumption to compute likelihoods directly from a feature's mean and standard deviation rather than needing to count discrete category frequencies.</li>
<li><strong>Z-score standardization</strong> (subtracting the mean, dividing by standard deviation - the most common feature-scaling technique before KNN, SVMs, PCA, or gradient descent) is most meaningful when data is roughly normal, since it's built directly around the mean/std parameters that define the normal distribution.</li>
<li>The <strong>Central Limit Theorem</strong> guarantees that the SAMPLING DISTRIBUTION of a mean (e.g. the average of many training runs, or the average of many bootstrap samples) tends toward normal even when the underlying raw data is NOT normal - this is why techniques like confidence intervals and hypothesis tests remain broadly usable across many kinds of data, not just naturally bell-shaped ones.</li>
</ul>
<h3>Real-World Example</h3>
A factory produces steel rods meant to be exactly <strong>50mm</strong> in diameter, but manufacturing tolerances mean actual measurements vary slightly due to countless small independent sources of error (machine vibration, material inconsistency, temperature). Quality control needs to flag rods that are unusually far from spec.
<ul>
<li>If diameters follow a normal distribution with mean 50mm and standard deviation 0.1mm, the factory can use the 68-95-99.7 rule directly: a rod at 50.35mm is 3.5 standard deviations away, an extremely rare event under normal manufacturing conditions, and gets automatically flagged for inspection.</li>
<li>This is precisely the logic behind <strong>Six Sigma</strong> quality control processes used across manufacturing industries, and also behind statistical <strong>anomaly/outlier detection</strong> more broadly - flag anything sufficiently many standard deviations from the mean as suspicious.</li>
</ul>`,
            codeExamples: [
                `# Six-Sigma-style quality control: flagging manufacturing outliers using z-scores
import numpy as np
from scipy import stats

rng = np.random.default_rng(1)
rod_diameters = rng.normal(loc=50.0, scale=0.1, size=1000)   # mm
rod_diameters = np.append(rod_diameters, [50.35, 49.6])       # inject two defective rods

z_scores = (rod_diameters - rod_diameters[:1000].mean()) / rod_diameters[:1000].std()
flagged = np.abs(z_scores) > 3   # flag anything beyond 3 standard deviations

print(f"Rods flagged as defective: {flagged.sum()}")
for diameter, z in zip(rod_diameters[flagged], z_scores[flagged]):
    print(f"  diameter={diameter:.2f}mm  z-score={z:.2f}  P(this extreme or more)={2*(1-stats.norm.cdf(abs(z))):.5f}")
# OUTPUT (typical):
# Rods flagged as defective: 2
#   diameter=50.35mm  z-score=3.71  P(this extreme or more)=0.00021
#   diameter=49.60mm  z-score=-3.87  P(this extreme or more)=0.00011`
            ],
            codeExplanations: [
                `1000 rod diameters are simulated from a normal distribution centered at the 50mm spec with a tight 0.1mm standard deviation, then two clearly defective rods (50.35mm and 49.6mm) are manually appended to simulate a real quality escape. Each rod's <strong>z-score</strong> is computed - how many standard deviations it sits from the mean - using only the original 1000 "good" rods' mean and std as the reference. Flagging anything with <code>abs(z-score) > 3</code> implements the standard "3-sigma" outlier rule; under a true normal distribution, being beyond 3 standard deviations should happen to well under 1% of legitimate rods, so any rod that extreme is very likely a genuine defect rather than normal variation. <code>stats.norm.cdf</code> (the normal distribution's cumulative distribution function) converts each z-score into an exact probability of seeing a deviation that extreme or more, giving quality control a precise, defensible number (e.g. "0.02% chance this is normal variation") to justify flagging the part.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Fully described by just 2 parameters</strong> - mean and standard deviation completely determine a normal distribution's shape, making it extremely simple to fit, store, and reason about compared to distributions needing many parameters or non-parametric density estimation.</li>
<li><strong>Enables closed-form statistical tests</strong> - because so much is mathematically known about the normal distribution (exact percentiles, the 68-95-99.7 rule, well-studied test statistics), techniques like confidence intervals, t-tests, and z-score-based anomaly detection can be computed directly with simple formulas rather than expensive simulation.</li>
<li><strong>The Central Limit Theorem extends its usefulness far beyond naturally normal data</strong> - even when raw data is skewed or otherwise non-normal, the distribution of a SAMPLE MEAN across many samples still tends toward normal as sample size grows, which is why normal-distribution-based statistical machinery remains broadly applicable (e.g. in A/B testing conversion-rate comparisons).</li>
<li><strong>Makes anomaly detection simple and interpretable</strong> - as in the manufacturing example, "how many standard deviations away is this?" gives a single, easily explained number for flagging unusual data points, without needing a complex model.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Real-world data is often NOT normal</strong> - income distributions are heavily right-skewed (a few very high earners), word frequencies in text follow a power law, and many real quantities are bounded (can't go negative) in ways a true normal distribution (which extends to +/-infinity) never respects - applying normal-based assumptions to such data can give badly wrong conclusions.</li>
<li><strong>Assumes symmetry</strong> - a normal distribution is always perfectly symmetric around its mean, so it cannot represent skewed data well; applying z-score-based outlier detection to skewed data (e.g. flagging "high income earners" as anomalies at the same z-score threshold as "low income earners") produces lopsided, misleading results.</li>
<li><strong>Sensitive to outliers when estimating parameters</strong> - both the mean and standard deviation used to define the fitted normal curve are themselves heavily influenced by extreme values, so a few outliers can distort the very distribution being used to detect outliers, requiring robust alternatives (median, IQR) in heavy-tailed data.</li>
<li><strong>Models relying on the normality assumption can mislead when it's violated</strong> - e.g. Gaussian Naive Bayes will still run and produce predictions on clearly non-normal features, but its computed probabilities become poorly calibrated, silently degrading model quality without throwing any error.</li>
</ul>`,
            codeExamples: [
                `# Checking a normality assumption before relying on it, using a skewed real-world-style feature
import numpy as np
from scipy import stats

rng = np.random.default_rng(2)
salaries = rng.lognormal(mean=10.5, sigma=0.6, size=5000)   # right-skewed, like real income data
test_scores = rng.normal(loc=75, scale=10, size=5000)        # roughly normal, like exam scores

for name, data in [("salaries", salaries), ("test_scores", test_scores)]:
    skewness = stats.skew(data)
    _, p_value = stats.shapiro(data[:500])   # Shapiro-Wilk normality test (capped sample for speed)
    print(f"{name:<12s} skewness={skewness:6.2f}  Shapiro p-value={p_value:.4f}  "
          f"{'-> looks roughly normal' if p_value > 0.05 else '-> NOT normal, reject normality assumption'}")
# OUTPUT (typical):
# salaries     skewness=  2.14  Shapiro p-value=0.0000  -> NOT normal, reject normality assumption
# test_scores  skewness=  0.02  Shapiro p-value=0.3841  -> looks roughly normal`
            ],
            codeExplanations: [
                `This demonstrates how to actually CHECK a normality assumption instead of blindly assuming it. <code>rng.lognormal</code> generates salary-like data that is right-skewed (long tail of high earners) - a common real-world pattern that a plain normal distribution cannot represent. <code>rng.normal</code> generates exam-score-like data that genuinely is close to normal. <code>stats.skew</code> computes the skewness statistic (0 = perfectly symmetric, like a true normal distribution; large positive = long right tail). <code>stats.shapiro</code> runs the Shapiro-Wilk statistical test, whose null hypothesis is "this data comes from a normal distribution" - a small p-value (below the common 0.05 threshold) means the data significantly deviates from normal and that assumption should be rejected. The results correctly flag the salary data as non-normal (high skew, tiny p-value) while confirming the test-score data is consistent with normality - exactly the check that should precede applying any z-score-based or Gaussian-assuming technique to real data.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the 68-95-99.7 rule and why is it useful?</td><td>For any normal distribution, approximately 68% of values fall within 1 standard deviation of the mean, 95% within 2, and 99.7% within 3; it gives a quick, universal way to judge how unusual a given value is (e.g. flagging data more than 3 standard deviations away as a likely outlier) without needing to run any simulation</td></tr>
<tr class='text-center'><td>What is the Central Limit Theorem and why does it matter even when raw data is not normally distributed?</td><td>It states that the distribution of the SAMPLE MEAN of many independent samples tends toward a normal distribution as sample size grows, regardless of the underlying data's original distribution shape; this is why normal-distribution-based statistical tools (confidence intervals, hypothesis tests) remain broadly valid for comparing averages even when the raw underlying data (e.g. skewed conversion events in A/B testing) is not itself normal</td></tr>
<tr class='text-center'><td>Name two ML techniques that explicitly assume or rely on normally distributed data, and what happens if that assumption is violated.</td><td>Gaussian Naive Bayes assumes each numeric feature is normally distributed within each class to compute likelihoods from mean/std; Linear Regression's statistical inference (confidence intervals, p-values) assumes normally distributed residuals. If violated, the models may still produce usable point predictions, but computed probabilities/likelihoods (Naive Bayes) or significance tests (Linear Regression) become poorly calibrated or invalid</td></tr>
</table>`
        }
    ]
};
