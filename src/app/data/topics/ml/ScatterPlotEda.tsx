import { Topic } from '../../coreJava';

export const scatterPlot: Topic = {
    id: 'ml-eda-scatter-plot',
    name: 'Scatter Plot',
    beginner: [
        {
            content: `<h4>Plotting Two Numeric Variables as Points</h4>
<ul>
<li>A <strong>Scatter Plot</strong> places every row of data as a single point, using one numeric column for the x-axis position and another for the y-axis position - the resulting cloud of points visually reveals how the two variables relate.</li>
<li>A tight upward or downward diagonal cloud suggests a <strong>linear relationship</strong> (positive or negative); a curved cloud suggests a <strong>nonlinear relationship</strong>; a shapeless, uniform cloud suggests little to <strong>no relationship</strong> at all.</li>
<li>Scatter plots also expose <strong>clusters</strong> (visually separate groups of points) and <strong>outliers</strong> (individual points far from the main cloud) that a single correlation number would never reveal.</li>
</ul>`,
            codeExamples: [
                `# Scatter plot of engine size vs fuel efficiency, revealing a curved (nonlinear) relationship
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
engine_size_liters = rng.uniform(1.0, 6.0, 300)
# fuel efficiency drops off in a curve, not a straight line, as engine size grows
mpg = 55 - 4.5 * engine_size_liters + 0.4 * engine_size_liters**2 + rng.normal(0, 2, 300)

correlation = np.corrcoef(engine_size_liters, mpg)[0, 1]
print(f"Linear correlation: {correlation:.2f}")

plt.scatter(engine_size_liters, mpg, alpha=0.6)
plt.xlabel("Engine size (liters)")
plt.ylabel("Fuel efficiency (MPG)")
plt.title("Engine Size vs Fuel Efficiency")
plt.show()
# OUTPUT (typical):
# Linear correlation: -0.83
# Plot: a clear downward-curving arc of points - efficiency drops steeply
# for small-to-mid engines, then the drop-off visibly flattens out for the
# largest engines, rather than following one straight diagonal line`
            ],
            codeExplanations: [
                `Fuel efficiency (MPG) is deliberately generated as a QUADRATIC (curved) function of engine size, not a straight line. The Pearson correlation coefficient (-0.83) does confirm a strong overall negative association, but that single number can't distinguish "strong straight-line relationship" from "strong curved relationship" - it treats both the same. The scatter plot resolves the ambiguity instantly: the cloud of points visibly bends, dropping steeply at first and then flattening out, rather than following a single straight diagonal. That visual cue is exactly what would prompt trying Polynomial Regression instead of assuming a plain linear fit.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Correlation coefficients and linear regression both assume a STRAIGHT-LINE relationship by default - fitting a linear model to a genuinely curved relationship (like engine size vs MPG) produces systematic errors: the model underestimates efficiency in the middle of the range and overestimates it at the extremes, no matter how much data is added.</li>
<li>A scatter plot is often the FASTEST way to catch this mismatch, because the human eye is extremely good at spotting curvature, clusters, and outliers in a point cloud - far faster than deriving the same insight from residual analysis after a model is already trained.</li>
<li>Without this check, teams sometimes waste modeling cycles tuning a linear model's hyperparameters when the real problem is that a linear model was never going to fit this relationship well in the first place, regardless of tuning.</li>
</ul>
<h3>Real-World Example</h3>
An automotive analyst plots <strong>engine size</strong> against <strong>fuel efficiency</strong> for a dataset of vehicles, expecting a simple straight-line downward trend.
<ul>
<li>The scatter plot instead shows a visibly curved cloud - efficiency drops sharply as engine size increases from small to mid-range, but the drop clearly LEVELS OFF for the largest engines, rather than continuing in a straight line.</li>
<li>Spotting this curve visually, BEFORE fitting any model, directly informs the modeling choice: instead of defaulting to plain Linear Regression, the analyst tries <strong>Polynomial Regression</strong> (adding an engine-size-squared term), which fits the curved shape far better.</li>
<li>Color-coding the same scatter plot points by a third variable, such as <strong>vehicle type</strong> (sedan, SUV, truck), can reveal that the curve is actually made up of several distinct clusters - each vehicle type occupying its own region of the plot - adding a third dimension of insight without needing a fully separate multivariate chart.</li>
</ul>`,
            codeExamples: [
                `# Adding a third variable via color-coding: does the "curve" hide separate clusters by vehicle type?
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)

vehicle_types = rng.choice(["Sedan", "SUV", "Truck"], size=300, p=[0.4, 0.35, 0.25])
base_size = {"Sedan": 1.8, "SUV": 3.0, "Truck": 4.5}
engine_size = np.array([base_size[v] + rng.normal(0, 0.4) for v in vehicle_types])
mpg = 55 - 4.5 * engine_size + 0.4 * engine_size**2 + rng.normal(0, 1.5, 300)

colors = {"Sedan": "tab:blue", "SUV": "tab:orange", "Truck": "tab:green"}
for v in ["Sedan", "SUV", "Truck"]:
    mask = vehicle_types == v
    plt.scatter(engine_size[mask], mpg[mask], label=v, color=colors[v], alpha=0.6)
plt.xlabel("Engine size (liters)")
plt.ylabel("Fuel efficiency (MPG)")
plt.legend(title="Vehicle Type")
plt.title("Engine Size vs Fuel Efficiency, by Vehicle Type")
plt.show()
# OUTPUT (typical):
# Plot: three color-coded clusters strung along the same overall curve -
# blue (Sedan) points cluster at low engine sizes/high MPG, green (Truck)
# points cluster at high engine sizes/low MPG, with SUV in between -
# revealing the "curve" is partly explained by vehicle type segments`
            ],
            codeExplanations: [
                `The same engine-size-vs-MPG relationship is re-plotted, but each point is now color-coded by <code>vehicle_types</code> (Sedan, SUV, Truck), which was built to correlate with engine size (sedans tend to have small engines, trucks large ones). The resulting plot shows the three vehicle types occupying visually distinct regions along the same overall curve - a piece of structure a single-color scatter plot would leave completely hidden. This third-variable color-coding is a lightweight way to pack more insight into one 2D scatter plot, and serves as a natural stepping stone toward full multivariate analysis (e.g. faceted plots or pair plots) once more than one extra variable needs to be considered at once.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Shows the actual SHAPE of a relationship, not just its strength</strong> - a scatter plot distinguishes linear, nonlinear, and no relationship at a glance, something a single correlation coefficient cannot do since it only measures LINEAR association.</li>
<li><strong>Reveals clusters and outliers directly</strong> - individual unusual points (a luxury sports car with a small engine but poor MPG) or entire sub-groups of data stand out visually as soon as the points are plotted, prompting further investigation.</li>
<li><strong>Extends naturally with color/size encoding</strong> - a third categorical or numeric variable can be layered on via point color or size, packing extra information into a still-readable 2D plot without needing a full 3D visualization.</li>
<li><strong>No binning decisions required</strong> - unlike a histogram, a scatter plot doesn't require choosing a bin width that could hide or exaggerate structure; every individual data point is shown exactly as it is.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Overplotting hides structure at large sample sizes</strong> - with tens of thousands of points, they overlap into a dense, uninterpretable blob; techniques like transparency (<code>alpha</code>), sampling a subset, or switching to a 2D density/hexbin plot become necessary.</li>
<li><strong>Only two (or a few, with color/size) variables at once</strong> - a scatter plot doesn't scale to inspecting relationships among dozens of features simultaneously; a correlation heatmap or pair-plot grid is needed for that broader view.</li>
<li><strong>Visual judgments of relationship strength are subjective</strong> - two analysts can disagree on how "strong" or "curved" a cloud of points looks; a scatter plot should inform, not replace, a quantitative check (correlation coefficient, a fitted curve's R&sup2;).</li>
<li><strong>Can mislead with a highly skewed axis</strong> - if one variable has a few extreme values, most of the point cloud can get visually squashed into a small corner of the plot, making the real relationship among the bulk of the data hard to see without a log-scale axis or filtering.</li>
</ul>`,
            codeExamples: [
                `# Overplotting: the same relationship becomes unreadable at scale without adjustment
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(2)
n = 50000
x = rng.uniform(1, 6, n)
y = 55 - 4.5 * x + 0.4 * x**2 + rng.normal(0, 2, n)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].scatter(x, y, s=5)
axes[0].set_title(f"No adjustment (n={n:,})")

axes[1].scatter(x, y, s=5, alpha=0.05)
axes[1].set_title("With alpha=0.05 (transparency)")
plt.show()
# OUTPUT:
# Left plot: a solid, indistinct block of overlapping black dots - the
# underlying curve is completely obscured
# Right plot: transparency lets overlapping regions appear darker, so
# the true density and the curved shape become visible again`
            ],
            codeExplanations: [
                `50,000 points are plotted with the default fully-opaque markers, producing a solid mass where individual points can no longer be distinguished and the underlying curved relationship is effectively invisible - a textbook overplotting problem at this sample size. Setting <code>alpha=0.05</code> makes each point mostly transparent, so areas where MANY points overlap appear visibly darker than sparser areas, restoring a readable sense of point density and revealing the curve again. This demonstrates why scatter plots that work perfectly at hundreds of points can require deliberate adjustment (transparency, sampling, or a density-based alternative like a hexbin plot) once the dataset grows large.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why might you plot a scatter plot even after already computing a correlation coefficient between two variables?</td><td>Correlation only measures LINEAR association and reduces the relationship to a single number - it can't tell you whether the true relationship is actually curved (nonlinear), whether there are distinct clusters, or whether a few outliers are driving the correlation value; a scatter plot exposes all of that visually</td></tr>
<tr class='text-center'><td>A scatter plot of two variables shows a clear curve rather than a straight line. What does that suggest for modeling?</td><td>A plain linear model (or linear correlation) will systematically misfit the relationship; it's worth trying a model that can capture curvature, such as Polynomial Regression, a spline-based model, or a nonlinear/tree-based model, rather than assuming linearity by default</td></tr>
<tr class='text-center'><td>How can you fit more than two variables' worth of information into a single scatter plot?</td><td>By encoding a third variable using point color (for a categorical variable, like vehicle type) or point size (for a numeric variable), which lets patterns tied to that third variable emerge visually without needing a full separate multivariate visualization</td></tr>
</table>`
        }
    ]
};
