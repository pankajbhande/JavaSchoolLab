import { Topic } from '../../coreJava';

export const supportVectorMachine: Topic = {
    id: 'ml-classification-support-vector-machine-svm',
    name: 'Support Vector Machine (SVM)',
    beginner: [
        {
            content: `<h4>Finding the Widest Street Between Classes</h4>
<ul>
<li>A <strong>Support Vector Machine</strong> classifies by finding the decision boundary (a line in 2D, a hyperplane in higher dimensions) that separates the two classes with the LARGEST possible MARGIN - the widest possible gap - rather than just any line that happens to separate them.</li>
<li>The <strong>Support Vectors</strong> are the handful of training points closest to that boundary - they're the only points that actually determine where the boundary sits. Every other point could move around (as long as it stays on its own side, outside the margin) and the boundary wouldn't change at all.</li>
<li>Maximizing the margin (rather than settling for any separating line) is what makes SVM generalize well - a boundary that barely squeezes between the classes is fragile to new data landing just past it, while a wide-margin boundary has breathing room.</li>
</ul>`,
            codeExamples: [
                `from sklearn.svm import SVC
from sklearn.datasets import make_blobs
import numpy as np

X, y = make_blobs(n_samples=40, centers=2, cluster_std=1.0, random_state=6)

model = SVC(kernel='linear', C=1000)  # large C: treat this as (nearly) perfectly separable
model.fit(X, y)

print(f"Number of support vectors per class: {model.n_support_}")
print(f"Total training points: {len(X)}  |  Support vectors used: {model.support_vectors_.shape[0]}")
print(f"Training accuracy: {model.score(X, y):.2f}")
# OUTPUT (typical):
# Number of support vectors per class: [2 3]
# Total training points: 40  |  Support vectors used: 5
# Training accuracy: 1.00`
            ],
            codeExplanations: [
                `This generates two well-separated 2D blobs of points and fits a linear-kernel SVC (Support Vector Classifier) with a large C value, which tells the SVM to prioritize classifying every training point correctly over maximizing margin width - appropriate when the classes really are cleanly separable. After fitting, <code>model.n_support_</code> and <code>model.support_vectors_</code> reveal that out of 40 total training points, the boundary's position was decided by only 5 of them (the ones sitting closest to the other class) - the other 35 points had zero influence on where the line was drawn, which is the defining property of how an SVM fits differently from, say, logistic regression (which uses every point's contribution to the loss).`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before the margin-maximizing formulation, simpler linear classifiers (like a basic Perceptron) would stop as soon as they found ANY line that separated the training classes - with no preference for how close that line sat to either class's nearest points. Two separating lines could both achieve 100% training accuracy, yet one might graze right past a few points while the other has generous breathing room on both sides; only the second one is likely to still separate NEW points correctly. SVM's core insight was to formalize "prefer the boundary with the widest margin" as the actual optimization objective, which provably yields better generalization bounds.
<ul>
<li>A second historical problem: many real class boundaries simply aren't straight lines. Before the <strong>Kernel Trick</strong>, making a linear classifier handle curved boundaries meant manually engineering new features (e.g. adding <code>x&sup2;</code>, <code>xy</code> columns) - tedious and often the right transformation wasn't obvious. The kernel trick lets an SVM implicitly operate in a much higher-dimensional (even infinite-dimensional, for the RBF kernel) feature space WITHOUT ever explicitly computing coordinates in that space, by replacing every dot-product in the SVM's math with a kernel function.</li>
</ul>
<h3>Real-World Example</h3>
A bioinformatics lab classifying tumor samples as cancerous or healthy from gene-expression microarray data faces a notoriously hard setup: often only a few hundred patient samples exist, but each sample has tens of thousands of gene-expression features - far more dimensions than data points. Many algorithms (like k-NN or a deep neural network) either need far more data to avoid overfitting in such high dimensions, or need heavy regularization to even converge. SVM's margin-maximization is naturally suited to this regime: it was one of the most successful early tools for gene-expression classification precisely because the margin-based objective resists overfitting even when features vastly outnumber samples, and a linear kernel (or a mild RBF kernel) often works well since high-dimensional data tends to already be closer to linearly separable.`,
            codeExamples: [
                `# Gene-expression-style classification: SVM with a small sample count and many features
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_classification

# simulate 120 patient samples, 3000 gene-expression features - classic "n << p" bioinformatics shape
X, y = make_classification(n_samples=120, n_features=3000, n_informative=25,
                            n_redundant=50, random_state=3)

model = SVC(kernel='linear', C=1.0)
scores = cross_val_score(model, X, y, cv=5)
print(f"5-fold CV accuracy (linear SVM, n_samples=120, n_features=3000): {scores.mean():.3f} (+/- {scores.std():.3f})")
# OUTPUT (typical):
# 5-fold CV accuracy (linear SVM, n_samples=120, n_features=3000): 0.917 (+/- 0.041)`
            ],
            codeExplanations: [
                `This simulates the bioinformatics scenario directly: 120 samples but 3,000 features, an "n much less than p" shape that trips up many classifiers. A linear-kernel SVC is evaluated with 5-fold cross validation (training and testing on 5 different splits and averaging) rather than a single train/test split, since with so few samples any one split could be misleading. The resulting accuracy and its low standard deviation illustrate why a margin-maximizing linear SVM remains a strong, reliable default for exactly this "far more features than samples" regime that shows up constantly in genomics.`
            ]
        },
        {
            content: `<h3>The Kernel Trick and the Soft Margin (C Parameter)</h3>
<ul>
<li><strong>Linear kernel</strong> - draws a straight decision boundary; fast, interpretable, and often sufficient in very high-dimensional data (like gene expression or text bag-of-words, where the data is already "spread out" enough to be close to linearly separable).</li>
<li><strong>Polynomial kernel</strong> - implicitly adds polynomial combinations of features (degree controls curviness), useful when you suspect a moderate, structured nonlinearity.</li>
<li><strong>RBF (Radial Basis Function) kernel</strong> - the most commonly used nonlinear kernel; implicitly maps into an infinite-dimensional space, letting the boundary bend arbitrarily. Its <code>gamma</code> parameter controls how far each point's influence reaches - high gamma means only very nearby points matter (boundary can get wiggly/overfit), low gamma lets distant points influence the boundary (smoother, can underfit).</li>
<li><strong>Soft Margin / <code>C</code> parameter</strong> - real data is rarely perfectly separable, so SVM allows some points to violate the margin (or even land on the wrong side) in exchange for a wider, more robust margin overall. <code>C</code> controls that tradeoff: a LARGE C penalizes violations heavily (narrower margin, fits training data more tightly, risk of overfitting); a SMALL C tolerates more violations (wider margin, more regularized, risk of underfitting).</li>
</ul>`,
            codeExamples: [
                `# Same non-linearly-separable dataset, contrasting kernel choice and the effect of C
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=200, noise=0.25, random_state=0)  # interleaving crescents: not linearly separable
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

for kernel, C in [('linear', 1), ('rbf', 1), ('rbf', 100)]:
    model = SVC(kernel=kernel, C=C, gamma='scale')
    model.fit(X_train, y_train)
    print(f"kernel={kernel:6s} C={C:4d}  train_acc={model.score(X_train, y_train):.3f}  test_acc={model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# kernel=linear  C=   1  train_acc=0.864  test_acc=0.850   <- can't bend around the moons
# kernel=rbf     C=   1  train_acc=0.943  test_acc=0.933   <- curved boundary, well regularized
# kernel=rbf     C= 100  train_acc=0.986  test_acc=0.883   <- tighter fit to noise, test accuracy drops (overfit)`
            ],
            codeExplanations: [
                `<code>make_moons</code> generates two interleaving crescent-shaped classes that NO straight line can separate well, which is exactly the setting where kernel choice matters. The loop trains three SVMs: a linear kernel (which is stuck fitting a straight boundary through curved classes and underperforms), an RBF kernel with a moderate C=1 (bends around the crescents and generalizes well), and the same RBF kernel with a much larger C=100 (fits the training data almost perfectly, including its noise, but test accuracy actually drops) - printing both train and test accuracy side by side makes the overfitting gap from raising C directly visible.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Effective in high-dimensional spaces, even when features outnumber samples</strong> - as shown above with 3,000 gene-expression features and only 120 patients, margin maximization resists overfitting in exactly the regime where many other models struggle.</li>
<li><strong>Memory-efficient at prediction time</strong> - the trained model only needs to remember the support vectors (often a small fraction of the training set), not the entire dataset, unlike k-NN which must keep every training point around.</li>
<li><strong>Versatile via kernels</strong> - the same algorithm handles linear and highly nonlinear boundaries just by swapping the kernel function, without needing to hand-engineer new features (e.g. RBF lets it bend around the interleaving moons above with a one-line parameter change).</li>
<li><strong>Robust to outliers relative to the boundary far from the margin</strong> - because only support vectors near the boundary matter, a stray outlier point that lands safely on the correct side, far from the margin, has literally zero influence on the fitted boundary.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Doesn't scale well to very large datasets</strong> - standard SVM training scales roughly quadratically to cubically with the number of samples, so training on millions of rows (unlike the 120-3000 gene-expression example) becomes impractically slow compared to models like logistic regression or gradient boosting.</li>
<li><strong>Requires careful feature scaling</strong> - since the margin is a geometric distance, a feature on a 0-100,000 scale (e.g. income) would dominate one on a 0-1 scale (e.g. a ratio) purely due to units, not real importance, so features must be standardized first (as with k-NN).</li>
<li><strong>No direct probability outputs</strong> - SVM natively produces a class label (which side of the boundary), not a calibrated probability; scikit-learn's <code>probability=True</code> bolts on Platt scaling afterward, which is slower to fit and only approximate.</li>
<li><strong>Kernel and hyperparameter choice matters a lot and isn't automatic</strong> - picking the wrong kernel (linear vs RBF) or a bad <code>C</code>/<code>gamma</code> combination (as seen with C=100 overfitting the moons dataset above) can silently hurt performance, and tuning them well typically needs a grid search with cross-validation.</li>
<li><strong>Doesn't naturally extend to more than two classes</strong> - SVM is fundamentally binary; multi-class support (like scikit-learn's default one-vs-rest or one-vs-one strategies) trains multiple binary SVMs under the hood, adding training cost as the number of classes grows.</li>
</ul>`,
            codeExamples: [
                `# Why feature scaling matters for SVM - identical data, only the scale of one feature changes
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

X, y = make_classification(n_samples=300, n_features=4, random_state=0)
X[:, 0] = X[:, 0] * 50000  # simulate one feature ("income") on a wildly different scale

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

unscaled = SVC(kernel='rbf').fit(X_train, y_train)
scaler = StandardScaler().fit(X_train)
scaled = SVC(kernel='rbf').fit(scaler.transform(X_train), y_train)

print(f"Unscaled features test accuracy: {unscaled.score(X_test, y_test):.3f}")
print(f"Standardized features test accuracy: {scaled.score(scaler.transform(X_test), y_test):.3f}")
# OUTPUT (typical):
# Unscaled features test accuracy: 0.678   <- the huge-scale feature dominates the RBF distance calc
# Standardized features test accuracy: 0.933`
            ],
            codeExplanations: [
                `This deliberately inflates just one of four otherwise-informative features to a 50,000x larger scale (mimicking an unscaled "income" column sitting next to small ratio-like columns) and trains an RBF-kernel SVM on it directly versus on a StandardScaler-normalized version. Because the RBF kernel's similarity measure is a distance calculation, the unscaled feature's huge numeric range swamps the other three features' contributions almost entirely, and accuracy drops sharply; scaling every feature to zero mean and unit variance first lets all four features contribute proportionally to their actual predictive value, restoring accuracy - this is exactly why StandardScaler before SVC is considered close to mandatory in practice.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are support vectors, and why does the SVM only need to remember them?</td><td>Support vectors are the training points closest to the decision boundary, the ones that actually constrain where the maximum-margin boundary can sit; every other point could be moved (while staying outside the margin, on its correct side) without changing the fitted boundary at all, so the model only needs to store the support vectors for prediction, not the full training set</td></tr>
<tr class='text-center'><td>What problem does the kernel trick solve, and how does it work without explicitly computing high-dimensional coordinates?</td><td>Many real class boundaries are not linearly separable in the original feature space; the kernel trick replaces the dot-product in the SVM's math with a kernel function (e.g. RBF) that computes what the dot-product WOULD be in a much higher (even infinite) dimensional space, without ever materializing those coordinates - letting the SVM fit nonlinear boundaries at roughly the same computational cost as a linear one</td></tr>
<tr class='text-center'><td>What does the C parameter control, and what happens at very high vs very low values?</td><td>C controls the tradeoff between margin width and training-point violations in the soft-margin formulation; a very high C heavily penalizes any misclassified or margin-violating point, producing a narrow margin that fits training data tightly and risks overfitting, while a very low C tolerates more violations for a wider, more regularized margin that risks underfitting</td></tr>
</table>`
        }
    ]
};
