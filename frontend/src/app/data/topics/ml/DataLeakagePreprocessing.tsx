import { Topic } from '../../coreJava';

export const dataLeakage: Topic = {
    id: 'ml-data-preprocessing-data-leakage',
    name: 'Data Leakage',
    beginner: [
        {
            content: `<h4>When Information the Model Shouldn't Have Sneaks In</h4>
<ul>
<li><strong>Data Leakage</strong> happens when information that would NOT actually be available at real prediction time somehow ends up influencing model training - making the model look far better during development than it actually performs once deployed.</li>
<li>The classic example: a hospital readmission model that includes <code>discharge_date</code> as a feature. But <code>discharge_date</code> is only known AFTER a patient's stay is already over - it's essentially a proxy for the outcome the model is supposed to be PREDICTING, not information available beforehand.</li>
<li>Leakage is dangerous precisely because it's invisible in normal testing - the model's validation accuracy looks great, and the problem only surfaces once the model is deployed on truly new data and its performance mysteriously collapses.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(0)
n = 1000
readmitted = rng.integers(0, 2, n)   # target: was the patient readmitted?

# LEAKY feature: discharge_date is only recorded once the stay (and outcome) is already over,
# and is engineered here to correlate almost perfectly with the outcome itself
discharge_date_days = 100 + readmitted * 30 + rng.normal(0, 2, n)

# a genuinely available-at-prediction-time feature
age = rng.uniform(18, 90, n)

X_leaky = np.column_stack([age, discharge_date_days])
X_train, X_test, y_train, y_test = train_test_split(X_leaky, readmitted, test_size=0.2, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
print(f"Accuracy WITH leaky discharge_date feature: {accuracy_score(y_test, model.predict(X_test)):.3f}")
# OUTPUT (typical):
# Accuracy WITH leaky discharge_date feature: 0.985`
            ],
            codeExplanations: [
                `<code>discharge_date_days</code> is deliberately constructed to be almost a direct stand-in for the <code>readmitted</code> target it's supposed to help predict - mimicking how, in a real hospital dataset, a discharge-related timestamp can end up statistically entangled with the outcome because it's only ever recorded once the outcome is already known. Training a plain <code>LogisticRegression</code> on this feature achieves a suspiciously high <code>0.985</code> accuracy - suspiciously good for a real medical prediction problem, which is exactly the red flag that should prompt an engineer to ask "would this feature actually be available BEFORE the moment I need to make this prediction?" In production, discharge_date for a currently-admitted patient doesn't exist yet, so a model relying on it cannot function at all outside of testing.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>Leakage produces impossibly good validation metrics that collapse in deployment.</strong> Because the leaked information is a near-perfect stand-in for the outcome, the model appears to "solve" the problem during development - only for real-world performance to crash once the model faces genuinely new data where that leaked information either doesn't exist yet or was never truly predictive to begin with.</li>
<li><strong>It's often invisible until it's too late.</strong> Standard train/test evaluation, cross-validation, and even a held-out test set can all fail to catch leakage if the SAME leaked information is present and structured the same way across every split - the bug isn't in the evaluation procedure itself, it's baked into what the feature actually represents.</li>
<li><strong>It erodes trust in the entire ML process</strong> once discovered - a team that ships a model with 98% validation accuracy that then performs at 60% in production has to retroactively re-audit every feature and every step of the pipeline, a far more expensive fix than catching it before deployment.</li>
</ul>
<h3>Real-World Example</h3>
A hospital builds a model to predict whether a patient will be readmitted within 30 days of discharge, intended to be used WHILE a patient is still admitted, so staff can intervene early. The engineering team includes <code>discharge_date</code> as a feature because it's present in the historical dataset and correlates strongly with the outcome. The model achieves excellent validation accuracy. But <code>discharge_date</code> is only recorded once a patient's stay concludes - it is not available at the moment the model is actually meant to be used (mid-stay, before discharge has happened). When deployed on currently-admitted patients (who have no <code>discharge_date</code> yet), the model either can't run at all or falls back to a placeholder value that destroys its real predictive power - the validation metrics were measuring something that could never happen in the model's actual use case.`,
            codeExamples: [
                `# Contrasting a leaky feature-set vs. a legitimate, prediction-time-available feature-set
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(1)
n = 1000
readmitted = rng.integers(0, 2, n)

age = rng.uniform(18, 90, n)
prior_admissions = rng.poisson(1.5, n) + readmitted * rng.integers(0, 2, n)  # weak, honest signal
discharge_date_days = 100 + readmitted * 30 + rng.normal(0, 2, n)            # leaky - post-outcome info

X_legit = np.column_stack([age, prior_admissions])          # only info available DURING the stay
X_leaky = np.column_stack([age, prior_admissions, discharge_date_days])

for name, X in [("Legitimate features only", X_legit), ("Legitimate + leaky discharge_date", X_leaky)]:
    X_train, X_test, y_train, y_test = train_test_split(X, readmitted, test_size=0.2, random_state=0)
    model = LogisticRegression().fit(X_train, y_train)
    print(f"{name:34s} accuracy: {accuracy_score(y_test, model.predict(X_test)):.3f}")
# OUTPUT (typical):
# Legitimate features only          accuracy: 0.583   <- realistic, honest difficulty of the problem
# Legitimate + leaky discharge_date accuracy: 0.981   <- artificially inflated by post-outcome information`
            ],
            codeExplanations: [
                `<code>prior_admissions</code> represents a genuinely available, pre-outcome signal (a patient's admission history known at intake), while <code>discharge_date_days</code> is only ever recorded once the outcome has already occurred. The model trained on only legitimate, prediction-time-available features gets a modest <code>0.583</code> accuracy - reflecting how genuinely hard real readmission prediction is. Adding the leaky <code>discharge_date_days</code> feature jumps accuracy to <code>0.981</code> - not because the model got smarter, but because it found a feature that's essentially derived from knowing the outcome already happened. This side-by-side comparison is exactly the kind of sanity check ("does removing this one feature cause accuracy to crash unrealistically?") that helps catch leakage before deployment.`
            ]
        },
        {
            content: `<h3>Other Common Leakage Sources</h3>
<ul>
<li><strong>Fitting a scaler/encoder on the full dataset before splitting.</strong> Calling <code>StandardScaler().fit(X)</code> on the ENTIRE dataset (including what will become the test set) lets test-set statistics (its mean, its min/max, its category averages) influence how training data gets transformed - the model's training process indirectly "sees" information about the test set's distribution before it's supposed to be evaluated against it.</li>
<li><strong>Duplicate or near-duplicate rows split across train and test.</strong> If the same customer, transaction, or a near-identical record appears in both the training and test sets (common with scraped or merged datasets), the model can partially "memorize" that record during training and then get an artificially easy win when it reappears in test - inflating metrics without reflecting any real generalization ability.</li>
<li><strong>Target-derived features computed on the whole dataset</strong> (e.g. target encoding a category using its average outcome across ALL rows, test rows included) - a specific, common case of the same underlying problem: statistics that should only ever be computed from training data leak in from data the model isn't supposed to have access to yet.</li>
</ul>`,
            codeExamples: [
                `# Duplicate rows split across train/test silently inflate test accuracy
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(2)
n_unique = 400
X_unique = rng.normal(0, 1, size=(n_unique, 3))
y_unique = (X_unique[:, 0] + X_unique[:, 1] > 0).astype(int)

# simulate a merged/scraped dataset where 150 rows are accidental near-duplicates of earlier rows
dup_idx = rng.choice(n_unique, size=150, replace=True)
X_all = np.vstack([X_unique, X_unique[dup_idx] + rng.normal(0, 0.01, size=(150, 3))])
y_all = np.concatenate([y_unique, y_unique[dup_idx]])

# WITHOUT deduplication - duplicates can land on both sides of the split
X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.25, random_state=0)
model = LogisticRegression().fit(X_train, y_train)
acc_with_dupes = accuracy_score(y_test, model.predict(X_test))

# after removing near-duplicate rows first (kept only the 400 originally unique rows)
X_train2, X_test2, y_train2, y_test2 = train_test_split(X_unique, y_unique, test_size=0.25, random_state=0)
model2 = LogisticRegression().fit(X_train2, y_train2)
acc_deduped = accuracy_score(y_test2, model2.predict(X_test2))

print(f"Accuracy WITH near-duplicates split across train/test: {acc_with_dupes:.3f}")
print(f"Accuracy on deduplicated data:                         {acc_deduped:.3f}")
# OUTPUT (typical):
# Accuracy WITH near-duplicates split across train/test: 0.914
# Accuracy on deduplicated data:                         0.870`
            ],
            codeExplanations: [
                `150 near-duplicate rows (the same underlying data point with tiny noise added, mimicking a real merged/scraped dataset with accidental duplication) are mixed into the full dataset before splitting. Because <code>train_test_split</code> treats every row as independent, some duplicates end up in the training set while their near-identical twin lands in the test set - when evaluated, the model effectively gets to "recognize" a row it already trained on almost exactly, inflating accuracy to <code>0.914</code>. Running the same experiment on data with duplicates removed first gives a lower, more honest <code>0.870</code> - the gap between the two numbers represents exactly how much of the first model's "performance" was actually just memorization of near-identical training rows, rather than genuine generalization to new records.`
            ]
        },
        {
            content: `<h3>Why It Stays Invisible - and How to Guard Against It</h3>
<ul>
<li><strong>Leakage often survives even careful evaluation</strong> because it's baked into the DATA and FEATURES themselves, not into the train/test splitting or metric-calculation code - a perfectly correct train/test split, done with proper stratification and no code bugs, will still report inflated metrics if a leaky feature or leaky preprocessing step is present.</li>
<li><strong>The standard defense is asking, for every single feature: "would this value actually be known and available at the exact moment I need to make this prediction in production?"</strong> - if the honest answer is no (it depends on the outcome, or is only recorded afterward), the feature must be removed regardless of how much it improves validation metrics.</li>
<li><strong>Structural safeguards help</strong: always split before any preprocessing is fit; use a <code>Pipeline</code> so preprocessing is automatically re-fit per cross-validation fold rather than once globally; deduplicate records before splitting; and treat any suspiciously perfect validation score as a signal to investigate for leakage rather than a reason to celebrate.</li>
</ul>
<h3>Advantages of Catching Leakage Early</h3>
<ul>
<li><strong>Avoids costly production failures</strong> - catching a leaky feature during development is far cheaper than discovering it after a model has already been deployed and made real, consequential decisions.</li>
<li><strong>Produces evaluation metrics that can actually be trusted</strong> - once leakage is ruled out, a reported accuracy/F1/recall genuinely reflects what to expect from the model on new data.</li>
</ul>
<h3>Disadvantages / Challenges in Preventing It</h3>
<ul>
<li><strong>No single automated check catches all forms of leakage</strong> - it requires genuine domain knowledge about WHEN each piece of data becomes available, which can't always be inferred purely from column names or statistics.</li>
<li><strong>Removing a leaky feature often causes a large, uncomfortable drop in reported metrics</strong> - teams under pressure to show strong results can be tempted to keep a leaky feature, especially when the leakage is subtle rather than as obvious as a raw outcome-derived column.</li>
<li><strong>Leakage can reappear even after being fixed once</strong> - a new feature added later, or a new preprocessing step, can reintroduce the same class of problem if the "would this be available at prediction time?" question isn't asked again for every future feature.</li>
</ul>`,
            codeExamples: [
                `# A simple, repeatable leakage sanity check: does removing a feature cause a suspicious accuracy cliff?
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(3)
n = 1000
readmitted = rng.integers(0, 2, n)
age = rng.uniform(18, 90, n)
prior_admissions = rng.poisson(1.5, n) + readmitted * rng.integers(0, 2, n)
discharge_date_days = 100 + readmitted * 30 + rng.normal(0, 2, n)

feature_sets = {
    "all features (incl. discharge_date)": np.column_stack([age, prior_admissions, discharge_date_days]),
    "without discharge_date": np.column_stack([age, prior_admissions]),
}

for name, X in feature_sets.items():
    pipeline = Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression())])
    scores = cross_val_score(pipeline, X, readmitted, cv=5)
    print(f"{name:38s} mean CV accuracy: {scores.mean():.3f}")
# OUTPUT (typical):
# all features (incl. discharge_date)   mean CV accuracy: 0.978
# without discharge_date                mean CV accuracy: 0.582
# -> A ~40-point accuracy cliff from removing one feature is a strong signal that feature is leaking the outcome`
            ],
            codeExplanations: [
                `<code>cross_val_score</code> with a <code>Pipeline</code> ensures the scaler is refit correctly within each fold (no separate leakage from preprocessing), isolating the comparison to just the effect of including or excluding <code>discharge_date_days</code>. The dramatic ~40-point accuracy drop (from <code>0.978</code> to <code>0.582</code>) when that one feature is removed is precisely the kind of red flag that should trigger a manual review: a genuinely useful, honestly-available feature rarely causes that large a swing on its own, whereas a feature that is essentially derived from the outcome itself often does. This "remove one feature and check for a cliff" technique is a practical, repeatable habit for catching suspected leakage before a model ever reaches production.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is data leakage, and why is the hospital "discharge_date" example a classic case of it?</td><td>Data leakage is when information that wouldn't actually be available at real prediction time influences model training, making validation metrics look far better than true production performance; discharge_date is only known once a patient's stay (and outcome) is already over, so a model using it to predict readmission is effectively using post-outcome information it will never have access to when actually needed - mid-stay, before discharge</td></tr>
<tr class='text-center'><td>How does fitting a scaler on the full dataset before splitting cause data leakage?</td><td>The scaler's learned mean/standard-deviation (or an encoder's learned category statistics) end up computed using rows that will become the test set, so training data is transformed using information partially derived from data the model is supposed to have never seen - producing test-set evaluation metrics that are more optimistic than the model's genuine ability to generalize to truly new data</td></tr>
<tr class='text-center'><td>Why is data leakage often invisible until a model fails in production, despite passing validation with excellent metrics?</td><td>Leakage is typically baked into the data and features themselves rather than into the train/test-splitting or metric-calculation code, so a technically correct evaluation procedure (proper split, correct metric) still reports inflated results if a leaky feature or leaky preprocessing step is present; it usually only surfaces once the model faces genuinely new production data where the leaked information either doesn't exist yet or was never truly predictive</td></tr>
</table>`
        }
    ]
};
