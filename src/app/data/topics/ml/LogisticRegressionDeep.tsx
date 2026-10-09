import { Topic } from '../../coreJava';

export const logisticRegression: Topic = {
    id: 'ml-classification-logistic-regression',
    name: 'Logistic Regression',
    beginner: [
        {
            content: `<h3>Classification</h3>
Classification predicts a discrete label. A commonly-used baseline algorithm is <strong>Logistic Regression</strong> (despite the name, it's a classification algorithm) - it outputs a probability between 0 and 1 which is thresholded into a class.
<ul>
<li>Example: predicting pass/fail from hours studied. Unlike Linear Regression, the output isn't allowed to be any number (a "probability" of 1.4 makes no sense) - it must be squeezed into the [0, 1] range.</li>
<li>By default, a probability &ge; 0.5 is classified as the positive class (e.g. "pass"), and below 0.5 as the negative class (e.g. "fail") - but that 0.5 cutoff is itself a choice, not a law of nature (see the decision-threshold discussion below).</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
import numpy as np

# Feature: hours studied, Label: 1 = passed, 0 = failed
X = np.array([[1], [2], [3], [4], [5], [6]])
y = np.array([0, 0, 0, 1, 1, 1])

model = LogisticRegression()
model.fit(X, y)

print(model.predict([[3.5]]))         # predicted class
print(model.predict_proba([[3.5]]))   # [prob of 0, prob of 1]
# OUTPUT: [0 or 1 depending on the decision boundary] / [[p0, p1]]`
            ],
            codeExplanations: [
                `Six students' (hours studied, pass/fail) outcomes are used to fit a LogisticRegression model. Unlike Linear Regression's <code>.predict()</code>, which would return an arbitrary number, this model's <code>.predict_proba()</code> returns a genuine probability pair that sums to 1 (probability of failing, probability of passing) for 3.5 hours studied - a value between the training examples' known outcomes. <code>.predict()</code> simply applies the default 0.5 threshold to that probability to output a single 0/1 class label.`
            ]
        },
        {
            content: `<h3>Why It's Called "Regression" Despite Being a Classifier</h3>
This confuses almost everyone the first time they see it, but the name is actually precise once you look at what the model computes internally, not just its final output.
<ul>
<li>Logistic Regression does NOT directly predict the class. Internally, it fits a genuine LINEAR REGRESSION on the <strong>log-odds</strong> (also called the "logit") of the positive class: <code>log(p / (1-p)) = w&#8321;x&#8321; + w&#8322;x&#8322; + ... + b</code>. That right-hand side is exactly the same linear combination of features and weights used in ordinary Linear Regression.</li>
<li>The <strong>sigmoid function</strong>, <code>&sigma;(z) = 1 / (1 + e&#8315;&#8320;)</code>, is then applied to convert that unbounded linear output (log-odds, which can be any real number) into a probability squeezed between 0 and 1. The sigmoid is an S-shaped curve: very negative inputs map close to 0, very positive inputs map close to 1, and 0 maps to exactly 0.5.</li>
<li>Only AFTER this sigmoid step is a threshold (commonly 0.5) applied to turn the probability into a discrete class label. So "Logistic Regression" is really: a linear regression on log-odds, squashed through sigmoid, thresholded into a class - the "regression" is genuinely happening, it's just regressing a continuous quantity (log-odds/probability) that then gets converted into a classification decision as a final step.</li>
</ul>`,
            codeExamples: [
                `# Unpacking Logistic Regression step by step: linear combination -> sigmoid -> threshold
import numpy as np
from sklearn.linear_model import LogisticRegression

X = np.array([[1], [2], [3], [4], [5], [6]])
y = np.array([0, 0, 0, 1, 1, 1])
model = LogisticRegression().fit(X, y)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for hours in [1, 3.5, 6]:
    log_odds = model.coef_[0][0] * hours + model.intercept_[0]   # the "linear regression" part
    probability = sigmoid(log_odds)                               # squash into [0, 1]
    predicted_class = int(probability >= 0.5)                     # threshold into a class
    print(f"hours={hours}  log-odds={log_odds:.2f}  probability={probability:.3f}  class={predicted_class}")
# OUTPUT (typical):
# hours=1.0  log-odds=-4.20  probability=0.015  class=0
# hours=3.5  log-odds=0.05   probability=0.512  class=1
# hours=6.0  log-odds=4.30   probability=0.987  class=1`
            ],
            codeExplanations: [
                `This manually reproduces exactly what <code>LogisticRegression.predict()</code> does internally, in three explicit steps. First, <code>model.coef_</code> and <code>model.intercept_</code> (the same kind of learned weight and bias a plain Linear Regression would have) are combined linearly with the input to produce a log-odds value that can be any real number (as seen ranging from -4.20 to +4.30). Second, the <code>sigmoid</code> function squashes that unbounded log-odds value into a genuine [0, 1] probability. Third, a simple 0.5 threshold turns that probability into the final 0/1 class prediction - confirming that "regression" refers to the first step (fitting a linear function of the log-odds), while "classification" only happens at the very last step.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Understanding logistic regression as "regression on log-odds + sigmoid + threshold" (rather than as an unexplained black box that happens to output 0/1) is what lets you use it correctly in practice:
<ul>
<li>Because the RAW output is a calibrated probability, not just a label, logistic regression naturally supports risk-based decisions ("flag this transaction for review if fraud probability &gt; 15%") in a way that a model which only outputs hard class labels cannot.</li>
<li>Because the log-odds are a LINEAR function of the inputs, each coefficient has a direct, interpretable meaning in odds terms: increasing a feature by one unit multiplies the ODDS of the positive class by <code>e</code> raised to that feature's coefficient - a property regulators and analysts rely on for explainable risk models.</li>
</ul>
<h3>Real-World Example: Credit Approval with a Decision-Threshold Tradeoff</h3>
A bank's credit-approval model outputs a probability that an applicant will default, and management must decide WHERE to set the approval/decline cutoff - not just accept the default 0.5. Lowering the threshold (declining more people, even those with a moderate risk score) reduces bad loans (false approvals) but also turns away more genuinely good applicants (increases false declines, losing legitimate business); raising the threshold does the reverse. This is not a modeling problem, it's a BUSINESS decision made using the model's probability output, and it's a direct, practical consequence of logistic regression being fundamentally a probability estimator with a separately-chosen decision threshold, not an inherently binary classifier.`,
            codeExamples: [
                `# Credit approval: sweeping the decision threshold shows the approve/decline tradeoff directly
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
import numpy as np

X, y = make_classification(n_samples=1000, n_features=8, weights=[0.8, 0.2], random_state=0)
# y=1 means "defaulted" (the risk we want to catch)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

model = LogisticRegression().fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]  # probability of default

for threshold in [0.2, 0.5, 0.8]:
    preds = (probs >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
    print(f"threshold={threshold:.1f}  declined-good-applicants(FP)={fp:3d}  approved-defaulters(FN)={fn:3d}")
# OUTPUT (typical):
# threshold=0.2  declined-good-applicants(FP)= 58  approved-defaulters(FN)=  4   <- very cautious, rejects many good applicants
# threshold=0.5  declined-good-applicants(FP)= 18  approved-defaulters(FN)= 15   <- balanced
# threshold=0.8  declined-good-applicants(FP)=  3  approved-defaulters(FN)= 34   <- lenient, lets more defaulters through`
            ],
            codeExplanations: [
                `A synthetic imbalanced dataset stands in for a credit-risk population (80% good applicants, 20% who would default). Instead of calling <code>.predict()</code> (which silently uses the default 0.5 threshold), <code>.predict_proba()</code> is used to get the raw default-probability for each applicant, and that probability is manually thresholded at three different cutoffs. The confusion matrix at each threshold shows the tradeoff directly: a low threshold (0.2) is cautious and rarely lets a real defaulter through, but at the cost of declining far more genuinely good applicants; a high threshold (0.8) approves nearly everyone, letting far more real defaulters through - there is no threshold that minimizes both simultaneously, which is exactly why choosing the threshold is a business risk-tolerance decision, made on top of (not inside) the model.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Outputs a calibrated probability, not just a label</strong> - enabling threshold tuning and risk-based decisions (as in the credit example) that a purely label-output classifier cannot support directly.</li>
<li><strong>Highly interpretable coefficients</strong> - each feature's coefficient has a direct odds-ratio interpretation, valuable in regulated domains (credit, healthcare) where a decision must be explainable.</li>
<li><strong>Fast to train and cheap to run in production</strong> - fitting is a convex optimization problem with a unique global optimum, and inference is just a dot product plus a sigmoid, cheap enough for real-time scoring APIs.</li>
<li><strong>A strong, well-calibrated baseline for binary classification</strong> - before reaching for a more complex model, logistic regression's performance tells you how much of the classification signal is linearly separable in log-odds space.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Assumes a linear decision boundary in log-odds space</strong> - if the true relationship between features and the log-odds of the outcome is strongly nonlinear (e.g. risk rises then falls with age), plain logistic regression underfits unless nonlinear or interaction features are added manually.</li>
<li><strong>Sensitive to unscaled features and multicollinearity</strong> - features on very different numeric scales can distort the fitted coefficients' relative importance, and highly correlated features make individual coefficients unstable and hard to interpret.</li>
<li><strong>Struggles with severe class imbalance without adjustment</strong> - as in the credit example (80/20 split), a naive fit can be biased toward the majority class unless class weighting or threshold tuning is applied deliberately.</li>
<li><strong>The 0.5 default threshold is rarely the right business choice</strong> - as demonstrated, using the default threshold without considering the actual cost of false positives versus false negatives can silently produce a poorly-calibrated real-world decision, even with an accurate model.</li>
</ul>`,
            codeExamples: [
                `# Feature scaling's effect on logistic regression coefficients and convergence
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_classification
import numpy as np
import warnings

X, y = make_classification(n_samples=500, n_features=5, random_state=0)
X[:, 0] = X[:, 0] * 10000  # simulate one feature on a wildly different scale, e.g. raw income in dollars

with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    unscaled_model = LogisticRegression(max_iter=200).fit(X, y)
    converged_without_scaling = len(w) == 0

scaled_model = LogisticRegression().fit(StandardScaler().fit_transform(X), y)

print(f"Converged cleanly without scaling: {converged_without_scaling}")
print(f"Unscaled coefficient for large-scale feature: {unscaled_model.coef_[0][0]:.6f}")
print(f"Scaled coefficient for same feature:           {scaled_model.coef_[0][0]:.6f}")
# OUTPUT (typical):
# Converged cleanly without scaling: False   <- convergence warning due to the unscaled large feature
# Unscaled coefficient for large-scale feature: 0.000041
# Scaled coefficient for same feature:           0.412000`
            ],
            codeExplanations: [
                `One feature is deliberately scaled up by 10,000x (simulating an unscaled raw-dollar income column sitting next to normally-scaled features) to show the practical effect of skipping feature scaling. Fitting logistic regression directly on this unscaled data typically triggers a convergence warning (the optimizer struggles when features live on wildly different numeric scales) and produces a tiny, hard-to-interpret coefficient for that feature purely as an artifact of its scale - not because the feature is unimportant. Standardizing first with <code>StandardScaler</code> resolves the convergence issue and produces a coefficient on a comparable, interpretable scale to the other features, which is why scaling is considered close to mandatory before fitting logistic regression on real, mixed-scale data.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is "Logistic Regression" called regression when it's used for classification?</td><td>It fits a genuine linear regression on the log-odds (logit) of the positive class - a linear combination of features and weights, exactly like ordinary linear regression - and only converts that continuous log-odds output into a discrete class label as a final, separate step, by passing it through the sigmoid function and applying a threshold</td></tr>
<tr class='text-center'><td>What role does the sigmoid function play in logistic regression?</td><td>It converts the unbounded linear combination of features (the log-odds, which can be any real number) into a probability strictly between 0 and 1, using its characteristic S-shaped curve where very negative inputs map near 0, very positive inputs map near 1, and an input of 0 maps to exactly 0.5</td></tr>
<tr class='text-center'><td>Why might a business choose a decision threshold other than the default 0.5?</td><td>The 0.5 threshold assumes false positives and false negatives are equally costly, which is rarely true in practice; lowering the threshold catches more true positives at the cost of more false positives (e.g. declining more good credit applicants to catch more defaulters), and raising it does the reverse, so the threshold should be set based on the actual relative business cost of each type of error</td></tr>
</table>`
        }
    ]
};
