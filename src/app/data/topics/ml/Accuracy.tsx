import { Topic } from '../../coreJava';

export const accuracy: Topic = {
    id: 'ml-model-evaluation-accuracy',
    name: 'Accuracy',
    beginner: [
        {
            content: `<h4>The Simplest Way to Score a Classifier</h4>
<ul>
<li><strong>Accuracy</strong> answers the most basic question you can ask a classifier: "Out of every prediction it made, how many were correct?" <code>Accuracy = (TP + TN) / (TP + TN + FP + FN)</code>.</li>
<li>It treats a correctly caught positive (TP) and a correctly caught negative (TN) as equally good, and a missed positive (FN) and a false alarm (FP) as equally bad.</li>
<li>Because it's a single, intuitive percentage, accuracy is the first metric almost everyone reaches for - and it works well when the classes are roughly balanced and every mistake costs about the same.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import accuracy_score

# 1 = spam, 0 = not spam
y_actual =    [1, 0, 1, 1, 0, 0, 1, 0, 0, 1]
y_predicted = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0]

print(f"Accuracy: {accuracy_score(y_actual, y_predicted):.2f}")
# OUTPUT:
# Accuracy: 0.60   <- 6 of the 10 predictions matched the actual label`
            ],
            codeExplanations: [
                `This compares 10 actual spam labels against 10 predicted labels using scikit-learn's accuracy_score(). It simply counts how many of the 10 predictions exactly match the actual label (6 of them do, regardless of whether the match was a TP or a TN) and divides by the total number of predictions, giving 0.60. Notice accuracy doesn't distinguish WHICH kind of mistake was made - a missed spam email (false negative) counts exactly the same as a good email wrongly flagged as spam (false positive), which is fine here but becomes a serious blind spot once the classes stop being balanced.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Accuracy's biggest strength - treating every correct prediction the same - is also its biggest weakness. It has no concept of which class is rare or which error type is expensive, so it silently assumes both classes matter equally and both types of mistakes cost the same.</li>
<li>The moment those assumptions break (as they do in almost every fraud, disease, or anomaly-detection problem), accuracy stops measuring what actually matters and starts measuring how well a model can exploit the majority class.</li>
<li>This is why accuracy is almost always reported ALONGSIDE a confusion matrix and metrics like precision/recall, rather than alone - a high accuracy number in isolation tells you nothing about whether the model does the one thing you actually built it for.</li>
</ul>
<h3>Real-World Example</h3>
A bank builds a fraud-detection model over a dataset where only 0.2% of transactions are actually fraudulent.
<ul>
<li>A model that predicts <strong>"not fraud" for literally every transaction</strong> - doing zero real work - would score <strong>99.8% accuracy</strong>, because 99.8% of transactions genuinely are legitimate.</li>
<li>Yet that model catches <strong>zero</strong> actual fraud cases. Every single fraudulent transaction becomes a false negative, and the bank loses money on every one of them while a dashboard proudly reports "99.8% accurate."</li>
<li>This is the classic accuracy trap on imbalanced data: the metric looks almost perfect while the model is completely useless at the one job it exists to do, which is exactly why fraud teams look at recall and precision (and the confusion matrix behind them) instead of leading with accuracy.</li>
</ul>`,
            codeExamples: [
                `# The accuracy trap: a do-nothing model on imbalanced fraud data
import numpy as np
from sklearn.metrics import accuracy_score, recall_score, confusion_matrix

rng = np.random.default_rng(0)
n = 5000
# only 0.2% of transactions are actually fraudulent
y_actual = (rng.uniform(0, 1, n) < 0.002).astype(int)

# a lazy "always predict legitimate" model
y_lazy_predicted = np.zeros(n, dtype=int)

print(f"Accuracy: {accuracy_score(y_actual, y_lazy_predicted):.4f}")
print(f"Recall:   {recall_score(y_actual, y_lazy_predicted, zero_division=0):.4f}")
tn, fp, fn, tp = confusion_matrix(y_actual, y_lazy_predicted).ravel()
print(f"TP={tp}  FN={fn}")
# OUTPUT (typical):
# Accuracy: 0.9980   <- looks nearly perfect
# Recall:   0.0000   <- catches literally zero fraud cases
# TP=0  FN=10`
            ],
            codeExplanations: [
                `This simulates 5000 transactions where only 0.2% are fraudulent, then defines a deliberately lazy model that predicts "not fraud" (0) for every single transaction without looking at any features. accuracy_score() reports a seemingly excellent 99.80% - because the model correctly labels the overwhelming majority of genuinely legitimate transactions and accuracy counts that as a win. But recall_score() reports exactly 0.0000, and the confusion matrix shows TP=0, FN=10: every real fraud case in the data was missed. This gap between a near-perfect accuracy score and a completely useless recall score is the textbook illustration of why accuracy alone is dangerous on imbalanced data.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - When Accuracy IS the Right Metric, and Balanced Accuracy</h3>
<ul>
<li>Accuracy is a perfectly reasonable primary metric when two conditions both hold: the classes are roughly <strong>balanced</strong> (similar numbers of positives and negatives), and the two error types (FP and FN) have <strong>similar real-world costs</strong>. A handwriting digit classifier over roughly equal counts of each digit is a good example - misclassifying a "3" as an "8" isn't inherently worse than the reverse.</li>
<li>When classes are imbalanced but you still want an accuracy-style single number, <strong>Balanced Accuracy</strong> - the average of recall computed separately per class - corrects for the skew by weighting each class equally regardless of how many examples it has.</li>
<li>As a rule of thumb: check the class distribution and the relative cost of FP vs FN before trusting accuracy as your headline metric; if either is skewed, reach for precision, recall, F1, or balanced accuracy instead.</li>
</ul>`,
            codeExamples: [
                `# Comparing plain accuracy vs balanced accuracy on the same imbalanced predictions
from sklearn.metrics import accuracy_score, balanced_accuracy_score

# 1 = fraud (rare), 0 = legitimate (common)
y_actual =    [0]*97 + [1]*3
y_predicted = [0]*97 + [0, 0, 1]   # model catches only 1 of 3 fraud cases

print(f"Plain accuracy:    {accuracy_score(y_actual, y_predicted):.3f}")
print(f"Balanced accuracy: {balanced_accuracy_score(y_actual, y_predicted):.3f}")
# OUTPUT:
# Plain accuracy:    0.980   <- dominated by the 97 easy legitimate cases
# Balanced accuracy: 0.667   <- exposes that only 1 of 3 fraud cases was caught`
            ],
            codeExplanations: [
                `This builds 100 predictions where 97 are legitimate (correctly predicted every time) and only 3 are actual fraud, of which the model catches just 1. accuracy_score() reports 0.980 because it's dominated by the huge, easy-to-get-right legitimate class. balanced_accuracy_score() instead computes recall for each class separately (100% on the legitimate class, 33% on the fraud class) and averages those two numbers, giving 0.667 - a far more honest reflection of the fact that the model only caught 1 of 3 real fraud cases. This shows exactly how "balanced accuracy" fixes plain accuracy's blind spot without abandoning the intuitive idea of "percent correct."`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does accuracy measure, and what formula defines it?</td><td>Accuracy = (TP+TN) / (TP+TN+FP+FN) - the fraction of all predictions (positive and negative) that matched the actual label; it treats every correct prediction and every mistake as equally significant</td></tr>
<tr class='text-center'><td>Why can a model with 99.8% accuracy still be completely useless?</td><td>On severely imbalanced data, a model that always predicts the majority class scores accuracy equal to that class's share of the data while catching zero minority-class (often the actually important) cases - e.g. 99.8% accuracy on a fraud dataset while missing every real fraud case, because accuracy has no concept of which class matters more</td></tr>
<tr class='text-center'><td>When is accuracy actually the right metric to use, and what can you use if classes are imbalanced but you still want a single "percent correct"-style number?</td><td>Accuracy is appropriate when classes are roughly balanced AND false positives/false negatives cost about the same; if classes are imbalanced but a single summary number is still wanted, Balanced Accuracy (the average of per-class recall) corrects for the skew by weighting each class equally</td></tr>
</table>`
        }
    ]
};
