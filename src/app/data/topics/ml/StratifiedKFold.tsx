import { Topic } from '../../coreJava';

export const stratifiedKFold: Topic = {
    id: 'ml-model-evaluation-stratified-k-fold',
    name: 'Stratified K-Fold',
    beginner: [
        {
            content: `<h4>Keeping Every Fold Representative</h4>
<ul>
<li>Plain K-Fold Cross Validation splits rows into K folds RANDOMLY, without caring what proportion of each class ends up in each fold.</li>
<li><strong>Stratified K-Fold</strong> instead builds each fold so it has roughly the SAME class distribution as the full dataset - if the whole dataset is 70% class A / 30% class B, every fold will be close to that same 70/30 split too.</li>
<li>This matters most for classification with imbalanced classes, where a purely random split could easily under-represent (or completely miss) the rare class in some fold.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.model_selection import StratifiedKFold

# An imbalanced dataset: 90 examples of class 0, 10 of class 1
y = np.array([0]*90 + [1]*10)

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
for fold, (train_idx, test_idx) in enumerate(skf.split(np.zeros(len(y)), y)):
    print(f"Fold {fold}: class-1 count in test fold =", (y[test_idx] == 1).sum())
# OUTPUT (typical):
# Fold 0: class-1 count in test fold = 2
# Fold 1: class-1 count in test fold = 2
# Fold 2: class-1 count in test fold = 2
# Fold 3: class-1 count in test fold = 2
# Fold 4: class-1 count in test fold = 2`
            ],
            codeExplanations: [
                `<code>StratifiedKFold</code> takes both the feature placeholder and the label array <code>y</code> as arguments to <code>.split()</code> - it needs to see the labels so it can balance them across folds, unlike plain <code>KFold</code> which only needs the row count. With 10 examples of the minority class 1 spread across 5 folds, stratification guarantees each fold's test set gets exactly 2 of them, matching the overall 10% minority proportion in every single fold rather than leaving it to chance.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Class imbalance is common in real-world classification - fraud detection, disease diagnosis, spam filtering, churn prediction - and plain K-Fold's random shuffling can quietly sabotage evaluation on exactly these problems.
<ul>
<li>With a rare class, random shuffling can by chance concentrate most or even ALL of the minority examples into one or two folds, leaving other folds with very few (or zero) minority examples in their test set.</li>
<li>A test fold with zero examples of a class makes metrics like <strong>precision</strong> and <strong>recall</strong> for that class literally UNDEFINED (division by zero), and even a fold with just one or two examples produces a wildly noisy, unreliable per-fold score.</li>
<li>The risk gets WORSE as class imbalance grows (fewer minority examples to spread around) and as K grows (more folds means fewer minority examples per fold) - a 2% minority class split across 10 folds averages only about 2 minority examples per fold before even accounting for random variance, so an unlucky shuffle can easily zero one fold out entirely.</li>
</ul>
Stratified K-Fold removes this risk entirely by construction: instead of shuffling rows and hoping the proportions come out balanced, it deliberately partitions each class's examples separately and then combines them into folds, guaranteeing every fold mirrors the full dataset's class ratio.`,
            codeExamples: [
                `# Contrasting plain KFold vs StratifiedKFold on a rare-disease-style dataset (2% positive)
import numpy as np
from sklearn.model_selection import KFold, StratifiedKFold

rng = np.random.default_rng(7)
y = np.array([0]*980 + [1]*20)   # 2% positive rate, 1000 patients total
rng.shuffle(y)

print("Plain KFold - positive count per test fold (K=10):")
for _, test_idx in KFold(n_splits=10, shuffle=True, random_state=0).split(y):
    print(" ", (y[test_idx] == 1).sum())

print("StratifiedKFold - positive count per test fold (K=10):")
for _, test_idx in StratifiedKFold(n_splits=10, shuffle=True, random_state=0).split(np.zeros(len(y)), y):
    print(" ", (y[test_idx] == 1).sum())
# OUTPUT (typical):
# Plain KFold - positive count per test fold (K=10):    0, 4, 1, 3, 0, 2, 3, 1, 4, 2   <- two folds got ZERO
# StratifiedKFold - positive count per test fold (K=10): 2, 2, 2, 2, 2, 2, 2, 2, 2, 2   <- always proportional`
            ],
            codeExplanations: [
                `Both splitters divide the same 1000-patient, 2%-positive dataset into 10 folds. Plain <code>KFold</code> shuffles rows with no regard for the label, and in this run two of the ten test folds end up with ZERO positive patients - any attempt to compute recall for the positive class on those folds would divide by zero, making that fold's evaluation meaningless. <code>StratifiedKFold</code> is given the label array <code>y</code> directly and guarantees exactly 2 positive patients (2% of 100) in every single test fold, so precision and recall can always be computed and averaged meaningfully across all 10 folds.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
Consider a hospital dataset for a rare disease where only 2% of patients test positive. A data science team evaluating a diagnostic classifier with plain K-Fold Cross Validation could easily get unlucky: by pure chance, one of the folds might contain ZERO positive patients in its test split. For that fold, <strong>precision</strong> and <strong>recall</strong> for the positive class become mathematically undefined (there is nothing to compute them against), and the fold's score either crashes the evaluation code or silently gets reported as a misleading 0 or NaN. Worse, even folds that DO get a couple of positive examples produce extremely noisy per-fold metrics, since two examples are not enough to reliably estimate anything. Switching to <strong>Stratified K-Fold</strong> fixes this at the root: every fold is guaranteed to contain roughly 2% positive patients, exactly mirroring the full dataset, so every fold's precision/recall is computable and the averaged cross-validation score genuinely reflects how well the model detects the disease.
<h3>Advantages</h3>
<ul>
<li><strong>Guarantees every fold is evaluable</strong> - no fold can end up with zero examples of a class, so metrics like precision, recall, and F1 stay well-defined for every fold.</li>
<li><strong>More stable, trustworthy cross-validation scores</strong> - because class proportions do not swing fold-to-fold, the reported mean and standard deviation across folds better reflect true model performance rather than sampling luck.</li>
<li><strong>Essential (not optional) as imbalance or K increases</strong> - the more skewed the classes, or the more folds requested, the more likely plain random shuffling is to produce a badly skewed fold, making stratification increasingly necessary rather than a nice-to-have.</li>
<li><strong>Drop-in replacement</strong> - <code>StratifiedKFold</code> has essentially the same API as <code>KFold</code> (just also needs the labels), so switching to it costs almost nothing in scikit-learn code.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Only applies to classification</strong> - stratifying by class label has no direct meaning for a continuous regression target (though similar ideas can be approximated by binning the target into quantiles).</li>
<li><strong>Does not fix imbalance itself</strong> - it only ensures fair EVALUATION across folds; the model can still struggle to learn the minority class well, which typically needs separate remedies like class weighting, resampling, or different thresholds.</li>
<li><strong>Assumes a single stratification variable is enough</strong> - if multiple attributes matter jointly (e.g. class AND a demographic group), plain stratification on class alone may still leave those sub-groups unevenly distributed across folds.</li>
<li><strong>Slightly more setup than plain KFold</strong> - it requires passing the label array into <code>.split()</code>, and cannot be used at all in unsupervised settings where there are no labels to stratify by.</li>
</ul>`,
            codeExamples: [
                `# Using StratifiedKFold inside a real cross-validation loop with cross_val_score
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification

# Simulate an imbalanced classification dataset (5% positive)
X, y = make_classification(
    n_samples=2000, weights=[0.95, 0.05], random_state=0
)

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
model = LogisticRegression(max_iter=500)

scores = cross_val_score(model, X, y, cv=skf, scoring="recall")
print("Per-fold recall (positive class):", scores.round(3))
print(f"Mean recall: {scores.mean():.3f}  (+/- {scores.std():.3f})")
# OUTPUT (typical):
# Per-fold recall (positive class): [0.6   0.7   0.65  0.55  0.6  ]
# Mean recall: 0.620  (+/- 0.050)`
            ],
            codeExplanations: [
                `Passing a <code>StratifiedKFold</code> object as the <code>cv</code> argument to <code>cross_val_score</code> (instead of just an integer) makes scikit-learn use stratified splitting under the hood, guaranteeing every fold's test set carries roughly the same 5% positive rate as the full dataset. Because every fold is guaranteed a fair share of the minority class, the reported per-fold recall values are all meaningful and comparable to each other - had a fold ended up with zero positive examples under plain shuffling, its recall score would have been undefined, corrupting the mean and standard deviation computed across folds.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Stratified K-Fold solve that plain K-Fold does not?</td><td>Plain K-Fold shuffles rows randomly with no regard for class labels, so by chance some folds could end up with very few or even zero examples of a rare class; Stratified K-Fold deliberately builds each fold to preserve the same class proportions as the full dataset, guaranteeing every fold is evaluable</td></tr>
<tr class='text-center'><td>Why does the risk from plain K-Fold get worse as class imbalance or K increases?</td><td>Fewer minority-class examples exist to begin with as imbalance grows, and increasing K means each fold holds fewer rows overall, so there are fewer minority examples available per fold in both cases - increasing the chance that random shuffling produces a fold with very few or zero of them</td></tr>
<tr class='text-center'><td>How do you use StratifiedKFold in scikit-learn versus plain KFold?</td><td>StratifiedKFold's split() method requires the label array y in addition to the data, since it needs to know each row's class to balance them across folds, whereas KFold's split() only needs the number of rows; StratifiedKFold instances can be passed directly as the cv argument to cross_val_score or GridSearchCV</td></tr>
</table>`
        }
    ]
};
