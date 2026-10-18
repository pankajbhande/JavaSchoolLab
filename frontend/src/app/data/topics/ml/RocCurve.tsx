import { Topic } from '../../coreJava';

export const rocCurve: Topic = {
    id: 'ml-model-evaluation-roc-curve',
    name: 'ROC Curve',
    beginner: [
        {
            content: `<h4>Evaluating a Classifier Across EVERY Possible Threshold</h4>
<ul>
<li>Most metrics like precision and recall depend on a single fixed decision threshold. The <strong>ROC Curve</strong> (Receiver Operating Characteristic) instead plots how a model performs across ALL possible thresholds at once.</li>
<li>It plots <strong>True Positive Rate</strong> (TPR, same as Recall = <code>TP/(TP+FN)</code>) on the y-axis against <strong>False Positive Rate</strong> (FPR = <code>FP/(FP+TN)</code>) on the x-axis, sweeping the threshold from 1 down to 0.</li>
<li>The diagonal line from (0,0) to (1,1) represents a model doing pure RANDOM GUESSING. A good model's curve bows up and to the left, toward the top-left corner (high TPR, low FPR).</li>
<li><strong>AUC</strong> (Area Under the Curve) condenses the whole curve into a single number between 0 and 1: <code>0.5</code> = no better than random guessing, <code>1.0</code> = perfect separation between classes.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.metrics import roc_curve, roc_auc_score

X, y = make_classification(n_samples=1000, n_features=10, random_state=0)
model = LogisticRegression().fit(X, y)
probabilities = model.predict_proba(X)[:, 1]

fpr, tpr, thresholds = roc_curve(y, probabilities)
auc = roc_auc_score(y, probabilities)

print(f"Number of threshold points on the curve: {len(thresholds)}")
print(f"AUC: {auc:.3f}")
# OUTPUT (typical):
# Number of threshold points on the curve: 43
# AUC: 0.936   <- well above 0.5, model separates the two classes well`
            ],
            codeExplanations: [
                `This trains a LogisticRegression classifier and gets its predicted probabilities for the positive class rather than hard 0/1 predictions. roc_curve() sweeps the decision threshold from high to low and, at each distinct threshold value present in the data, computes the resulting False Positive Rate and True Positive Rate - returning arrays of these paired points that together trace out the ROC curve. roc_auc_score() computes the area under that curve directly (without needing to plot it) as a single summary number. An AUC of 0.936 means: if you pick one random true-positive example and one random true-negative example, the model ranks the positive one higher about 93.6% of the time - a strong sign that the model separates the two classes well across the board, not just at one arbitrary threshold.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>A metric measured at one fixed threshold (like precision, recall, or accuracy at threshold=0.5) only tells you how the model behaves at THAT one operating point - it says nothing about whether the model would still be good if the threshold needed to move (e.g. because business priorities changed from favoring precision to favoring recall).</li>
<li>Without ROC-AUC, comparing two candidate models becomes threshold-dependent and easy to get wrong: Model A might beat Model B at threshold=0.5 but lose badly at threshold=0.3, and picking a winner based on one arbitrary cutoff can be misleading.</li>
<li>ROC-AUC answers a threshold-INDEPENDENT question - "how well does this model rank positives above negatives overall?" - which is exactly what's needed when choosing between models before a specific business threshold has even been decided.</li>
</ul>
<h3>Real-World Example</h3>
A payments company is choosing between two candidate models to detect fraudulent credit card transactions before shipping one to production.
<ul>
<li>Model A is a Logistic Regression baseline; Model B is a more complex Gradient Boosting model. Both output a fraud probability per transaction, and the fraud team hasn't yet decided on the exact threshold they'll use to flag transactions for manual review.</li>
<li>Instead of comparing them at one arbitrary cutoff, the team plots both models' ROC curves on the same chart and compares their AUC scores - this shows which model ranks genuinely fraudulent transactions above legitimate ones more reliably, across every possible threshold they might eventually choose.</li>
<li>Once Model B is selected for its higher AUC, the team THEN picks the specific operating threshold separately, based on how many false alarms (FP) the fraud review team can realistically handle per day - a business decision made after the model comparison, not as part of it.</li>
</ul>`,
            codeExamples: [
                `# Comparing two fraud-detection models by AUC, independent of any single threshold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X, y = make_classification(n_samples=2000, n_features=15, weights=[0.95, 0.05], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model_a = LogisticRegression().fit(X_train, y_train)
model_b = GradientBoostingClassifier(random_state=0).fit(X_train, y_train)

auc_a = roc_auc_score(y_test, model_a.predict_proba(X_test)[:, 1])
auc_b = roc_auc_score(y_test, model_b.predict_proba(X_test)[:, 1])

print(f"Model A (Logistic Regression) AUC: {auc_a:.3f}")
print(f"Model B (Gradient Boosting) AUC:   {auc_b:.3f}")
# OUTPUT (typical):
# Model A (Logistic Regression) AUC: 0.912
# Model B (Gradient Boosting) AUC:   0.951   <- ranks fraud cases better across all thresholds`
            ],
            codeExplanations: [
                `This simulates an imbalanced fraud-detection dataset (only 5% positive/fraud, mirroring real-world fraud rarity) and trains two competing models - a simple LogisticRegression and a more expressive GradientBoostingClassifier - on identical train/test splits. Rather than comparing them at one fixed decision threshold, roc_auc_score() is computed on each model's predicted probabilities on the held-out test set, summarizing how well each model ranks actual fraud above actual non-fraud across every possible threshold at once. Model B's higher AUC (0.951 vs 0.912) indicates it is the more reliable ranker overall, which is the right basis for choosing between models BEFORE the team has committed to a specific review-queue threshold.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - When ROC-AUC Is Misleading</h3>
<ul>
<li>False Positive Rate is defined relative to the NEGATIVE class size (<code>FP/(FP+TN)</code>). When negatives vastly outnumber positives (severe class imbalance), a large absolute number of false positives can still produce a tiny FPR, making the ROC curve look deceptively good.</li>
<li>In that situation, <strong>Precision</strong> (which is sensitive to the ABSOLUTE number of false positives relative to true positives, not relative to the huge negative pool) tells a much more honest story - which is why the <strong>Precision-Recall (PR) Curve</strong> and its area (PR-AUC / Average Precision) are often preferred over ROC-AUC on severely imbalanced problems, e.g. fraud detection where positives might be 0.1% of all transactions.</li>
<li>A useful mental model: ROC-AUC answers "how well does the model separate the classes overall?" while a PR curve answers "when the model says positive, how often is it actually right, and how much of the positive class does it find?" - the second question is usually the one that matters operationally on rare-event problems.</li>
</ul>`,
            codeExamples: [
                `# ROC-AUC can look great even when precision is terrible, under severe class imbalance
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score

# severe imbalance: positives are only 0.5% of the data
X, y = make_classification(n_samples=5000, n_features=10, weights=[0.995, 0.005],
                            flip_y=0.02, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
probabilities = model.predict_proba(X_test)[:, 1]

roc_auc = roc_auc_score(y_test, probabilities)
pr_auc = average_precision_score(y_test, probabilities)

print(f"ROC-AUC: {roc_auc:.3f}")
print(f"PR-AUC (Average Precision): {pr_auc:.3f}")
# OUTPUT (typical):
# ROC-AUC: 0.870              <- looks strong
# PR-AUC (Average Precision): 0.310   <- reveals the model struggles to be precise on the rare positive class`
            ],
            codeExplanations: [
                `This deliberately builds a SEVERELY imbalanced dataset (positives are only 0.5% of all samples, mimicking rare-event fraud or disease data) and trains a LogisticRegression model on it. roc_auc_score() reports a seemingly strong 0.870, because False Positive Rate is measured against the enormous negative class - so even a meaningful number of false positives barely nudges the FPR and the curve still looks good. average_precision_score() (the area under the Precision-Recall curve) reports a much lower 0.310, exposing that when this model does flag something as positive, it's frequently wrong relative to how few true positives exist - a far more honest signal of real-world usefulness on this kind of rare-event problem, and the reason practitioners reach for PR-AUC instead of (or alongside) ROC-AUC when classes are severely imbalanced.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What do the axes of an ROC curve represent, and what does the diagonal line mean?</td><td>The y-axis is True Positive Rate (Recall) and the x-axis is False Positive Rate, plotted by sweeping the decision threshold across all possible values; the diagonal from (0,0) to (1,1) represents a model that performs no better than random guessing, so a useful model's curve should bow up and to the left of that line</td></tr>
<tr class='text-center'><td>What does an AUC of 0.5 vs 1.0 mean?</td><td>AUC is the probability that the model ranks a randomly chosen positive example above a randomly chosen negative example; 0.5 means the model ranks them correctly only half the time (equivalent to random guessing), while 1.0 means it always ranks the true positive higher (perfect separation between the classes)</td></tr>
<tr class='text-center'><td>Why can ROC-AUC be misleading on severely imbalanced datasets, and what's often used instead?</td><td>False Positive Rate is measured relative to the (huge) negative class size, so even a large absolute number of false positives barely moves it, making the curve look deceptively good; the Precision-Recall curve and its area (PR-AUC / Average Precision) are usually preferred instead, since precision is sensitive to the actual ratio of false positives to true positives rather than to the size of the negative class</td></tr>
</table>`
        }
    ]
};
