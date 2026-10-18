import { Topic } from '../../coreJava';

export const recall: Topic = {
    id: 'ml-model-evaluation-recall',
    name: 'Recall',
    beginner: [
        {
            content: `<h4>Of Everything That Was ACTUALLY Positive, How Much Did You Catch?</h4>
<ul>
<li><strong>Recall</strong> (also called <strong>Sensitivity</strong>) answers: "Of all the cases that were REALLY positive, how many did the model correctly identify?" <code>Recall = TP / (TP + FN)</code>.</li>
<li>It looks only at the actual positive cases (the TP + FN row of a confusion matrix) and asks how many of them the model managed to catch - it says nothing about how many false alarms (FP) the model also raised along the way.</li>
<li>High recall means very few real positives slip through as false negatives; low recall means the model is missing a large share of the cases it was supposed to find.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import recall_score

# 1 = has disease, 0 = healthy
y_actual =    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
y_predicted = [1, 1, 0, 1, 0, 0, 0, 0, 0, 0]

print(f"Recall: {recall_score(y_actual, y_predicted):.2f}")
# OUTPUT:
# Recall: 0.60   <- of the 5 actual disease cases, only 3 were caught`
            ],
            codeExplanations: [
                `This compares 10 actual disease labels against 10 predicted labels using scikit-learn's recall_score(). Recall only looks at the rows where the actual label is 1 (5 real disease cases here) and checks how many of those the model predicted correctly (3 of them), giving 0.60. The two real disease cases the model called "healthy" are false negatives - the exact errors recall is designed to expose, regardless of how many false alarms the model may or may not have raised elsewhere.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Recall is the metric to optimize whenever a <strong>false negative</strong> - missing a real positive case - is far more costly than a false positive. In those situations, a model can be forgiven for raising extra false alarms, but it cannot be forgiven for letting a real case slip through undetected.</li>
<li>Accuracy and precision can both look fine while recall quietly hides a dangerous blind spot: a model can score high accuracy by correctly handling the easy majority class while still missing most of the rare, critical positive cases - recall is what exposes that gap directly.</li>
<li>Recall is also called <strong>Sensitivity</strong> in medical and statistical contexts, and it is one half of the fundamental precision-recall tradeoff: pushing recall up (by lowering the decision threshold so more things get flagged positive) almost always pulls precision down, because more false positives get let through along with the extra true positives.</li>
</ul>
<h3>Real-World Example</h3>
A hospital deploys a machine learning model to screen for cancer from imaging scans, flagging suspicious cases for a specialist to review.
<ul>
<li>A <strong>False Negative</strong> here means a real cancer case is told "you're healthy" and sent home - a missed diagnosis that can allow the disease to progress untreated, potentially costing a life.</li>
<li>A <strong>False Positive</strong> means a healthy patient is sent for an extra, unnecessary specialist review - inconvenient and costly, but not life-threatening.</li>
<li>Because a missed cancer case is so much more costly than an extra false alarm, the hospital deliberately tunes the model's decision threshold to maximize <strong>Recall</strong> even at the expense of precision, accepting more false positives in exchange for catching nearly every real case.</li>
</ul>`,
            codeExamples: [
                `# Tuning the decision threshold specifically to push recall up in cancer screening
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.metrics import recall_score, precision_score

X, y = make_classification(n_samples=1000, weights=[0.9, 0.1], random_state=0)
model = LogisticRegression().fit(X, y)
probabilities = model.predict_proba(X)[:, 1]

for threshold in [0.8, 0.5, 0.2]:
    y_pred = (probabilities >= threshold).astype(int)
    r = recall_score(y, y_pred, zero_division=0)
    p = precision_score(y, y_pred, zero_division=0)
    print(f"threshold={threshold}  recall={r:.2f}  precision={p:.2f}")
# OUTPUT (typical):
# threshold=0.8  recall=0.44  precision=0.93   <- misses over half of real cases
# threshold=0.5  recall=0.72  precision=0.78   <- balanced default
# threshold=0.2  recall=0.91  precision=0.55   <- catches almost every real case, at the cost of more false alarms`
            ],
            codeExplanations: [
                `This trains a single LogisticRegression model on imbalanced data and reuses its predicted probabilities at three different decision thresholds instead of retraining. Lowering the threshold from 0.8 to 0.2 means the model calls something positive much more easily, so recall climbs from 0.44 to 0.91 - it catches nearly every real positive case. The tradeoff is visible in the precision column dropping from 0.93 to 0.55, meaning more of the flagged cases turn out to be false alarms. This is exactly the knob a hospital would turn: deliberately choosing the low-threshold, high-recall operating point because missing a real cancer case (a false negative) is judged far worse than an extra, unnecessary follow-up test (a false positive).`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - The Recall-Precision Tradeoff and Where to Stop</h3>
<ul>
<li>Recall can trivially be pushed to <strong>1.0</strong> by flagging every single case as positive - every real positive is then "caught," but precision collapses because every real negative also gets falsely flagged. This makes recall alone, in isolation, gameable and therefore an incomplete metric.</li>
<li>Because of this, recall is almost never reported alone in production decisions - it's paired with precision (or summarized jointly via F1) and typically visualized across every threshold using a <strong>Precision-Recall curve</strong>, which shows exactly how much precision must be sacrificed to reach a given recall level.</li>
<li>The right stopping point on that curve is a business decision, not a purely statistical one: teams often pick the highest recall achievable while precision stays above some minimum operationally tolerable level (e.g. "catch as many real cancer cases as possible, as long as at least 50% of flagged cases turn out to be real").</li>
</ul>`,
            codeExamples: [
                `# Recall hits 1.0 trivially by flagging everything - showing why it must be paired with precision
import numpy as np
from sklearn.metrics import recall_score, precision_score

y_actual = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]

# a model that flags EVERYTHING as positive
y_flag_everything = [1] * 10

print(f"Recall:    {recall_score(y_actual, y_flag_everything):.2f}")
print(f"Precision: {precision_score(y_actual, y_flag_everything):.2f}")
# OUTPUT:
# Recall:    1.00   <- catches every real positive... trivially
# Precision: 0.30   <- but 7 of the 10 flagged cases are false alarms`
            ],
            codeExplanations: [
                `This deliberately constructs a "model" that flags every single input as positive, without doing any real classification work. recall_score() reports a perfect 1.00 because, by definition, every real positive case (all 3 of them) gets flagged - none are missed. But precision_score() reports only 0.30, revealing that 7 of the 10 total flags were false alarms on cases that were actually negative. This demonstrates concretely why recall can never be trusted as a standalone success metric - a model can reach perfect recall by doing nothing smarter than flagging everything, which is exactly why recall is always evaluated alongside precision (or their combined F1 score) rather than in isolation.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does recall measure, and what formula defines it?</td><td>Recall = TP / (TP+FN) - of all the cases that were actually positive, what fraction did the model correctly catch; it says nothing about how many false alarms (false positives) were also raised</td></tr>
<tr class='text-center'><td>When should you specifically optimize for recall rather than precision?</td><td>When a false negative (missing a real positive case) is far more costly than a false positive - e.g. cancer screening, where missing a real case can be life-threatening but an extra follow-up test is merely inconvenient</td></tr>
<tr class='text-center'><td>Why can't recall be trusted as a standalone metric, and how do you achieve a specific recall target responsibly?</td><td>Recall can be trivially pushed to 1.0 by flagging every input as positive, which destroys precision; it should always be reported alongside precision (or combined via F1), and the right operating point is chosen by moving the decision threshold along a precision-recall curve until an acceptable balance is reached</td></tr>
</table>`
        }
    ]
};
