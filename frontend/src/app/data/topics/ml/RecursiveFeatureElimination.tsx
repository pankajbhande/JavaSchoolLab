import { Topic } from '../../coreJava';

export const recursiveFeatureElimination: Topic = {
    id: 'ml-feature-engineering-recursive-feature-elimination-rfe',
    name: 'Recursive Feature Elimination (RFE)',
    beginner: [
        {
            content: `<h4>Whittling Down to the Features That Actually Matter</h4>
<ul>
<li><strong>Recursive Feature Elimination (RFE)</strong> is a FEATURE SELECTION technique - instead of creating new features (like feature engineering does), it REMOVES the weakest ones, keeping only what a model actually needs.</li>
<li>It works iteratively: (1) train a model on all current features, (2) rank every feature by importance (e.g. coefficient magnitude or tree-based importance), (3) drop the single weakest feature (or the weakest chunk), (4) repeat on the smaller feature set until only the target number of features remains.</li>
<li>Unlike a FILTER method (e.g. just checking each feature's correlation with the target independently), RFE is a WRAPPER method - it repeatedly re-trains the actual downstream model, so it captures how features interact with each other, not just how each looks in isolation.</li>
</ul>`,
            codeExamples: [
                `from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_breast_cancer

X, y = load_breast_cancer(return_X_y=True)
feature_names = load_breast_cancer().feature_names

model = LogisticRegression(max_iter=5000)
selector = RFE(estimator=model, n_features_to_select=5, step=1)
selector.fit(X, y)

selected = feature_names[selector.support_]
print("Selected 5 features:", list(selected))
print("Feature ranking (1 = kept):", dict(zip(feature_names[:8], selector.ranking_[:8])))
# OUTPUT (typical):
# Selected 5 features: ['mean concave points', 'worst radius', 'worst texture', 'worst concave points', 'worst symmetry']
# Feature ranking (1 = kept): {'mean radius': 12, 'mean texture': 18, 'mean perimeter': 9, 'mean area': 15,
#                              'mean smoothness': 6, 'mean compactness': 20, 'mean concavity': 4, 'mean concave points': 1}`
            ],
            codeExplanations: [
                `<code>RFE</code> is given the actual downstream model (a <code>LogisticRegression</code>) and a target of <code>n_features_to_select=5</code>. Internally, it fits the logistic regression on all 30 breast-cancer features, looks at the learned coefficient magnitudes to rank feature importance, removes the single weakest feature (because <code>step=1</code>), and re-fits on the remaining 29 - repeating this loop until only 5 features are left. <code>selector.support_</code> is a boolean mask marking which features survived to the end, used here to print their names. <code>selector.ranking_</code> shows WHEN each feature was eliminated: a rank of 1 means it's one of the 5 kept features, while higher numbers mean it was dropped earlier (a higher number = eliminated earlier = considered less useful).`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before systematic feature selection, teams either threw every available column into a model (risking overfitting, slower training, and features that actively hurt accuracy by adding noise) or manually picked features based on domain intuition alone, which misses non-obvious statistical relationships and doesn't scale to hundreds of columns.</li>
<li>Filter methods (like ranking features purely by their individual correlation with the target) are fast but BLIND to interactions - a feature that looks useless alone can become highly predictive in combination with another, and RFE (by repeatedly re-training the real model) captures that where a filter method cannot.</li>
<li>Fewer, well-chosen features also mean a model that's easier to explain to a non-technical stakeholder, faster to serve in production, and less likely to break when an unused, noisy column's data quality silently degrades upstream.</li>
</ul>
<h3>Real-World Example</h3>
A hospital research team is building a model to predict early-stage risk of a specific disease from a panel of <strong>300 blood biomarkers</strong> measured per patient. Two problems: (1) with only ~800 patient records but 300 candidate features, a model trained on everything will badly overfit, and (2) more importantly, the treating doctors explicitly need an INTERPRETABLE model - they want to know "which 8-10 biomarkers actually drive this prediction," not a black-box using all 300 inputs, because that's what they can act on and explain to patients. The team uses <code>RFECV</code> (RFE with built-in cross-validation) to both select the strongest biomarkers AND let the data decide the optimal number to keep, rather than guessing a fixed number like 5 or 10 upfront.`,
            codeExamples: [
                `# RFECV: let cross-validation pick the optimal number of features automatically
import numpy as np
from sklearn.feature_selection import RFECV
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.datasets import make_classification

# Simulate a biomarker-style dataset: 300 features, only ~15 are truly informative
X, y = make_classification(
    n_samples=800, n_features=300, n_informative=15, n_redundant=30,
    n_clusters_per_class=2, weights=[0.7, 0.3], random_state=0,
)

model = RandomForestClassifier(n_estimators=200, random_state=0)
selector = RFECV(
    estimator=model,
    step=10,                                   # drop 10 weakest features per round (faster than step=1 on 300 features)
    cv=StratifiedKFold(5),
    scoring="roc_auc",
    min_features_to_select=5,
    n_jobs=-1,
)
selector.fit(X, y)

print(f"Optimal number of biomarkers: {selector.n_features_}")
print(f"Best cross-validated AUC: {max(selector.cv_results_['mean_test_score']):.4f}")
# OUTPUT (typical):
# Optimal number of biomarkers: 45
# Best cross-validated AUC: 0.9127
# (RFECV tries several feature-set sizes and picks the one with the best CV score -
#  going smaller than 45 loses real signal, going larger just adds noise without helping AUC.)`
            ],
            codeExplanations: [
                `<code>RFECV</code> extends plain RFE by wrapping the elimination loop in cross-validation: at EACH step (removing 10 features at a time, since <code>step=10</code>), it doesn't just blindly keep shrinking the feature set - it scores that feature-set size with 5-fold stratified cross-validated AUC, and remembers how well each SIZE performed. After trying all sizes down to <code>min_features_to_select=5</code>, it automatically picks the feature-set size with the best cross-validated score (here, 45 biomarkers) rather than requiring the analyst to guess a fixed target count upfront. <code>selector.cv_results_['mean_test_score']</code> holds the average CV score at every tested feature-set size, letting you plot how performance changes as features are removed - typically rising as noisy features are dropped, then flattening or dropping once truly informative features start being removed too.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Captures feature interactions</strong> - because it repeatedly re-trains the actual model rather than scoring each feature independently, it can keep a feature that's weak alone but strong in combination (e.g. two biomarkers whose RATIO is predictive even though neither is individually).</li>
<li><strong>Model-aware ranking</strong> - the importance ranking comes from the SAME algorithm that will be deployed (e.g. Random Forest importances if you're deploying a Random Forest), so the selected features are tailored to that model rather than a generic statistical test.</li>
<li><strong>RFECV removes manual guesswork</strong> - instead of arbitrarily deciding "keep the top 10 features," RFECV lets cross-validated performance decide the optimal count, avoiding both under- and over-selection.</li>
<li><strong>Improves interpretability and deployment</strong> - a model using 10-45 well-chosen features instead of 300 raw columns is easier to explain to domain experts (like the hospital's doctors) and cheaper/faster to serve in production, since fewer inputs need to be collected and validated.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Computationally expensive</strong> - unlike a filter method that scores each feature once, RFE re-trains a full model at every elimination step (and RFECV multiplies that by the number of CV folds), which can be slow on large feature counts or slow-to-train models like gradient boosting.</li>
<li><strong>Tied to one estimator's notion of importance</strong> - the feature ranking reflects what THAT specific model type considers important (e.g. linear coefficients vs. tree impurity-based importances), so features selected for a Random Forest may not be the ideal set for a completely different model like an SVM.</li>
<li><strong>Greedy, not globally optimal</strong> - because it eliminates the weakest feature(s) at each step without reconsidering earlier removals, it can occasionally discard a feature early that would have become valuable in combination with features removed later - a true exhaustive search would be needed to guarantee the globally best subset, which is computationally infeasible at scale.</li>
<li><strong>Sensitive to correlated/redundant features</strong> - when two features are highly correlated, RFE may arbitrarily keep one and drop the other based on small random fluctuations, making the exact selected set somewhat unstable across reruns unless a fixed random seed is used.</li>
</ul>`,
            codeExamples: [
                `# Comparing RFE (wrapper, model-aware) against a simple filter method (correlation with target)
import numpy as np
import pandas as pd
from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=500, n_features=20, n_informative=6, n_redundant=4,
    random_state=1,
)
columns = [f"feature_{i}" for i in range(X.shape[1])]
df = pd.DataFrame(X, columns=columns)

# Filter method: rank features purely by absolute correlation with the target, independently
corr_ranking = df.apply(lambda col: abs(np.corrcoef(col, y)[0, 1])).sort_values(ascending=False)
filter_top6 = list(corr_ranking.index[:6])

# Wrapper method: RFE re-trains a logistic regression and considers features jointly
rfe = RFE(LogisticRegression(max_iter=2000), n_features_to_select=6)
rfe.fit(X, y)
rfe_top6 = [columns[i] for i in range(len(columns)) if rfe.support_[i]]

print("Filter method top 6:", filter_top6)
print("RFE (wrapper) top 6:", rfe_top6)
print("Overlap:", set(filter_top6) & set(rfe_top6))
# OUTPUT (typical):
# Filter method top 6: ['feature_2', 'feature_5', 'feature_8', 'feature_11', 'feature_14', 'feature_17']
# RFE (wrapper) top 6: ['feature_2', 'feature_5', 'feature_8', 'feature_9', 'feature_11', 'feature_16']
# Overlap: {'feature_2', 'feature_5', 'feature_8', 'feature_11'}
# (The two methods agree on the strongest, individually-correlated features, but diverge on the
#  rest - RFE picks feature_9 and feature_16 because of how they interact with the model jointly,
#  something the independent correlation filter cannot see.)`
            ],
            codeExplanations: [
                `The filter-method block computes each feature's raw correlation with the target INDEPENDENTLY (no model involved) and takes the top 6 by absolute correlation - this is fast but completely ignores how features might combine. The RFE block instead fits a real <code>LogisticRegression</code> and lets it iteratively eliminate features based on the model's own learned coefficients, which accounts for how features interact once combined in the same model. Comparing the two resulting top-6 lists (and their overlap) makes the "wrapper vs filter" difference concrete: features both methods agree on are probably strong on their own, while features RFE picked but the filter missed are exactly the kind of feature that only reveals its value in combination with others - the interaction-awareness that makes RFE more expensive but often more accurate.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Recursive Feature Elimination work?</td><td>It repeatedly trains a model on the current feature set, ranks features by the model's own importance measure (e.g. coefficient magnitude or tree-based importance), removes the weakest feature(s), and re-trains on the smaller set - continuing this loop until the desired number of features remains</td></tr>
<tr class='text-center'><td>What's the difference between RFE and a filter-based feature selection method?</td><td>A filter method (like ranking by correlation with the target) scores each feature independently and never touches the actual model, making it fast but blind to feature interactions; RFE is a wrapper method that repeatedly re-trains the real downstream model, so it can capture features that are only useful in combination with others, at the cost of being far more computationally expensive</td></tr>
<tr class='text-center'><td>Why use RFECV instead of plain RFE?</td><td>Plain RFE requires you to specify the target number of features to keep upfront, which is often an arbitrary guess; RFECV wraps the elimination process in cross-validation, scoring every candidate feature-set size and automatically selecting the size with the best cross-validated performance, removing the need to manually guess the right number of features</td></tr>
</table>`
        }
    ]
};
