import { Topic } from '../../coreJava';

export const precision: Topic = {
    id: 'ml-model-evaluation-precision',
    name: 'Precision',
    beginner: [
        {
            content: `<h4>Two Questions, Two Different Metrics</h4>
<ul>
<li><strong>Precision</strong> answers: "Of everything the model flagged as positive, how much was ACTUALLY positive?" <code>Precision = TP / (TP + FP)</code>. High precision means few false alarms.</li>
<li><strong>Recall</strong> (also called <strong>Sensitivity</strong>) answers: "Of everything that was ACTUALLY positive, how much did the model catch?" <code>Recall = TP / (TP + FN)</code>. High recall means few real cases are missed.</li>
<li><strong>F1 Score</strong> combines both into a single number: <code>F1 = 2 &middot; (Precision &middot; Recall) / (Precision + Recall)</code> - the HARMONIC mean, which stays low unless BOTH precision and recall are reasonably high.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import precision_score, recall_score, f1_score

# 1 = spam, 0 = not spam
y_actual =    [1, 0, 1, 1, 0, 0, 1, 0, 0, 1]
y_predicted = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0]

print(f"Precision: {precision_score(y_actual, y_predicted):.2f}")
print(f"Recall:    {recall_score(y_actual, y_predicted):.2f}")
print(f"F1 Score:  {f1_score(y_actual, y_predicted):.2f}")
# OUTPUT:
# Precision: 0.75   <- of the 4 emails flagged as spam, 3 really were spam
# Recall:    0.60   <- of the 5 actual spam emails, only 3 were caught
# F1 Score:  0.67`
            ],
            codeExplanations: [
                `This scores a spam classifier's predictions against the true labels using scikit-learn's precision_score, recall_score, and f1_score. Precision looks only at the emails the model flagged as spam (4 of them) and asks how many really were spam (3) - giving 0.75. Recall looks only at the emails that were truly spam (5 of them) and asks how many the model actually caught (3) - giving 0.60. F1 Score folds both into one number using the harmonic mean, which is pulled down toward whichever of the two is lower, making it a stricter "balance" metric than a plain average would be.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Precision and recall exist because different mistakes cost different amounts, and a single "accuracy" number can't tell you which kind of mistake a model is prone to making.</li>
<li>Without separating them, a team can accidentally ship a model that is great on paper (high accuracy) but terrible at the thing that actually matters for their business - e.g. a fraud detector with 99% accuracy that still misses 80% of real fraud, because fraud is rare and accuracy is dominated by the easy "not fraud" cases.</li>
<li>Precision and recall are also in direct TENSION with each other - a model can trivially get 100% recall by flagging everything as positive (catches every real case, but precision collapses), or 100% precision by only flagging the single most obvious case (never wrong, but recall collapses). Neither extreme is useful, which is exactly why both need to be reported together.</li>
</ul>
<h3>Real-World Example</h3>
Contrast two classifiers with opposite priorities:
<ul>
<li>A <strong>spam filter</strong> cares more about <strong>Precision</strong> - a False Positive here means a real, important email (a job offer, a bank notice) gets buried in the spam folder and possibly never seen. Users tolerate the occasional spam email slipping through (a False Negative) far more than losing a real email, so spam filters are tuned to only flag when very confident.</li>
<li>A <strong>cancer-screening model</strong> cares more about <strong>Recall</strong> - a False Negative here means a real cancer case is told "you're healthy," which can be life-threatening if untreated. A False Positive just costs an extra follow-up test, so the model is deliberately tuned to catch nearly every real case even at the cost of more false alarms.</li>
<li>Both systems can be built from the exact same underlying model - the difference is where the <strong>decision threshold</strong> (the probability cutoff for calling something "positive") is set.</li>
</ul>`,
            codeExamples: [
                `# The precision-recall tradeoff: moving the decision threshold on the SAME model
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.metrics import precision_score, recall_score

X, y = make_classification(n_samples=1000, weights=[0.9, 0.1], random_state=0)
model = LogisticRegression().fit(X, y)
probabilities = model.predict_proba(X)[:, 1]   # predicted probability of the positive class

for threshold in [0.2, 0.5, 0.8]:
    y_pred = (probabilities >= threshold).astype(int)
    p = precision_score(y, y_pred, zero_division=0)
    r = recall_score(y, y_pred, zero_division=0)
    print(f"threshold={threshold}  precision={p:.2f}  recall={r:.2f}")
# OUTPUT (typical):
# threshold=0.2  precision=0.55  recall=0.91   <- low bar to flag positive: catches almost everything, more false alarms
# threshold=0.5  precision=0.78  recall=0.72   <- balanced default
# threshold=0.8  precision=0.93  recall=0.44   <- high bar: very confident when it flags, but misses many real cases`
            ],
            codeExplanations: [
                `This trains a single LogisticRegression model once on an imbalanced synthetic dataset, then reuses its predict_proba() output (the raw predicted probability of the positive class) at three different DECISION THRESHOLDS instead of retraining anything. At threshold=0.2 almost anything with even a moderate probability gets classified as positive, so recall is high (few real positives are missed) but precision suffers (more false alarms get let through). At threshold=0.8 only very confident predictions count as positive, so precision goes up but recall drops sharply because borderline real cases get classified as negative. This demonstrates that precision and recall are not independent properties of a model - they are two ends of a dial controlled by where the threshold is set on the exact same underlying probabilities, which is why the choice of threshold is itself a business decision (spam filter vs cancer screening), not just a modeling one.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Why F1 Uses the Harmonic Mean, Not the Average</h3>
<ul>
<li>A plain arithmetic average of precision and recall can be misleadingly high even when one of the two is terrible - e.g. precision=1.00 and recall=0.01 averages to 0.505, which looks mediocre-but-okay despite the model missing 99% of real positive cases.</li>
<li>The <strong>harmonic mean</strong> used by F1 punishes that kind of imbalance much more severely: the same precision=1.00, recall=0.01 example gives an F1 of about 0.02, correctly signaling the model is nearly useless.</li>
<li><strong>F-beta score</strong> generalizes F1 with a weighting parameter &beta;: <code>F&beta; = (1+&beta;&sup2;) &middot; (Precision &middot; Recall) / (&beta;&sup2; &middot; Precision + Recall)</code>. Setting &beta; &gt; 1 (e.g. F2) weights recall more heavily - useful for the cancer-screening case; &beta; &lt; 1 (e.g. F0.5) weights precision more heavily - useful for the spam-filter case.</li>
</ul>`,
            codeExamples: [
                `# Comparing arithmetic mean vs harmonic mean (F1) on a lopsided precision/recall pair
from sklearn.metrics import fbeta_score

precision, recall = 1.00, 0.01   # a model that is never wrong, but almost never fires

arithmetic_mean = (precision + recall) / 2
harmonic_mean_f1 = 2 * (precision * recall) / (precision + recall)

print(f"Arithmetic mean: {arithmetic_mean:.3f}")
print(f"Harmonic mean (F1): {harmonic_mean_f1:.3f}")

# F-beta: weighting recall more heavily (beta=2), useful for cancer screening
y_actual =    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
y_predicted = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
print(f"F2 score (recall-weighted): {fbeta_score(y_actual, y_predicted, beta=2, zero_division=0):.3f}")
# OUTPUT:
# Arithmetic mean: 0.505     <- looks okay, hides how bad recall is
# Harmonic mean (F1): 0.020   <- correctly reveals the model is nearly useless
# F2 score (recall-weighted): 0.208`
            ],
            codeExplanations: [
                `This first hand-computes an arithmetic mean and a harmonic mean (F1) for the same deliberately lopsided precision=1.00, recall=0.01 pair, to show numerically why F1 is preferred: the arithmetic mean of 0.505 hides how badly the model is doing on recall, while the harmonic mean of 0.020 is dragged down toward the smaller of the two values and correctly signals a nearly useless model. The second part uses scikit-learn's fbeta_score with beta=2 on a small example where the model catches only 1 of 5 real positives - the F2 score weights recall more heavily than precision, matching how a cancer-screening system would want its combined metric to behave, since missing real positive cases should be penalized harder than raising a few false alarms.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between precision and recall?</td><td>Precision = TP/(TP+FP) measures how trustworthy a positive prediction is (of everything flagged positive, how much really was); recall = TP/(TP+FN) measures how thorough the model is at finding real positives (of everything that really was positive, how much got caught)</td></tr>
<tr class='text-center'><td>Why is there a tradeoff between precision and recall, and how do you control it?</td><td>They are controlled by the same decision threshold on a model's predicted probability - lowering the threshold flags more things as positive, which raises recall (fewer misses) but lowers precision (more false alarms), and raising the threshold does the opposite; the right tradeoff point depends on which error type is more costly for the specific application</td></tr>
<tr class='text-center'><td>Why does F1 use the harmonic mean instead of the arithmetic mean of precision and recall?</td><td>The harmonic mean is pulled toward whichever of the two values is smaller, so it stays low unless BOTH precision and recall are reasonably high; an arithmetic mean can look deceptively decent even when one of the two metrics is near zero, which would hide a genuinely bad model</td></tr>
</table>`
        }
    ]
};
