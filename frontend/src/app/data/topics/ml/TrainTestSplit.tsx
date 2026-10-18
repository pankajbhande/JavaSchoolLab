import { Topic } from '../../coreJava';

export const trainTestSplit: Topic = {
    id: 'ml-data-preprocessing-train-test-split',
    name: 'Train-Test Split',
    beginner: [
        {
            content: `<h4>Holding Back Data to Get an Honest Performance Estimate</h4>
<ul>
<li>A <strong>Train-Test Split</strong> divides a dataset into a portion used to TRAIN the model and a portion held back purely to EVALUATE it, so performance is measured on data the model has genuinely never seen.</li>
<li>Common ratios: <strong>80/20</strong> (train/test) for a simple split, or <strong>70/15/15</strong> (train/validation/test) when a separate validation set is needed for tuning hyperparameters without touching the final test set at all.</li>
<li>If a model is evaluated on the same data it was trained on, its score reflects how well it MEMORIZED the training data, not how well it will perform on new, real-world data - the test set exists specifically to catch that gap.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(0)
X = rng.normal(0, 1, size=(1000, 5))
y = (X[:, 0] + X[:, 1] > 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

model = DecisionTreeClassifier(max_depth=None, random_state=0).fit(X_train, y_train)
train_acc = accuracy_score(y_train, model.predict(X_train))
test_acc = accuracy_score(y_test, model.predict(X_test))

print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
print(f"Accuracy on TRAINING data: {train_acc:.3f}")
print(f"Accuracy on TEST data:     {test_acc:.3f}")
# OUTPUT (typical):
# Train size: 800, Test size: 200
# Accuracy on TRAINING data: 1.000
# Accuracy on TEST data:     0.870`
            ],
            codeExplanations: [
                `<code>train_test_split(X, y, test_size=0.2, random_state=0)</code> randomly holds back 20% of the rows (200 out of 1000) as a test set the model never trains on, using the remaining 800 for <code>.fit()</code>. An unrestricted <code>DecisionTreeClassifier</code> reaches a perfect <code>1.000</code> accuracy on the training data it memorized, but only <code>0.870</code> on the held-out test data it has never seen - that gap is exactly what a train/test split is designed to reveal: without it, the model's reported "1.000 accuracy" would create a false impression of how well it actually generalizes to new, unseen data.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>Evaluating on training data always overstates real-world performance</strong> - any model with enough capacity can partially or fully memorize the data it was trained on, so a training-set score is, at best, an overly optimistic upper bound and, at worst, completely disconnected from how the model will behave on genuinely new inputs.</li>
<li><strong>The split must happen BEFORE any preprocessing is fit</strong> - fitting a <code>StandardScaler</code>, an imputer, or a target encoder on the FULL dataset before splitting lets statistics from the "test" rows leak into the transformations applied to training data. This is <strong>data leakage</strong>: the model's evaluation ends up partially informed by data it's supposed to have never seen, producing metrics that look better than true out-of-sample performance.</li>
<li><strong>A random split can badly misrepresent a rare class.</strong> If churned customers make up only 4% of a dataset, a plain random 80/20 split might by chance put very few (or even zero) churned customers in the test set - the resulting test accuracy/recall would then be based on almost no real signal about the class that actually matters.</li>
</ul>
<h3>Real-World Example</h3>
A telecom company splits a customer churn dataset 80/20 to build and evaluate a churn-prediction model. Churned customers make up only about 6% of the dataset. Splitting with plain random sampling, by chance, could place a badly skewed proportion of churners into the test set - sometimes far fewer than 6%, sometimes more - making the reported test performance unstable and unreliable from one random split to the next. A <strong>stratified split</strong> fixes this by explicitly preserving the same 6% churn ratio in both the train and test sets, so the evaluation is a fair, representative measure of how the model performs on the true population, not an artifact of random luck in how the split happened to fall.`,
            codeExamples: [
                `# Comparing a plain random split vs. a stratified split on an imbalanced churn dataset
import numpy as np
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
n = 1000
y = np.zeros(n, dtype=int)
churn_idx = rng.choice(n, size=int(n * 0.06), replace=False)   # 6% churn
y[churn_idx] = 1
X = rng.normal(0, 1, size=(n, 4))

# plain random split
_, _, y_train_rand, y_test_rand = train_test_split(X, y, test_size=0.2, random_state=1)

# stratified split - preserves the 6% churn ratio in both sets
_, _, y_train_strat, y_test_strat = train_test_split(X, y, test_size=0.2, random_state=1, stratify=y)

print(f"Overall churn rate:              {y.mean():.4f}")
print(f"Random split  - train/test rate: {y_train_rand.mean():.4f} / {y_test_rand.mean():.4f}")
print(f"Stratified split - train/test rate: {y_train_strat.mean():.4f} / {y_test_strat.mean():.4f}")
# OUTPUT (typical):
# Overall churn rate:              0.0600
# Random split  - train/test rate: 0.0550 / 0.0800
# Stratified split - train/test rate: 0.0600 / 0.0600`
            ],
            codeExplanations: [
                `The plain random split (no <code>stratify</code> argument) produces train/test churn rates of <code>0.0550</code> and <code>0.0800</code> - noticeably different from each other and from the true overall rate of <code>0.0600</code>, purely due to random chance in which rows landed where. Passing <code>stratify=y</code> tells <code>train_test_split</code> to preserve the class PROPORTION in both resulting sets - both train and test come out at exactly <code>0.0600</code>, matching the true population rate. For any classification problem with a meaningfully imbalanced target, <code>stratify=y</code> removes an entire source of evaluation noise that would otherwise make test metrics bounce around unpredictably between different random splits.`
            ]
        },
        {
            content: `<h3>Splitting Must Come Before Preprocessing</h3>
<ul>
<li>The correct order is always: <strong>split first, fit preprocessing second</strong> - <code>train_test_split</code> runs on the raw data, THEN any scaler, imputer, or encoder is fit exclusively on <code>X_train</code> and applied (never re-fit) to <code>X_test</code>.</li>
<li>Fitting a scaler on the combined train+test data before splitting means the test set's own mean/std/min/max silently influenced how the training data was transformed - a subtle version of the model "peeking" at test-set statistics before it's supposed to see any of that data, directly tying to the broader concept of <strong>Data Leakage</strong>.</li>
<li>The same discipline extends to cross-validation: preprocessing should be fit separately within EACH fold's training portion (typically handled automatically by wrapping preprocessing and the model together in a <code>Pipeline</code>), not once on the whole dataset before folds are created.</li>
</ul>
<h3>Time-Ordered Data: Never Split Randomly</h3>
<ul>
<li>For time-series data (stock prices, sensor readings, sales over time), a random train/test split can put FUTURE rows in the training set and PAST rows in the test set - the model would then be evaluated on predicting the past using information from the future, which is impossible in real deployment and produces wildly unrealistic performance estimates.</li>
<li>The correct approach is a <strong>chronological split</strong>: train on data up to a certain date, test only on data that comes strictly AFTER it - matching how the model will actually be used in production, predicting forward in time from information available so far. This generalizes to <strong>Time-Series Cross Validation</strong>, where each fold's training window only ever contains data earlier than its corresponding validation window.</li>
</ul>`,
            codeExamples: [
                `# Chronological split vs. a random split on time-ordered data - random split leaks the future
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
dates = pd.date_range("2024-01-01", periods=365, freq="D")
# a trend that clearly changes over time - a stand-in for real seasonal/trend patterns
sales = 100 + np.arange(365) * 0.5 + rng.normal(0, 5, 365)
df = pd.DataFrame({"date": dates, "sales": sales}).sort_values("date").reset_index(drop=True)

# WRONG: random split can scatter future rows into "training" and past rows into "test"
random_test = df.sample(frac=0.2, random_state=0)
print("Random split - max date in test set that's BEFORE max date in train set (a sign of leakage):")
print("  Test set date range: ", random_test["date"].min().date(), "to", random_test["date"].max().date())

# CORRECT: chronological split - train on the past, test on the future
split_point = int(len(df) * 0.8)
train_chrono, test_chrono = df.iloc[:split_point], df.iloc[split_point:]
print("Chronological split:")
print("  Train date range:", train_chrono["date"].min().date(), "to", train_chrono["date"].max().date())
print("  Test date range: ", test_chrono["date"].min().date(), "to", test_chrono["date"].max().date())
# OUTPUT (typical):
# Random split - max date in test set that's BEFORE max date in train set (a sign of leakage):
#   Test set date range:  2024-01-04 to 2024-12-28
# Chronological split:
#   Train date range: 2024-01-01 to 2024-09-21
#   Test date range:  2024-09-22 to 2024-12-30`
            ],
            codeExplanations: [
                `The random split (<code>df.sample(frac=0.2)</code>) scatters test rows across the ENTIRE year (Jan 4 to Dec 28), meaning many training rows come from LATER in the year than many test rows - a model trained this way could accidentally learn from a January-through-December trend that includes information "from the future" relative to some of its own test points, which is impossible in real deployment where only past data is ever available. The chronological split instead uses <code>.iloc[:split_point]</code> and <code>.iloc[split_point:]</code> on data already sorted by date, so training strictly covers Jan-Sept and testing strictly covers the following Sept-Dec - exactly mirroring how the model would actually be used in production: trained on history, evaluated on predicting what comes next.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Gives an honest, unbiased performance estimate</strong> - evaluating on data the model never trained on directly measures generalization rather than memorization.</li>
<li><strong>Simple and fast to implement</strong> - a single <code>train_test_split</code> call is enough for quick iteration during early model development, before investing in more expensive cross-validation.</li>
<li><strong>Stratification and chronological splitting adapt the same core idea to real-world data shapes</strong> - imbalanced classes and time-ordered data both have straightforward, well-supported variants (<code>stratify=y</code>, chronological/time-series splits) rather than needing an entirely different evaluation approach.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>A single split gives only one performance estimate</strong> - depending on which rows randomly land in the test set, the reported metric can vary meaningfully between runs; <code>k-fold cross-validation</code> is often preferred for a more stable estimate, especially on smaller datasets.</li>
<li><strong>Reduces the amount of data available for training</strong> - holding back 20-30% of data for testing means the model trains on less data than it could otherwise use, which matters more when the total dataset is small.</li>
<li><strong>Easy to get wrong silently</strong> - fitting preprocessing before splitting, forgetting to stratify an imbalanced target, or randomly splitting time-ordered data all produce code that runs without error but yields a misleadingly optimistic (or simply wrong) evaluation.</li>
<li><strong>A single held-out test set can be "overfit to" over many iterations</strong> - repeatedly tuning a model based on test-set performance (rather than a separate validation set) turns the test set into a de facto part of the training process, undermining its purpose as a final, honest check.</li>
</ul>`,
            codeExamples: [
                `# Full correct order: split -> preprocess (fit on train only) -> train -> evaluate
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(0)
n = 800
y = np.zeros(n, dtype=int)
churn_idx = rng.choice(n, size=int(n * 0.08), replace=False)
y[churn_idx] = 1
X = rng.normal(0, 1, size=(n, 4))
X[churn_idx] += 1.0

# 1) SPLIT first (stratified, since churn is imbalanced)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

# 2) PREPROCESS + TRAIN together in a pipeline - scaler is fit only on X_train internally
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression()),
])
pipeline.fit(X_train, y_train)

# 3) EVALUATE only on the untouched test set
print(f"Test accuracy: {accuracy_score(y_test, pipeline.predict(X_test)):.3f}")
print(f"Train churn rate: {y_train.mean():.3f}  Test churn rate: {y_test.mean():.3f}")
# OUTPUT (typical):
# Test accuracy: 0.919
# Train churn rate: 0.080  Test churn rate: 0.081`
            ],
            codeExplanations: [
                `This demonstrates the full correct order of operations end to end: <code>train_test_split(..., stratify=y)</code> runs FIRST, on raw unprocessed data, preserving the churn ratio in both sets. Only afterward is a <code>Pipeline</code> (scaler + classifier) fit via <code>pipeline.fit(X_train, y_train)</code> - internally, <code>StandardScaler</code> learns its mean/std exclusively from <code>X_train</code>, and that same learned scaling is applied to <code>X_test</code> automatically when <code>pipeline.predict(X_test)</code> is called, with test statistics never influencing the fit. The nearly identical train/test churn rates (<code>0.080</code> vs <code>0.081</code>) confirm the stratified split worked correctly, and the reported test accuracy reflects genuine generalization performance rather than a number inflated by leaked test-set information.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must preprocessing (scaling, imputation, encoding) be fit AFTER splitting into train and test, not before?</td><td>Fitting a scaler or encoder on the combined dataset before splitting lets statistics from the test set (its mean, min/max, category averages, etc.) influence how training data is transformed - a form of data leakage that makes the model's evaluation metrics look better than its true out-of-sample performance; the correct order is split first, then fit preprocessing only on the training portion and apply it unchanged to the test set</td></tr>
<tr class='text-center'><td>When would you use a stratified train-test split instead of a plain random split?</td><td>When the target class is imbalanced (e.g. churn or fraud, where the minority class is rare) - a plain random split can by chance place a skewed proportion of the rare class into the test set, making evaluation metrics unstable across different random splits; <code>stratify=y</code> forces both the train and test sets to preserve the same class ratio as the full dataset</td></tr>
<tr class='text-center'><td>Why is randomly splitting time-ordered data into train/test a mistake?</td><td>A random split can place future rows into the training set and past rows into the test set, letting the model implicitly learn from information that would not actually be available at prediction time in production; the correct approach is a chronological split (train on earlier data, test only on strictly later data), which generalizes to time-series cross-validation for more rigorous evaluation</td></tr>
</table>`
        }
    ]
};
