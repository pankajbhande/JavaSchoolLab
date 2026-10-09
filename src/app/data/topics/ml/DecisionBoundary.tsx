import { Topic } from '../../coreJava';

export const decisionBoundary: Topic = {
    id: 'ml-classification-decision-boundary',
    name: 'Decision Boundary',
    beginner: [
        {
            content: `<h3>The Line That Separates Classes</h3>
A <strong>decision boundary</strong> is the surface in feature space where a classifier switches from predicting one class to predicting another. On one side of it every point is predicted class A; on the other, class B.
<ul>
<li>For two features, the decision boundary is literally a line (or curve) you can draw on a scatter plot.</li>
<li>Different algorithms are capable of drawing different SHAPES of boundary - a straight line, a set of rectangular blocks, or a smooth curve - purely because of how each algorithm is mathematically constructed, not because of anything special about the data.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_blobs

X, y = make_blobs(n_samples=60, centers=2, cluster_std=1.2, random_state=0)
model = LogisticRegression().fit(X, y)

# Predict across a small grid to see where the boundary falls
grid = np.array([[x1, x2] for x1 in np.linspace(X[:,0].min(), X[:,0].max(), 5)
                            for x2 in np.linspace(X[:,1].min(), X[:,1].max(), 5)])
preds = model.predict(grid)
print(f"Grid predictions (0/1): {preds}")
print(f"Model coefficients (define the line): {model.coef_}, intercept: {model.intercept_}")
# OUTPUT: [0 0 0 1 1 ... ] / [[w1 w2]], [b]`
            ],
            codeExplanations: [
                `A grid of points spanning the data's range is fed through a fitted LogisticRegression model. Because logistic regression's boundary is defined by a single linear equation (<code>w1*x1 + w2*x2 + b = 0</code>), the predictions flip from 0 to 1 exactly at points that cross that line - printing <code>model.coef_</code> and <code>model.intercept_</code> shows the actual line equation being used, which is the mathematical definition of the decision boundary for this algorithm.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
The decision boundary is not just a visualization trick - it is a direct window into what a model has learned and whether that shape actually matches the true pattern in the data.
<ul>
<li>An algorithm's inherent flexibility determines what shapes it can EVER represent, regardless of how much data or tuning it gets. A linear model (Logistic Regression, linear SVM) can only ever draw a straight line/hyperplane; if the true boundary is curved, no amount of training fixes that - the fix has to be a different algorithm or engineered nonlinear features.</li>
<li>Plotting the boundary is one of the fastest diagnostic tools for under/overfitting on low-dimensional data: a boundary that is too simple relative to the data's structure signals underfitting (high bias), while a boundary that snakes tightly around every individual training point signals overfitting (high variance).</li>
</ul>
<h3>Real-World Example: Same Data, Three Different Boundary Shapes</h3>
A dataset of two interleaved classes is fit with three different classifiers - Logistic Regression, a Decision Tree, and an RBF-kernel SVM. Despite training on identical data, Logistic Regression can only draw a straight line and badly misclassifies the interleaved region, the Decision Tree carves the space into a staircase of axis-aligned rectangles, and the RBF SVM bends a smooth curve that follows the true crescent shape - the algorithm choice, not the data, dictates what boundary shape is even possible.`,
            codeExamples: [
                `# Comparing decision boundary shapes across three classifiers on the same non-linear data
import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC

X, y = make_moons(n_samples=300, noise=0.25, random_state=0)  # two interleaving crescents
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

models = {
    "Logistic Regression (straight line)": LogisticRegression(),
    "Decision Tree (rectangular blocks)": DecisionTreeClassifier(max_depth=4, random_state=0),
    "RBF SVM (curved boundary)": SVC(kernel='rbf', gamma='scale'),
}

for name, model in models.items():
    model.fit(X_train, y_train)
    print(f"{name:38s} test_acc={model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Logistic Regression (straight line)   test_acc=0.844
# Decision Tree (rectangular blocks)    test_acc=0.900
# RBF SVM (curved boundary)             test_acc=0.933`
            ],
            codeExplanations: [
                `<code>make_moons</code> generates two crescent-shaped, interleaving classes that no straight line can cleanly separate. Fitting Logistic Regression, a Decision Tree, and an RBF SVM on the exact same train/test split isolates the effect of each algorithm's boundary shape: Logistic Regression's rigid straight-line boundary underperforms because the true separation is curved; the Decision Tree approximates the curve with a series of rectangular splits, doing better but still blocky; the RBF SVM's smooth curved boundary matches the crescent shape most closely and scores highest - the accuracy gap traces directly back to boundary shape, not to any difference in the training data.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Visualizing the boundary gives an intuitive, immediate diagnostic</strong> - on 2D (or PCA-reduced) data, a plotted boundary instantly reveals whether a model is too rigid (a straight line through curved data) or too wiggly (tracing individual noisy points), often faster than reading a metrics table.</li>
<li><strong>Comparing boundary shapes across algorithms clarifies model selection</strong> - as in the moons example, seeing that a linear model's boundary literally cannot bend around the true pattern makes it obvious that a nonlinear algorithm or engineered features are needed, rather than just more tuning of the same linear model.</li>
<li><strong>Boundary shape connects directly to interpretability</strong> - a simple linear boundary can be explained as "a weighted sum of features crossing a cutoff," which stakeholders can reason about, whereas an intricate curved boundary from a complex model is harder to explain even when it's more accurate.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Directly visualizing the boundary only works in 2D (or 3D)</strong> - real datasets often have dozens or hundreds of features, so the boundary can't be drawn directly; practitioners must fall back on dimensionality reduction (PCA/t-SNE) for a rough visual, or rely purely on metrics.</li>
<li><strong>A visually "nice" boundary on training data doesn't guarantee good generalization</strong> - an overfit boundary (like a Decision Tree with unlimited depth) can look like it perfectly separates the training scatter plot while still performing poorly on a held-out test set.</li>
<li><strong>Boundary shape alone doesn't reveal probability calibration</strong> - two models can have an identical-looking boundary yet produce very different confidence levels (probabilities) near that boundary, which matters for threshold-based decisions.</li>
<li><strong>Some algorithms (ensembles like Random Forests or Gradient Boosting) produce boundaries that are technically visualizable but visually noisy/jagged</strong>, making the plot harder to interpret as a clean diagnostic compared to a single linear model or tree.</li>
</ul>`,
            codeExamples: [
                `# Overfitting shown through boundary complexity: shallow vs unconstrained Decision Tree
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=200, noise=0.3, random_state=1)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

for max_depth in [2, None]:
    model = DecisionTreeClassifier(max_depth=max_depth, random_state=1).fit(X_train, y_train)
    n_leaves = model.get_n_leaves()
    print(f"max_depth={str(max_depth):4s}  leaves={n_leaves:3d}  train_acc={model.score(X_train, y_train):.3f}  test_acc={model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# max_depth=2     leaves=  4  train_acc=0.807  test_acc=0.783   <- simple, blocky boundary, mild underfit
# max_depth=None  leaves= 33  train_acc=1.000  test_acc=0.850   <- boundary hugs every training point, overfit gap`
            ],
            codeExplanations: [
                `Two Decision Trees are trained on the same noisy moons data: one capped at depth 2 (a coarse, blocky boundary with only 4 leaves) and one left unconstrained (33 leaves, carving out a tiny rectangle around nearly every individual training point). The unconstrained tree reaches perfect training accuracy but its test accuracy barely improves over the shallow tree - the gap between a 1.000 train score and a much lower test score is the numeric signature of exactly the overfit, overly-intricate boundary that a 2D plot of this tree's regions would show directly as jagged, tightly-fit rectangles hugging individual points.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a decision boundary?</td><td>The surface in feature space where a classifier's predicted class changes from one label to another - points on one side are predicted as one class, points on the other side as the other class</td></tr>
<tr class='text-center'><td>Why do Logistic Regression, a Decision Tree, and an RBF SVM produce different-shaped boundaries on the same data?</td><td>Each algorithm's mathematical structure limits what shapes it can represent: Logistic Regression can only produce a straight line/hyperplane, a Decision Tree produces axis-aligned rectangular regions from its sequence of feature-threshold splits, and an RBF-kernel SVM can bend a smooth curve because the kernel trick implicitly operates in a much higher-dimensional space - the shape is a property of the algorithm, not the data</td></tr>
<tr class='text-center'><td>How can visualizing a decision boundary help diagnose overfitting or underfitting?</td><td>A boundary that is far simpler than the data's true structure (e.g. a straight line through clearly curved classes) signals underfitting/high bias, while a boundary that snakes tightly around individual training points to classify every one correctly signals overfitting/high variance - comparing the boundary's shape to the visible data pattern is often a faster first diagnostic than computing metrics</td></tr>
</table>`
        }
    ]
};
