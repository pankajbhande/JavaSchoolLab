import { Topic } from '../../coreJava';

export const auc: Topic = {
    id: 'ml-model-evaluation-auc',
    name: 'AUC',
    beginner: [
        {
            content: `<h4>One Number Summarizing a Model's Performance Across Every Threshold</h4>
<ul>
<li><strong>AUC</strong> (Area Under the ROC Curve) condenses an entire ROC curve into a single scalar between 0 and 1, measuring how well a model separates the positive and negative classes overall.</li>
<li><code>AUC = 0.5</code> means the model is no better than random guessing; <code>AUC = 1.0</code> means perfect separation - every real positive is ranked higher than every real negative.</li>
<li>Unlike precision, recall, or accuracy at a single threshold, AUC evaluates the model's RANKING ability across ALL possible thresholds at once, without requiring a specific cutoff to be chosen first.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.metrics import roc_auc_score

X, y = make_classification(n_samples=1000, random_state=0)
model = LogisticRegression().fit(X, y)
probabilities = model.predict_proba(X)[:, 1]

auc_score = roc_auc_score(y, probabilities)
print(f"AUC: {auc_score:.3f}")
# OUTPUT (typical):
# AUC: 0.936   <- well above 0.5, strong separation between classes`
            ],
            codeExplanations: [
                `This trains a LogisticRegression model and computes AUC directly with scikit-learn's roc_auc_score(), passing predicted probabilities rather than hard 0/1 predictions. An AUC of 0.936 means that if you picked one random true-positive example and one random true-negative example, the model would assign a higher predicted probability to the positive one about 93.6% of the time - a single number summarizing the model's overall ranking quality without committing to any one decision threshold.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Business stakeholders often need a single headline number to judge or compare models, and AUC is the standard answer when a full ROC curve would take too long to explain or interpret in a pitch or executive summary.</li>
<li>AUC's threshold-independence makes it ideal for model SELECTION before an operating threshold has even been decided - a team can pick the best-ranking model first, then separately choose a threshold later based on business constraints.</li>
<li>Because AUC has a clean probabilistic interpretation (the probability a random positive outranks a random negative), it's also intuitive to communicate to non-technical audiences as "how good is the model at telling the two classes apart," compared to precision or recall which require a threshold to even be defined.</li>
</ul>
<h3>Real-World Example</h3>
A data science team is pitching a new fraud-detection model to company executives who have limited time and no background in ROC curves.
<ul>
<li>Instead of walking through the full ROC curve, the team reports a single headline number: <strong>"AUC = 0.92."</strong> This single scalar is enough for executives to judge that the model separates fraud from legitimate transactions well, without needing to interpret a chart or understand what a decision threshold is.</li>
<li>The team can also translate AUC into plain language: "if you pick a random fraudulent transaction and a random legitimate one, our model correctly ranks the fraudulent one as riskier 92% of the time" - a sentence executives can act on immediately.</li>
<li>The full ROC curve is still kept in an appendix for the engineering team, who will use it later to choose the actual production threshold - but for the headline pitch, AUC alone does the job.</li>
</ul>`,
            codeExamples: [
                `# Reporting one headline number (AUC) instead of a full ROC curve for a non-technical audience
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X, y = make_classification(n_samples=2000, weights=[0.95, 0.05], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = GradientBoostingClassifier(random_state=0).fit(X_train, y_train)
probabilities = model.predict_proba(X_test)[:, 1]

auc_score = roc_auc_score(y_test, probabilities)
print(f"Fraud model AUC: {auc_score:.2f}")
print(f"In plain language: a random fraud case is ranked riskier than a random legitimate case {auc_score*100:.0f}% of the time")
# OUTPUT (typical):
# Fraud model AUC: 0.92
# In plain language: a random fraud case is ranked riskier than a random legitimate case 92% of the time`
            ],
            codeExplanations: [
                `This trains a GradientBoostingClassifier on an imbalanced fraud-style dataset and computes a single AUC score with roc_auc_score() on held-out test data. Rather than presenting a full curve, the print statement translates the 0.92 AUC directly into the plain-language probabilistic interpretation: a randomly chosen fraud case is ranked as riskier than a randomly chosen legitimate case 92% of the time. This is exactly the kind of single, actionable sentence a team would use when pitching to executives who need one clear number rather than a chart to interpret.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - When a High AUC Still Isn't Enough</h3>
<ul>
<li>AUC evaluates performance averaged across EVERY possible threshold, but in production a model only ever operates at ONE chosen threshold. A model can have an excellent overall AUC while still performing poorly at the specific threshold and class balance the business actually cares about.</li>
<li>On severely imbalanced datasets, AUC can look deceptively strong because False Positive Rate (the ROC curve's x-axis) is measured relative to the huge negative class - a meaningful number of false positives barely moves it. This is the same blind spot the ROC curve itself has, and it carries directly into AUC as its single-number summary.</li>
<li>In these cases, <strong>Average Precision</strong> (the area under the Precision-Recall curve) is often a more honest single-number summary, since it's sensitive to the actual ratio of false positives to true positives rather than to the size of the negative class - AUC and Average Precision should be viewed as complementary, not interchangeable, summaries.</li>
</ul>`,
            codeExamples: [
                `# A high AUC can coexist with poor real-world precision under severe imbalance
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score

# severe imbalance: positives are only 0.5% of the data
X, y = make_classification(n_samples=5000, weights=[0.995, 0.005], flip_y=0.02, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
probabilities = model.predict_proba(X_test)[:, 1]

print(f"AUC: {roc_auc_score(y_test, probabilities):.3f}")
print(f"Average Precision (PR-AUC): {average_precision_score(y_test, probabilities):.3f}")
# OUTPUT (typical):
# AUC: 0.870                    <- looks strong
# Average Precision (PR-AUC): 0.310   <- reveals real-world precision is weak on this rare class`
            ],
            codeExplanations: [
                `This trains a LogisticRegression model on a severely imbalanced dataset (positives are only 0.5% of samples) and computes both AUC and Average Precision on the same held-out predictions. AUC reports a seemingly strong 0.870, since False Positive Rate is diluted by the huge negative class. But average_precision_score() (the PR curve's area) reports a much lower 0.310, exposing that the model is frequently wrong when it does flag something as positive, relative to how rare true positives actually are. This is exactly why a single AUC number, however convenient for a pitch deck, can be insufficient on rare-event problems without also checking Average Precision or the raw confusion matrix at the intended operating threshold.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does AUC measure, and what is its probabilistic interpretation?</td><td>AUC is the area under the ROC curve, summarizing performance across all decision thresholds in one number between 0 and 1; it equals the probability that a randomly chosen positive example is ranked higher (assigned a higher predicted probability) than a randomly chosen negative example</td></tr>
<tr class='text-center'><td>Why is AUC popular for reporting to non-technical stakeholders?</td><td>It condenses an entire ROC curve into one easily understood scalar, and it's threshold-independent, so it can be used to compare or select models before a specific operating threshold has been chosen - useful when a full curve would take too long to explain</td></tr>
<tr class='text-center'><td>Why can a high AUC still be misleading, and what is often checked alongside it?</td><td>AUC averages performance across all thresholds while production only uses one, and on severely imbalanced data False Positive Rate is diluted by the large negative class, making AUC look deceptively strong; Average Precision (area under the Precision-Recall curve) is often checked alongside it since it's sensitive to the true ratio of false positives to true positives</td></tr>
</table>`
        }
    ]
};
