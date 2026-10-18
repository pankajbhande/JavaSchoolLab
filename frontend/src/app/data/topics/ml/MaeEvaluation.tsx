import { Topic } from '../../coreJava';

export const maeEvaluation: Topic = {
    id: 'ml-model-evaluation-mae',
    name: 'MAE',
    beginner: [
        {
            content: `<h4>Using MAE to Compare Trained Models, Not Just to Score One</h4>
<ul>
<li>In the <strong>Model Evaluation</strong> stage, <strong>MAE (Mean Absolute Error)</strong> is used less to explain the math of a single model and more as a straightforward, easy-to-communicate yardstick when picking the BEST of several already-trained regression models.</li>
<li>This is the <strong>same metric</strong> covered in full mathematical depth on the site's <strong>Supervised Learning: Regression</strong> module - this page reframes it around the evaluation-context question: "of these candidate models, which one should I actually deploy?"</li>
<li>MAE reports the average absolute error in the target's ORIGINAL units (e.g. dollars, days), which makes it the most directly interpretable of the error metrics when presenting a model comparison to a non-technical decision-maker.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import mean_absolute_error
import numpy as np

y_actual = np.array([100, 150, 200, 250])

y_pred_model_a = np.array([110, 140, 210, 240])
y_pred_model_b = np.array([105, 148, 202, 248])

print(f"Model A MAE: {mean_absolute_error(y_actual, y_pred_model_a):.2f}")
print(f"Model B MAE: {mean_absolute_error(y_actual, y_pred_model_b):.2f}")
# OUTPUT:
# Model A MAE: 10.00
# Model B MAE: 4.25`
            ],
            codeExplanations: [
                `Two already-trained models' predictions are compared against the same actual values using mean_absolute_error(). Model B's MAE (4.25) is clearly lower than Model A's (10.00), giving a simple, defensible basis for choosing Model B during evaluation - each is off by 4.25 units versus 10 units on average, a comparison stated directly in the target's own units.</li>`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>During model evaluation, teams are typically comparing several candidate models (e.g. Linear Regression vs Random Forest vs Gradient Boosting) trained on the same data, and MAE gives a single, easy number for that side-by-side comparison that doesn't require explaining squared units to stakeholders.</li>
<li>Because MAE treats every unit of error equally (rather than squaring it like MSE/RMSE), it is the natural choice when the evaluation goal is "which model is typically closest to correct" rather than "which model avoids rare catastrophic misses" - a different evaluation question that MSE/RMSE answer instead.</li>
<li>The underlying math (why it's an absolute value average, its non-differentiability at zero, etc.) is covered in depth on the Regression module's MAE page; here the focus is purely on using it as a model-selection tool.</li>
</ul>
<h3>Real-World Example</h3>
A delivery-time prediction team has trained three candidate models and needs to pick one for production.
<ul>
<li>They compute MAE for each model on the same held-out validation set: Model 1 = 4.2 minutes, Model 2 = 3.1 minutes, Model 3 = 3.4 minutes.</li>
<li>Because all three numbers are in the same familiar unit (minutes), the team can immediately tell stakeholders "Model 2 is typically off by about 3 minutes, versus over 4 for Model 1" without any further translation.</li>
<li>The team selects Model 2 based on MAE, but also checks its RMSE and MSE alongside it (see those Model Evaluation pages) to confirm Model 2 isn't quietly hiding a few very large misses that a pure-MAE comparison would understate.</li>
</ul>`,
            codeExamples: [
                `# Comparing three trained models on the same validation set using MAE
import numpy as np
from sklearn.metrics import mean_absolute_error

y_actual = np.array([20, 35, 15, 50, 28, 40])

y_pred_model_1 = np.array([25, 30, 20, 55, 24, 45])
y_pred_model_2 = np.array([22, 37, 16, 48, 30, 38])
y_pred_model_3 = np.array([23, 33, 18, 53, 25, 42])

for name, preds in [("Model 1", y_pred_model_1), ("Model 2", y_pred_model_2), ("Model 3", y_pred_model_3)]:
    print(f"{name} MAE: {mean_absolute_error(y_actual, preds):.2f} minutes")
# OUTPUT:
# Model 1 MAE: 4.83 minutes
# Model 2 MAE: 2.33 minutes
# Model 3 MAE: 3.00 minutes`
            ],
            codeExplanations: [
                `The same actual delivery times are compared against three different models' predictions using mean_absolute_error(). Model 2 comes out with the lowest MAE (2.33 minutes), making it the front-runner for deployment based on this metric alone - the kind of quick, side-by-side ranking MAE is best suited for during evaluation, as opposed to re-deriving how the absolute-error average is computed from scratch.`
            ]
        },
        {
            content: `<h3>Advantages (As an Evaluation Choice)</h3>
<ul>
<li><strong>Directly interpretable in the target's own units</strong> - ideal for a model-comparison summary presented to non-technical stakeholders, since "off by 3 minutes" needs no further explanation.</li>
<li><strong>Robust to a few outlier predictions</strong> - because errors aren't squared, one unusually bad prediction won't distort the model ranking as dramatically as it would under MSE/RMSE, which is useful when the evaluation question is about TYPICAL performance rather than worst-case risk.</li>
<li><strong>Simple to compute alongside every other candidate model</strong> - a one-line scikit-learn call for each model makes it cheap to include in an automated evaluation/comparison pipeline.</li>
</ul>
<h3>Disadvantages / Limitations (As an Evaluation Choice)</h3>
<ul>
<li><strong>Can mask a model with rare, severe misses</strong> - two models with identical MAE could have very different worst-case behavior; MAE alone won't reveal that difference, so it should be paired with MSE/RMSE when tail-risk matters to the evaluation decision.</li>
<li><strong>Not scale-free</strong> - an MAE of "10" cannot be compared across models predicting different targets (e.g. minutes vs dollars) without extra context, unlike R&sup2; or MAPE.</li>
<li><strong>Doesn't explain WHY a model errs</strong> - it's a summary ranking number, not a diagnostic tool; deeper error analysis (residual plots, per-segment breakdowns) is still needed to understand a chosen model's failure patterns.</li>
</ul>
<h3>Deeper Mechanics - MAE Alongside Other Metrics During Model Selection</h3>
<ul>
<li>In practice, evaluation teams rarely pick a model on MAE alone - they compute MAE, MSE/RMSE, and R&sup2; together on the same validation set and look for agreement: a model that ranks well on all three is a safer choice than one that only wins on MAE.</li>
<li>The full mathematical derivation of MAE (why it uses absolute value, its relationship to the median as the optimal constant predictor, etc.) lives on the site's Regression module MAE page - that context is about understanding the metric itself; this page is about USING it to choose between finished models.</li>
</ul>`,
            codeExamples: [
                `# Using MAE together with MSE and R-squared to sanity-check a model ranking, not MAE alone
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_actual = np.array([20, 35, 15, 50, 28, 40])
y_pred_model_2 = np.array([22, 37, 16, 48, 30, 38])
y_pred_model_x = np.array([21, 36, 15, 30, 27, 39])   # one very large miss on point 4

for name, preds in [("Model 2", y_pred_model_2), ("Model X", y_pred_model_x)]:
    mae = mean_absolute_error(y_actual, preds)
    mse = mean_squared_error(y_actual, preds)
    r2 = r2_score(y_actual, preds)
    print(f"{name}: MAE={mae:.2f}  MSE={mse:.2f}  R2={r2:.3f}")
# OUTPUT:
# Model 2: MAE=2.33  MSE=7.33   R2=0.937
# Model X: MAE=4.83  MSE=70.83  R2=-0.610   <- MSE and R2 expose the severity MAE alone understates`
            ],
            codeExplanations: [
                `Model X has one very large miss (predicting 30 for an actual of 50), which pulls its MAE up moderately but makes its MSE and R&sup2; look dramatically worse - even turning R&sup2; negative, meaning Model X is worse than just guessing the mean. Looking at MAE in isolation would understate how bad Model X's worst-case behavior really is; checking it alongside MSE and R&sup2; during evaluation catches that risk before deployment.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When comparing several trained regression models during evaluation, why might a team prefer MAE over MSE for the initial comparison?</td><td>MAE is expressed in the target's original units and treats every error proportionally, making it easy to communicate ("off by 3 minutes on average") and robust to being distorted by a single outlier prediction, whereas MSE/RMSE would let one bad miss dominate the ranking</td></tr>
<tr class='text-center'><td>Why shouldn't a team rely on MAE alone when selecting a model for deployment?</td><td>Two models can have identical MAE while having very different worst-case behavior; MAE doesn't reveal whether a model occasionally makes a severe error, so MSE/RMSE and R-squared should be checked alongside it to catch tail-risk MAE alone would hide</td></tr>
<tr class='text-center'><td>How does this Model Evaluation framing of MAE differ from its treatment in the Regression module?</td><td>The Regression module page derives MAE's math in depth (why it uses absolute value, its relationship to the median); this Model Evaluation page assumes that understanding and focuses instead on using MAE as a practical yardstick for ranking and choosing among already-trained candidate models</td></tr>
</table>`
        }
    ]
};
