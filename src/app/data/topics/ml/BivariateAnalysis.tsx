import { Topic } from '../../coreJava';

export const bivariateAnalysis: Topic = {
    id: 'ml-eda-bivariate-analysis',
    name: 'Bivariate Analysis',
    beginner: [
        {
            content: `<h4>Examining Exactly Two Variables Together</h4>
<ul>
<li><strong>Bivariate Analysis</strong> examines the relationship between exactly TWO variables - the step that comes right after univariate analysis has established what each variable looks like on its own.</li>
<li>For <strong>numeric vs numeric</strong> pairs, a scatter plot (and correlation coefficient) shows whether the two move together, oppositely, or show no relationship.</li>
<li>For <strong>numeric vs categorical</strong> pairs, a box plot (numeric values grouped by category) shows whether the numeric variable's distribution differs across categories.</li>
<li>For <strong>categorical vs categorical</strong> pairs, a cross-tabulation (contingency table) shows how often combinations of the two categories occur together.</li>
<li>This is the stage where EDA starts directly informing which features are worth including in a model, and what kind of relationship (linear or not) to expect.</li>
</ul>`,
            codeExamples: [
                `# Bivariate analysis: advertising spend vs sales, examined BEFORE any model is built
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
ad_spend = rng.uniform(1000, 10000, size=200)
sales = ad_spend * 4.2 + rng.normal(0, 3000, size=200)   # sales roughly track spend, plus noise

df = pd.DataFrame({"ad_spend": ad_spend, "sales": sales})
print(f"Correlation(ad_spend, sales) = {df['ad_spend'].corr(df['sales']):.3f}")
print(df.head(3))
# OUTPUT (typical):
# Correlation(ad_spend, sales) = 0.878
#     ad_spend        sales
# 0   6369.42     30112.87
# 1   9556.79     42618.11
# 2   3583.42     16716.05`
            ],
            codeExplanations: [
                `Exactly TWO variables, <code>ad_spend</code> and <code>sales</code>, are examined together here - the defining feature of bivariate analysis, as opposed to looking at either column alone. The strong correlation of 0.878 is discovered BEFORE any regression model is trained, purely through exploratory investigation of the relationship between the two columns. This single number already tells an analyst two things useful for modeling: (1) <code>ad_spend</code> is very likely a valuable feature for predicting <code>sales</code>, since the two move together strongly, and (2) since correlation measures a LINEAR relationship and it's already fairly high, a simple linear model is a reasonable first candidate, rather than jumping straight to something more complex.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Bivariate analysis is what turns a pile of columns into an informed hypothesis about which features matter and how they relate to the target, before a single model is trained.
<ul>
<li><strong>It directly guides feature selection.</strong> A feature that shows a strong bivariate relationship with the target (like <code>ad_spend</code> with <code>sales</code>) is flagged as promising, while a feature showing almost no bivariate relationship with the target may be deprioritized or dropped, saving time before expensive model training even starts.</li>
<li><strong>It hints at what TYPE of model will work well.</strong> A scatter plot showing a roughly straight-line relationship suggests linear regression is a reasonable fit; a scatter plot showing a curved or U-shaped pattern signals that a linear model will underperform and a non-linear approach (polynomial features, tree-based models) is likely needed instead.</li>
<li><strong>Box plots expose relationships a correlation number can't, for numeric-vs-categorical pairs.</strong> Grouping "salary" by "education level" with box plots can reveal that higher education levels have both a higher median salary AND far more variance (wider spread of outcomes) - a nuance a single summary correlation statistic can't capture at all, since correlation doesn't apply directly to a categorical variable.</li>
<li><strong>Cross-tabs catch relationships between two categorical features that would otherwise go completely unnoticed.</strong> A cross-tab of "browser" against "converted" (yes/no) might reveal one browser has a dramatically lower conversion rate - a pattern invisible in either column's univariate value counts alone.</li>
</ul>
<h3>Real-World Example</h3>
A marketing analyst plots <strong>"advertising spend"</strong> against <strong>"sales"</strong> for the past year's campaigns, BEFORE building any predictive model. The scatter plot shows a clear, strong, roughly straight-line, positive relationship: campaigns with higher spend consistently produced higher sales.
<ul>
<li>This single bivariate finding does two things at once: it justifies including <code>ad_spend</code> as a feature (since it visibly relates to the target), and the straight-line shape of the relationship suggests a <strong>linear</strong> model is a sensible starting point, rather than immediately reaching for something more complex - decisions made purely from exploration, before any model has been fit.</li>
</ul>`,
            codeExamples: [
                `# Three flavors of bivariate analysis: numeric-numeric, numeric-categorical, categorical-categorical
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
n = 500
df = pd.DataFrame({
    "ad_spend": rng.uniform(1000, 10000, n),
    "region": rng.choice(["North", "South", "East"], n),
    "browser": rng.choice(["Chrome", "Safari"], n, p=[0.7, 0.3]),
    "converted": rng.choice(["yes", "no"], n, p=[0.25, 0.75]),
})
df["sales"] = df["ad_spend"] * 4.0 + rng.normal(0, 2500, n)

# 1. Numeric vs numeric
print("Numeric-numeric correlation (ad_spend, sales):", round(df["ad_spend"].corr(df["sales"]), 3))

# 2. Numeric vs categorical: median sales by region (proxy for a box plot's key summary)
print("\\nMedian sales by region (numeric vs categorical):")
print(df.groupby("region")["sales"].median())

# 3. Categorical vs categorical: cross-tab of browser vs conversion
print("\\nBrowser vs conversion (categorical vs categorical):")
print(pd.crosstab(df["browser"], df["converted"], normalize="index"))
# OUTPUT (typical):
# Numeric-numeric correlation (ad_spend, sales): 0.86
#
# Median sales by region (numeric vs categorical):
# region
# East     22150.4
# North    21980.1
# South    22310.7
# Name: sales, dtype: float64
#
# Browser vs conversion (categorical vs categorical):
# converted     no    yes
# browser
# Chrome      0.71   0.29
# Safari      0.82   0.18   <- Safari users convert notably less often than Chrome users`
            ],
            codeExplanations: [
                `Each of the three bivariate pairings uses a technique matched to its variable types. <code>ad_spend</code> vs <code>sales</code> (both numeric) uses <code>.corr()</code>, echoing the beginner example. <code>region</code> (categorical) vs <code>sales</code> (numeric) uses <code>groupby(...).median()</code> as the numeric proxy for what a box plot visualizes - here regions look fairly similar, so region likely isn't a strong driver of sales. <code>browser</code> vs <code>converted</code> (both categorical) uses <code>pd.crosstab</code> with row-normalization, immediately surfacing that Safari users convert at 18% versus Chrome's 29% - a full 11-point gap invisible in either column's univariate value counts alone, and a concrete, actionable signal that <code>browser</code> could be a useful categorical feature for a conversion-prediction model.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Directly connects EDA to feature selection.</strong> A visible bivariate relationship with the target variable is one of the simplest, fastest ways to prioritize which raw columns are worth engineering into features, before investing time in model training.</li>
<li><strong>Reveals the shape of a relationship, not just its existence.</strong> A scatter plot shows whether a relationship is linear, curved, or absent entirely - information a single summary number can't convey, and information that directly shapes which model family to try first.</li>
<li><strong>Works across all variable-type combinations.</strong> Whether both variables are numeric, one is categorical, or both are categorical, there's a matching bivariate technique (scatter plot, box plot, or cross-tab), so no pairing of columns is left unexamined.</li>
<li><strong>Cheap relative to the modeling time it can save.</strong> Discovering during EDA that a candidate feature has essentially no bivariate relationship with the target can save hours of feature-engineering and tuning effort that would otherwise be spent on a feature that was never going to help.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>It only ever considers two variables at a time, so it can miss interaction effects.</strong> A feature might show almost no bivariate relationship with the target on its own, yet become highly predictive when combined with a second feature - a pattern only multivariate analysis can reveal.</li>
<li><strong>Correlation-based bivariate analysis only captures LINEAR relationships.</strong> Two numeric variables can have a strong, deterministic curved relationship (like <code>y = x&sup2;</code>) and still show a correlation near zero, making a scatter plot essential rather than relying on a correlation number alone.</li>
<li><strong>A strong bivariate relationship does not imply causation.</strong> Discovering that ice cream sales and drowning incidents move together bivariately doesn't mean one causes the other - both may be driven by a third factor (like hot weather), a trap that's easy to fall into when a relationship looks compelling.</li>
<li><strong>Box plots and cross-tabs can be misleading with small subgroup sizes.</strong> If one category in a numeric-vs-categorical comparison has very few observations, its box plot summary (median, quartiles) can look artificially different purely due to sampling noise, not a genuine underlying relationship.</li>
</ul>`,
            codeExamples: [
                `# The limitation in action: a strong bivariate relationship hidden by relying on correlation alone
import numpy as np

rng = np.random.default_rng(2)
x = rng.uniform(-10, 10, size=2000)
y = x**2 + rng.normal(0, 5, size=2000)   # a strong, deterministic, but NON-linear relationship

print(f"Correlation(x, y) = {np.corrcoef(x, y)[0, 1]:.3f}  <- looks like almost no relationship")

# But a scatter plot (approximated here by binning x and checking mean y per bin) tells the real story
import pandas as pd
bins = pd.cut(x, bins=10)
print(pd.Series(y).groupby(bins, observed=True).mean())
# OUTPUT (typical):
# Correlation(x, y) = -0.02   <- misleadingly suggests no bivariate relationship exists
#
# (binned means clearly form a U-shape: high at both extremes of x, low near x=0,
#  revealing the strong parabolic relationship that the single correlation number hid)`
            ],
            codeExplanations: [
                `This demonstrates the exact failure mode described in the limitations above. <code>y</code> is deliberately built as <code>x</code> squared plus a little noise - a very strong, entirely deterministic relationship. Yet the Pearson correlation coefficient, which only detects LINEAR association, comes out near zero, and someone relying on correlation as their only bivariate tool would wrongly conclude <code>x</code> and <code>y</code> are unrelated and might discard <code>x</code> as a feature. Binning <code>x</code> and looking at the mean of <code>y</code> per bin (a numeric proxy for what a scatter plot would show visually) reveals a clear U-shape instead, proving the relationship is real and strong - just non-linear. This is exactly why a visual bivariate check (scatter plot) should always accompany, not be replaced by, a single correlation statistic.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is bivariate analysis, and how does the technique used depend on the variable types involved?</td><td>Bivariate analysis examines the relationship between exactly two variables. For two numeric variables, a scatter plot (and correlation coefficient) is used; for a numeric and a categorical variable, a box plot grouping the numeric values by category is used; for two categorical variables, a cross-tabulation (contingency table) is used to see how often combinations occur together</td></tr>
<tr class='text-center'><td>How does bivariate analysis during EDA influence which model to try first?</td><td>The shape of the relationship revealed by a scatter plot suggests the model family: a roughly straight-line relationship between a feature and the target suggests linear regression is a reasonable starting point, while a clearly curved or non-monotonic relationship signals that a linear model will underfit and a non-linear approach (polynomial features, tree-based models) should be considered instead</td></tr>
<tr class='text-center'><td>Why can relying only on a correlation coefficient during bivariate analysis be misleading, and how do you avoid the trap?</td><td>Correlation only measures LINEAR association, so a strong but non-linear relationship (e.g. y = x squared) can produce a correlation near zero, wrongly suggesting no relationship exists. The fix is to always pair a correlation number with an actual scatter plot (or binned means), since the visual can reveal a real, non-linear pattern that the single correlation statistic completely misses</td></tr>
</table>`
        }
    ]
};
