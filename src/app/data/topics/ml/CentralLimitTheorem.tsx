import { Topic } from '../../coreJava';

export const centralLimitTheorem: Topic = {
    id: 'ml-mathematics-central-limit-theorem',
    name: 'Central Limit Theorem',
    beginner: [
        {
            content: `<h4>Averages Become Normal, Even When the Data Isn't</h4>
The <strong>Central Limit Theorem (CLT)</strong> states: if you repeatedly draw random samples from ANY distribution (skewed, uniform, weirdly shaped - it doesn't matter) and compute the MEAN of each sample, the distribution of those sample means approaches a <strong>Normal distribution</strong> as the sample size grows - regardless of what the original data looked like. This is the theoretical reason so many statistical tools (confidence intervals, hypothesis tests) are allowed to assume normality even when the raw data clearly isn't Normal.`,
            codeExamples: [
                `import numpy as np

rng = np.random.default_rng(0)

# A heavily skewed, distinctly NON-normal population (exponential distribution)
population = rng.exponential(scale=2.0, size=100000)
print(f"Population skewness (0 = symmetric): {((population - population.mean())**3).mean() / population.std()**3:.2f}")

# Repeatedly draw samples of size 40 and record each sample's MEAN
sample_means = [rng.choice(population, size=40, replace=False).mean() for _ in range(2000)]
sample_means = np.array(sample_means)

print(f"Sample means - mean: {sample_means.mean():.2f}, std: {sample_means.std():.2f}")
print(f"Sample means skewness: {((sample_means - sample_means.mean())**3).mean() / sample_means.std()**3:.2f}")
# OUTPUT (typical):
# Population skewness (0 = symmetric): 2.01     <- heavily right-skewed, NOT normal at all
# Sample means - mean: 2.00, std: 0.31
# Sample means skewness: 0.08                    <- nearly 0: the sample MEANS look symmetric/Normal`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without the CLT, every statistical technique built on the Normal distribution (confidence intervals, z-tests, t-tests, the standard-error formula behind reporting "accuracy: 87% ± 3%") would only be valid for data that already happened to be Normal - a rare and unverifiable assumption for most real datasets. The CLT guarantees these tools work on the SAMPLE MEAN of almost any underlying data, as long as the sample is reasonably large (a common rule of thumb: n &ge; 30), which is why they're used so broadly across ML evaluation and A/B testing without first proving the raw data is Normal.`,
            codeExamples: [
                `import numpy as np
from scipy import stats

rng = np.random.default_rng(1)

# Simulating "average daily support tickets per hour" - a real quantity that's
# NOT Normal at the single-observation level (counts are right-skewed, Poisson-like)
hourly_tickets = rng.poisson(lam=4, size=100000)

# But averaging 50 hours' worth of tickets (e.g. one work-week) at a time...
weekly_averages = [rng.choice(hourly_tickets, size=50, replace=False).mean() for _ in range(1000)]
weekly_averages = np.array(weekly_averages)

# ...lets us safely build a 95% confidence interval using the NORMAL-based formula,
# even though individual hourly counts are nowhere close to Normal.
mean_est = weekly_averages.mean()
std_err = weekly_averages.std(ddof=1) / np.sqrt(len(weekly_averages))
ci_low, ci_high = stats.norm.interval(0.95, loc=mean_est, scale=std_err)

print(f"Estimated mean tickets/hour: {mean_est:.2f}")
print(f"95% CI: [{ci_low:.2f}, {ci_high:.2f}]")
# OUTPUT (typical):
# Estimated mean tickets/hour: 4.00
# 95% CI: [3.98, 4.02]`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
A support team wants to know the TRUE average number of tickets received per hour, to staff correctly. Individual hourly counts are noisy and skewed (some hours get 0 tickets, occasionally a burst of 15). Instead of trusting any single hour's count, they average many hours together - and the CLT guarantees that average behaves Normally, letting them build a reliable confidence interval around it and make a staffing decision with quantified uncertainty, without ever needing the raw hourly counts themselves to be Normal.
<h3>Advantages</h3>
<ul>
<li><strong>Justifies using Normal-based statistics almost everywhere</strong> - confidence intervals and hypothesis tests built on the Normal distribution remain valid for sample MEANS even when raw data is skewed, discrete, or bounded, as long as the sample size is large enough.</li>
<li><strong>Requires no knowledge of the population's true distribution</strong> - a support team never needs to know the EXACT shape of hourly ticket counts to reason correctly about the average; the CLT holds regardless.</li>
<li><strong>Explains why larger samples give more reliable estimates</strong> - the CLT's companion result (the sample mean's standard deviation shrinks as 1/&radic;n) is the mathematical reason "more data = tighter confidence interval."</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>"Large enough" sample size is a rule of thumb, not a guarantee</strong> - n &ge; 30 works for mildly skewed data, but a VERY heavily skewed or heavy-tailed distribution (e.g. income data with billionaires) can need a much larger sample before the Normal approximation is trustworthy.</li>
<li><strong>Only applies to the sample MEAN (or sum), not to individual observations</strong> - the CLT says nothing about a single hour's ticket count being Normal; it only smooths out once you average many observations together.</li>
<li><strong>Assumes independent, identically distributed samples</strong> - if observations are correlated (e.g. ticket volume trending upward over months), the CLT's guarantees weaken or break down.</li>
</ul>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the Central Limit Theorem actually state?</td><td>The distribution of the SAMPLE MEAN (not individual observations) approaches a Normal distribution as sample size grows, regardless of the shape of the original population distribution</td></tr>
<tr class='text-center'><td>Why is the "n &ge; 30" rule of thumb not a strict guarantee?</td><td>It's a rough heuristic calibrated to mildly skewed distributions - a heavily skewed or heavy-tailed population may need a much larger sample before its sample mean's distribution is well-approximated by Normal</td></tr>
<tr class='text-center'><td>Why does the CLT matter for reporting model evaluation metrics like cross-validation accuracy?</td><td>It justifies treating the average accuracy across CV folds as approximately Normal, which is what allows constructing a confidence interval ("87% &plusmn; 3%") using standard Normal-based formulas, even without knowing the true distribution of possible model errors</td></tr>
</table>`
        }
    ]
};
