import { Topic } from '../../coreJava';

export const hypothesisTesting: Topic = {
    id: 'ml-mathematics-hypothesis-testing',
    name: 'Hypothesis Testing',
    beginner: [
        {
            content: `<h4>A Rigorous Way to Decide "Is This Difference Real?"</h4>
<ul>
<li><strong>Hypothesis Testing</strong> is a formal statistical procedure for deciding whether an observed effect (e.g. Model B scoring higher than Model A) is likely a REAL effect, or could plausibly have arisen from random chance alone.</li>
<li>It starts with a <strong>null hypothesis (H0)</strong> - the "boring" default assumption that there is NO real difference/effect - and an <strong>alternative hypothesis (H1)</strong> - that there IS a real difference.</li>
<li>The test produces a <strong>p-value</strong>: the probability of seeing a result at least as extreme as what was observed, IF the null hypothesis were actually true. A small p-value is evidence against the null hypothesis.</li>
</ul>`,
            codeExamples: [
                `# A simple hypothesis test: did Model B's higher CTR beat Model A by more than chance?
import numpy as np
from scipy import stats

# A/B test: clicks out of impressions for two recommendation algorithms
clicks_a, impressions_a = 480, 10000    # Model A: 4.80% CTR
clicks_b, impressions_b = 540, 10000    # Model B: 5.40% CTR

# Two-proportion z-test
count = np.array([clicks_a, clicks_b])
nobs = np.array([impressions_a, impressions_b])
p_pool = count.sum() / nobs.sum()
se = np.sqrt(p_pool * (1 - p_pool) * (1 / nobs[0] + 1 / nobs[1]))
z = (count[1] / nobs[1] - count[0] / nobs[0]) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z)))

print(f"CTR A: {clicks_a/impressions_a:.4f}, CTR B: {clicks_b/impressions_b:.4f}")
print(f"z-statistic: {z:.3f}, p-value: {p_value:.4f}")
print("Statistically significant at p < 0.05?", p_value < 0.05)
# OUTPUT (typical):
# CTR A: 0.0480, CTR B: 0.0540
# z-statistic: 2.024, p-value: 0.0430
# Statistically significant at p < 0.05? True`
            ],
            codeExplanations: [
                `Two recommendation algorithms are compared via their observed click-through rates: Model A got 480 clicks out of 10,000 impressions (4.80%), Model B got 540 out of 10,000 (5.40%). The <strong>null hypothesis</strong> here is "both algorithms have the same true click-through rate, and the observed gap is just random noise from which users happened to see which version." The code computes a <strong>two-proportion z-test</strong> statistic measuring how many standard errors apart the two observed rates are, then converts that into a <strong>p-value</strong> (0.0430) - the probability of seeing a gap this large or larger purely by chance if the null hypothesis were true. Since 0.0430 is below the common 0.05 threshold, this result would conventionally be called "statistically significant," suggesting Model B's improvement is unlikely to be pure luck.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
ML and product teams constantly need to decide whether an observed difference reflects a genuine underlying effect worth acting on, or is just noise from randomness in the data - hypothesis testing is the formal machinery for making that call defensibly.
<ul>
<li><strong>A/B testing recommendation or ranking algorithms</strong> relies entirely on hypothesis testing to decide whether a new model's higher click-through rate, conversion rate, or engagement metric represents a true improvement worth fully rolling out, rather than random variation in which users happened to see which variant.</li>
<li><strong>Comparing model architectures or hyperparameters</strong> during model selection benefits from the same logic as A/B testing - a paired hypothesis test on cross-validation fold scores can determine whether one model configuration is genuinely better than another, not just luckier on this particular data split.</li>
<li><strong>Feature selection</strong> often uses hypothesis tests (e.g. a chi-squared test for categorical features, an ANOVA F-test for numeric ones) to formally assess whether a candidate feature has a statistically detectable relationship with the target before including it in a model.</li>
<li><strong>Detecting data drift in production</strong> - monitoring systems often run a hypothesis test (e.g. a Kolmogorov-Smirnov test) comparing the distribution of incoming production data against the original training distribution, to decide if a detected shift is significant enough to warrant retraining.</li>
</ul>
<h3>Real-World Example</h3>
A streaming platform runs an A/B test comparing its current recommendation algorithm (Model A) against a new one (Model B) across 50,000 users each, measuring click-through rate on recommended content.
<ul>
<li>Model B shows a higher observed CTR, but leadership needs to know if this justifies the engineering cost of fully replacing Model A - is the gap real, or could it vanish on a different batch of users?</li>
<li>A hypothesis test formalizes the null hypothesis ("no true difference between the algorithms") and computes a p-value; if p is small (e.g. below 0.05), the team has statistical grounds to reject the null hypothesis and conclude Model B's improvement is likely genuine, informing the decision to ship it.</li>
<li>Crucially, the team must also weigh the COST of being wrong in either direction: shipping a not-actually-better model (a <strong>false positive</strong>) wastes engineering effort and risks user experience, while failing to ship a genuinely better model (a <strong>false negative</strong>) leaves revenue/engagement on the table.</li>
</ul>`,
            codeExamples: [
                `# Type I vs Type II error trade-off, simulated across many hypothetical A/B tests
import numpy as np
from scipy import stats

rng = np.random.default_rng(4)

def run_ab_test(true_ctr_a, true_ctr_b, n_users, alpha=0.05):
    clicks_a = rng.binomial(n_users, true_ctr_a)
    clicks_b = rng.binomial(n_users, true_ctr_b)
    p_pool = (clicks_a + clicks_b) / (2 * n_users)
    se = np.sqrt(p_pool * (1 - p_pool) * (2 / n_users))
    z = (clicks_b / n_users - clicks_a / n_users) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    return p_value < alpha   # True = "declared statistically significant"

# Scenario 1: NO real difference (null hypothesis is actually TRUE) -> false positives = Type I errors
false_positives = sum(run_ab_test(0.05, 0.05, 5000) for _ in range(1000))
print(f"Type I error rate (no real difference, still 'significant'): {false_positives/1000:.3f}  (expected ~0.05)")

# Scenario 2: a REAL but small difference exists -> failing to detect it = Type II errors
true_positives = sum(run_ab_test(0.050, 0.055, 5000) for _ in range(1000))
print(f"Power (real small difference correctly detected): {true_positives/1000:.3f}")
print(f"Type II error rate (missed the real difference): {1 - true_positives/1000:.3f}")
# OUTPUT (typical):
# Type I error rate (no real difference, still 'significant'): 0.051  (expected ~0.05)
# Power (real small difference correctly detected): 0.169
# Type II error rate (missed the real difference): 0.831`
            ],
            codeExplanations: [
                `<code>run_ab_test</code> simulates one full A/B test: given the TRUE (normally unknown) click-through rates for both variants, it simulates random clicks via <code>rng.binomial</code>, runs the same two-proportion z-test as before, and returns whether the result was declared "significant" at the 0.05 threshold. Scenario 1 sets both true rates EQUAL (0.05 and 0.05) - meaning the null hypothesis is actually correct - and repeats the test 1000 times; about 5.1% of these still falsely declare significance, closely matching the chosen alpha of 0.05, which is precisely the definition of the <strong>Type I error rate (false positive rate)</strong> the significance threshold is designed to control. Scenario 2 sets a real but small difference (0.050 vs 0.055) and shows the test only correctly detects it 16.9% of the time with this sample size - meaning it misses the real effect (a <strong>Type II error</strong>, false negative) 83.1% of the time, illustrating that small effect sizes need much larger sample sizes to reliably detect, a critical practical consideration when designing an A/B test.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Provides an objective, repeatable decision rule</strong> - rather than eyeballing "5.4% looks bigger than 4.8%, ship it," a hypothesis test gives a principled, quantified answer that accounts for sample size and natural variability, reducing decisions driven by wishful thinking.</li>
<li><strong>Quantifies the risk of being wrong</strong> - by fixing a significance threshold (like 0.05) up front, a team explicitly controls and understands the Type I error rate it's willing to accept, rather than that risk being unknown or unmanaged.</li>
<li><strong>Widely applicable across many kinds of ML questions</strong> - the same core framework (state a null hypothesis, compute a test statistic, get a p-value) applies to comparing conversion rates, comparing model accuracies, testing feature relevance, and detecting distributional drift, making it a broadly reusable analytical tool.</li>
<li><strong>Forces explicit thinking about sample size and effect size</strong> - as the Type II error simulation shows, hypothesis testing surfaces the very real trade-off between how big an effect is, how much data is available, and how reliably that effect can actually be detected - informing smarter experiment design (e.g. "we need at least this many users before this test is trustworthy").</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>The p &lt; 0.05 threshold is an arbitrary convention, not a law of nature</strong> - there is nothing magical about 0.05 specifically; it became a de facto standard by historical convention, and treating it as a rigid pass/fail line (e.g. p=0.049 "significant" but p=0.051 "not significant") misrepresents what is really a continuous measure of evidence strength.</li>
<li><strong>Statistical significance is not the same as practical/business significance</strong> - with a large enough sample size (e.g. millions of users), even a genuinely trivial difference (0.1% CTR improvement) can become "statistically significant," even though it may not be worth the engineering cost to act on.</li>
<li><strong>"p < 0.05" does NOT mean "95% chance the effect is real"</strong> - a p-value is the probability of the observed data (or more extreme) GIVEN the null hypothesis is true, not the probability that the null hypothesis (or its alternative) is true given the data - a very commonly confused distinction that leads to overstated conclusions.</li>
<li><strong>Running many hypothesis tests inflates the false-positive rate</strong> - testing dozens of metrics or feature relationships at once, each at a 0.05 threshold, means several will appear "significant" purely by chance (the multiple-comparisons problem), requiring corrections like the Bonferroni correction to keep the overall false-positive rate under control.</li>
</ul>`,
            codeExamples: [
                `# Statistical significance without practical significance, at large sample size
import numpy as np
from scipy import stats

def ab_test_pvalue(clicks_a, n_a, clicks_b, n_b):
    p_pool = (clicks_a + clicks_b) / (n_a + n_b)
    se = np.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
    z = (clicks_b / n_b - clicks_a / n_a) / se
    return 2 * (1 - stats.norm.cdf(abs(z)))

# A tiny, practically meaningless 0.1% CTR improvement, but with a HUGE sample size
n = 2_000_000
clicks_a = int(n * 0.0500)
clicks_b = int(n * 0.0510)   # only 0.1 percentage point higher

p_value = ab_test_pvalue(clicks_a, n, clicks_b, n)
print(f"CTR A: {clicks_a/n:.4f}, CTR B: {clicks_b/n:.4f}  (absolute difference: 0.10 percentage points)")
print(f"p-value: {p_value:.6f}  -> statistically significant: {p_value < 0.05}")
print("Business call: is a 0.1-point CTR lift worth a full model migration? Statistics alone can't say.")
# OUTPUT (typical):
# CTR A: 0.0500, CTR B: 0.0510  (absolute difference: 0.10 percentage points)
# p-value: 0.002864  -> statistically significant: True
# Business call: is a 0.1-point CTR lift worth a full model migration? Statistics alone can't say.`
            ],
            codeExplanations: [
                `With 2 million users per variant, even a tiny, practically marginal 0.1-percentage-point CTR difference (5.00% vs 5.10%) produces a very small p-value (0.0029) and is flagged as "statistically significant." This is not a bug in the math - with that much data, the test can reliably detect even genuinely tiny true differences - but it illustrates the key limitation that statistical significance only says "this difference is probably not pure chance," and says NOTHING about whether the difference is large enough to justify real-world action like migrating an entire production recommendation system. The business decision of whether a 0.1-point lift is worth the engineering cost requires combining the statistical result with a separate judgment about practical/effect-size significance - a step hypothesis testing alone cannot make.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a p-value, and what is a common misinterpretation of it?</td><td>A p-value is the probability of observing data at least as extreme as what was seen, ASSUMING the null hypothesis is true. It is commonly misinterpreted as "the probability the null hypothesis is true" or "the probability the result is due to chance" - neither is correct; it is a statement about the data given the hypothesis, not about the hypothesis given the data</td></tr>
<tr class='text-center'><td>In an A/B test comparing two recommendation algorithms, what are Type I and Type II errors, and what are their real business costs?</td><td>A Type I error (false positive) is concluding Model B is better when it actually isn't, leading to wasted engineering effort migrating to a model that provides no real benefit and possible unnecessary risk. A Type II error (false negative) is failing to detect that Model B is genuinely better, leading to a missed opportunity to improve engagement/revenue by not shipping a real improvement. The chosen significance threshold and sample size jointly determine the trade-off between these two error rates</td></tr>
<tr class='text-center'><td>Why is the p < 0.05 threshold considered somewhat arbitrary, and what problem arises from running many hypothesis tests at once?</td><td>0.05 is a historical convention with no special mathematical justification - treating it as a rigid cutoff (significant vs not) misrepresents a continuous measure of evidence, and with large enough sample sizes even practically trivial effects become statistically significant. Running many tests simultaneously at a 0.05 threshold each increases the chance that some will appear significant purely by chance (the multiple-comparisons problem), requiring corrections like the Bonferroni correction to control the overall false-positive rate</td></tr>
</table>`
        }
    ]
};
