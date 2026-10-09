import { Topic } from '../../coreJava';

export const threshold: Topic = {
    id: 'ml-classification-threshold',
    name: 'Threshold',
    beginner: [
        {
            content: `<h3>Turning a Probability Into a Decision</h3>
A <strong>threshold</strong> is the cutoff value used to convert a predicted probability into a hard class label. By default, most libraries use 0.5: probability &ge; 0.5 becomes the positive class, below 0.5 becomes the negative class.
<ul>
<li>The 0.5 default isn't a law of nature - it's just a convenient starting assumption that treats a false positive and a false negative as equally costly.</li>
<li>Moving the threshold up or down changes which predictions get labeled positive, without retraining the model at all.</li>
</ul>`,
            codeExamples: [
                `import numpy as np

probabilities = np.array([0.12, 0.38, 0.49, 0.51, 0.6, 0.83])

for cutoff in [0.5, 0.3]:
    labels = (probabilities >= cutoff).astype(int)
    print(f"threshold={cutoff}  labels={labels}")
# OUTPUT:
# threshold=0.5  labels=[0 0 0 1 1 1]
# threshold=0.3  labels=[0 1 1 1 1 1]`
            ],
            codeExplanations: [
                `The exact same six probability scores are converted into class labels twice, using two different cutoffs. Lowering the threshold from 0.5 to 0.3 flips two borderline scores (0.38 and 0.49) from "negative" to "positive" - nothing about the model or the underlying probabilities changed, only where the decision line was drawn.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
The threshold is where a purely statistical probability estimate turns into a real-world action, and that conversion is a business decision, not a modeling detail.
<ul>
<li>Moving the threshold trades <strong>precision</strong> against <strong>recall</strong> directly: lowering it labels more cases positive, catching more true positives (higher recall) but also more false alarms (lower precision); raising it does the reverse. This is the same tradeoff visualized by an <strong>ROC Curve</strong> or a precision-recall curve as the threshold sweeps from 0 to 1.</li>
<li>There is no universally "correct" threshold - the right choice depends entirely on the relative cost of a false positive versus a false negative in the specific application, which the model itself has no way of knowing.</li>
</ul>
<h3>Real-World Example: A Bank Deliberately Lowering Its Fraud Threshold</h3>
A fraud-detection model defaults to the standard 0.5 cutoff, but the bank deliberately lowers it to 0.2. This means many more transactions get flagged as suspicious, including a lot of legitimate ones (more false alarms) - but the bank accepts that cost because missing a single real fraud case (a false negative) is far more expensive than the customer service overhead of investigating a false alarm.`,
            codeExamples: [
                `# Fraud detection: sweeping the threshold to show the precision/recall tradeoff
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score

X, y = make_classification(n_samples=2000, n_features=10, weights=[0.95, 0.05], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

model = LogisticRegression().fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]

for cutoff in [0.5, 0.2]:
    preds = (probs >= cutoff).astype(int)
    print(f"threshold={cutoff}  precision={precision_score(y_test, preds):.2f}  recall={recall_score(y_test, preds):.2f}")
# OUTPUT (typical):
# threshold=0.5  precision=0.86  recall=0.58   <- misses many real fraud cases
# threshold=0.2  precision=0.47  recall=0.87   <- catches far more fraud, more false alarms`
            ],
            codeExplanations: [
                `A heavily imbalanced dataset (5% positive class, standing in for rare fraud cases) is used to fit a Logistic Regression model. Sweeping the decision threshold from the default 0.5 down to 0.2 shows the tradeoff numerically: recall jumps from 0.58 to 0.87 (catching far more real fraud) while precision drops from 0.86 to 0.47 (more of the flagged transactions turn out to be legitimate) - exactly the deliberate tradeoff a bank would accept when missing real fraud is judged far costlier than investigating false alarms.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Lets one trained model serve many different business needs</strong> - the fraud model above didn't need retraining to become more aggressive; only its threshold changed, which is far cheaper than building a separate model per use case.</li>
<li><strong>Directly encodes the real cost asymmetry of a problem</strong> - in fraud, medicine, and safety-critical systems, false negatives and false positives are rarely equally costly, and threshold tuning is the simplest lever to reflect that asymmetry.</li>
<li><strong>Easy and fast to adjust in production</strong> - changing a threshold is a config value, not a retraining pipeline, so it can be tuned quickly in response to changing conditions (e.g. a fraud wave).</li>
<li><strong>Makes the precision/recall tradeoff explicit and tunable</strong> - rather than accepting whatever balance a default cutoff happens to produce, the threshold gives a direct dial for choosing a specific point on that tradeoff curve.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Choosing the "right" threshold is not automatic</strong> - it requires knowing (or estimating) the actual real-world cost of false positives versus false negatives, which is a business/domain judgment call, not something the model can determine on its own.</li>
<li><strong>A single global threshold can be too blunt</strong> - in some applications the ideal cutoff varies by subgroup or context (e.g. transaction size, patient age), and a single fixed threshold ignores that nuance unless explicitly modeled.</li>
<li><strong>Threshold tuning only works well if probabilities are meaningful in the first place</strong> - if a model's probability outputs are poorly calibrated, moving the threshold changes the precision/recall balance in ways that don't map cleanly to real-world confidence levels.</li>
<li><strong>Over-optimizing the threshold on a single validation set risks overfitting the cutoff itself</strong> - just like a model's parameters, a threshold picked to maximize one metric on one dataset may not generalize to production data with a different class balance.</li>
</ul>`,
            codeExamples: [
                `# Finding a threshold that maximizes a business-weighted score rather than accuracy
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

X, y = make_classification(n_samples=2000, n_features=10, weights=[0.95, 0.05], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

model = LogisticRegression().fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]

# Assume missing real fraud (FN) costs 10x more than a false alarm (FP)
best_cutoff, best_cost = None, float("inf")
for cutoff in np.arange(0.05, 0.95, 0.05):
    preds = (probs >= cutoff).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
    cost = fp * 1 + fn * 10
    if cost < best_cost:
        best_cost, best_cutoff = cost, cutoff

print(f"Business-optimal threshold: {best_cutoff:.2f}  (total weighted cost={best_cost})")
# OUTPUT (typical):
# Business-optimal threshold: 0.20  (total weighted cost=94)`
            ],
            codeExplanations: [
                `Rather than picking a threshold that maximizes accuracy or even balances precision/recall evenly, this sweeps a range of cutoffs and scores each one using an explicit cost function where a missed fraud case (false negative) is weighted 10x more heavily than a false alarm (false positive) - reflecting the bank's actual stated cost asymmetry. The threshold that minimizes this weighted cost turns out to be low (around 0.20), which is a data-driven way to arrive at exactly the deliberately-lowered cutoff described in the real-world example, rather than picking it by intuition alone.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a decision threshold, and what is its default value?</td><td>The cutoff value used to convert a model's predicted probability into a hard class label - a probability at or above the threshold is labeled positive, below it negative; most libraries default to 0.5, which implicitly treats false positives and false negatives as equally costly</td></tr>
<tr class='text-center'><td>How does lowering a classification threshold affect precision and recall?</td><td>Lowering the threshold labels more cases as positive, which typically increases recall (catching more true positives) but decreases precision (more false positives get labeled positive too) - it is a direct tradeoff, not a free improvement</td></tr>
<tr class='text-center'><td>Why might a fraud-detection system use a threshold below 0.5?</td><td>Because the real-world cost of missing actual fraud (a false negative) is judged far higher than the cost of a false alarm (a false positive) - a lower threshold catches more real fraud at the price of more transactions being unnecessarily flagged, which the business accepts given that cost asymmetry</td></tr>
</table>`
        }
    ]
};
