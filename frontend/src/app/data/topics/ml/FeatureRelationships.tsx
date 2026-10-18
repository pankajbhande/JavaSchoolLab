import { Topic } from '../../coreJava';

export const featureRelationships: Topic = {
    id: 'ml-eda-feature-relationships',
    name: 'Feature Relationships',
    beginner: [
        {
            content: `<h4>Turning "What's Related to What" Into Decisions</h4>
<ul>
<li><strong>Feature Relationships</strong> is the EDA activity of systematically checking how each feature relates to the TARGET variable, and how features relate to EACH OTHER, before any model is trained.</li>
<li>Relationship-finding techniques (correlation, scatter plots, group-by comparisons) are just the MEASUREMENT step - <strong>Feature Relationships</strong> is about what you DO with those measurements: decide which features to keep, drop, combine, or engineer.</li>
<li>A feature can be <strong>complementary</strong> (adds new information the others don't have), <strong>redundant</strong> (says almost the same thing as another feature), or <strong>irrelevant</strong> (barely related to the target at all) - and each case calls for a different decision.</li>
</ul>`,
            codeExamples: [
                `# Checking how two candidate features relate to the target AND to each other
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 1000

tenure_months = rng.uniform(1, 60, n)
# total purchases tracks tenure closely (longer customers bought more), plus some noise
total_purchases = tenure_months * 2.1 + rng.normal(0, 8, n)
# churn probability drops the longer someone has stayed
churn_prob = 1 / (1 + np.exp(0.05 * tenure_months - 1.5))
churned = (rng.uniform(0, 1, n) < churn_prob).astype(int)

df = pd.DataFrame({"tenure_months": tenure_months, "total_purchases": total_purchases, "churned": churned})

print("Correlation with target (churned):")
print(df.corr()["churned"].drop("churned"))
print(f"\\nCorrelation between the two features: {df['tenure_months'].corr(df['total_purchases']):.2f}")
# OUTPUT (typical):
# Correlation with target (churned):
# tenure_months     -0.53
# total_purchases   -0.49
# Correlation between the two features: 0.85`
            ],
            codeExplanations: [
                `Two candidate features are simulated: <code>tenure_months</code> and <code>total_purchases</code>, where purchases are deliberately built to scale with tenure (a realistic relationship - customers who stick around longer tend to buy more). Both features individually correlate reasonably well with <code>churned</code> (around -0.5 each, suggesting both matter), but the second <code>.corr()</code> call reveals they ALSO correlate 0.85 with EACH OTHER. That single number is the crux of feature-relationship analysis: these two "useful-looking" features are largely saying the same thing, so a model may not actually gain much by having both, and a data scientist now has a concrete decision to make rather than a vague hunch.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without deliberately investigating feature relationships during EDA, a project wastes time and modeling effort on features that turn out to add nothing, or worse, actively destabilize a model.
<ul>
<li><strong>Wasted cleaning/collection effort</strong> - meticulously cleaning, validating, and engineering a feature that turns out to have near-zero relationship with the target (or with anything useful) is time that could have gone toward a feature that actually matters; EDA relationship-finding is what tells you WHICH features deserve that investment before you sink hours into them.</li>
<li><strong>Multicollinearity</strong> - when two or more features are highly correlated with each other, linear models can produce unstable, wildly swinging coefficients (small changes in the data flip a coefficient's sign), and interpreting "feature importance" becomes unreliable because the model can't tell which of the redundant features deserves the credit.</li>
<li><strong>Silent redundancy inflates dimensionality for no benefit</strong> - carrying 40 features when 15 non-redundant ones would perform just as well means slower training, harder interpretability, and more overfitting risk, all for zero accuracy gain.</li>
<li><strong>Missed complementary signals</strong> - failing to notice that two WEAKLY-correlated-with-the-target features are strongly related to EACH OTHER in a way that, combined (e.g. as a ratio or interaction), becomes a much stronger signal than either alone.</li>
</ul>
<h3>Real-World Example</h3>
While exploring a telecom churn dataset, a data scientist finds that <strong>customer tenure</strong> and <strong>total purchases</strong> are both strongly related to churn individually - but a correlation check between the two features ALSO shows they're strongly related to each other (customers who've stuck around longer naturally accumulated more purchases). This is a classic three-way relationship check that EDA is built for: target-vs-feature-A, target-vs-feature-B, and feature-A-vs-feature-B, all at once.
<ul>
<li><strong>Option 1 - keep one, drop the other</strong>: if the two are so redundant that one barely adds anything once the other is in the model, dropping the weaker of the pair simplifies the model with little to no accuracy cost.</li>
<li><strong>Option 2 - engineer a ratio feature</strong>: create <code>purchases_per_month = total_purchases / tenure_months</code>, which captures purchase INTENSITY independent of how long the customer has been around - potentially a more informative, less redundant signal than either original feature.</li>
<li><strong>Option 3 - accept the redundancy</strong>: for tree-based models (Random Forest, XGBoost) that are far less sensitive to correlated inputs than linear models, keeping both features is often fine, and the decision may simply be "no action needed" - itself a valid outcome of the analysis.</li>
</ul>`,
            codeExamples: [
                `# A simple decision workflow: classify each feature pair as redundant, complementary, or irrelevant
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
n = 1000

tenure_months = rng.uniform(1, 60, n)
total_purchases = tenure_months * 2.1 + rng.normal(0, 8, n)
support_tickets = rng.poisson(2, n)  # mostly unrelated to tenure or purchases
churn_prob = 1 / (1 + np.exp(0.05 * tenure_months - 1.5))
churned = (rng.uniform(0, 1, n) < churn_prob).astype(int)

df = pd.DataFrame({
    "tenure_months": tenure_months,
    "total_purchases": total_purchases,
    "support_tickets": support_tickets,
    "churned": churned,
})

target_corr = df.corr()["churned"].drop("churned").abs()
feature_corr = df[["tenure_months", "total_purchases", "support_tickets"]].corr().abs()

print("Correlation with target:\\n", target_corr, "\\n")
for f1, f2 in [("tenure_months", "total_purchases"), ("tenure_months", "support_tickets")]:
    c = feature_corr.loc[f1, f2]
    verdict = "REDUNDANT (pick one or engineer a combined feature)" if c > 0.7 else "COMPLEMENTARY (both add distinct signal)"
    print(f"{f1} vs {f2}: r={c:.2f} -> {verdict}")

low_signal = target_corr[target_corr < 0.1].index.tolist()
print(f"\\nCandidates to consider dropping (weak target relationship): {low_signal}")
# OUTPUT (typical):
# Correlation with target:
# tenure_months      0.53
# total_purchases    0.49
# support_tickets    0.02
#
# tenure_months vs total_purchases: r=0.86 -> REDUNDANT (pick one or engineer a combined feature)
# tenure_months vs support_tickets: r=0.03 -> COMPLEMENTARY (both add distinct signal)
#
# Candidates to consider dropping (weak target relationship): ['support_tickets']`
            ],
            codeExplanations: [
                `A third feature, <code>support_tickets</code>, is added, deliberately generated with almost no real relationship to tenure or churn. The code computes two things side by side: each feature's correlation with the TARGET, and correlations BETWEEN feature pairs. <code>tenure_months</code> and <code>total_purchases</code> come back with r=0.86, crossing the 0.7 "redundant" threshold used here, flagging them as a pair to resolve (drop one, or engineer a ratio). <code>support_tickets</code> shows near-zero correlation with BOTH the target and the other features - it isn't redundant with anything, but it also isn't pulling its weight, so it lands in a third bucket: a weak, likely irrelevant feature, worth double-checking before spending more cleaning effort on it. This is exactly the kind of triage a data scientist runs before committing modeling time to a feature set.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Prevents wasted modeling effort up front</strong> - spotting that a feature is irrelevant to the target during EDA (a five-minute correlation check) is far cheaper than discovering it after building, tuning, and deploying a model that leaned on it for nothing.</li>
<li><strong>Surfaces multicollinearity before it silently corrupts a linear model</strong> - catching that two features are highly correlated during EDA lets you address it deliberately (drop, combine, or regularize) rather than being confused later by unstable or nonsensical coefficient signs.</li>
<li><strong>Guides feature engineering, not just feature selection</strong> - noticing that tenure and purchases move together often SUGGESTS the ratio feature (purchase intensity) that ends up outperforming either original column.</li>
<li><strong>Builds intuition about the business problem</strong> - understanding why two features move together (e.g. "of course longer-tenured customers bought more") often reveals a causal story that informs decisions well beyond just this one model.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Correlation-based relationship checks only catch LINEAR relationships</strong> - two features can have a strong, meaningful nonlinear or interaction relationship (e.g. one only matters when another is above a threshold) while showing a near-zero simple correlation, silently misleading a purely correlation-based triage.</li>
<li><strong>Pairwise checks miss higher-order relationships</strong> - three or more features can be jointly redundant (e.g. one is almost exactly a linear combination of the other two) even when every PAIR looks only mildly correlated, something a simple pairwise correlation matrix cannot detect (variance inflation factor analysis is needed for that).</li>
<li><strong>Decisions made this early can be premature</strong> - a feature that looks weakly related to the target in isolation might become valuable once combined with another feature inside a tree-based model that captures interactions automatically; dropping it purely from an early EDA pass risks discarding real signal.</li>
<li><strong>Relationship strength found in EDA reflects the CURRENT dataset, not necessarily production reality</strong> - a spurious correlation in a small or non-representative sample can lead to a feature-selection decision that doesn't hold up once more or different data arrives.</li>
</ul>`,
            codeExamples: [
                `# A relationship that correlation alone completely misses: an interaction effect
import numpy as np
import pandas as pd

rng = np.random.default_rng(2)
n = 2000

is_premium = rng.integers(0, 2, n)              # 0 = free tier, 1 = premium tier
usage_hours = rng.uniform(0, 20, n)

# usage_hours only drives satisfaction for premium users; for free users it's flat/irrelevant
satisfaction = np.where(is_premium == 1, 3 + 0.4 * usage_hours, 5) + rng.normal(0, 1, n)

df = pd.DataFrame({"is_premium": is_premium, "usage_hours": usage_hours, "satisfaction": satisfaction})

print(f"Simple correlation, usage_hours vs satisfaction (whole dataset): {df['usage_hours'].corr(df['satisfaction']):.2f}")
premium_corr = df[df.is_premium == 1]["usage_hours"].corr(df[df.is_premium == 1]["satisfaction"])
free_corr = df[df.is_premium == 0]["usage_hours"].corr(df[df.is_premium == 0]["satisfaction"])
print(f"Correlation within premium users only: {premium_corr:.2f}")
print(f"Correlation within free users only:    {free_corr:.2f}")
# OUTPUT (typical):
# Simple correlation, usage_hours vs satisfaction (whole dataset): 0.19
# Correlation within premium users only: 0.62
# Correlation within free users only:    0.02`
            ],
            codeExplanations: [
                `<code>usage_hours</code> is built to matter A LOT for satisfaction, but ONLY for premium-tier users - for free-tier users it has essentially no effect. Computed across the WHOLE dataset, the correlation between usage_hours and satisfaction looks weak (0.19), which could easily lead to <code>usage_hours</code> being dismissed as an unimportant feature. Splitting the correlation check BY the <code>is_premium</code> group reveals the truth: 0.62 among premium users, 0.02 among free users - a real, strong interaction effect that a single overall correlation number completely hid. This demonstrates why pairwise correlation checks are a useful first pass but not the final word, and why relationship-finding sometimes needs to be conditioned on a third variable before a fair keep/drop decision is made.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>During EDA you find that two features are both strongly correlated with the target and strongly correlated with each other. What are your options?</td><td>Drop the weaker of the two if they're highly redundant and a simpler model is preferred; engineer a combined feature (e.g. a ratio) that captures the relationship between them more directly than either alone; or keep both if using a model type (like tree ensembles) that tolerates correlated inputs well - the right choice depends on the model family and how redundant the pair actually is</td></tr>
<tr class='text-center'><td>Why is it worth checking feature relationships before training any model, rather than just training a model and looking at its feature importances afterward?</td><td>Early relationship checks are cheap and catch problems (redundant features, irrelevant features, multicollinearity) before time is spent cleaning, engineering, or tuning around features that add little value; post-hoc feature importance from a trained model is useful too, but it comes after the modeling effort has already been spent, and it can also be distorted by the same multicollinearity that early EDA could have flagged</td></tr>
<tr class='text-center'><td>Why can a pairwise correlation matrix fail to reveal an important relationship in the data?</td><td>Correlation only captures LINEAR association - a feature can have a strong nonlinear relationship or an interaction effect with the target (e.g. it only matters conditional on another feature's value) while showing a near-zero simple correlation, so relying on correlation alone can cause a genuinely useful feature to be dismissed</td></tr>
</table>`
        }
    ]
};
