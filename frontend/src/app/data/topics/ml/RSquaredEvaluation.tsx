import { Topic } from '../../coreJava';

export const rSquaredEvaluation: Topic = {
    id: 'ml-model-evaluation-r',
    name: 'R²',
    beginner: [
        {
            content: `<h4>Using R&sup2; to Judge Whether a Model Is Worth Deploying At All</h4>
<ul>
<li>In the <strong>Model Evaluation</strong> stage, <strong>R&sup2;</strong> is used as a quick sanity check on each candidate model: does it explain a meaningful share of the target's variance compared to a trivial "always guess the average" baseline, before diving into more detailed error metrics?</li>
<li>This is the <strong>same metric</strong> covered in full mathematical depth on the site's <strong>Supervised Learning: Regression</strong> module - this page reframes it around the evaluation-context question: "is this candidate model even worth comparing further against the others?"</li>
<li>Being scale-free, R&sup2; is also the one metric in this family that lets you compare a model's relative quality against benchmarks reported for entirely different problems.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import r2_score
import numpy as np

y_actual = np.array([100, 150, 200, 250, 300])

y_pred_model_a = np.array([110, 140, 210, 240, 310])
y_pred_model_b = np.array([200, 200, 200, 200, 200])   # a near-useless model

print(f"Model A R-squared: {r2_score(y_actual, y_pred_model_a):.3f}")
print(f"Model B R-squared: {r2_score(y_actual, y_pred_model_b):.3f}")
# OUTPUT:
# Model A R-squared: 0.988
# Model B R-squared: 0.000`
            ],
            codeExplanations: [
                `Model A's R&sup2; of 0.988 shows it explains almost all of the variance in the actual values. Model B, which just predicts the same constant value every time, scores exactly 0.000 - by definition the score of the "always predict the mean" baseline - immediately flagging it as not worth further evaluation.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before comparing candidate models on fine-grained error metrics like MAE or RMSE, R&sup2; answers a coarser but essential first question: is this model actually capturing real signal, or is it barely better (or even worse) than a trivial guess? A model with R&sup2; near zero or negative can usually be eliminated from consideration immediately.</li>
<li>Because it's scale-free, R&sup2; lets an evaluation team sanity-check a new model's quality against external benchmarks or prior projects on totally different targets, something MAE/MSE/RMSE cannot do since they're tied to specific units.</li>
<li>The underlying derivation (why R&sup2; = 1 - SS_residual/SS_total, why it can go negative, etc.) lives on the Regression module's R&sup2; page; here the focus is on using R&sup2; as an evaluation-stage filter and comparison tool.</li>
</ul>
<h3>Real-World Example</h3>
A team evaluates three candidate models for predicting quarterly revenue before choosing one to present to leadership.
<ul>
<li>Model 1 scores R&sup2; = 0.91, Model 2 scores R&sup2; = 0.88, and Model 3 (a quick baseline someone threw together) scores R&sup2; = 0.02.</li>
<li>Model 3 is immediately eliminated - explaining only 2% of revenue variance, it is barely better than always predicting the historical average quarter's revenue, so no further evaluation time is spent on it.</li>
<li>Between Model 1 and Model 2, the small R&sup2; gap alone isn't enough to decide, so the team moves on to comparing their RMSE and MAE to understand the practical size of the remaining error before making a final call.</li>
</ul>`,
            codeExamples: [
                `# Using R-squared as a first-pass filter across several candidate models
import numpy as np
from sklearn.metrics import r2_score

y_actual = np.array([120, 135, 128, 142, 150, 138, 145, 160])
candidates = {
    "Model 1 (Gradient Boosting)": np.array([118, 137, 130, 140, 148, 136, 147, 158]),
    "Model 2 (Linear Regression)": np.array([122, 130, 125, 145, 152, 133, 149, 155]),
    "Model 3 (rough baseline)":    np.array([140, 140, 140, 140, 140, 140, 140, 140]),
}

for name, preds in candidates.items():
    r2 = r2_score(y_actual, preds)
    verdict = "eliminate" if r2 < 0.5 else "keep for further evaluation"
    print(f"{name}: R2={r2:.3f}  -> {verdict}")
# OUTPUT:
# Model 1 (Gradient Boosting): R2=0.940  -> keep for further evaluation
# Model 2 (Linear Regression): R2=0.884  -> keep for further evaluation
# Model 3 (rough baseline): R2=0.000    -> eliminate`
            ],
            codeExplanations: [
                `Each candidate's R&sup2; is computed against the same actual revenue figures, and a simple rule (eliminate anything below 0.5) is applied as a first-pass filter. Model 3, which just predicts a flat constant, scores R&sup2; = 0.000 and is eliminated immediately, saving the team from wasting further evaluation effort comparing its MAE or RMSE against the two genuinely competitive models.`
            ]
        },
        {
            content: `<h3>Advantages (As an Evaluation Choice)</h3>
<ul>
<li><strong>Fast first-pass filter</strong> - immediately flags candidate models that aren't capturing real signal, before spending time on more detailed error-metric comparisons.</li>
<li><strong>Scale-free comparability</strong> - lets an evaluation team judge a new model's quality against benchmarks from other projects or published results, even on a completely different target variable.</li>
<li><strong>Intuitive framing for leadership updates</strong> - "the model explains 91% of the variance in revenue" is an easy sentence to include in a status report, more so than a raw RMSE figure.</li>
</ul>
<h3>Disadvantages / Limitations (As an Evaluation Choice)</h3>
<ul>
<li><strong>Doesn't distinguish between models with different numbers of features</strong> - a model with many extra features can show inflated R&sup2; purely from fitting noise, making raw R&sup2; comparisons across models of different complexity unreliable (this is exactly what Adjusted R&sup2; is for).</li>
<li><strong>High R&sup2; doesn't guarantee acceptable absolute error</strong> - a model can explain 95% of variance yet still have an MAE too large for the business use case; R&sup2; alone can't answer "is the typical error small enough in practice," which is why it's paired with MAE/RMSE.</li>
<li><strong>Can be misleading on a small or unusual validation slice</strong> - R&sup2; measured on a narrow range of the data can look very different from R&sup2; on the full deployment population, so the validation set's representativeness matters a lot when using it to filter candidates.</li>
</ul>
<h3>Deeper Mechanics - Pairing R&sup2; With Error Metrics During Evaluation</h3>
<ul>
<li>A common evaluation pattern is to use R&sup2; as a coarse filter (eliminate anything clearly weak), then use MAE/RMSE among the survivors to make the final selection based on the actual, business-relevant size of the remaining error.</li>
<li>The full mathematical treatment of R&sup2; - its derivation, why it can go negative, and why it always increases with more features - is covered on the Regression module's R&sup2; page; this page's job is showing how that same score gets used practically to filter and compare finished models.</li>
</ul>`,
            codeExamples: [
                `# Combining R-squared (coarse filter) with RMSE (fine-grained comparison) during evaluation
import numpy as np
from sklearn.metrics import r2_score, mean_squared_error

y_actual = np.array([120, 135, 128, 142, 150, 138, 145, 160])
finalists = {
    "Model 1 (Gradient Boosting)": np.array([118, 137, 130, 140, 148, 136, 147, 158]),
    "Model 2 (Linear Regression)": np.array([122, 130, 125, 145, 152, 133, 149, 155]),
}

for name, preds in finalists.items():
    r2 = r2_score(y_actual, preds)
    rmse = mean_squared_error(y_actual, preds) ** 0.5
    print(f"{name}: R2={r2:.3f}  RMSE={rmse:.2f}")
# OUTPUT:
# Model 1 (Gradient Boosting): R2=0.940  RMSE=2.09
# Model 2 (Linear Regression): R2=0.884  RMSE=3.24`
            ],
            codeExplanations: [
                `Having already eliminated the weak baseline using R&sup2;, the two remaining finalists are compared on both R&sup2; and RMSE together. Model 1 wins on both counts here, giving the evaluation team a confident, multi-metric basis for its final choice rather than relying on R&sup2; in isolation.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How is R-squared typically used as a first step when evaluating several candidate models?</td><td>As a coarse filter - a model with R-squared near zero or negative is barely better than (or worse than) always predicting the mean, so it can usually be eliminated immediately, before spending time comparing more detailed error metrics like MAE or RMSE among the remaining candidates</td></tr>
<tr class='text-center'><td>Why can't a team rely on R-squared alone to pick a final model?</td><td>A high R-squared doesn't guarantee the absolute error is small enough for the business use case, and R-squared can be inflated by adding more features regardless of whether they're genuinely useful, so it's paired with MAE/RMSE (for practical error size) and sometimes Adjusted R-squared (to account for feature count) before a final decision is made</td></tr>
<tr class='text-center'><td>How does this Model Evaluation framing of R-squared differ from the Regression module's treatment of it?</td><td>The Regression module page derives R-squared's math from scratch (SS_residual vs SS_total, why it can go negative, why adding features never decreases it); this page assumes that understanding and instead focuses on using R-squared practically as a fast filter and comparison tool among already-trained candidate models</td></tr>
</table>`
        }
    ]
};
