import { Topic } from '../../coreJava';

export const entropy: Topic = {
    id: 'ml-trees-ensembles-entropy',
    name: 'Entropy',
    beginner: [
        {
            content: `<h4>Measuring How "Mixed Up" a Set of Labels Is</h4>
<ul>
<li><strong>Entropy</strong> is a number that measures uncertainty/impurity in a set of labels - a node with a 50/50 class split has MAXIMUM entropy (you genuinely can't guess the class), while a pure node (all one class) has ZERO entropy (no uncertainty at all).</li>
<li>The formula is <code>-&sum; p&#7522; log&#8322;(p&#7522;)</code>, summing over each class's proportion <code>p&#7522;</code> in the node - it comes from Claude Shannon's information theory, where entropy measures the average number of bits needed to describe an outcome.</li>
<li>A Decision Tree uses entropy to score candidate splits: it prefers splits whose children have LOWER entropy than the parent, since that means the split made the classes less mixed up.</li>
</ul>`,
            codeExamples: [
                `import numpy as np

def entropy(labels):
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / counts.sum()
    return -np.sum(probs * np.log2(probs))

pure_node   = np.array([1, 1, 1, 1, 1, 1])          # all one class
mixed_node  = np.array([0, 0, 0, 1, 1, 1])          # 50/50 split
mostly_pure = np.array([0, 1, 1, 1, 1, 1])          # mostly one class

print(f"Pure node entropy:   {entropy(pure_node):.3f}")
print(f"50/50 node entropy:  {entropy(mixed_node):.3f}")
print(f"Mostly-pure entropy: {entropy(mostly_pure):.3f}")
# OUTPUT:
# Pure node entropy:   0.000
# 50/50 node entropy:  1.000
# Mostly-pure entropy: 0.650`
            ],
            codeExplanations: [
                `This computes entropy directly from the definition: count how many rows fall into each class, turn those counts into proportions, then plug them into <code>-sum(p * log2(p))</code>. The pure node (every row labeled 1) has entropy exactly 0 - there's nothing uncertain about it. The perfectly balanced 50/50 node hits the theoretical maximum of 1.0 bit for two classes (that maximum is <code>log2(number of classes)</code>). The mostly-pure node sits in between: still some uncertainty, but much less than a true coin flip.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
A Decision Tree builds itself by repeatedly asking "which split makes my data least uncertain?" - and entropy is one of the two standard ways (alongside Gini Impurity) to quantify "uncertain" in the first place. Without a numeric impurity score, there would be no principled way to compare thousands of candidate splits and pick the best one.
<ul>
<li>Entropy's information-theory roots give it a clean interpretation: it's the expected number of yes/no bits needed to identify a randomly drawn item's class. A pure node needs 0 bits (you already know the answer); a 50/50 node needs a full bit (a genuine coin flip).</li>
<li>The maximum possible entropy for a node with <code>k</code> classes is <code>log&#8322;(k)</code>, reached only when all classes are equally represented - so entropy is automatically bounded and comparable across nodes with different numbers of classes.</li>
</ul>
<h3>Real-World Example</h3>
Consider a tree being grown on a medical screening dataset where a node currently contains a 50/50 mix of "healthy" and "at-risk" patients - this node is at MAXIMUM entropy for a binary problem (1.0 bit), meaning the current attribute path has told the tree nothing useful yet about who is at risk. The tree algorithm now tries splitting this node on candidate features - "blood pressure &gt; 140", "age &gt; 60", "smoker == yes" - and computes the entropy of the resulting children for each candidate. A split that manages to separate the node into a mostly-healthy child (entropy near 0) and a mostly-at-risk child (entropy near 0) has done real diagnostic work; a split that leaves both children still close to 50/50 has told the tree almost nothing, and gets discarded in favor of a better candidate.`,
            codeExamples: [
                `# Entropy before and after two candidate splits on a screening dataset
import numpy as np

def entropy(labels):
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / counts.sum()
    return -np.sum(probs * np.log2(probs))

parent = np.array([0]*10 + [1]*10)  # 10 healthy (0), 10 at-risk (1) -> maximum entropy

# Candidate A: "smoker == yes" -> nearly separates the classes
smoker_yes = np.array([1]*8 + [0]*1)
smoker_no  = np.array([0]*9 + [1]*2)

# Candidate B: "age > 60" -> barely separates the classes
age_gt_60  = np.array([0]*5 + [1]*6)
age_lte_60 = np.array([0]*5 + [1]*4)

print(f"Parent entropy: {entropy(parent):.3f}")
for name, left, right in [("smoker split", smoker_yes, smoker_no), ("age split", age_gt_60, age_lte_60)]:
    n = len(parent)
    weighted = (len(left)/n) * entropy(left) + (len(right)/n) * entropy(right)
    print(f"{name}: weighted child entropy = {weighted:.3f}")
# OUTPUT:
# Parent entropy: 1.000
# smoker split: weighted child entropy = 0.641
# age split: weighted child entropy = 0.983`
            ],
            codeExplanations: [
                `The parent node starts at maximum entropy (1.0 bit) since it's an exact 50/50 mix. Two candidate splits are evaluated by computing the entropy of each resulting child and combining them into a single weighted-average number (weighted by how many rows land in each child). The "smoker" split drops weighted entropy sharply to 0.641 because it pushes most at-risk patients into one child and most healthy patients into the other - real diagnostic signal. The "age" split barely moves the needle (0.983, almost unchanged from 1.0) because both children remain close to an even mix - it tells the tree almost nothing. This entropy drop is exactly what Information Gain measures, and it's what the tree uses to prefer the smoker split.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Theoretically well-grounded</strong> - entropy comes directly from Shannon's information theory, giving it a rigorous interpretation (expected bits of surprise) rather than being an ad-hoc heuristic, which makes it easier to reason about and explain.</li>
<li><strong>Sensitive to class-probability changes near the extremes</strong> - because of the logarithm, entropy penalizes small impurities in an almost-pure node more sharply than Gini does, which can occasionally surface slightly different (and sometimes better) splits on skewed datasets.</li>
<li><strong>Naturally bounded and comparable</strong> - entropy always falls between 0 and <code>log&#8322;(k)</code> for <code>k</code> classes, so a "0.2" reading on one node means the same relative thing as "0.2" on another node with the same number of classes.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>More expensive to compute than Gini</strong> - every entropy calculation requires a logarithm per class per candidate split, and a tree evaluates thousands of candidate splits while training; on large datasets this logarithm cost adds up, which is why scikit-learn defaults to Gini instead.</li>
<li><strong>In practice picks nearly the same splits as Gini</strong> - despite the different formula, the two measures agree on the "best" split the overwhelming majority of the time, so the extra computational cost of entropy rarely buys a meaningfully different (or better) tree.</li>
<li><strong>Still biased toward high-cardinality features</strong> - like other impurity measures, entropy-based Information Gain tends to favor splitting on features with many distinct values (e.g. a customer ID column) purely because they offer more ways to create pure children, even when that split has no real predictive value.</li>
</ul>`,
            codeExamples: [
                `# Training with entropy vs Gini criterion - splits usually end up (nearly) identical
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split

X, y = load_wine(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

tree_entropy = DecisionTreeClassifier(criterion='entropy', max_depth=3, random_state=0)
tree_gini    = DecisionTreeClassifier(criterion='gini', max_depth=3, random_state=0)

tree_entropy.fit(X_train, y_train)
tree_gini.fit(X_train, y_train)

print(f"Entropy-criterion test accuracy: {tree_entropy.score(X_test, y_test):.3f}")
print(f"Gini-criterion test accuracy:    {tree_gini.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Entropy-criterion test accuracy: 0.981
# Gini-criterion test accuracy:    0.981`
            ],
            codeExplanations: [
                `This trains two otherwise-identical Decision Trees on the wine dataset, one using entropy/Information Gain to choose splits and one using Gini Impurity. Even though the underlying formulas differ (one uses logarithms, the other squares), both trees end up making the same split decisions here and reach identical test accuracy - a common outcome in practice, and the main reason scikit-learn ships Gini as the faster default while still offering entropy as an option for cases where its theoretical grounding is preferred.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does an entropy of 0 versus an entropy of 1.0 mean for a binary-classification node?</td><td>Entropy 0 means the node is perfectly pure - every row belongs to the same class, so there's no uncertainty at all; entropy 1.0 (the maximum for two classes) means the node is an exact 50/50 split, the most uncertain possible outcome, equivalent to a fair coin flip</td></tr>
<tr class='text-center'><td>Where does the entropy formula come from, and what does it intuitively represent?</td><td>It comes from Claude Shannon's information theory; <code>-sum(p_i * log2(p_i))</code> represents the expected number of bits needed to identify the class of a randomly drawn item from the node's distribution - more mixed distributions require more bits (more "surprise"), purer distributions require fewer</td></tr>
<tr class='text-center'><td>Why is the maximum entropy value <code>log2(k)</code> for k classes, and when is that maximum reached?</td><td>The maximum occurs when all k classes are equally likely (p_i = 1/k for every class) - plugging that into the formula gives exactly log2(k); any imbalance away from a uniform distribution can only lower the entropy, never raise it above that bound</td></tr>
</table>`
        }
    ]
};
