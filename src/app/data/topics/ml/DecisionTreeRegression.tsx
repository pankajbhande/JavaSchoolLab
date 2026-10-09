import { Topic } from '../../coreJava';

export const decisionTreeRegression: Topic = {
    id: 'ml-regression-decision-tree-regression',
    name: 'Decision Tree Regression',
    beginner: [
        {
            content: `<h3>Splitting Data to Predict a Number Instead of a Class</h3>
A <strong>Decision Tree Regressor</strong> adapts the same if/else splitting logic as a classification tree, but changes what it optimizes for and what it predicts at the end.
<ul>
<li>A classification tree picks splits to minimize <strong>Gini impurity</strong> or <strong>entropy</strong> (how mixed the classes are in a node); a regression tree instead picks splits to minimize <strong>variance</strong> (how spread out the numeric target values are) within each resulting group.</li>
<li>Instead of predicting a CLASS LABEL at each leaf, a regression tree predicts the <strong>average target value</strong> of all the training examples that landed in that leaf.</li>
<li>Example: predicting delivery time by first splitting on <code>distance</code>, then <code>traffic level</code>, then <code>time of day</code> - every delivery that lands in the same leaf (say, "long distance, heavy traffic, evening") gets the same predicted time: the average delivery time of the training deliveries that matched that exact same path down the tree.</li>
</ul>`,
            codeExamples: [
                `from sklearn.tree import DecisionTreeRegressor
import numpy as np

# distance (km), traffic level (0=low,1=medium,2=high) -> delivery time (minutes)
X = np.array([[2, 0], [3, 0], [8, 1], [9, 1], [15, 2], [16, 2]])
y = np.array([12, 14, 28, 30, 55, 58])

tree = DecisionTreeRegressor(max_depth=2, random_state=0)
tree.fit(X, y)

new_delivery = np.array([[8.5, 1]])  # 8.5 km, medium traffic
prediction = tree.predict(new_delivery)
print(f"Predicted delivery time: {prediction[0]:.1f} minutes")
# OUTPUT (typical): Predicted delivery time: 29.0 minutes`
            ],
            codeExplanations: [
                `Six training deliveries are grouped into three natural pairs by distance and traffic level, each pair with similar delivery times. <code>DecisionTreeRegressor</code> learns splits (e.g. on distance thresholds) that separate these groups so the target values within each resulting leaf are as tightly clustered (low variance) as possible. Predicting for a new delivery of 8.5 km with medium traffic routes it into the leaf containing the two similar training deliveries (28 and 30 minutes), and the tree's prediction (29.0) is exactly their average - illustrating the core mechanic: a regression tree's leaf prediction is always the mean target value of whichever training rows ended up there.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Classification trees and regression trees share the same recursive-splitting SKELETON, but swapping the splitting criterion from impurity (Gini/entropy) to variance changes what "a good split" means in a way that's easy to underappreciate. A split is good for a classification tree if it separates classes into purer groups; a split is good for a regression tree if it separates numeric values into groups that are each more TIGHTLY CLUSTERED around their own average than the parent group was. This distinction matters because it changes what the tree can and cannot represent well.
<ul>
<li>Because every leaf's prediction is a single constant (the average of training rows that landed there), a regression tree's overall prediction surface is inherently <strong>piecewise-constant</strong> - it looks like a series of flat, blocky steps rather than a smooth curve, no matter how deep the tree grows.</li>
<li>This "staircase" pattern is a direct, visible consequence of the leaf-averaging mechanism, and it is one of the clearest visual/practical differences between a regression tree and a linear or polynomial regression model, which instead produce smooth, continuously-varying predictions.</li>
</ul>
<h3>Real-World Example</h3>
A food delivery company wants to predict delivery time for a new order. A Decision Tree Regressor first splits on <code>distance</code> (short trips vs. long trips behave very differently), then within each distance group splits further on <code>traffic level</code>, then within THAT splits on <code>time of day</code> (rush hour vs. off-peak). Every order that ends up following the identical path down the tree (e.g. "long distance, heavy traffic, evening rush hour") receives the exact same predicted delivery time: the average delivery time of every historical order that matched that same combination of conditions. This gives dispatchers an interpretable, rule-based estimate ("orders like this typically take about 47 minutes") without needing to understand any underlying mathematical formula - but it also means two orders that are almost identical except one is 0.1 km on the wrong side of a split boundary can receive noticeably different predicted times, since the model has no notion of a smooth, gradual transition between leaves.`,
            codeExamples: [
                `# Visualizing the "staircase" prediction pattern of a regression tree vs. a smooth linear fit
import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
distance = np.linspace(1, 20, 50)
delivery_time = 5 + 2.8 * distance + rng.normal(0, 2, 50)
X = distance.reshape(-1, 1)

tree = DecisionTreeRegressor(max_depth=3, random_state=0).fit(X, delivery_time)
linear = LinearRegression().fit(X, delivery_time)

query_points = np.array([[5.0], [5.5], [6.0], [10.0], [10.5], [11.0]])
tree_preds = tree.predict(query_points)
linear_preds = linear.predict(query_points)
for d, t, l in zip(query_points.ravel(), tree_preds, linear_preds):
    print(f"distance={d:5.1f}  tree prediction={t:6.2f}  linear prediction={l:6.2f}")
# OUTPUT (typical):
# distance=  5.0  tree prediction= 19.80  linear prediction= 19.90
# distance=  5.5  tree prediction= 19.80  linear prediction= 21.30   <- tree gives IDENTICAL output (flat step)
# distance=  6.0  tree prediction= 19.80  linear prediction= 22.70   <- still the same leaf/step
# distance= 10.0  tree prediction= 34.10  linear prediction= 33.50
# distance= 10.5  tree prediction= 34.10  linear prediction= 34.90   <- again flat within the leaf
# distance= 11.0  tree prediction= 39.70  linear prediction= 36.30   <- jumps abruptly to the next leaf`
            ],
            codeExplanations: [
                `A clean, roughly linear delivery-time-vs-distance relationship is generated, and both a shallow <code>DecisionTreeRegressor</code> and a <code>LinearRegression</code> are fit on it. Querying closely-spaced distance values (5.0, 5.5, 6.0, then 10.0, 10.5, 11.0) shows the linear model's predictions changing smoothly and gradually with distance, while the tree's predictions stay EXACTLY constant across several nearby query points (since they all fall in the same leaf) before jumping abruptly to a new constant value once a split boundary is crossed. This flat-then-jump pattern, repeated across the input range, is exactly the "staircase" prediction surface described above - a direct visual consequence of every leaf predicting one fixed average value.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Naturally captures nonlinear relationships without feature engineering</strong> - unlike linear or polynomial regression, no manual polynomial terms need to be added; the tree finds its own splits and thresholds directly from the data.</li>
<li><strong>Highly interpretable rule structure</strong> - a dispatcher or analyst can trace the exact sequence of if/else conditions ("distance > 12 km, then traffic = high, then evening") that led to any specific prediction, which is much easier to explain to a non-technical stakeholder than a regression coefficient.</li>
<li><strong>Requires no feature scaling</strong> - since splits are just threshold comparisons on raw feature values, it doesn't matter whether distance is measured in km or miles, or whether traffic level is 0-2 or 0-100; scaling has no effect on the tree's structure.</li>
<li><strong>Handles nonlinear interactions between features automatically</strong> - because later splits happen within the groups created by earlier splits, the tree naturally represents "the effect of traffic level depends on distance" without needing an explicit interaction term.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Blocky, non-smooth "staircase" predictions</strong> - as demonstrated above, two nearly identical inputs straddling a split boundary can receive noticeably different predictions, while two very different inputs within the same leaf receive identical predictions - a poor match for relationships that are genuinely smooth and continuous.</li>
<li><strong>Cannot extrapolate beyond the training range</strong> - since every leaf predicts a fixed average drawn from training data, a regression tree predicts the SAME value for any input beyond the most extreme training example in that direction (e.g. any distance beyond the longest delivery seen in training gets the same prediction as that longest delivery), unlike a linear model which would keep extending its trend.</li>
<li><strong>Prone to overfitting if grown too deep</strong> - an unconstrained tree can keep splitting until every leaf contains just one or two training examples, perfectly memorizing training data's noise while generalizing poorly; this is typically controlled with <code>max_depth</code>, <code>min_samples_leaf</code>, or pruning.</li>
<li><strong>High variance / instability</strong> - small changes in the training data can lead to a very different tree structure and different splits, since split choices greedily depend on all the data that came before them; this instability is precisely what motivates ensembling many trees together (see Random Forest Regression).</li>
</ul>`,
            codeExamples: [
                `# Overfitting risk: comparing shallow vs. deep regression trees on train vs. test error
import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
distance = rng.uniform(1, 20, 100)
traffic = rng.integers(0, 3, 100)
delivery_time = 5 + 2.8 * distance + 6 * traffic + rng.normal(0, 3, 100)
X = np.column_stack([distance, traffic])
X_train, X_test, y_train, y_test = train_test_split(X, delivery_time, test_size=0.3, random_state=0)

for depth in [2, None]:
    tree = DecisionTreeRegressor(max_depth=depth, random_state=0).fit(X_train, y_train)
    train_mse = mean_squared_error(y_train, tree.predict(X_train))
    test_mse = mean_squared_error(y_test, tree.predict(X_test))
    label = f"max_depth={depth}" if depth else "max_depth=None (unconstrained)"
    print(f"{label:32s} train_mse={train_mse:6.2f}  test_mse={test_mse:7.2f}")
# OUTPUT (typical):
# max_depth=2                     train_mse= 18.40  test_mse=  21.10
# max_depth=None (unconstrained)  train_mse=  0.90  test_mse=  47.60   <- badly overfits`
            ],
            codeExplanations: [
                `Delivery time is simulated from distance and traffic level with some noise, then split into train/test sets. A shallow tree (<code>max_depth=2</code>) and a fully unconstrained tree (<code>max_depth=None</code>, allowed to split until leaves are pure/tiny) are both fit on the training data. The unconstrained tree achieves near-zero training error (it has essentially memorized the training rows by creating a leaf for almost every unique combination), but its test error is more than double the shallow tree's - a clear demonstration that letting a regression tree grow without limit causes it to fit noise in the training data rather than the genuine underlying relationship, which is exactly why depth-limiting parameters are standard practice.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a regression tree's splitting criterion differ from a classification tree's?</td><td>A classification tree chooses splits to minimize impurity measures like Gini or entropy (how mixed the class labels are within a group); a regression tree instead chooses splits to minimize variance (how spread out the numeric target values are) within each resulting group, since there are no discrete classes to separate</td></tr>
<tr class='text-center'><td>What does a regression tree predict at a leaf node, and why does this produce a "staircase" prediction surface?</td><td>It predicts the average target value of all training examples that fell into that leaf; since every input routed to the same leaf receives that identical constant prediction, and predictions jump abruptly at split boundaries between leaves, the overall prediction surface is piecewise-constant - flat segments connected by sudden jumps - rather than the smooth, continuously-varying curve a linear or polynomial model produces</td></tr>
<tr class='text-center'><td>Why can a regression tree not extrapolate beyond the range of its training data?</td><td>Because leaves only ever predict the average of training rows that reached them, any new input beyond the most extreme training example in a given direction still falls into the same boundary leaf and receives that leaf's fixed average - the tree has no mechanism analogous to a linear model's slope to keep extending a trend past the data it was trained on</td></tr>
</table>`
        }
    ]
};
