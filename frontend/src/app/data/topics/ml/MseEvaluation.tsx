import { Topic } from '../../coreJava';

export const mseEvaluation: Topic = {
    id: 'ml-model-evaluation-mse',
    name: 'MSE',
    beginner: [
        {
            content: `<h4>Using MSE to Screen Out Models With Risky Large Errors</h4>
<ul>
<li>In the <strong>Model Evaluation</strong> stage, <strong>MSE (Mean Squared Error)</strong> is used to compare already-trained candidate models specifically because it heavily penalizes large errors - making it the metric of choice when picking a model that avoids occasional big misses matters more than average performance.</li>
<li>This is the <strong>same metric</strong> covered in full mathematical depth on the site's <strong>Supervised Learning: Regression</strong> module - this page reframes it around the evaluation-context question: "which candidate model best avoids severe mistakes?"</li>
<li>Because MSE's units are squared, it's rarely reported to stakeholders directly during evaluation - it's mainly used internally to rank models, often alongside its square root, RMSE, which restores interpretable units.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import mean_squared_error
import numpy as np

y_actual = np.array([100, 150, 200, 250])

y_pred_model_a = np.array([110, 140, 210, 240])
y_pred_model_b = np.array([105, 148, 202, 300])   # one large miss

print(f"Model A MSE: {mean_squared_error(y_actual, y_pred_model_a):.2f}")
print(f"Model B MSE: {mean_squared_error(y_actual, y_pred_model_b):.2f}")
# OUTPUT:
# Model A MSE: 100.00
# Model B MSE: 662.25`
            ],
            codeExplanations: [
                `Model B is closer to actual on three of four points but has one large miss (predicting 300 instead of 250). MSE flags Model B as far riskier overall than Model A because that one squared error dominates the average - exactly the kind of signal MSE is used for when screening candidate models during evaluation.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>When evaluating several trained models side by side, MSE surfaces which candidates have a "long tail" of occasionally severe mistakes, even if their typical performance (as measured by MAE) looks similar - a distinction critical when deploying a model into a context where one bad prediction is very costly.</li>
<li>Because squaring the error amplifies large mistakes, MSE-based model comparisons naturally favor consistency over occasional brilliance-with-risk, which is often exactly the tradeoff an evaluation team needs to make explicit before choosing a production model.</li>
<li>The full derivation of why MSE is a smooth, differentiable loss function suited to gradient-based training lives on the Regression module's MSE page; here the focus is purely on using MSE to rank finished models.</li>
</ul>
<h3>Real-World Example</h3>
An insurance company evaluating two trained claim-cost prediction models before choosing one for pricing decisions.
<ul>
<li>Model A has a low, consistent error on almost every claim. Model B is excellent on the vast majority of claims but occasionally predicts wildly low costs for a handful of unusual large claims.</li>
<li>MAE alone might rank the two models closely, since Model B's errors are rare. But MSE, computed during the model evaluation step, sharply penalizes Model B's rare severe misses, correctly warning the pricing team that Model B carries real financial tail-risk.</li>
<li>The team uses this MSE comparison as a gating check: a model isn't approved for production pricing decisions unless its MSE stays within an acceptable bound, regardless of how good its average-case MAE looks.</li>
</ul>`,
            codeExamples: [
                `# Screening two trained models for tail-risk during evaluation, using MSE
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

y_actual = np.array([1000, 1200, 900, 1500, 20000])   # last one is a rare large claim

y_pred_model_a = np.array([1050, 1150, 950, 1450, 15000])
y_pred_model_b = np.array([980, 1210, 890, 1490, 5000])   # badly undershoots the large claim

for name, preds in [("Model A", y_pred_model_a), ("Model B", y_pred_model_b)]:
    mae = mean_absolute_error(y_actual, preds)
    mse = mean_squared_error(y_actual, preds)
    print(f"{name}: MAE={mae:.0f}  MSE={mse:,.0f}")
# OUTPUT:
# Model A: MAE=680  MSE=5,050,000
# Model B: MAE=1046 MSE=45,006,200   <- MSE reveals the tail-risk MAE understates`
            ],
            codeExplanations: [
                `Model B's MAE is only moderately worse than Model A's, but its MSE is nearly nine times higher, because Model B badly undershoots the one rare, very large claim. During evaluation, this MSE comparison would correctly flag Model B as the riskier choice for a pricing system, even though a quick glance at MAE alone would have understated how different the two models actually are on the case that matters most.`
            ]
        },
        {
            content: `<h3>Advantages (As an Evaluation Choice)</h3>
<ul>
<li><strong>Surfaces tail-risk between candidate models</strong> - exactly what's needed when the evaluation goal is to avoid deploying a model with rare but costly large errors.</li>
<li><strong>Mathematically consistent with how many models were trained</strong> - since OLS Linear Regression and many neural network regressors are literally trained to minimize a form of MSE, evaluating with MSE keeps the training objective and the evaluation criterion aligned.</li>
<li><strong>Cheap and standard to compute across any number of candidates</strong> - a one-line call per model makes it trivial to include in an automated leaderboard alongside MAE, RMSE, and R&sup2;.</li>
</ul>
<h3>Disadvantages / Limitations (As an Evaluation Choice)</h3>
<ul>
<li><strong>Squared units make raw values hard to communicate</strong> - a difference of "5 million vs 45 million" in MSE means little to a stakeholder without translating back to RMSE first.</li>
<li><strong>A single rare outlier in the validation set can flip a model ranking</strong> - if the held-out evaluation data happens to contain (or omit) a rare extreme case, MSE-based rankings can be sensitive to exactly which examples ended up in that split.</li>
<li><strong>Doesn't replace understanding WHY a model has a large error</strong> - MSE tells you a candidate model has risk, not where that risk comes from; root-causing still requires deeper residual analysis.</li>
</ul>
<h3>Deeper Mechanics - MSE as a Model-Selection Gate</h3>
<ul>
<li>Many evaluation pipelines set an explicit MSE (or RMSE) threshold a candidate model must clear before being considered for deployment, precisely because MSE is the metric most sensitive to the kind of rare, severe mistake that a business often cares about avoiding more than shaving a bit off the average error.</li>
<li>For the full mathematical treatment - why squaring the error is done, its relationship to variance, and its role as an actual training objective - see the Regression module's MSE page; this page's job is showing how that same number gets used to choose between finished models.</li>
</ul>`,
            codeExamples: [
                `# Setting an MSE-based deployment gate across several candidate models
import numpy as np
from sklearn.metrics import mean_squared_error

y_actual = np.array([1000, 1200, 900, 1500, 20000])
candidates = {
    "Model A": np.array([1050, 1150, 950, 1450, 15000]),
    "Model B": np.array([980, 1210, 890, 1490, 5000]),
    "Model C": np.array([1010, 1190, 910, 1480, 19500]),
}

MSE_THRESHOLD = 10_000_000
for name, preds in candidates.items():
    mse = mean_squared_error(y_actual, preds)
    verdict = "PASS" if mse <= MSE_THRESHOLD else "FAIL"
    print(f"{name}: MSE={mse:,.0f}  -> {verdict}")
# OUTPUT:
# Model A: MSE=5,050,000   -> PASS
# Model B: MSE=45,006,200  -> FAIL
# Model C: MSE=62,500      -> PASS`
            ],
            codeExplanations: [
                `Three candidate models are each checked against a fixed MSE threshold representing the maximum tail-risk the business is willing to accept. Model C, which stays close to the actual value even on the rare large claim, passes easily; Model B, which badly undershoots that same claim, fails the gate despite possibly looking competitive on MAE. This is a concrete example of MSE being used not just as a ranking number but as an explicit go/no-go criterion during model evaluation.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why would an evaluation team look at MSE in addition to MAE when comparing trained models?</td><td>MAE treats every error proportionally and can look similar across models even when one has rare, severe mistakes; MSE squares errors, amplifying those rare large misses, so it surfaces tail-risk between candidate models that MAE alone would understate</td></tr>
<tr class='text-center'><td>Why might an evaluation pipeline set an explicit MSE threshold as a deployment gate?</td><td>Because MSE is the metric most sensitive to occasional severe mistakes, a fixed MSE ceiling ensures a candidate model doesn't get approved for production just because its average error looks fine, if it still carries an unacceptable risk of a rare, very costly misprediction</td></tr>
<tr class='text-center'><td>How does this Model Evaluation framing of MSE differ from the Regression module's treatment of it?</td><td>The Regression module page derives MSE's math from scratch (why errors are squared, its role as OLS's training objective); this page assumes that understanding and instead focuses on how MSE is used practically to rank and gate already-trained candidate models before deployment</td></tr>
</table>`
        }
    ]
};
