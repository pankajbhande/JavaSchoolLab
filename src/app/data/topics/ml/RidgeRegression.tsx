import { Topic } from '../../coreJava';

export const ridgeRegression: Topic = {
    id: 'ml-regression-ridge-regression-l2',
    name: 'Ridge Regression - L2',
    beginner: [
        {
            content: `<h3>Ridge Regression (L2 Regularization)</h3>
<strong>Ridge Regression</strong> is ordinary linear regression with one addition to its cost function: an <strong>L2 penalty</strong> equal to the sum of the SQUARED coefficients, scaled by a hyperparameter <code>&alpha;</code> (also called <code>&lambda;</code>).
<ul>
<li>New cost function: <code>MSE + &alpha; &times; &sum;(bi&sup2;)</code>. Minimizing this no longer just chases the lowest possible error - it simultaneously discourages coefficients from growing large.</li>
<li>The result is coefficients that are <strong>shrunk toward zero</strong> compared to plain OLS, without being forced all the way to exactly zero - every original feature stays in the model, just with a dampened influence.</li>
<li>In scikit-learn, this is the <code>Ridge</code> class, with <code>alpha</code> as its main hyperparameter (higher <code>alpha</code> means stronger shrinkage).</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

X = np.array([
    [1000, 2],
    [1500, 3],
    [2000, 3],
    [2500, 4],
    [3000, 4],
], dtype=float)
y = np.array([200000, 300000, 380000, 480000, 520000], dtype=float)

plain = LinearRegression().fit(X, y)
ridge = Ridge(alpha=1000).fit(X, y)

print(f"Plain OLS coefficients:  {plain.coef_}")
print(f"Ridge (alpha=1000) coefficients: {ridge.coef_}")
# OUTPUT (typical):
# Plain OLS coefficients:  [ 141.18 21470.59]
# Ridge (alpha=1000) coefficients: [ 138.92 20015.47]   <- both shrunk toward zero, neither eliminated`
            ],
            codeExplanations: [
                `The exact same data is fit twice: once with plain <code>LinearRegression</code> (OLS) and once with <code>Ridge</code> at <code>alpha=1000</code>. Both coefficients under Ridge come out slightly smaller in magnitude than their OLS counterparts - the L2 penalty has pulled them toward zero - but neither one is eliminated or driven to exactly zero; both features remain meaningfully present in the model. This is Ridge's defining behavior: it dampens the size of every coefficient somewhat, in exchange for a model that is less sensitive to noise in the training data.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Plain OLS coefficients can become extremely large and unstable specifically when features are highly correlated with each other (multicollinearity) or when there are many features relative to the amount of training data - in both cases, OLS can "explain" the training data very well by assigning huge, offsetting coefficients that don't actually generalize.
<ul>
<li>The L2 penalty directly counteracts this: since the penalty term grows with the SQUARE of each coefficient, letting any one coefficient balloon in size becomes very costly to the overall cost function, so the optimizer settles on smaller, more conservative coefficients instead.</li>
<li>The hyperparameter <code>&alpha;</code> (or <code>&lambda;</code>) controls exactly how strong this effect is: <code>&alpha;=0</code> recovers plain OLS exactly (no shrinkage at all), while increasing <code>&alpha;</code> shrinks coefficients progressively more aggressively toward zero - it is typically chosen via cross-validation rather than a fixed guess.</li>
<li>This shrinkage intentionally trades a small increase in bias for a (usually much larger) reduction in variance, which is the same bias-variance tradeoff logic behind every regularization technique - the goal is lower error on genuinely NEW data, not the lowest possible error on the training data.</li>
</ul>
<h3>Real-World Example</h3>
A regression model built on many correlated economic indicators (e.g. several overlapping measures of regional income) produces wild, unstable OLS coefficients that swing dramatically with small changes to the training sample; fitting Ridge Regression on the same data instead settles on much more stable, moderate coefficients that generalize far more reliably.`,
            codeExamples: [
                `# Ridge stabilizing coefficients under multicollinearity, compared to unstable plain OLS
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

rng = np.random.default_rng(0)
n = 100
base = rng.uniform(0, 10, n)
feature_a = base + rng.normal(0, 0.05, n)   # two nearly-identical, highly correlated features
feature_b = base + rng.normal(0, 0.05, n)
y = 5 * base + rng.normal(0, 1, n)

for seed in [1, 2]:
    idx = np.random.default_rng(seed).choice(n, size=80, replace=False)
    X = np.column_stack([feature_a[idx], feature_b[idx]])
    ols = LinearRegression().fit(X, y[idx])
    ridge = Ridge(alpha=10).fit(X, y[idx])
    print(f"seed={seed}  OLS coefs={ols.coef_}   Ridge coefs={ridge.coef_}")
# OUTPUT (typical):
# seed=1  OLS coefs=[ 8.92 -3.71]   Ridge coefs=[2.61 2.58]
# seed=2  OLS coefs=[-2.15  7.20]   Ridge coefs=[2.55 2.64]   <- Ridge stays nearly identical across samples;
#                                                                 OLS swings wildly and even flips sign`
            ],
            codeExplanations: [
                `<code>feature_a</code> and <code>feature_b</code> are constructed to be nearly identical (both are the same underlying <code>base</code> value plus tiny noise), simulating severe multicollinearity. Fitting plain OLS on two different random subsets of this data produces wildly different, even sign-flipping, coefficient splits between the two features each time, exactly the instability multicollinearity causes. Fitting <code>Ridge</code> with <code>alpha=10</code> on the SAME two subsets instead produces nearly identical, moderate coefficients both times - the L2 penalty discourages the optimizer from assigning one feature a huge positive coefficient and the other a huge negative one just to marginally reduce training error, instead settling on a stable, evenly-split, shrunk solution that is far less sensitive to which particular sample of data it happened to see.`
            ]
        },
        {
            content: `<h3>Ridge vs Lasso: Why Ridge Keeps Every Feature</h3>
Ridge's L2 penalty shrinks coefficients smoothly toward zero but essentially never sets one to EXACTLY zero (except in coincidental edge cases) - geometrically, the penalty's circular/spherical contour in coefficient space meets the error contours at a point where all coefficients are typically nonzero.
<ul>
<li>This means Ridge is appropriate when you believe MOST or ALL of your features carry at least some genuine signal, just with the risk of overfitting or instability from their scale or correlation - Ridge tames that instability without discarding any feature entirely.</li>
<li>By contrast, Lasso Regression's L1 penalty (sum of ABSOLUTE coefficients, not squared) has sharp corners in its geometry that make landing exactly on zero for some coefficients common - which is why Lasso, not Ridge, is the tool of choice when you specifically want automatic feature SELECTION.</li>
<li>A blend of both, <strong>Elastic Net</strong>, combines the L1 and L2 penalties to get some of each behavior - moderate shrinkage plus some sparsity - when neither pure Ridge nor pure Lasso is clearly the better fit.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Stabilizes coefficients under multicollinearity</strong> - as demonstrated, correlated features that would otherwise produce wildly unstable OLS coefficients settle into stable, moderate values under Ridge.</li>
<li><strong>Reduces overfitting/variance</strong> - by discouraging any coefficient from growing very large, Ridge produces models that generalize better to new data, especially with many features relative to the amount of training data.</li>
<li><strong>Still has a closed-form solution</strong> - Ridge's normal equation is a simple modification of OLS's (<code>(X<sup>T</sup>X + &alpha;I)<sup>-1</sup>X<sup>T</sup>y</code>), and the added <code>&alpha;I</code> term actually makes the matrix inversion numerically MORE stable than plain OLS, not less.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Never performs feature selection</strong> - every feature stays in the model with some nonzero coefficient, however tiny, which can leave the model harder to interpret when many features are truly irrelevant.</li>
<li><strong>Requires tuning the alpha hyperparameter</strong> - too small and Ridge barely differs from plain OLS; too large and it can UNDER-fit by shrinking genuinely important coefficients too aggressively - this is typically chosen via cross-validation, adding an extra step to the modeling process.</li>
<li><strong>Coefficients lose some of OLS's direct interpretability</strong> - because they are deliberately biased toward zero rather than being the unconstrained best fit, a Ridge coefficient's magnitude reflects both the true effect AND the strength of the regularization applied, muddying its plain-English reading somewhat.</li>
</ul>`,
            codeExamples: [
                `# Sweeping alpha to show progressively stronger shrinkage, none of the coefficients reaching zero
import numpy as np
from sklearn.linear_model import Ridge

rng = np.random.default_rng(0)
n, n_features = 100, 5
X = rng.normal(0, 1, (n, n_features))
true_beta = np.array([5.0, -3.0, 0.2, 1.5, -0.1])
y = X @ true_beta + rng.normal(0, 0.5, n)

for alpha in [0, 1, 10, 100, 1000]:
    model = Ridge(alpha=alpha).fit(X, y)
    print(f"alpha={alpha:5d}  coefs={np.round(model.coef_, 3)}")
# OUTPUT (typical):
# alpha=    0  coefs=[ 4.98 -2.99  0.24  1.52 -0.08]
# alpha=    1  coefs=[ 4.87 -2.93  0.24  1.49 -0.08]
# alpha=   10  coefs=[ 4.20 -2.55  0.22  1.30 -0.07]
# alpha=  100  coefs=[ 2.19 -1.36  0.14  0.70 -0.04]
# alpha= 1000  coefs=[ 0.51 -0.32  0.03  0.16 -0.01]   <- all shrinking toward zero together, none exactly zero`
            ],
            codeExplanations: [
                `As <code>alpha</code> is increased from 0 (equivalent to plain OLS) up to 1000, every coefficient shrinks progressively closer to zero, including the ones with genuinely large true effects (5.0 and -3.0) and the ones with tiny true effects (0.2 and -0.1) - they all shrink together, proportionally, rather than the small ones being singled out and eliminated. Even at the strongest shrinkage level shown, alpha=1000, none of the five coefficients reaches exactly zero - they merely get very small - which is the direct, hands-on illustration of why Ridge is described as a shrinkage method rather than a feature-selection method: it dampens influence, but it does not delete features.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Ridge Regression add to the ordinary linear regression cost function, and what effect does it have?</td><td>It adds an L2 penalty term equal to alpha times the sum of the squared coefficients; minimizing the combined cost function discourages coefficients from growing large, shrinking them toward (but not to) zero, which stabilizes the model and reduces overfitting, especially under multicollinearity</td></tr>
<tr class='text-center'><td>Why does Ridge Regression shrink coefficients toward zero but rarely set any coefficient to exactly zero?</td><td>The L2 penalty is based on squared coefficient values, whose geometric contour in coefficient space is smooth (circular/spherical) rather than having sharp corners; the point where this smooth penalty region meets the error contours generically has all coefficients nonzero, unlike Lasso's L1 penalty, whose sharp-cornered geometry commonly drives some coefficients exactly to zero</td></tr>
<tr class='text-center'><td>What does the alpha (or lambda) hyperparameter control in Ridge Regression, and how would you choose its value?</td><td>It controls the strength of the L2 penalty - alpha=0 recovers plain OLS exactly, and increasing alpha shrinks coefficients progressively more aggressively toward zero, trading a small increase in bias for a reduction in variance; it is typically chosen via cross-validation, picking the value that minimizes error on held-out data rather than training data</td></tr>
</table>`
        }
    ]
};
