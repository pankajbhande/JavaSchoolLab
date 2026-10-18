import { Topic } from '../../coreJava';

export const decisionTree: Topic = {
    id: 'ml-classification-decision-tree',
    name: 'Decision Tree',
    beginner: [
        {
            content: `<h4>Learning a Tree of Yes/No Questions</h4>
<ul>
<li>A Decision Tree predicts by asking a sequence of simple questions about the features (e.g. "is age &gt; 30?"), branching left or right based on the answer, until it reaches a leaf holding a prediction.</li>
<li>It's built greedily: at each node, the algorithm picks the SPLIT (a feature + threshold) that best separates the classes, then repeats on each resulting branch.</li>
<li>Trees need no feature scaling and handle both numerical and categorical data naturally - but a single unconstrained tree tends to overfit badly.</li>
</ul>`,
            codeExamples: [
                `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = DecisionTreeClassifier(max_depth=3, random_state=0)
model.fit(X_train, y_train)

print(f"Test accuracy: {model.score(X_test, y_test):.2f}")
print(export_text(model, feature_names=load_iris().feature_names))
# OUTPUT (abridged):
# Test accuracy: 0.98
# |--- petal length (cm) <= 2.45
# |   |--- class: 0
# |--- petal length (cm) >  2.45
# |   |--- petal width (cm) <= 1.75
# |   |   |--- class: 1
# |   |--- petal width (cm) >  1.75
# |   |   |--- class: 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>How a Split is Chosen - Gini Impurity and Information Gain</h3>
At each node, the algorithm evaluates every possible (feature, threshold) split and picks the one that most reduces IMPURITY in the resulting children. The two common impurity measures:
<ul>
<li><strong>Gini Impurity</strong> - <code>1 - &sum; p&#7522;&sup2;</code>, the probability of misclassifying a randomly picked point if labeled according to the node's class distribution. 0 means the node is perfectly pure (one class only).</li>
<li><strong>Entropy / Information Gain</strong> - <code>-&sum; p&#7522; log&#8322;(p&#7522;)</code>, borrowed from information theory; a split is chosen to maximize the drop in entropy from parent to weighted-average children.</li>
</ul>
Left unconstrained, a tree keeps splitting until every leaf is pure - which usually means memorizing noise. <strong>Tree Pruning</strong> (via <code>max_depth</code>, <code>min_samples_split</code>, <code>min_samples_leaf</code>, or post-hoc cost-complexity pruning) trades a small amount of training accuracy for much better generalization.`,
            codeExamples: [
                `# Manually computing Gini impurity for a node, to see exactly what the tree optimizes
import numpy as np

def gini(labels):
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / counts.sum()
    return 1 - np.sum(probs ** 2)

parent = np.array([0, 0, 0, 1, 1, 1, 1, 1])   # 3 class-0, 5 class-1
left   = np.array([0, 0, 0])                    # a candidate split's left child
right  = np.array([1, 1, 1, 1, 1])              # a candidate split's right child

parent_gini = gini(parent)
weighted_child_gini = (len(left) / len(parent)) * gini(left) + (len(right) / len(parent)) * gini(right)

print(f"Parent Gini: {parent_gini:.3f}")
print(f"Weighted child Gini after split: {weighted_child_gini:.3f}")
print(f"Gini gain from this split: {parent_gini - weighted_child_gini:.3f}")
# OUTPUT:
# Parent Gini: 0.469
# Weighted child Gini after split: 0.000
# Gini gain from this split: 0.469   (a perfect split - both children end up pure)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why doesn't a Decision Tree need feature scaling, unlike Logistic Regression or SVM?</td><td>Trees split on a single feature's THRESHOLD at a time (e.g. "x > 5"), which only depends on the relative ORDER of values, not their absolute scale - unlike distance- or gradient-based models where feature magnitude directly affects the result</td></tr>
<tr class='text-center'><td>What's the difference between Gini Impurity and Entropy for choosing splits?</td><td>Both measure node "impurity" and usually pick very similar splits in practice; Gini is slightly cheaper to compute (no logarithm) and is scikit-learn's default, while Entropy/Information Gain has roots in information theory and is used by algorithms like ID3/C4.5</td></tr>
<tr class='text-center'><td>Why does an unpruned Decision Tree tend to overfit?</td><td>Left unconstrained, it keeps splitting until every leaf is pure (100% one class) - which usually means it has carved out a tiny region of feature space to fit individual noisy training points rather than the real underlying pattern, hurting generalization to new data</td></tr>
</table>`
        }
    ]
};
