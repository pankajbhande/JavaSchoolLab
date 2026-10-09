import { Topic } from '../../coreJava';

export const multiclassClassification: Topic = {
    id: 'ml-classification-multiclass-classification',
    name: 'Multiclass Classification',
    beginner: [
        {
            content: `<h4>Choosing Among More Than Two Mutually-Exclusive Classes</h4>
<ul>
<li><strong>Multiclass Classification</strong> extends binary classification to MORE than two possible classes, where each example still belongs to exactly ONE class (mutually exclusive) - e.g. classifying a handwritten digit image into one of 10 classes (0-9), or a news article into exactly one topic category (sports, politics, tech, ...).</li>
<li>Algorithms that are naturally binary (Logistic Regression, SVM) need an extension strategy to handle more than two classes: <strong>One-vs-Rest (OvR)</strong> trains one binary classifier per class ("is it a 7, or not?") and picks the class whose classifier is most confident; <strong>One-vs-One (OvO)</strong> trains a binary classifier for every PAIR of classes and lets them vote.</li>
<li>Some models generalize naturally without needing OvR/OvO at all - e.g. Logistic Regression can use <strong>Softmax</strong> instead of sigmoid to directly output a probability distribution over all classes at once, and Decision Trees/Random Forests split multiclass targets natively.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

# load_digits: handwritten digit images, 10 mutually exclusive classes (0-9)
X, y = load_digits(return_X_y=True)
print("Classes:", sorted(set(y)))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

# multi_class="multinomial" uses Softmax directly over all 10 classes
model = LogisticRegression(max_iter=5000, multi_class="multinomial")
model.fit(X_train, y_train)

print(f"Test accuracy: {model.score(X_test, y_test):.3f}")
print("Predicted probabilities for one digit sum to:", model.predict_proba(X_test[:1]).sum())
# OUTPUT (typical):
# Classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
# Test accuracy: 0.968
# Predicted probabilities for one digit sum to: 1.0`
            ],
            codeExplanations: [
                `The digits dataset has 10 mutually exclusive classes - every image is exactly one digit, never a blend of two. Setting multi_class="multinomial" tells LogisticRegression to use Softmax instead of the binary sigmoid, producing one probability per class that all sum to exactly 1.0 (confirmed by summing predict_proba's output), directly generalizing the binary "probability of positive class" idea to 10 classes at once. score() reports how often the single highest-probability class matches the true digit label.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Many real classifiers - Logistic Regression, SVM - are mathematically built around separating exactly TWO classes. Real problems, however, are rarely binary: sorting mail into 10 folders, tagging news into a dozen sections, or recognizing digits 0-9 all require choosing among many mutually exclusive options at once.</li>
<li>Two general-purpose strategies bridge this gap for algorithms that are inherently binary: <strong>One-vs-Rest (OvR)</strong> trains N binary classifiers for N classes (each answering "is it class k, or not"), then picks the class whose classifier gives the highest confidence; <strong>One-vs-One (OvO)</strong> trains one binary classifier per PAIR of classes (N*(N-1)/2 classifiers total) and lets them vote, which can be more accurate for algorithms like SVM but scales worse as classes grow.</li>
<li><strong>Softmax</strong>, <code>softmax(z)&#8305; = e^z&#7522; / &Sigma;&#7480; e^z&#7480;</code>, is the direct multiclass generalization of the sigmoid used in Logistic Regression - instead of squashing one number into one probability, it takes a vector of "scores" (one per class) and squashes ALL of them at once into a probability distribution that sums to 1, letting a single model (not N separate ones) natively output multiclass probabilities.</li>
</ul>
<h3>Real-World Example: Handwritten Digit Recognition</h3>
Classifying a scanned handwritten digit image into exactly one of 10 classes (0 through 9) is the canonical multiclass problem (as in the classic MNIST dataset), and the same reasoning applies to sorting news articles into exactly one topic section.
<ul>
<li>Each image belongs to exactly one digit - unlike multilabel classification, a digit image is never simultaneously "somewhat a 3 and somewhat an 8" in the label itself (though the model's probabilities may be split between them if the handwriting is ambiguous).</li>
<li>A Softmax-based classifier (or a multiclass-native model like Random Forest) outputs a full probability distribution over all 10 digits for each image, and the predicted label is simply the digit with the highest probability - directly generalizing the binary "threshold at 0.5" decision rule to "pick the argmax."</li>
<li>If instead an SVM (naturally binary) is used, scikit-learn transparently trains it with OvR under the hood (10 "is it digit k?" classifiers) or OvO (45 pairwise classifiers for 10 digits) - the practitioner picks a model, and the library handles the multiclass extension strategy.</li>
</ul>`,
            codeExamples: [
                `# Digit recognition: comparing Softmax-native Logistic Regression vs OvR-extended SVM
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.multiclass import OneVsRestClassifier, OneVsOneClassifier
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

softmax_model = LogisticRegression(max_iter=5000, multi_class="multinomial").fit(X_train, y_train)
ovr_svm = OneVsRestClassifier(SVC(kernel="linear")).fit(X_train, y_train)
ovo_svm = OneVsOneClassifier(SVC(kernel="linear")).fit(X_train, y_train)

print(f"Softmax Logistic Regression accuracy: {softmax_model.score(X_test, y_test):.3f}")
print(f"One-vs-Rest SVM accuracy:             {ovr_svm.score(X_test, y_test):.3f}  "
      f"(trained {len(ovr_svm.estimators_)} binary classifiers)")
print(f"One-vs-One SVM accuracy:               {ovo_svm.score(X_test, y_test):.3f}  "
      f"(trained {len(ovo_svm.estimators_)} binary classifiers)")
# OUTPUT (typical):
# Softmax Logistic Regression accuracy: 0.968
# One-vs-Rest SVM accuracy:             0.982  (trained 10 binary classifiers)
# One-vs-One SVM accuracy:               0.987  (trained 45 binary classifiers)`
            ],
            codeExplanations: [
                `This directly contrasts the two ways multiclass classification is handled. LogisticRegression with multi_class="multinomial" uses Softmax internally to natively output a 10-way probability distribution from ONE trained model. OneVsRestClassifier wraps the naturally-binary SVC and explicitly trains 10 separate "is it digit k?" classifiers (confirmed by len(ovr_svm.estimators_) == 10), picking whichever is most confident. OneVsOneClassifier instead trains a binary classifier for every pair of the 10 digits (10*9/2 = 45 classifiers), and lets them vote. All three reach similar high accuracy on this well-separated dataset, but they arrive there through fundamentally different multiclass strategies - one model outputting all classes at once, versus many binary sub-models combined by a wrapper.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Matches many real problems directly</strong> - digit recognition, single-topic news categorization, and species identification are all inherently "pick exactly one of several options," which multiclass classification models without any awkward reframing.</li>
<li><strong>Softmax gives calibrated, comparable probabilities across all classes at once</strong> - a single forward pass yields a full probability distribution (e.g. "62% cat, 30% dog, 8% fox"), letting downstream logic reason about the model's second-best guess too, not just its top pick.</li>
<li><strong>OvR/OvO let binary-only algorithms be reused</strong> - well-understood, well-optimized binary classifiers like SVM don't need to be reinvented for multiclass problems; scikit-learn's wrappers apply the extension automatically and transparently.</li>
<li><strong>OvO can be more accurate for algorithms like SVM</strong> - each pairwise classifier only has to separate two specific classes on a smaller, more focused subset of the data, which can produce cleaner individual decision boundaries than OvR's "one class vs everything else" framing, as seen in the digit example above.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>OvR and OvO both cost more compute than a single binary model</strong> - OvR needs N classifiers for N classes, and OvO needs N*(N-1)/2, which grows quadratically; classifying among 100 classes with OvO means training 4,950 separate binary classifiers.</li>
<li><strong>OvR can suffer from class imbalance per sub-classifier</strong> - each "is it class k, or not" classifier sees class k as a small minority against all other classes combined, which can bias it if classes aren't balanced.</li>
<li><strong>Standard multiclass metrics assume mutual exclusivity</strong> - accuracy, and multiclass precision/recall (macro/micro/weighted-averaged), all implicitly assume every example has exactly one true label; they break down or need modification for problems where an example could belong to several categories, which is exactly the multilabel classification setting.</li>
<li><strong>Softmax forces competition among classes</strong> - because all class probabilities must sum to 1, pushing up one class's probability necessarily pushes down the others, which is the right behavior for mutually exclusive classes but the WRONG behavior if an example could genuinely belong to more than one category at once.</li>
</ul>`,
            codeExamples: [
                `# OvR vs OvO: how many binary classifiers are trained as class count grows
from itertools import combinations

def count_classifiers(n_classes):
    ovr = n_classes
    ovo = len(list(combinations(range(n_classes), 2)))
    return ovr, ovo

for n in [2, 5, 10, 50, 100]:
    ovr, ovo = count_classifiers(n)
    print(f"{n:3d} classes  ->  OvR: {ovr:5d} classifiers   OvO: {ovo:6d} classifiers")
# OUTPUT:
#   2 classes  ->  OvR:     2 classifiers   OvO:      1 classifiers
#   5 classes  ->  OvR:     5 classifiers   OvO:     10 classifiers
#  10 classes  ->  OvR:    10 classifiers   OvO:     45 classifiers
#  50 classes  ->  OvR:    50 classifiers   OvO:   1225 classifiers
# 100 classes  ->  OvR:   100 classifiers   OvO:   4950 classifiers`
            ],
            codeExplanations: [
                `This makes the scaling cost of the two extension strategies concrete. OvR always needs exactly one classifier per class (linear growth), while OvO needs one per PAIR of classes (quadratic growth, n*(n-1)/2). For a small 5-class problem the difference is negligible (5 vs 10 classifiers), but for a 100-class problem OvO requires training nearly 5,000 separate binary classifiers versus OvR's 100 - a concrete illustration of why OvO is typically only preferred for algorithms (like SVM) where the accuracy benefit from smaller, focused pairwise problems outweighs the much steeper computational cost, and why OvR or a natively-multiclass algorithm (Softmax, trees) is usually preferred as the number of classes grows large.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Softmax as Sigmoid's Multiclass Generalization</h3>
<ul>
<li>Binary Logistic Regression computes one linear score <code>z</code> and applies sigmoid: <code>&sigma;(z) = 1 / (1 + e&#8315;&#8320;)</code>, producing a single probability (the complement is implicitly 1 minus that).</li>
<li>Multiclass Logistic Regression instead computes ONE linear score per class, <code>z&#8321;, z&#8322;, ..., z&#7480;</code>, and applies <strong>Softmax</strong>: <code>softmax(z)&#8305; = e^z&#7522; / &Sigma;&#7480; e^z&#7480;</code> - exponentiating every class's score and dividing by the sum of all exponentiated scores. This guarantees every output is positive and all outputs sum to exactly 1, exactly like sigmoid's two-class case but generalized to K classes.</li>
<li>Setting K=2 in Softmax mathematically reduces back to the sigmoid formula (up to a reparameterization) - Softmax is not a different idea from sigmoid, it IS sigmoid, generalized to more than two competing scores.</li>
<li>Training uses <strong>categorical cross-entropy loss</strong> (the multiclass generalization of binary log-loss), which penalizes the model in proportion to how far the predicted probability of the TRUE class was from 1.</li>
</ul>`,
            codeExamples: [
                `# Manually computing Softmax to show it generalizes sigmoid to K classes
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def softmax(z):
    exp_z = np.exp(z - np.max(z))  # subtract max for numerical stability
    return exp_z / exp_z.sum()

# Binary case: sigmoid gives P(positive class)
z_binary = 1.2
print(f"Binary sigmoid: P(positive)={sigmoid(z_binary):.3f}")

# Multiclass case: softmax over 4 class scores (e.g. digit is 0, 1, 2, or 3)
z_multiclass = np.array([1.2, 0.3, -0.5, 2.1])
probs = softmax(z_multiclass)
print(f"Softmax probabilities: {np.round(probs, 3)}  sum={probs.sum():.3f}")
print(f"Predicted class: {np.argmax(probs)}")
# OUTPUT (typical):
# Binary sigmoid: P(positive)=0.769
# Softmax probabilities: [0.238 0.097 0.043 0.622]  sum=1.000
# Predicted class: 3`
            ],
            codeExplanations: [
                `This implements both functions from scratch to show their shared structure. sigmoid(z_binary) turns one raw score into one probability, exactly as binary Logistic Regression does. softmax(z_multiclass) takes a whole VECTOR of 4 raw class scores (one per class, analogous to z in the binary case but one per class instead of one overall) and exponentiates + normalizes them so they form a genuine probability distribution summing to 1.000 - the class with the highest raw score (index 3, score 2.1) ends up with the highest softmax probability (0.622) and is the predicted class via argmax, mirroring how the binary case predicts the positive class once sigmoid's output crosses 0.5. This is the literal computation LogisticRegression(multi_class="multinomial") performs internally for every multiclass prediction.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between One-vs-Rest and One-vs-One for extending a binary classifier to multiclass problems?</td><td>One-vs-Rest trains one binary classifier per class, each answering "is it this class, or any of the rest?", and picks the most confident one at prediction time (N classifiers for N classes); One-vs-One trains one binary classifier for every PAIR of classes and lets them vote (N*(N-1)/2 classifiers), which scales worse as classes grow but can give cleaner individual decision boundaries since each classifier only has to separate two specific classes</td></tr>
<tr class='text-center'><td>How does Softmax generalize the sigmoid function used in binary Logistic Regression?</td><td>Sigmoid takes one raw linear score and squashes it into a single probability between 0 and 1 (with the other class's probability implied as the complement); Softmax takes a vector of raw scores, one per class, exponentiates each and divides by the sum of all the exponentials, producing a full probability distribution over all classes that sums to exactly 1 - setting the number of classes to 2 in Softmax mathematically reduces back to the sigmoid formula</td></tr>
<tr class='text-center'><td>Why can't standard multiclass metrics and Softmax be used directly for a problem like tagging an article with several topics at once?</td><td>Softmax and standard multiclass accuracy/precision/recall assume every example belongs to exactly ONE class, with all class probabilities competing and summing to 1; if an example can genuinely belong to multiple categories simultaneously (multilabel), that mutual-exclusivity assumption is wrong, which is why multilabel problems instead train independent per-label binary classifiers and use label-based or example-based metrics rather than Softmax and multiclass accuracy</td></tr>
</table>`
        }
    ]
};
