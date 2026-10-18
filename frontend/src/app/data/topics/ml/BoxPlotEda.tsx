import { Topic } from '../../coreJava';

export const boxPlot: Topic = {
    id: 'ml-eda-box-plot',
    name: 'Box Plot',
    beginner: [
        {
            content: `<h4>The Five-Number Summary, Drawn as a Picture</h4>
<ul>
<li>A <strong>Box Plot</strong> (or "box-and-whisker plot") draws a distribution using five numbers: the <strong>minimum</strong>, <strong>Q1</strong> (25th percentile), <strong>median</strong> (50th percentile), <strong>Q3</strong> (75th percentile), and <strong>maximum</strong> - with the box spanning Q1 to Q3 and a line marking the median inside it.</li>
<li>The distance between Q1 and Q3 is the <strong>IQR (Interquartile Range)</strong> - the "whiskers" extending from the box typically stretch to the most extreme point still within <code>1.5 &times; IQR</code> of the box.</li>
<li>Any point BEYOND the whiskers is plotted as an individual dot and flagged as a potential <strong>outlier</strong> by this convention.</li>
</ul>`,
            codeExamples: [
                `# A single box plot showing the five-number summary of delivery times
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
delivery_hours = rng.gamma(shape=4, scale=6, size=500)   # right-skewed, mostly reasonable, some long tails

print(f"Min={delivery_hours.min():.1f}  Q1={np.percentile(delivery_hours, 25):.1f}  "
      f"Median={np.median(delivery_hours):.1f}  Q3={np.percentile(delivery_hours, 75):.1f}  "
      f"Max={delivery_hours.max():.1f}")

plt.boxplot(delivery_hours, vert=True)
plt.ylabel("Delivery time (hours)")
plt.title("Delivery Time Distribution")
plt.show()
# OUTPUT (typical):
# Min=1.8  Q1=17.3  Median=23.1  Q3=29.8  Max=71.4
# Plot: a box spanning ~17 to ~30 hours with a median line near 23, whiskers
# reaching out to roughly 5 and 45 hours, and several individual dots above
# the top whisker representing unusually slow deliveries`
            ],
            codeExplanations: [
                `Simulated delivery times are generated with a right-skewed <code>gamma</code> distribution (most deliveries are reasonably fast, but a long tail of slow ones exists). The five key numbers - min, Q1, median, Q3, max - are printed explicitly, then the SAME five numbers are drawn visually as a box plot: the box itself spans Q1 to Q3 (the middle 50% of deliveries), the line inside marks the median, and the whiskers extend to the most extreme "normal" values under the 1.5&times;IQR convention. Individual dots beyond the whiskers flag specific deliveries that took unusually long - visible at a glance without having to scan a table of raw percentile numbers.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>A box plot packs five key summary numbers PLUS outlier flags into one compact shape, making it possible to eyeball spread, skew, and anomalies simultaneously - something that requires reading several separate numbers from a statistical summary table otherwise.</li>
<li>Its real strength is <strong>comparison across groups</strong> - placing several box plots side-by-side on one axis lets you compare medians, spreads, and outlier patterns across categories in a single glance, which a histogram struggles to do (overlapping histograms for many categories quickly become an unreadable mess).</li>
<li>Without this side-by-side comparison, spotting that one specific group (e.g. one warehouse, one store, one region) behaves very differently from the rest often requires manually computing and comparing summary statistics group by group - slower and easier to miss subtle differences in spread.</li>
</ul>
<h3>Real-World Example</h3>
A logistics analyst compares <strong>delivery time</strong> across 5 different warehouses using a single figure with 5 side-by-side box plots, one per warehouse.
<ul>
<li>Four of the five warehouses show tight, similar-looking boxes with medians clustered close together - business as usual.</li>
<li>One warehouse's box plot instantly stands out: its median line sits noticeably higher AND its box (and whiskers) are far wider, with a cluster of dots stretching well beyond the others - both a HIGHER typical delivery time and MUCH more inconsistency.</li>
<li>This single visual immediately narrows the investigation to one specific warehouse, instead of requiring the analyst to compute and mentally compare five separate summary tables.</li>
</ul>`,
            codeExamples: [
                `# Comparing delivery time across 5 warehouses with side-by-side box plots
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)

data = {
    "Warehouse A": rng.gamma(4, 5, 300),
    "Warehouse B": rng.gamma(4, 5, 300),
    "Warehouse C": rng.gamma(4, 5, 300),
    "Warehouse D": rng.gamma(4, 5, 300),
    "Warehouse E (problem site)": rng.gamma(3, 14, 300),   # higher AND more variable
}
df = pd.DataFrame(data)

print(df.median().round(1))
print(df.std().round(1))

plt.boxplot(df.values, tick_labels=df.columns, vert=True)
plt.ylabel("Delivery time (hours)")
plt.xticks(rotation=20)
plt.title("Delivery Time by Warehouse")
plt.show()
# OUTPUT (typical):
# Warehouse A                    19.8
# Warehouse B                    20.1
# Warehouse C                    19.6
# Warehouse D                    20.3
# Warehouse E (problem site)     41.9
# dtype: float64
# ... (std for E is roughly 3x the others)
# Plot: four similar, compact boxes, and one (Warehouse E) sitting much
# higher on the axis with a visibly taller box and more outlier dots`
            ],
            codeExplanations: [
                `Five warehouses' delivery times are simulated, four with identical, well-behaved distributions and one ("Warehouse E") deliberately built with both a higher typical value AND a wider spread. The printed medians and standard deviations already hint at the problem numerically, but the box plot makes it immediately visual: Warehouse E's box sits distinctly higher on the shared axis and is visibly taller (wider IQR), with more dots scattered beyond its whiskers. Because all five box plots share the same y-axis, the comparison is direct and instant - exactly the side-by-side comparison a histogram (which would need 5 separate, overlapping plots) handles far more awkwardly.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Excellent for comparing distributions across many groups at once</strong> - placing N box plots on a shared axis lets you compare medians, spreads, and outliers across all N groups simultaneously, a use case histograms handle poorly once more than 2-3 groups are involved.</li>
<li><strong>Compact</strong> - a box plot conveys five numbers plus outlier flags in a small, consistent visual footprint, making it practical to show many categories side-by-side without the plot becoming cluttered.</li>
<li><strong>Robust to outliers by construction</strong> - the box itself (Q1-median-Q3) is based on percentiles, so a handful of extreme values don't distort the box the way they would distort a mean-based visualization; those extreme points are instead clearly called out as separate dots.</li>
<li><strong>Standardized outlier convention</strong> - the 1.5&times;IQR whisker rule gives a consistent, reproducible definition of "unusual" that's easy to communicate and apply automatically across many columns.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Hides the actual distribution shape</strong> - a box plot cannot distinguish a smooth, single-peaked distribution from a bimodal one; two very differently-shaped distributions can produce nearly identical box plots if their five-number summaries happen to match.</li>
<li><strong>Doesn't show sample size or density</strong> - a box built from 10 data points looks exactly as confident as one built from 10,000; without checking the underlying count, a box plot can visually overstate how reliable a group's summary is.</li>
<li><strong>The 1.5&times;IQR "outlier" convention is a rule of thumb, not a statistical guarantee</strong> - it will flag some points in a perfectly normal distribution purely by chance, and may fail to flag genuinely anomalous points in a distribution that's naturally very spread out.</li>
<li><strong>Loses granularity a histogram preserves</strong> - because a box plot reduces everything to five summary numbers, subtle patterns like a small secondary cluster within the box are completely invisible; a histogram (or a box plot supplemented with an overlaid strip/violin plot) is needed to catch that.</li>
</ul>`,
            codeExamples: [
                `# Two distributions with nearly identical box plots but very different underlying shapes
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(2)

smooth = rng.normal(loc=50, scale=10, size=1000)
bimodal = np.concatenate([rng.normal(35, 4, 500), rng.normal(65, 4, 500)])

for name, arr in [("Smooth (normal)", smooth), ("Bimodal (two groups)", bimodal)]:
    print(f"{name}: Q1={np.percentile(arr,25):.1f} median={np.median(arr):.1f} Q3={np.percentile(arr,75):.1f}")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].boxplot(smooth); axes[0].set_title("Smooth")
axes[1].boxplot(bimodal); axes[1].set_title("Bimodal")
plt.show()
# OUTPUT (typical):
# Smooth (normal): Q1=43.3 median=50.1 Q3=56.8
# Bimodal (two groups): Q1=35.3 median=49.8 Q3=64.6
# Plot: both box plots look like ordinary, unremarkable boxes of similar
# size - nothing in either one hints that the "Bimodal" data is actually
# two completely separate clusters with almost nothing in the middle`
            ],
            codeExplanations: [
                `A smooth, single-peaked normal distribution is compared against a genuinely bimodal distribution (two separate clusters centered at 35 and 65, with almost no data in between). Their five-number summaries and resulting box plots end up looking broadly similar - a box of moderate width with a median roughly in the middle - even though the underlying shapes are completely different. This is exactly the box plot's key blind spot: because it only ever summarizes a distribution down to five percentile-based numbers, structural details like bimodality, gaps, or clusters are invisible unless a histogram (or violin plot) is used alongside it.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What five values does a box plot display, and how are the whiskers determined?</td><td>Minimum, Q1 (25th percentile), median, Q3 (75th percentile), and maximum, with the box spanning Q1 to Q3; the whiskers typically extend to the most extreme data point still within 1.5 times the IQR (Q3 minus Q1) of the box, and any point beyond that is plotted individually as a potential outlier</td></tr>
<tr class='text-center'><td>Why would you choose a box plot over a histogram when comparing a numeric feature across several categories?</td><td>Box plots for several groups can be placed side-by-side on one shared axis, making it easy to compare medians, spreads, and outliers across all groups at a glance; overlapping histograms for more than two or three groups quickly become visually cluttered and hard to read by comparison</td></tr>
<tr class='text-center'><td>What key information can a box plot hide that a histogram would reveal?</td><td>The actual shape of the distribution - a box plot reduces data to five percentile-based numbers, so it cannot distinguish a single smooth peak from a bimodal distribution (two separate clusters) if their quartiles happen to be similar; a histogram shows that structural detail directly</td></tr>
</table>`
        }
    ]
};
