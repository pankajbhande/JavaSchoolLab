import { Topic } from '../../coreJava';

export const featuresLabels: Topic = {
    id: 'ml-fundamentals-features-labels',
    name: 'Features & Labels',
    beginner: [
        {
            content: `<h4>What the Model Sees, and What It's Trying to Predict</h4>
<ul>
<li>A <strong>Feature</strong> is one measurable input variable describing a data point - a house's square footage, an email's word count, a patient's age. Together, all the features for one row form a <strong>feature vector</strong>, usually called <code>X</code>.</li>
<li>A <strong>Label</strong> (also called the <strong>target</strong>) is the known, correct output for that row in <strong>supervised learning</strong> - the sale price the house actually sold for, whether the email actually was spam, whether the patient actually had the disease. Usually called <code>y</code>.</li>
<li>Training a supervised model means showing it many <code>(features, label)</code> pairs so it can learn a function that maps features to labels - and can then predict a label for a brand-new row whose true label isn't known yet.</li>
</ul>`,
            codeExamples: [
                `# Turning raw house listings into a feature matrix X and a label vector y
import numpy as np
import pandas as pd

listings = pd.DataFrame({
    "sqft":      [1400, 2100, 900, 3200],
    "bedrooms":  [3, 4, 2, 5],
    "age_years": [12, 5, 40, 2],
    "sale_price": [305000, 460000, 210000, 690000],   # the known correct answer per row
})

X = listings[["sqft", "bedrooms", "age_years"]]   # features - what the model looks at
y = listings["sale_price"]                          # label - what the model tries to predict

print("Features (X):\\n", X)
print("\\nLabels (y):\\n", y.values)
# OUTPUT:
# Features (X):
#     sqft  bedrooms  age_years
# 0   1400         3         12
# 1   2100         4          5
# 2    900         2         40
# 3   3200         5          2
#
# Labels (y):
#  [305000 460000 210000 690000]`
            ],
            codeExplanations: [
                `Each row of the <code>listings</code> table is one house. Splitting the table into <code>X</code> (sqft, bedrooms, age_years) and <code>y</code> (sale_price) is exactly the feature/label split every supervised scikit-learn model expects: <code>model.fit(X, y)</code> would use these matched pairs to learn a mapping from a house's features to its sale price, so it can later predict a price for a new listing where <code>y</code> is unknown.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>A model can only ever learn a relationship that is actually PRESENT in the chosen features - if the real driver of house price is "distance to the nearest good school" and that information was never captured as a feature, no amount of clever modeling can recover it. Choosing and engineering good features (called <strong>feature engineering</strong>) is often what separates a mediocre model from a great one, more than the choice of algorithm.</li>
<li>Label quality directly caps model quality - the well-known phrase <strong>"garbage in, garbage out"</strong> applies most sharply to labels: if 10% of a dataset's "is this transaction fraud" labels are simply wrong (mislabeled by a rushed human reviewer), the model is being trained to reproduce those mistakes, and no algorithm can outperform bad ground truth on its own.</li>
<li>Not every ML problem has labels: <strong>unsupervised learning</strong> (like K-Means clustering or PCA) works with features alone, finding structure or grouping in <code>X</code> without ever being told a "correct answer" - useful when labels don't exist or are too expensive to collect (e.g. grouping millions of customers into segments with no predefined categories).</li>
</ul>
<h3>Real-World Example</h3>
A real-estate startup builds a home price-prediction tool.
<ul>
<li>Raw listing data (address, description text, a handful of numbers) is turned into a clean <strong>feature vector</strong>: square footage, bedroom/bathroom count, lot size, year built, zip code (often one-hot encoded), and derived features like "distance to nearest subway station".</li>
<li>The <strong>label</strong> is the actual final sale price, pulled from public county records months after each sale closes - notice the label isn't available until well after the listing existed, which is normal: labels often come from an outcome that happens LATER (did the loan default, did the patient relapse, did the customer churn).</li>
<li>If the startup instead used the LISTED asking price as the label instead of the ACTUAL sale price, the model would learn to mimic sellers' sometimes-inflated asking behavior rather than true market value - a subtle but critical labeling mistake that would look fine in training metrics but fail in the real product.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating how label quality caps model quality - clean labels vs. noisy (mislabeled) labels
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.datasets import make_classification

X, y_true = make_classification(n_samples=2000, n_features=8, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y_true, test_size=0.3, random_state=0)

# Case 1: train on CLEAN labels
model_clean = LogisticRegression().fit(X_train, y_train)
acc_clean = accuracy_score(y_test, model_clean.predict(X_test))

# Case 2: corrupt 20% of the TRAINING labels (simulating sloppy human labeling)
rng = np.random.default_rng(0)
y_train_noisy = y_train.copy()
flip_idx = rng.choice(len(y_train_noisy), size=int(0.2 * len(y_train_noisy)), replace=False)
y_train_noisy[flip_idx] = 1 - y_train_noisy[flip_idx]
model_noisy = LogisticRegression().fit(X_train, y_train_noisy)
acc_noisy = accuracy_score(y_test, model_noisy.predict(X_test))   # tested against TRUE labels

print(f"Accuracy trained on clean labels: {acc_clean:.3f}")
print(f"Accuracy trained on 20% mislabeled training data: {acc_noisy:.3f}")
# OUTPUT (typical):
# Accuracy trained on clean labels: 0.895
# Accuracy trained on 20% mislabeled training data: 0.780`
            ],
            codeExplanations: [
                `Both models use identical features (<code>X</code>) and the same algorithm, so the only difference is label quality: <code>model_clean</code> trains on the true labels, while <code>model_noisy</code> trains on a copy where 20% of labels were randomly flipped, simulating sloppy or inconsistent human labeling. Both are evaluated against the true test labels, and the noisy-label model scores noticeably worse - directly demonstrating that no amount of good features or a good algorithm can fully compensate for corrupted ground truth.`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages of How Features & Labels Are Chosen</h3>
<ul>
<li><strong>Advantage - flexibility</strong> - the same raw event (a user clicking "buy") can be turned into many different labels depending on the business question: "will they buy in the next 7 days" vs "will they churn in 90 days" are both valid labels derived from similar underlying data, letting one dataset support many models.</li>
<li><strong>Advantage - features can be engineered, not just measured</strong> - a feature doesn't have to be raw data; "ratio of monthly debt to income" is a DERIVED feature computed from two raw numbers, and such engineered features often carry far more predictive signal than either raw number alone (this is core to why feature engineering matters so much in practice).</li>
<li><strong>Disadvantage - label collection is often expensive or delayed</strong> - getting a true "did the patient relapse within 5 years" label requires literally waiting 5 years, or getting "is this X-ray cancerous" requires paying a radiologist to review each one, unlike features which are often already sitting in a database.</li>
<li><strong>Disadvantage - features can leak the label</strong> - accidentally including a feature that's only known AFTER the label occurs (e.g. including "number of days in hospital" as a feature for predicting "did the patient die", when that number is only known once the outcome is already determined) makes a model look artificially perfect in testing and then fail completely in production.</li>
</ul>`,
            codeExamples: [
                `# Detecting a feature that "leaks" the label - a feature only known after the outcome occurs
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(0)
n = 1000
churned = rng.integers(0, 2, n)                              # the label: did the customer churn?
tenure_months = rng.integers(1, 60, n)
support_tickets = rng.poisson(2, n)
# LEAKY feature: "cancellation_email_sent" only exists AFTER churn happens - it's a symptom, not a predictor
cancellation_email_sent = np.where(churned == 1, rng.integers(0, 2, n) | 1, 0)

df = pd.DataFrame({"tenure_months": tenure_months, "support_tickets": support_tickets,
                    "cancellation_email_sent": cancellation_email_sent, "churned": churned})

X_train, X_test, y_train, y_test = train_test_split(
    df[["tenure_months", "support_tickets", "cancellation_email_sent"]], df["churned"],
    test_size=0.3, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
print(f"Accuracy WITH leaky feature: {accuracy_score(y_test, model.predict(X_test)):.3f}")

model_clean = LogisticRegression().fit(X_train.drop(columns="cancellation_email_sent"),
                                        y_train)
acc = accuracy_score(y_test, model_clean.predict(X_test.drop(columns="cancellation_email_sent")))
print(f"Accuracy WITHOUT leaky feature (honest): {acc:.3f}")
# OUTPUT (typical):
# Accuracy WITH leaky feature: 0.998   <- suspiciously perfect, a red flag
# Accuracy WITHOUT leaky feature (honest): 0.610</br>(closer to what production will actually see)`
            ],
            codeExplanations: [
                `<code>cancellation_email_sent</code> is constructed so it is almost always 1 exactly when <code>churned</code> is 1 - it's a downstream CONSEQUENCE of churning (the cancellation email only gets sent after someone cancels), not a real predictor available beforehand. Including it makes the model look almost perfectly accurate, which is a classic warning sign of <strong>label leakage</strong>; removing the leaky feature drops accuracy to a much more realistic number, closer to what the model could actually achieve using only information genuinely available before the outcome happens.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between a feature and a label?</td><td>A feature is an input variable the model is given to make a prediction (e.g. a house's square footage); a label is the known correct output the model is trying to predict during supervised training (e.g. the house's actual sale price). Features form the matrix X, labels form the vector y</td></tr>
<tr class='text-center'><td>Can a machine learning problem have features but no labels? Give an example.</td><td>Yes - this is unsupervised learning. K-Means clustering and PCA both operate on features alone with no target variable, e.g. grouping customers into segments purely based on their purchase behavior features, with no predefined "correct" segment label to learn from</td></tr>
<tr class='text-center'><td>What is label leakage, and why is it dangerous?</td><td>Label leakage happens when a feature accidentally contains information that would only be known AFTER the label is determined (e.g. using "cancellation email sent" to predict churn). It makes a model look extremely accurate during testing because it is essentially peeking at the answer, then it fails in production where that feature isn't actually available at prediction time</td></tr>
</table>`
        }
    ]
};
