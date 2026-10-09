import { Topic } from '../../coreJava';

export const histogram: Topic = {
    id: 'ml-eda-histogram',
    name: 'Histogram',
    beginner: [
        {
            content: `<h4>Seeing the Shape of a Distribution</h4>
<ul>
<li>A <strong>Histogram</strong> splits a continuous numeric column into consecutive ranges called <strong>bins</strong>, then draws a bar for each bin whose height is the COUNT of values that fall inside it.</li>
<li>Unlike a bar chart of categories, a histogram's x-axis is a continuous number line chopped into equal-width intervals - the shape of the bars reveals the DISTRIBUTION of the data at a glance.</li>
<li>The number of bins (or bin width) is a choice YOU make - too few bins hides real structure, too many makes the plot look like random noise.</li>
</ul>`,
            codeExamples: [
                `# A histogram of order values reveals a spike a mean value would hide
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)

normal_orders = rng.lognormal(mean=3.2, sigma=0.6, size=950)   # typical paid orders
free_trial_bugs = np.zeros(50)                                 # $0 orders from a trial-abuse bug
order_values = np.concatenate([normal_orders, free_trial_bugs])

print(f"Mean order value: \${order_values.mean():.2f}")

plt.hist(order_values, bins=40, edgecolor="black")
plt.xlabel("Order value ($)")
plt.ylabel("Number of orders")
plt.title("Distribution of Order Values")
plt.show()
# OUTPUT:
# Mean order value: $26.79
# Plot: a tall, narrow spike of bars right at $0, then a separate hump of bars
# spread out between roughly $10 and $80 - two visually distinct clusters,
# something the single mean number gives no hint of at all`
            ],
            codeExplanations: [
                `1000 simulated order values are built from two very different sources mixed together: 950 realistic paid orders (log-normally distributed, mostly $10-$80) and 50 suspicious $0 orders representing a free-trial-abuse bug. The single <code>mean</code> value ($26.79) looks like an unremarkable, ordinary number - it gives zero indication that anything is wrong. The histogram, by contrast, immediately shows a tall spike of bars sitting right at $0, completely separate from the main hump of legitimate order values - visually impossible to miss, and impossible to see from a summary statistic alone.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Summary statistics like the mean or standard deviation compress an entire column down to one or two numbers - a histogram shows the FULL shape, so it catches problems and patterns those numbers can hide entirely (as with the order-value spike).</li>
<li>Many modeling choices depend on distribution SHAPE, not just central tendency: whether a feature needs a log-transform (heavily right-skewed data), whether a Gaussian-assuming model is appropriate, or whether a column is secretly bimodal (two different populations mixed together) and might benefit from being split into two features.</li>
<li>Without visualizing the shape first, skew, multimodality, and data-entry spikes routinely go unnoticed until they cause confusing model behavior much later in a project - by which point the debugging is far more expensive.</li>
</ul>
<h3>Real-World Example</h3>
An analyst investigating an e-commerce dataset plots a histogram of <strong>order value</strong> as one of the very first EDA steps. Instead of the expected smooth, right-skewed shape, the histogram shows an unmistakable tall spike of bars sitting exactly at $0.
<ul>
<li>Digging into the $0 orders reveals they all originate from a specific promo-code path - a bug lets some users repeatedly claim a "$0 first order" trial offer meant to be used once.</li>
<li>Had the analyst only checked the <strong>mean</strong> order value, this cluster of $0 orders would have simply nudged the average down slightly - nothing about that single number would have raised a flag or pointed at a bug.</li>
<li>This single histogram catches a real revenue-losing bug before it ever reaches a model, let alone a business report.</li>
</ul>`,
            codeExamples: [
                `# Detecting a bimodal (two-population) distribution that summary stats would flatten into one number
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)

# session durations: two distinct populations mixed in one column - quick bounces and engaged sessions
bounces = rng.normal(loc=8, scale=3, size=600)     # seconds
engaged = rng.normal(loc=300, scale=60, size=400)  # seconds
session_seconds = np.concatenate([bounces, engaged])
session_seconds = session_seconds[session_seconds > 0]

s = pd.Series(session_seconds)
print(s.describe())

plt.hist(session_seconds, bins=50, edgecolor="black")
plt.xlabel("Session duration (seconds)")
plt.ylabel("Number of sessions")
plt.title("Session Duration Distribution")
plt.show()
# OUTPUT (typical):
# count    1000.00
# mean      127.85
# std       143.92
# ...
# Plot: two clearly separate humps - one tight cluster near 0-20 seconds
# (quick bounces) and a second, wider cluster around 200-400 seconds
# (engaged sessions) - "mean=127.85" describes essentially neither group`
            ],
            codeExplanations: [
                `Two genuinely different visitor behaviors are mixed into one <code>session_seconds</code> column: quick "bounce" visits (a few seconds) and genuinely engaged sessions (several minutes). The <code>.describe()</code> summary reports a mean of about 128 seconds - a number that doesn't describe EITHER real group; no bounce visitor spends 128 seconds, and no engaged visitor spends only 128 seconds either. The histogram immediately reveals the truth as two separate humps (bimodal distribution), which strongly suggests these are really two different populations that might deserve separate features (e.g. a <code>is_bounce</code> flag) rather than being treated as one smooth numeric column.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Reveals shape that no single number can</strong> - skew, multimodality, gaps, and spikes are all instantly visible in a histogram, while a mean/median/std triplet can look perfectly ordinary even when the underlying data is deeply unusual (as the order-value spike and bimodal session examples show).</li>
<li><strong>Fast and cheap</strong> - a histogram for every numeric column can be generated in seconds with <code>df.hist()</code>, making it a natural first-pass tool to scan an entire new dataset.</li>
<li><strong>Directly informs preprocessing decisions</strong> - a heavily right-skewed histogram is a strong visual cue to consider a log or Box-Cox transform before feeding the feature into a model that assumes roughly normal inputs.</li>
<li><strong>Works on any distribution shape</strong> - unlike some visualizations, histograms don't assume normality or any particular shape going in; whatever the data actually looks like is what gets drawn.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Bin count/width is a subjective choice that changes the story</strong> - too few bins (e.g. 5) can smear the $0-order spike into an unremarkable-looking left edge, while too many bins (e.g. 500) on a modest sample can make even a smooth distribution look jagged and noisy purely from sampling randomness.</li>
<li><strong>Only shows ONE variable at a time</strong> - a histogram alone can't reveal that a spike in order value is specifically tied to a certain promo code or a certain user segment; that requires cross-referencing with another column (e.g. a grouped histogram or a box plot split by category).</li>
<li><strong>Sensitive to sample size</strong> - with very few data points, a histogram's bars are dominated by random noise rather than the true underlying shape, and can mislead more than help.</li>
<li><strong>Doesn't show exact values well</strong> - a histogram is great for shape but poor for reading off precise statistics (e.g. "what's the exact 90th percentile?"); a statistical summary table is better suited for that.</li>
</ul>`,
            codeExamples: [
                `# Same data, three different bin counts - showing how bin choice changes what you see
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(2)
normal_orders = rng.lognormal(mean=3.2, sigma=0.6, size=950)
free_trial_bugs = np.zeros(50)
order_values = np.concatenate([normal_orders, free_trial_bugs])

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for ax, bins in zip(axes, [5, 40, 300]):
    ax.hist(order_values, bins=bins, edgecolor="black")
    ax.set_title(f"bins={bins}")
plt.show()
# OUTPUT:
# bins=5:   the $0 spike gets absorbed into one wide left-most bar alongside
#           low-value legit orders - the anomaly is nearly invisible
# bins=40:  a clean, clearly separated spike at $0 next to the main hump -
#           the sweet spot for this dataset
# bins=300: real shape is visible but bars look jagged and noisy, with many
#           near-empty bins - harder to read at a glance`
            ],
            codeExplanations: [
                `The exact same order-value data (including the injected $0 bug orders) is plotted three times with drastically different bin counts. With only 5 bins, each bar spans a wide dollar range, so the $0 orders get lumped in with legitimately low-value orders and the anomaly nearly disappears. With 300 bins, the plot becomes visually noisy - individual bars are so thin that random sampling variation dominates the picture, making the true shape harder to read despite technically containing more detail. The 40-bin version sits in a practical middle ground where the spike is clearly separated from the main distribution without excessive noise - illustrating why bin choice isn't a purely technical detail but an active decision that shapes what story the histogram tells.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why would you plot a histogram instead of just looking at the mean and standard deviation of a column?</td><td>Mean and standard deviation compress a column into two numbers and can look perfectly ordinary even when the data has serious structure - a spike of suspicious values, two separate populations mixed together (bimodality), or heavy skew - all of which a histogram reveals visually but a couple of summary numbers can completely hide</td></tr>
<tr class='text-center'><td>What happens if you choose too few or too many bins in a histogram?</td><td>Too few bins is over-smoothing - narrow spikes or gaps in the data get absorbed into wide bars and disappear from view; too many bins is under-smoothing - the plot becomes dominated by random sampling noise, with many sparse or empty bars that obscure the true underlying shape rather than reveal it</td></tr>
<tr class='text-center'><td>You see a histogram with two separate humps (bimodal). What would you investigate next?</td><td>Whether the column is actually mixing two different populations or behaviors (e.g. bounce visits vs engaged sessions, or two different customer segments) - if so, it's often worth splitting them into a separate categorical feature or handling them differently in preprocessing, rather than treating the column as one smooth numeric distribution</td></tr>
</table>`
        }
    ]
};
