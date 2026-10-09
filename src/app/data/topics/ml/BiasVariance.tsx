import { Topic } from '../../coreJava';

export const biasVariance: Topic = {
    id: 'ml-fundamentals-bias-variance',
    name: 'Bias & Variance',
    beginner: [
        {
            content: `<h4>Two Different Ways a Model Can Be Wrong</h4>
<ul>
<li><strong>Bias</strong> - error from a model being too simple to capture the real pattern (systematic, consistent mistakes). High bias means the model UNDERFITS.</li>
<li><strong>Variance</strong> - error from a model being too sensitive to the specific training data it saw (it changes a lot if retrained on a slightly different dataset). High variance means the model OVERFITS.</li>
<li>A high-bias model is too rigid; a high-variance model is too flexible. Good models sit at a balance point between the two.</li>
</ul>`,
            codeExamples: [
                `# Illustrating bias vs variance with polynomial regression of increasing degree
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
X = np.sort(rng.uniform(0, 1, 30)).reshape(-1, 1)
y = np.sin(2 * np.pi * X.ravel()) + rng.normal(0, 0.2, 30)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

for degree in [1, 4, 15]:
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(X_train, y_train)
    train_err = mean_squared_error(y_train, model.predict(X_train))
    test_err = mean_squared_error(y_test, model.predict(X_test))
    print(f"degree={degree:2d}  train_mse={train_err:.3f}  test_mse={test_err:.3f}")
# OUTPUT (typical):
# degree= 1  train_mse=0.450  test_mse=0.520   <- high bias (underfits, both errors high)
# degree= 4  train_mse=0.045  test_mse=0.060   <- good balance
# degree=15  train_mse=0.005  test_mse=0.310   <- high variance (overfits, test error jumps back up)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Bias-Variance Decomposition</h3>
For a model's expected squared error on unseen data, there is a formal decomposition:
<p><code>Expected Error = Bias&sup2; + Variance + Irreducible Noise</code></p>
<ul>
<li><strong>Bias&sup2;</strong> - how far off the model's average prediction is from the true value, across many retrainings.</li>
<li><strong>Variance</strong> - how much the model's predictions bounce around depending on which training sample it happened to see.</li>
<li><strong>Irreducible Noise</strong> - randomness inherent in the data itself, which NO model can remove, no matter how good.</li>
</ul>
Model complexity trades one against the other: increasing complexity (more polynomial degrees, deeper trees, more neural network layers) typically LOWERS bias but RAISES variance - this is the bias-variance TRADEOFF, and most of model selection and regularization is about finding the sweet spot on that curve.`,
            codeExamples: [
                `# Empirically estimating bias^2 and variance via repeated resampling (bootstrap)
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(1)
x_true = np.linspace(0, 1, 50).reshape(-1, 1)
true_fn = np.sin(2 * np.pi * x_true.ravel())

def sample_dataset():
    X = np.sort(rng.uniform(0, 1, 30)).reshape(-1, 1)
    y = np.sin(2 * np.pi * X.ravel()) + rng.normal(0, 0.2, 30)
    return X, y

for degree in [1, 15]:
    predictions = []
    for _ in range(200):  # simulate 200 different training sets
        X, y = sample_dataset()
        model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
        model.fit(X, y)
        predictions.append(model.predict(x_true))

    predictions = np.array(predictions)
    mean_pred = predictions.mean(axis=0)
    bias_sq = np.mean((mean_pred - true_fn) ** 2)
    variance = np.mean(predictions.var(axis=0))
    print(f"degree={degree:2d}  bias^2={bias_sq:.4f}  variance={variance:.4f}")
# OUTPUT (typical):
# degree= 1  bias^2=0.4100  variance=0.0020   <- rigid line, consistently wrong (high bias, low variance)
# degree=15  bias^2=0.0080  variance=0.3500   <- flexible curve, wildly different per dataset (low bias, high variance)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the bias-variance tradeoff?</td><td>Increasing model complexity typically reduces bias (the model fits the true pattern better) but increases variance (predictions become more sensitive to the specific training sample) - the best generalizing model sits at the point that minimizes their combined contribution to test error</td></tr>
<tr class='text-center'><td>Does more training data fix high bias or high variance?</td><td>Mainly high variance - a flexible model has more real signal to learn from and less room to memorize noise; it does very little for high bias, since an overly simple model stays too simple regardless of how much data it sees</td></tr>
<tr class='text-center'><td>How does regularization (L1/L2) affect the bias-variance tradeoff?</td><td>It intentionally increases bias slightly (by constraining how large the model's coefficients can grow) in exchange for a often much larger reduction in variance, usually lowering overall test error</td></tr>
</table>`
        }
    ]
};
