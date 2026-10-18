import { Topic } from '../../coreJava';

export const confusionMatrix: Topic = {
    id: 'ml-model-evaluation-confusion-matrix',
    name: 'Confusion Matrix',
    beginner: [
        {
            content: `<h4>A Table That Shows Exactly What a Classifier Got Right and Wrong</h4>
<ul>
<li>A <strong>Confusion Matrix</strong> is a grid comparing a classifier's PREDICTED labels against the ACTUAL labels, broken into four buckets for a binary problem: <strong>True Positive (TP)</strong>, <strong>True Negative (TN)</strong>, <strong>False Positive (FP)</strong>, and <strong>False Negative (FN)</strong>.</li>
<li><strong>True Positive</strong> - model predicted positive, and it really was positive (e.g. flagged a fraudulent transaction that really was fraud).</li>
<li><strong>False Positive</strong> - model predicted positive, but it was actually negative (a "false alarm", also called a <strong>Type I error</strong>).</li>
<li><strong>False Negative</strong> - model predicted negative, but it was actually positive (a "miss", also called a <strong>Type II error</strong>) - often the most dangerous cell in medical or safety contexts.</li>
<li><strong>True Negative</strong> - model predicted negative, and it really was negative.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import numpy as np

# 1 = has disease, 0 = healthy
y_actual =    np.array([1, 0, 1, 1, 0, 0, 1, 0, 0, 1])
y_predicted = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])

cm = confusion_matrix(y_actual, y_predicted)
print("Confusion Matrix:")
print(cm)
tn, fp, fn, tp = cm.ravel()
print(f"TP={tp}  TN={tn}  FP={fp}  FN={fn}")
# OUTPUT:
# Confusion Matrix:
# [[4 1]
#  [2 3]]
# TP=3  TN=4  FP=1  FN=2`
            ],
            codeExplanations: [
                `This compares 10 actual labels (1 = has disease, 0 = healthy) against 10 predicted labels using scikit-learn's confusion_matrix(). By convention, scikit-learn's confusion_matrix() rows are the actual class and columns are the predicted class, ordered [negative, positive], so the matrix is [[TN, FP], [FN, TP]]. Calling cm.ravel() flattens that 2x2 grid into the four individual counts in that order: tn, fp, fn, tp. Here there are 3 true positives (correctly caught disease cases), 4 true negatives (correctly cleared healthy patients), 1 false positive (a healthy patient incorrectly flagged), and 2 false negatives (2 actual disease cases the model MISSED) - exactly the breakdown every other classification metric is built from.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>A single "accuracy" number hides WHICH KIND of mistake a model is making, and in most real applications the two kinds of mistakes (false positives vs false negatives) have very different costs. A confusion matrix is the only view that shows both at once.</li>
<li>Without it, two models with identical accuracy can behave completely differently in production - one might miss almost every positive case while the other over-flags everything, and accuracy alone can't tell them apart.</li>
<li>On imbalanced datasets, accuracy actively lies. If only 1% of a population is actually positive, a model that predicts "negative" for every single input scores <strong>99% accuracy</strong> while catching zero real positives - the confusion matrix immediately exposes this because its TP and FN columns would show all real positives landing in the FN bucket.</li>
</ul>
<h3>Real-World Example</h3>
A hospital deploys a machine learning model to screen mammogram images for signs of breast cancer, flagging patients for follow-up biopsy.
<ul>
<li>A <strong>False Negative</strong> here means an actual cancer case is told "you're healthy" - a missed diagnosis that could delay treatment until the cancer has progressed, potentially costing a life.</li>
<li>A <strong>False Positive</strong> means a healthy patient is sent for an unnecessary (but not life-threatening) follow-up biopsy - costly and stressful, but recoverable.</li>
<li>Because the cost of these two errors is wildly asymmetric, the hospital doesn't just look at overall accuracy - it studies the confusion matrix directly and deliberately tunes the model's decision threshold to shrink FN even if that means accepting more FP, since missing a real cancer case is far worse than an extra biopsy.</li>
</ul>`,
            codeExamples: [
                `# Why "accuracy" is dangerous on imbalanced medical screening data
import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score

rng = np.random.default_rng(0)
n = 1000
# only 1% of patients actually have cancer - a realistic screening imbalance
y_actual = (rng.uniform(0, 1, n) < 0.01).astype(int)

# a lazy "always predict healthy" model
y_lazy_predicted = np.zeros(n, dtype=int)

print(f"Lazy model accuracy: {accuracy_score(y_actual, y_lazy_predicted):.3f}")
cm = confusion_matrix(y_actual, y_lazy_predicted)
tn, fp, fn, tp = cm.ravel()
print(f"TP={tp}  TN={tn}  FP={fp}  FN={fn}")
# OUTPUT:
# Lazy model accuracy: 0.990
# TP=0  TN=990  FP=0  FN=10   <- every real cancer case was missed, yet accuracy looks great`
            ],
            codeExplanations: [
                `This simulates a realistic cancer-screening imbalance where only 1% of 1000 simulated patients actually have cancer. A deliberately "lazy" model is defined that predicts 0 (healthy) for every single patient, never doing any real work. accuracy_score() reports a seemingly excellent 99% accuracy - because 990 out of 1000 patients genuinely are healthy, and the model gets all of those right by doing nothing. But the confusion matrix tells the real story: TP=0 and FN=10 means every single actual cancer case was completely missed. This is exactly why accuracy alone is a dangerous metric on imbalanced data, and why practitioners look at the confusion matrix (and metrics derived from it, like recall) instead.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Deriving Every Other Metric, and Multi-Class Matrices</h3>
<ul>
<li>Virtually every classification metric is just a different combination of the four confusion matrix cells: <code>Accuracy = (TP+TN) / (TP+TN+FP+FN)</code>, <code>Precision = TP / (TP+FP)</code>, <code>Recall = TP / (TP+FN)</code>, and <code>F1 = 2 &middot; (Precision &middot; Recall) / (Precision + Recall)</code>.</li>
<li>For a problem with more than two classes (e.g. classifying handwritten digits 0-9), the confusion matrix expands to an <strong>N x N grid</strong> where row <em>i</em>, column <em>j</em> counts how many actual-class-<em>i</em> samples were predicted as class <em>j</em>. The diagonal holds correct predictions; every off-diagonal cell is a specific kind of mistake (e.g. how often a "4" gets predicted as a "9").</li>
<li>A well-trained model produces a matrix that is strongly diagonal (most mass on the diagonal); a systematically confused model shows a bright off-diagonal cell revealing exactly which two classes it can't tell apart.</li>
</ul>`,
            codeExamples: [
                `# A multi-class confusion matrix on handwritten digits, to see exactly which digits get confused
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = LogisticRegression(max_iter=2000)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

cm = confusion_matrix(y_test, y_pred)
print(cm)

# find the single biggest off-diagonal confusion (most common mistake)
cm_off_diag = cm.copy()
np.fill_diagonal(cm_off_diag, 0)
i, j = np.unravel_index(cm_off_diag.argmax(), cm_off_diag.shape)
print(f"Most common mistake: actual {i} predicted as {j}, {cm_off_diag[i, j]} times")
# OUTPUT (typical):
# [[53  0  0 ...]
#  [ 0 49  0 ...]
#  ...]
# Most common mistake: actual 8 predicted as 1, 3 times`
            ],
            codeExplanations: [
                `This trains a LogisticRegression classifier on the classic 10-class handwritten-digits dataset (digits 0 through 9), then builds the full 10x10 confusion matrix with confusion_matrix(y_test, y_pred). Each row corresponds to an actual digit and each column to a predicted digit, so the value at row 8, column 1 counts how many actual "8"s got predicted as "1". The code then zeroes out the diagonal (the correct predictions) and finds the single largest remaining value with argmax - this pinpoints the model's most common SPECIFIC confusion, e.g. mistaking handwritten 8s for 1s, which is exactly the kind of insight a single accuracy number could never reveal.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can a model with 99% accuracy still be useless in practice?</td><td>On imbalanced data (e.g. 1% positive class), a model that always predicts the majority class scores 99% accuracy while catching zero real positive cases - the confusion matrix exposes this by showing TP=0, whereas accuracy alone hides it entirely</td></tr>
<tr class='text-center'><td>What is the difference between a False Positive and a False Negative, and why does it matter which one a model makes more of?</td><td>A False Positive predicts positive when the truth is negative (a false alarm); a False Negative predicts negative when the truth is positive (a miss); the real-world cost of each is often asymmetric - e.g. in cancer screening a False Negative (missed cancer) is far more dangerous than a False Positive (an unnecessary follow-up test), so teams tune the model specifically around which error type is more expensive</td></tr>
<tr class='text-center'><td>How does a confusion matrix generalize to a multi-class problem?</td><td>It becomes an N x N grid where entry (i, j) counts actual-class-i samples predicted as class j; the diagonal holds correct predictions and any bright off-diagonal cell reveals a specific pair of classes the model systematically confuses, which a single multi-class accuracy score cannot show</td></tr>
</table>`
        }
    ]
};
