import { Topic } from '../../coreJava';

export const trainingValidationTestData: Topic = {
    id: 'ml-fundamentals-training-validation-test-data',
    name: 'Training, Validation & Test Data',
    beginner: [
        {
            content: `<h4>You Can't Grade Your Own Homework With the Answer Key Memorized</h4>
<ul>
<li>If a model is trained AND evaluated on the exact same rows, a perfect score just means it memorized the answers - it tells you nothing about how the model will behave on a customer, patient, or transaction it has never seen. This is why ML datasets are split into separate, non-overlapping pieces before any training happens.</li>
<li><strong>Training Data</strong> - the rows the model actually learns from; the algorithm adjusts its internal parameters to fit these examples.</li>
<li><strong>Validation Data</strong> - a held-out slice used DURING development to tune choices like hyperparameters or to pick between competing models, without ever touching the final test set.</li>
<li><strong>Test Data</strong> - a final, untouched slice used exactly ONCE, at the very end, to report how the model is expected to perform in the real world.</li>
</ul>`,
            codeExamples: [
                `# Splitting a dataset into training, validation, and test sets
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=1000, n_features=10, random_state=0)

# First split off the test set (never touched again until the very end)
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# Then split the remainder into training and validation
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, random_state=0)

print(f"Training set:   {X_train.shape[0]} rows")
print(f"Validation set: {X_val.shape[0]} rows")
print(f"Test set:       {X_test.shape[0]} rows")
# OUTPUT:
# Training set:   600 rows
# Validation set: 200 rows
# Test set:       200 rows</br>(a common 60/20/20 split)`
            ],
            codeExplanations: [
                `<code>train_test_split</code> is called twice: first to carve off a 20% test set that is set aside and not looked at again during development, then to split the remaining 80% into training (60% of the original data) and validation (20% of the original data). This two-step split is the standard way to produce all three non-overlapping pieces - a single split only gives you two.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Without a validation set, the only way to tune a hyperparameter (like tree depth or learning rate) is to check performance on the test set - but every time you look at test performance and adjust something in response, you are indirectly fitting the model to the test set, which <strong>silently invalidates it</strong> as an honest measure of real-world performance.</li>
<li>Without a test set at all, there is no unbiased way to report "how good is this model really" - every number you have has already influenced some decision you made about the model.</li>
<li>The three-way split enforces a strict separation of concerns: training data teaches the model, validation data guides the HUMAN'S decisions about the model, and test data answers the question "how will this behave in production" exactly once.</li>
</ul>
<h3>Real-World Example</h3>
A hospital builds a diagnostic model that flags a scan as showing a tumor or not.
<ul>
<li>The team trains dozens of candidate models on the <strong>training set</strong>, and uses the <strong>validation set</strong> to compare architectures, tune thresholds, and decide which single model to move forward with - looking at validation results as many times as needed.</li>
<li>A <strong>test set</strong> of scans is held out from day one, and by policy even the model's own developers do not evaluate on it until the final regulatory submission. This mirrors real deployment: the model will eventually see scans no one on the team has ever looked at, so the test set has to represent that same "never seen it before" condition to be a trustworthy estimate.</li>
<li>If the developers had "peeked" at the test set even once during tuning - say, to break a tie between two models - the reported test accuracy would no longer honestly reflect how the model performs on truly new patients, which is exactly the guarantee a regulator or hospital administrator needs.</li>
</ul>`,
            codeExamples: [
                `# Using the validation set to choose a hyperparameter, then confirming with the test set exactly once
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.metrics import accuracy_score

X, y = make_classification(n_samples=1000, n_features=10, random_state=1)
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.2, random_state=1)
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, random_state=1)

best_depth, best_val_acc = None, 0
for depth in [2, 4, 6, 8, 10]:
    model = DecisionTreeClassifier(max_depth=depth, random_state=1)
    model.fit(X_train, y_train)
    val_acc = accuracy_score(y_val, model.predict(X_val))
    print(f"max_depth={depth:2d}  validation_accuracy={val_acc:.3f}")
    if val_acc > best_val_acc:
        best_depth, best_val_acc = depth, val_acc

# Only NOW, after the hyperparameter is locked in, do we touch the test set - once.
final_model = DecisionTreeClassifier(max_depth=best_depth, random_state=1)
final_model.fit(X_train, y_train)
test_acc = accuracy_score(y_test, final_model.predict(X_test))
print(f"\\nChosen max_depth={best_depth}  FINAL test_accuracy={test_acc:.3f}")
# OUTPUT (typical):
# max_depth= 2  validation_accuracy=0.780
# max_depth= 4  validation_accuracy=0.855
# max_depth= 6  validation_accuracy=0.870
# max_depth= 8  validation_accuracy=0.850
# max_depth=10  validation_accuracy=0.820
#
# Chosen max_depth=6  FINAL test_accuracy=0.865`
            ],
            codeExplanations: [
                `The loop trains a separate Decision Tree for each candidate <code>max_depth</code> and checks accuracy on the <strong>validation</strong> set - this is where the "which hyperparameter is best" decision is made, and it is fine to loop and re-check as many times as needed because the validation set's job is exactly to absorb this kind of repeated peeking. Once <code>best_depth</code> is locked in from validation results, the <strong>test</strong> set is evaluated exactly one time, at the end, to report a final, trustworthy accuracy number - notice the test set never appears anywhere inside the tuning loop.`
            ]
        },
        {
            content: `<h3>Typical Split Ratios and What Breaks Without Them</h3>
<ul>
<li>Common ratios are roughly <strong>70/15/15</strong> or <strong>60/20/20</strong> (train/validation/test) for small-to-medium datasets; for very large datasets (millions of rows) even a small percentage like 1-2% per validation/test slice is enough absolute rows to be statistically reliable, so teams often shift toward something like 98/1/1.</li>
<li><strong>Cross-validation</strong> is a common alternative to a single fixed validation split on smaller datasets: the training data is divided into K folds, and the model is trained K times, each time validating on a different fold - this uses the data more efficiently but the test set is still always held out separately.</li>
<li>All splits must respect real-world structure: if rows are time-ordered (e.g. stock prices), a random split leaks future information into training, so a chronological split (train on the past, test on the future) is required instead.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Honest performance estimates</strong> - a properly held-out test set gives a number that actually predicts real-world behavior, e.g. a fraud-detection team can tell their compliance department "94% precision on held-out data" with confidence, instead of an inflated in-sample number.</li>
<li><strong>Prevents silent overfitting to the evaluation process itself</strong> - separating validation from test stops the subtle but very common mistake of unconsciously tuning a model to quirks of one specific evaluation set.</li>
<li><strong>Enables fair model comparison</strong> - using the SAME validation set for every candidate model (linear regression vs random forest vs neural net) means differences in their scores reflect real differences in quality, not differences in which data each one happened to see.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Less data to train on</strong> - every row moved into validation or test is a row the model doesn't get to learn from, which can matter a lot on small datasets (e.g. a rare-disease dataset with only 500 patient records).</li>
<li><strong>A single test-set evaluation is still a sample</strong> - even an untouched test set gives one noisy estimate of true performance; a small or unrepresentative test set can still mislead, which is why reporting confidence intervals or using cross-validation matters for small data.</li>
<li><strong>Easy to violate by accident</strong> - re-running experiments and "just checking" the test set once, using test-set feedback to pick a preprocessing step, or having near-duplicate rows leak across the split (e.g. the same patient appearing in both train and test) can quietly break the whole guarantee.</li>
</ul>`,
            codeExamples: [
                `# A common mistake: information leaking from test into training via duplicate/related rows
import numpy as np
from sklearn.model_selection import train_test_split

# Simulate 5 patients, each contributing 4 scans (rows) - a realistic medical dataset shape
patient_ids = np.repeat(np.arange(5), 4)
X = np.arange(20).reshape(-1, 1)

# WRONG: a plain random split can put the same patient's scans in both train and test
X_train_bad, X_test_bad, ids_train_bad, ids_test_bad = train_test_split(
    X, patient_ids, test_size=0.25, random_state=0
)
leaked_patients = set(ids_train_bad) & set(ids_test_bad)
print("Patients appearing in BOTH train and test (leakage):", leaked_patients)

# RIGHT: split by whole patient, so all of one patient's scans stay on one side
unique_patients = np.unique(patient_ids)
train_patients, test_patients = train_test_split(unique_patients, test_size=0.25, random_state=0)
mask_train = np.isin(patient_ids, train_patients)
print("Patients in train:", sorted(train_patients), " Patients in test:", sorted(test_patients))
# OUTPUT (typical):
# Patients appearing in BOTH train and test (leakage): {0, 2, 3}
# Patients in train: [0, 1, 3, 4]  Patients in test: [2]`
            ],
            codeExplanations: [
                `The first split treats every scan (row) as independent and splits randomly, which can and does put different scans FROM THE SAME PATIENT into both the training and test sets - the model can partially "recognize" that patient's tissue patterns from training, inflating test accuracy in a way that won't hold up on a genuinely new patient. The second approach splits on the unique <code>patient_ids</code> first, then assigns every row belonging to a chosen patient entirely to one side, which is the correct way to split any dataset with natural groupings (patients, users, sessions) to avoid this kind of leakage.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between the validation set and the test set - aren't they both "held-out data"?</td><td>Both are held out from training, but the validation set is meant to be looked at repeatedly during development to guide decisions like hyperparameter tuning or model selection, while the test set is meant to be evaluated exactly once, at the very end, to report an unbiased estimate of real-world performance - reusing the test set for tuning defeats its purpose</td></tr>
<tr class='text-center'><td>Why is it wrong to report a model's final accuracy using the same data it was trained on?</td><td>A model can partially memorize training rows rather than learning the general pattern, so its performance on those same rows overstates how well it will do on genuinely new data; only performance on data it never saw during training or tuning is a fair estimate of real-world behavior</td></tr>
<tr class='text-center'><td>If you keep adjusting your model based on test-set results, why does that invalidate the test set?</td><td>Each adjustment made in response to test performance is effectively fitting the model (or the human's choices about it) to that specific test set, so the test set stops representing truly unseen data - at that point it has become a second validation set in disguise, and you no longer have an honest final number</td></tr>
</table>`
        }
    ]
};
