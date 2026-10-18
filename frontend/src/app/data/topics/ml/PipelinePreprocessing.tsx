import { Topic } from '../../coreJava';

export const pipelinePreprocessing: Topic = {
    id: 'ml-data-preprocessing-pipeline',
    name: 'Pipeline',
    beginner: [
        {
            content: `<h4>Bundling Preprocessing and the Model Into One Object</h4>
<ul>
<li>A <code>Pipeline</code> (from <code>sklearn.pipeline</code>) chains preprocessing steps - imputation, scaling, encoding - together with a final model into ONE object, so <code>.fit()</code> and <code>.predict()</code> always apply the exact same sequence of transformations, in the exact same order, every time.</li>
<li>Without a pipeline, it's easy to manually scale training data, train a model, and later forget to apply the SAME scaling (with the SAME learned min/max or mean/std) to new production data - silently breaking predictions because the model receives inputs on a different scale than it was trained on.</li>
<li>A <code>Pipeline</code> makes this impossible to get wrong: calling <code>pipeline.predict(new_data)</code> automatically re-applies every preprocessing step using the statistics LEARNED during <code>pipeline.fit()</code>, never recomputing them from the new data.</li>
</ul>`,
            codeExamples: [
                `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=500, n_features=5, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression()),
])

pipeline.fit(X_train, y_train)   # scaler learns mean/std from X_train, then classifier trains on scaled data
print(f"Test accuracy: {pipeline.score(X_test, y_test):.3f}")

# a brand-new, single incoming row - the pipeline scales it using the SAME learned mean/std automatically
new_row = X_test[:1]
print(f"Prediction for a new row: {pipeline.predict(new_row)[0]}")
# OUTPUT (typical):
# Test accuracy: 0.870
# Prediction for a new row: 1`
            ],
            codeExplanations: [
                `The <code>Pipeline</code> is built as a list of named steps - <code>"scaler"</code> then <code>"classifier"</code> - and <code>pipeline.fit(X_train, y_train)</code> runs both in order: <code>StandardScaler</code> first learns <code>X_train</code>'s mean/std and scales it, then <code>LogisticRegression</code> trains on that scaled output. Calling <code>pipeline.predict(new_row)</code> on a brand-new row automatically re-applies the SAME scaler (using the mean/std it already learned, not new statistics from <code>new_row</code>) before handing the scaled result to the classifier - the exact consistency guarantee that manually scaling training data by hand, and later forgetting to (or incorrectly) scaling new production data the same way, does not provide.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>Manual preprocessing is a classic silent-failure source.</strong> A common real mistake: computing <code>min</code>/<code>max</code> (or mean/std) once on training data, hardcoding those numbers or scaling training data by hand, and then later - weeks or months afterward, often in a different script or by a different engineer - scaling new production data using DIFFERENT statistics (recomputed from the new data itself, or simply forgotten entirely). The model then receives inputs on a subtly or drastically different scale than what it was trained on, and predictions become wrong in a way that produces no error message at all - just quietly bad results.</li>
<li><strong>A Pipeline makes preprocessing and the model one inseparable, versioned unit.</strong> The fitted scaler's learned statistics travel together with the trained model as a single object - saving and loading the pipeline (e.g. via <code>joblib</code>) guarantees the exact preprocessing used during training is exactly what's used at inference time, with no separate file or hardcoded constant to keep in sync manually.</li>
<li><strong>It structurally prevents a specific, very common data leakage bug</strong> inside cross-validation: without a pipeline, a common mistake is fitting a scaler ONCE on the full training set before running cross-validation folds - each fold's "training" portion then still includes scaling statistics influenced by that fold's own validation rows. A pipeline used INSIDE <code>cross_val_score</code> or <code>GridSearchCV</code> automatically refits the scaler separately within EACH fold, using only that fold's own training data.</li>
</ul>
<h3>Real-World Example</h3>
An analyst manually scales a churn dataset's numeric features using <code>scaler.fit_transform(X_train)</code>, trains a model, and ships it. Months later, a new engineer adds a scoring script for live customer data - but instead of reusing the original scaler object, they write <code>StandardScaler().fit_transform(new_customers)</code>, recomputing a BRAND NEW mean and standard deviation from the new batch of customers rather than reusing the one learned during training. Because the new batch's customers happen to have a different average tenure and spend than the original training population, the "scaled" values fed into the model are on a subtly different scale than what it was trained to expect - predictions silently degrade, and because there's no error, the bug isn't caught until someone notices business metrics slipping weeks later. Wrapping the original scaler and model in one <code>Pipeline</code> object from the start would have made this class of bug structurally impossible, since there would be only one object, with one set of learned statistics, ever used for both training and scoring.`,
            codeExamples: [
                `# Manual (bug-prone) scaling vs. a Pipeline that guarantees consistent scaling for new data
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(0)
X_train = rng.normal(loc=50, scale=10, size=(300, 2))
y_train = (X_train[:, 0] + X_train[:, 1] > 100).astype(int)

# new incoming customers happen to have a different average scale than training data
X_new = rng.normal(loc=65, scale=12, size=(50, 2))

# --- BUGGY manual approach: recomputes a NEW scaler on the incoming data ---
scaler_train = StandardScaler().fit(X_train)
model = LogisticRegression().fit(scaler_train.transform(X_train), y_train)

wrong_scaler = StandardScaler().fit(X_new)          # BUG: fit on new data instead of reusing scaler_train
X_new_scaled_wrong = wrong_scaler.transform(X_new)
preds_wrong = model.predict(X_new_scaled_wrong)

# --- CORRECT: Pipeline guarantees the SAME scaler (learned on training data) is always reused ---
pipeline = Pipeline([("scaler", StandardScaler()), ("classifier", LogisticRegression())])
pipeline.fit(X_train, y_train)
preds_correct = pipeline.predict(X_new)   # internally reuses the scaler fit during pipeline.fit()

print(f"Predicted positive rate (buggy manual rescaling):  {preds_wrong.mean():.3f}")
print(f"Predicted positive rate (pipeline, correct):        {preds_correct.mean():.3f}")
# OUTPUT (typical):
# Predicted positive rate (buggy manual rescaling):  0.140
# Predicted positive rate (pipeline, correct):        0.860`
            ],
            codeExplanations: [
                `The buggy manual approach calls <code>StandardScaler().fit(X_new)</code>, recomputing an entirely new mean/std from the incoming batch instead of reusing <code>scaler_train</code> - a very easy mistake to make when preprocessing is handled by hand across separate scripts or by different people over time. This shifts the numeric meaning of "scaled value" between training and scoring time, producing a predicted positive rate (<code>0.140</code>) wildly different from what the model would actually predict if scaled consistently. The <code>Pipeline</code> version never has this option available - <code>pipeline.predict(X_new)</code> can only ever use the scaler that was fit during <code>pipeline.fit(X_train, y_train)</code>, giving a predicted positive rate (<code>0.860</code>) consistent with how the model was actually trained - the stark difference between the two numbers is exactly the kind of silent bug a Pipeline eliminates by construction.`
            ]
        },
        {
            content: `<h3>Pipeline Inside Cross-Validation: Preventing Leakage by Construction</h3>
<ul>
<li>When a <code>Pipeline</code> is passed directly into <code>cross_val_score</code> or <code>GridSearchCV</code>, scikit-learn refits the ENTIRE pipeline - including every preprocessing step - separately for EACH cross-validation fold, using only that fold's own training portion.</li>
<li>This means the scaler (or imputer, or encoder) inside the pipeline never sees a fold's validation rows during fitting - exactly mirroring the discipline of fitting on training data only, but applied automatically and correctly across every fold without the analyst having to manually manage it.</li>
<li>Contrast this with fitting a scaler once, globally, before running cross-validation - a subtle but common bug where every fold's "training" scaling is quietly influenced by data that fold is supposed to never see, inflating cross-validated performance estimates.</li>
</ul>
<h3><code>ColumnTransformer</code>: Different Preprocessing for Different Column Types</h3>
<ul>
<li>Real datasets mix column types - numeric columns need scaling, categorical columns need encoding, and applying the wrong preprocessing to the wrong column type either errors out or produces nonsense (e.g. scaling a one-hot encoded column, or one-hot encoding an already-numeric column).</li>
<li><code>ColumnTransformer</code> lets a single preprocessing step apply DIFFERENT transformations to different named/selected columns - e.g. <code>StandardScaler</code> on numeric columns and <code>OneHotEncoder</code> on categorical columns - and is itself typically the first step inside a larger <code>Pipeline</code>, keeping the entire preprocessing-plus-model flow as one consistent, reusable object.</li>
</ul>`,
            codeExamples: [
                `# ColumnTransformer applies different preprocessing per column type, then feeds a full Pipeline
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
n = 400
df = pd.DataFrame({
    "age": rng.uniform(18, 80, n),
    "income": rng.uniform(20_000, 200_000, n),
    "plan_type": rng.choice(["basic", "premium", "enterprise"], size=n),
})
df.loc[rng.random(n) < 0.05, "income"] = np.nan   # simulate some missing values
y = (df["age"] > 45).astype(int)

numeric_cols = ["age", "income"]
categorical_cols = ["plan_type"]

preprocessor = ColumnTransformer([
    ("numeric", Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ]), numeric_cols),
    ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
])

full_pipeline = Pipeline([
    ("preprocessing", preprocessor),
    ("classifier", LogisticRegression()),
])

# cross_val_score refits the ENTIRE pipeline (imputer, scaler, encoder, model) fresh within each fold
scores = cross_val_score(full_pipeline, df, y, cv=5)
print(f"Cross-validated accuracy per fold: {np.round(scores, 3)}")
print(f"Mean CV accuracy: {scores.mean():.3f}")
# OUTPUT (typical):
# Cross-validated accuracy per fold: [0.975 0.963 0.988 0.975 0.963]
# Mean CV accuracy: 0.973`
            ],
            codeExplanations: [
                `<code>ColumnTransformer</code> is given a list of (name, transformer, columns) tuples: numeric columns (<code>age</code>, <code>income</code>) go through their own mini-<code>Pipeline</code> (median imputation to handle the injected missing values, then scaling), while the categorical <code>plan_type</code> column goes through <code>OneHotEncoder</code> - each column type gets exactly the preprocessing appropriate for it, combined into one <code>preprocessor</code> object. That preprocessor becomes the first step of <code>full_pipeline</code>, followed by the classifier. Passing <code>full_pipeline</code> (not just the raw data) into <code>cross_val_score</code> means that for every one of the 5 folds, the imputer's median, the scaler's mean/std, and the encoder's known categories are all refit using ONLY that fold's training rows - the validation rows in each fold are guaranteed to be genuinely unseen by every preprocessing step, not just by the final classifier.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Eliminates train/production preprocessing mismatches by construction</strong> - there is exactly one scaler, one imputer, one encoder object, reused identically everywhere the pipeline is used, removing the entire class of bugs caused by manually re-deriving or forgetting preprocessing statistics later.</li>
<li><strong>Prevents leakage automatically inside cross-validation</strong> - each fold's preprocessing is refit on only that fold's training data when the pipeline itself is passed into <code>cross_val_score</code>/<code>GridSearchCV</code>, rather than relying on the analyst to remember to do this manually for every experiment.</li>
<li><strong><code>ColumnTransformer</code> cleanly handles mixed-type real-world datasets</strong> - numeric and categorical columns each get appropriate, independently-configured preprocessing within one unified object, rather than juggling separate manual transformations that have to be recombined carefully afterward.</li>
<li><strong>The whole pipeline is a single artifact that can be saved and versioned</strong> - persisting it (e.g. via <code>joblib</code>) captures every learned preprocessing statistic together with the trained model, so reloading it later reproduces identical behavior with no separate files to keep in sync.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Debugging an error inside a pipeline can be less transparent</strong> - when something goes wrong deep inside a chained sequence of steps, it can be harder to inspect intermediate outputs than when each preprocessing step is run and printed separately by hand during exploratory analysis.</li>
<li><strong>Some custom or highly stateful preprocessing logic doesn't fit neatly into the pipeline abstraction</strong> - transformations that need information beyond just the columns passed in (e.g. joining in an external lookup table that changes over time) may require custom transformer classes, adding upfront engineering effort.</li>
<li><strong>A wrong choice of preprocessing inside a <code>ColumnTransformer</code> still fails silently</strong> - e.g. accidentally listing a categorical column under the numeric branch produces a technically-runnable but nonsensical scaled column; a pipeline enforces CONSISTENCY, not correctness of the choices made within it.</li>
<li><strong>Slight upfront overhead for simple, one-off analyses</strong> - for quick exploratory work that will never be reused or deployed, building out a full <code>ColumnTransformer</code> + <code>Pipeline</code> can feel like more structure than the task strictly requires.</li>
</ul>`,
            codeExamples: [
                `# Persisting a full ColumnTransformer + model Pipeline as one artifact - no separate files to keep in sync
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
import joblib

rng = np.random.default_rng(0)
n = 300
df = pd.DataFrame({
    "age": rng.uniform(18, 80, n),
    "plan_type": rng.choice(["basic", "premium"], size=n),
})
y = (df["age"] > 45).astype(int)

preprocessor = ColumnTransformer([
    ("numeric", StandardScaler(), ["age"]),
    ("categorical", OneHotEncoder(handle_unknown="ignore"), ["plan_type"]),
])
pipeline = Pipeline([("preprocessing", preprocessor), ("classifier", LogisticRegression())])
pipeline.fit(df, y)

joblib.dump(pipeline, "churn_pipeline.joblib")   # one file: scaler + encoder + model, all together

reloaded = joblib.load("churn_pipeline.joblib")
new_customer = pd.DataFrame({"age": [52], "plan_type": ["premium"]})
print(f"Prediction for new customer: {reloaded.predict(new_customer)[0]}")
# OUTPUT (typical):
# Prediction for new customer: 1`
            ],
            codeExplanations: [
                `<code>joblib.dump(pipeline, ...)</code> serializes the ENTIRE fitted object in one file - the <code>StandardScaler</code>'s learned mean/std for <code>age</code>, the <code>OneHotEncoder</code>'s learned categories for <code>plan_type</code>, and the trained <code>LogisticRegression</code> weights, all bundled together. Reloading that single file with <code>joblib.load</code> and calling <code>.predict()</code> on a brand-new customer row automatically applies every preprocessing step exactly as it was during training - there is no separate scaler file, no separate encoder file, and no risk of accidentally pairing the model with a mismatched or outdated version of either, which is precisely the failure mode that manual, multi-file preprocessing pipelines are prone to over time.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What real-world bug does wrapping preprocessing and a model in a Pipeline prevent?</td><td>Manually scaling training data and later forgetting to apply the exact same scaling (the same learned min/max or mean/std) to new production data - a Pipeline guarantees that fit() learns preprocessing statistics once from training data, and every later call to predict() automatically re-applies those exact same statistics, so there is no separate scaler object or hardcoded constant that can drift out of sync with the model over time</td></tr>
<tr class='text-center'><td>How does using a Pipeline inside cross-validation prevent data leakage?</td><td>When a Pipeline object (not just raw preprocessed data) is passed into cross_val_score or GridSearchCV, scikit-learn refits the entire pipeline - including every preprocessing step - separately within each fold, using only that fold's own training portion; this guarantees a fold's validation rows never influence the preprocessing statistics used to transform that same fold's training data, unlike fitting a scaler once globally before running cross-validation</td></tr>
<tr class='text-center'><td>What problem does ColumnTransformer solve, and how does it fit into a Pipeline?</td><td>Real datasets mix column types that need different preprocessing - numeric columns typically need imputation/scaling while categorical columns need encoding - and ColumnTransformer lets each column (or group of columns) get its own appropriate transformation within a single unified object; it's usually placed as the first step of a larger Pipeline, so the combined preprocessing-plus-model flow remains one consistent, reusable, and leakage-safe unit</td></tr>
</table>`
        }
    ]
};
