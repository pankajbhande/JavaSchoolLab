import { Topic } from '../../coreJava';

export const binaryClassification: Topic = {
    id: 'ml-classification-binary-classification',
    name: 'Binary Classification',
    beginner: [
        {
            content: `<h4>Choosing Between Exactly Two Outcomes</h4>
<ul>
<li><strong>Binary Classification</strong> is the simplest form of classification - every example belongs to exactly ONE of TWO possible classes, usually labeled 0/1 or "negative"/"positive" (e.g. spam vs not-spam, fraud vs legitimate, disease vs healthy).</li>
<li>It's the setting almost every classification concept is DEFINED in first - precision, recall, the ROC curve, and the confusion matrix are all originally described in terms of a single positive class versus a single negative class, then generalized later to more than two classes.</li>
<li>Common algorithms suited to it out of the box include <strong>Logistic Regression</strong> (outputs a probability of the positive class via sigmoid) and <strong>Support Vector Machines (SVM)</strong> (finds the widest margin separating the two classes) - both are naturally two-class algorithms before any extension is needed.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

# load_breast_cancer is a classic binary task: malignant (1) vs benign (0)
X, y = load_breast_cancer(return_X_y=True)
print("Classes:", set(y))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

log_reg = LogisticRegression(max_iter=5000).fit(X_train, y_train)
svm = SVC(kernel="linear").fit(X_train, y_train)

print(f"Logistic Regression accuracy: {log_reg.score(X_test, y_test):.3f}")
print(f"SVM accuracy: {svm.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Classes: {0, 1}
# Logistic Regression accuracy: 0.965
# SVM accuracy: 0.958`
            ],
            codeExplanations: [
                `The breast-cancer dataset is a textbook binary classification problem: every tumor is labeled exactly 0 (benign) or 1 (malignant), confirmed by printing the set of unique labels. Two algorithms that are naturally binary - LogisticRegression, which fits a sigmoid-based probability of the positive class, and SVC (Support Vector Machine), which finds the widest separating margin between the two classes - are trained on the same train/test split. Both report a simple accuracy score, since with only two classes "correct vs incorrect" is unambiguous in a way that becomes more nuanced once more than two classes are involved.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Binary classification is the foundation every other classification concept builds on. The confusion matrix (true positive, false positive, true negative, false negative), <strong>precision</strong> (of everything flagged positive, how much really is), <strong>recall</strong> (of everything truly positive, how much was caught), and the <strong>ROC curve</strong> (true positive rate vs false positive rate as the decision threshold moves) are all originally defined around ONE positive class versus ONE negative class.</li>
<li>Because there are only two possible outcomes, a single number - the model's estimated probability of the positive class - fully describes its belief, and a single threshold (commonly 0.5) turns that probability into a decision. This clean structure is exactly why binary classification is the natural starting point for teaching and reasoning about classifier behavior before generalizing to multiclass or multilabel settings.</li>
<li>Real systems often reduce a more complex problem BACK down to binary classification precisely because it's the best-understood case - e.g. "is this specific email spam or not" is binary even though there might be many types of spam (phishing, ads, scams) lumped into the single positive class.</li>
</ul>
<h3>Real-World Example: Spam Filtering</h3>
An email provider must decide, for every incoming message, whether it is <strong>spam</strong> (positive class) or <strong>not spam</strong> (negative class) - exactly two mutually exclusive outcomes, which is what makes this the quintessential binary classification example used to introduce the topic.
<ul>
<li>Features might include word frequencies, sender reputation, presence of links, and formatting patterns; a Logistic Regression or SVM model outputs a spam probability (or score) for each message.</li>
<li>Because there are only two classes, the provider can directly reason about the tradeoff using precision and recall: a high threshold for flagging spam maximizes precision (rarely misclassifies a real email as spam, avoiding angry users who lose important mail) at the cost of recall (some spam slips through to the inbox); a low threshold does the reverse.</li>
<li>This same precision/recall tradeoff, first understood here in the two-class spam case, is the direct ancestor of the more complex per-class and averaged metrics needed once a system must sort messages into many categories (multiclass) or apply several tags at once (multilabel).</li>
</ul>`,
            codeExamples: [
                `# Spam filtering: confusion matrix, precision/recall, and threshold effects - all binary-classification-native concepts
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score

# Simulate a spam dataset: y=1 means spam, y=0 means legitimate email
X, y = make_classification(n_samples=2000, n_features=15, weights=[0.7, 0.3], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

model = LogisticRegression().fit(X_train, y_train)
probs = model.predict_proba(X_test)[:, 1]  # probability of "spam"

for threshold in [0.3, 0.5, 0.7]:
    preds = (probs >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
    precision = precision_score(y_test, preds)
    recall = recall_score(y_test, preds)
    print(f"threshold={threshold:.1f}  precision={precision:.3f}  recall={recall:.3f}  (FP={fp}, FN={fn})")

print(f"ROC-AUC (threshold-independent): {roc_auc_score(y_test, probs):.3f}")
# OUTPUT (typical):
# threshold=0.3  precision=0.720  recall=0.912  (FP=98, FN=18)
# threshold=0.5  precision=0.845  recall=0.788  (FP=41, FN=44)
# threshold=0.7  precision=0.921  recall=0.601  (FP=15, FN=83)
# ROC-AUC (threshold-independent): 0.912`
            ],
            codeExplanations: [
                `A synthetic dataset stands in for spam (30% of messages, y=1) versus legitimate mail (70%, y=0). LogisticRegression outputs a probability of spam for each held-out message via predict_proba. Sweeping three decision thresholds shows the precision/recall tradeoff that is native to binary classification: a low threshold (0.3) flags more messages as spam, catching more true spam (high recall) but wrongly flagging more legitimate mail too (lower precision, higher FP); a high threshold (0.7) does the opposite. roc_auc_score summarizes the model's ranking quality across ALL possible thresholds at once - a single number that is only this clean to compute and interpret because there are exactly two classes.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Simplest classification setting to reason about</strong> - with only two outcomes, metrics like accuracy, precision, recall, and the ROC/AUC curve have a single, unambiguous definition, e.g. "precision" in spam filtering is simply "of messages flagged spam, how many really were."</li>
<li><strong>Well-suited to naturally two-class algorithms</strong> - Logistic Regression's sigmoid and SVM's maximum-margin hyperplane are both mathematically built around separating exactly two classes, so no extension trick (like one-vs-rest) is needed, keeping the model simple and fast.</li>
<li><strong>Threshold tuning is straightforward</strong> - a single probability and a single cutoff fully control the precision/recall tradeoff, as shown above, without needing to juggle per-class thresholds or averaging schemes.</li>
<li><strong>Many real-world problems are naturally binary or reduce cleanly to it</strong> - spam/not-spam, fraud/legitimate, disease/healthy, click/no-click - making it directly applicable without reframing the business problem.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Cannot represent more than two mutually exclusive outcomes directly</strong> - classifying a digit image into one of 10 possible values (0-9) or an article into one of many topic categories needs multiclass classification instead, since forcing it into two classes (e.g. "digit 7 vs everything else") loses information about the other 8 non-7 digits.</li>
<li><strong>Class imbalance distorts naive accuracy badly</strong> - if only 1% of emails are spam, a model that always predicts "not spam" scores 99% accuracy while being useless, which is why precision/recall/ROC-AUC (rather than plain accuracy) are emphasized specifically in the binary setting.</li>
<li><strong>The 0.5 default threshold is rarely the right business choice</strong> - as the spam example shows, the "right" cutoff depends entirely on the relative cost of a false positive (a real email marked spam) versus a false negative (spam reaching the inbox), a decision the model itself cannot make.</li>
<li><strong>Doesn't handle the "belongs to multiple categories" case</strong> - an email that is both "promotional" and "spam" needs multilabel classification, since binary classification assumes each example falls into exactly one of the two classes.</li>
</ul>`,
            codeExamples: [
                `# Why accuracy alone is misleading under class imbalance - the classic binary-classification trap
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, recall_score

# Highly imbalanced: only 2% spam, mimicking a well-filtered real inbox
X, y = make_classification(n_samples=3000, n_features=10, weights=[0.98, 0.02], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)  # always predicts "not spam"
model = LogisticRegression().fit(X_train, y_train)

for name, clf in [("Always predict 'not spam'", dummy), ("Logistic Regression", model)]:
    preds = clf.predict(X_test)
    print(f"{name}: accuracy={accuracy_score(y_test, preds):.3f}  recall(catches spam)={recall_score(y_test, preds):.3f}")
# OUTPUT (typical):
# Always predict 'not spam': accuracy=0.980  recall(catches spam)=0.000
# Logistic Regression: accuracy=0.983  recall(catches spam)=0.550`
            ],
            codeExplanations: [
                `A dataset with only 2% spam simulates a well-filtered real inbox. DummyClassifier with strategy="most_frequent" always predicts the majority class ("not spam") and never even looks at the input features, yet still scores 98% accuracy purely because spam is rare - a strong warning that plain accuracy is nearly meaningless on imbalanced binary problems. LogisticRegression's accuracy (98.3%) looks barely better on paper, but its recall of 0.55 reveals it actually catches over half the real spam, something the dummy classifier's 0% recall exposes as completely useless despite its high accuracy - which is exactly why precision/recall/ROC-AUC are the metrics practitioners actually watch in binary classification, not raw accuracy.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - How Two Naturally-Binary Algorithms Draw the Line</h3>
<ul>
<li><strong>Logistic Regression</strong> models the LOG-ODDS of the positive class as a linear function of the features, then squashes it through the sigmoid function <code>&sigma;(z) = 1 / (1 + e&#8315;&#8320;)</code> into a probability in [0, 1]. There is exactly one linear boundary (where probability = 0.5) separating the two classes - naturally binary because sigmoid maps to a single probability axis with two ends.</li>
<li><strong>SVM</strong> instead searches for the hyperplane that maximizes the MARGIN (distance) between the two classes' closest points (the "support vectors"). It doesn't produce a probability by default - its raw output is a signed distance from the boundary, and the sign alone (positive or negative side) directly gives one of the two class labels.</li>
<li>Both algorithms are elegant specifically BECAUSE there are only two classes: there's only one boundary to place and one number (log-odds, or signed distance) that fully describes which side of it a point falls on. This is precisely the property that breaks down with 3+ classes, and is why extending them to multiclass problems requires strategies like <strong>one-vs-rest</strong> (train one binary classifier per class) or <strong>one-vs-one</strong> - binary classification's own natural fit is the baseline those strategies are built on top of.</li>
</ul>`,
            codeExamples: [
                `# Visualizing the single decision boundary that defines binary classification
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

# Two clearly separable 1D-like clusters (spam-score-like single feature)
X = np.array([[1], [2], [2.5], [3], [7], [7.5], [8], [9]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])  # 0 = not spam, 1 = spam

log_reg = LogisticRegression().fit(X, y)
svm = SVC(kernel="linear").fit(X, y)

for x in [2.8, 5.0, 7.2]:
    prob = log_reg.predict_proba([[x]])[0][1]
    svm_distance = svm.decision_function([[x]])[0]
    print(f"x={x}  LogReg P(spam)={prob:.3f}  SVM signed distance={svm_distance:+.3f}  "
          f"-> {'spam' if prob >= 0.5 else 'not spam'}")
# OUTPUT (typical):
# x=2.8  LogReg P(spam)=0.061  SVM signed distance=-1.230  -> not spam
# x=5.0  LogReg P(spam)=0.623  SVM signed distance=+0.310  -> spam
# x=7.2  LogReg P(spam)=0.975  SVM signed distance=+1.890  -> spam`
            ],
            codeExplanations: [
                `A single feature (standing in for a spam-likelihood score) with a clear gap between the "not spam" cluster (values 1-3) and the "spam" cluster (values 7-9) is used to fit both a LogisticRegression and a linear SVC. For three test points, predict_proba shows the logistic model's smooth probability of the positive class crossing 0.5 somewhere in the gap between the clusters, while decision_function shows the SVM's signed distance from its margin crossing from negative to positive at roughly the same point. Both models independently locate essentially the SAME single boundary despite very different underlying math (probability-based sigmoid vs margin-based geometry) - underscoring that with exactly two classes, there is fundamentally just one line to draw, which is the structural simplicity that lets both algorithms work so cleanly in the binary setting.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why are precision, recall, and ROC-AUC defined first for binary classification before being extended to other settings?</td><td>With exactly two classes, "positive" and "negative" are unambiguous, so a single confusion matrix (TP, FP, TN, FN) fully describes performance and metrics built from it (precision = TP/(TP+FP), recall = TP/(TP+FN), the ROC curve tracing TPR vs FPR as threshold varies) have one clean definition; multiclass and multilabel settings only make sense once you decide how to reduce or average many such one-vs-rest confusion matrices back into these binary-native quantities</td></tr>
<tr class='text-center'><td>Why are Logistic Regression and SVM described as "naturally binary" algorithms?</td><td>Logistic Regression models a single log-odds value squashed through sigmoid into one probability axis with two ends, and SVM finds a single maximum-margin hyperplane whose sign alone determines the class - both produce exactly one number that fully separates two outcomes, with no natural generalization to a third class without an extension strategy like one-vs-rest or one-vs-one</td></tr>
<tr class='text-center'><td>Why is raw accuracy a poor metric for a spam filter, and what should be used instead?</td><td>If spam is rare (e.g. 2% of messages), a model that always predicts "not spam" scores over 98% accuracy while catching zero real spam; precision and recall (or ROC-AUC, which is threshold-independent) expose this by directly measuring how many actual spam messages are caught and how many legitimate messages are wrongly flagged, which is what a spam filter is actually judged on</td></tr>
</table>`
        }
    ]
};
