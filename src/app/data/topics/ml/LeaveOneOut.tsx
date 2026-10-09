import { Topic } from '../../coreJava';

export const leaveOneOut: Topic = {
    id: 'ml-model-evaluation-leave-one-out',
    name: 'Leave-One-Out',
    beginner: [
        {
            content: `<h4>K-Fold Taken to Its Extreme</h4>
<ul>
<li><strong>Leave-One-Out Cross Validation (LOOCV)</strong> is K-Fold Cross Validation with K set equal to <code>n</code>, the number of samples in the dataset.</li>
<li>Each round trains on ALL but one example, and tests on that single leftover example - repeated once for every single row in the dataset.</li>
<li>With <code>n</code> samples, this means <code>n</code> full training runs, so it uses the maximum possible amount of training data on every round, but is extremely expensive when <code>n</code> is large.</li>
</ul>`,
            codeExamples: [
                `from sklearn.model_selection import LeaveOneOut, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
X, y = X[:20], y[:20]   # small subset for a quick demo

loo = LeaveOneOut()
print("Number of splits (should equal n):", loo.get_n_splits(X))

model = LogisticRegression(max_iter=200)
scores = cross_val_score(model, X, y, cv=loo)
print(f"Mean accuracy: {scores.mean():.3f}   Total folds: {len(scores)}")
# OUTPUT (typical):
# Number of splits (should equal n): 20
# Mean accuracy: 0.950   Total folds: 20`
            ],
            codeExplanations: [
                `<code>LeaveOneOut()</code> automatically produces exactly one fold per row - <code>loo.get_n_splits(X)</code> confirms this equals the sample count (20 here). <code>cross_val_score</code> then trains the model 20 separate times, each time on 19 rows and testing on the single row left out, and <code>scores</code> ends up with 20 individual accuracy values (each either 0 or 1, since a single test example is either predicted correctly or not) that get averaged into the final mean accuracy.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
LOOCV sits at one extreme end of the K-Fold spectrum, and understanding its tradeoffs clarifies why K=5 or K=10 is the usual default rather than K=n.
<ul>
<li><strong>Nearly unbiased</strong> - because each training run uses <code>n-1</code> out of <code>n</code> samples (almost the entire dataset), the model trained in each fold is nearly identical to a model trained on the FULL dataset, so the average test performance across folds is a very low-bias estimate of true generalization performance.</li>
<li><strong>But HIGH variance</strong> - each individual fold's "test set" is a single data point, so that fold's result is either a complete success or complete failure (there's no partial credit, no way to average away noise within a fold). The overall LOOCV score, while averaged over many folds, can still be more sensitive to particular outlier points than a K-Fold estimate with larger, more stable test folds.</li>
<li><strong>Computationally expensive</strong> - LOOCV requires training the model <code>n</code> full times. For a dataset with 10,000 rows, that is 10,000 separate training runs - completely impractical for anything beyond simple, fast-to-train models.</li>
</ul>
This tradeoff is exactly why LOOCV is reserved for datasets where <code>n</code> is small enough that <code>n</code> training runs remains cheap, rather than being used as a general-purpose default like K=5 or K=10 K-Fold.`,
            codeExamples: [
                `# Comparing LOOCV against 5-Fold CV on the same small dataset: closeness of the estimate vs cost
import time
from sklearn.model_selection import LeaveOneOut, KFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
X, y = X[:60], y[:60][:60]  # small subset, 2 classes only

model = LogisticRegression(max_iter=200)

start = time.time()
loo_scores = cross_val_score(model, X, y, cv=LeaveOneOut())
loo_time = time.time() - start

start = time.time()
kfold_scores = cross_val_score(model, X, y, cv=KFold(n_splits=5, shuffle=True, random_state=0))
kfold_time = time.time() - start

print(f"LOOCV:   mean={loo_scores.mean():.3f}  folds={len(loo_scores)}   time={loo_time:.3f}s")
print(f"5-Fold:  mean={kfold_scores.mean():.3f}  folds={len(kfold_scores)}   time={kfold_time:.3f}s")
# OUTPUT (typical):
# LOOCV:   mean=1.000  folds=60   time=0.410s
# 5-Fold:  mean=1.000  folds=5    time=0.045s`
            ],
            codeExplanations: [
                `Both cross-validation strategies are run on the same 60-row, 2-class subset of iris, using the same model. LOOCV runs 60 separate training rounds (one per row) versus 5-Fold's 5 rounds, and even on this tiny dataset takes visibly longer (roughly 9x here) - on a dataset of realistic size, that gap would grow into hours or days versus minutes. The two approaches land on a similar mean score in this easy, well-separated case, illustrating that LOOCV's extra cost buys a lower-bias estimate that, for many datasets, K-Fold already approximates well at a fraction of the compute.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
A university medical research team studying a rare condition has collected data from only <strong>40 patients</strong> - collecting more is slow, expensive, and ethically constrained, so every single data point is precious. Holding out a standard 20% test set would remove 8 whole patients' worth of signal from training on every single evaluation run, a real loss when the dataset is this small. Using 5-Fold or 10-Fold Cross Validation would still hold out 4-8 patients per fold. Leave-One-Out is the natural fit here instead: the model trains on 39 patients and tests on the 1 left out, repeated 40 times so every patient gets a turn as the test case, and every training round still uses 39 out of 40 available patients - squeezing the maximum possible signal out of a dataset too small to comfortably afford holding out a larger chunk. Because <code>n</code> is only 40, running 40 training rounds is computationally trivial for most models, so LOOCV's usual cost concern simply does not apply here.
<h3>Advantages</h3>
<ul>
<li><strong>Uses nearly all the data for training on every round</strong> - only one example is withheld at a time, which is ideal for small datasets where every row genuinely matters.</li>
<li><strong>Nearly unbiased estimate</strong> - because <code>n-1</code> training examples are used each round, the resulting estimate closely approximates the performance of a model trained on the entire available dataset.</li>
<li><strong>Deterministic</strong> - unlike K-Fold with shuffling, there is no randomness in how LOOCV partitions the data (every row gets exactly one turn as the test set), so results are perfectly reproducible without needing to fix a random seed.</li>
<li><strong>Ideal for very small datasets</strong> - exactly where holding out a large, more typical 10-20% test chunk per fold would be wasteful or even impossible.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Prohibitively expensive for large n</strong> - a dataset with 50,000 rows would require 50,000 full training runs, which is impractical for anything beyond the cheapest models.</li>
<li><strong>High variance per fold</strong> - each fold's test set is a single example, so that fold's outcome is a hard 0-or-1 result with no averaging to smooth out noise from an unusual or mislabeled point; a single outlier can disproportionately affect the aggregate score compared to K-Fold's larger, steadier test folds.</li>
<li><strong>Correlated training sets across folds</strong> - since every fold trains on nearly the SAME <code>n-1</code> rows (differing by only one example between folds), the resulting models end up highly correlated with each other, which can understate the true variability a model would show if genuinely retrained on fresh, independent data.</li>
<li><strong>Not suitable for large-scale model selection</strong> - using LOOCV inside something like a hyperparameter grid search multiplies its already-high cost by every hyperparameter combination tried, quickly becoming infeasible.</li>
</ul>`,
            codeExamples: [
                `# LOOCV on a genuinely tiny dataset (40 samples) - the practical sweet spot for this technique
import numpy as np
from sklearn.model_selection import LeaveOneOut, cross_val_score
from sklearn.svm import SVC
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
X, y = X[:40], y[:40]  # simulate a tiny 40-patient-style study, 2 classes

model = SVC(kernel="linear")
loo = LeaveOneOut()

scores = cross_val_score(model, X, y, cv=loo)
print(f"LOOCV over {len(scores)} folds (=n): mean accuracy = {scores.mean():.3f}")
print("Misclassified fold indices:", np.where(scores == 0)[0])
# OUTPUT (typical):
# LOOCV over 40 folds (=n): mean accuracy = 0.975
# Misclassified fold indices: [17]`
            ],
            codeExplanations: [
                `With only 40 samples, running all 40 leave-one-out folds is computationally trivial, which is exactly the situation LOOCV is designed for. Each entry in <code>scores</code> is either exactly 1.0 (that single held-out patient was classified correctly) or exactly 0.0 (it was not) - there is no partial credit within a fold, which is why <code>np.where(scores == 0)</code> can pinpoint precisely WHICH single held-out example the model got wrong. That fold-level granularity - knowing exactly which individual data point failed - is a distinctive practical benefit of LOOCV that averaged, multi-example K-Fold test sets do not give you as directly.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is Leave-One-Out Cross Validation and how does it relate to K-Fold?</td><td>It is K-Fold Cross Validation with K set equal to n, the total number of samples - each round trains on all but one example and tests on that single leftover example, repeated once per row in the dataset</td></tr>
<tr class='text-center'><td>Why is LOOCV described as nearly unbiased but high variance?</td><td>It is nearly unbiased because each training run uses n-1 out of n samples, almost the full dataset, closely approximating a model trained on everything; it has high variance because each fold's test set is a single point, giving an all-or-nothing result per fold that is sensitive to individual outliers rather than averaging noise away within a larger test set</td></tr>
<tr class='text-center'><td>When is LOOCV actually practical to use?</td><td>On small datasets, where n training runs remains computationally cheap and every data point is valuable enough that holding out a larger chunk per fold (as in typical K-Fold) would waste scarce signal - it becomes impractical as n grows large because it then requires an equally large number of full training runs</td></tr>
</table>`
        }
    ]
};
