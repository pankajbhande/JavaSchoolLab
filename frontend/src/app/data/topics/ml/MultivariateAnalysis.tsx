import { Topic } from '../../coreJava';

export const multivariateAnalysis: Topic = {
    id: 'ml-eda-multivariate-analysis',
    name: 'Multivariate Analysis',
    beginner: [
        {
            content: `<h4>When Two Variables Together Explain More Than Either Alone</h4>
<ul>
<li><strong>Multivariate Analysis</strong> examines THREE OR MORE variables together, going beyond what bivariate analysis (limited to pairs) can reveal.</li>
<li>Real-world outcomes are usually driven by multiple interacting factors at once, not a single cause - multivariate analysis is how EDA surfaces those interactions before modeling begins.</li>
<li>Common tools include <strong>pair plots</strong> (a grid of scatter plots for every pair of numeric variables at once), <strong>correlation heatmaps</strong> (a color-coded matrix of every pairwise correlation), and <strong>faceted/grouped plots</strong> (splitting a bivariate plot into multiple panels by a third categorical variable).</li>
<li>The key idea it adds over bivariate analysis is the <strong>interaction effect</strong>: a variable's relationship with the target can change depending on the value of a THIRD variable.</li>
</ul>`,
            codeExamples: [
                `# Multivariate analysis: house price depends on the INTERACTION of location and square footage
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 400
location = rng.choice(["premium", "rural"], size=n)
sqft = rng.uniform(800, 3000, size=n)

# Price per extra square foot is much higher in premium locations than rural ones
price_per_sqft = np.where(location == "premium", 400, 90)
price = sqft * price_per_sqft + rng.normal(0, 20000, size=n)

df = pd.DataFrame({"location": location, "sqft": sqft, "price": price})

print(df.groupby("location").apply(lambda g: g["sqft"].corr(g["price"]), include_groups=False))
# OUTPUT (typical):
# location
# premium    0.93
# rural      0.89
# Name: 0, dtype: float64
# (both groups show sqft strongly correlates with price - but the SLOPE, not shown by
#  correlation alone, differs dramatically between them - $400/sqft vs $90/sqft)`
            ],
            codeExplanations: [
                `Three variables - <code>location</code>, <code>sqft</code>, and <code>price</code> - are examined TOGETHER here, which is what makes this multivariate rather than bivariate. Grouping by <code>location</code> and computing the <code>sqft</code>-vs-<code>price</code> correlation separately for each group shows both groups have a strong positive correlation individually - but that correlation number alone hides the fact that an extra square foot is worth roughly 4.4x more in a premium location ($400) than a rural one ($90). This interaction between location and square footage - where the EFFECT of one variable depends on the value of another - is invisible to bivariate analysis of either "sqft vs price" or "location vs price" alone, and only becomes visible once all three variables are considered together.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Most real-world outcomes are the product of several factors acting together, not any single cause - multivariate analysis is what keeps EDA from producing an oversimplified, misleading picture of the data.
<ul>
<li><strong>It exposes interaction effects that bivariate analysis structurally cannot detect.</strong> As the housing example shows, "sqft vs price" alone and "location vs price" alone both look like ordinary, well-behaved relationships - neither pairwise view reveals that the STRENGTH of the sqft-price relationship itself changes depending on location, a discovery only possible when all three variables are considered jointly.</li>
<li><strong>Correlation heatmaps let an analyst scan dozens of pairwise relationships at once.</strong> Rather than manually running bivariate analysis on every possible pair of columns in a wide dataset, a single correlation heatmap visually surfaces which features relate strongly to the target AND to each other, in one glance.</li>
<li><strong>Pair plots reveal which subsets of features cluster or separate together.</strong> Plotting every numeric feature against every other, often colored by a categorical target, can reveal that two or three features together neatly separate classes (e.g. species, fraud vs. legitimate) even when no single feature does so on its own.</li>
<li><strong>It directly justifies feature engineering decisions like interaction terms.</strong> Discovering a genuine interaction effect during multivariate EDA (like location x sqft) is the evidence that justifies explicitly engineering an interaction feature for a linear model, rather than hoping the model or a tree-based algorithm finds it unaided.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate analyst discovers that <strong>"house price"</strong> depends on the <strong>interaction</strong> between <strong>"location"</strong> and <strong>"square footage"</strong> together: an extra square foot in a premium downtown neighborhood adds far more to the price than an extra square foot in a rural area. Neither a bivariate plot of "sqft vs. price" (which shows a general upward trend but hides the location-dependent slope) nor "location vs. price" alone (which shows premium locations cost more, but not why) reveals this.
<ul>
<li>Only a <strong>faceted scatter plot</strong> - "sqft vs. price," split into separate panels or colors by "location" - makes the different slopes visually obvious side by side, showing the premium-location line rising far more steeply than the rural line. This single multivariate insight directly justifies engineering an explicit "location &times; sqft" interaction feature before training a linear model, since a plain linear model without that interaction term would badly underfit whichever slope it averages between.</li>
</ul>`,
            codeExamples: [
                `# Multivariate tools: correlation heatmap (numeric summary) and faceted comparison by a third variable
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
n = 400
location = rng.choice(["premium", "rural"], size=n)
sqft = rng.uniform(800, 3000, size=n)
bedrooms = (sqft / 500 + rng.normal(0, 0.5, n)).round().clip(1, 6)
price_per_sqft = np.where(location == "premium", 400, 90)
price = sqft * price_per_sqft + bedrooms * 5000 + rng.normal(0, 20000, size=n)

df = pd.DataFrame({"sqft": sqft, "bedrooms": bedrooms, "price": price})

# 1. Correlation heatmap data: every numeric pair at once
print("Correlation matrix (all numeric variables together):")
print(df.corr().round(2))

# 2. Faceted comparison: sqft-price slope, split by the third variable (location)
print("\\nEffective $/sqft by location (the 'facet'):")
for loc in ["premium", "rural"]:
    mask = location == loc
    slope = np.polyfit(sqft[mask], price[mask], 1)[0]
    print(f"  {loc:8s} slope = \${slope:,.0f} per additional sqft")
# OUTPUT (typical):
# Correlation matrix (all numeric variables together):
#            sqft  bedrooms  price
# sqft       1.00      0.83   0.79
# bedrooms   0.83      1.00   0.71
# price      0.79      0.71   1.00
#
# Effective $/sqft by location (the 'facet'):
#   premium  slope = $399 per additional sqft
#   rural    slope = $91 per additional sqft`
            ],
            codeExplanations: [
                `The correlation matrix examines THREE numeric variables (<code>sqft</code>, <code>bedrooms</code>, <code>price</code>) simultaneously, immediately showing two things a bivariate check would need three separate calls to reveal: both <code>sqft</code> and <code>bedrooms</code> correlate strongly with <code>price</code> (good candidate features), AND <code>sqft</code> and <code>bedrooms</code> correlate strongly with EACH OTHER at 0.83 (a multicollinearity warning - see the site's Correlation Analysis topic - since they're likely capturing overlapping information). The faceted slope calculation then brings back the location variable: fitting a separate sqft-vs-price line for "premium" and "rural" subsets shows dramatically different slopes ($399/sqft vs $91/sqft), confirming the interaction effect numerically - a distinction a single overall correlation or scatter plot (ignoring location) would average away and hide.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Reveals interaction effects that are structurally invisible to univariate or bivariate analysis.</strong> The location x sqft example only becomes visible once all three variables are examined jointly - no pairwise view, however carefully constructed, could have surfaced it.</li>
<li><strong>Correlation heatmaps scale to examine dozens of features at once.</strong> A single heatmap image communicates the full pairwise correlation structure of an entire dataset far faster than manually reviewing individual bivariate plots one pair at a time.</li>
<li><strong>Surfaces multicollinearity as a side effect of looking for target relationships.</strong> While scanning a correlation matrix for features that relate to the target, an analyst simultaneously discovers when two features are highly correlated with EACH OTHER, flagging a risk for linear models before it ever causes an unstable coefficient.</li>
<li><strong>Matches how real-world outcomes are actually generated.</strong> House prices, disease risk, credit default - these are virtually always the product of multiple interacting factors, so multivariate analysis produces a far more realistic picture of the data-generating process than any single-variable or pairwise view can.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Visualizations become harder to read as dimensionality grows.</strong> A pair plot with 15 numeric features produces a 15x15 grid of tiny scatter plots that's difficult to visually parse, and a correlation heatmap with too many features becomes a wall of color that's hard to scan for genuinely important relationships.</li>
<li><strong>Correlation heatmaps still only capture pairwise LINEAR relationships, even though many are shown at once.</strong> A true three-way interaction (like location x sqft) doesn't show up directly as an entry in a correlation matrix at all - it required the separate faceted-slope comparison to detect, since no single cell of the matrix encodes "how the sqft-price relationship changes across location."</li>
<li><strong>More variables mean more opportunities for spurious patterns to appear by chance.</strong> Examining many variables and combinations simultaneously increases the risk of noticing a pattern that's just random noise rather than a genuine relationship, especially in smaller datasets - a finding worth treating as a hypothesis to validate, not a certainty.</li>
<li><strong>Computationally heavier than univariate or bivariate checks.</strong> Generating a full pair plot or correlation matrix scales roughly with the square of the number of features, which can become slow and visually unwieldy on datasets with hundreds of columns without first narrowing down to a relevant subset.</li>
</ul>`,
            codeExamples: [
                `# Practical mitigation: narrow to a relevant feature subset before running full multivariate analysis
import numpy as np
import pandas as pd

rng = np.random.default_rng(2)
n = 300
df = pd.DataFrame({f"feature_{i}": rng.normal(0, 1, n) for i in range(20)})
df["target"] = df["feature_3"] * 2 + df["feature_7"] * -1.5 + rng.normal(0, 1, n)

# Instead of a 20x20 pair plot / heatmap, first rank features by their correlation with the target
target_corr = df.corr()["target"].drop("target").sort_values(key=abs, ascending=False)
top_features = target_corr.head(5).index.tolist()
print("Top 5 features most related to target:")
print(target_corr.head(5))

print("\\nNow run full multivariate analysis (correlation matrix / pair plot) on just these 5 + target:")
print(df[top_features + ["target"]].corr().round(2))
# OUTPUT (typical):
# Top 5 features most related to target:
# feature_3    0.87
# feature_7   -0.68
# feature_11   0.09
# feature_2   -0.08
# feature_16   0.07
# ... (a small, readable 6x6 correlation matrix follows, instead of an unreadable 21x21 one)`
            ],
            codeExplanations: [
                `This directly addresses the "hard to read at scale" limitation. With 20 candidate features plus a target, a full pair plot or heatmap would be a cluttered 21x21 grid that's difficult to draw meaningful conclusions from. Instead, the code first computes each feature's bivariate correlation with the target alone and sorts by absolute strength, cheaply narrowing 20 features down to the 5 most promising ones (correctly identifying <code>feature_3</code> and <code>feature_7</code> as the two that were actually built into the target, versus 18 pure-noise features). Full multivariate analysis - the richer, more expensive correlation matrix or pair plot - is then run only on this small, relevant subset, keeping the visualization readable while still catching any feature-feature multicollinearity among the genuinely important variables.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What distinguishes multivariate analysis from bivariate analysis, and what can it reveal that bivariate analysis cannot?</td><td>Bivariate analysis examines exactly two variables at a time, while multivariate analysis examines three or more together. This lets it detect interaction effects - cases where the relationship between two variables changes depending on the value of a third - such as square footage affecting house price much more strongly in premium locations than rural ones, a pattern invisible to any single pairwise (bivariate) view</td></tr>
<tr class='text-center'><td>What does a correlation heatmap show, and what two different things is it commonly used to spot during EDA?</td><td>A correlation heatmap is a color-coded matrix of pairwise correlation coefficients across all numeric variables in a dataset. It's used to spot both which features correlate strongly with the target (promising candidates to include in a model) and which features correlate strongly with each other (a multicollinearity warning for linear models, since highly correlated features carry largely redundant information)</td></tr>
<tr class='text-center'><td>Why might a correlation matrix fail to reveal a real three-way interaction between two features and a target?</td><td>A correlation matrix only reports pairwise linear relationships between two variables at a time - it has no cell that captures "how the relationship between variable A and the target changes depending on variable B." Detecting such an interaction requires a different multivariate technique, such as computing the A-target relationship separately within subgroups of B (a faceted comparison) or fitting a model with an explicit interaction term</td></tr>
</table>`
        }
    ]
};
