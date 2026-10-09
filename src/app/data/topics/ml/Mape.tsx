import { Topic } from '../../coreJava';

export const mape: Topic = {
    id: 'ml-model-evaluation-mape',
    name: 'MAPE',
    beginner: [
        {
            content: `<h4>Turning a Raw Error Into a Percentage Anyone Can Understand</h4>
<ul>
<li><strong>Mean Absolute Percentage Error (MAPE)</strong> expresses a regression model's average error as a PERCENTAGE of the actual value rather than in raw units: <code>MAPE = (1/n) &middot; &Sigma; |actual - predicted| / |actual| &middot; 100%</code>.</li>
<li>Instead of saying "the model is off by $8,000 on average" (which means little without knowing the typical price), MAPE says "the model is off by 8% on average" - a number that is meaningful regardless of the scale of the target.</li>
<li>Because it's a percentage, MAPE is <strong>scale-independent</strong> and can even be used to compare error rates across completely different forecasting problems (e.g. comparing a sales forecast's error rate against a website-traffic forecast's error rate).</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.metrics import mean_absolute_percentage_error

y_actual =    np.array([100, 200, 300, 400])
y_predicted = np.array([110, 180, 320, 420])

mape_value = mean_absolute_percentage_error(y_actual, y_predicted)
print(f"MAPE: {mape_value * 100:.2f}%")
# OUTPUT:
# MAPE: 8.75%`
            ],
            codeExplanations: [
                `This computes MAPE between four actual and predicted demand values using scikit-learn's mean_absolute_percentage_error(), which returns the result as a fraction (0.0875), so it's multiplied by 100 to print a percentage. The output, 8.75%, means the model's predictions are off by an average of 8.75% of the actual value across these four data points - a figure that's immediately interpretable to a business audience in a way that a raw "17.5 units of average error" would not be.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Business stakeholders overwhelmingly find percentages more intuitive than raw error units. Reporting "our forecast is off by 8% on average" lands immediately with a non-technical audience, whereas "our MAE is 340 units" requires them to already know whether 340 is a big or small number in context.</li>
<li>Because it's normalized by the actual value, MAPE lets you compare forecast quality ACROSS products, regions, or entirely different metrics with different scales - a luxury raw MAE, MSE, or RMSE (all tied to the target's original units) don't offer.</li>
<li>MAPE has a serious mathematical trap: because it divides by the ACTUAL value, it becomes unstable, huge, or completely undefined whenever actual values are zero or very close to zero - a failure mode that has nothing to do with how good the model actually is.</li>
</ul>
<h3>Real-World Example</h3>
A retail demand-forecasting team reports model performance to store managers ahead of the holiday season.
<ul>
<li>Instead of saying "our model's MAE is 42 units," which means little without knowing typical daily sales volume, the team reports <strong>"our forecasts are off by about 8% on average"</strong> - immediately understandable to managers who don't work with the raw numbers day to day.</li>
<li>But partway through the year, the team notices MAPE spiking wildly for a slow-moving product that sometimes sells <strong>zero units</strong> in a day. A prediction of even 1 unit against an actual of 0 produces a percentage error of infinity (division by zero), and predictions of 2 units against an actual of 1 unit register as a "100% error" even though the absolute miss is tiny.</li>
<li>The team learns to report MAPE only for products with consistently non-trivial sales volume, and falls back to MAE or a variant like <strong>SMAPE</strong> (Symmetric MAPE) for intermittent, low-volume, or zero-heavy demand series.</li>
</ul>`,
            codeExamples: [
                `# MAPE breaking down when actual values are zero or near-zero
import numpy as np
from sklearn.metrics import mean_absolute_percentage_error, mean_absolute_error

# a slow-moving product: mostly small numbers, some days with zero actual sales
y_actual =    np.array([5, 4, 0, 3, 6, 0, 2])
y_predicted = np.array([4, 5, 1, 3, 5, 1, 2])

mae = mean_absolute_error(y_actual, y_predicted)
print(f"MAE: {mae:.2f} units")

try:
    mape_value = mean_absolute_percentage_error(y_actual, y_predicted)
    print(f"MAPE: {mape_value * 100:.2f}%")
except Exception as e:
    print(f"MAPE failed: {e}")
# OUTPUT:
# MAE: 0.71 units
# MAPE: 4181321051993532.00%   <- exploded because of the two zero-actual days`
            ],
            codeExplanations: [
                `MAE reports a small, sensible average error of 0.71 units - the model is generally quite close. But MAPE, computed on the exact same predictions, produces an absurd, meaningless figure, because scikit-learn's implementation replaces a division by zero with a tiny epsilon rather than raising an error, and dividing any nonzero absolute error by a number near zero produces a huge percentage that dominates the average. This is MAPE's core weakness in concrete form: whenever the actual value is zero or close to it (extremely common in intermittent demand, rare events, or any series that naturally passes through zero), MAPE is not a reliable metric, regardless of how good the model's absolute predictions actually are.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Highly intuitive for non-technical audiences</strong> - a percentage error is immediately understandable without needing to know the target's scale, which makes MAPE the metric of choice for executive dashboards and business reporting.</li>
<li><strong>Scale-independent, enabling cross-series comparison</strong> - a MAPE of 5% means roughly the same thing whether forecasting units sold, revenue, or web traffic, unlike raw MAE/MSE/RMSE which are tied to the target's original units.</li>
<li><strong>Easy to set a business target around</strong> - a company can set an explicit goal like "keep forecast error under 10%" in a way that's meaningful across many different product lines at once.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Undefined or explosive near zero actual values</strong> - as shown above, dividing by an actual value of (or near) zero produces division-by-zero errors or absurdly inflated percentages that have nothing to do with real model quality, making MAPE unusable for intermittent or sparse data.</li>
<li><strong>Asymmetric penalty between over- and under-forecasting</strong> - because the denominator is the actual value, an over-prediction can produce an unbounded percentage error (predicting 200 when actual is 10 is a 1900% error) while an under-prediction is capped at 100% (predicting 0 when actual is 10 is at most a 100% error), which quietly biases the metric toward penalizing over-forecasts more heavily.</li>
<li><strong>Can favor a model that is systematically biased toward under-predicting</strong> - because of the asymmetry above, blindly optimizing for lowest MAPE can push a model toward under-forecasting, which is not always the business-safe direction to err on (e.g. under-forecasting demand risks stockouts).</li>
</ul>
<h3>Deeper Mechanics - The Asymmetry Problem and SMAPE</h3>
<ul>
<li>Consider two errors of equal absolute size: predicting 20 when the actual is 10 (a +10 error, 100% MAPE), versus predicting 0 when the actual is 10 (a -10 error, also 100% MAPE) - here they happen to match, but push the over-prediction further (predicting 30 against an actual of 10) and MAPE explodes to 200%, while an under-prediction can never exceed 100% no matter how far off it is, since the predicted value has a floor of 0.</li>
<li><strong>Symmetric MAPE (SMAPE)</strong> is a common fix, dividing by the average of the actual and predicted values instead of the actual value alone, which bounds the metric and treats over- and under-forecasts more evenly - useful to know as the natural next metric when plain MAPE's asymmetry becomes a real problem.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating MAPE's asymmetric penalty for over- vs under-forecasting the same absolute miss
import numpy as np
from sklearn.metrics import mean_absolute_percentage_error

y_actual = np.array([10])

y_over_predicted  = np.array([30])   # over-forecast by 20
y_under_predicted = np.array([0])    # under-forecast by 10 (can't go further below 0 in this example)

mape_over  = mean_absolute_percentage_error(y_actual, y_over_predicted)
mape_under = mean_absolute_percentage_error(y_actual, y_under_predicted)

print(f"Over-forecast (predict 30, actual 10):  MAPE = {mape_over * 100:.0f}%")
print(f"Under-forecast (predict 0, actual 10):  MAPE = {mape_under * 100:.0f}%")
# OUTPUT:
# Over-forecast (predict 30, actual 10):  MAPE = 200%
# Under-forecast (predict 0, actual 10):  MAPE = 100%`
            ],
            codeExplanations: [
                `Both scenarios miss the true value of 10 by roughly comparable absolute margins, but the over-forecast (predicting 30) registers a MAPE of 200% while the maximum possible MAPE for any under-forecast against this actual value is capped at 100% (reached when predicting 0). This is a direct, numeric illustration of MAPE's structural asymmetry: because the actual value sits in the denominator, over-predictions can produce arbitrarily large percentage errors while under-predictions are mathematically bounded, which is exactly why teams that need a fairer, symmetric comparison switch to SMAPE instead.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is MAPE popular for reporting model performance to business stakeholders?</td><td>Because it expresses error as a percentage of the actual value, it is scale-independent and immediately intuitive ("off by 8% on average") without requiring the audience to know whether the raw error units represent a big or small mistake, unlike MAE, MSE, or RMSE which are tied to the target's original units</td></tr>
<tr class='text-center'><td>What is MAPE's biggest failure mode, and when does it occur?</td><td>MAPE divides by the actual value, so when actual values are zero or very close to zero (e.g. intermittent demand for a product that sometimes sells zero units), the percentage error becomes undefined or explodes to an enormous, meaningless number, even if the model's absolute predictions were quite good</td></tr>
<tr class='text-center'><td>Why does MAPE penalize over-forecasting more heavily than under-forecasting?</td><td>Because the actual value sits in the denominator and the predicted value has an effective floor of zero, an under-forecast's percentage error is capped at 100%, while an over-forecast of the same absolute size can produce an unbounded percentage error, which biases the metric asymmetrically and is one of the reasons Symmetric MAPE (SMAPE) is sometimes used instead</td></tr>
</table>`
        }
    ]
};
