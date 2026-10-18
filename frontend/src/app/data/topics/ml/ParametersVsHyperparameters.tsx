import { Topic } from '../../coreJava';

export const parametersVsHyperparameters: Topic = {
    id: 'ml-fundamentals-parameters-vs-hyperparameters',
    name: 'Parameters vs Hyperparameters',
    beginner: [
        {
            content: `<h4>What the Model Learns vs. What You Decide For It</h4>
<ul>
<li>A <strong>Parameter</strong> is a value LEARNED automatically from the training data during training - e.g. the weights (coefficients) of a Linear Regression line, adjusted step by step by an algorithm like gradient descent until they fit the data well.</li>
<li>A <strong>Hyperparameter</strong> is a value SET by the practitioner BEFORE training starts, that controls HOW the learning process happens - e.g. the learning rate, the number of trees in a Random Forest, or <code>K</code> in K-Nearest-Neighbors.</li>
<li>The key distinction: a single training run can discover good parameters on its own, but it cannot discover good hyperparameters on its own - those have to be chosen (or searched over) from OUTSIDE the training process itself.</li>
</ul>`,
            codeExamples: [
                `# Parameters (learned) vs hyperparameters (set by you) in a Linear Regression model
import numpy as np
from sklearn.linear_model import SGDRegressor

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, (100, 1))
y = 3 * X.ravel() + 7 + rng.normal(0, 1, 100)   # true relationship: y = 3x + 7 (plus noise)

# learning_rate and max_iter are HYPERPARAMETERS - chosen by us, before training
model = SGDRegressor(learning_rate="constant", eta0=0.01, max_iter=1000, random_state=0)
model.fit(X, y)

# coef_ and intercept_ are PARAMETERS - learned automatically FROM the data
print(f"Learned parameter (weight):    {model.coef_[0]:.3f}   (true value was 3)")
print(f"Learned parameter (intercept): {model.intercept_[0]:.3f}   (true value was 7)")
print(f"Hyperparameter used (learning rate): 0.01")
print(f"Hyperparameter used (max iterations): 1000")
# OUTPUT (typical):
# Learned parameter (weight):    2.978   (true value was 3)
# Learned parameter (intercept): 6.891   (true value was 7)
# Hyperparameter used (learning rate): 0.01
# Hyperparameter used (max iterations): 1000`
            ],
            codeExplanations: [
                `<code>learning_rate</code>, <code>eta0</code>, and <code>max_iter</code> are set in the <code>SGDRegressor(...)</code> constructor call, BEFORE <code>fit</code> is ever run - these are hyperparameters, chosen by the person writing the code, and they control how the gradient descent search behaves. After <code>model.fit(X, y)</code> runs, <code>model.coef_</code> and <code>model.intercept_</code> hold the parameters - the actual slope and intercept the algorithm discovered by searching the data, landing close to the true underlying values of 3 and 7 that generated the data.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Confusing the two leads to a fundamental mistake: trying to "train" a hyperparameter the same way you train a parameter (e.g. letting the model pick its own learning rate mid-training) usually doesn't work, because hyperparameters shape the SEARCH PROCESS itself - you can't optimize the search process using the same search process.</li>
<li>This is exactly why the validation set exists: since a single training run can't tell you the best hyperparameters on its own, you train several times with DIFFERENT hyperparameter values and use validation performance to pick the winner - a process called <strong>hyperparameter tuning</strong> (grid search, random search, or more advanced methods like Bayesian optimization).</li>
<li>Every ML algorithm has a different set of "knobs" that are hyperparameters vs. values that are parameters - recognizing which is which for a given model (e.g. <code>K</code> in KNN is a hyperparameter with no parameters at all in the traditional sense, since KNN doesn't "train" a function) is essential to knowing what you're allowed to tune vs. what the algorithm will handle for you.</li>
</ul>
<h3>Real-World Example</h3>
A team trains a Random Forest to detect credit card fraud.
<ul>
<li><strong>Hyperparameters</strong> chosen up front, before any training: <code>n_estimators</code> (how many trees, e.g. 200), <code>max_depth</code> (how deep each tree can grow, e.g. 10), and <code>min_samples_leaf</code> (minimum data points per leaf, e.g. 5). These are business/engineering decisions constrained by compute budget and desired model complexity.</li>
<li><strong>Parameters</strong> that get learned automatically once training starts: the exact feature and threshold each of the 200 trees splits on at every node (e.g. "transaction_amount &gt; $412.50") - these are discovered entirely from the training data and the team never sets them directly.</li>
<li>If fraud rates change next quarter, the team might re-tune <code>max_depth</code> by trying several values against a validation set - but they never need to manually set what threshold a specific tree splits on; that's the model's job, learned fresh every time it's retrained on new data.</li>
</ul>`,
            codeExamples: [
                `# Tuning a hyperparameter (n_estimators, max_depth) using a validation set,
# then inspecting the learned parameters (the actual split thresholds) of the winning model
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
from sklearn.metrics import accuracy_score

X, y = make_classification(n_samples=2000, n_features=10, random_state=0)
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.25, random_state=0)

best_score, best_params = 0, None
for n_estimators in [50, 200]:
    for max_depth in [3, 10]:
        model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=0)
        model.fit(X_train, y_train)
        score = accuracy_score(y_val, model.predict(X_val))
        print(f"n_estimators={n_estimators:3d}  max_depth={max_depth:2d}  val_accuracy={score:.3f}")
        if score > best_score:
            best_score, best_params = score, (n_estimators, max_depth)

print(f"\\nBest hyperparameters: n_estimators={best_params[0]}, max_depth={best_params[1]}")

# Now inspect a PARAMETER: the first split threshold the first tree actually learned
final_model = RandomForestClassifier(n_estimators=best_params[0], max_depth=best_params[1], random_state=0)
final_model.fit(X_train, y_train)
first_tree = final_model.estimators_[0]
print(f"Learned split threshold of tree #0's root node: {first_tree.tree_.threshold[0]:.3f}")
# OUTPUT (typical):
# n_estimators= 50  max_depth= 3  val_accuracy=0.868
# n_estimators= 50  max_depth=10  val_accuracy=0.912
# n_estimators=200  max_depth= 3  val_accuracy=0.870
# n_estimators=200  max_depth=10  val_accuracy=0.918
#
# Best hyperparameters: n_estimators=200, max_depth=10
# Learned split threshold of tree #0's root node: 0.184`
            ],
            codeExplanations: [
                `The nested loop trains four different Random Forests, each with a different combination of the HYPERPARAMETERS <code>n_estimators</code> and <code>max_depth</code>, and compares them using validation accuracy - this is hyperparameter tuning: since no single training run can pick its own best <code>max_depth</code>, several full training runs are needed to search over candidate values from the outside. After the winning hyperparameters are chosen, <code>first_tree.tree_.threshold[0]</code> reads off an actual learned PARAMETER - the specific numeric split value one particular tree discovered on its own from the training data, something never set directly by the code.`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<ul>
<li><strong>Advantage of hyperparameters - control over the bias-variance tradeoff</strong> - deliberately setting <code>max_depth</code> low or a strong regularization strength lets a practitioner intentionally simplify a model to fight overfitting, something the model cannot decide to do for itself mid-training.</li>
<li><strong>Advantage of parameters being learned automatically</strong> - nobody has to hand-craft the actual decision boundary or regression line; for a model with millions of parameters (a deep neural network), manually setting each one would be completely impossible, yet gradient descent finds workable values automatically.</li>
<li><strong>Disadvantage - hyperparameter search is expensive</strong> - trying many combinations (grid search over 5 hyperparameters with 5 values each is 5^5 = 3,125 full training runs) can be very costly in time and compute, especially for large models.</li>
<li><strong>Disadvantage - poor hyperparameter choices can make a model unusable regardless of good data</strong> - e.g. a learning rate set far too high can make gradient descent diverge (the loss explodes instead of shrinking) no matter how clean and plentiful the training data is.</li>
</ul>`,
            codeExamples: [
                `# A bad hyperparameter choice (learning rate too high) breaks training regardless of data quality
import numpy as np
from sklearn.linear_model import SGDRegressor
from sklearn.exceptions import ConvergenceWarning
import warnings

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, (200, 1))
y = 3 * X.ravel() + 7 + rng.normal(0, 0.5, 200)   # clean, well-behaved data

for eta0 in [0.001, 0.01, 5.0]:   # last one is a badly chosen, way too large learning rate
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", ConvergenceWarning)
        model = SGDRegressor(learning_rate="constant", eta0=eta0, max_iter=200, random_state=0)
        model.fit(X, y)
    print(f"eta0={eta0:<6}  learned weight={model.coef_[0]:>10.2f}  (true weight is 3)")
# OUTPUT (typical):
# eta0=0.001   learned weight=      2.31  (still converging, too slow)
# eta0=0.01    learned weight=      2.98  (converged well)
# eta0=5.0     learned weight=-48213.77  (diverged - the hyperparameter alone ruined training)`
            ],
            codeExplanations: [
                `The exact same clean dataset is used for all three runs; only the hyperparameter <code>eta0</code> (the learning rate) changes. A learning rate that's too small (0.001) makes the parameter search converge too slowly to reach a good answer in the allotted iterations, while one that's far too large (5.0) causes the gradient descent updates to overshoot repeatedly and diverge to a nonsensical weight - demonstrating that data quality alone can't save a model from a poorly chosen hyperparameter.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the core difference between a parameter and a hyperparameter?</td><td>A parameter is learned automatically from training data during a training run (e.g. the weights of a linear model); a hyperparameter is set by the practitioner before training starts and controls how the learning process itself behaves (e.g. learning rate, number of trees). A single training run can discover parameters but cannot discover its own hyperparameters</td></tr>
<tr class='text-center'><td>Give an example of a hyperparameter and the corresponding parameter for the same algorithm.</td><td>For a Random Forest: n_estimators (number of trees) and max_depth are hyperparameters chosen up front; the actual feature and threshold each tree learns to split on at every node are parameters, learned automatically from the training data</td></tr>
<tr class='text-center'><td>How do you choose good hyperparameter values if the model can't learn them itself?</td><td>By training multiple models with different hyperparameter values and comparing their performance on a validation set (grid search, random search, or more advanced search strategies) - the choice comes from an outside search process across several full training runs, not from within a single training run</td></tr>
</table>`
        }
    ]
};
