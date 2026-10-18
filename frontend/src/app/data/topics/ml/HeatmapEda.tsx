import { Topic } from '../../coreJava';

export const heatmap: Topic = {
    id: 'ml-eda-heatmap',
    name: 'Heatmap',
    beginner: [
        {
            content: `<h4>Turning a Grid of Numbers Into Color</h4>
<ul>
<li>A <strong>Heatmap</strong> displays a matrix of numbers by mapping each value to a COLOR (typically dark-to-light or a diverging color scale) instead of printing the raw digits - the eye scans color patterns far faster than it reads a table of decimals.</li>
<li>The most common EDA use is a <strong>correlation heatmap</strong>: every feature is placed on both axes, and each cell's color shows how strongly that pair of features correlates - typically using a diverging scale (e.g. blue for negative, red for positive, white/light for near-zero).</li>
<li>Heatmaps are also used for confusion matrices, missing-value patterns across columns, and any other naturally grid-shaped numeric data.</li>
</ul>`,
            codeExamples: [
                `# A correlation heatmap makes strong relationships jump out visually
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
n = 500

sqft = rng.uniform(600, 4000, n)
price = sqft * 150 + rng.normal(0, 30000, n)
bedrooms = np.round(sqft / 700 + rng.normal(0, 0.5, n)).clip(1, 6)
distance_to_city_km = rng.uniform(1, 50, n)

df = pd.DataFrame({"sqft": sqft, "bedrooms": bedrooms, "distance_to_city_km": distance_to_city_km, "price": price})

corr = df.corr()
print(corr.round(2))

sns.heatmap(corr, annot=True, cmap="coolwarm", center=0, vmin=-1, vmax=1)
plt.title("Feature Correlation Heatmap")
plt.show()
# OUTPUT (typical):
#                        sqft  bedrooms  distance_to_city_km  price
# sqft                   1.00      0.85                -0.02   0.93
# bedrooms               0.85      1.00                -0.01   0.79
# distance_to_city_km   -0.02     -0.01                 1.00  -0.03
# price                  0.93      0.79                -0.02   1.00
# Plot: a grid of colored squares - deep red where sqft/bedrooms/price meet
# (strong positive correlation), and pale/white where distance_to_city_km
# meets anything else (near-zero correlation)`
            ],
            codeExplanations: [
                `A housing dataset's correlation matrix is computed with <code>df.corr()</code>, producing a 4x4 table of decimal numbers - readable, but requiring the eye to scan and compare individual values one by one. Passing the exact same matrix to <code>sns.heatmap()</code> with a diverging <code>coolwarm</code> color map turns each number into a colored square: strong positive correlations (sqft-price, sqft-bedrooms) appear as deep red, and the near-zero correlations involving <code>distance_to_city_km</code> appear pale or white. The overall pattern - which features cluster together strongly versus which are essentially unrelated - becomes obvious in one glance at the color grid, rather than requiring a careful read of every individual number in the table.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>As the number of features grows, a raw correlation TABLE becomes impractical to scan manually - a dataset with 20 features has a 20x20 correlation matrix, or 190 unique pairs; finding the handful of pairs that matter by reading numbers is slow and error-prone, while a heatmap's color intensity makes the strongest relationships pop out instantly.</li>
<li>Heatmaps are one of the fastest ways to catch <strong>multicollinearity</strong> during EDA - two features that are suspiciously strongly correlated with EACH OTHER (not just with the target) show up as an unexpectedly dark off-diagonal cell, flagging a redundancy problem before it destabilizes a linear model.</li>
<li>Without this fast visual scan, multicollinearity or an unexpectedly strong/weak feature relationship can go unnoticed until a model produces confusing results (unstable coefficients, a feature "importance" that doesn't match intuition) much later in the project.</li>
</ul>
<h3>Real-World Example</h3>
A data scientist explores a housing dataset with <strong>20 numeric features</strong> (square footage, number of bedrooms, distance to city center, year built, lot size, and more) and builds a single correlation heatmap covering all of them at once.
<ul>
<li>Scanning the row/column for <code>price</code>, several deep-red cells instantly identify which features are strongly correlated with price - useful, fast first-pass feature-importance information.</li>
<li>But the heatmap ALSO reveals something the target-focused view alone would miss: two features unrelated to price on their face, like <code>num_bathrooms</code> and <code>sqft</code>, show a suspiciously dark cell where they intersect EACH OTHER - a multicollinearity red flag worth investigating before trusting a linear model's individual coefficients.</li>
<li>Spotting both of these patterns from a table of 190 raw decimal numbers would take far longer and risks missing the less-obvious feature-vs-feature correlations entirely, since attention naturally gravitates to the target row/column first.</li>
</ul>`,
            codeExamples: [
                `# Scanning a larger correlation heatmap programmatically for the strongest off-diagonal pairs
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
n = 500

sqft = rng.uniform(600, 4000, n)
num_bathrooms = sqft / 500 + rng.normal(0, 0.3, n)   # strongly tied to sqft, not to price directly
price = sqft * 150 + rng.normal(0, 30000, n)
year_built = rng.uniform(1950, 2023, n)
lot_size = rng.uniform(1000, 20000, n)

df = pd.DataFrame({
    "sqft": sqft, "num_bathrooms": num_bathrooms, "price": price,
    "year_built": year_built, "lot_size": lot_size,
})

corr = df.corr().abs()
np.fill_diagonal(corr.values, 0)   # ignore each feature's perfect correlation with itself

pairs = corr.unstack().sort_values(ascending=False)
pairs = pairs[pairs.index.get_level_values(0) < pairs.index.get_level_values(1)]  # drop duplicate mirror pairs
print("Strongest feature-feature and feature-target relationships:")
print(pairs.head(5).round(2))
# OUTPUT (typical):
# sqft            price             0.93
# sqft            num_bathrooms     0.91   <- multicollinearity red flag: unrelated to price directly, tied to sqft
# num_bathrooms   price             0.85
# year_built      lot_size          0.05
# num_bathrooms   lot_size          0.03`
            ],
            codeExplanations: [
                `Instead of just eyeballing the heatmap, this programmatically extracts the STRONGEST correlations across the whole matrix: the diagonal (each feature with itself, always 1.0) is zeroed out, mirrored duplicate pairs are dropped, and the remaining pairs are sorted by absolute correlation strength. The result surfaces both an expected relationship (<code>sqft</code> vs <code>price</code>, 0.93) AND a multicollinearity red flag (<code>sqft</code> vs <code>num_bathrooms</code>, 0.91) - two features that are highly related to EACH OTHER, meaning a linear model would struggle to cleanly separate their individual effects on price. This kind of systematic top-N scan is exactly what a heatmap's color intensity does visually in one glance, at any number of features.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Scales to many features far better than a raw table</strong> - human pattern recognition on color is much faster than reading dozens or hundreds of individual decimal numbers, making heatmaps practical for scanning correlation matrices with 20, 50, or more features.</li>
<li><strong>Surfaces both target relationships AND feature-feature redundancy in one view</strong> - a single heatmap answers "what predicts the target" and "what's redundant with what" simultaneously, without needing two separate analyses.</li>
<li><strong>General-purpose, not just for correlation</strong> - the same color-encoding idea applies to confusion matrices, missing-value patterns across columns and rows, and any other naturally matrix-shaped data, making it a broadly reusable EDA tool.</li>
<li><strong>Annotatable</strong> - tools like seaborn's <code>annot=True</code> can overlay the exact numeric value on top of each colored cell, combining the best of both worlds: fast visual scanning plus precise values on demand.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>An unbounded or poorly chosen color scale can mislead</strong> - if the color range isn't fixed to a sensible span (e.g. -1 to 1 for correlations), a heatmap can make weak correlations look artificially strong (or vice versa) purely because of how the color scale auto-adjusted to the specific data.</li>
<li><strong>Too many features makes even a heatmap unreadable</strong> - beyond roughly 40-50 features, cell labels become too small to read, and the sheer number of colored squares can overwhelm rather than clarify; hierarchical clustering of the rows/columns or focusing on a filtered subset of features becomes necessary.</li>
<li><strong>Color perception isn't perfectly uniform</strong> - some color scales (especially rainbow-style ones) can visually exaggerate small differences in some ranges and compress large differences in others; a well-chosen diverging or sequential palette (like <code>coolwarm</code> or <code>viridis</code>) is important to avoid this.</li>
<li><strong>Shows correlation only (in the common EDA use case), not causation</strong> - like any correlation-based tool, a heatmap can make two features look strongly related purely because they're both driven by a hidden third variable, without any direct causal link between them.</li>
</ul>`,
            codeExamples: [
                `# Why fixing the color scale (vmin/vmax) matters for honest comparison
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

rng = np.random.default_rng(2)
n = 400
df = pd.DataFrame({
    "a": rng.normal(size=n),
    "b": rng.normal(size=n),
    "c": rng.normal(size=n),
})
df["b"] = df["a"] * 0.3 + rng.normal(scale=0.9, size=n)   # only weakly related to a
corr = df.corr()
print(corr.round(2))

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
sns.heatmap(corr, annot=True, cmap="coolwarm", ax=axes[0])                       # auto-scaled
axes[0].set_title("Auto color scale")
sns.heatmap(corr, annot=True, cmap="coolwarm", vmin=-1, vmax=1, ax=axes[1])      # fixed scale
axes[1].set_title("Fixed scale (-1 to 1)")
plt.show()
# OUTPUT (typical):
#      a     b     c
# a  1.00  0.31  0.02
# b  0.31  1.00 -0.01
# c  0.02 -0.01  1.00
# Left plot: auto-scaling stretches color contrast across the small range
# actually present, making the weak 0.31 correlation look visually almost
# as intense as a strong one
# Right plot: fixed to the full -1..1 range, the same 0.31 correctly
# appears as a pale, unremarkable color`
            ],
            codeExplanations: [
                `Three mostly-independent variables are created, with <code>b</code> given only a mild (0.31) relationship to <code>a</code>. Plotted with seaborn's DEFAULT auto-scaling, the color range stretches to fit whatever min/max values are actually present in this specific matrix - which can make a modest 0.31 correlation appear almost as visually intense as a genuinely strong relationship, since the color scale has nothing bigger to compare it against. Fixing <code>vmin=-1, vmax=1</code> (the true possible range for a correlation coefficient) forces every heatmap to use a consistent, comparable color scale, correctly rendering the 0.31 correlation as pale and unremarkable. This is exactly the kind of visual scale pitfall to watch for - and fix - before drawing conclusions from a heatmap's colors.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a heatmap instead of just printing a correlation matrix as a table of numbers?</td><td>Human pattern recognition scans color far faster than it reads a grid of decimal numbers, especially as the number of features grows - a 20-feature dataset has 190 unique pairs, and a heatmap lets the strongest relationships (and, importantly, any multicollinearity between features) jump out visually in seconds rather than requiring a careful manual scan of the table</td></tr>
<tr class='text-center'><td>What is a common pitfall when interpreting a correlation heatmap's colors?</td><td>Letting the color scale auto-adjust to the min/max values present in that specific matrix, which can make a weak correlation look visually intense if nothing stronger is present for contrast; fixing the color scale to the true possible range (e.g. -1 to 1 for correlations) keeps the visual comparison honest</td></tr>
<tr class='text-center'><td>Besides correlation matrices, what else is a heatmap commonly used for in machine learning?</td><td>Confusion matrices (color-coding how often each actual class was predicted as each other class), visualizing patterns of missing data across columns and rows, and generally any matrix-shaped numeric data where visual pattern recognition would be faster than reading raw numbers</td></tr>
</table>`
        }
    ]
};
