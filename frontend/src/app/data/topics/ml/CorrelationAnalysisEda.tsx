import { Topic } from '../../coreJava';

export const correlationAnalysisEda: Topic = {
    id: 'ml-eda-correlation-analysis',
    name: 'Correlation Analysis',
    beginner: [
        {
            content: `<h4>Covariance, Then Correlation: Measuring How Two Variables Move Together</h4>
<ul>
<li><strong>Covariance</strong> is the raw measure of whether two variables move together (positive), oppositely (negative), or show no linear relationship (near zero). Its magnitude depends on the variables' original units, which makes it hard to interpret or compare across different variable pairs.</li>
<li><strong>Correlation</strong> is covariance rescaled to always fall between -1 and 1, making the strength of a linear relationship immediately interpretable regardless of units - this is what covariance is really building toward, and why correlation, not raw covariance, is the tool actually used during EDA.</li>
<li>During EDA, a <strong>correlation matrix</strong> (often visualized as a <strong>heatmap</strong>) computes every pairwise correlation across all numeric columns at once, used to spot both features that relate strongly to the target AND features that relate strongly to EACH OTHER.</li>
<li><strong>Correlation is not causation</strong> - a strong correlation only shows two variables move together statistically, not that one causes the other.</li>
</ul>`,
            codeExamples: [
                `# Covariance (raw, unit-dependent) vs correlation (normalized, unitless) on the same data
import numpy as np

rng = np.random.default_rng(0)
bedrooms = rng.integers(1, 6, size=500).astype(float)
sqft = bedrooms * 500 + rng.normal(0, 150, size=500)

cov = np.cov(bedrooms, sqft)[0, 1]
corr = np.corrcoef(bedrooms, sqft)[0, 1]

print(f"Covariance(bedrooms, sqft) = {cov:.1f}   <- large number, hard to judge strength from alone")
print(f"Correlation(bedrooms, sqft) = {corr:.3f}  <- clearly interpretable: a strong positive relationship")
# OUTPUT (typical):
# Covariance(bedrooms, sqft) = 320.4   <- large number, hard to judge strength from alone
# Correlation(bedrooms, sqft) = 0.771  <- clearly interpretable: a strong positive relationship`
            ],
            codeExplanations: [
                `The same underlying relationship between <code>bedrooms</code> and <code>sqft</code> is measured two ways. <strong>Covariance</strong> (320.4) is technically correct but nearly impossible to judge in isolation - is 320.4 a strong relationship or a weak one? It depends entirely on the units and scale of the two variables being compared, which differ from one variable pair to the next. <strong>Correlation</strong> (0.771) is the exact same underlying relationship rescaled to the fixed range of -1 to 1, immediately readable as "a fairly strong positive relationship" without needing to know anything about bedrooms or square footage as units. This is precisely why correlation - the normalized version - rather than raw covariance is what's actually computed and visualized during real EDA work.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
A correlation matrix is one of the highest-value, lowest-cost steps in EDA - it simultaneously surfaces useful features and dangerous ones, in a single visualization.
<ul>
<li><strong>It identifies which features are worth including as predictors.</strong> Features that correlate strongly with the target variable (e.g. "square footage" correlating with "house price") are flagged as promising candidates before any model is trained.</li>
<li><strong>It simultaneously flags multicollinearity - features that are highly correlated with EACH OTHER, not just with the target.</strong> Two features carrying largely redundant information (like "bedrooms" and "square footage," which tend to move together) can destabilize a linear regression's coefficients, making them large, unstable, and hard to interpret, even if the model's overall predictions remain reasonable.</li>
<li><strong>It's the diagnostic step behind techniques like PCA and regularization.</strong> Principal Component Analysis literally starts by computing a covariance/correlation matrix and finding the directions of maximum shared variance; L1/L2 regularization is often reached for specifically because correlation analysis revealed multicollinear features that plain linear regression would handle poorly.</li>
<li><strong>The "correlation is not causation" warning prevents costly, wrong business decisions.</strong> Acting on a correlation as if it were a causal lever (e.g. cutting a marketing channel because it "only" correlates with, rather than clearly causes, sales) can remove something that was actually working, when the true driver was a separate, unmeasured factor.</li>
</ul>
<h3>Real-World Example</h3>
A correlation heatmap of a housing dataset reveals that <strong>"bedrooms"</strong> and <strong>"square footage"</strong> are highly correlated with EACH OTHER (0.83), in addition to both correlating strongly with the target, <strong>"house price."</strong> This is a textbook <strong>multicollinearity</strong> risk: a linear regression model given both features may end up with unstable, hard-to-interpret coefficients, since the model struggles to tell which of the two nearly-redundant features is "really" driving the price.
<ul>
<li>Spotting this during EDA - before training anything - gives the analyst several options with full information: drop one of the two correlated features, combine them into a single engineered feature, or proceed anyway using a regularized model (ridge/lasso) that's more robust to multicollinearity. Without the correlation heatmap, this risk would likely only surface later, as a confusing pattern of unstable or counter-intuitive coefficients after training.</li>
</ul>`,
            codeExamples: [
                `# A correlation heatmap (as a numeric matrix) surfacing both target-correlation and multicollinearity
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
n = 500
bedrooms = rng.integers(1, 6, size=n).astype(float)
sqft = bedrooms * 500 + rng.normal(0, 150, size=n)          # sqft strongly tracks bedrooms
price = sqft * 200 + bedrooms * 3000 + rng.normal(0, 15000, size=n)

df = pd.DataFrame({"bedrooms": bedrooms, "sqft": sqft, "price": price})
corr_matrix = df.corr()
print(corr_matrix.round(2))
# OUTPUT (typical):
#           bedrooms  sqft  price
# bedrooms      1.00  0.83   0.78
# sqft          0.83  1.00   0.87
# price         0.78  0.87   1.00
#
# Both bedrooms and sqft correlate strongly with price (0.78, 0.87) - both look like useful
# features. But bedrooms and sqft ALSO correlate strongly with each other (0.83) - a
# multicollinearity warning that a plain linear regression using both features together
# may produce unstable coefficients.`
            ],
            codeExplanations: [
                `<code>df.corr()</code> computes the full pairwise correlation matrix across all three numeric columns at once - the numeric equivalent of a correlation heatmap. Reading down the <code>price</code> column shows both <code>bedrooms</code> (0.78) and <code>sqft</code> (0.87) are strongly related to the target, suggesting both are useful predictors. But reading the <code>bedrooms</code>-<code>sqft</code> cell (0.83) reveals the multicollinearity problem: the two "predictor" features are themselves nearly redundant, since <code>sqft</code> was deliberately constructed to scale with <code>bedrooms</code> plus noise. A single correlation matrix like this delivers both pieces of information - which features to keep, and which pairs of kept features risk destabilizing a linear model - in one EDA step, before any model is trained.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>A single visualization communicates the full pairwise relationship structure of a dataset.</strong> Rather than running dozens of individual bivariate checks, a correlation heatmap surfaces every numeric pairwise relationship - both feature-target and feature-feature - in one glance.</li>
<li><strong>Correlation is unitless and universally comparable.</strong> A correlation of 0.8 means the same thing ("a fairly strong positive relationship") whether the underlying variables are dollars, square feet, or counts, unlike raw covariance which can't be compared across different variable pairs.</li>
<li><strong>It's a proactive, preventative check.</strong> Catching multicollinearity via a correlation matrix during EDA is far cheaper than diagnosing why a trained linear model has bizarre, unstable, sign-flipping coefficients after the fact.</li>
<li><strong>It underlies and motivates other established techniques.</strong> Understanding a dataset's correlation structure is exactly what motivates using PCA (to compress correlated features into fewer, uncorrelated components) or regularization (to tame the coefficient instability multicollinearity causes) as informed next steps, rather than default choices made blindly.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Correlation (Pearson's) only detects LINEAR relationships.</strong> Two variables can have a strong, deterministic, curved relationship (like <code>y = x&sup2;</code>) and still show a correlation near zero, meaning a correlation matrix alone can completely miss a real, important relationship - a scatter plot or non-linear correlation measure (e.g. Spearman's) is needed to catch it.</li>
<li><strong>A high correlation never proves causation.</strong> Two variables correlating strongly may both be driven by an unmeasured third factor (a classic example: ice cream sales and drowning incidents both driven by hot weather) - treating a correlation as an actionable causal lever without further evidence (like a controlled experiment) is a common and consequential mistake.</li>
<li><strong>Correlation matrices only cover numeric variables directly.</strong> Categorical variables require a different, adapted approach (like Cramer's V, or converting to dummy variables first) to include in a similar analysis, so a raw correlation matrix alone gives an incomplete picture of a mixed-type dataset.</li>
<li><strong>Large correlation matrices become visually overwhelming.</strong> A heatmap of 50+ features turns into a dense wall of color that's hard to scan for the handful of relationships that actually matter, usually requiring the matrix to be filtered or clustered before it's genuinely useful.</li>
</ul>`,
            codeExamples: [
                `# The limitation in practice: a strong non-linear relationship that correlation completely misses
import numpy as np

rng = np.random.default_rng(2)
temperature = rng.uniform(-10, 40, size=2000)
# Energy usage is high when it's very cold OR very hot, and low in mild weather (a U-shape)
energy_usage = (temperature - 15) ** 2 + rng.normal(0, 20, size=2000)

pearson_corr = np.corrcoef(temperature, energy_usage)[0, 1]
print(f"Pearson correlation(temperature, energy_usage) = {pearson_corr:.3f}")
print("A correlation-only EDA pass would likely discard 'temperature' as an unrelated feature -")
print("but the U-shaped relationship is strong and very real, just non-linear.")
# OUTPUT (typical):
# Pearson correlation(temperature, energy_usage) = -0.13
# A correlation-only EDA pass would likely discard 'temperature' as an unrelated feature -
# but the U-shaped relationship is strong and very real, just non-linear.`
            ],
            codeExplanations: [
                `<code>energy_usage</code> is built as a U-shaped (quadratic) function of <code>temperature</code>, centered around a mild 15 degrees where usage is lowest, rising in both directions as it gets colder or hotter - a very real and strong pattern that any energy company would care about. Yet the Pearson correlation comes out at just -0.13, a weak number that would likely cause an analyst relying on correlation alone to wrongly deprioritize or drop <code>temperature</code> as a feature. This is the concrete cost of correlation analysis's linearity limitation: it demonstrates why a correlation matrix should be paired with actual scatter plots (or a non-linear-aware step) for any feature whose relationship with the target isn't already known to be roughly linear, rather than trusting the correlation number as the final word.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the difference between covariance and correlation, and which is typically used during EDA?</td><td>Covariance is the raw measure of whether two variables move together, but its magnitude depends on the variables' original units, making it hard to interpret or compare across pairs. Correlation is covariance normalized to always fall between -1 and 1, making it directly interpretable regardless of units - which is why correlation, visualized as a correlation matrix or heatmap, is the tool actually used during EDA rather than raw covariance</td></tr>
<tr class='text-center'><td>What is multicollinearity, and how does a correlation heatmap help detect it during EDA?</td><td>Multicollinearity is when two or more features are highly correlated with each other, meaning they carry largely redundant information; this can make a linear model's coefficients unstable and hard to interpret. A correlation heatmap makes this easy to spot during EDA, before training any model, by revealing high correlation values in cells between pairs of predictor features (not just between predictors and the target)</td></tr>
<tr class='text-center'><td>Why is "correlation is not causation" an important caution, and what's a classic example?</td><td>A high correlation only shows that two variables move together statistically; it doesn't establish that one causes the other, since both could be driven by an unmeasured confounding factor. The classic example is ice cream sales and drowning incidents being strongly correlated, not because one causes the other, but because both increase with hot weather - treating such a correlation as a causal, actionable relationship would lead to a wrong conclusion</td></tr>
</table>`
        }
    ]
};
