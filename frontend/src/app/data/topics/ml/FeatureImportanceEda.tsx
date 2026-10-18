import { Topic } from '../../coreJava';

export const featureImportanceEda: Topic = {
    id: 'ml-eda-feature-importance',
    name: 'Feature Importance',
    beginner: [
        {
            content: `<h4>A Cheap First Guess at What Matters, Before Training Anything</h4>
<ul>
<li>EDA-stage <strong>Feature Importance</strong> uses quick, model-free (or nearly model-free) statistical signals - like each feature's <strong>correlation with the target</strong> - to get a fast, cheap first impression of which features are likely to matter, BEFORE any model is trained.</li>
<li>This is an EARLY estimate, not a final answer - it's meant to guide what to collect, clean, and prioritize FIRST, not to be the last word on what a trained model will actually rely on.</li>
<li>This is different from post-hoc, trained-model feature importance (e.g. SHAP values or permutation importance) covered elsewhere on this site, which measures what an ALREADY-TRAINED model actually used, including interactions between features.</li>
</ul>`,
            codeExamples: [
                `# A fast, pre-modeling importance signal: correlation of each feature with the target
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 800

sqft = rng.uniform(500, 4000, n)
house_color_code = rng.integers(0, 5, n)   # a made-up, essentially irrelevant feature
num_bedrooms = np.round(sqft / 700 + rng.normal(0, 0.4, n)).clip(1, 6)
price = sqft * 150 + rng.normal(0, 25000, n)

df = pd.DataFrame({"sqft": sqft, "house_color_code": house_color_code, "num_bedrooms": num_bedrooms, "price": price})

correlations = df.corr()["price"].drop("price").sort_values(key=abs, ascending=False)
print("Quick pre-modeling importance signal (|correlation with price|):")
print(correlations.round(2))
# OUTPUT (typical):
# sqft                0.93
# num_bedrooms        0.79
# house_color_code    0.01`
            ],
            codeExplanations: [
                `Before training any model, each candidate feature's raw correlation with the target (<code>price</code>) is computed directly from the data. <code>sqft</code> (0.93) and <code>num_bedrooms</code> (0.79) both come back strongly correlated - unsurprising, since bigger houses with more bedrooms genuinely cost more - while the deliberately meaningless <code>house_color_code</code> comes back at essentially zero (0.01). This costs almost nothing to compute and, within seconds, already tells the team where to focus data-cleaning and collection effort: <code>sqft</code> and <code>num_bedrooms</code> are worth getting right, while <code>house_color_code</code> is very unlikely to be worth much attention, at least as a standalone predictor.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Not every feature is worth the same amount of cleaning, validation, or engineering effort - an early importance signal tells a team where to spend time FIRST, rather than treating every column as equally worthy of attention before a single model has even been trained.</li>
<li>It's a natural companion to <strong>Feature Relationships</strong> analysis: correlation-with-target ranks features by likely individual value, while feature-vs-feature correlation checks catch redundancy among the top-ranked ones - together they inform an early feature-selection shortlist.</li>
<li>Beyond simple correlation (which only detects LINEAR relationships), <strong>mutual information</strong> and simple <strong>univariate statistical tests</strong> (like an ANOVA F-test or a chi-squared test for categorical features) can catch some nonlinear or categorical relationships that a plain correlation coefficient would completely miss.</li>
</ul>
<h3>Real-World Example</h3>
Before training any model on a housing dataset, a data scientist computes each feature's correlation with <strong>price</strong> as a first pass.
<ul>
<li><strong>Square footage</strong> comes back with a correlation of about 0.7 - a strong, cheap early signal that this feature deserves careful, thorough cleaning (handling outliers, fixing unit inconsistencies, etc.) since it's very likely to matter to whatever model gets built.</li>
<li><strong>House color</strong> comes back with a correlation of about 0.01 - essentially nothing, informing a reasonable decision to NOT spend much time on this feature (no urgency to clean inconsistent color-naming conventions, standardize categories, etc.) since it's unlikely to move the needle.</li>
<li>Crucially, this early ranking is treated as a STARTING POINT, not gospel - the team knows that a fuller picture, including feature interactions, will only emerge once an actual model is trained and inspected with post-hoc importance tools (permutation importance, SHAP).</li>
</ul>`,
            codeExamples: [
                `# Comparing three cheap pre-modeling importance signals: correlation, mutual information, and an F-test
import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_regression, f_regression

rng = np.random.default_rng(1)
n = 1000

sqft = rng.uniform(500, 4000, n)
house_color_code = rng.integers(0, 5, n)
# a feature that's genuinely useful but in a NONLINEAR way (correlation underestimates it)
distance_km = rng.uniform(0, 50, n)
distance_effect = 40000 * np.exp(-distance_km / 10)   # sharp nonlinear drop-off with distance

price = sqft * 150 + distance_effect + rng.normal(0, 20000, n)

X = pd.DataFrame({"sqft": sqft, "house_color_code": house_color_code, "distance_km": distance_km})
y = price

corr = X.corrwith(y).abs()
mi = pd.Series(mutual_info_regression(X, y, random_state=0), index=X.columns)
f_stat, _ = f_regression(X, y)
f_stat = pd.Series(f_stat, index=X.columns)

summary = pd.DataFrame({"abs_correlation": corr, "mutual_info": mi, "f_statistic": f_stat})
print(summary.round(2))
# OUTPUT (typical):
#                    abs_correlation  mutual_info  f_statistic
# sqft                          0.83         0.71      2210.4
# house_color_code              0.02         0.00         0.4
# distance_km                   0.31         0.58       105.2   <- correlation undersells it; mutual info catches more`
            ],
            codeExplanations: [
                `<code>distance_km</code> is deliberately built to affect price through a sharp NONLINEAR (exponential decay) relationship rather than a straight line. Its simple linear correlation with price comes back moderate (0.31) - understating how much it actually matters, because correlation only measures straight-line association. <code>mutual_info_regression</code>, which can detect general (including nonlinear) statistical dependence, scores it notably higher (0.58) relative to its correlation, better reflecting its real predictive value. This is exactly why relying on correlation ALONE as a pre-modeling importance signal can undersell a genuinely useful nonlinear feature - supplementing it with mutual information or a univariate F-test gives a more complete (though still early and imperfect) first-pass picture before any model is trained.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Extremely cheap and fast</strong> - computing correlation, mutual information, or a univariate statistical test across every feature takes seconds, even on datasets with hundreds of columns, long before the time cost of actually training a model.</li>
<li><strong>Guides where to invest data-cleaning effort</strong> - features that show an early strong signal are worth the time to clean carefully (handle outliers, fix data entry errors, standardize units); features with near-zero signal may not deserve the same investment.</li>
<li><strong>Works before a model type has even been chosen</strong> - these statistical signals don't require picking or configuring an algorithm first, making them useful at the very earliest stage of a project, even before deciding whether to use a linear model, tree ensemble, or neural network.</li>
<li><strong>Can catch data leakage early</strong> - a feature with a suspiciously perfect correlation with the target (e.g. correlation of 0.99) is often a red flag that the feature is secretly derived from or leaking the target, worth investigating before it silently inflates a model's apparent performance.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Misses feature interactions entirely</strong> - a feature that means nothing on its own but becomes highly predictive IN COMBINATION with another feature (e.g. "high usage_hours" only matters for "premium" users) will show weak correlation/mutual-information individually, even though a trained model (especially a tree-based one) could exploit that interaction effectively.</li>
<li><strong>Should not be treated as a final ranking</strong> - a feature that looks unimportant in this early univariate pass can still turn out to matter once combined with others inside an actual trained model; dropping it purely on this early evidence risks discarding real signal.</li>
<li><strong>Correlation-based versions only catch linear relationships</strong> - as shown with the distance-to-city example, a genuinely useful nonlinear feature can be significantly undersold by a simple correlation coefficient alone.</li>
<li><strong>Doesn't account for redundancy among top-ranked features</strong> - two features can both rank highly on this early importance check while being highly correlated with each other (redundant), which this univariate view alone won't reveal; that's exactly what feature-relationship (feature-vs-feature) analysis is for.</li>
</ul>`,
            codeExamples: [
                `# The blind spot: an interaction-only feature looks unimportant to every univariate pre-modeling signal
import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_classif
from sklearn.ensemble import RandomForestClassifier

rng = np.random.default_rng(2)
n = 2000

is_premium = rng.integers(0, 2, n)
usage_hours = rng.uniform(0, 20, n)
# "will_upgrade" depends on an INTERACTION: high usage only predicts upgrade for non-premium users
will_upgrade = ((is_premium == 0) & (usage_hours > 12)).astype(int)

X = pd.DataFrame({"is_premium": is_premium, "usage_hours": usage_hours})
y = will_upgrade

print("Univariate signal (pre-modeling):")
print(f"  correlation:      is_premium={X['is_premium'].corr(y):.2f}  usage_hours={X['usage_hours'].corr(y):.2f}")
mi = mutual_info_classif(X, y, random_state=0)
print(f"  mutual info:      is_premium={mi[0]:.2f}  usage_hours={mi[1]:.2f}")

rf = RandomForestClassifier(random_state=0).fit(X, y)
print("\\nTrained model feature importance (post-hoc, sees the interaction):")
print(f"  is_premium={rf.feature_importances_[0]:.2f}  usage_hours={rf.feature_importances_[1]:.2f}")
# OUTPUT (typical):
# Univariate signal (pre-modeling):
#   correlation:      is_premium=-0.18  usage_hours=0.22
#   mutual info:      is_premium=0.03   usage_hours=0.04
#
# Trained model feature importance (post-hoc, sees the interaction):
#   is_premium=0.35   usage_hours=0.65   <- both features clearly matter once the interaction is modeled`
            ],
            codeExplanations: [
                `<code>will_upgrade</code> is defined purely through an INTERACTION between two features - it only depends on high usage for non-premium users, so neither feature carries much of the story on its own. The pre-modeling univariate signals (correlation, mutual information) come back weak for both features, understating how important they really are, because neither statistic looks at the two features TOGETHER. Only after a Random Forest is actually trained on both features at once does its post-hoc feature importance correctly show both features mattering substantially, since the tree-based model can naturally learn the interaction. This is the concrete limitation the topic warns about: early, cheap univariate importance signals are a useful first pass, but they can systematically miss exactly the kind of interaction effects that only emerge once a real model is trained and inspected - which is what post-hoc tools like SHAP and permutation importance exist to reveal.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the value of computing a feature's correlation with the target before training any model?</td><td>It's a nearly-free, seconds-fast way to get a rough first impression of which features are likely to matter, which helps prioritize data-cleaning and collection effort on the features most likely to be worth it, before committing time to actually building and tuning a model</td></tr>
<tr class='text-center'><td>Why shouldn't early, pre-modeling feature importance signals like correlation be treated as final?</td><td>They evaluate each feature largely on its own and can miss important feature interactions - a feature that looks unimportant individually can become highly predictive in combination with another feature, something only a trained model (inspected via tools like SHAP or permutation importance) can properly reveal</td></tr>
<tr class='text-center'><td>Why might mutual information catch a useful feature that a simple correlation coefficient misses?</td><td>Correlation only measures LINEAR association between a feature and the target; mutual information captures more general statistical dependence, including nonlinear relationships, so a feature with a strong nonlinear (e.g. exponential or threshold-based) relationship to the target can show a much higher mutual information score than its correlation would suggest</td></tr>
</table>`
        }
    ]
};
