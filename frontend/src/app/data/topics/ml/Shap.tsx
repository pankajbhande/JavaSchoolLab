import { Topic } from '../../coreJava';

export const shap: Topic = {
    id: 'ml-explainable-ai-shap',
    name: 'SHAP',
    beginner: [
        {
            content: `<h4>Explaining WHY a Model Made a Prediction</h4>
<ul>
<li>Modern ML models (gradient boosted trees, neural networks) are often <strong>black boxes</strong> - they can be highly accurate, but it's not obvious from the model itself WHY a particular prediction came out the way it did.</li>
<li><strong>SHAP (SHapley Additive exPlanations)</strong> assigns each feature a number - its <strong>SHAP value</strong> - representing how much that feature pushed a specific prediction up or down relative to the average prediction over the whole dataset.</li>
<li>SHAP values are ADDITIVE: the model's baseline (average) prediction, plus the sum of every feature's SHAP value for that row, equals the model's actual prediction for that row - so the explanation isn't just a rough approximation, it exactly reconstructs the output.</li>
</ul>`,
            codeExamples: [
                `import shap
import xgboost as xgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

model = xgb.XGBClassifier(n_estimators=100, max_depth=3, random_state=0)
model.fit(X_train, y_train)

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

row = 0
print(f"Base value (average model output): {explainer.expected_value:.3f}")
print(f"Actual prediction for row {row}: {model.predict_proba(X_test.iloc[[row]])[0][1]:.3f}")
print("Top 3 features pushing this prediction:")
top_features = sorted(zip(X_test.columns, shap_values[row]), key=lambda x: -abs(x[1]))[:3]
for name, val in top_features:
    direction = "increases" if val > 0 else "decreases"
    print(f"  {name:25s} SHAP={val:+.3f}  ({direction} malignancy probability)")
# OUTPUT (typical):
# Base value (average model output): 0.372
# Actual prediction for row 0: 0.891
# Top 3 features pushing this prediction:
#   worst concave points      SHAP=+0.281  (increases malignancy probability)
#   worst perimeter           SHAP=+0.154  (increases malignancy probability)
#   mean radius                SHAP=+0.089  (increases malignancy probability)`
            ],
            codeExplanations: [
                `This trains a gradient-boosted tree classifier on the breast cancer dataset, then wraps it with shap.TreeExplainer, which is a fast, exact SHAP implementation specialized for tree-based models (it exploits the tree structure instead of the slower general-purpose sampling approach). Calling explainer.shap_values(X_test) computes, for every test row and every feature, how much that feature contributed to pushing the prediction away from the "base value" (the average prediction across the whole dataset). The code then picks one row, prints the base value and the model's actual prediction for that row, and shows the 3 features with the largest absolute SHAP value - the ones that mattered most in that SPECIFIC prediction, with their sign telling you whether that feature pushed the prediction up or down, giving a concrete per-prediction explanation rather than a vague global "feature importance" ranking.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before explainability tools like SHAP, teams deploying black-box models (gradient boosting, neural networks) had two bad options: use a simpler, inherently interpretable model (like linear regression or a shallow decision tree) and accept lower accuracy, or use the accurate black-box model and have NO good answer when someone asked "why did the model do that?"</li>
<li>That question isn't academic - regulations like the EU's GDPR grant a "right to explanation" for automated decisions, financial regulators require lenders to give applicants SPECIFIC reasons for a credit denial (not just "the model said no"), and even without a legal requirement, engineers need to debug a model that behaves strangely on a particular input, and stakeholders need to trust a model before deploying it in a high-stakes setting like healthcare or lending.</li>
<li>Generic "feature importance" (e.g. from a tree's built-in <code>.feature_importances_</code>) only tells you which features matter ACROSS the whole dataset on average - it can't tell you why THIS SPECIFIC applicant, with their specific numbers, was denied. SHAP was built specifically to answer that per-prediction question, with a mathematically principled way of splitting credit among features.</li>
</ul>
<h3>Shapley Values - The Game Theory Behind SHAP</h3>
<ul>
<li>SHAP is rooted in <strong>Shapley values</strong>, a concept from cooperative game theory (Lloyd Shapley, 1953) originally designed to fairly split a payout among players who cooperated to earn it. SHAP treats each FEATURE as a "player" and the model's prediction as the "payout," asking: how much did each feature fairly contribute?</li>
<li>The Shapley value for a feature is computed by considering every possible ORDER in which features could be "added" to a coalition, measuring how much the prediction changes each time that feature joins, and averaging that marginal contribution across all possible orderings - this guarantees fairness properties (e.g. features that never affect the prediction get exactly 0 credit, and identical features get identical credit) that ad-hoc importance measures don't guarantee.</li>
<li>Computing exact Shapley values requires evaluating the model on every possible subset of features, which is exponential in the number of features - infeasible for real datasets. SHAP's contribution was fast, model-specific APPROXIMATIONS: <code>TreeExplainer</code> computes EXACT SHAP values efficiently by exploiting tree structure, <code>DeepExplainer</code>/<code>GradientExplainer</code> approximate them for neural networks, and <code>KernelExplainer</code> is a slower, model-agnostic fallback that works on any model.</li>
</ul>`,
            codeExamples: [
                `# Manually computing an exact Shapley value for a toy 3-feature model, to see the underlying math
import itertools
import numpy as np

# A toy "model": predicts based on whether features are present (1) or absent (0)
def toy_model(features_present, feature_values):
    # simple synergy: rate + income matter a lot together, credit_score matters alone
    val = 0
    if features_present.get("income"):
        val += 0.2 * feature_values["income"]
    if features_present.get("credit_score"):
        val += 0.15 * feature_values["credit_score"]
    if features_present.get("income") and features_present.get("credit_score"):
        val += 0.1   # bonus synergy when both are known together
    return val

feature_values = {"income": 3, "credit_score": 4}
features = list(feature_values.keys())

def shapley_value(target_feature, features, feature_values):
    other_features = [f for f in features if f != target_feature]
    total = 0
    n_perms = 0
    for perm in itertools.permutations(other_features):
        for r in range(len(perm) + 1):
            coalition_before = set(perm[:r])
            with_target = coalition_before | {target_feature}
            without_target = coalition_before
            v_with = toy_model({f: True for f in with_target}, feature_values)
            v_without = toy_model({f: True for f in without_target}, feature_values)
            total += v_with - v_without
            n_perms += 1
    return total / n_perms

for f in features:
    phi = shapley_value(f, features, feature_values)
    print(f"Shapley value for '{f}': {phi:.4f}")

baseline = toy_model({}, feature_values)
full = toy_model({f: True for f in features}, feature_values)
print(f"Baseline (no features): {baseline:.4f}  Full prediction: {full:.4f}")
print(f"Baseline + sum(Shapley values) = {baseline + sum(shapley_value(f, features, feature_values) for f in features):.4f}")
# OUTPUT:
# Shapley value for 'income': 0.6500
# Shapley value for 'credit_score': 0.6500
# Baseline (no features): 0.0000  Full prediction: 1.3000
# Baseline + sum(Shapley values) = 1.3000   <- exactly reconstructs the full prediction (additivity property)`
            ],
            codeExplanations: [
                `This implements the raw Shapley value formula from first principles on a tiny toy "model" with a deliberate synergy effect (income and credit_score together produce an extra bonus beyond their individual contributions), to make visible what a library like shap.TreeExplainer computes efficiently under the hood. For a target feature, shapley_value considers every possible ORDER the OTHER features could be added first, and for each such ordering, measures the marginal effect of adding the target feature to that partial coalition (the model's output WITH the feature minus WITHOUT it) - averaging this marginal contribution across every ordering is exactly the Shapley value definition, and it's what fairly splits credit for the synergy bonus between the two features rather than arbitrarily giving it all to one. The final print statement demonstrates SHAP's key additivity guarantee: the baseline prediction (0 features known) plus the sum of every feature's Shapley value exactly equals the model's full prediction - not an approximation, an exact accounting identity, which is why SHAP explanations are trusted as more principled than heuristic importance scores.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>A bank's loan-approval model is a gradient-boosted tree trained on thousands of past applications. An applicant is denied, and under fair-lending regulation the bank must provide a SPECIFIC, individualized reason - not just "our model said no." A global feature-importance chart (e.g. "debt-to-income ratio matters most on average") doesn't satisfy this requirement, because it doesn't explain THIS applicant's specific denial.</li>
<li>Running SHAP on that one applicant's row produces a <strong>local explanation</strong>: e.g. "debt-to-income ratio contributed -0.31 (pushed the approval probability down significantly), years at current employer contributed -0.08, but credit score contributed +0.15 (helped the application)" - a concrete, individualized, additive breakdown the bank can hand to the applicant or a regulator.</li>
<li>Separately, aggregating SHAP values across ALL applicants (a <strong>SHAP summary plot</strong>) gives the bank's model risk team a <strong>global</strong> view: which features drive the model's decisions overall, and in which direction - e.g. discovering that a feature correlated with a protected class is disproportionately driving denials, which is exactly the kind of bias auditing a fair-lending compliance team needs to do BEFORE a regulator finds it.</li>
</ul>`,
            codeExamples: [
                `# Local explanation for one denied applicant vs. a global summary across all applicants
import shap
import xgboost as xgb
import pandas as pd
import numpy as np

np.random.seed(0)
n = 2000
df = pd.DataFrame({
    "debt_to_income": np.random.uniform(0.1, 0.6, n),
    "credit_score": np.random.randint(500, 800, n),
    "years_employed": np.random.uniform(0, 20, n),
    "loan_amount": np.random.uniform(5000, 50000, n),
})
# synthetic ground truth: high debt-to-income and low credit score drive denial
approved = ((df["credit_score"] > 620) & (df["debt_to_income"] < 0.4)).astype(int)

model = xgb.XGBClassifier(n_estimators=80, max_depth=3, random_state=0)
model.fit(df, approved)

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(df)

# LOCAL: explain one specific denied applicant
denied_idx = np.where((model.predict(df) == 0))[0][0]
print(f"Applicant #{denied_idx} local explanation:")
for feat, val in sorted(zip(df.columns, shap_values[denied_idx]), key=lambda x: x[1])[:2]:
    print(f"  {feat:16s} SHAP={val:+.3f}  (value was {df.iloc[denied_idx][feat]:.2f})")

# GLOBAL: mean absolute SHAP value per feature, across ALL applicants
global_importance = np.abs(shap_values).mean(axis=0)
print("\\nGlobal feature importance (mean |SHAP value|):")
for feat, imp in sorted(zip(df.columns, global_importance), key=lambda x: -x[1]):
    print(f"  {feat:16s} {imp:.3f}")
# OUTPUT (typical):
# Applicant #2 local explanation:
#   debt_to_income   SHAP=-0.412  (value was 0.53)
#   credit_score     SHAP=-0.201  (value was 588.00)
#
# Global feature importance (mean |SHAP value|):
#   credit_score     0.284
#   debt_to_income   0.251
#   years_employed   0.019
#   loan_amount      0.008`
            ],
            codeExplanations: [
                `This simulates a loan-approval dataset where approval is (synthetically) driven by credit score and debt-to-income ratio, trains a gradient-boosted classifier on it, and then computes SHAP values for every applicant with TreeExplainer. The "LOCAL" section finds one specific denied applicant and prints the two features with the most negative SHAP values for their row specifically - the individualized, per-applicant explanation a compliance team could hand to that person, showing exactly which of THEIR numbers hurt their approval odds. The "GLOBAL" section instead averages the ABSOLUTE SHAP value of each feature across every applicant in the dataset, producing a dataset-wide ranking of which features matter most on average - useful for a model-risk or bias-auditing review, but notably a DIFFERENT question than the local explanation answers; the code deliberately computes both to show that SHAP naturally supports zooming from "why did this one prediction happen" to "what does this model rely on overall" using the exact same underlying values.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Theoretically grounded and consistent</strong> - because it's derived from Shapley values' game-theoretic fairness axioms (efficiency, symmetry, additivity), SHAP guarantees properties like "if a feature never affects the model's output, it gets exactly 0 credit" and "if two features contribute identically, they get identical credit" - properties that ad-hoc heuristics (like permutation importance alone) don't formally guarantee.</li>
<li><strong>Both local AND global explanations from the same values</strong> - a single SHAP computation gives you a specific prediction's breakdown (local) and, by averaging, the model's overall behavior (global summary plots), unlike some methods that only do one or the other.</li>
<li><strong>Model-agnostic (with a model-agnostic fallback)</strong> - while TreeExplainer/DeepExplainer are fast, model-specific implementations, KernelExplainer can wrap literally any model (even a REST API you can only query, not inspect) as long as you can call <code>predict</code> on it, making SHAP usable even when you don't have white-box access.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Computationally expensive for non-tree models</strong> - exact Shapley values require evaluating exponentially many feature subsets; KernelExplainer approximates this via sampling, but on a large neural network with hundreds of features it can be dramatically slower than a single forward pass, sometimes taking minutes per prediction.</li>
<li><strong>Assumes feature independence in some approximations</strong> - many practical SHAP implementations perturb/remove features by sampling from their marginal distribution, which can produce unrealistic, out-of-distribution combinations when features are correlated (e.g. explaining a model by "removing" height while keeping weight fixed, producing a body that doesn't exist in reality) - this can distort the resulting attributions.</li>
<li><strong>Explains the MODEL, not necessarily the TRUTH</strong> - SHAP faithfully describes what the model actually did, but if the model itself learned a spurious correlation (e.g. relying on zip code as a proxy for a protected attribute), SHAP will faithfully report that reliance as "important" - it explains the model's behavior, it doesn't validate that the model's behavior is fair or correct; that judgment still requires a human.</li>
</ul>
<h3>SHAP vs LIME</h3>
<ul>
<li><strong>LIME (Local Interpretable Model-agnostic Explanations)</strong> explains a single prediction by fitting a simple, interpretable model (e.g. linear regression) to the black-box model's behavior in a small neighborhood AROUND that one prediction - fast, but the explanation can be unstable (different random samples near the same point can give noticeably different explanations) and has no formal fairness guarantees.</li>
<li>SHAP is generally slower (especially the model-agnostic KernelExplainer) but is grounded in the Shapley value axioms, giving CONSISTENT, theoretically justified attributions - which is why SHAP is the more common choice when explanations need to hold up to regulatory or high-stakes scrutiny, while LIME is often used for quick, exploratory debugging.</li>
</ul>`,
            codeExamples: [
                `# Comparing SHAP TreeExplainer speed to KernelExplainer (the slow, model-agnostic fallback)
import shap
import xgboost as xgb
from sklearn.datasets import load_breast_cancer
import time

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
model = xgb.XGBClassifier(n_estimators=50, max_depth=3, random_state=0).fit(X, y)

sample = X.iloc[:20]        # explain 20 rows
background = X.iloc[:50]    # small background set KernelExplainer needs for sampling

start = time.time()
tree_explainer = shap.TreeExplainer(model)
tree_shap_values = tree_explainer.shap_values(sample)
tree_time = time.time() - start

start = time.time()
kernel_explainer = shap.KernelExplainer(model.predict_proba, background)
kernel_shap_values = kernel_explainer.shap_values(sample, nsamples=100)
kernel_time = time.time() - start

print(f"TreeExplainer:   {tree_time:.3f} s for 20 predictions (exact, exploits tree structure)")
print(f"KernelExplainer: {kernel_time:.3f} s for 20 predictions (approximate, model-agnostic sampling)")
print(f"KernelExplainer was ~{kernel_time / tree_time:.0f}x slower")
# OUTPUT (typical):
# TreeExplainer:   0.018 s for 20 predictions (exact, exploits tree structure)
# KernelExplainer: 4.210 s for 20 predictions (approximate, model-agnostic sampling)
# KernelExplainer was ~234x slower`
            ],
            codeExplanations: [
                `This directly benchmarks the two explainer types discussed above on the same model and data. TreeExplainer exploits the fact that it knows the exact internal structure of the gradient-boosted trees (every split, every leaf value), letting it compute EXACT Shapley values via a specialized fast algorithm rather than brute-force sampling. KernelExplainer, in contrast, treats the model as a total black box - it only calls model.predict_proba like any external caller could - and approximates Shapley values by repeatedly perturbing input features against a background dataset and fitting a weighted linear model to the results, which requires many more model calls (controlled by nsamples) and is dramatically slower, as the timing output shows. This tradeoff is exactly why practitioners reach for TreeExplainer/DeepExplainer whenever the model type allows it, and fall back to the much slower KernelExplainer only when explaining an opaque model (like a third-party API) with no other option.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are SHAP values conceptually, and what guarantee makes them different from a simple feature-importance score?</td><td>SHAP values are derived from Shapley values in cooperative game theory - each feature is a "player" and the model's prediction is the "payout," fairly split by averaging each feature's marginal contribution across every possible ordering features could be added in. This gives a formal additivity guarantee: the baseline prediction plus the sum of every feature's SHAP value exactly equals the model's actual prediction for that row, unlike ad-hoc importance scores which offer no such guarantee</td></tr>
<tr class='text-center'><td>What is the difference between a local and a global SHAP explanation?</td><td>A local explanation uses one row's SHAP values to explain that ONE specific prediction (e.g. why this particular loan application was denied); a global explanation aggregates SHAP values across many/all rows (typically mean absolute SHAP value per feature) to summarize which features drive the model's behavior overall - both come from the exact same underlying per-row SHAP computation, just aggregated differently</td></tr>
<tr class='text-center'><td>How does SHAP compare to LIME, and when would you pick one over the other?</td><td>LIME explains a single prediction by fitting a simple local surrogate model around that point, which is fast but can give unstable, non-guaranteed explanations across different runs; SHAP is grounded in Shapley value axioms giving consistent, theoretically justified attributions, but is typically slower (especially the model-agnostic KernelExplainer) - SHAP is generally preferred when explanations must be defensible/regulatory-grade, LIME when a fast, rough explanation is enough for exploratory debugging</td></tr>
</table>`
        }
    ]
};
