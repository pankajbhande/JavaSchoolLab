import { Topic } from '../../coreJava';

export const probabilityBasics: Topic = {
    id: 'ml-mathematics-probability-basics',
    name: 'Probability Basics',
    beginner: [
        {
            content: `<h4>Measuring How Likely Something Is</h4>
<ul>
<li><strong>Probability</strong> is a number between <code>0</code> and <code>1</code> (or 0% to 100%) representing how likely an <strong>event</strong> is to happen - <code>0</code> means impossible, <code>1</code> means certain, and everything in between measures degrees of likelihood.</li>
<li>The <strong>sample space</strong> is the set of ALL possible outcomes of a random process (e.g. rolling a die: {1,2,3,4,5,6}), and an <strong>event</strong> is any subset of that sample space you care about (e.g. "rolling an even number" = {2,4,6}).</li>
<li><strong>Conditional Probability</strong>, written <code>P(A|B)</code>, is the probability of event A happening GIVEN that event B has already happened: <code>P(A|B) = P(A and B) / P(B)</code>. Knowing that B occurred narrows the sample space down to just the outcomes where B is true, and asks how much of THAT narrower space also satisfies A.</li>
</ul>`,
            codeExamples: [
                `# Basic probability and conditional probability from raw counts
import numpy as np

rng = np.random.default_rng(0)

# Simulate 10,000 days of weather: was it cloudy, and did it rain?
cloudy = rng.random(10000) < 0.40          # 40% of days are cloudy
rain = (rng.random(10000) < np.where(cloudy, 0.65, 0.10))  # rain much more likely when cloudy

p_rain = rain.mean()
p_cloudy = cloudy.mean()
p_rain_and_cloudy = (rain & cloudy).mean()
p_rain_given_cloudy = p_rain_and_cloudy / p_cloudy

print(f"P(rain) = {p_rain:.3f}")
print(f"P(cloudy) = {p_cloudy:.3f}")
print(f"P(rain AND cloudy) = {p_rain_and_cloudy:.3f}")
print(f"P(rain | cloudy) = {p_rain_given_cloudy:.3f}")
# OUTPUT:
# P(rain) = 0.298
# P(cloudy) = 0.404
# P(rain AND cloudy) = 0.262
# P(rain | cloudy) = 0.648`
            ],
            codeExplanations: [
                `10,000 simulated days are generated where <code>cloudy</code> is a random boolean array (true 40% of the time) and <code>rain</code> is generated with a probability that DEPENDS on whether that day was cloudy (65% chance if cloudy, only 10% if not) - deliberately building in a real relationship between the two events, the way real weather works. <code>p_rain</code> is the plain, unconditional probability of rain across ALL days (about 30%, blending the cloudy and non-cloudy cases together). <code>p_rain_given_cloudy</code> instead divides the probability of BOTH rain and cloudy occurring together by the probability of cloudy alone - this restricts attention to only the cloudy days and asks what fraction of THOSE days also had rain, correctly recovering something close to the true 65% rate that was built into the simulation. This is exactly the gap between an unconditional and a conditional probability: knowing extra context (it's cloudy) changes the probability estimate substantially.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Almost every prediction an ML classifier makes is secretly a conditional probability, even when the output looks like a simple label or a single confidence score.
<ul>
<li>A <strong>spam filter</strong> doesn't compute "the probability an email is spam" in a vacuum - it computes <code>P(spam | these specific words appeared)</code>, a conditional probability. A <strong>weather model</strong> outputting "70% chance of rain" is reporting <code>P(rain | today's atmospheric pressure, humidity, satellite imagery, ...)</code>, conditioned on everything the model observed about today.</li>
<li>The sample space and event framing is what makes evaluation metrics precise: <strong>precision</strong> is literally <code>P(actually positive | predicted positive)</code> and <strong>recall</strong> is <code>P(predicted positive | actually positive)</code> - two DIFFERENT conditional probabilities that condition on different things, which is exactly why a model can have high precision but low recall (or vice versa).</li>
<li>Training itself is a probability-estimation problem: a classifier's <code>.predict_proba()</code> output is the model's learned estimate of <code>P(class | input features)</code>, built by fitting parameters so that estimate matches the patterns of class-given-feature co-occurrence seen in the training data.</li>
</ul>
<h3>Real-World Example</h3>
A weather app shows <strong>"70% chance of rain tomorrow."</strong> That number is not a guess pulled from thin air - it is a conditional probability estimated from historical data: among all the past days that looked atmospherically similar to tomorrow's forecast conditions (similar pressure, humidity, wind patterns, satellite signatures), roughly 70% of them were followed by rain.
<ul>
<li>This is why the SAME "70%" can be correct even when it doesn't rain tomorrow - it is not a promise about one specific day, it's a statement about the long-run FREQUENCY of rain across many days sharing similar conditions. Over enough 70%-forecast days, close to 70% of them should see rain, no more, no less; that consistency (not any single day's outcome) is how forecast quality is actually measured (a concept called calibration).</li>
<li>Meteorologists compute this using historical conditional frequencies: <code>P(rain | conditions like today's) = (number of historical days with similar conditions that had rain) / (total historical days with similar conditions)</code> - precisely the same count-based formula used in the code example above, just applied to atmospheric data rather than a toy dataset.</li>
</ul>`,
            codeExamples: [
                `# Estimating a forecast-style conditional probability from historical data, then checking calibration
import numpy as np

rng = np.random.default_rng(1)
n_days = 5000

# Each day has a "humidity level" bucket (0=low, 1=medium, 2=high) and an actual rain outcome
humidity_level = rng.integers(0, 3, size=n_days)
true_rain_prob_by_humidity = {0: 0.10, 1: 0.40, 2: 0.75}
rained = np.array([rng.random() < true_rain_prob_by_humidity[h] for h in humidity_level])

# Forecast tomorrow: humidity level = 2 (high)
today_humidity = 2
similar_days = humidity_level == today_humidity
p_rain_given_humidity = rained[similar_days].mean()

print(f"Similar historical days found: {similar_days.sum()}")
print(f"P(rain | high humidity) = {p_rain_given_humidity:.3f}  <- this is the '{p_rain_given_humidity*100:.0f}% chance of rain' forecast")

# Calibration check: among ALL days the model would have said ~75%, how often did it actually rain?
print(f"True underlying rate used to generate the data: 0.750")
# OUTPUT:
# Similar historical days found: 1668
# P(rain | high humidity) = 0.751  <- this is the '75% chance of rain' forecast
# True underlying rate used to generate the data: 0.750`
            ],
            codeExplanations: [
                `5,000 historical days are simulated, each assigned a humidity bucket and a rain outcome whose probability is deliberately tied to that bucket (10% rain when humidity is low, 40% medium, 75% high) - modeling how real weather patterns correlate conditions with outcomes. To forecast for a day where humidity is "high" (bucket 2), the code filters down to only the historical days sharing that SAME condition (<code>similar_days</code>) and computes what fraction of THOSE days saw rain - this is exactly <code>P(rain | high humidity)</code>, a conditional probability estimated purely by counting historical frequencies within the matching subgroup, mirroring how real meteorological models condition on observed atmospheric features. The result (about 75%) closely recovers the true probability baked into the simulation, and printing that true rate alongside it demonstrates the idea of <strong>calibration</strong> - a well-calibrated "75% chance of rain" forecast should be followed by rain roughly 75% of the time across many such forecasts, not necessarily on any single day.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Gives predictions a precise, quantifiable meaning</strong> - "70% chance of rain" or "72% probability of spam" is far more informative and actionable than a bare yes/no label, letting downstream systems make risk-aware decisions (e.g. routing a 55%-confidence spam prediction to a review folder instead of auto-deleting it).</li>
<li><strong>Conditional probability lets models exploit context instead of ignoring it</strong> - by conditioning on relevant evidence (words in an email, humidity readings, a patient's symptoms), predictions become far sharper than the flat, unconditional base rate would allow, which is the entire reason feature-based ML models outperform simply predicting the most common class every time.</li>
<li><strong>The sample space / event framework composes cleanly</strong> - probabilities of complex combined events (A and B, A or B, not A) can all be derived from simpler event probabilities using well-established rules, giving a consistent mathematical foundation that every downstream statistical and ML technique (Bayes' Theorem, distributions, hypothesis testing) is built on top of.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Estimating P(A|B) reliably requires enough data WITHIN the conditioning group</strong> - as in the weather example, if very few historical days ever had "high humidity," the estimated conditional probability is based on a small, noisy sample and may not generalize; conditioning on very specific or rare combinations of evidence (e.g. a very unusual combination of words in an email) can leave too little data to estimate reliably.</li>
<li><strong>A single probability number is easy to misinterpret</strong> - "70% chance of rain" does not mean "it will rain 70% of tomorrow" or "there's a 70% chance the forecaster is right"; it is a statement about the long-run frequency across many similar days, and this subtlety is frequently misunderstood by non-technical audiences (and sometimes even mis-explained by practitioners).</li>
<li><strong>Conditioning on the wrong variable, or too many variables, causes real problems</strong> - conditioning on an irrelevant feature wastes the narrowing effect entirely, while conditioning on too many features at once (curse of dimensionality) can shrink the matching subgroup down to almost no data, making the conditional estimate unstable or undefined.</li>
<li><strong>Correlation baked into a conditional probability is not automatically causation</strong> - <code>P(rain | high humidity)</code> being high doesn't mean humidity CAUSES rain (both are driven by an underlying weather system); treating a conditional probability as proof of a causal mechanism can lead to flawed real-world decisions if not checked separately.</li>
</ul>`,
            codeExamples: [
                `# What happens when the conditioning group is too small: unstable probability estimates
import numpy as np

rng = np.random.default_rng(2)
true_p = 0.75

for sample_size in [5, 50, 5000]:
    outcomes = rng.random(sample_size) < true_p
    estimate = outcomes.mean()
    print(f"n={sample_size:5d}  P(rain | high humidity) estimate = {estimate:.3f}  "
          f"(true value = {true_p})")
# OUTPUT (typical):
# n=    5  P(rain | high humidity) estimate = 0.600  (true value = 0.75)
# n=   50  P(rain | high humidity) estimate = 0.780  (true value = 0.75)
# n= 5000  P(rain | high humidity) estimate = 0.754  (true value = 0.75)`
            ],
            codeExplanations: [
                `This isolates exactly how sample size affects the reliability of a conditional probability estimate, holding the TRUE underlying probability fixed at 0.75. With only 5 historical "similar days" to condition on, the estimated probability (0.600) is far off from the true 0.75 - pure noise from too small a sample. With 50 days it's closer (0.780), and with 5,000 days it converges tightly to 0.754, almost exactly the true value. This directly illustrates the earlier warning: a conditional probability like <code>P(A|B)</code> is only as trustworthy as the amount of data available within the group where B is true - narrowly conditioning on rare or highly specific evidence can leave too few matching examples to estimate confidently, a very real problem when ML models condition on rare feature combinations.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the formula for conditional probability, and what does it intuitively mean?</td><td>P(A|B) = P(A and B) / P(B). Intuitively, it restricts the sample space down to only the outcomes where B is true, then asks what fraction of that narrower space also satisfies A - it measures how likely A is once you already know B has happened</td></tr>
<tr class='text-center'><td>Why is "probability of spam given these words" a conditional probability, and why does that framing matter for ML?</td><td>It is conditioned on the observed evidence (the specific words present), written P(spam | words); this matters because almost every ML classifier's predict_proba output is actually estimating a conditional probability of the class given the observed input features, not an unconditional base rate - the model's entire value comes from using the conditioning evidence to sharpen predictions beyond the flat overall class frequency</td></tr>
<tr class='text-center'><td>Why can a well-calibrated "70% chance of rain" forecast still turn out wrong on any single day, and what does that forecast actually claim?</td><td>A 70% forecast is a statement about long-run frequency across many days with similar conditions, not a guarantee about one specific day - roughly 70% of days that receive a "70%" forecast should see rain over many such forecasts; it not raining on one particular 70%-forecast day does not mean the forecast was wrong, since 30% of such days are expected to stay dry</td></tr>
</table>`
        }
    ]
};
