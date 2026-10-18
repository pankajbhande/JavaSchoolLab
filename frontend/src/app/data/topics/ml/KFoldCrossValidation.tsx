import { Topic } from '../../coreJava';

export const kFoldCrossValidation: Topic = {
    id: 'ml-model-evaluation-k-fold-cross-validation',
    name: 'K-Fold Cross Validation',
    beginner: [
        {
            content: `<h4>Getting a More Reliable Performance Estimate</h4>
<ul>
<li>A single train/test split gives ONE performance number, which can be lucky or unlucky depending on which rows happened to land in the test set - especially on small datasets.</li>
<li><strong>K-Fold Cross Validation</strong> splits the data into K equal parts ("folds"). It trains K times, each time holding out a DIFFERENT fold as the test set and training on the rest.</li>
<li>The final score is the AVERAGE across all K runs, giving both a more reliable estimate and a sense of how much performance varies (via the standard deviation across folds).</li>
</ul>`,
            codeExamples: [
                `from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
model = LogisticRegression(max_iter=200)

scores = cross_val_score(model, X, y, cv=5)   # 5-fold cross validation
print("Fold scores:", scores.round(3))
print(f"Mean accuracy: {scores.mean():.3f}  (+/- {scores.std():.3f})")
# OUTPUT (typical):
# Fold scores: [1.    0.967 0.933 0.9   1.   ]
# Mean accuracy: 0.960  (+/- 0.039)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why K-Fold Beats a Single Holdout Split, and When It Doesn't</h3>
K-Fold uses EVERY row for both training and testing (just never in the same fold at once), so it makes far more efficient use of limited data than a fixed 70/30 holdout split ever could. Common choices are K=5 or K=10 - a good balance between computational cost (K full training runs) and estimate reliability. Two important variants:
<ul>
<li><strong>Stratified K-Fold</strong> - preserves the original class proportions in every fold, essential for imbalanced classification (otherwise a fold could end up with too few or zero examples of a rare class).</li>
<li><strong>Time-Series Cross Validation</strong> - standard K-Fold shuffles rows randomly, which LEAKS future information into training for time-ordered data; time-series CV instead always trains on the past and validates on a later, non-overlapping window.</li>
</ul>
Cross validation is also the standard way to reliably compare hyperparameter choices (e.g. inside <code>GridSearchCV</code>) without ever touching a final, untouched holdout test set until the very end.`,
            codeExamples: [
                `# Stratified K-Fold on an imbalanced dataset, vs plain K-Fold
import numpy as np
from sklearn.model_selection import StratifiedKFold, KFold

y = np.array([0]*90 + [1]*10)   # 90 majority class, 10 minority class

print("Plain KFold class-1 counts per fold:")
for _, test_idx in KFold(n_splits=5, shuffle=True, random_state=0).split(y):
    print(" ", (y[test_idx] == 1).sum())

print("StratifiedKFold class-1 counts per fold:")
for _, test_idx in StratifiedKFold(n_splits=5, shuffle=True, random_state=0).split(y, y):
    print(" ", (y[test_idx] == 1).sum())
# OUTPUT (typical):
# Plain KFold class-1 counts per fold:      1, 3, 1, 2, 3    <- uneven, could even hit 0
# StratifiedKFold class-1 counts per fold:  2, 2, 2, 2, 2    <- always proportional`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is cross-validation and why is it used?</td><td>It repeatedly trains and tests a model on different splits of the same data (each row is tested on exactly once) to produce a more reliable performance estimate than a single lucky/unlucky train-test split, especially valuable when data is limited</td></tr>
<tr class='text-center'><td>Why is Stratified K-Fold preferred over plain K-Fold for imbalanced classification?</td><td>Plain K-Fold shuffles randomly, so a fold could by chance contain very few or even zero examples of the minority class, making that fold's evaluation unreliable or undefined (e.g. for precision); stratified sampling preserves the original class ratio in every fold</td></tr>
<tr class='text-center'><td>Why can't you use standard K-Fold for time-series data?</td><td>Standard K-Fold shuffles rows randomly, meaning a fold could train on FUTURE data and test on the PAST - leaking information a real deployed model would never have had access to at prediction time; time-series CV must always test on data that comes strictly after its training window</td></tr>
</table>`
        }
    ]
};
