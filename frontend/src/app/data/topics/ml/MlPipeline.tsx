import { Topic } from '../../coreJava';

export const mlPipeline: Topic = {
    id: 'ml-mlops-ml-pipeline',
    name: 'ML Pipeline',
    beginner: [
        {
            content: `<h4>Chaining the Steps So They Always Run the Same Way</h4>
<ul>
<li>An <strong>ML Pipeline</strong> chains every step of the ML workflow - data ingestion, preprocessing (cleaning, scaling, encoding), model training, evaluation, and deployment - into a single, repeatable, automated flow instead of a sequence of manual, hand-run notebook cells.</li>
<li>The core problem it solves: if preprocessing steps (like scaling or imputing missing values) are applied by hand in a notebook, it's easy to accidentally apply them DIFFERENTLY (or forget a step entirely) when the model is later used to predict on new data - causing silent bugs. A pipeline bakes the exact steps and their order into one object.</li>
<li>In scikit-learn, this is literally the <code>Pipeline</code> class - a list of named steps that are always applied in the same order, both during <code>.fit()</code> (training) and <code>.predict()</code> (inference).</li>
</ul>`,
            codeExamples: [
                `from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
import numpy as np

X, y = load_breast_cancer(return_X_y=True)
rng = np.random.default_rng(0)
mask = rng.random(X.shape) < 0.05
X[mask] = np.nan   # simulate some missing values, like a real messy dataset

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="mean")),   # fill missing values
    ("scaler", StandardScaler()),                    # standardize features
    ("classifier", LogisticRegression(max_iter=1000)),
])

pipeline.fit(X_train, y_train)   # runs impute -> scale -> train, in that exact order
print(f"Test accuracy: {pipeline.score(X_test, y_test):.3f}")

# The SAME three steps, in the SAME order, are applied automatically at prediction time -
# no risk of forgetting to scale or impute new incoming data the way training data was handled.
new_patient = X_test[:1]
print(f"Prediction for one new patient: {pipeline.predict(new_patient)[0]}")
# OUTPUT (typical):
# Test accuracy: 0.965
# Prediction for one new patient: 1`
            ],
            codeExplanations: [
                `This builds a scikit-learn Pipeline chaining three steps - missing-value imputation, feature scaling, then a logistic regression classifier - and simulates a realistic messy dataset by randomly injecting NaN values. Calling pipeline.fit() runs all three steps in order on the training data: first the imputer learns the mean of each column and fills gaps, then the scaler learns each feature's mean/standard deviation and standardizes it, then the classifier trains on the fully-cleaned, scaled data. The critical detail is what happens at prediction time: calling pipeline.predict() on a brand-new, unseen row automatically re-applies the SAME imputer and scaler (using the statistics LEARNED from training data, not recomputed from the new row) before feeding it to the classifier - guaranteeing new data is processed identically to how training data was processed, which is exactly the kind of consistency bug that hand-run notebook code is prone to introducing.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>"It worked in my notebook" is not the same as "it's ready for production." A notebook is typically run top-to-bottom by hand, with intermediate results eyeballed at each step, using whatever version of the data happened to be loaded at the time - none of that is REPRODUCIBLE or AUTOMATABLE, and a notebook has no way to run itself again next week on fresh data without a human re-executing every cell.</li>
<li>A very common and dangerous notebook bug: fitting a <code>StandardScaler</code> or similar preprocessor on the FULL dataset (train + test combined) before splitting - this leaks statistics from the test set into training (<strong>data leakage</strong>), producing an evaluation score that looks great in the notebook but doesn't hold up once the model faces truly unseen data in production. A properly built Pipeline, combined with correct train/test splitting discipline, structurally prevents this by ensuring <code>.fit()</code> on the preprocessing steps only ever sees training data.</li>
<li>Once in production, a model isn't a one-time artifact - the real world changes underneath it. <strong>Data drift</strong> (the statistical distribution of INPUT features changes over time, e.g. customer demographics shifting) and <strong>concept drift</strong> (the relationship between inputs and the TARGET changes, e.g. fraud patterns evolving as fraudsters adapt) both silently degrade a deployed model's accuracy. Without an automated pipeline that can be re-triggered - re-ingest fresh data, re-train, re-evaluate, and only re-deploy if the new model actually performs better - a team has no practical way to keep the model current, and stale models in production are one of the most common real-world ML failures.</li>
</ul>
<h3>The Bigger MLOps Picture</h3>
<ul>
<li>A production ML pipeline is usually orchestrated by a tool (e.g. Airflow, Kubeflow Pipelines, or a cloud-native equivalent like SageMaker Pipelines/Vertex AI Pipelines) that runs each stage as a separate, versioned, monitored step - <strong>Data Ingestion</strong> (pull fresh data from a warehouse/stream) -&gt; <strong>Validation</strong> (schema checks, distribution checks - catch bad data BEFORE it corrupts training) -&gt; <strong>Preprocessing</strong> -&gt; <strong>Training</strong> -&gt; <strong>Evaluation</strong> (compare against the currently-deployed model on a held-out set - only promote if it's actually better) -&gt; <strong>Deployment</strong> (often gradual, e.g. canary or shadow deployment) -&gt; <strong>Monitoring</strong> (track live prediction distributions and, once available, real outcomes to detect drift) -&gt; loops back to triggering retraining.</li>
<li>This is the difference between "a model" and "an ML SYSTEM" - the model is one component; the pipeline, monitoring, versioning, and automated retraining around it are what make it trustworthy and maintainable in production over time, which is the discipline generally called <strong>MLOps</strong>.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating data leakage WITHOUT a pipeline, vs. correct behavior WITH one
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=200, n_features=10, random_state=0)

# --- WRONG: scaling before splitting leaks test-set statistics into training ---
scaler_leaky = StandardScaler()
X_scaled_leaky = scaler_leaky.fit_transform(X)   # sees ALL 200 rows, including future "test" rows
X_train_leaky, X_test_leaky, y_train_leaky, y_test_leaky = train_test_split(
    X_scaled_leaky, y, test_size=0.3, random_state=0
)
model_leaky = LogisticRegression().fit(X_train_leaky, y_train_leaky)
print(f"Leaky approach test accuracy:   {model_leaky.score(X_test_leaky, y_test_leaky):.3f}")

# --- CORRECT: split first, then a pipeline fits the scaler on TRAIN ONLY ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression()),
])
pipeline.fit(X_train, y_train)   # scaler only ever sees X_train's statistics
print(f"Pipeline (correct) test accuracy: {pipeline.score(X_test, y_test):.3f}")
# OUTPUT (typical - the leaky number is often optimistically inflated vs. the honest one,
# and the gap widens on smaller datasets or datasets with more extreme test-set outliers):
# Leaky approach test accuracy:   0.883
# Pipeline (correct) test accuracy: 0.867`
            ],
            codeExplanations: [
                `This directly contrasts the classic notebook mistake with the pipeline-enforced correct approach. In the "WRONG" block, StandardScaler.fit_transform is called on the FULL 200-row dataset before train_test_split even runs - meaning the scaler's learned mean and standard deviation are computed using information from rows that will later become the "unseen" test set, a subtle form of data leakage that makes the reported test accuracy an overly optimistic estimate of how the model will really perform on genuinely new data. In the "CORRECT" block, the split happens FIRST, and the Pipeline's scaler is fit only via pipeline.fit(X_train, y_train) - scikit-learn's Pipeline guarantees every preprocessing step's .fit() only ever touches whatever data was passed to the pipeline's own .fit() call, structurally preventing the leak rather than relying on the developer to remember the correct order every time, which is exactly the kind of consistency guarantee a hand-run notebook doesn't provide.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>An e-commerce company's data scientist builds a fraud-detection model in a Jupyter notebook: load a CSV of past transactions, clean it, engineer features (transaction velocity, device fingerprint mismatch, etc.), train an XGBoost classifier, and get a great F1 score. That notebook, as-is, is NOT production-ready - it has no way to run automatically on tomorrow's transactions, no validation that tomorrow's data has the same schema, and no mechanism to catch that the model has started missing new fraud patterns.</li>
<li>Turning it into a real pipeline means: an orchestrated job pulls the last 24 hours of transactions from the data warehouse every night, runs them through the SAME preprocessing/feature-engineering steps (packaged as a versioned pipeline object, not re-typed notebook cells), scores them with the currently deployed model in real time as transactions occur, and logs both the prediction AND (once known, e.g. after a chargeback or confirmed-fraud report) the actual outcome.</li>
<li>Periodically (e.g. weekly), an automated retraining job compares the live model's recent precision/recall against a freshly retrained candidate model on the newest data; if fraud patterns have shifted (fraudsters adapting to evade the current model - concept drift) and the candidate model performs meaningfully better on a held-out recent window, it's automatically promoted to production - this closed loop is what keeps the fraud model effective over time instead of slowly decaying as fraud tactics evolve.</li>
</ul>`,
            codeExamples: [
                `# Simulating a scheduled retrain-and-promote step: only replace the production model if the
# freshly retrained candidate actually beats it on the most recent held-out data (guards against drift).
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score
from sklearn.datasets import make_classification

def simulate_day(day, drift=False):
    # simulate transaction data whose fraud pattern SHIFTS slightly over time (concept drift)
    rng = np.random.default_rng(day)
    flip = 0.15 if drift else 0.0
    X, y = make_classification(n_samples=500, n_features=8, weights=[0.9, 0.1], random_state=day)
    if drift:
        flip_idx = rng.random(len(y)) < flip
        y = np.where(flip_idx, 1 - y, y)   # some fraud patterns now look different than before
    return X, y

# "Production" model trained on old data (day 0), evaluated on TODAY's (day 10, drifted) data
X_old, y_old = simulate_day(day=0)
production_model = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_old, y_old)

X_today, y_today = simulate_day(day=10, drift=True)
prod_f1 = f1_score(y_today, production_model.predict(X_today))

# Candidate: retrained on recent data that reflects the drift
X_recent, y_recent = simulate_day(day=9, drift=True)
candidate_model = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_recent, y_recent)
candidate_f1 = f1_score(y_today, candidate_model.predict(X_today))

print(f"Production model F1 on today's data:  {prod_f1:.3f}")
print(f"Candidate model F1 on today's data:    {candidate_f1:.3f}")
if candidate_f1 > prod_f1:
    print("-> PROMOTE candidate to production (it handles the drifted pattern better)")
else:
    print("-> KEEP current production model")
# OUTPUT (typical):
# Production model F1 on today's data:  0.512
# Candidate model F1 on today's data:    0.734
# -> PROMOTE candidate to production (it handles the drifted pattern better)`
            ],
            codeExplanations: [
                `This simulates the automated "retrain and promote only if better" step at the heart of a real MLOps pipeline. simulate_day generates synthetic transaction data and optionally flips some fraud labels to mimic concept drift - fraud patterns that look different over time as fraudsters adapt. A "production" model is trained on old (day 0) data and evaluated against today's drifted data, giving a degraded F1 score because the patterns it learned no longer fully match reality. A "candidate" model is then retrained on more recent data that already reflects the drift, and evaluated on the exact same held-out "today" data for a fair comparison. The final if/else is the actual decision logic a production retraining pipeline runs automatically: only replace the live model if the new candidate demonstrably performs better on recent, representative data - never blindly swap in a newly trained model just because it's newer, since a bad retrain (e.g. on a batch of corrupted data) could otherwise silently make production worse.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Reproducibility</strong> - the exact same code and step order runs every time, on every dataset, whether it's the original training run or a retrain six months later, eliminating "it worked differently on my machine/in my notebook" discrepancies.</li>
<li><strong>Prevents data leakage by construction</strong> - as shown above, wrapping preprocessing inside a pipeline (fit only during the pipeline's own <code>.fit()</code> call) structurally prevents the common bug of preprocessing statistics leaking from test/production data into training.</li>
<li><strong>Enables automation and monitoring</strong> - because every stage is a defined, callable step rather than manually-run notebook cells, the whole flow can be scheduled, versioned, logged, and monitored by standard software engineering tooling (CI/CD, orchestrators, alerting) instead of depending on a person remembering to re-run things.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Added engineering complexity and overhead</strong> - building a proper orchestrated pipeline (validation, versioning, monitoring, automated promotion logic) takes real engineering time beyond just training a good model, which can feel like overkill for a one-off analysis or a model that will never see production traffic.</li>
<li><strong>A pipeline automates a BAD process just as reliably as a good one</strong> - if the underlying feature engineering has a subtle bug or the training data has quality issues, a fully automated retraining pipeline will faithfully keep producing bad models on schedule, potentially at a larger scale and with less human scrutiny than a one-off notebook run would have gotten.</li>
<li><strong>Debugging is harder than in a notebook</strong> - when something in a production pipeline fails or produces a suspicious result, tracing back through pipeline stages, orchestration logs, and versioned intermediate artifacts is generally slower and less interactive than eyeballing intermediate results cell-by-cell in a notebook, which is why most teams still prototype in notebooks before "productionizing" into a pipeline.</li>
</ul>`,
            codeExamples: [
                `# Showing how a pipeline's steps are versioned/inspectable objects, not just re-run notebook cells
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib
import json

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(C=0.5, max_iter=1000)),
])

# In a real pipeline this .fit() would run inside a scheduled job, not by hand
from sklearn.datasets import load_breast_cancer
X, y = load_breast_cancer(return_X_y=True)
pipeline.fit(X, y)

# Persist the ENTIRE fitted pipeline (preprocessing statistics + trained model) as one versioned artifact
joblib.dump(pipeline, "fraud_pipeline_v3.joblib")

metadata = {
    "pipeline_version": "v3",
    "trained_on_rows": X.shape[0],
    "steps": [name for name, _ in pipeline.steps],
    "hyperparameters": {"classifier__C": 0.5},
}
print(json.dumps(metadata, indent=2))

reloaded = joblib.load("fraud_pipeline_v3.joblib")
print(f"Reloaded pipeline accuracy check: {reloaded.score(X, y):.3f}")
# OUTPUT (typical):
# {
#   "pipeline_version": "v3",
#   "trained_on_rows": 569,
#   "steps": ["scaler", "classifier"],
#   "hyperparameters": {"classifier__C": 0.5}
# }
# Reloaded pipeline accuracy check: 0.988`
            ],
            codeExplanations: [
                `This shows the practical mechanics of treating a pipeline as a versioned software artifact rather than throwaway notebook state. After fitting the pipeline (scaler + classifier together), joblib.dump serializes the ENTIRE fitted object - including the scaler's learned mean/standard-deviation and the classifier's learned weights - into a single file, so loading it back later reconstructs an object that will preprocess and predict identically to the original, with no risk of someone accidentally using a different scaler version at inference time. The metadata dictionary illustrates what a real MLOps system tracks alongside the artifact itself - a version identifier, how much data it was trained on, which steps it contains, and its hyperparameters - so that a specific deployed model can always be traced back to exactly how it was produced. Reloading the file and checking its score demonstrates that the persisted pipeline is fully self-contained and reproducible, which is precisely the property a hand-run notebook (where the "model" only exists as in-memory variables in someone's kernel) does not give you.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does wrapping preprocessing and modeling in a Pipeline object actually solve?</td><td>It guarantees the exact same sequence of transformations is applied consistently at both training and inference time, and (critically) that preprocessing steps like scalers/imputers only ever learn their statistics from whatever data is passed to the pipeline's own .fit() call - preventing the common data leakage bug of fitting a scaler on the full dataset before splitting into train/test</td></tr>
<tr class='text-center'><td>Why isn't a working Jupyter notebook considered "production-ready" on its own?</td><td>A notebook is run manually, cell by cell, with no built-in way to be re-triggered automatically on fresh data, no data validation to catch schema or distribution changes before they corrupt training, no versioning of the exact code/data/hyperparameters that produced a given model, and no monitoring to detect when the deployed model's performance degrades over time - all things a proper orchestrated pipeline provides</td></tr>
<tr class='text-center'><td>What is the difference between data drift and concept drift, and why does it matter for a production ML pipeline?</td><td>Data drift is a shift in the statistical distribution of INPUT features over time (e.g. customer demographics changing); concept drift is a shift in the actual relationship between inputs and the TARGET (e.g. fraud patterns evolving as fraudsters adapt to evade the current model) - both silently degrade a static deployed model's accuracy, which is why production pipelines include monitoring and automated retrain-and-promote steps rather than treating a trained model as a permanent, one-time artifact</td></tr>
</table>`
        }
    ]
};
