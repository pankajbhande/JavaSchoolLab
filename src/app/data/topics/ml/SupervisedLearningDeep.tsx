import { Topic } from '../../coreJava';

export const supervisedLearningFundamentals: Topic = {
    id: 'ml-fundamentals-supervised-learning',
    name: 'Supervised Learning',
    beginner: [
        {
            content: `<h4>Supervised Learning</h4>
Learns a mapping from inputs to known outputs. Two sub-types:
<ul>
<li><strong>Regression</strong> - predicts a continuous number (e.g. house price).</li>
<li><strong>Classification</strong> - predicts a discrete category (e.g. spam / not spam).</li>
</ul>
<h4>Unsupervised Learning (for contrast)</h4>
No labeled answers are given - the algorithm finds structure on its own. Common technique: <strong>clustering</strong> (grouping similar data points together, e.g. K-Means).
<p>The word "supervised" refers to the LABELS acting like a teacher/supervisor: for every training example, the correct answer is already known, and the algorithm's job is to find a function that reproduces those known answers as closely as possible, then generalizes to new inputs whose answer is not yet known.</p>`,
            codeExamples: [
                `# Unsupervised learning example: K-Means clustering
from sklearn.cluster import KMeans
import numpy as np

# Unlabeled data points (e.g. customer spending patterns)
data = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])

kmeans = KMeans(n_clusters=2, n_init=10, random_state=0).fit(data)
print(kmeans.labels_)  # which cluster (0 or 1) each point was assigned to
# OUTPUT: [0 0 0 1 1 1]  (the two natural groups discovered in the data)`
            ],
            codeExplanations: [
                `Six unlabeled 2D points are given - there is no "correct" cluster ID attached to any of them, unlike supervised learning's labeled examples. K-Means is told only how many clusters to find (<code>n_clusters=2</code>) and it groups the points purely by their spatial closeness, with no external answer key to check against. Printing <code>kmeans.labels_</code> shows it correctly separated the two visually obvious groups (the first three points near the origin, the last three near x=10) - this contrast with supervised learning is the point: unsupervised learning discovers structure that was never explicitly labeled, while supervised learning is given the correct labels up front and learns to reproduce them.`
            ]
        },
        {
            content: `<h3>Why This Matters</h3>
Labeled data is the single most expensive and scarce resource in most real-world ML projects - far more so than compute or algorithm choice.
<ul>
<li>Getting RAW data is often cheap: a hospital already has millions of patient records; a retailer already logs every click. But turning that raw data into LABELED training examples usually requires a human (often an expensive specialist) to review each example and assign the correct answer - a radiologist has to label thousands of X-rays as "tumor present / absent" before a supervised model can learn to do it automatically.</li>
<li>This is why so much of applied ML work is not "choosing the right algorithm" but rather designing how to get enough good labels cheaply: using existing business records as free labels (e.g. "did the customer actually default?" is a label that already exists in loan records), crowdsourcing, weak/semi-supervised labeling, or building an internal review tool so an expert's labeling work reaches many training examples per hour instead of one.</li>
<li>Without any labels at all, only UNSUPERVISED techniques (clustering, anomaly detection) are possible - useful for exploring data, but they cannot be told "predict whether this patient has diabetes" the way a supervised model can, because there's no notion of a "correct answer" for them to be checked against during training.</li>
</ul>`,
            codeExamples: [
                `# Simulating the real cost of labeling: how much labeled data changes model accuracy
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_classification(n_samples=2000, n_features=10, random_state=0)
X_train_full, X_test, y_train_full, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

# Simulate having only a SMALL labeling budget: use just a slice of the labeled training data
for n_labeled in [20, 100, 500, len(X_train_full)]:
    model = LogisticRegression(max_iter=1000).fit(X_train_full[:n_labeled], y_train_full[:n_labeled])
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"labeled examples used={n_labeled:5d}  test accuracy={acc:.3f}")
# OUTPUT (typical):
# labeled examples used=   20  test accuracy=0.793
# labeled examples used=  100  test accuracy=0.897
# labeled examples used=  500  test accuracy=0.930
# labeled examples used= 1400  test accuracy=0.937`
            ],
            codeExplanations: [
                `This simulates a limited "labeling budget" by only letting the model train on the first N labeled examples out of the available training set, then measuring test accuracy at increasing budget sizes. The output shows accuracy climbing sharply from 20 to 500 labeled examples but nearly plateauing after that - in a real project this curve is exactly what tells a team whether it's worth paying for more expert-labeled data (if accuracy is still climbing steeply) or whether the labeling budget is better spent elsewhere (if it has plateaued), which is a genuinely central business decision in supervised ML projects, not just a technical footnote.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<strong>Medical diagnosis from labeled patient records</strong> is one of the clearest real-world supervised learning use cases. A hospital has years of patient records where each patient's features (age, blood test results, symptoms, imaging findings) are already paired with a known outcome (diagnosed with diabetes, or not) because doctors already determined that diagnosis at the time. This is exactly a supervised learning setup: the "label" (diagnosis) already exists in the historical record, so a classification model can be trained to predict that same label from the input features for a NEW patient, before a doctor has made the call - useful as a triage/second-opinion tool, e.g. flagging high-risk patients for priority review.
<p>Contrast this with, say, trying to discover entirely NEW, previously-unknown patient sub-populations from the same data with no target label in mind - that would be an UNSUPERVISED clustering problem instead (e.g. "are there natural groupings of patients that respond differently to a drug, that we didn't know to look for?").</p>`,
            codeExamples: [
                `# Supervised classification: predicting diabetes risk from labeled patient records
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import numpy as np

data = load_diabetes()
X = data.data
# Turn the continuous disease-progression score into a binary label using the median as a cutoff,
# to illustrate a "high risk / low risk" diagnosis-style classification label
y = (data.target > np.median(data.target)).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
model = LogisticRegression(max_iter=1000).fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test), target_names=["low_risk", "high_risk"]))
# OUTPUT (typical): precision/recall/f1 around 0.7-0.8 for both classes`
            ],
            codeExplanations: [
                `This loads a real (anonymized) diabetes dataset where each patient row already has an outcome measure attached - exactly the "label already exists in the historical record" situation described above. The continuous outcome is turned into a binary high-risk/low-risk label for illustration, and a LogisticRegression classifier is trained on the LABELED training patients, then evaluated on held-out patients whose true label is known but withheld from the model at prediction time. <code>classification_report</code> reports precision, recall, and F1 for both classes - the same evaluation approach a hospital would use before trusting a diagnosis-support model enough to deploy it as a triage aid.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Directly optimizes for the metric that matters</strong> - because the true answer is known during training, the model can be evaluated and tuned against exactly the outcome the business cares about (e.g. diagnosis accuracy), unlike unsupervised methods which optimize a proxy like cluster compactness that may not align with any real target.</li>
<li><strong>Performance is measurable before deployment</strong> - holding out labeled test data lets a team compute precision, recall, and other concrete metrics BEFORE putting a model in production, giving confidence (or a clear red flag) that unsupervised methods can't offer in the same way.</li>
<li><strong>Well-understood, mature toolset</strong> - decades of supervised learning research means there are robust, well-tested algorithms (logistic regression, random forests, gradient boosting, neural networks) and evaluation practices (cross-validation, ROC curves) available off the shelf.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Labeled data is expensive and slow to obtain</strong> - as discussed above, a radiologist manually labeling thousands of scans, or a fraud analyst manually reviewing flagged transactions, is a genuine bottleneck that often costs more than the modeling work itself.</li>
<li><strong>Learns only what the labels teach it, including their biases</strong> - if historical labels reflect a biased process (e.g. past hiring decisions that favored one group), the model reproduces that bias faithfully, since it has no way to know the labels themselves were flawed.</li>
<li><strong>Cannot discover categories nobody thought to label</strong> - a supervised diagnosis model can only predict diagnoses it was trained on; if a genuinely new disease sub-type exists in the data, a supervised model has no mechanism to surface it - that requires unsupervised exploration first.</li>
<li><strong>Struggles when labels are noisy or inconsistent</strong> - if different doctors historically diagnosed similar cases differently, the "ground truth" label itself is inconsistent, which caps how accurate any supervised model trained on it can ever become.</li>
</ul>`,
            codeExamples: [
                `# Label noise: how inconsistent ground-truth labels cap achievable accuracy
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

rng = np.random.default_rng(0)
X, y = make_classification(n_samples=1500, n_features=10, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

for noise_rate in [0.0, 0.1, 0.25, 0.4]:
    y_train_noisy = y_train.copy()
    flip_idx = rng.choice(len(y_train), size=int(noise_rate * len(y_train)), replace=False)
    y_train_noisy[flip_idx] = 1 - y_train_noisy[flip_idx]  # simulate inconsistent/incorrect labels

    model = LogisticRegression(max_iter=1000).fit(X_train, y_train_noisy)
    acc = accuracy_score(y_test, model.predict(X_test))  # test labels stay clean
    print(f"label noise rate={noise_rate:.2f}  test accuracy={acc:.3f}")
# OUTPUT (typical):
# label noise rate=0.00  test accuracy=0.916
# label noise rate=0.10  test accuracy=0.876
# label noise rate=0.25  test accuracy=0.789
# label noise rate=0.40  test accuracy=0.658`
            ],
            codeExplanations: [
                `This deliberately corrupts a fraction of the TRAINING labels (simulating inconsistent human labeling, e.g. different doctors disagreeing on borderline diagnoses) while keeping the test labels clean, then measures how test accuracy degrades as label noise increases. The steady drop from 0.916 to 0.658 as noise rises from 0% to 40% makes the limitation concrete: a supervised model can only be as reliable as the ground-truth labels it was trained on, and no amount of algorithmic sophistication can fully compensate for genuinely inconsistent labels.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the key difference between supervised and unsupervised learning?</td><td>Supervised learning trains on data where each example already has a known correct output (label), and the model learns to reproduce/generalize that mapping; unsupervised learning is given no labels at all and instead discovers structure (e.g. clusters) present in the data on its own</td></tr>
<tr class='text-center'><td>Why is labeled data often described as the biggest bottleneck in a supervised ML project?</td><td>Raw data is often cheap to collect, but turning it into labeled training examples usually requires a human (often a domain expert like a radiologist or fraud analyst) to review and assign the correct answer to each example, which is slow and expensive, and directly limits how much a model can learn</td></tr>
<tr class='text-center'><td>Why can't a purely supervised model discover a genuinely new category that existed in the data but was never labeled?</td><td>A supervised model is only trained to predict the specific label categories it was given during training, so it has no mechanism to propose or recognize a category outside that set; discovering unknown groupings in the data requires unsupervised techniques like clustering instead</td></tr>
</table>`
        }
    ]
};
