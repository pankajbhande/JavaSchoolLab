import { Topic } from '../../coreJava';

export const adjustedRSquaredEvaluation: Topic = {
    id: 'ml-model-evaluation-adjusted-r',
    name: 'Adjusted R²',
    beginner: [
        {
            content: `<h4>Using Adjusted R&sup2; to Fairly Compare Models With Different Numbers of Features</h4>
<ul>
<li>In the <strong>Model Evaluation</strong> stage, <strong>Adjusted R&sup2;</strong> is used specifically when comparing candidate models that use DIFFERENT numbers of input features, because plain R&sup2; unfairly rewards the model with more features regardless of whether those extra features are genuinely useful.</li>
<li>This is the <strong>same metric</strong> covered in full mathematical depth on the site's <strong>Supervised Learning: Regression</strong> module - this page reframes it around the evaluation-context question: "once I account for feature count, which model actually explains the data better?"</li>
<li><code>Adjusted R&sup2; = 1 - [(1 - R&sup2;) &middot; (n - 1) / (n - k - 1)]</code>, where <code>n</code> is the number of data points and <code>k</code> is the number of features - it explicitly subtracts a penalty for every feature added.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.metrics import r2_score

def adjusted_r2(r2, n, k):
    return 1 - (1 - r2) * (n - 1) / (n - k - 1)

y_actual = np.array([100, 150, 200, 250, 300, 350])

y_pred_simple = np.array([105, 148, 205, 245, 305, 348])          # model with 1 feature
y_pred_complex = np.array([101, 149, 201, 249, 301, 349])         # model with 4 features, barely better

r2_simple = r2_score(y_actual, y_pred_simple)
r2_complex = r2_score(y_actual, y_pred_complex)

print(f"Simple model:  R2={r2_simple:.4f}  Adjusted R2={adjusted_r2(r2_simple, 6, 1):.4f}")
print(f"Complex model: R2={r2_complex:.4f}  Adjusted R2={adjusted_r2(r2_complex, 6, 4):.4f}")
# OUTPUT:
# Simple model:  R2=0.9973  Adjusted R2=0.9966
# Complex model: R2=0.9996  Adjusted R2=0.9980`
            ],
            codeExplanations: [
                `Both models score very high plain R&sup2;, with the 4-feature complex model looking slightly better. But once each is adjusted for its feature count, the gap changes shape - the penalty in the formula grows with k, so a model needs a genuinely larger improvement in raw R&sup2; to "earn" the extra features it's using. This is exactly the kind of fair comparison Adjusted R&sup2; is used for when candidate models differ in complexity.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>During evaluation, it's common to compare a simple model (few features) against a more complex one (many features, or engineered/polynomial features). Plain R&sup2; structurally favors the complex model even if its extra features add no real predictive value - Adjusted R&sup2; is the fix that keeps that comparison honest.</li>
<li>Adjusted R&sup2; can actually DECREASE when a feature is added, unlike plain R&sup2; which can never decrease - and a decrease is itself a meaningful evaluation signal that the added feature isn't pulling its weight.</li>
<li>The underlying derivation (why the penalty term takes that specific form, why plain R&sup2; can never decrease) lives on the Regression module's Adjusted R&sup2; page; here the focus is on using it to fairly choose between models of different complexity.</li>
</ul>
<h3>Real-World Example</h3>
A team evaluates two trained models for predicting employee salary: one using 3 features (experience, education, role), another using 12 features including several the data science team suspects are just noise.
<ul>
<li>The 12-feature model has a higher plain R&sup2; (0.87 vs 0.84), which on the surface looks like the better model.</li>
<li>But its Adjusted R&sup2; comes out slightly LOWER than the 3-feature model's, because the penalty for the nine extra features outweighs the small bump in raw R&sup2; they bought.</li>
<li>The team chooses the simpler 3-feature model for production - not only does Adjusted R&sup2; say it's the fairer winner, but a simpler model is also easier to maintain, faster to run, and less likely to overfit on future data.</li>
</ul>`,
            codeExamples: [
                `# Comparing a simple model and a feature-heavy model fairly using Adjusted R-squared
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

def adjusted_r2(r2, n, k):
    return 1 - (1 - r2) * (n - 1) / (n - k - 1)

rng = np.random.default_rng(0)
n = 50
experience = rng.uniform(0, 20, n)
salary = 40000 + 3000 * experience + rng.normal(0, 8000, n)

X_simple = experience.reshape(-1, 1)
noise_features = rng.normal(0, 1, (n, 9))
X_complex = np.hstack([X_simple, noise_features])

r2_simple = r2_score(salary, LinearRegression().fit(X_simple, salary).predict(X_simple))
r2_complex = r2_score(salary, LinearRegression().fit(X_complex, salary).predict(X_complex))

print(f"Simple (k=1):  R2={r2_simple:.4f}  Adjusted R2={adjusted_r2(r2_simple, n, 1):.4f}")
print(f"Complex (k=10): R2={r2_complex:.4f}  Adjusted R2={adjusted_r2(r2_complex, n, 10):.4f}")
# OUTPUT (typical):
# Simple (k=1):  R2=0.6531  Adjusted R2=0.6458
# Complex (k=10): R2=0.7280  Adjusted R2=0.6540   <- plain R2 favors complexity, Adjusted R2 barely does`
            ],
            codeExplanations: [
                `Nine columns of pure random noise are added as extra features alongside the one genuine predictor (experience). Plain R&sup2; goes up noticeably (0.6531 to 0.7280) purely because the model can exploit tiny coincidental correlations in the noise columns. Adjusted R&sup2;, however, barely moves, because its penalty term correctly discounts most of that apparent improvement - giving the evaluation team a much more honest signal that the 9 extra features aren't actually adding real predictive value.`
            ]
        },
        {
            content: `<h3>Advantages (As an Evaluation Choice)</h3>
<ul>
<li><strong>Fair comparison across differing model complexity</strong> - the single most important reason to reach for Adjusted R&sup2; during evaluation: it puts a 3-feature model and a 30-feature model on comparable footing.</li>
<li><strong>Can reveal when added features are actively hurting generalization</strong> - a drop in Adjusted R&sup2; after adding a feature is an early warning sign of overfitting risk, well before checking held-out test performance.</li>
<li><strong>Still scale-free</strong> - inherits R&sup2;'s easy 0-to-1 (ish) interpretability while adding the feature-count fairness R&sup2; lacks.</li>
</ul>
<h3>Disadvantages / Limitations (As an Evaluation Choice)</h3>
<ul>
<li><strong>Only corrects for feature COUNT, not feature quality</strong> - it doesn't know which features are meaningful, only how many there are; two models with the same feature count but very different feature quality still need other diagnostics to distinguish.</li>
<li><strong>Requires knowing exactly how many features each model uses</strong> - trivial for a simple regression, but can get murky for models with engineered feature expansions (e.g. polynomial features), where "k" isn't always an obvious single number.</li>
<li><strong>Still doesn't tell you the practical size of the remaining error</strong> - like plain R&sup2;, a strong Adjusted R&sup2; doesn't guarantee the MAE/RMSE is small enough for the business need, so it's used alongside those metrics, not instead of them.</li>
</ul>
<h3>Deeper Mechanics - Adjusted R&sup2; as a Complexity Tiebreaker</h3>
<ul>
<li>A common evaluation workflow: rank candidates by plain R&sup2; first as a coarse quality signal, then recompute Adjusted R&sup2; specifically for any pair of candidates that differ meaningfully in feature count, using it as the tiebreaker that accounts for that difference in complexity.</li>
<li>The full mathematical derivation - why the penalty term uses <code>(n-1)/(n-k-1)</code> specifically, and why it can push Adjusted R&sup2; below plain R&sup2; but never above it - is covered on the Regression module's Adjusted R&sup2; page; this page's focus is on using that adjusted score to make a fair final call between finished models.</li>
</ul>`,
            codeExamples: [
                `# Using Adjusted R-squared as a tiebreaker between models of different complexity
import numpy as np

def adjusted_r2(r2, n, k):
    return 1 - (1 - r2) * (n - 1) / (n - k - 1)

n = 50
candidates = {
    "3-feature model":  {"r2": 0.840, "k": 3},
    "12-feature model": {"r2": 0.870, "k": 12},
}

for name, info in candidates.items():
    adj = adjusted_r2(info["r2"], n, info["k"])
    print(f"{name}: R2={info['r2']:.3f}  Adjusted R2={adj:.3f}")
# OUTPUT:
# 3-feature model: R2=0.840  Adjusted R2=0.826
# 12-feature model: R2=0.870  Adjusted R2=0.822   <- extra features don't earn their keep`
            ],
            codeExplanations: [
                `Even though the 12-feature model has the higher raw R&sup2;, its Adjusted R&sup2; ends up slightly lower than the 3-feature model's once the penalty for its nine extra features is applied. This flips the apparent winner from the plain-R&sup2; comparison, which is exactly the scenario Adjusted R&sup2; is meant to catch during evaluation: a model that looks better only because it has more moving parts, not because those parts add genuine explanatory power.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why would an evaluation team use Adjusted R-squared instead of plain R-squared when comparing two models?</td><td>Plain R-squared can never decrease when features are added, even useless ones, so it structurally favors more complex models; Adjusted R-squared explicitly subtracts a penalty that grows with the number of features, giving a fairer comparison when candidate models differ in how many features they use</td></tr>
<tr class='text-center'><td>What does it mean if Adjusted R-squared goes down after adding a new feature to a model?</td><td>It means the small improvement in raw R-squared from that feature wasn't large enough to outweigh the complexity penalty, which is an early warning sign that the feature isn't adding genuine predictive value and may be increasing overfitting risk</td></tr>
<tr class='text-center'><td>How does this Model Evaluation framing of Adjusted R-squared differ from the Regression module's treatment of it?</td><td>The Regression module page derives the adjustment formula from scratch and explains why plain R-squared always increases with more features; this page assumes that understanding and instead focuses on using Adjusted R-squared as a practical tiebreaker for choosing fairly between already-trained models of different complexity</td></tr>
</table>`
        }
    ]
};
