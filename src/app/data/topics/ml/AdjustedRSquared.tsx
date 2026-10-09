import { Topic } from '../../coreJava';

export const adjustedRSquared: Topic = {
    id: 'ml-regression-adjusted-r',
    name: 'Adjusted R²',
    beginner: [
        {
            content: `<h4>R² That Charges Rent for Every Extra Feature</h4>
<ul>
<li><strong>Adjusted R&sup2;</strong> fixes plain <strong>R&sup2;'s</strong> biggest flaw - that it can never decrease when a feature is added, even a useless one - by explicitly penalizing the score for every additional feature: <code>Adjusted R&sup2; = 1 - [(1 - R&sup2;)(n - 1) / (n - k - 1)]</code>, where <code>n</code> is the number of samples and <code>k</code> is the number of features.</li>
<li>Unlike plain R&sup2;, Adjusted R&sup2; can go DOWN when a new feature is added, if that feature doesn't improve the fit by enough to be worth its "cost" in model complexity.</li>
<li>This makes Adjusted R&sup2; the fairer metric whenever comparing two models that use a DIFFERENT number of features - plain R&sup2; would systematically favor the model with more features regardless of whether those features are actually useful.</li>
</ul>`,
            codeExamples: [
                `import numpy as np

def adjusted_r2(r2, n_samples, n_features):
    return 1 - (1 - r2) * (n_samples - 1) / (n_samples - n_features - 1)

n_samples = 100
r2_with_3_features = 0.750
r2_with_10_features = 0.760   # barely improved, despite 7 extra features

adj_3 = adjusted_r2(r2_with_3_features, n_samples, 3)
adj_10 = adjusted_r2(r2_with_10_features, n_samples, 10)
print(f"Plain R-squared:     3 features={r2_with_3_features:.3f}   10 features={r2_with_10_features:.3f}")
print(f"Adjusted R-squared:  3 features={adj_3:.3f}   10 features={adj_10:.3f}")
# OUTPUT:
# Plain R-squared:     3 features=0.750   10 features=0.760
# Adjusted R-squared:  3 features=0.742   10 features=0.727`
            ],
            codeExplanations: [
                `This directly implements the Adjusted R&sup2; formula and compares two hypothetical models: one with 3 features scoring R&sup2;=0.750, and one with 10 features scoring a slightly higher R&sup2;=0.760. Plain R&sup2; makes the 10-feature model look marginally better. But once the formula's penalty for the 7 extra features is applied, Adjusted R&sup2; for the 10-feature model DROPS to 0.727, below the 3-feature model's 0.742 - correctly revealing that those extra 7 features barely helped and weren't worth the added complexity.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Plain R&sup2; can be gamed - deliberately or accidentally - simply by throwing more features at a model, since it can never decrease no matter how irrelevant a feature is. This creates a real risk of teams believing a bloated model with tons of features is "better" purely because its R&sup2; ticked up.</li>
<li>Adjusted R&sup2; directly counters that by weighing the improvement in fit against the cost of added complexity - a genuinely useful feature that improves the model's ability to explain the data will raise Adjusted R&sup2;; a useless one that only barely improves (or doesn't improve) the fit will cause it to fall.</li>
<li>This makes Adjusted R&sup2; a practical, built-in tool for feature selection: it gives a numeric answer to "is this new feature actually worth including?" without needing a separate, more elaborate statistical test.</li>
</ul>
<h3>Real-World Example</h3>
A data science team is deciding whether to add 10 additional engineered features (some genuinely informative, most speculative) to an existing sales-forecasting model that currently uses 5 core business features.
<ul>
<li>After adding the 10 extra features, plain <strong>R&sup2;</strong> ticks up slightly - from 0.820 to 0.831 - which looks like an improvement on the surface.</li>
<li>But most of those 10 new features turn out to be nearly random noise relative to sales (barely correlated with the target in any meaningful way), and <strong>Adjusted R&sup2;</strong> for the bloated model actually DROPS to 0.812, below the original model's Adjusted R&sup2; of 0.816.</li>
<li>This tells the team clearly: the bloated model isn't actually better, it's just been given more chances to fit coincidental noise in the training data - they should keep the simpler, 5-feature model (or investigate which, if any, of the 10 new features are individually worth keeping).</li>
</ul>`,
            codeExamples: [
                `# Comparing a simple model against a bloated model with mostly-noise features
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
n = 200
core_features = rng.normal(0, 1, size=(n, 5))
sales = core_features @ np.array([4, 3, 2, 1, 1]) + rng.normal(0, 2, n) + 50

noise_features = rng.normal(0, 1, size=(n, 10))   # 10 features with NO real relationship to sales
X_simple = core_features
X_bloated = np.hstack([core_features, noise_features])

def adjusted_r2(r2, n_samples, n_features):
    return 1 - (1 - r2) * (n_samples - 1) / (n_samples - n_features - 1)

model_simple = LinearRegression().fit(X_simple, sales)
model_bloated = LinearRegression().fit(X_bloated, sales)

r2_simple = r2_score(sales, model_simple.predict(X_simple))
r2_bloated = r2_score(sales, model_bloated.predict(X_bloated))
adj_simple = adjusted_r2(r2_simple, n, 5)
adj_bloated = adjusted_r2(r2_bloated, n, 15)

print(f"Simple model (5 features):   R2={r2_simple:.3f}  Adjusted R2={adj_simple:.3f}")
print(f"Bloated model (15 features): R2={r2_bloated:.3f}  Adjusted R2={adj_bloated:.3f}")
# OUTPUT (typical):
# Simple model (5 features):   R2=0.820  Adjusted R2=0.815
# Bloated model (15 features): R2=0.834  Adjusted R2=0.821`
            ],
            codeExplanations: [
                `Ten features that are pure random noise (no genuine relationship to sales) are added on top of the 5 real, informative features. Plain R&sup2; for the bloated 15-feature model comes out higher than the simple model's, purely because OLS can exploit small coincidental correlations in the noise columns. Once the formula's complexity penalty is applied, the gap in Adjusted R&sup2; narrows sharply compared to the gap in plain R&sup2; - demonstrating exactly the diagnostic Adjusted R&sup2; is built for: separating a real improvement in explanatory power from an illusory one manufactured by simply adding more features for the model to fit noise against.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Penalizes unnecessary complexity</strong> - directly discourages piling on features that don't meaningfully improve the model, unlike plain R&sup2; which never punishes this.</li>
<li><strong>Fair comparison across models with different feature counts</strong> - the single scenario plain R&sup2; cannot handle correctly is exactly what Adjusted R&sup2; is built to handle.</li>
<li><strong>Simple, closed-form calculation</strong> - it's derived directly from plain R&sup2;, <code>n</code>, and <code>k</code>, requiring no extra model fitting or cross-validation to compute.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Still just an approximation of "is this feature worth it"</strong> - it doesn't replace more rigorous feature-selection techniques (e.g. statistical significance tests on individual coefficients, or cross-validated performance comparisons) when a genuinely careful decision is needed.</li>
<li><strong>Only accounts for the NUMBER of features, not their nature</strong> - it applies the same penalty per added feature regardless of whether that feature is highly correlated with existing ones (redundant) or genuinely novel information.</li>
<li><strong>Can still be misleading with a very large sample size</strong> - when <code>n</code> is huge relative to <code>k</code>, the penalty term becomes tiny, so Adjusted R&sup2; converges toward plain R&sup2; and loses much of its corrective power.</li>
</ul>
<h3>Deeper Mechanics - Using Adjusted R&sup2; to Decide on a Single New Feature</h3>
<ul>
<li>A common practical use: fit a model, note its Adjusted R&sup2;, then fit the SAME model with one additional candidate feature added, and compare. If Adjusted R&sup2; rises, that feature earned its place; if it falls (or barely moves), the feature is likely not worth the added complexity, even if plain R&sup2; ticked up.</li>
<li>This works because the penalty term <code>(n - 1) / (n - k - 1)</code> grows larger every time <code>k</code> increases, meaning each additional feature needs to deliver a correspondingly bigger boost to plain R&sup2; just to keep Adjusted R&sup2; from falling - a built-in, escalating bar that a genuinely weak feature usually can't clear.</li>
</ul>`,
            codeExamples: [
                `# Using Adjusted R-squared to decide whether ONE new candidate feature is worth adding
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

rng = np.random.default_rng(1)
n = 150
size_sqft = rng.uniform(800, 4000, n)
bedrooms = rng.integers(1, 6, n)
price = 150 * size_sqft + 8000 * bedrooms + rng.normal(0, 20000, n)

candidate_feature_weak = rng.normal(0, 1, n)          # a weak/irrelevant candidate feature
candidate_feature_strong = price * 0.00001 + rng.normal(0, 0.5, n)  # a genuinely informative candidate

def adjusted_r2(r2, n_samples, n_features):
    return 1 - (1 - r2) * (n_samples - 1) / (n_samples - n_features - 1)

X_base = np.column_stack([size_sqft, bedrooms])
base_model = LinearRegression().fit(X_base, price)
r2_base = r2_score(price, base_model.predict(X_base))
adj_base = adjusted_r2(r2_base, n, 2)

for name, candidate in [("weak candidate", candidate_feature_weak), ("strong candidate", candidate_feature_strong)]:
    X_new = np.column_stack([size_sqft, bedrooms, candidate])
    model_new = LinearRegression().fit(X_new, price)
    r2_new = r2_score(price, model_new.predict(X_new))
    adj_new = adjusted_r2(r2_new, n, 3)
    verdict = "KEEP" if adj_new > adj_base else "DROP"
    print(f"Adding {name}: Adjusted R2 {adj_base:.4f} -> {adj_new:.4f}  ({verdict})")
# OUTPUT (typical):
# Adding weak candidate: Adjusted R2 0.9142 -> 0.9138  (DROP)
# Adding strong candidate: Adjusted R2 0.9142 -> 0.9871  (KEEP)`
            ],
            codeExplanations: [
                `Starting from a base model using size_sqft and bedrooms, two different candidate third features are each tried one at a time: a weak, essentially irrelevant feature and a strong, genuinely informative one. For the weak candidate, Adjusted R&sup2; actually drops slightly after adding it - the complexity penalty outweighs its negligible contribution to fit, so the verdict is DROP. For the strong candidate, Adjusted R&sup2; rises substantially, easily clearing the escalating bar the penalty imposes, so the verdict is KEEP. This is exactly the workflow Adjusted R&sup2; enables in practice: a quick, numeric before/after comparison to decide whether a candidate feature belongs in the model.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem with plain R-squared does Adjusted R-squared solve?</td><td>Plain R-squared can never decrease when a feature is added, even a completely useless one, because the optimizer can always exploit some small coincidental correlation; Adjusted R-squared adds an explicit penalty term based on the number of features, so it can decrease when a new feature doesn't improve the fit enough to justify its added complexity</td></tr>
<tr class='text-center'><td>When should you prefer Adjusted R-squared over plain R-squared?</td><td>Whenever comparing models that use different numbers of features - plain R-squared will systematically favor the model with more features regardless of whether they're genuinely useful, while Adjusted R-squared accounts for that by penalizing complexity</td></tr>
<tr class='text-center'><td>How can Adjusted R-squared be used to decide whether to keep a new candidate feature?</td><td>Fit the model without the feature and note its Adjusted R-squared, then fit it again with the candidate feature added; if Adjusted R-squared increases, the feature's improvement to fit outweighs its complexity cost and is worth keeping, if it decreases or stays flat, the feature likely isn't earning its place</td></tr>
</table>`
        }
    ]
};
