import { Topic } from '../../coreJava';

export const randomForest: Topic = {
    id: 'ml-classification-random-forest',
    name: 'Random Forest',
    beginner: [
        {
            content: `<h4>A Crowd of Trees Voting Together</h4>
<ul>
<li>A <strong>Random Forest</strong> trains many Decision Trees on slightly different random subsets of the data and features, then combines their predictions - classification uses MAJORITY VOTE across trees, regression AVERAGES their outputs.</li>
<li>Each tree sees a random bootstrap sample of the training rows (sampling WITH replacement) - this is called <strong>Bagging</strong> (Bootstrap Aggregating). Because every tree trains on a slightly different dataset, they make different mistakes.</li>
<li>At every split, each tree only considers a random SUBSET of features (e.g. <code>sqrt(n_features)</code> for classification) instead of all of them - this <strong>Feature Randomness</strong> decorrelates the trees further, so they don't all latch onto the one strongest feature the same way.</li>
<li>A single Decision Tree overfits easily; averaging hundreds of imperfect, decorrelated trees cancels out their individual noise while keeping the shared signal - this is why forests generalize far better than any one tree in them.</li>
</ul>`,
            codeExamples: [
                `from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

single_tree = DecisionTreeClassifier(random_state=0)
single_tree.fit(X_train, y_train)

forest = RandomForestClassifier(n_estimators=200, random_state=0)
forest.fit(X_train, y_train)

print(f"Single Decision Tree test accuracy: {single_tree.score(X_test, y_test):.3f}")
print(f"Random Forest (200 trees) test accuracy: {forest.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Single Decision Tree test accuracy: 0.918
# Random Forest (200 trees) test accuracy: 0.965`
            ],
            codeExplanations: [
                `This loads the Wisconsin breast-cancer dataset (a benign-vs-malignant tumor classification task) and splits it into a 70% training / 30% test set. A single DecisionTreeClassifier is trained first as the baseline - a lone tree, left mostly unconstrained, tends to memorize quirks of the training rows it happened to see. Then a RandomForestClassifier with 200 trees is trained the same way: internally it draws 200 bootstrap samples, grows one tree per sample (each considering a random subset of features at every split), and at prediction time lets all 200 trees vote. Comparing <code>.score()</code> on the untouched test set shows the forest's averaged vote is noticeably more accurate and stable than any single tree's greedy guesses.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before ensembling techniques like bagging existed, practitioners had one lever for a Decision Tree: control its depth. A shallow tree UNDERFITS (too rigid to capture real patterns); a deep, unconstrained tree OVERFITS (memorizes noise, its predictions swing wildly if you retrain on a resampled version of the same data - i.e. HIGH VARIANCE). There was no way to get both low bias (a tree deep enough to see real structure) and low variance (stability across different training samples) from one tree at once.
<ul>
<li>Random Forest breaks this tradeoff by letting each tree grow DEEP and low-bias (even fully unconstrained) - and then relies on averaging many DECORRELATED such trees to cancel out their individual high variance, without needing to prune any single one.</li>
<li>The decorrelation is the key engineering trick: if trees were all trained on the exact same data and features, they'd make the SAME correlated mistakes and averaging wouldn't help at all (averaging N identical, fully-correlated predictions has the same variance as one of them). Random row sampling (bagging) and random feature sampling per split are precisely what keep individual trees' errors uncorrelated enough that averaging actually reduces variance.</li>
</ul>
<h3>Real-World Example</h3>
A bank's credit-risk scoring pipeline needs to decide, for every loan application, whether the applicant is likely to default. The stakes of getting it wrong in either direction are high - approving a bad loan costs money directly, rejecting a good applicant loses business and can raise fair-lending concerns - so the bank cannot ship a model that behaves erratically depending on which historical loans happened to be in this month's training batch. A single Decision Tree trained on last quarter's defaults might swing to very different decision boundaries if retrained next quarter on a slightly different mix of applicants. A Random Forest of several hundred trees, each seeing a different bootstrap sample of past applicants and a different random subset of features (income, credit history length, existing debt, employment type, ...), produces a risk score that is far more stable release-to-release, and additionally exposes a built-in, unbiased validation signal (out-of-bag error, below) without needing to carve out a separate holdout set - valuable when historical default data is limited.`,
            codeExamples: [
                `# Credit-risk-style pipeline: comparing a single tree's instability to a forest's stability across resamples
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=800, n_features=12, n_informative=6,
                            weights=[0.85, 0.15], random_state=1)  # imbalanced, like real default rates
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1, stratify=y)

def resample_and_score(model_builder, n_runs=8):
    scores = []
    rng = np.random.default_rng(0)
    for _ in range(n_runs):
        idx = rng.choice(len(X_train), size=len(X_train), replace=True)  # simulate "a different quarter's data"
        model = model_builder()
        model.fit(X_train[idx], y_train[idx])
        scores.append(model.score(X_test, y_test))
    return np.array(scores)

tree_scores = resample_and_score(lambda: DecisionTreeClassifier(random_state=0))
forest_scores = resample_and_score(lambda: RandomForestClassifier(n_estimators=150, random_state=0))

print(f"Single Tree accuracy across resamples: mean={tree_scores.mean():.3f}  std={tree_scores.std():.3f}")
print(f"Random Forest accuracy across resamples: mean={forest_scores.mean():.3f}  std={forest_scores.std():.3f}")
# OUTPUT (typical):
# Single Tree accuracy across resamples:   mean=0.870  std=0.028
# Random Forest accuracy across resamples: mean=0.916  std=0.009   <- both higher AND far more stable`
            ],
            codeExplanations: [
                `This simulates the bank's "does the model's decision boundary hold up quarter over quarter" concern directly. <code>make_classification</code> builds a synthetic imbalanced dataset (85%/15% split, mirroring a low default rate) and holds out a fixed test set that represents "this quarter's real applicants". The <code>resample_and_score</code> helper repeatedly draws a NEW bootstrap resample of the training set (standing in for "training data would have looked slightly different if collected a different quarter") and retrains a fresh model each time, recording its accuracy on the SAME held-out test set. Doing this for a plain DecisionTreeClassifier versus a RandomForestClassifier and comparing the mean and standard deviation of the resulting accuracy scores shows the forest is not only more accurate on average but its score barely moves between resamples - exactly the release-to-release stability a risk-scoring pipeline needs.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Strong accuracy out of the box</strong> - because it reduces variance without adding bias, a Random Forest with default settings often outperforms a carefully-tuned single tree, e.g. jumping from ~92% to ~96% test accuracy on the breast-cancer example above with no hyperparameter search.</li>
<li><strong>Resistant to overfitting compared to a single tree</strong> - individual trees can each overfit their own bootstrap sample, but since they overfit to DIFFERENT noise, averaging their votes washes most of that noise out (e.g. the resample experiment above: std of 0.028 for one tree vs 0.009 for the forest).</li>
<li><strong>Handles mixed and messy features well</strong> - like a single tree, it needs no feature scaling and copes with a blend of numeric and categorical columns, so a credit dataset mixing income (continuous) and employment type (categorical) needs no special preprocessing.</li>
<li><strong>Gives a free, honest validation score via Out-of-Bag (OOB) error</strong> - since each tree only trains on ~63% of rows (bootstrap sampling with replacement leaves ~37% of rows unseen by any given tree), those held-out rows can be used to validate that tree, giving a reliable performance estimate with no separate holdout set needed - useful when the bank has limited historical default data to spare.</li>
<li><strong>Built-in feature importance</strong> - by measuring how much each feature's random shuffling degrades OOB accuracy (or Gini-based importance), a forest tells a credit analyst which factors (e.g. debt-to-income ratio) actually drive its risk score, supporting regulatory explainability requirements.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Slower and heavier than a single tree</strong> - training and storing 200-500 trees costs proportionally more time and memory than one tree; for a real-time fraud-scoring API serving thousands of requests per second, this latency and memory footprint has to be budgeted for explicitly.</li>
<li><strong>Loses the single tree's easy interpretability</strong> - you can print and read one Decision Tree's exact if/else logic to a loan officer or regulator; a 300-tree forest's combined vote has no equivalent simple explanation, forcing reliance on post-hoc tools like feature importance or SHAP values instead.</li>
<li><strong>Can still overfit with very noisy data or too few trees</strong> - averaging reduces variance but doesn't eliminate bias; if the underlying features are mostly noise (e.g. weak or irrelevant applicant attributes), the forest will still fit that noise, just more slowly than a single tree would.</li>
<li><strong>Biased toward high-cardinality categorical features</strong> - Gini-based split selection tends to favor features with many distinct values (e.g. a "zip code" column with 5,000 categories) purely because they offer more ways to split, even if a coarser feature like "state" is actually more predictive - this can distort feature-importance rankings.</li>
<li><strong>Extrapolates poorly beyond the training range</strong> - since predictions are averages of piecewise-constant tree leaves, a forest cannot predict a numeric outcome (e.g. a loan amount) outside the range it saw in training, unlike a linear model which extrapolates a trend.</li>
</ul>`,
            codeExamples: [
                `# Out-of-Bag error: free validation without a separate holdout set, plus feature importances
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
import numpy as np

data = load_breast_cancer()
X, y = data.data, data.target

forest = RandomForestClassifier(n_estimators=300, oob_score=True, random_state=0)
forest.fit(X, y)  # trained on ALL data - OOB rows give validation without needing a held-out test split

print(f"Out-of-Bag accuracy estimate: {forest.oob_score_:.3f}")

top5 = np.argsort(forest.feature_importances_)[::-1][:5]
for i in top5:
    print(f"  {data.feature_names[i]:<25s} importance={forest.feature_importances_[i]:.3f}")
# OUTPUT (typical):
# Out-of-Bag accuracy estimate: 0.961
#   worst perimeter           importance=0.140
#   worst concave points      importance=0.132
#   mean concave points       importance=0.108
#   worst radius              importance=0.098
#   worst area                importance=0.087`
            ],
            codeExplanations: [
                `Here the forest is trained on the FULL dataset (no manual train/test split) with <code>oob_score=True</code>, which tells scikit-learn to, for every training row, only average votes from the subset of trees that did NOT see that row during their own bootstrap sampling (roughly 37% of trees, per row) - giving an internal validation estimate (<code>forest.oob_score_</code>) that behaves like held-out test accuracy without sacrificing any data to a manual split. The second part reads <code>forest.feature_importances_</code>, an array scikit-learn computes from how much each feature reduced impurity (Gini) summed across every split in every tree, and prints the five most influential features - this is exactly the mechanism a credit analyst would use to justify why the model flagged an application as high-risk.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does averaging many Decision Trees reduce variance without much increase in bias?</td><td>Each deep tree individually has low bias (it fits the training signal well) but high variance (it's sensitive to exactly which rows it saw); if trees are trained on independent bootstrap samples with random feature subsets, their individual errors are largely uncorrelated, so averaging cancels most of the variance out while each tree's low bias is preserved in the average</td></tr>
<tr class='text-center'><td>What is Out-of-Bag (OOB) error and why is it useful?</td><td>Because bootstrap sampling with replacement leaves roughly 37% of rows unseen by any given tree, those unseen rows can be used to validate that tree; averaging each row's prediction only across trees that didn't see it gives a reliable accuracy estimate without needing to sacrifice data to a separate holdout test set</td></tr>
<tr class='text-center'><td>Why does Random Forest randomly restrict the features considered at each split, not just the rows?</td><td>If every tree could choose from all features, most trees would repeatedly split on the single strongest feature first, making the trees highly correlated with each other - correlated errors don't cancel out when averaged; limiting each split to a random feature subset forces trees to diverge, which is what actually drives the variance reduction</td></tr>
</table>`
        }
    ]
};
