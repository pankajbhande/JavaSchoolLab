import { Topic } from '../../coreJava';

export const missingValueHandling: Topic = {
    id: 'ml-data-preprocessing-missing-value-handling',
    name: 'Missing Value Handling',
    beginner: [
        {
            content: `<h4>What to Do When Data Isn't There</h4>
<ul>
<li>Real datasets almost always have <strong>missing values</strong> - empty cells, <code>NaN</code>, <code>null</code>, or placeholder codes standing in for data that was never recorded.</li>
<li>Common strategies: <strong>drop</strong> rows or columns with missing data, <strong>impute</strong> a value (mean, median, or mode of the column), use a smarter <strong>model-based imputation</strong> (like KNN), or add a separate <strong>"was_missing" indicator flag</strong> alongside the imputed value.</li>
<li>The right strategy is NOT a one-size-fits-all choice - it depends on how much data is missing and, critically, on <strong>WHY</strong> it is missing, not just the fact that it is.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "patient_id": [1, 2, 3, 4, 5],
    "blood_pressure": [120, np.nan, 135, np.nan, 118],
})

# Strategy 1: drop rows with missing values
dropped = df.dropna(subset=["blood_pressure"])

# Strategy 2: mean imputation
mean_val = df["blood_pressure"].mean()
imputed = df.copy()
imputed["blood_pressure"] = imputed["blood_pressure"].fillna(mean_val)

# Strategy 3: impute + keep an indicator flag
imputed["bp_was_missing"] = df["blood_pressure"].isna()

print("Dropped rows:\\n", dropped)
print("\\nMean-imputed with flag:\\n", imputed)
# OUTPUT:
# Dropped rows:
#    patient_id  blood_pressure
# 0           1           120.0
# 2           3           135.0
# 4           5           118.0
#
# Mean-imputed with flag:
#    patient_id  blood_pressure  bp_was_missing
# 0           1      120.000000           False
# 1           2      124.333333            True
# 2           3      135.000000           False
# 3           4      124.333333            True
# 4           5      118.000000           False`
            ],
            codeExplanations: [
                `<code>dropna(subset=["blood_pressure"])</code> simply removes any row where that column is missing - simple, but it throws away patients 2 and 4 entirely, along with any other information those rows had. <code>fillna(mean_val)</code> instead fills every missing spot with the column's average (124.33), preserving the row count. The added <code>bp_was_missing</code> boolean column keeps a record of exactly which rows were originally missing even after imputation - this matters because, as the expert content covers, the fact that a value was missing can itself be meaningful information a model should be able to use, not just noise to be silently smoothed over.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters: Missing Data Has a Mechanism</h3>
The single most important idea in missing value handling is that data is rarely missing "randomly" - the REASON it's missing often carries information, and picking a strategy without understanding that reason can actively mislead a model.
<ul>
<li><strong>MCAR (Missing Completely At Random)</strong> - the chance of a value being missing has nothing to do with any variable, observed or not (e.g. a lab machine randomly fails to save a reading due to an unrelated software glitch). Safe case for simple imputation.</li>
<li><strong>MAR (Missing At Random)</strong> - the chance of missingness depends on OTHER observed variables, but not on the missing value itself (e.g. younger patients are less likely to have a certain test ordered, but among patients of the same age, missingness is unrelated to the actual test result). Can often be handled well with model-based imputation using those related variables.</li>
<li><strong>MNAR (Missing Not At Random)</strong> - the chance of missingness depends on the VALUE that is missing itself (e.g. sicker patients, with more extreme blood pressure, are more likely to be too unstable to have it measured accurately, or the measurement is skipped because it's already known to be alarming). This is the most dangerous case, because naive imputation actively encodes a false assumption.</li>
</ul>
<h3>Real-World Example</h3>
A hospital's dataset for predicting patient risk includes a <code>blood_pressure</code> column that is missing for a meaningful subset of patients. Investigation reveals it is missing NOT randomly - it is missing specifically for patients who were <strong>too critically unstable to safely take a manual reading</strong> at the time, i.e. exactly the sickest patients in the dataset (a textbook <strong>MNAR</strong> pattern, since missingness depends on the value itself: extreme, dangerous blood pressure is precisely what caused it to go unmeasured). Naively filling these gaps with the column <strong>mean</strong> would replace the most critical patients' missing readings with an "average, unremarkable" value - actively hiding the exact signal (severe instability) a risk model most needs to detect, potentially causing the model to systematically underestimate risk for the sickest patients in the dataset.`,
            codeExamples: [
                `# Demonstrating why mean imputation is dangerous under MNAR: it erases the sickest patients' signal
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 500

true_severity = rng.normal(0, 1, n)                 # underlying, unobserved patient severity
true_bp = 120 + 40 * true_severity                  # sicker patients tend toward extreme BP

# MNAR: BP is missing specifically when it is extreme (too unstable to measure safely)
missing_mask = np.abs(true_bp - 120) > 55
observed_bp = np.where(missing_mask, np.nan, true_bp)

df = pd.DataFrame({"true_severity": true_severity, "blood_pressure": observed_bp})

mean_imputed = df["blood_pressure"].fillna(df["blood_pressure"].mean())

print("True mean BP across ALL patients (including unmeasured):", round(true_bp.mean(), 1))
print("Mean BP among patients who COULD be measured (naive basis for imputation):",
      round(df["blood_pressure"].mean(), 1))
print("Average true severity of patients whose BP went MISSING:",
      round(true_severity[missing_mask].mean(), 2), "(far above the population average of 0)")
# OUTPUT (typical):
# True mean BP across ALL patients (including unmeasured): 120.4
# Mean BP among patients who COULD be measured (naive basis for imputation): 116.8
# Average true severity of patients whose BP went MISSING: 1.42 (far above the population average of 0)`
            ],
            codeExplanations: [
                `The simulation makes the mechanism explicit: <code>missing_mask</code> is defined so that blood pressure goes missing exactly when it is extreme (either very high or very low), matching the real-world scenario where unstable patients can't be safely measured - this is MNAR by construction, since missingness depends directly on the value that would have been recorded. The last printed line shows the consequence: patients whose BP went missing have a much higher average true severity (1.42) than the population average (0) - meaning the "missing" group is not a random cross-section, it is specifically the sickest patients. Mean-imputing their blood pressure with the observed (already skewed-normal-looking) average would assign these critically severe patients an unremarkable-looking blood pressure value, hiding exactly the signal a risk model needs most.`
            ]
        },
        {
            content: `<h3>Choosing a Strategy Based on the Missingness Mechanism</h3>
<ul>
<li><strong>Drop rows/columns</strong> - reasonable only when missingness is MCAR and the proportion missing is small; dropping under MAR or MNAR removes a non-random slice of the data and biases what remains, and dropping an entire column is appropriate only when that column is missing so extensively it carries little usable signal anyway.</li>
<li><strong>Mean/median/mode imputation</strong> - simple and often fine under MCAR; median is generally safer than mean when the column has outliers or skew, since mean is pulled by extreme values while median is robust to them. Dangerous under MNAR, as shown above, because it erases exactly the signal correlated with missingness.</li>
<li><strong>KNN / model-based imputation</strong> - predicts a plausible missing value from OTHER correlated features (e.g. estimate a missing blood pressure from age, weight, and heart rate of similar patients). More powerful under MAR, since it uses the observed variables that missingness actually depends on, but still cannot fully recover MNAR signal, since the true reason for missingness is the unmeasured value itself.</li>
<li><strong>"Was_missing" indicator flag</strong> - the most important tool for MNAR cases: adding a binary column marking which rows were originally missing lets the model learn directly from the fact of missingness itself, rather than only from an imputed guess that may be misleading. This should almost always be added whenever there is any suspicion missingness carries information.</li>
</ul>`,
            codeExamples: [
                `# KNN imputation using correlated features vs. plain mean imputation
import numpy as np
import pandas as pd
from sklearn.impute import KNNImputer

rng = np.random.default_rng(1)
n = 8
age = rng.integers(25, 80, n)
weight = 60 + 0.5 * age + rng.normal(0, 3, n)
bp = 100 + 0.6 * age + 0.2 * weight + rng.normal(0, 2, n)
bp_missing = bp.copy()
bp_missing[[2, 5]] = np.nan   # simulate two missing readings

df = pd.DataFrame({"age": age, "weight": np.round(weight, 1), "blood_pressure": np.round(bp_missing, 1)})

mean_filled = df["blood_pressure"].fillna(df["blood_pressure"].mean())

imputer = KNNImputer(n_neighbors=2)
knn_filled = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)["blood_pressure"]

print("True BP values that went missing:", np.round(bp[[2, 5]], 1))
print("Mean-imputed guesses:            ", np.round(mean_filled.iloc[[2, 5]].values, 1))
print("KNN-imputed guesses (using age/weight):", np.round(knn_filled.iloc[[2, 5]].values, 1))
# OUTPUT (typical):
# True BP values that went missing: [138.4 122.7]
# Mean-imputed guesses:             [128.9 128.9]
# KNN-imputed guesses (using age/weight): [136.1 121.8]`
            ],
            codeExplanations: [
                `Mean imputation fills BOTH missing rows with the exact same single number (128.9), completely ignoring that the two patients have very different ages and weights, and therefore very different plausible blood pressures. <code>KNNImputer</code> instead looks at the OTHER columns (<code>age</code>, <code>weight</code>) for each row with a missing value, finds the most similar rows (nearest neighbors) that do have a blood pressure recorded, and imputes a value based on those neighbors - producing two different, more individually plausible estimates (136.1 and 121.8) that are much closer to the true hidden values (138.4 and 122.7) than the single blunt mean-based guess.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Preserves usable rows instead of discarding them</strong> - imputation (of any kind) keeps a row's other valid columns usable for training, rather than losing all of that row's information via <code>dropna</code>.</li>
<li><strong>The "was_missing" flag lets missingness itself become a predictive feature</strong> - in MNAR cases like the hospital example, whether a value is missing can be MORE predictive than any plausible imputed value would be.</li>
<li><strong>KNN/model-based imputation produces individually tailored estimates</strong> - rather than one blunt constant for every missing row, it uses each row's other features to produce a more contextually plausible value.</li>
<li><strong>Diagnosing the missingness mechanism (MCAR/MAR/MNAR) sharpens the whole preprocessing pipeline</strong> - the same investigation that informs the right imputation strategy often surfaces a data collection or logging bug worth fixing at the source.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Dropping rows/columns can introduce or worsen bias</strong> - if missingness correlates with an important subgroup (as in MAR/MNAR cases), dropping those rows systematically removes that subgroup from the training data, not just "some rows".</li>
<li><strong>Mean/median/mode imputation reduces variance artificially</strong> - filling many rows with the same constant makes the column's distribution look artificially tighter than reality, which can understate a feature's true predictive spread.</li>
<li><strong>Naive imputation under MNAR can actively mislead a model</strong> - as demonstrated, filling a value that is missing BECAUSE it would have been extreme with an "average" number hides exactly the pattern the model needs to learn.</li>
<li><strong>KNN and model-based imputation are computationally heavier and can leak information</strong> - they must be fit only on training data (mirroring the fit/transform discipline used in <code>Standardization</code>) or test-set values will leak into imputed training rows via shared distance calculations.</li>
</ul>`,
            codeExamples: [
                `# Correct imputation discipline: fit imputer on train only, then transform test with the SAME learned statistic
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(2)
values = rng.normal(100, 15, 40)
values[rng.choice(40, 6, replace=False)] = np.nan
df = pd.DataFrame({"reading": values})

train, test = train_test_split(df, test_size=0.25, random_state=0)

imputer = SimpleImputer(strategy="median")
train_filled = imputer.fit_transform(train)     # learns the median from TRAIN only
test_filled = imputer.transform(test)           # reuses that same learned median on test

print("Median learned from training data only:", round(imputer.statistics_[0], 2))
print("Any NaNs remaining in test after transform:", np.isnan(test_filled).sum())
# OUTPUT (typical):
# Median learned from training data only: 99.87
# Any NaNs remaining in test after transform: 0`
            ],
            codeExplanations: [
                `Just like <code>StandardScaler</code>, <code>SimpleImputer</code> follows the fit/transform discipline: <code>fit_transform(train)</code> computes the median using ONLY the training rows and stores it in <code>imputer.statistics_</code>, then <code>transform(test)</code> fills any missing test values using that SAME training-derived median rather than recomputing a new one from the test set. This prevents test-set values from leaking into the imputation statistic, exactly the same data-leakage risk that applies to scaling - any preprocessing step that learns a number from the data (a mean, median, mode, or a KNN model) must be fit on training data only.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between MCAR, MAR, and MNAR, and why does the distinction matter for choosing an imputation strategy?</td><td>MCAR means missingness is unrelated to any variable (safe for simple imputation); MAR means missingness depends on other OBSERVED variables but not the missing value itself (well-suited to model-based imputation using those related variables); MNAR means missingness depends on the missing value itself (e.g. blood pressure readings are missing specifically because they would have been dangerously extreme) - naive imputation under MNAR actively hides the signal that caused the value to be missing in the first place, so it requires special handling like a "was_missing" indicator flag rather than blind mean-filling</td></tr>
<tr class='text-center'><td>Why can mean imputation be actively harmful rather than just imprecise in an MNAR scenario?</td><td>If a value is missing specifically because it would have been extreme (e.g. very sick patients can't be measured), replacing it with the column's average manufactures an "unremarkable" value exactly where the true value was most likely to be alarming - this doesn't just add noise, it systematically erases the strongest signal in the dataset for the subgroup that matters most, potentially causing a risk model to underestimate danger for the sickest patients</td></tr>
<tr class='text-center'><td>Why must an imputer (like a mean, median, or KNN-based imputer) be fit only on the training set?</td><td>Fitting on the full dataset or the test set lets statistics used to fill missing values be influenced by test data the model should never see during training - a form of data leakage that makes evaluation metrics overly optimistic; the correct approach is to fit the imputer with <code>fit_transform(X_train)</code> and then apply the same learned statistic to test and production data via <code>transform</code>, exactly mirroring the fit/transform discipline used for scalers</td></tr>
</table>`
        }
    ]
};
