import { Topic } from '../../coreJava';

export const gradientBoosting: Topic = {
    id: 'ml-classification-gradient-boosting',
    name: 'Gradient Boosting',
    beginner: [
        {
            content: `<h4>Building an Ensemble One Correction at a Time</h4>
<ul>
<li><strong>Gradient Boosting</strong> builds an ensemble of small, weak Decision Trees SEQUENTIALLY - unlike Random Forest, which builds many trees in PARALLEL and averages them. Each new tree is trained to predict the ERRORS (residuals) left over by the trees added so far.</li>
<li>The final prediction is the sum of all trees' outputs, each one usually scaled down by a small <strong>learning rate</strong> (e.g. 0.1) so no single tree dominates and the ensemble improves gradually.</li>
<li><strong>XGBoost</strong>, <strong>LightGBM</strong>, and <strong>CatBoost</strong> are the leading real-world implementations of this idea - highly optimized, regularized versions of gradient boosting that consistently win Kaggle competitions on tabular (spreadsheet-like) data.</li>
</ul>`,
            codeExamples: [
                `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

model = GradientBoostingClassifier(
    n_estimators=100,     # number of trees added sequentially
    learning_rate=0.1,    # how much each tree's correction counts
    max_depth=3,          # each tree stays shallow ("weak learner")
    random_state=0
)
model.fit(X_train, y_train)

print(f"Test accuracy: {model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Test accuracy: 0.965`
            ],
            codeExplanations: [
                `This loads the breast-cancer classification dataset and splits it into train/test sets. A GradientBoostingClassifier is created with three key knobs: n_estimators=100 means 100 trees are added one after another; learning_rate=0.1 shrinks each new tree's contribution to the running prediction so the model learns gradually instead of overfitting to the first few trees' corrections; max_depth=3 keeps every individual tree shallow ("weak") since boosting gets its power from combining many weak learners, not from any single strong one. Calling fit() runs the sequential boosting process - tree 1 fits the target directly, tree 2 fits what tree 1 got wrong, tree 3 fits what trees 1+2 together still got wrong, and so on. score() reports accuracy on the held-out test set.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before boosting, practitioners mostly had two options for tabular data: a single Decision Tree (fast but overfits or underfits depending on depth) or Random Forest (averages many independent trees to reduce variance, but each tree still has to be decent on its own and the ensemble can plateau in accuracy).</li>
<li>Neither approach explicitly targets the model's CURRENT mistakes. If a Random Forest of 500 trees is still wrong on a particular kind of data point, adding tree 501 (trained the same random way) does not specifically address that weakness.</li>
<li>Gradient Boosting solves this by making every new tree a specialist in fixing what came before it - the ensemble's error curve keeps dropping as long as new trees are added (until overfitting sets in), which is why boosted models routinely out-accuracy bagged models like Random Forest on structured/tabular data, e.g. loan default prediction, fraud detection, click-through-rate prediction, and most Kaggle tabular leaderboards.</li>
</ul>
<h3>Real-World Example</h3>
A bank wants to predict whether a loan applicant will DEFAULT, using features like income, credit history length, existing debt, and number of prior late payments.
<ul>
<li>A plain Logistic Regression struggles because the true relationship is nonlinear (e.g. risk spikes sharply only once debt-to-income crosses a threshold AND credit history is short - an interaction, not a straight line).</li>
<li>The bank instead trains an <strong>XGBoost</strong> model: the first few trees quickly learn the broad pattern (high debt-to-income -> higher risk); later trees zoom in on the residual mistakes, such as borderline applicants the earlier trees keep misclassifying, gradually sharpening the decision boundary around exactly those hard cases.</li>
<li>The result, in practice, is a model that beats both logistic regression and a single Random Forest on the bank's historical default data, which is why gradient-boosted trees are the default choice for credit scoring and loan-default models at most fintech companies.</li>
</ul>`,
            codeExamples: [
                `# Loan-default style example, comparing Random Forest vs Gradient Boosting on the same data
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score

rng = np.random.default_rng(0)
n = 2000
income = rng.normal(50000, 15000, n)
debt_to_income = rng.uniform(0, 1, n)
credit_history_years = rng.uniform(0, 20, n)
late_payments = rng.poisson(1.5, n)

# nonlinear/interaction risk rule: risky mainly when high DTI AND short history
risk_score = (debt_to_income > 0.6) & (credit_history_years < 3)
default = (risk_score.astype(int) + (late_payments > 3).astype(int) +
           rng.normal(0, 0.3, n) > 1).astype(int)

X = np.column_stack([income, debt_to_income, credit_history_years, late_payments])
y = default

rf = RandomForestClassifier(n_estimators=200, random_state=0)
gb = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=3, random_state=0)

for name, model in [("RandomForest", rf), ("GradientBoosting", gb)]:
    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
    print(f"{name}: mean accuracy = {scores.mean():.3f}")
# OUTPUT (typical):
# RandomForest: mean accuracy = 0.879
# GradientBoosting: mean accuracy = 0.911`
            ],
            codeExplanations: [
                `This simulates a loan-default dataset where the true risk rule is a NONLINEAR interaction (high debt-to-income AND short credit history together push up risk, plus a separate penalty for frequent late payments) - exactly the kind of pattern a straight line can't capture but trees can. The code builds four features (income, debt-to-income, credit history, late payments), computes a synthetic default label from that interaction rule plus noise, then trains a RandomForestClassifier and a GradientBoostingClassifier on identical data using 5-fold cross-validation for a fair comparison. Because Gradient Boosting's trees are trained sequentially to correct each other's residual mistakes around the tricky interaction boundary, it typically edges out Random Forest's independently-averaged trees on this kind of structured, rule-driven tabular pattern.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Highest accuracy on tabular data</strong> - because each tree explicitly targets remaining errors, boosted ensembles (especially XGBoost/LightGBM/CatBoost) are the most common winning approach in Kaggle competitions on spreadsheet-style data, beating both single trees and Random Forest in most benchmarks.</li>
<li><strong>Handles mixed feature types and missing values well</strong> - e.g. XGBoost natively learns a default direction for missing values at each split, so a real dataset with holes (like some applicants missing a credit-history field) doesn't need heavy imputation.</li>
<li><strong>Flexible loss functions</strong> - because it's optimizing a gradient, boosting can target log-loss for classification, RMSE for regression, or even custom business losses (e.g. asymmetric cost for false negatives in fraud detection), unlike bagging methods that just average.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Prone to overfitting if not tuned</strong> - because each tree chases the previous residuals, too many trees or too high a learning rate can start fitting noise; e.g. leaving n_estimators=1000 with no early stopping on a small, noisy dataset can memorize training quirks and hurt test accuracy.</li>
<li><strong>Sequential training is slower than bagging</strong> - Random Forest's trees can be built in parallel since they're independent, but each boosting tree depends on the one before it, making raw GradientBoostingClassifier training slower (libraries like LightGBM/XGBoost use histogram-based tricks specifically to mitigate this).</li>
<li><strong>More hyperparameters to tune</strong> - learning_rate, n_estimators, max_depth, subsample, and regularization terms all interact; e.g. lowering learning_rate to 0.01 usually needs many more trees to compensate, so tuning is more involved than Random Forest's comparatively forgiving defaults.</li>
<li><strong>Less interpretable than a single tree</strong> - a loan officer can't read "the" decision path the way they could with one shallow Decision Tree, since the prediction is a sum of hundreds of small trees (though tools like SHAP values help explain boosted models after the fact).</li>
</ul>`,
            codeExamples: [
                `# Effect of learning_rate and n_estimators on overfitting - the key tuning tradeoff in boosting
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=500, n_features=20, n_informative=8, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

configs = [
    dict(n_estimators=50,  learning_rate=0.3),
    dict(n_estimators=100, learning_rate=0.1),
    dict(n_estimators=500, learning_rate=0.1),   # too many trees, high learning rate risk
]

for cfg in configs:
    model = GradientBoostingClassifier(max_depth=3, random_state=0, **cfg)
    model.fit(X_train, y_train)
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"{cfg}  train={train_acc:.3f}  test={test_acc:.3f}")
# OUTPUT (typical):
# {'n_estimators': 50, 'learning_rate': 0.3}   train=0.966  test=0.887
# {'n_estimators': 100, 'learning_rate': 0.1}  train=0.980  test=0.900
# {'n_estimators': 500, 'learning_rate': 0.1}  train=1.000  test=0.873   <- overfit: train perfect, test drops`
            ],
            codeExplanations: [
                `This directly demonstrates the overfitting risk called out above. It builds a synthetic classification dataset and trains three GradientBoostingClassifier configurations that vary n_estimators (how many trees) and learning_rate (how much each tree counts). The first config uses few trees with a higher learning rate; the second is a balanced default; the third pushes to 500 trees, which lets the model keep chasing training-set residuals well past the point of diminishing returns. Printing both train and test accuracy for each config makes the overfitting visible directly: train accuracy climbs toward 1.0 as more trees are added, while test accuracy peaks in the middle configuration and then drops for the 500-tree run - exactly the pattern that motivates early stopping and learning-rate/n_estimators tuning in real boosting pipelines.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - The Gradient in Gradient Boosting</h3>
Gradient Boosting is best understood as gradient descent, but in FUNCTION space instead of parameter space:
<ul>
<li>Start with a simple initial prediction F&#8320;(x) (e.g. the average target value).</li>
<li>At each stage m, compute the NEGATIVE GRADIENT of the loss function with respect to the current predictions - for squared-error loss this is just the residual <code>y - F(x)</code>; for log-loss (classification) it's a more complex "pseudo-residual".</li>
<li>Fit a new small tree h&#8340;(x) to PREDICT that negative gradient (i.e. predict "in which direction and by how much should predictions move to reduce loss").</li>
<li>Update: <code>F&#8340;(x) = F&#8340;&#8331;&#8321;(x) + &eta; &middot; h&#8340;(x)</code>, where &eta; is the learning rate.</li>
<li>Repeat for n_estimators rounds. <strong>XGBoost</strong> extends this with a second-order (Newton) approximation of the loss plus explicit L1/L2 regularization on leaf weights, and <strong>LightGBM</strong> speeds up split-finding with histogram binning and leaf-wise (rather than level-wise) tree growth - which is why they typically train faster and generalize slightly better than plain scikit-learn GradientBoostingClassifier at scale.</li>
</ul>`,
            codeExamples: [
                `# Manually replicating one boosting round to show exactly what "fitting the residual" means
import numpy as np
from sklearn.tree import DecisionTreeRegressor

rng = np.random.default_rng(0)
X = np.linspace(0, 10, 50).reshape(-1, 1)
y = np.sin(X.ravel()) + rng.normal(0, 0.1, 50)   # true regression target

learning_rate = 0.3
F = np.full(y.shape, y.mean())   # F0(x): initial prediction = mean of y

for round_num in range(3):
    residual = y - F                              # negative gradient for squared error
    tree = DecisionTreeRegressor(max_depth=2, random_state=0)
    tree.fit(X, residual)                          # fit a weak learner to the residual
    F = F + learning_rate * tree.predict(X)        # update the running prediction
    mse = np.mean((y - F) ** 2)
    print(f"round {round_num + 1}: MSE after update = {mse:.4f}")
# OUTPUT (typical):
# round 1: MSE after update = 0.3120
# round 2: MSE after update = 0.1780
# round 3: MSE after update = 0.1050    <- error keeps shrinking as trees correct residuals`
            ],
            codeExplanations: [
                `This code manually implements 3 rounds of gradient boosting from scratch (rather than calling GradientBoostingClassifier) to make the "gradient" mechanics concrete. F starts as a flat prediction equal to the mean of y - the simplest possible model. In each round, residual = y - F is exactly the negative gradient of squared-error loss with respect to the current predictions - it tells the algorithm how wrong it currently is and in which direction to correct. A small DecisionTreeRegressor (max_depth=2, a genuinely "weak" learner) is fit to predict that residual, then F is updated by adding learning_rate times the new tree's prediction - a small step in the direction that reduces error, mirroring gradient descent. Printing MSE after each round shows it decreasing monotonically as more trees are added, which is the core mechanism every real boosting library (scikit-learn, XGBoost, LightGBM, CatBoost) automates and heavily optimizes.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Gradient Boosting differ from Random Forest?</td><td>Random Forest builds many independent trees in parallel on bootstrapped samples and averages them to reduce VARIANCE (bagging); Gradient Boosting builds trees SEQUENTIALLY, where each new tree is trained specifically to correct the residual errors of the ensemble built so far, primarily reducing BIAS</td></tr>
<tr class='text-center'><td>What does the learning_rate hyperparameter control, and why not just set it high?</td><td>It scales down each new tree's contribution to the running prediction; a high learning rate makes the model converge fast but risks overshooting and overfitting to noisy residuals, while a low learning rate (e.g. 0.01-0.1) learns more gradually and generalizes better, usually at the cost of needing more trees (higher n_estimators) to reach the same accuracy</td></tr>
<tr class='text-center'><td>Why do XGBoost/LightGBM/CatBoost dominate tabular-data leaderboards over plain scikit-learn GradientBoostingClassifier?</td><td>They add engineering and algorithmic improvements on top of the same core idea - explicit L1/L2 regularization on leaf weights, second-order (Newton) loss approximation, histogram-based split finding, native missing-value handling, and (in LightGBM) leaf-wise tree growth - which together train faster and generalize better on the large, messy, mixed-type tabular datasets typical of Kaggle competitions</td></tr>
</table>`
        }
    ]
};
