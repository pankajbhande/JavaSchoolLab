import { Topic } from '../../coreJava';

export const randomVariables: Topic = {
    id: 'ml-mathematics-random-variables',
    name: 'Random Variables',
    beginner: [
        {
            content: `<h4>Turning Random Outcomes Into Numbers</h4>
<ul>
<li>A <strong>Random Variable</strong> is a function that maps the outcomes of a random process to numbers - it's what lets "the result of a coin flip" or "how many customers arrive in an hour" be handled mathematically, instead of just as an abstract event.</li>
<li>A <strong>Discrete Random Variable</strong> can only take a countable set of distinct values (e.g. the number of support tickets received in an hour: 0, 1, 2, 3, ...). A <strong>Continuous Random Variable</strong> can take any value within a range (e.g. a sensor's temperature reading: 21.347&deg;C, 21.348&deg;C, ...).</li>
<li>A <strong>Probability Distribution</strong> describes how the total probability (which always sums/integrates to 1) is spread across all the possible values a random variable can take - for discrete variables this is a <strong>probability mass function</strong> (exact probability per value), for continuous variables it's a <strong>probability density function</strong> (probability per small range of values).</li>
</ul>`,
            codeExamples: [
                `# Discrete vs continuous random variables, side by side
import numpy as np

rng = np.random.default_rng(0)

# Discrete: number of support tickets arriving per hour (Poisson-distributed)
tickets_per_hour = rng.poisson(lam=4, size=10000)

# Continuous: a sensor's temperature reading (Normal-distributed)
sensor_temp = rng.normal(loc=21.5, scale=0.3, size=10000)

print("DISCRETE (ticket counts) - can only take whole-number values:")
print(f"  Possible values seen: {sorted(np.unique(tickets_per_hour))[:8]} ...")
print(f"  P(exactly 4 tickets in an hour) = {(tickets_per_hour == 4).mean():.3f}")

print("CONTINUOUS (temperature) - takes a range of fractional values:")
print(f"  Sample values: {sensor_temp[:3].round(3)}")
print(f"  P(temperature between 21.4 and 21.6) = {((sensor_temp > 21.4) & (sensor_temp < 21.6)).mean():.3f}")
# OUTPUT:
# DISCRETE (ticket counts) - can only take whole-number values:
#   Possible values seen: [0, 1, 2, 3, 4, 5, 6, 7] ...
#   P(exactly 4 tickets in an hour) = 0.195
# CONTINUOUS (temperature) - takes a range of fractional values:
#   Sample values: [21.354 21.532 21.825]
#   P(temperature between 21.4 and 21.6) = 0.261`
            ],
            codeExplanations: [
                `<code>tickets_per_hour</code> is generated from a <strong>Poisson distribution</strong> (mean rate of 4 per hour), a natural model for COUNT data - it only ever produces non-negative whole numbers, illustrating a discrete random variable, and it makes sense to ask for the EXACT probability of a specific count like "exactly 4 tickets" (about 19.5%). <code>sensor_temp</code> is generated from a Normal distribution instead, illustrating a continuous random variable - individual exact values like "21.500000...&deg;C" have essentially zero probability of occurring precisely, so instead the code asks for the probability of falling within a RANGE (between 21.4 and 21.6), which is how continuous random variables are always queried in practice. This distinction - exact-value questions for discrete variables, range questions for continuous ones - is fundamental to correctly reasoning about any random quantity in ML.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Choosing the right kind of random variable and distribution to model a real quantity is a core, often invisible, modeling decision baked into many ML techniques.
<ul>
<li><strong>Bernoulli/Binomial distributions</strong> model binary outcomes - a single yes/no event (did the user click the ad? Bernoulli) or a count of successes across repeated binary trials (how many of 100 emails were opened? Binomial). Logistic Regression's output is literally interpreted as the parameter of a Bernoulli random variable: <code>P(y=1 | x)</code>.</li>
<li><strong>Poisson distributions</strong> model counts of events occurring at some average rate within a fixed window (website visits per minute, defects per batch, support tickets per hour) - used directly in Poisson Regression for count-based prediction tasks, and in queueing/capacity-planning models that decide how many servers or staff are needed to handle expected load.</li>
<li><strong>Normal distributions</strong> model continuous measurements clustering around a center (sensor readings, measurement error, many naturally-occurring physical quantities) - assumed by Gaussian Naive Bayes for continuous features, and by Linear Regression for its residual errors.</li>
<li>Picking the WRONG distribution type for a variable (e.g. treating a discrete count as continuous, or assuming Normality for data that's actually Poisson-distributed and therefore skewed for low rates) leads a model to make systematically wrong probability estimates, even if point predictions still look reasonable.</li>
</ul>
<h3>Real-World Example</h3>
A company monitors two very different streams of data: the <strong>number of customer support tickets arriving per hour</strong> (discrete, well-modeled by a Poisson distribution) and a <strong>server's continuous temperature reading</strong> from a hardware sensor (continuous, well-modeled by a Normal distribution). Both need very different treatment for anomaly detection and capacity planning.
<ul>
<li>For ticket counts, the relevant question is discrete: "what's the probability of getting <em>exactly</em> 12 or more tickets this hour, given the average is 4?" - answered using the Poisson probability mass function, directly informing how many support staff to schedule.</li>
<li>For sensor temperature, the relevant question is continuous: "what's the probability the reading falls outside the safe operating range of 18-25&deg;C?" - answered by integrating the Normal probability density function over that range, directly informing when to trigger a hardware alert.</li>
</ul>`,
            codeExamples: [
                `# Using the right distribution for each variable type to answer real operational questions
import numpy as np
from scipy import stats

# Discrete: Poisson model of support ticket arrivals (average rate = 4 per hour)
avg_tickets_per_hour = 4
p_12_or_more = 1 - stats.poisson.cdf(11, mu=avg_tickets_per_hour)   # P(X >= 12)
print(f"P(12+ tickets in an hour | avg=4) = {p_12_or_more:.5f}  -> staff up if this crosses a threshold")

# Continuous: Normal model of server temperature (mean=21.5C, std=1.2C)
mean_temp, std_temp = 21.5, 1.2
p_out_of_range = stats.norm.cdf(18, loc=mean_temp, scale=std_temp) + (1 - stats.norm.cdf(25, loc=mean_temp, scale=std_temp))
print(f"P(temperature outside 18-25C) = {p_out_of_range:.5f}  -> trigger hardware alert if this is too high")
# OUTPUT:
# P(12+ tickets in an hour | avg=4) = 0.00113  -> staff up if this crosses a threshold
# P(temperature outside 18-25C) = 0.00034  -> trigger hardware alert if this is too high`
            ],
            codeExplanations: [
                `For the discrete ticket-count variable, <code>stats.poisson.cdf(11, mu=4)</code> computes the CUMULATIVE probability of seeing 11 or fewer tickets given an average arrival rate of 4 per hour; subtracting from 1 gives the probability of the discrete event "12 or more tickets" - an EXACT count-based question, appropriate because ticket counts can only be whole numbers. For the continuous temperature variable, <code>stats.norm.cdf</code> is used instead to compute the probability the reading falls BELOW 18&deg;C or ABOVE 25&deg;C by integrating area under the Normal density curve in each tail - a RANGE-based question, because it makes no sense to ask for the probability of an exact continuous value like "21.500000&deg;C". Both use the correct distribution's cumulative distribution function (CDF) for their variable type, showing how the discrete-vs-continuous distinction directly determines which mathematical tool is used to answer an otherwise similar-sounding operational question.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Turns vague uncertainty into precise, computable numbers</strong> - framing "how many tickets might we get" as a Poisson random variable lets a company compute an exact probability for any staffing threshold, rather than relying on gut-feel estimates.</li>
<li><strong>Standard distributions come with well-known formulas and properties</strong> - once a variable is recognized as following, say, a Poisson or Normal distribution, its mean, variance, and every tail probability can be computed instantly using established formulas, without needing to run new simulations from scratch every time.</li>
<li><strong>Distributional assumptions make many ML algorithms tractable and fast</strong> - Gaussian Naive Bayes only needs to estimate a mean and standard deviation per feature per class (because it assumes Normality) rather than a full, complex, non-parametric density, which is why it trains almost instantly even on large datasets.</li>
<li><strong>Choosing the right distribution family often reflects genuine domain structure</strong> - a Binomial distribution for "number of clicks out of N impressions" isn't an arbitrary choice, it directly encodes the real generative process (N independent yes/no trials), making the resulting model both accurate and interpretable.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Real data often doesn't cleanly match any standard distribution</strong> - support ticket arrivals might spike sharply during outages (violating the Poisson assumption of a constant average rate), or sensor readings might be bimodal (two separate operating regimes) rather than a single bell curve, breaking a Normal-distribution assumption.</li>
<li><strong>Picking the wrong distribution type silently degrades a model instead of raising an error</strong> - applying GaussianNB to a genuinely Poisson-distributed count feature will still run and produce predictions, but the underlying probability estimates will be systematically off, especially for low counts where a Poisson distribution is noticeably skewed and a Normal distribution is not.</li>
<li><strong>Discrete and continuous treatments are not interchangeable</strong> - treating a discrete count variable (like "number of purchases") as if it were continuous (e.g. fitting a plain Normal distribution to it) can assign non-trivial probability to impossible values like 2.7 purchases, or negative counts, unless properly constrained.</li>
<li><strong>Parameters of a distribution (like a Poisson's average rate, or a Normal's mean/std) must themselves be estimated from data</strong> - if the historical data used to estimate them is unrepresentative (e.g. ticket volume before a product launch, used to plan staffing after it), the resulting distribution and every probability derived from it will be wrong even though the distribution FAMILY was chosen correctly.</li>
</ul>`,
            codeExamples: [
                `# Checking whether ticket-arrival data actually behaves like a Poisson process before trusting the model
import numpy as np
from scipy import stats

rng = np.random.default_rng(3)

# True Poisson-like data (rate is constant)
normal_hours = rng.poisson(lam=4, size=200)

# Data with an outage spike mixed in - rate is NOT constant, breaking the Poisson assumption
outage_hours = np.concatenate([rng.poisson(lam=4, size=180), rng.poisson(lam=25, size=20)])

for name, data in [("normal_hours", normal_hours), ("outage_hours", outage_hours)]:
    sample_mean, sample_var = data.mean(), data.var()
    print(f"{name:14s} mean={sample_mean:.2f}  variance={sample_var:.2f}  "
          f"{'-> looks Poisson (mean ~ variance)' if abs(sample_mean - sample_var) < 1.5 else '-> NOT Poisson-like (mean != variance)'}")
# OUTPUT (typical):
# normal_hours   mean=3.95  variance=3.83  -> looks Poisson (mean ~ variance)
# outage_hours   mean=6.10  variance=25.87  -> NOT Poisson-like (mean != variance)`
            ],
            codeExplanations: [
                `A defining mathematical property of a true Poisson distribution is that its <strong>mean equals its variance</strong>. <code>normal_hours</code> simulates a genuinely stable ticket-arrival process, and its sample mean and variance come out close to each other, consistent with the Poisson assumption. <code>outage_hours</code> instead simulates a realistic scenario where 20 of the 200 hours experienced an outage-driven spike in tickets (rate jumping to 25) - mixing two different underlying rates together. This breaks the Poisson model's core assumption of a single constant rate, and it shows up numerically: the variance (25.87) is far larger than the mean (6.10), a clear sign the data is <strong>overdispersed</strong> relative to a simple Poisson model. This mean-vs-variance check is a concrete, practical way to catch a violated distributional assumption before trusting probability estimates (like staffing thresholds) computed from it.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a random variable, and what's the difference between a discrete and a continuous one?</td><td>A random variable is a function mapping the outcomes of a random process to numbers. A discrete random variable can only take a countable set of distinct values (e.g. a ticket count: 0, 1, 2, ...), while a continuous random variable can take any value within a range (e.g. a temperature reading); this distinction determines whether you ask for an exact-value probability (discrete) or a range probability (continuous)</td></tr>
<tr class='text-center'><td>Give one real ML use case each for the Normal, Bernoulli/Binomial, and Poisson distributions.</td><td>Normal: Gaussian Naive Bayes assumes continuous numeric features are normally distributed within each class, and Linear Regression assumes normally distributed residuals. Bernoulli/Binomial: Logistic Regression's output is interpreted as the parameter of a Bernoulli variable, P(y=1|x), for binary classification. Poisson: modeling count data like website visits per minute or support tickets per hour, used in Poisson Regression and capacity planning</td></tr>
<tr class='text-center'><td>Why can assuming the wrong distribution for a feature silently degrade a model instead of causing an obvious error?</td><td>Most models will still run and produce predictions regardless of whether the true underlying distribution matches the assumed one, because the fitting code doesn't validate distributional assumptions on its own; the model's estimated probabilities become poorly calibrated (e.g. GaussianNB on skewed Poisson-like count data), which can go unnoticed unless explicitly checked, for example by comparing the sample mean and variance to see whether they match what the assumed distribution predicts</td></tr>
</table>`
        }
    ]
};
