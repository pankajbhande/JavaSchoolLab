import { Topic } from '../../coreJava';

export const precisionRecallCurve: Topic = {
    id: 'ml-model-evaluation-precision-recall-curve',
    name: 'Precision-Recall Curve',
    beginner: [
        {
            content: `<h4>Plotting Precision Against Recall Across Every Threshold</h4>
<ul>
<li>Just like the ROC curve sweeps a decision threshold and plots True Positive Rate against False Positive Rate, the <strong>Precision-Recall (PR) Curve</strong> sweeps the same threshold and plots <strong>Precision</strong> (y-axis) against <strong>Recall</strong> (x-axis).</li>
<li>A model with a curve that stays high (close to precision = 1.0) across a wide range of recall values is a strong performer; a curve that drops sharply as recall increases reveals a model that has to sacrifice a lot of precision to catch more real positives.</li>
<li>Its single-number summary, <strong>Average Precision (AP)</strong>, condenses the whole curve the way AUC condenses the ROC curve - a higher AP means a better overall precision/recall balance across all thresholds.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.metrics import precision_recall_curve, average_precision_score

X, y = make_classification(n_samples=1000, weights=[0.9, 0.1], random_state=0)
model = LogisticRegression().fit(X, y)
probabilities = model.predict_proba(X)[:, 1]

precision, recall, thresholds = precision_recall_curve(y, probabilities)
ap = average_precision_score(y, probabilities)

print(f"Number of threshold points on the curve: {len(thresholds)}")
print(f"Average Precision: {ap:.3f}")
# OUTPUT (typical):
# Number of threshold points on the curve: 231
# Average Precision: 0.812`
            ],
            codeExplanations: [
                `This trains a LogisticRegression classifier on imbalanced data and gets its predicted probabilities for the positive class. precision_recall_curve() sweeps the decision threshold and, at each distinct value, computes the resulting precision and recall - returning paired arrays that trace out the PR curve. average_precision_score() computes the area under that curve directly as a single summary number. An Average Precision of 0.812 indicates the model maintains a reasonably strong precision/recall balance across a wide range of thresholds, giving a single comparable score the same way AUC does for the ROC curve.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Precision and recall at a single fixed threshold only describe one operating point. The PR curve shows the full tradeoff a model offers across every possible threshold, making it possible to see up front how much precision must be sacrificed to reach a given recall target (or vice versa) before committing to one.</li>
<li>Because the PR curve is built entirely from precision and recall - both of which ignore true negatives (TN) - it stays sensitive to model performance on the positive class even when the negative class vastly outnumbers it, unlike the ROC curve's False Positive Rate which gets diluted by a huge TN pool.</li>
<li>This makes the PR curve the natural choice whenever the POSITIVE class is rare and is also the class that actually matters - exactly the situation where ROC-AUC's optimism can be most misleading.</li>
</ul>
<h3>Real-World Example</h3>
A hospital builds a model to detect a rare disease that affects only 1% of the screened population.
<ul>
<li>The team plots the model's <strong>ROC curve</strong> first, and it looks excellent - bowing sharply toward the top-left corner with an AUC of 0.95. This looks like a strong model at first glance.</li>
<li>But when the team plots the <strong>Precision-Recall curve</strong> for the same model on the same data, it tells a very different story: precision drops sharply even at modest recall levels, revealing that most of the patients flagged as "at risk" are actually healthy - the model performs mediocrely at the thing that actually matters for deployment.</li>
<li>The ROC curve looked deceptively good because it's dominated by the huge number of correctly-cleared healthy patients (true negatives), which don't appear anywhere in the PR curve's calculation - the PR curve is what reveals the model isn't actually ready for clinical use.</li>
</ul>`,
            codeExamples: [
                `# Same model, same data - ROC looks great, but the PR curve reveals the truth on rare-disease data
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score

# rare disease: only 1% of patients are actually positive
X, y = make_classification(n_samples=5000, weights=[0.99, 0.01], flip_y=0.03, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
probabilities = model.predict_proba(X_test)[:, 1]

roc_auc = roc_auc_score(y_test, probabilities)
avg_precision = average_precision_score(y_test, probabilities)

print(f"ROC-AUC: {roc_auc:.3f}")
print(f"Average Precision (PR-AUC): {avg_precision:.3f}")
# OUTPUT (typical):
# ROC-AUC: 0.930                       <- looks excellent
# Average Precision (PR-AUC): 0.280    <- reveals the model is actually mediocre at flagging real cases`
            ],
            codeExplanations: [
                `This trains one LogisticRegression model on a simulated rare-disease dataset (only 1% positive) and evaluates it with both metrics on the same held-out predictions. ROC-AUC reports a strong-looking 0.930 because False Positive Rate is diluted by the enormous number of correctly cleared healthy patients. average_precision_score() (the PR curve's area) reports a much lower 0.280, exposing that when the model does flag a patient as at-risk, it's frequently wrong relative to the small number of real positive cases - a far more honest reflection of how the model would actually perform in a clinical deployment where the team cares specifically about the reliability of positive flags.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Average Precision as PR's Single-Number Summary</h3>
<ul>
<li><strong>Average Precision (AP)</strong> computes a weighted sum of precision achieved at each recall level as the threshold sweeps down, weighted by the increase in recall from the previous threshold: <code>AP = &Sigma;(Recall<sub>n</sub> - Recall<sub>n-1</sub>) &middot; Precision<sub>n</sub></code>. This is the standard, more numerically stable way to compute the PR curve's area (rather than naive trapezoidal integration, which can overestimate the area on a curve with a jagged shape).</li>
<li>Unlike ROC-AUC's baseline of 0.5 for a random classifier, the PR curve's random-guess baseline depends on the class distribution itself - it equals the fraction of positives in the dataset. On a 1%-positive dataset, a random classifier's AP is around 0.01, not 0.5, so AP values must always be interpreted relative to that class-dependent baseline, not against a fixed universal number.</li>
<li>Because of this dependence on class balance, AP scores are NOT directly comparable across datasets with different positive rates - a model with AP=0.4 on a 1%-positive problem may be far stronger, relatively speaking, than a model with AP=0.4 on a 40%-positive problem.</li>
</ul>`,
            codeExamples: [
                `# Average Precision's baseline shifts with class balance - unlike ROC-AUC's fixed 0.5 baseline
import numpy as np
from sklearn.metrics import average_precision_score, roc_auc_score

rng = np.random.default_rng(0)

for positive_rate, label in [(0.01, "1% positive"), (0.40, "40% positive")]:
    n = 5000
    y_actual = (rng.uniform(0, 1, n) < positive_rate).astype(int)
    # a genuinely random classifier: probabilities carry no real signal
    random_scores = rng.uniform(0, 1, n)

    ap = average_precision_score(y_actual, random_scores)
    auc = roc_auc_score(y_actual, random_scores)
    print(f"{label}: random-classifier AP={ap:.3f}  ROC-AUC={auc:.3f}")
# OUTPUT (typical):
# 1% positive: random-classifier AP=0.011  ROC-AUC=0.500
# 40% positive: random-classifier AP=0.402  ROC-AUC=0.499`
            ],
            codeExplanations: [
                `This generates purely random prediction scores (carrying no real signal at all) against two datasets with very different positive class rates - 1% and 40%. ROC-AUC stays anchored near 0.5 for a random classifier regardless of class balance, exactly as expected. But Average Precision tracks the underlying positive rate instead - about 0.011 on the 1%-positive data and about 0.402 on the 40%-positive data. This demonstrates concretely why an AP score can only be judged relative to its dataset's own class balance (the "no skill" baseline), and why comparing raw AP numbers across two different problems with different positive rates is misleading without first accounting for that baseline shift.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does a Precision-Recall curve plot, and how does it differ from an ROC curve?</td><td>It plots Precision (y-axis) against Recall (x-axis) as the decision threshold sweeps across all values, whereas an ROC curve plots True Positive Rate against False Positive Rate; unlike ROC, the PR curve never involves true negatives, which keeps it sensitive to positive-class performance even when negatives vastly outnumber positives</td></tr>
<tr class='text-center'><td>Why is the PR curve preferred over the ROC curve on severely imbalanced data?</td><td>ROC's False Positive Rate is measured relative to the size of the (huge) negative class, so it can look deceptively good even when the model performs poorly on the rare positive class; precision is sensitive to the actual ratio of false positives to true positives regardless of how large the negative class is, giving a more honest picture on rare-event problems</td></tr>
<tr class='text-center'><td>What is Average Precision, and why can't it be compared directly across datasets with different class balances?</td><td>Average Precision (AP) is the area under the PR curve, computed as a weighted sum of precision at each recall level - it is the PR curve's equivalent of ROC-AUC; unlike ROC-AUC's fixed 0.5 random baseline, a random classifier's AP equals the dataset's positive class rate, so AP values are only meaningful relative to that dataset-specific baseline, not comparable in absolute terms across datasets with different positive rates</td></tr>
</table>`
        }
    ]
};
