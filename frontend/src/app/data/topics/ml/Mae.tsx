import { Topic } from '../../coreJava';

export const mae: Topic = {
    id: 'ml-regression-mae',
    name: 'MAE',
    beginner: [
        {
            content: `<h4>The Average of the Absolute Prediction Errors</h4>
<ul>
<li><strong>Mean Absolute Error (MAE)</strong> measures a regression model's typical error by taking the ABSOLUTE VALUE of each prediction error (ignoring whether it was too high or too low) and averaging those: <code>MAE = (1/n) &middot; &Sigma;|actual - predicted|</code>.</li>
<li>Unlike squaring, taking an absolute value treats an error of 10 and an error of 20 proportionally - the second is exactly twice as bad, not four times as bad - so MAE does not amplify large errors the way <strong>MSE</strong> does.</li>
<li>MAE stays in the SAME units as the target variable (e.g. minutes for a delivery-time model, dollars for a price model), which makes it immediately intuitive to report to anyone, technical or not.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import mean_absolute_error
import numpy as np

y_actual_minutes =    np.array([30, 45, 20, 60, 35])
y_predicted_minutes = np.array([35, 40, 25, 55, 50])

mae_value = mean_absolute_error(y_actual_minutes, y_predicted_minutes)
print(f"MAE: {mae_value:.1f} minutes")
# OUTPUT:
# MAE: 7.0 minutes`
            ],
            codeExplanations: [
                `This computes the Mean Absolute Error between five actual delivery times and five predicted delivery times using scikit-learn's mean_absolute_error(). It subtracts each prediction from the actual value, takes the absolute value of each of those five differences (turning any negative difference positive), and averages the results. The output, "7.0 minutes", is immediately meaningful on its own - it says the model's predictions are, on average, off by about 7 minutes, in the exact same units the delivery time itself is measured in.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>MAE answers "how far off is a typical prediction?" in plain, directly usable units, which makes it the metric of choice whenever a result needs to be communicated to someone who isn't going to reason about squared units.</li>
<li>Because it does not square errors, MAE is far more <strong>robust to outliers</strong> than MSE - a single wildly bad prediction shifts MAE only by its own (linear) size, rather than by its size SQUARED, so one unusual case cannot dominate the whole score the way it can with MSE.</li>
<li>This robustness is a deliberate tradeoff: MAE treats a huge miss and several small misses of the same total size as equally bad, whereas MSE would treat the huge miss as far worse - which metric is "right" depends entirely on whether the business genuinely considers a single large error more dangerous than the same amount of error spread across several predictions.</li>
</ul>
<h3>Real-World Example</h3>
A food-delivery company reports its ETA model's accuracy to restaurant-operations managers who have no data-science background.
<ul>
<li>Saying "the model's MSE is 340 minutes-squared" means nothing to a manager and cannot be sanity-checked against their own experience.</li>
<li>Saying "the model is off by about 12 minutes on average" (its <strong>MAE</strong>) is immediately understandable, comparable to what the manager already knows about how late deliveries tend to run, and directly actionable ("we need to shave a few minutes off that average before customers stop complaining").</li>
<li>This is why MAE, despite MSE's popularity in model TRAINING, is frequently the metric of choice for REPORTING regression performance to non-technical stakeholders.</li>
</ul>`,
            codeExamples: [
                `# Reporting model error to a non-technical audience: MAE (minutes) vs MSE (minutes-squared)
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

y_actual =    np.array([30, 45, 20, 60, 35, 50, 25, 40])
y_predicted = np.array([35, 40, 25, 55, 50, 48, 30, 41])

mae_value = mean_absolute_error(y_actual, y_predicted)
mse_value = mean_squared_error(y_actual, y_predicted)
print(f"MAE: {mae_value:.1f} minutes                <- directly reportable to a manager")
print(f"MSE: {mse_value:.1f} minutes-squared         <- not intuitively meaningful on its own")
# OUTPUT:
# MAE: 6.9 minutes                <- directly reportable to a manager
# MSE: 71.5 minutes-squared       <- not intuitively meaningful on its own`
            ],
            codeExplanations: [
                `The same set of actual versus predicted delivery times is scored with both mean_absolute_error() and mean_squared_error() to contrast how each communicates the same underlying performance. MAE comes back as "6.9 minutes" - a number a restaurant-operations manager can immediately relate to their own sense of how late deliveries typically run. MSE comes back as "71.5 minutes-squared" - mathematically valid and useful for comparing models internally, but meaningless as a standalone number to report externally, since nobody has an intuitive feel for what a "minute squared" represents.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Same units as the target</strong> - directly interpretable (e.g. "off by $8,000" or "off by 12 minutes"), unlike MSE's squared units.</li>
<li><strong>Robust to outliers</strong> - because errors are not squared, one unusually bad prediction contributes to MAE only proportionally to its size, so it can't single-handedly dominate the score the way it can with MSE.</li>
<li><strong>Every error is weighted equally per unit</strong> - useful when the actual business cost of being off by 20 really is about twice the cost of being off by 10, rather than four times as MSE would implicitly assume.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Not differentiable at zero</strong> - the absolute value function has a sharp corner where the error is exactly 0, so its derivative is undefined there. This makes MAE mathematically less convenient as a direct training objective for gradient-based optimizers than the perfectly smooth MSE, sometimes requiring specialized optimization techniques.</li>
<li><strong>Treats all error sizes proportionally, even when that's not appropriate</strong> - if a business genuinely considers one huge mistake far more costly than several small ones adding up to the same total, MAE will understate how bad the huge-mistake model really is, since it doesn't penalize large errors extra the way MSE does.</li>
<li><strong>Can mask a model that's occasionally very wrong</strong> - two models with the same MAE can have very different worst-case behavior; MAE alone doesn't reveal that risk the way MSE or RMSE naturally would.</li>
</ul>
<h3>Deeper Mechanics - Why the Non-Differentiability at Zero Matters</h3>
<ul>
<li>Gradient-based training algorithms rely on being able to compute a smooth derivative of the loss with respect to the model's parameters at every point; MSE's derivative is a smooth, continuous line through zero, while MAE's derivative jumps abruptly from -1 to +1 exactly at zero error, which is not defined at that single point.</li>
<li>In practice, this rarely stops MAE from being used - most implementations subgradient-based optimizers or simply treat the derivative at zero as 0 - but it does mean MAE-based training can converge less smoothly than MSE-based training, and it's part of why MSE remains the default loss for many algorithms even when MAE would better match the real business cost of an error.</li>
</ul>`,
            codeExamples: [
                `# Visualizing the shape of the MAE loss vs the MSE loss as the error grows
import numpy as np

errors = np.array([-10, -5, -1, 0, 1, 5, 10])
mae_loss_contribution = np.abs(errors)
mse_loss_contribution = errors ** 2

for e, mae_c, mse_c in zip(errors, mae_loss_contribution, mse_loss_contribution):
    print(f"error={e:>4}  |error| (MAE term)={mae_c:>4}  error^2 (MSE term)={mse_c:>4}")
# OUTPUT:
# error= -10  |error| (MAE term)=  10  error^2 (MSE term)= 100
# error=  -5  |error| (MAE term)=   5  error^2 (MSE term)=  25
# error=  -1  |error| (MAE term)=   1  error^2 (MSE term)=   1
# error=   0  |error| (MAE term)=   0  error^2 (MSE term)=   0   <- MAE's slope is undefined right at this point
# error=   1  |error| (MAE term)=   1  error^2 (MSE term)=   1
# error=   5  |error| (MAE term)=   5  error^2 (MSE term)=  25
# error=  10  |error| (MAE term)=  10  error^2 (MSE term)= 100`
            ],
            codeExplanations: [
                `This lays out, for a range of hypothetical prediction errors from -10 to +10, exactly what each error contributes to MAE (its absolute value) versus MSE (its square). For small errors like &plusmn;1, both contribute about the same amount, but for larger errors like &plusmn;10, the MSE term (100) is ten times larger than the MAE term (10) - concretely showing how MSE amplifies large errors while MAE scales with them linearly. The single error=0 row is the point where MAE's underlying |error| function has a sharp corner (its slope flips from -1 to +1), which is the exact source of the non-differentiability that makes MAE slightly less convenient than MSE for some gradient-based training algorithms.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is MAE generally more robust to outliers than MSE?</td><td>MAE uses the absolute value of each error, so a large error contributes proportionally to its size; MSE squares each error, so a large error contributes disproportionately more - meaning one bad outlier prediction can dominate MSE far more than it dominates MAE</td></tr>
<tr class='text-center'><td>Why is MAE often preferred when reporting model performance to non-technical stakeholders?</td><td>MAE stays in the same units as the target variable (e.g. minutes, dollars), so a value like "off by 12 minutes on average" is immediately interpretable, whereas MSE's squared units (e.g. minutes-squared) have no intuitive real-world meaning on their own</td></tr>
<tr class='text-center'><td>What is a mathematical downside of MAE compared to MSE for training a model?</td><td>MAE's absolute-value function is not differentiable at an error of exactly zero (its slope jumps from -1 to +1 there), whereas MSE is smooth and differentiable everywhere, which makes MSE more convenient as a direct optimization objective for gradient-based training algorithms</td></tr>
</table>`
        }
    ]
};
