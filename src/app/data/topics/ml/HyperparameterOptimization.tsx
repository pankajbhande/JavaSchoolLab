import { Topic } from '../../coreJava';

export const hyperparameterOptimization: Topic = {
    id: 'ml-optimization-hyperparameter-optimization',
    name: 'Hyperparameter Optimization',
    beginner: [
        {
            content: `<h4>Parameters vs Hyperparameters</h4>
<ul>
<li><strong>Parameters</strong> - values the model LEARNS from data during training (e.g. the weights of a linear regression, the split thresholds of a decision tree). You never set these by hand.</li>
<li><strong>Hyperparameters</strong> - values YOU choose before training even starts (e.g. <code>max_depth</code> of a tree, <code>learning_rate</code> of a gradient booster, the number of neighbors <code>k</code> in KNN). They control HOW the model learns, not what it learns.</li>
<li><strong>Hyperparameter Optimization</strong> is the systematic search for the combination of hyperparameter values that gives the best generalization performance, instead of guessing or using defaults.</li>
</ul>`,
            codeExamples: [
                `# A plain Grid Search over a Random Forest's key hyperparameters
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.datasets import load_breast_cancer

X, y = load_breast_cancer(return_X_y=True)

param_grid = {
    "n_estimators": [100, 300],
    "max_depth": [4, 8, None],
    "min_samples_leaf": [1, 5],
}

search = GridSearchCV(
    RandomForestClassifier(random_state=0),
    param_grid,
    cv=5,                 # each combination is scored with 5-fold cross validation
    scoring="accuracy",
    n_jobs=-1,
)
search.fit(X, y)

print("Best params:", search.best_params_)
print(f"Best CV accuracy: {search.best_score_:.4f}")
# OUTPUT (typical):
# Best params: {'max_depth': 8, 'min_samples_leaf': 1, 'n_estimators': 300}
# Best CV accuracy: 0.9701`
            ],
            codeExplanations: [
                `This defines a small "grid" of candidate values for three Random Forest hyperparameters: how many trees to build (<code>n_estimators</code>), how deep each tree may grow (<code>max_depth</code>), and the minimum number of samples required at a leaf (<code>min_samples_leaf</code>). <code>GridSearchCV</code> then trains and evaluates a model for EVERY combination in that grid (2 x 3 x 2 = 12 combinations), each time using 5-fold cross validation rather than a single train/test split, so the score for each combination is a reliable average rather than a lucky or unlucky split. After trying all combinations, <code>best_params_</code> reports which combination scored highest on average, and <code>best_score_</code> reports that average cross-validated accuracy - this is the number to trust, not any single fold's score.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before systematic tuning became standard practice, teams either used library DEFAULTS (which are generic and rarely optimal for a specific dataset) or hand-tweaked one hyperparameter at a time by eye, which is slow, unreliable, and easy to bias toward whatever the engineer happened to try first.</li>
<li>The gap between a poorly-tuned and a well-tuned model on the SAME data and the SAME algorithm is often several percentage points of accuracy or AUC - on a fraud-detection or credit-scoring model, that gap can be the difference between a model that ships and one that gets rejected by risk review.</li>
<li>Without a principled search, it's also easy to unknowingly overfit hyperparameters to a single lucky test set - tuning against cross-validation (never the final holdout test set) is what makes the resulting choice trustworthy rather than a coincidence of that one split.</li>
</ul>
<h3>Real-World Example</h3>
A retailer runs a Kaggle-style internal competition to predict which customers will churn next month, using an XGBoost model on ~150 features. The baseline model with default hyperparameters scores 0.81 AUC on cross-validation. The data science team knows that even a 1-2% AUC improvement, when applied to a marketing budget of millions of dollars in retention offers, translates into real money saved by targeting the right customers. They can't grid-search everything (XGBoost has a dozen-plus tunable hyperparameters, and a full grid would take days), so they compare three tuning strategies:
<ul>
<li><strong>Grid Search</strong> - exhaustive, guaranteed to check every combination in the chosen grid, but the cost EXPLODES combinatorially (5 hyperparameters x 4 values each = 1024 model fits) - only practical for a small number of hyperparameters or a coarse grid.</li>
<li><strong>Random Search</strong> - samples a fixed NUMBER of random combinations from the hyperparameter space instead of every combination. Counter-intuitively, this usually finds a near-optimal setting FASTER than grid search, because most hyperparameters matter far less than one or two dominant ones, and random sampling explores the important dimensions more densely for the same budget.</li>
<li><strong>Bayesian Optimization (e.g. Optuna)</strong> - builds a probabilistic model of "which hyperparameter regions tend to score well" from every trial run so far, and uses that model to choose the NEXT combination to try, rather than sampling blindly. This converges to a good result in far fewer trials than random search, which matters when each trial (training an XGBoost model on millions of rows) takes real time and compute money.</li>
</ul>`,
            codeExamples: [
                `# Random Search vs Bayesian Optimization (Optuna) on the same XGBoost problem
import numpy as np
from sklearn.model_selection import RandomizedSearchCV, cross_val_score
from xgboost import XGBClassifier
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=5000, n_features=30, weights=[0.85, 0.15], random_state=0)

# --- Random Search: sample a fixed budget of random combinations ---
param_dist = {
    "max_depth": [3, 4, 5, 6, 8],
    "learning_rate": [0.01, 0.03, 0.05, 0.1, 0.2],
    "n_estimators": [100, 200, 400, 600],
    "subsample": [0.6, 0.8, 1.0],
}
random_search = RandomizedSearchCV(
    XGBClassifier(eval_metric="auc", random_state=0),
    param_distributions=param_dist,
    n_iter=25,            # only 25 combinations tried, out of 5*5*4*3=300 possible
    cv=5,
    scoring="roc_auc",
    random_state=0,
    n_jobs=-1,
)
random_search.fit(X, y)
print("RandomizedSearchCV best AUC:", round(random_search.best_score_, 4))

# --- Bayesian Optimization with Optuna: each trial informs the next ---
import optuna

def objective(trial):
    params = {
        "max_depth": trial.suggest_int("max_depth", 3, 8),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
        "n_estimators": trial.suggest_int("n_estimators", 100, 600, step=50),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
    }
    model = XGBClassifier(eval_metric="auc", random_state=0, **params)
    return cross_val_score(model, X, y, cv=5, scoring="roc_auc").mean()

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=25)   # same 25-trial budget as random search
print("Optuna best AUC:", round(study.best_value, 4))
print("Optuna best params:", study.best_params)
# OUTPUT (typical):
# RandomizedSearchCV best AUC: 0.8734
# Optuna best AUC: 0.8891
# Optuna best params: {'max_depth': 5, 'learning_rate': 0.0721, 'n_estimators': 350, 'subsample': 0.83}
# (Optuna typically edges out random search on the SAME trial budget, because later trials
#  are guided by what earlier trials revealed, rather than sampled blindly.)`
            ],
            codeExplanations: [
                `The Random Search block picks 25 random combinations out of the 300 possible combinations in <code>param_dist</code> and scores each with 5-fold cross-validated ROC-AUC, which is a far cheaper way to explore a large hyperparameter space than trying all 300. The Optuna block instead defines an <code>objective</code> function that trains a model for a set of suggested hyperparameter values and returns its cross-validated AUC; <code>trial.suggest_int</code>/<code>suggest_float</code> tell Optuna the valid RANGE to sample from (with <code>log=True</code> on the learning rate because good learning rates are better explored on a logarithmic scale). Crucially, <code>study.optimize</code> doesn't sample all 25 trials independently and blindly - internally it fits a probabilistic surrogate model (by default a Tree-structured Parzen Estimator) on the trials it has already run, and uses that model to pick the next hyperparameter combination that is MOST LIKELY to improve on the best score seen so far. Comparing <code>random_search.best_score_</code> to <code>study.best_value</code> under the identical 25-trial budget shows why Bayesian optimization is preferred when each trial is computationally expensive: it tends to reach a better answer for the same amount of compute.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Removes guesswork</strong> - replaces "I'll just try <code>max_depth=5</code>, it sounds reasonable" with a defensible, reproducible search process that can be handed off between team members.</li>
<li><strong>Meaningful performance gains</strong> - on real datasets, tuned models frequently beat default-hyperparameter models by several points of accuracy/AUC/F1, e.g. the 0.81 to ~0.89 AUC jump for the churn model above.</li>
<li><strong>Reusable across algorithms</strong> - the same search framework (Grid/Random/Bayesian) works whether you're tuning a Random Forest, an SVM's <code>C</code> and <code>gamma</code>, or a neural network's learning rate and batch size.</li>
<li><strong>Bayesian methods scale to expensive models</strong> - Optuna-style optimization makes tuning feasible even for deep learning models where a single training run can take hours, since it wastes far fewer trials than blind search.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Computational cost</strong> - every combination tried means a FULL model training run (often x5 or x10 more for cross-validation folds); tuning a slow model like a deep neural network can cost real GPU-hours and cloud budget.</li>
<li><strong>Risk of overfitting the validation process itself</strong> - if you tune against the same cross-validation folds hundreds of times, you can eventually find a combination that scores well by CHANCE on those folds; a final untouched test set (or nested cross-validation) is needed to confirm the tuned model actually generalizes.</li>
<li><strong>Grid Search doesn't scale</strong> - the number of combinations grows exponentially with the number of hyperparameters, making exhaustive search impractical beyond 3-4 hyperparameters.</li>
<li><strong>Diminishing returns</strong> - beyond a certain point, further tuning buys tiny improvements (e.g. 0.001 AUC) that aren't worth the extra compute time compared to gathering better features or more data.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating the combinatorial blow-up that makes exhaustive Grid Search impractical
from itertools import product

param_grid = {
    "max_depth": [3, 4, 5, 6, 8],
    "learning_rate": [0.01, 0.03, 0.05, 0.1, 0.2],
    "n_estimators": [100, 200, 400, 600],
    "subsample": [0.6, 0.8, 1.0],
    "colsample_bytree": [0.6, 0.8, 1.0],
}
combinations = list(product(*param_grid.values()))
folds = 5
print(f"Total combinations: {len(combinations)}")
print(f"Total model fits with {folds}-fold CV: {len(combinations) * folds}")
# OUTPUT:
# Total combinations: 900
# Total model fits with 5-fold CV: 4500
# (At even 10 seconds per fit, that's 12.5 hours of pure compute for ONE grid search -
#  which is exactly why Random Search or Bayesian Optimization is preferred at this scale.)`
            ],
            codeExplanations: [
                `<code>itertools.product</code> enumerates every possible combination of the five hyperparameters' candidate values, the same way <code>GridSearchCV</code> would internally. Multiplying the resulting combination count by the number of cross-validation folds (5) gives the TOTAL number of individual model-training runs a full grid search would require - 4500 in this case. This is the concrete, numeric version of the "combinatorial blow-up" limitation: it's not an abstract concern, it directly translates into hours or days of wasted compute, which is why in practice teams switch to Random Search (fixed trial budget regardless of grid size) or Bayesian Optimization (fixed trial budget that also learns from past trials) once more than a couple of hyperparameters are involved.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between a parameter and a hyperparameter?</td><td>A parameter (e.g. a linear model's coefficients) is learned automatically from the training data during fitting; a hyperparameter (e.g. tree depth, learning rate, k in KNN) is set before training begins and controls how the learning process itself behaves - it must be chosen by search or experimentation, not learned by gradient descent on the training data</td></tr>
<tr class='text-center'><td>Why is Random Search often preferred over Grid Search when there are many hyperparameters?</td><td>Grid Search's cost grows exponentially with the number of hyperparameters and values per hyperparameter, quickly becoming infeasible; Random Search samples a fixed number of combinations regardless of the grid's size, and in practice explores the few hyperparameters that actually matter more densely for the same compute budget, often finding a comparably good result much faster</td></tr>
<tr class='text-center'><td>Why must hyperparameters be tuned against cross-validation and never against the final test set?</td><td>If you repeatedly evaluate different hyperparameter combinations directly against the test set and pick the best-scoring one, you are effectively "fitting" your hyperparameter choice to that specific test set, leaking information into it and making its reported performance overly optimistic; tuning against cross-validation (or a separate validation set) keeps the test set truly held out for one final, honest evaluation</td></tr>
</table>`
        }
    ]
};
