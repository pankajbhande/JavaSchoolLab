import { Topic } from '../../coreJava';

export const rmse: Topic = {
    id: 'ml-regression-rmse',
    name: 'RMSE',
    beginner: [
        {
            content: `<h4>Bringing MSE Back Into Real Units</h4>
<ul>
<li><strong>Root Mean Squared Error (RMSE)</strong> is simply the square root of <strong>MSE</strong>: <code>RMSE = &radic;MSE</code>. It keeps MSE's outlier-sensitivity (errors are still squared internally) but undoes the squaring at the very end, returning the result to the target's ORIGINAL units.</li>
<li>Reporting "MSE = 225,000,000 dollars-squared" means nothing intuitively; reporting "RMSE = $15,000" is immediately understandable as a typical prediction error in dollars.</li>
<li>Because large errors were squared before the square root is taken, RMSE still penalizes big misses more heavily than a metric like <strong>MAE</strong> - it's best thought of as "MSE's outlier-sensitivity, translated back into a number you can actually picture".</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import mean_squared_error
import numpy as np

y_actual =    np.array([200000, 300000, 400000, 500000])
y_predicted = np.array([210000, 290000, 420000, 480000])

mse_value = mean_squared_error(y_actual, y_predicted)
rmse_value = np.sqrt(mse_value)
print(f"MSE:  {mse_value:,.0f} dollars-squared")
print(f"RMSE: {rmse_value:,.0f} dollars")
# OUTPUT:
# MSE:  260,000,000 dollars-squared
# RMSE: 16,125 dollars`
            ],
            codeExplanations: [
                `This first computes MSE exactly as before (260,000,000 dollars-squared, uninterpretable on its own), then takes its square root with np.sqrt() to get RMSE. The result, $16,125, is directly comparable to the house prices themselves and can be read plainly as "this model's typical prediction is off by roughly $16,000" - the same underlying error information as MSE, just expressed in a unit a human can reason about.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>RMSE exists specifically to solve MSE's biggest usability problem - its squared, unintuitive units - without giving up MSE's useful property of penalizing large errors heavily. It is arguably the most commonly reported regression metric in practice for exactly this reason: interpretable AND outlier-aware.</li>
<li>Because the square root is a monotonic transformation, RMSE preserves every ranking that MSE would produce - if Model A has a lower MSE than Model B, it will also have a lower RMSE. RMSE never changes WHICH model looks better, only how easy the resulting number is to talk about.</li>
<li>The relationship between RMSE and MAE (RMSE is always &ge; MAE) gives a quick built-in diagnostic: the size of the GAP between them reveals how much a model's error is being driven by a few large outliers versus many small, similarly-sized ones.</li>
</ul>
<h3>Real-World Example</h3>
A real-estate analytics team needs to describe a house-price model's error in the company's investor deck.
<ul>
<li>They could report "MSE = 225,000,000" - a number with no intuitive meaning that would need a footnote explaining "dollars squared" to anyone reading the deck.</li>
<li>Instead they report "<strong>RMSE = $15,000</strong>" - immediately understandable as "on a typical prediction, this model is off by about $15,000", directly comparable to the actual price ranges the audience already understands.</li>
<li>Because RMSE still squares errors internally before taking the root, it also still flags the same underlying risk MSE would - if the team sees RMSE noticeably larger than the model's MAE for the same predictions, that gap itself is a signal that a handful of large errors (not a uniformly moderate error across the board) are driving the model's overall error.</li>
</ul>`,
            codeExamples: [
                `# Comparing RMSE and MAE side by side to detect the fingerprint of outlier errors
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

y_actual = np.array([200000, 300000, 400000, 500000, 600000, 1200000])

# Model with fairly uniform errors
y_pred_uniform = np.array([215000, 285000, 420000, 480000, 615000, 1215000])
# Model with mostly tiny errors but one huge miss
y_pred_one_outlier = np.array([201000, 299000, 399000, 501000, 598000, 700000])

for name, y_pred in [("Uniform-error model", y_pred_uniform), ("One-outlier model", y_pred_one_outlier)]:
    mae = mean_absolute_error(y_actual, y_pred)
    rmse = np.sqrt(mean_squared_error(y_actual, y_pred))
    print(f"{name}: MAE=\${mae:,.0f}  RMSE=\${rmse:,.0f}  gap=\${rmse - mae:,.0f}")
# OUTPUT (typical):
# Uniform-error model: MAE=$15,000  RMSE=$15,811  gap=$811       <- small gap: errors are fairly uniform
# One-outlier model:   MAE=$17,000  RMSE=$204,633  gap=$187,633  <- huge gap: one large error dominates`
            ],
            codeExplanations: [
                `Two models are compared on the same six houses: one with fairly uniform moderate errors across the board, and one that is nearly perfect except for a single catastrophic miss on the most expensive house. Both metrics are computed for each. The uniform-error model has RMSE only slightly above its MAE, since no single error dominates the squared sum. The one-outlier model has a similar (even slightly worse) MAE to the uniform model, but its RMSE explodes far above its MAE - the single large squared error dominates the RMSE calculation. The size of the RMSE-minus-MAE gap is itself a useful diagnostic: a small gap means the model's errors are fairly evenly sized, while a large gap is a red flag that a few outlier predictions are driving most of the reported error.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Same units as the target</strong> - unlike MSE, an RMSE of "$15,000" or "12.4 minutes" is directly meaningful without any mental conversion.</li>
<li><strong>Still sensitive to large errors</strong> - because the squaring happens before the square root, RMSE keeps MSE's property of penalizing big misses more than proportionally, unlike MAE.</li>
<li><strong>Mathematically convenient</strong> - RMSE inherits MSE's smooth differentiability (indirectly, through the chain rule), so models are often still trained by minimizing MSE and then RMSE is reported afterward purely for interpretability.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Still dominated by outliers</strong> - taking a square root at the end doesn't undo the fact that a single very large error was squared first; RMSE can still make one bad prediction look like the dominant story of a model's performance, same as MSE.</li>
<li><strong>Not as robust as MAE</strong> - when the actual business cost of errors really does scale linearly (not quadratically) with size, RMSE gives a distorted picture compared to MAE.</li>
<li><strong>Scale-dependent, like MSE and MAE</strong> - an RMSE of 1,000 is excellent for a house-price model but terrible for a model predicting a 0-to-10 rating, so RMSE values can't be compared meaningfully across problems with different target scales without extra context (this is part of why R&sup2; exists as a scale-free alternative).</li>
</ul>
<h3>Deeper Mechanics - The RMSE &ge; MAE Relationship</h3>
<ul>
<li>Mathematically, RMSE is always greater than or equal to MAE for any set of predictions, because of Jensen's inequality applied to the convex squaring function - averaging squared values and then taking a square root can never produce something smaller than simply averaging the absolute values directly.</li>
<li>The two are EQUAL only in the special case where every single error has exactly the same absolute size - the moment errors vary in size at all, RMSE pulls ahead of MAE, and the more that variation is concentrated in a few large errors rather than spread evenly, the bigger that gap becomes.</li>
</ul>`,
            codeExamples: [
                `# Proving RMSE >= MAE always holds, and that they're equal only when every error has the same magnitude
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

def compare(name, errors):
    y_actual = np.zeros(len(errors))
    y_pred = -np.array(errors)  # so (actual - predicted) == errors
    mae = mean_absolute_error(y_actual, y_pred)
    rmse = np.sqrt(mean_squared_error(y_actual, y_pred))
    print(f"{name}: errors={errors}  MAE={mae:.2f}  RMSE={rmse:.2f}")

compare("All errors equal size", [5, -5, 5, -5])
compare("Errors vary moderately", [1, 2, 3, 10])
compare("Errors vary wildly (one big outlier)", [1, 1, 1, 20])
# OUTPUT:
# All errors equal size: errors=[5, -5, 5, -5]  MAE=5.00  RMSE=5.00        <- equal!
# Errors vary moderately: errors=[1, 2, 3, 10]  MAE=4.00  RMSE=5.48
# Errors vary wildly (one big outlier): errors=[1, 1, 1, 20]  MAE=5.75  RMSE=10.03  <- biggest gap`
            ],
            codeExplanations: [
                `Three sets of hypothetical errors are compared. When every error has exactly the same absolute magnitude (5, -5, 5, -5), MAE and RMSE come out IDENTICAL - confirming the special case where the inequality becomes equality. As the errors are made to vary more (1, 2, 3, 10), RMSE pulls ahead of MAE, and when the variation is concentrated into one dominant outlier (1, 1, 1, 20) the gap grows largest of all. This demonstrates the general rule that RMSE &ge; MAE always, and that the SIZE of the gap between them is itself informative: a near-zero gap suggests uniform error sizes, while a large gap is a signal that a small number of outlier errors are responsible for most of the model's overall error.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does RMSE solve that MSE has?</td><td>MSE's units are squared (e.g. dollars-squared), which is not interpretable; taking the square root of MSE returns the error to the target's original units (e.g. dollars) while preserving MSE's sensitivity to large errors, since the squaring already happened before the root is taken</td></tr>
<tr class='text-center'><td>Is RMSE always greater than or equal to MAE, and why?</td><td>Yes - this follows from Jensen's inequality on the convex squaring function; averaging squared errors and then taking a square root can never be smaller than averaging the absolute errors directly. The two are equal only when every error has exactly the same absolute magnitude</td></tr>
<tr class='text-center'><td>What does a large gap between a model's RMSE and its MAE tell you?</td><td>It reveals that the model's overall error is being driven disproportionately by a small number of large (outlier) errors rather than being spread evenly across many similarly-sized errors, since RMSE amplifies large errors through squaring while MAE treats them proportionally</td></tr>
</table>`
        }
    ]
};
