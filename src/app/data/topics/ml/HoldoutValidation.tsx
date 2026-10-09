import { Topic } from '../../coreJava';

export const holdoutValidation: Topic = {
    id: 'ml-model-evaluation-holdout-validation',
    name: 'Holdout Validation',
    beginner: [
        {
            content: `<h4>The Simplest Way to Evaluate a Model</h4>
<ul>
<li><strong>Holdout Validation</strong> means splitting your data ONCE into a training set and a test set (e.g. 80/20), training on one part and evaluating on the other.</li>
<li>Sometimes it is split THREE ways instead - train / validation / test - so hyperparameters can be tuned on the validation set while the test set stays untouched until the very end.</li>
<li>It is the fastest possible validation strategy: exactly ONE training run, compared to K-Fold Cross Validation's K training runs.</li>
</ul>`,
            codeExamples: [
                `from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)

# One single 80/20 split - this is holdout validation
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LogisticRegression(max_iter=200)
model.fit(X_train, y_train)
acc = accuracy_score(y_test, model.predict(X_test))
print(f"Holdout test accuracy: {acc:.3f}")
# OUTPUT (typical):
# Holdout test accuracy: 0.967`
            ],
            codeExplanations: [
                `<code>train_test_split</code> is called exactly ONCE, carving off 20% of the rows into <code>X_test</code>/<code>y_test</code> that the model never sees during <code>.fit()</code>. That single split is the entire "holdout validation" procedure - one training run, one evaluation, no repetition. It is fast and simple, but the reported <code>0.967</code> accuracy depends entirely on which particular rows happened to land in that one test set - a different <code>random_state</code> could easily produce a noticeably different number, especially on a small dataset like this 150-row iris set.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Holdout validation is the baseline every other validation strategy (K-Fold, Stratified K-Fold, Leave-One-Out, Time-Series CV) exists to improve on for particular situations - understanding exactly WHERE holdout falls short is what motivates all of them.
<ul>
<li>On a <strong>small dataset</strong>, a single 80/20 split can be lucky or unlucky purely by chance: the 20% that ends up in the test set might happen to be unusually easy or unusually hard examples, giving a performance estimate that does not reflect how the model will really behave on new data.</li>
<li>It also wastes data in a subtle way: the 20% held out for testing is never used to help the model learn, which matters more when there is not much data to begin with.</li>
<li>Because it produces only ONE number rather than a distribution of scores across multiple splits, holdout gives no sense of how much that score might vary - you cannot tell whether <code>0.967</code> is a stable estimate or a fluke.</li>
</ul>
This unreliability on small data is precisely why <strong>K-Fold Cross Validation</strong> exists: by repeating the train/test split K times over different partitions and averaging, it smooths out the luck of any single split at the cost of training the model K times instead of once.`,
            codeExamples: [
                `# Demonstrating how unstable a single holdout split can be on a SMALL dataset
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)
X, y = X[:40], y[:40]   # pretend we only have 40 rows (small dataset)

accuracies = []
for seed in range(10):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=seed
    )
    model = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
    accuracies.append(accuracy_score(y_test, model.predict(X_test)))

print("Holdout accuracy across 10 different random splits:", np.round(accuracies, 2))
print(f"Range: {min(accuracies):.2f} to {max(accuracies):.2f}")
# OUTPUT (typical):
# Holdout accuracy across 10 different random splits: [0.62 0.88 0.75 1.   0.62 0.88 1.   0.75 0.88 0.62]
# Range: 0.62 to 1.00`
            ],
            codeExplanations: [
                `The exact same model and the exact same 40 rows are split ten different ways, purely by changing <code>random_state</code>. The reported test accuracy swings wildly - from <code>0.62</code> to a perfect <code>1.00</code> - purely because of which handful of rows happened to land in the test set each time. On a small dataset like this, a SINGLE holdout split (the way it is normally used) could report any one of these numbers and you would have no way of knowing whether it was a lucky or unlucky draw - the entire motivation for averaging across multiple folds in K-Fold Cross Validation.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
A team training a model on <strong>10 million rows</strong> of transaction data does not reach for K-Fold Cross Validation - they use a plain 80/20 holdout split instead, and this is the correct engineering decision, not a shortcut. With 10 million rows, even a 20% test set still contains 2 million examples: more than enough for the law of large numbers to make a single split's estimate extremely stable, since any reasonably-sized random sample of that size will closely reflect the overall data distribution. Running 5-Fold or 10-Fold CV on top of that would mean training the model 5 or 10 times over instead of once, for a reliability improvement that is negligible at this scale - pure wasted compute, potentially hours or days of extra training time and cost for no meaningful benefit in the trustworthiness of the estimate.
<h3>Advantages</h3>
<ul>
<li><strong>Fast and cheap</strong> - only ONE training run is required, compared to K-Fold's K training runs, which matters enormously for expensive models.</li>
<li><strong>Simple to implement and reason about</strong> - a single train/test split is easy to set up, easy to explain to stakeholders, and easy to reproduce with a fixed random seed.</li>
<li><strong>The right choice on large datasets</strong> - once a dataset is large enough that a single random sample reliably represents the whole population, repeated resampling adds cost without adding real reliability.</li>
<li><strong>Necessary for very expensive-to-train models</strong> - a deep neural network that takes days to train on a GPU cluster simply cannot be retrained K times for cross-validation; holdout (often with a validation set for tuning, plus a final test set) is the only practical option.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Unreliable on small datasets</strong> - as shown above, the reported score can vary enormously depending purely on which rows landed in the test set, making it hard to trust a single number.</li>
<li><strong>No variance estimate</strong> - holdout gives one score with no sense of how stable or unstable that score is, unlike K-Fold which reports a mean AND a standard deviation across folds.</li>
<li><strong>Wastes data that could have helped training</strong> - the held-out test (and validation) portion never contributes to learning the model's parameters, which stings more when data is scarce.</li>
<li><strong>Easy to accidentally "leak" the test set</strong> - if a team repeatedly tunes hyperparameters while looking at test-set performance, the test set stops being a fair, untouched estimate of true generalization, which is why a three-way train/validation/test split is safer than a naive two-way split when tuning is involved.</li>
</ul>`,
            codeExamples: [
                `# A three-way holdout split: train / validation / test, used when tuning is needed
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)

# Step 1: carve off a final test set that will only be touched once, at the end
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
# Step 2: split the remainder into train and validation, used for tuning
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, random_state=0)

best_C, best_val_acc = None, 0
for C in [0.01, 0.1, 1, 10]:
    model = LogisticRegression(C=C, max_iter=200).fit(X_train, y_train)
    val_acc = accuracy_score(y_val, model.predict(X_val))
    if val_acc > best_val_acc:
        best_C, best_val_acc = C, val_acc

final_model = LogisticRegression(C=best_C, max_iter=200).fit(X_train, y_train)
test_acc = accuracy_score(y_test, final_model.predict(X_test))
print(f"Best C={best_C} (val_acc={best_val_acc:.3f})  Final untouched test accuracy: {test_acc:.3f}")
# OUTPUT (typical):
# Best C=1 (val_acc=0.967)  Final untouched test accuracy: 0.933`
            ],
            codeExplanations: [
                `The 150 rows are split TWICE, producing three disjoint sets: <code>X_train</code> to fit models, <code>X_val</code> to compare different values of the hyperparameter <code>C</code> against, and <code>X_test</code> which is set aside at the very start and never looked at until the single final evaluation line. Tuning happens entirely against the validation set, so by the time <code>test_acc</code> is computed it reflects a genuinely untouched estimate of generalization - if tuning had instead been done directly against the test set, repeatedly picking whichever <code>C</code> scored best on it would quietly leak test-set information into the model selection process and make the final reported number overly optimistic.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is holdout validation and how is it different from K-Fold Cross Validation?</td><td>Holdout validation splits the data ONCE into train and test sets and trains the model a single time; K-Fold Cross Validation repeats that split K times over different partitions and averages the results, giving a more reliable but K times more expensive estimate</td></tr>
<tr class='text-center'><td>When is a simple holdout split actually the RIGHT choice over K-Fold CV?</td><td>On very large datasets, where a single random split is already statistically representative of the whole population, and for expensive-to-train models like large deep neural networks, where training K separate times would be prohibitively costly in time and compute for little added reliability</td></tr>
<tr class='text-center'><td>Why is holdout validation considered unreliable on small datasets?</td><td>With few rows, which specific examples happen to land in the test set by chance can swing the reported performance substantially - an unlucky split might contain a disproportionate number of hard or easy examples, and there is no way to tell from a single number whether the estimate was lucky or unlucky</td></tr>
</table>`
        }
    ]
};
