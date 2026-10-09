import { Topic } from '../../coreJava';

export const dataImbalance: Topic = {
    id: 'ml-data-preprocessing-data-imbalance',
    name: 'Data Imbalance',
    beginner: [
        {
            content: `<h4>When One Class Vastly Outnumbers the Other</h4>
<ul>
<li><strong>Data Imbalance</strong> (or class imbalance) happens when one class in a classification problem has far more examples than another - e.g. a fraud dataset where <strong>99.8%</strong> of transactions are legitimate and only <strong>0.2%</strong> are fraud.</li>
<li>Imbalance breaks the usefulness of plain <code>accuracy</code> as a metric: a model that just predicts "not fraud" for EVERY transaction would score 99.8% accuracy while catching zero fraud - the metric looks great while the model is completely useless for its actual purpose.</li>
<li>Fixing imbalance means either changing the DATA (oversampling the minority class or undersampling the majority class) or changing how the MODEL is trained (class weighting), so the model is actually forced to pay attention to the rare class.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, recall_score

rng = np.random.default_rng(0)
n = 5000
# 99.8% legitimate, 0.2% fraud - a realistic imbalance ratio
y = np.zeros(n, dtype=int)
fraud_idx = rng.choice(n, size=int(n * 0.002), replace=False)
y[fraud_idx] = 1
X = rng.normal(0, 1, size=(n, 3))
X[fraud_idx] += rng.normal(0.3, 1, size=(len(fraud_idx), 3))  # fraud looks only slightly different

model = LogisticRegression().fit(X, y)
preds = model.predict(X)

print(f"Accuracy:            {accuracy_score(y, preds):.4f}")
print(f"Recall on fraud (1): {recall_score(y, preds):.4f}")
print(f"Fraud cases caught:  {preds[fraud_idx].sum()} out of {len(fraud_idx)}")
# OUTPUT (typical):
# Accuracy:            0.9980
# Recall on fraud (1): 0.0000
# Fraud cases caught:  0 out of 10`
            ],
            codeExplanations: [
                `The dataset is built with only 0.2% fraud cases (<code>y = 1</code>), matching a realistic fraud-detection imbalance ratio. Fitting a plain <code>LogisticRegression</code> and checking <code>accuracy_score</code> gives an impressive-looking <code>0.9980</code> - but <code>recall_score</code> for the fraud class comes out <code>0.0000</code>, and the final line confirms the model caught ZERO of the 10 actual fraud cases in the data it was trained on. This is the central danger of imbalance: accuracy alone completely hides that the model learned to just always predict the majority class, since doing so is nearly always "correct" by raw accuracy given how rare the minority class is.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>Accuracy becomes a meaningless (even misleading) metric under imbalance.</strong> As shown above, a model that ignores the minority class entirely can still score extremely high accuracy purely because the minority class is rare - this ties directly to why <code>Precision</code>, <code>Recall</code>, and the <code>Confusion Matrix</code> exist: they break performance down PER CLASS, revealing that "0.998 accuracy" actually means "catches 0% of fraud."</li>
<li><strong>Most learning algorithms implicitly optimize for overall accuracy</strong> (or an equivalent loss), so without any correction they naturally gravitate toward simply predicting the majority class more often, since doing so minimizes total errors on the training set even while being useless for the rare, business-critical class.</li>
<li><strong>The rare class is usually the one that matters most.</strong> In fraud detection, disease diagnosis, or defect detection, the minority class represents the exact outcome the model exists to catch - a model that "performs well" by accuracy while missing nearly all of it has, in a very real sense, failed at its actual job.</li>
</ul>
<h3>Real-World Example</h3>
A bank's fraud-detection system processes millions of transactions, with genuine fraud making up roughly <strong>0.2%</strong> of them. Early in development, a model trained naively on this raw imbalanced data reports 99.8% accuracy in a demo - which sounds excellent to a non-technical stakeholder - but a closer look at its confusion matrix reveals it flags almost no transactions as fraud at all; it learned that predicting "legitimate" for everything is the path of least resistance for minimizing total errors. The team only catches this by explicitly checking recall and precision on the fraud class, not by trusting the headline accuracy number - motivating both a better evaluation metric AND a rebalancing strategy before the model is considered usable.`,
            codeExamples: [
                `# Confusion matrix reveals what accuracy alone hides
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, classification_report

rng = np.random.default_rng(1)
n = 5000
y = np.zeros(n, dtype=int)
fraud_idx = rng.choice(n, size=int(n * 0.002), replace=False)
y[fraud_idx] = 1
X = rng.normal(0, 1, size=(n, 3))
X[fraud_idx] += rng.normal(0.3, 1, size=(len(fraud_idx), 3))

model = LogisticRegression().fit(X, y)
preds = model.predict(X)

tn, fp, fn, tp = confusion_matrix(y, preds).ravel()
print(f"True Negatives:  {tn}   False Positives: {fp}")
print(f"False Negatives: {fn}   True Positives:  {tp}")
print(classification_report(y, preds, target_names=["legit", "fraud"], zero_division=0))
# OUTPUT (typical):
# True Negatives:  4990   False Positives: 0
# False Negatives: 10     True Positives:  0
#               precision    recall  f1-score   support
#        legit       1.00      1.00      1.00      4990
#        fraud       0.00      0.00      0.00        10`
            ],
            codeExplanations: [
                `<code>confusion_matrix</code> breaks predictions down into the four possible outcomes rather than collapsing them into one accuracy number - here it shows <code>4990</code> true negatives (legit correctly identified) but <code>0</code> true positives and <code>10</code> false negatives, meaning EVERY SINGLE fraud case was missed. <code>classification_report</code> makes the same point per-class: the "legit" class shows perfect precision/recall (trivial, since it's 99.8% of the data), while the "fraud" class shows <code>0.00</code> across precision, recall, and f1-score - a stark contrast to the <code>0.998</code> overall accuracy from the previous example, demonstrating exactly why a confusion matrix and per-class metrics are the correct tools for evaluating an imbalanced classification problem, never accuracy alone.`
            ]
        },
        {
            content: `<h3>Three Strategies to Fix Imbalance</h3>
<ul>
<li><strong>Oversampling (e.g. SMOTE)</strong> - Synthetic Minority Over-sampling Technique creates NEW synthetic minority-class examples by interpolating between existing minority points and their nearest minority neighbors, rather than simply duplicating existing rows. This gives the model more minority-class signal to learn from without discarding any majority-class data.</li>
<li><strong>Undersampling</strong> - randomly removes majority-class rows until the two classes are more balanced. Simple and fast, but throws away real, potentially useful majority-class data - especially costly when the majority class already has limited variety or the dataset is small.</li>
<li><strong>Class weighting</strong> - keeps all the original data but tells the model's loss function to penalize mistakes on the minority class more heavily (e.g. <code>class_weight='balanced'</code> in scikit-learn), so the model is mathematically discouraged from ignoring the rare class, without altering the dataset itself.</li>
</ul>`,
            codeExamples: [
                `# Comparing a naive model, class-weighting, and SMOTE oversampling on the same imbalanced data
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score, precision_score
from imblearn.over_sampling import SMOTE

rng = np.random.default_rng(2)
n = 5000
y = np.zeros(n, dtype=int)
fraud_idx = rng.choice(n, size=int(n * 0.02), replace=False)   # 2% fraud, for SMOTE to have enough neighbors
y[fraud_idx] = 1
X = rng.normal(0, 1, size=(n, 3))
X[fraud_idx] += rng.normal(1.2, 1, size=(len(fraud_idx), 3))

# 1) naive
naive = LogisticRegression().fit(X, y)
p_naive = naive.predict(X)

# 2) class weighting
weighted = LogisticRegression(class_weight="balanced").fit(X, y)
p_weighted = weighted.predict(X)

# 3) SMOTE oversampling, then train normally
X_res, y_res = SMOTE(random_state=0).fit_resample(X, y)
smoted = LogisticRegression().fit(X_res, y_res)
p_smoted = smoted.predict(X)

for name, preds in [("Naive", p_naive), ("Class-weighted", p_weighted), ("SMOTE", p_smoted)]:
    print(f"{name:15s} recall={recall_score(y, preds):.3f}  precision={precision_score(y, preds, zero_division=0):.3f}")
# OUTPUT (typical):
# Naive           recall=0.020  precision=0.500
# Class-weighted  recall=0.870  precision=0.115
# SMOTE           recall=0.810  precision=0.142`
            ],
            codeExplanations: [
                `All three models see the SAME underlying imbalanced data, but are trained differently. The naive model, as before, catches almost none of the fraud (recall <code>0.020</code>). <code>class_weight="balanced"</code> automatically increases the penalty for misclassifying the minority class in the loss function, causing the model to catch far more fraud (recall <code>0.870</code>) at the cost of more false positives (lower precision) - a deliberate, tunable tradeoff. <code>SMOTE().fit_resample(X, y)</code> generates synthetic fraud examples by interpolating between real fraud points and their nearest minority neighbors, producing a balanced training set that a plain <code>LogisticRegression</code> is then trained on - achieving similarly strong recall (<code>0.810</code>) purely by rebalancing the DATA rather than the loss function. Both approaches dramatically outperform the naive model on the metric that actually matters (catching fraud), at the honest cost of more false alarms.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Class weighting requires no data modification</strong> - it's a simple parameter change (e.g. one line, <code>class_weight='balanced'</code>) that keeps the original dataset fully intact while still forcing the model to take the minority class seriously.</li>
<li><strong>SMOTE adds genuinely new signal</strong> - rather than just duplicating existing minority rows (which teaches a model nothing new), it interpolates between real minority points, giving the model additional plausible variety to learn decision boundaries from.</li>
<li><strong>Undersampling is simple and fast</strong> - reducing dataset size can also speed up training significantly, which matters when working with a very large majority class and limited compute.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>SMOTE can create unrealistic synthetic points</strong> - interpolating between minority-class points in feature space doesn't guarantee the synthetic point represents a realistic real-world case, especially in high-dimensional data or when minority examples are themselves noisy or come from distinct sub-clusters.</li>
<li><strong>Undersampling throws away real data</strong> - discarding majority-class rows means losing genuine information and variety that a model could otherwise have learned from, which is especially costly when the overall dataset is already small.</li>
<li><strong>All three strategies trade recall for precision</strong> - as seen above, boosting the model's ability to catch the minority class typically increases false positives; the "right" balance depends entirely on the real-world cost of a false positive versus a false negative (e.g. a missed fraud case vs. a legitimate transaction wrongly flagged).</li>
<li><strong>Rebalancing must happen ONLY on the training data</strong> - applying SMOTE or undersampling before a train/test split (rather than after, within the training fold only) leaks synthetic or resampled information into the evaluation set, producing misleadingly optimistic test metrics - test data should always reflect the TRUE original class distribution.</li>
</ul>`,
            codeExamples: [
                `# Correct workflow: split FIRST, then resample only the training data - test set stays untouched
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score
from imblearn.over_sampling import SMOTE

rng = np.random.default_rng(3)
n = 5000
y = np.zeros(n, dtype=int)
fraud_idx = rng.choice(n, size=int(n * 0.02), replace=False)
y[fraud_idx] = 1
X = rng.normal(0, 1, size=(n, 3))
X[fraud_idx] += rng.normal(1.2, 1, size=(len(fraud_idx), 3))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

# resample ONLY the training data - X_test/y_test keep the true, real-world 2% fraud rate
X_train_res, y_train_res = SMOTE(random_state=0).fit_resample(X_train, y_train)
model = LogisticRegression().fit(X_train_res, y_train_res)

print(f"Training fraud rate before SMOTE: {y_train.mean():.4f}")
print(f"Training fraud rate after SMOTE:  {y_train_res.mean():.4f}")
print(f"Test set fraud rate (untouched):  {y_test.mean():.4f}")
print(f"Recall on the REAL, untouched test set: {recall_score(y_test, model.predict(X_test)):.3f}")
# OUTPUT (typical):
# Training fraud rate before SMOTE: 0.0200
# Training fraud rate after SMOTE:  0.5000
# Test set fraud rate (untouched):  0.0200
# Recall on the REAL, untouched test set: 0.790`
            ],
            codeExplanations: [
                `The split happens BEFORE any resampling via <code>train_test_split(..., stratify=y)</code>, and <code>stratify=y</code> ensures both train and test sets keep the true 2% fraud proportion despite the split being random. <code>SMOTE().fit_resample</code> is then applied ONLY to <code>X_train</code>/<code>y_train</code>, boosting the training fraud rate to a balanced <code>0.50</code> - but <code>X_test</code>/<code>y_test</code> are never touched, so they still reflect the true 2% real-world fraud rate. Evaluating the model's recall on this untouched test set gives an honest estimate of how it will perform on genuinely new, naturally-imbalanced data - contrasting with the leakage risk of resampling before splitting, which would let synthetic points derived from what should be "unseen" test data influence training.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is accuracy a misleading metric on an imbalanced dataset like fraud detection with 0.2% fraud?</td><td>A model that always predicts the majority class ("not fraud") scores 99.8% accuracy while catching zero actual fraud cases - accuracy treats every correct prediction equally regardless of class, so it completely hides that the model provides zero value on the rare class that actually matters; per-class metrics like recall, precision, and the confusion matrix are needed to reveal this</td></tr>
<tr class='text-center'><td>What are the three main strategies for handling class imbalance, and how do they differ?</td><td>Oversampling (e.g. SMOTE) generates new synthetic minority-class examples by interpolating between real minority points; undersampling randomly removes majority-class rows to balance the classes; class weighting keeps all original data but penalizes the model's loss function more heavily for misclassifying the minority class - oversampling and class weighting preserve all majority data, while undersampling discards real information</td></tr>
<tr class='text-center'><td>Why must class rebalancing (SMOTE or undersampling) be applied only to the training set, never before the train/test split?</td><td>Resampling before splitting can let synthetic minority points (SMOTE) or the choice of which majority rows to keep (undersampling) influence what ends up in the test set, producing an artificially balanced test distribution that doesn't reflect the real-world class ratio - the test set must be split off first, using stratified sampling to preserve the true imbalance, so evaluation metrics honestly reflect production performance</td></tr>
</table>`
        }
    ]
};
