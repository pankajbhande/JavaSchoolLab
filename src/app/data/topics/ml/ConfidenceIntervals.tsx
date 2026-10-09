import { Topic } from '../../coreJava';

export const confidenceIntervals: Topic = {
    id: 'ml-mathematics-confidence-intervals',
    name: 'Confidence Intervals',
    beginner: [
        {
            content: `<h4>Reporting a Range, Not Just a Single Number</h4>
<ul>
<li>A <strong>Confidence Interval</strong> is a range of values, computed from sample data, that is likely to contain the true (population) value of whatever is being estimated - such as a model's true accuracy.</li>
<li>Instead of reporting a bare estimate like "accuracy = 87%", a confidence interval reports something like "accuracy = 87% &plusmn; 3%" (i.e. roughly 84% to 90%), explicitly communicating how much uncertainty surrounds that number.</li>
<li>A <strong>95% confidence level</strong> is the most common choice, giving a wider interval than, say, a 90% confidence level, in exchange for a stronger guarantee about the interval's reliability.</li>
</ul>`,
            codeExamples: [
                `# Building a simple confidence interval for a model's cross-validation accuracy
import numpy as np
from scipy import stats

fold_scores = np.array([0.91, 0.85, 0.89, 0.83, 0.90])   # accuracy from 5 CV folds

mean_acc = fold_scores.mean()
std_err = fold_scores.std(ddof=1) / np.sqrt(len(fold_scores))   # standard error of the mean

ci_low, ci_high = stats.t.interval(0.95, df=len(fold_scores) - 1, loc=mean_acc, scale=std_err)
print(f"Mean accuracy: {mean_acc:.3f}")
print(f"95% Confidence Interval: [{ci_low:.3f}, {ci_high:.3f}]")
# OUTPUT (typical):
# Mean accuracy: 0.876
# 95% Confidence Interval: [0.832, 0.920]`
            ],
            codeExplanations: [
                `The 5 accuracy scores from a 5-fold cross validation are averaged to get a point estimate (<code>mean_acc</code> = 0.876), but that single number hides how much the folds actually varied. The <strong>standard error</strong> (<code>std_err</code>) measures how much the sample mean itself would be expected to vary if the experiment were repeated, computed from the fold-to-fold standard deviation divided by the square root of the number of folds. <code>stats.t.interval</code> uses this standard error (and the t-distribution, appropriate for small samples like 5 folds) to build a range around the mean - here, [0.832, 0.920] - communicating that the model's true accuracy plausibly lies anywhere in this fairly wide band, not exactly at 0.876.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
A bare performance number invites overconfident, sometimes wrong decisions; a confidence interval forces an honest reckoning with how much of that number is signal versus noise.
<ul>
<li><strong>Comparing two models</strong> is only meaningful with uncertainty in view - if Model A scores 87% and Model B scores 88%, that 1-point difference is meaningless noise if their confidence intervals overlap heavily, but a real, defensible improvement if the intervals are clearly separated.</li>
<li><strong>Cross-validation fold scores directly supply the ingredients</strong> for a confidence interval - the standard deviation across folds estimates how much the performance estimate would vary on a different sample of data, and is exactly what feeds the standard error calculation.</li>
<li><strong>A/B testing metrics (click-through rate, conversion rate)</strong> are always reported with confidence intervals in serious experimentation platforms, since a raw percentage from a finite number of users is itself just a sample estimate of the true underlying rate.</li>
<li><strong>Model monitoring in production</strong> uses confidence intervals around metrics like daily accuracy or error rate to distinguish "this is expected day-to-day statistical fluctuation" from "this is a real, actionable degradation" (e.g. from data drift), preventing both false alarms and missed real problems.</li>
</ul>
<h3>Real-World Example</h3>
A team compares two versions of a customer-churn prediction model using 10-fold cross validation. Model A (existing) scores 84% mean accuracy; Model B (new, more complex) scores 85.5%. Leadership wants to know: is Model B worth the extra complexity and maintenance cost, or is that 1.5-point gain just noise?
<ul>
<li>Reporting bare means alone would tempt a "yes, ship Model B" decision purely because 85.5 > 84.</li>
<li>Computing 95% confidence intervals from each model's 10 fold scores reveals Model A's interval is [81.2%, 86.8%] and Model B's is [82.9%, 88.1%] - they overlap substantially, meaning the observed 1.5-point difference is well within the range explainable by ordinary fold-to-fold noise, not strong evidence that Model B is actually better.</li>
</ul>`,
            codeExamples: [
                `# Comparing two models' cross-validation performance using confidence intervals
import numpy as np
from scipy import stats

def ci_95(scores):
    mean = scores.mean()
    se = scores.std(ddof=1) / np.sqrt(len(scores))
    low, high = stats.t.interval(0.95, df=len(scores) - 1, loc=mean, scale=se)
    return mean, low, high

model_a_folds = np.array([0.83, 0.86, 0.82, 0.85, 0.84, 0.87, 0.81, 0.85, 0.83, 0.84])
model_b_folds = np.array([0.87, 0.83, 0.86, 0.89, 0.84, 0.85, 0.88, 0.83, 0.86, 0.84])

for name, folds in [("Model A", model_a_folds), ("Model B", model_b_folds)]:
    mean, low, high = ci_95(folds)
    print(f"{name}: mean={mean:.3f}  95% CI=[{low:.3f}, {high:.3f}]")

overlap = min(ci_95(model_a_folds)[2], ci_95(model_b_folds)[2]) - max(ci_95(model_a_folds)[1], ci_95(model_b_folds)[1])
print("Intervals overlap:", overlap > 0, "-> difference is" , "NOT clearly significant" if overlap > 0 else "likely real")
# OUTPUT (typical):
# Model A: mean=0.840  95% CI=[0.822, 0.858]
# Model B: mean=0.855  95% CI=[0.834, 0.876]
# Intervals overlap: True -> difference is NOT clearly significant`
            ],
            codeExplanations: [
                `The <code>ci_95</code> helper computes the mean accuracy, standard error, and resulting 95% confidence interval for a set of fold scores, exactly as in the beginner example, applied here to both models' 10-fold results. Model B's mean (0.855) is numerically higher than Model A's (0.840), but their confidence intervals ([0.822, 0.858] and [0.834, 0.876]) overlap substantially. The final check computes whether the intervals overlap at all - since they do, this signals the apparent gap between the two models could plausibly just be sampling noise from which specific folds happened to be easy or hard, rather than solid evidence Model B is genuinely better; a rigorous <strong>hypothesis test</strong> (e.g. a paired t-test on the fold scores) would be the next proper step to quantify this more precisely.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Prevents overreacting to noise</strong> - as in the churn model comparison, seeing that two intervals overlap stops a team from prematurely shipping a more complex model for a "improvement" that isn't statistically distinguishable from chance.</li>
<li><strong>Directly quantifiable from cross-validation</strong> - since CV already produces multiple fold scores, computing a confidence interval costs nothing extra: the fold-to-fold standard deviation is already sitting there, ready to feed the standard error formula.</li>
<li><strong>Communicates uncertainty to non-technical stakeholders in an intuitive form</strong> - "84% accuracy" sounds precise and final; "84% (likely between 81% and 87%)" honestly conveys that the number carries real uncertainty, supporting better-calibrated business decisions.</li>
<li><strong>Interval width itself is diagnostic</strong> - a very wide confidence interval is itself useful information, signaling that more data (more folds, a bigger test set) is needed before the estimate can be trusted for high-stakes decisions.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>The "95% confidence" language is widely misunderstood</strong> - it does NOT mean "there is a 95% probability the true value lies in this specific computed interval." It means: if this same sampling and interval-construction procedure were repeated many times, about 95% of the resulting intervals would contain the true value. The true value either is or isn't in any one particular interval - the 95% describes the reliability of the METHOD, not a probability about this one result.</li>
<li><strong>Assumes a specific underlying distribution/model</strong> - the common formula (using the t-distribution) assumes the sampled values are roughly normally distributed (or that the Central Limit Theorem applies with enough samples); with very few folds or heavily skewed fold scores, the resulting interval can be inaccurate.</li>
<li><strong>Only 5 or 10 cross-validation folds gives a small sample for the interval itself</strong> - since the interval is built FROM the fold scores, and there are typically only 5-10 of them, the interval's own reliability is limited; it is an estimate of uncertainty, not an exact guarantee.</li>
<li><strong>Non-overlapping intervals still aren't a rigorous significance test</strong> - eyeballing whether two confidence intervals overlap is a useful rule of thumb but is technically more conservative than (and not equivalent to) running a proper statistical test like a paired t-test directly on the paired fold differences, which is more powerful for detecting genuinely small but real differences.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating what "95% confidence" actually means via repeated simulation
import numpy as np
from scipy import stats

rng = np.random.default_rng(3)
true_mean = 0.85          # the TRUE (usually unknown) population accuracy
true_std = 0.05

contains_true_value = 0
n_experiments = 1000

for _ in range(n_experiments):
    sample = rng.normal(true_mean, true_std, size=10)   # simulate 10 CV fold scores
    se = sample.std(ddof=1) / np.sqrt(len(sample))
    low, high = stats.t.interval(0.95, df=9, loc=sample.mean(), scale=se)
    if low <= true_mean <= high:
        contains_true_value += 1

print(f"Out of {n_experiments} simulated experiments, the 95% CI contained the true value in "
      f"{contains_true_value} ({contains_true_value / n_experiments * 100:.1f}%) of them")
# OUTPUT (typical):
# Out of 1000 simulated experiments, the 95% CI contained the true value in 948 (94.8%) of them`
            ],
            codeExplanations: [
                `This simulation directly demonstrates the correct interpretation of "95% confidence." The TRUE population mean (0.85) is fixed and known here (something never known in real practice), and the loop repeats the entire process - draw a fresh sample of 10 simulated fold scores, build a 95% confidence interval from it - 1000 times. Counting how often the true value (0.85) actually falls inside that experiment's interval gives 94.8%, closely matching the promised 95%. Critically, this confirms the 95% is a property of the REPEATED PROCEDURE across many hypothetical experiments, not a probability statement about any single interval computed from one real dataset - in practice, an analyst runs this process exactly once and gets exactly one interval, which either does or does not contain the unknown true value.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does a 95% confidence interval actually mean?</td><td>It means that if the sampling and interval-construction procedure were repeated many times, about 95% of the resulting intervals would contain the true population value. It does NOT mean there is a 95% probability the true value lies within this one specific computed interval - the true value either is or is not in it; the 95% describes the long-run reliability of the method</td></tr>
<tr class='text-center'><td>How would you use cross-validation fold scores to report a model's accuracy with a confidence interval instead of a single number?</td><td>Compute the mean of the fold scores as the point estimate, compute the standard error as the fold scores' standard deviation divided by the square root of the number of folds, then use a t-distribution (appropriate for small samples) with that mean and standard error to construct the interval, e.g. via scipy.stats.t.interval</td></tr>
<tr class='text-center'><td>If Model A scores 84% and Model B scores 85.5% on cross-validation, how would you decide if Model B is genuinely better rather than just lucky?</td><td>Compute 95% confidence intervals for both models from their fold scores; if the intervals overlap substantially, the observed difference is plausibly just sampling noise from which folds were easy or hard, not strong evidence of a real improvement. For a more rigorous answer, run a paired statistical test (e.g. a paired t-test) directly on the per-fold score differences between the two models</td></tr>
</table>`
        }
    ]
};
