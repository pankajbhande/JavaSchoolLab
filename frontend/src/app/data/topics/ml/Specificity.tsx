import { Topic } from '../../coreJava';

export const specificity: Topic = {
    id: 'ml-model-evaluation-specificity',
    name: 'Specificity',
    beginner: [
        {
            content: `<h4>Of Everything That Was ACTUALLY Negative, How Much Did You Correctly Clear?</h4>
<ul>
<li><strong>Specificity</strong> (also called the <strong>True Negative Rate</strong>) answers: "Of all the cases that were REALLY negative, how many did the model correctly identify as negative?" <code>Specificity = TN / (TN + FP)</code>.</li>
<li>It looks only at the actual negative cases (the TN + FP row of a confusion matrix) and asks how many the model correctly cleared - it says nothing about how many real positive cases were missed.</li>
<li>Specificity is the mirror image of <strong>Recall (Sensitivity)</strong>: recall measures how well the model finds the POSITIVE class, while specificity measures how well it correctly clears the NEGATIVE class.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import confusion_matrix

# 1 = has disease, 0 = healthy
y_actual =    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
y_predicted = [1, 0, 1, 0, 0, 1, 0, 0, 0, 0]

tn, fp, fn, tp = confusion_matrix(y_actual, y_predicted).ravel()
specificity = tn / (tn + fp)
print(f"TN={tn}  FP={fp}")
print(f"Specificity: {specificity:.2f}")
# OUTPUT:
# TN=6  FP=1
# Specificity: 0.86   <- of the 7 actually healthy patients, 6 were correctly cleared`
            ],
            codeExplanations: [
                `This compares 10 actual labels against 10 predicted labels and extracts the four confusion-matrix cells with scikit-learn's confusion_matrix(). Specificity only looks at the 7 patients who are actually healthy (TN + FP = 6 + 1 = 7) and asks how many the model correctly labeled as healthy (6), giving 0.86. The one healthy patient wrongly flagged as sick is a false positive - the exact error specificity is designed to expose, regardless of how well the model does at catching real disease cases (which is recall's job, not specificity's).`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Recall (sensitivity) alone only tells half the story - a model can achieve perfect recall trivially by flagging everything as positive, which would also drive specificity to 0 because every real negative becomes a false alarm. Specificity is the metric that catches exactly this failure mode.</li>
<li>Reporting recall and specificity together gives a COMPLETE picture of a binary classifier's behavior on both classes - how well it finds real positives, and separately, how well it correctly leaves real negatives alone.</li>
<li>Specificity matters most whenever a <strong>false positive</strong> carries a real cost - unnecessary anxiety, wasted resources, or harmful side effects from a treatment given to someone who didn't need it.</li>
</ul>
<h3>Real-World Example</h3>
A city rolls out a rapid diagnostic test to screen residents for a contagious respiratory virus during an outbreak.
<ul>
<li>A <strong>False Positive</strong> here means a genuinely healthy person is told they're infected - triggering an unnecessary mandatory quarantine, lost wages, and public panic, even though they were never sick.</li>
<li>A <strong>False Negative</strong> means an infected person is told they're healthy and continues about their day, potentially spreading the virus further.</li>
<li>Because falsely quarantining large numbers of healthy people would be socially and economically disruptive at scale, health officials specifically track the test's <strong>Specificity</strong> - how reliably it avoids flagging healthy people - alongside its sensitivity, before deciding whether it's fit for mass screening.</li>
</ul>`,
            codeExamples: [
                `# Comparing two candidate screening tests by specificity, not just sensitivity
from sklearn.metrics import confusion_matrix, recall_score

# 1 = infected, 0 = healthy (simplified outcomes from two candidate tests)
y_actual         = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
y_pred_test_a    = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]   # very cautious: rarely flags healthy people
y_pred_test_b    = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]   # very sensitive, but over-flags healthy people

for name, y_pred in [("Test A", y_pred_test_a), ("Test B", y_pred_test_b)]:
    tn, fp, fn, tp = confusion_matrix(y_actual, y_pred).ravel()
    specificity = tn / (tn + fp)
    sensitivity = recall_score(y_actual, y_pred)
    print(f"{name}: sensitivity={sensitivity:.2f}  specificity={specificity:.2f}")
# OUTPUT:
# Test A: sensitivity=0.67  specificity=1.00   <- never falsely quarantines a healthy person
# Test B: sensitivity=1.00  specificity=0.71   <- catches every infection, but falsely quarantines 2 healthy people`
            ],
            codeExplanations: [
                `This compares two candidate diagnostic tests on the same 10 patients. Test A misses one real infection (sensitivity 0.67) but never falsely flags a healthy person (specificity 1.00). Test B catches every real infection (sensitivity 1.00) but falsely flags 2 of the 7 healthy people as infected (specificity 0.71). Neither number alone tells the full story - a health official weighing the social cost of unnecessary quarantines against the risk of undetected spread needs BOTH sensitivity and specificity side by side to decide which test is appropriate for mass rollout, which is exactly why specificity is reported alongside recall/sensitivity rather than in isolation.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Specificity's Direct Link to the ROC Curve</h3>
<ul>
<li>The <strong>False Positive Rate</strong> used on the x-axis of an ROC curve is defined as <code>FPR = FP / (FP + TN)</code>, which is mathematically exactly <code>1 - Specificity</code>. So every point on an ROC curve is really plotting <strong>Sensitivity vs (1 - Specificity)</strong> as the decision threshold sweeps across all values.</li>
<li>This means specificity isn't a separate, disconnected metric from ROC-AUC - it's baked directly into how the curve's horizontal axis is built. A model that stays close to the top-left corner of the ROC curve is one that keeps sensitivity high while keeping specificity high too (equivalently, keeping FPR low).</li>
<li>In medical statistics, specificity and sensitivity are usually reported as a PAIR at a single chosen threshold (e.g. "92% sensitive, 88% specific"), while the ROC curve shows how that same tradeoff plays out continuously across every possible threshold at once.</li>
</ul>`,
            codeExamples: [
                `# Showing that 1 - Specificity is exactly the False Positive Rate used in an ROC curve
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.metrics import roc_curve

X, y = make_classification(n_samples=1000, random_state=0)
model = LogisticRegression().fit(X, y)
probabilities = model.predict_proba(X)[:, 1]

fpr, tpr, thresholds = roc_curve(y, probabilities)
# pick one point on the curve and derive specificity from its FPR
i = len(thresholds) // 2
specificity_at_point = 1 - fpr[i]
print(f"At threshold={thresholds[i]:.2f}: sensitivity(TPR)={tpr[i]:.2f}  FPR={fpr[i]:.2f}  specificity={specificity_at_point:.2f}")
# OUTPUT (typical):
# At threshold=0.50: sensitivity(TPR)=0.87  FPR=0.09  specificity=0.91`
            ],
            codeExplanations: [
                `This trains a LogisticRegression model and uses scikit-learn's roc_curve() to get arrays of False Positive Rate and True Positive Rate (which is the same thing as sensitivity/recall) at every threshold the curve sweeps through. Picking one representative point on the curve, specificity is derived simply as 1 minus that point's FPR - no separate calculation is needed, because FPR and specificity are two sides of the exact same coin. This makes explicit something often left implicit: the ROC curve's x-axis literally IS "1 - specificity," which is why understanding specificity deepens (rather than duplicates) the understanding of what an ROC curve is actually plotting.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does specificity measure, and what formula defines it?</td><td>Specificity = TN / (TN+FP) - of all the cases that were actually negative, what fraction did the model correctly identify as negative; it says nothing about how many real positive cases were missed</td></tr>
<tr class='text-center'><td>How does specificity relate to recall/sensitivity, and why do you need both?</td><td>Recall (sensitivity) measures how well the model finds real positives; specificity measures how well it correctly clears real negatives. A model can trivially maximize one at the expense of the other (e.g. flagging everything positive gives perfect sensitivity but zero specificity), so both must be reported together for a complete picture</td></tr>
<tr class='text-center'><td>How does specificity relate mathematically to the ROC curve?</td><td>The ROC curve's x-axis, False Positive Rate, equals FP/(FP+TN), which is exactly 1 - Specificity; so an ROC curve is really plotting sensitivity against (1 - specificity) across every possible decision threshold</td></tr>
</table>`
        }
    ]
};
