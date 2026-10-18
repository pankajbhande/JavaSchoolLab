import { Topic } from '../../coreJava';

export const underfittingVsOverfitting: Topic = {
    id: 'ml-fundamentals-underfitting-vs-overfitting',
    name: 'Underfitting vs Overfitting',
    beginner: [
        {
            content: `<h4>Overfitting vs Underfitting</h4>
<ul>
<li><strong>Overfitting</strong>: the model memorizes the training data (including its noise) and performs poorly on new data - too complex a model relative to the data.</li>
<li><strong>Underfitting</strong>: the model is too simple to capture the underlying pattern, performing poorly on BOTH training and test data.</li>
<li>The fix for overfitting: more training data, simpler models, regularization, or cross-validation to detect it early.</li>
<li>The fix for underfitting: a more expressive model, more/better features, or training longer/harder.</li>
</ul>`,
            codeExamples: [
                `from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Splitting data lets us measure performance on UNSEEN data, revealing overfitting
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = LogisticRegression().fit(X_train, y_train)
train_acc = accuracy_score(y_train, model.predict(X_train))
test_acc = accuracy_score(y_test, model.predict(X_test))

print(f"Train accuracy: {train_acc:.2f}, Test accuracy: {test_acc:.2f}")
# A big gap (high train, low test accuracy) is the classic sign of overfitting.`
            ],
            codeExplanations: [
                `Splitting the data BEFORE training is what makes overfitting detectable at all: the model only ever sees <code>X_train</code>/<code>y_train</code> during <code>.fit()</code>, so its accuracy on <code>X_test</code>/<code>y_test</code> reflects genuine generalization rather than memorization. Comparing <code>train_acc</code> to <code>test_acc</code> is the standard diagnostic - if training accuracy is high but test accuracy is much lower, the model has learned patterns specific to the training rows (including their noise) rather than the true underlying relationship, which is the textbook signature of overfitting.`
            ]
        },
        {
            content: `<h3>Why This Matters</h3>
A model is never actually judged by how well it does on the data it was trained on - it's judged by how well it performs on data it has NEVER SEEN, because that's the whole point of deploying it (predicting outcomes for future, unseen inputs). Both underfitting and overfitting break that goal, just in opposite ways:
<ul>
<li>An UNDERFIT model is so rigid it can't even fit the training data well, let alone generalize - like trying to describe a curved road with a single straight line. No amount of more data fixes this; the model itself is too simple to represent the true pattern.</li>
<li>An OVERFIT model looks perfect on paper (near 100% training accuracy) but has actually memorized the specific training examples, including their random noise - like a student who memorizes last year's exam answers verbatim instead of understanding the material, and then fails this year's exam because the questions changed slightly.</li>
<li>Without deliberately checking for both (via a held-out test set, or cross-validation), a team can ship a model that looks great in development metrics but performs badly in production - one of the most common and costly mistakes in applied ML.</li>
</ul>
<h3>Connection to Bias &amp; Variance</h3>
Underfitting and overfitting are the practical, everyday names for exactly the two failure modes formalized by the site's <strong>Bias &amp; Variance</strong> topic: underfitting IS high bias (the model is systematically too simple/rigid), and overfitting IS high variance (the model is too sensitive to the specific training sample it happened to see). The bias-variance tradeoff is the mathematical explanation for why fixing one of these two problems by increasing model complexity tends to make the other one worse.`,
            codeExamples: [
                `# Visualizing both failure modes at once: fitting polynomial degree 1 (underfit) vs degree 15 (overfit)
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
X = np.sort(rng.uniform(0, 1, 25)).reshape(-1, 1)
y_true = np.sin(2 * np.pi * X.ravel())
y = y_true + rng.normal(0, 0.15, 25)  # noisy sine wave - the "true" pattern is curved, not a straight line

for degree in [1, 15]:
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(X, y)
    fit_err = mean_squared_error(y, model.predict(X))
    # evaluate on a dense grid to see how wildly the curve behaves BETWEEN training points
    grid = np.linspace(0, 1, 200).reshape(-1, 1)
    preds = model.predict(grid)
    print(f"degree={degree:2d}  training MSE={fit_err:.4f}  prediction range on grid=[{preds.min():.2f}, {preds.max():.2f}]")
# OUTPUT (typical):
# degree= 1  training MSE=0.4820  prediction range on grid=[-0.35, 0.31]   <- underfits: flat line, can't
#            follow the curve at all, true values swing from -1 to 1
# degree=15  training MSE=0.0071  prediction range on grid=[-3.90, 4.10]   <- overfits: near-perfect fit
#            AT the training points, but wildly oscillates (way outside [-1,1]) between them`
            ],
            codeExplanations: [
                `A noisy sine curve is the underlying "true" pattern here - genuinely curved, not linear. Fitting a degree-1 polynomial (a straight line) produces high training error because a straight line simply cannot bend to follow a sine wave - that's underfitting made numeric: the model is too simple even for the TRAINING data, let alone new data. Fitting a degree-15 polynomial instead nearly zeroes out training error, but printing its prediction range on a dense grid reveals it swings wildly between -3.9 and 4.1, even though every true value lies between -1 and 1 - the extremely flexible curve has contorted itself to hit every noisy training point exactly, at the cost of wild, meaningless oscillations everywhere else. That gap between "fits training points perfectly" and "behaves sensibly everywhere else" is exactly what overfitting looks like laid out numerically, alongside underfitting's opposite failure in the very same experiment.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Real-World Example</h3>
A retailer building a model to predict next month's demand for a product, using only "day of the week" as a feature, would badly UNDERFIT - real demand depends on seasonality, promotions, price changes, and trends that a single weekday feature cannot represent, so the model performs poorly even on the training data it was built from. Now suppose the same team, worried about that, throws in hundreds of noisy, barely-relevant features (exact timestamp down to the second, arbitrary internal IDs, etc.) and trains a very deep, unconstrained model with no regularization - it will now fit the training sales data almost perfectly, including random day-to-day noise that has nothing to do with real demand patterns, and then perform badly on next month's actual sales because it "learned" noise specific to last year's data, not the real underlying demand signal. Both mistakes ship a model that fails in production, for opposite structural reasons - which is why real forecasting pipelines evaluate on a held-out, chronologically LATER period, not just a random split.
<h3>Advantages of Getting the Balance Right</h3>
<ul>
<li><strong>Reliable production performance</strong> - a well-fit model's test/validation accuracy is a trustworthy predictor of how it will behave on future real-world data, which is the entire justification for deploying an ML system in the first place.</li>
<li><strong>Efficient use of data and compute</strong> - a properly-sized model avoids wasting training time and parameters chasing noise (overfitting) or leaving real signal unused (underfitting).</li>
</ul>
<h3>Disadvantages / Limitations of the Diagnosis Itself</h3>
<ul>
<li><strong>A single train/test split can be misleading</strong> - a lucky or unlucky split can make a model look better or worse fit than it really is; k-fold cross-validation gives a more reliable read by averaging performance across multiple splits.</li>
<li><strong>The fixes for overfitting and underfitting often conflict</strong> - simplifying a model to fix overfitting risks introducing underfitting, and vice versa, so tuning is an iterative balancing act (this is literally the bias-variance tradeoff), not a one-shot fix.</li>
<li><strong>Regularization strength itself is a hyperparameter to tune</strong> - too much regularization pushes a well-fit model INTO underfitting; too little leaves overfitting unaddressed, so it must be tuned via cross-validation, not guessed.</li>
</ul>`,
            codeExamples: [
                `# Regularization strength (L2 / Ridge) as a dial between underfitting and overfitting
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np

rng = np.random.default_rng(1)
X = np.sort(rng.uniform(0, 1, 30)).reshape(-1, 1)
y = np.sin(2 * np.pi * X.ravel()) + rng.normal(0, 0.2, 30)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

for alpha in [0.0001, 0.01, 1, 100]:
    model = make_pipeline(PolynomialFeatures(12), Ridge(alpha=alpha))
    model.fit(X_train, y_train)
    train_mse = mean_squared_error(y_train, model.predict(X_train))
    test_mse = mean_squared_error(y_test, model.predict(X_test))
    print(f"alpha={alpha:8.4f}  train_mse={train_mse:.3f}  test_mse={test_mse:.3f}")
# OUTPUT (typical):
# alpha=  0.0001  train_mse=0.020  test_mse=0.310   <- almost no regularization: overfits
# alpha=  0.0100  train_mse=0.035  test_mse=0.095   <- balanced
# alpha=  1.0000  train_mse=0.140  test_mse=0.160   <- more regularized, slight underfit creeping in
# alpha=100.0000  train_mse=0.410  test_mse=0.440   <- too much regularization: underfits badly`
            ],
            codeExplanations: [
                `A high-degree (12) polynomial is fit with <code>Ridge</code> regression, whose <code>alpha</code> parameter controls how strongly large coefficients are penalized. Sweeping alpha from nearly 0 up to 100 shows the full spectrum in one experiment: tiny alpha lets the model overfit (very low train error, much higher test error), a middle alpha balances the two, and a very large alpha over-constrains the model until it can no longer fit even the training data well (both errors rise together) - underfitting again, but now caused by too much regularization rather than too few features. This is exactly why regularization strength itself must be tuned via cross-validation rather than picked arbitrarily.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you tell overfitting and underfitting apart from training/test metrics alone?</td><td>Underfitting shows poor performance on BOTH the training set and the test set, since the model is too simple to capture the pattern anywhere; overfitting shows strong training performance but a noticeably worse test performance, since the model has memorized training-specific noise rather than the true pattern</td></tr>
<tr class='text-center'><td>How does underfitting/overfitting relate to bias and variance?</td><td>Underfitting is the practical symptom of high bias (a model too rigid to represent the true pattern, making systematic errors everywhere); overfitting is the practical symptom of high variance (a model so flexible it fits the specific noise of its training sample, producing wildly different predictions if retrained on a different sample)</td></tr>
<tr class='text-center'><td>Why is a single random train/test split not always enough to detect overfitting reliably?</td><td>A lucky or unlucky split can make a model appear better or worse fit than it truly is purely by chance in which rows ended up in which set; k-fold cross-validation averages performance across several different splits, giving a much more stable and trustworthy estimate of whether a model generalizes</td></tr>
</table>`
        }
    ]
};
