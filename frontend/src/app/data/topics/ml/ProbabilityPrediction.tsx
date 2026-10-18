import { Topic } from '../../coreJava';

export const probabilityPrediction: Topic = {
    id: 'ml-classification-probability-prediction',
    name: 'Probability Prediction',
    beginner: [
        {
            content: `<h3>Beyond a Bare Yes/No</h3>
Many classifiers can output more than just a hard class label - they can output a <strong>probability</strong> for each class, via a method like <code>predict_proba()</code>.
<ul>
<li><code>model.predict()</code> returns a single class (e.g. "1" for disease-positive), throwing away all the nuance of how confident the model actually was.</li>
<li><code>model.predict_proba()</code> returns the underlying probabilities the prediction was based on (e.g. [0.27, 0.73] - 27% healthy, 73% disease), which carries far more information than the clipped final label.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
import numpy as np

X = np.array([[1], [2], [3], [4], [5], [6]])
y = np.array([0, 0, 0, 1, 1, 1])
model = LogisticRegression().fit(X, y)

print(model.predict([[3.4]]))         # hard label
print(model.predict_proba([[3.4]]))   # [prob class 0, prob class 1]
# OUTPUT: [0] / [[0.55 0.45]]`
            ],
            codeExplanations: [
                `For an input of 3.4, <code>predict()</code> collapses everything down to a single class (0), while <code>predict_proba()</code> reveals that the model actually thought it was close - 55% vs 45% - not a confident call at all. That nuance is completely invisible if only the hard label is used.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
A bare class label forces every downstream decision to accept the model's default 0.5 cutoff and gives up all sense of how confident the model was. A probability lets a human or a downstream system factor in context the model itself doesn't know about - the cost of being wrong in each direction, or how urgently to act.
<ul>
<li>Two predictions of "positive" can carry wildly different real risk - one at 51% and one at 99% - information that's identical after <code>.predict()</code> collapses both to the same "1" label.</li>
<li>Probabilities compose - they can be combined with other models' outputs, aggregated across a population, or fed into a cost-sensitive decision rule, none of which is possible once a value has been reduced to a hard label.</li>
</ul>
<h3>Real-World Example: A Medical Model That Reports a Percentage, Not a Verdict</h3>
A diagnostic model examining a patient's test results outputs "73% probability of disease" rather than a flat yes/no. This lets the treating doctor weigh that number against their own clinical judgment, the patient's other risk factors, and the very different costs of a false negative (missed disease) versus a false positive (unnecessary further testing) - a decision the model has no business making unilaterally by silently applying a 0.5 cutoff.`,
            codeExamples: [
                `# A diagnostic model reporting probabilities, left for a clinician to act on
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

X, y = make_classification(n_samples=500, n_features=6, weights=[0.7, 0.3], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]  # probability of disease

for p in sorted(probs)[-5:]:
    urgency = "URGENT - review immediately" if p > 0.85 else "Flag for review"
    print(f"disease probability={p:.2f}  ->  {urgency}")
# OUTPUT (typical):
# disease probability=0.79  ->  Flag for review
# disease probability=0.88  ->  URGENT - review immediately
# disease probability=0.91  ->  URGENT - review immediately
# disease probability=0.95  ->  URGENT - review immediately
# disease probability=0.97  ->  URGENT - review immediately`
            ],
            codeExplanations: [
                `Rather than calling <code>.predict()</code> and getting an undifferentiated list of "1"s, <code>.predict_proba()</code> is used to keep the raw probability for each patient. The five highest-risk test patients are then routed through a simple triage rule that treats a 79% probability differently from a 97% one - a distinction a hard-label classifier could never make, since both would have simply been reported as "positive."`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Preserves confidence information a hard label destroys</strong> - as in the medical example, a 51% and a 99% prediction are both "positive" as labels but call for very different responses; probabilities let that distinction survive.</li>
<li><strong>Enables threshold tuning after the fact</strong> - probabilities can be re-thresholded for different business needs (see the <code>Threshold</code> topic) without retraining the model, whereas a model that only outputs labels has already locked in one specific cutoff.</li>
<li><strong>Supports ranking and prioritization</strong> - sorting cases by probability (as in the triage example) lets limited human attention go to the highest-risk cases first, something a flat list of "positive"/"negative" labels cannot support.</li>
<li><strong>Composable with other systems</strong> - probabilities from multiple models can be averaged, combined with business rules, or fed into further statistical analysis; discrete labels cannot be combined this way.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Not every model produces a genuine probability</strong> - some classifiers (like a plain SVM) produce only a decision-boundary distance, and turning that into a "probability" via Platt scaling is an approximation, not a natively probabilistic output.</li>
<li><strong>A predicted probability may not be CALIBRATED</strong> - a model that says "70% chance" should actually be right about 70% of the time when this is checked across many such predictions; many models are miscalibrated (overconfident or underconfident) without this ever showing up in an accuracy metric.</li>
<li><strong>Calibration is often overlooked in favor of raw accuracy</strong> - a highly accurate model can still be badly miscalibrated (e.g. it always predicts either 0.99 or 0.01, rarely anything in between) which is invisible unless probabilities are specifically checked against outcomes, not just compared to the true label.</li>
<li><strong>Requires more careful downstream handling</strong> - a raw probability needs a decision rule applied on top of it (a threshold, a cost matrix), which is an extra design step that a simple hard-label model doesn't require of its consumers.</li>
</ul>`,
            codeExamples: [
                `# Checking calibration: does "70% probability" really mean right 70% of the time?
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.calibration import calibration_curve

X, y = make_classification(n_samples=2000, n_features=10, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]

fraction_of_positives, mean_predicted_value = calibration_curve(y_test, probs, n_bins=5)
for predicted, actual in zip(mean_predicted_value, fraction_of_positives):
    print(f"predicted ~{predicted:.2f}  ->  actually positive {actual:.2f} of the time")
# OUTPUT (typical):
# predicted ~0.08  ->  actually positive 0.06 of the time
# predicted ~0.28  ->  actually positive 0.31 of the time
# predicted ~0.51  ->  actually positive 0.49 of the time
# predicted ~0.72  ->  actually positive 0.75 of the time
# predicted ~0.91  ->  actually positive 0.89 of the time`
            ],
            codeExplanations: [
                `<code>calibration_curve</code> buckets test predictions by their predicted probability and checks, within each bucket, what fraction of those cases were actually the positive class. A well-calibrated model (like this Logistic Regression example) shows predicted and actual values tracking closely - "predicted ~0.72" really does turn out positive about 75% of the time - which is a check that plain accuracy alone would never reveal, since a model could achieve high accuracy while its stated probabilities are systematically over- or under-confident.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between <code>predict()</code> and <code>predict_proba()</code>?</td><td><code>predict()</code> returns a single hard class label produced by applying the default threshold, while <code>predict_proba()</code> returns the underlying probability for each class - preserving confidence information (e.g. distinguishing a 51% call from a 99% call) that the hard label discards</td></tr>
<tr class='text-center'><td>Why might a medical model report a probability instead of a yes/no diagnosis?</td><td>Reporting a probability (e.g. "73% chance of disease") lets a clinician weigh the model's output against their own judgment, other risk factors, and the very different real-world costs of a false negative versus a false positive, rather than having the model silently make that tradeoff by applying a fixed threshold</td></tr>
<tr class='text-center'><td>What does it mean for a model's probabilities to be "calibrated," and why does accuracy alone not check for this?</td><td>Calibration means that among all cases where the model predicted, say, 70% probability, roughly 70% actually turn out positive; a model can be highly accurate at the label level while still being badly miscalibrated (systematically over- or under-confident), since accuracy only checks whether the final thresholded label was correct, not whether the underlying probability was honest</td></tr>
</table>`
        }
    ]
};
