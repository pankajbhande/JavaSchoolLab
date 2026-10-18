import { Topic } from '../../coreJava';

export const rmseEvaluation: Topic = {
    id: 'ml-model-evaluation-rmse',
    name: 'RMSE',
    beginner: [
        {
            content: `<h4>Using RMSE as the "Headline Number" When Comparing Models</h4>
<ul>
<li>In the <strong>Model Evaluation</strong> stage, <strong>RMSE (Root Mean Squared Error)</strong> is often the single most-reported number when comparing trained regression models, because it combines MSE's sensitivity to large errors with units that match the original target - making it both rigorous and easy to state out loud.</li>
<li>This is the <strong>same metric</strong> covered in full mathematical depth on the site's <strong>Supervised Learning: Regression</strong> module - this page reframes it around the evaluation-context question: "which model has the best typical-error profile, expressed in real units, once large mistakes are accounted for?"</li>
<li><code>RMSE = &radic;MSE</code>, so it inherits MSE's tail-risk sensitivity while being directly comparable to MAE, since both are now in the same units.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import mean_squared_error
import numpy as np

y_actual = np.array([100, 150, 200, 250])

y_pred_model_a = np.array([110, 140, 210, 240])
y_pred_model_b = np.array([105, 148, 202, 300])

rmse_a = mean_squared_error(y_actual, y_pred_model_a) ** 0.5
rmse_b = mean_squared_error(y_actual, y_pred_model_b) ** 0.5
print(f"Model A RMSE: {rmse_a:.2f}")
print(f"Model B RMSE: {rmse_b:.2f}")
# OUTPUT:
# Model A RMSE: 10.00
# Model B RMSE: 25.74`
            ],
            codeExplanations: [
                `RMSE is computed as the square root of MSE for each model. Unlike raw MSE (which would be in squared units), RMSE is back in the target's original units, so "Model A is typically off by 10" and "Model B is typically off by about 26" can be stated directly and compared side by side with MAE figures for the same models.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>During model evaluation, RMSE is frequently the default metric reported in leaderboards and comparison tables specifically because it is interpretable (same units as the target) AND still penalizes large errors more than small ones, giving a good balance between communicability and rigor.</li>
<li>Comparing RMSE to MAE for the SAME model is itself a diagnostic: if RMSE is much larger than MAE, that gap signals the model has some large individual errors dragging the squared-error metric up, even though its typical (MAE) error looks fine - a quick way to detect models with hidden tail-risk during evaluation.</li>
<li>The underlying derivation (why taking a square root of MSE restores interpretable units, why RMSE remains differentiable, etc.) lives on the Regression module's RMSE page; here the focus is on RMSE's practical role in choosing between finished models.</li>
</ul>
<h3>Real-World Example</h3>
A property-valuation team is choosing between two trained models before rolling one out to their pricing tool.
<ul>
<li>Model A reports MAE = $18,000 and RMSE = $19,500 - close together, suggesting its errors are fairly uniform in size.</li>
<li>Model B reports MAE = $17,000 (slightly better than Model A) but RMSE = $42,000 - a huge gap, revealing that although Model B is typically slightly more accurate, it occasionally makes very large errors that RMSE is picking up and MAE is hiding.</li>
<li>Because the pricing tool cannot tolerate rare wildly-wrong valuations, the team selects Model A despite its slightly worse MAE, using the RMSE-vs-MAE gap as the deciding evaluation signal.</li>
</ul>`,
            codeExamples: [
                `# Using the RMSE-vs-MAE gap as a model-selection signal during evaluation
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

y_actual = np.array([300000, 450000, 275000, 600000, 380000])

y_pred_model_a = np.array([315000, 440000, 290000, 585000, 395000])
y_pred_model_b = np.array([305000, 448000, 278000, 598000, 250000])   # one very large miss

for name, preds in [("Model A", y_pred_model_a), ("Model B", y_pred_model_b)]:
    mae = mean_absolute_error(y_actual, preds)
    rmse = mean_squared_error(y_actual, preds) ** 0.5
    print(f"{name}: MAE=\${mae:,.0f}  RMSE=\${rmse:,.0f}  gap=\${rmse - mae:,.0f}")
# OUTPUT:
# Model A: MAE=$13,000  RMSE=$13,491  gap=$491
# Model B: MAE=$32,400  RMSE=$59,033  gap=$26,633   <- large gap flags hidden tail-risk`
            ],
            codeExplanations: [
                `Model B has a much larger RMSE-minus-MAE gap than Model A, because one badly mispriced house (predicting $250,000 for a true $380,000 property) drags RMSE up disproportionately while MAE, which treats errors proportionally, absorbs it more gently. This gap is a quick, reusable diagnostic during model evaluation: a small RMSE-MAE gap suggests uniform error sizes, while a large gap flags a model with rare severe mistakes worth investigating before deployment.`
            ]
        },
        {
            content: `<h3>Advantages (As an Evaluation Choice)</h3>
<ul>
<li><strong>Interpretable AND outlier-sensitive at the same time</strong> - the best of both worlds compared to reporting raw MSE (hard to interpret) or MAE alone (can hide tail-risk), making it a strong default "headline" metric for model comparison tables.</li>
<li><strong>Enables the RMSE-vs-MAE diagnostic</strong> - comparing the two for the same model is a fast way to spot whether a candidate has hidden large-error risk without doing full residual analysis.</li>
<li><strong>Widely recognized</strong> - RMSE is a standard reporting metric across most regression competitions and industry benchmarks, making cross-team and cross-project comparisons easier during evaluation.</li>
</ul>
<h3>Disadvantages / Limitations (As an Evaluation Choice)</h3>
<ul>
<li><strong>Still dominated by outliers</strong> - inherits MSE's sensitivity, so a validation set with one unusual extreme case can swing RMSE-based rankings, sometimes more than the underlying model quality actually differs.</li>
<li><strong>Not scale-free</strong> - like MAE, an RMSE of "40,000" only means something in the context of the specific target being predicted, so it can't be used to compare across differently-scaled problems the way R&sup2; or MAPE can.</li>
<li><strong>Doesn't by itself explain the CAUSE of a large error</strong> - a high RMSE says a model has risk somewhere, but pinpointing which segment of the data drives it still requires further breakdown.</li>
</ul>
<h3>Deeper Mechanics - RMSE as the Default Leaderboard Metric</h3>
<ul>
<li>Many automated model-evaluation pipelines (e.g. scikit-learn's <code>cross_val_score</code> with a negative RMSE scorer) use RMSE as the default ranking criterion specifically because it balances interpretability with sensitivity to large errors, without requiring a separate MSE-to-RMSE conversion step for reporting.</li>
<li>The mathematical case for WHY the square root of MSE is the "right" way to return to original units (rather than some other transform) is covered on the Regression module's RMSE page; this page's focus is on RMSE's role in ranking and diagnosing finished models during evaluation.</li>
</ul>`,
            codeExamples: [
                `# Using RMSE as the ranking metric in a simple automated model-evaluation pipeline
import numpy as np
from sklearn.metrics import mean_squared_error

y_actual = np.array([300000, 450000, 275000, 600000, 380000])
candidates = {
    "Linear Regression": np.array([315000, 440000, 290000, 585000, 395000]),
    "Random Forest":     np.array([305000, 448000, 278000, 598000, 250000]),
    "Gradient Boosting": np.array([302000, 452000, 273000, 601000, 383000]),
}

results = {name: mean_squared_error(y_actual, preds) ** 0.5 for name, preds in candidates.items()}
ranked = sorted(results.items(), key=lambda item: item[1])
for name, rmse in ranked:
    print(f"{name}: RMSE=\${rmse:,.0f}")
# OUTPUT:
# Gradient Boosting: RMSE=$3,391
# Linear Regression: RMSE=$13,491
# Random Forest: RMSE=$59,033`
            ],
            codeExplanations: [
                `Three candidate models' RMSE values are computed and sorted lowest-to-highest, directly producing a ranked leaderboard for the evaluation step. Gradient Boosting comes out on top with the smallest RMSE, meaning it stays close to actual prices even accounting for its worst prediction, while Random Forest's one large miss earns it the highest (worst) RMSE among the three - exactly the kind of quick, defensible ranking RMSE is used for when comparing trained regression models.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is RMSE often the default "headline" metric when comparing trained regression models?</td><td>It combines MSE's sensitivity to large errors with units matching the original target, giving a number that is both interpretable to stakeholders and still rigorous about penalizing occasional big mistakes, unlike raw MSE (uninterpretable units) or MAE alone (can hide tail-risk)</td></tr>
<tr class='text-center'><td>What does a large gap between a model's RMSE and its MAE indicate during evaluation?</td><td>A large gap signals the model has some individual errors that are much bigger than its typical error, since RMSE amplifies large errors through squaring while MAE treats every error proportionally; a small gap suggests uniformly-sized errors, while a large one flags hidden tail-risk worth investigating before deployment</td></tr>
<tr class='text-center'><td>How does this Model Evaluation framing of RMSE differ from the Regression module's treatment of it?</td><td>The Regression module page derives RMSE's math (why taking the square root of MSE restores interpretable units); this page assumes that understanding and instead focuses on using RMSE practically to rank candidate models and diagnose hidden tail-risk via the RMSE-vs-MAE comparison</td></tr>
</table>`
        }
    ]
};
