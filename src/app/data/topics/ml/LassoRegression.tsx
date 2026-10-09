import { Topic } from '../../coreJava';

export const lassoRegression: Topic = {
    id: 'ml-regression-lasso-regression-l1',
    name: 'Lasso Regression - L1',
    beginner: [
        {
            content: `<h3>Lasso Regression (L1 Regularization)</h3>
<strong>Lasso Regression</strong> (Least Absolute Shrinkage and Selection Operator) adds a different penalty to the regression cost function than Ridge: the <strong>L1 penalty</strong>, the sum of the ABSOLUTE VALUES of the coefficients, scaled by a hyperparameter <code>&alpha;</code>.
<ul>
<li>New cost function: <code>MSE + &alpha; &times; &sum;|bi|</code>. Like Ridge, this discourages large coefficients - but the way it does so has a very different geometric effect.</li>
<li>Unlike Ridge, Lasso can shrink some coefficients all the way to <strong>exactly zero</strong>, effectively removing those features from the model entirely - a built-in mechanism for automatic feature selection.</li>
<li>In scikit-learn, this is the <code>Lasso</code> class, again with <code>alpha</code> as its main hyperparameter (higher <code>alpha</code> means more coefficients get zeroed out).</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.linear_model import Lasso

X = np.array([
    [1000, 2, 0.5],   # size, bedrooms, a nearly-irrelevant "lucky number" feature
    [1500, 3, 0.9],
    [2000, 3, 0.2],
    [2500, 4, 0.7],
    [3000, 4, 0.4],
], dtype=float)
y = np.array([200000, 300000, 380000, 480000, 520000], dtype=float)

lasso = Lasso(alpha=5000).fit(X, y)
print(f"Lasso coefficients (size, bedrooms, lucky_number): {lasso.coef_}")
# OUTPUT (typical):
# Lasso coefficients (size, bedrooms, lucky_number): [130.42 0.  0. ]
#                                                            ^^^^^^^^^^ irrelevant features zeroed out entirely`
            ],
            codeExplanations: [
                `A third, deliberately irrelevant "lucky number" feature is added alongside size and bedrooms. Fitting <code>Lasso</code> with a fairly strong <code>alpha=5000</code> produces a coefficient of exactly 0.0 for BOTH the bedroom count and the lucky-number feature, leaving only size with a nonzero coefficient - Lasso has decided, purely from the data and the penalty strength, that these features aren't worth keeping. This is the defining behavior that separates Lasso from Ridge: rather than merely shrinking every coefficient a little, it can eliminate some features from the model completely.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters: The Geometry of L1 vs L2</h3>
Ridge and Lasso both discourage large coefficients, but WHY only Lasso zeroes coefficients out entirely comes down to the shape of their penalty regions in coefficient space.
<ul>
<li>Ridge's L2 penalty region (the set of coefficient combinations with a given total penalty) is a smooth circle/sphere. Where this smooth region touches the elliptical contours of the error function is generically a point where ALL coefficients are nonzero.</li>
<li>Lasso's L1 penalty region is a diamond (in 2D) or a cross-polytope (in higher dimensions), with SHARP CORNERS positioned exactly on the coordinate axes (where one or more coefficients equal zero). The error contours are much more likely to first touch the penalty region precisely at one of these corners, which is what forces some coefficients to land at exactly zero rather than merely close to it.</li>
<li>This makes Lasso a genuine <strong>embedded feature selection</strong> method - the act of training the model simultaneously decides which features to discard, rather than requiring a separate feature-selection step beforehand.</li>
</ul>
<h3>Real-World Example</h3>
A dataset with 200 candidate features - many of them noisy, redundant, or simply irrelevant to the target - is fed into Lasso Regression. As part of ordinary training, Lasso automatically zeroes out the coefficients of roughly 180 of those features, leaving a compact, sparse model that uses only the ~20 features that genuinely matter.`,
            codeExamples: [
                `# Lasso performing automatic feature selection on 200 features, only a handful of which are real
import numpy as np
from sklearn.linear_model import Lasso

rng = np.random.default_rng(0)
n_samples, n_features = 300, 200
X = rng.normal(0, 1, (n_samples, n_features))

true_beta = np.zeros(n_features)
true_beta[:20] = rng.normal(0, 3, 20)     # only the first 20 features actually matter
y = X @ true_beta + rng.normal(0, 0.5, n_samples)

lasso = Lasso(alpha=0.5).fit(X, y)
n_nonzero = np.sum(lasso.coef_ != 0)
n_correctly_kept = np.sum(lasso.coef_[:20] != 0)
n_correctly_dropped = np.sum(lasso.coef_[20:] == 0)

print(f"Total nonzero coefficients kept: {n_nonzero} out of {n_features}")
print(f"Correctly kept among the 20 truly relevant features: {n_correctly_kept}/20")
print(f"Correctly zeroed among the 180 irrelevant features: {n_correctly_dropped}/180")
# OUTPUT (typical):
# Total nonzero coefficients kept: 23 out of 200
# Correctly kept among the 20 truly relevant features: 19/20
# Correctly zeroed among the 180 irrelevant features: 176/180`
            ],
            codeExplanations: [
                `Of 200 features, only the first 20 are constructed to have any real relationship with <code>y</code> - the remaining 180 are pure noise with a true coefficient of exactly zero. Fitting <code>Lasso</code> at <code>alpha=0.5</code> ends up keeping only about 23 nonzero coefficients out of 200, and the overlap analysis shows it correctly identifies nearly all of the 20 genuinely relevant features while correctly zeroing out the vast majority of the 180 irrelevant ones. No separate feature-selection step, statistical test, or manual review was involved - the sparsity emerged directly as a side effect of Lasso's ordinary training process, exactly the "feature selection built into training" behavior that makes Lasso valuable on wide, noisy datasets.`
            ]
        },
        {
            content: `<h3>When to Prefer Lasso vs Ridge</h3>
<ul>
<li><strong>Prefer Lasso</strong> when you suspect MANY of your features are irrelevant or redundant, and you want the model itself to identify and discard them - as in the 200-feature example above, where Lasso's sparsity directly reveals which features actually matter.</li>
<li><strong>Prefer Ridge</strong> when you believe most features carry at least some small-but-real signal (rather than being pure noise), especially under multicollinearity - Ridge's smooth shrinkage stabilizes such coefficients without discarding any of them, whereas Lasso can somewhat arbitrarily pick just ONE of several correlated-but-genuinely-relevant features to keep and zero out the rest.</li>
<li>When correlated features are all individually meaningful and you don't want Lasso's sometimes-arbitrary "pick one, drop the others" behavior among them, or when you want a middle ground between shrinkage and sparsity, <strong>Elastic Net</strong> (combining L1 and L2 penalties) is often a more robust default choice.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Built-in, automatic feature selection</strong> - as demonstrated, Lasso can reduce a wide feature set down to a compact, sparse model as an intrinsic part of training, with no separate feature-selection pipeline needed.</li>
<li><strong>Produces more interpretable models on wide datasets</strong> - a model that assigns exactly zero to 180 out of 200 features is far easier to explain and reason about than one that assigns tiny but nonzero weight to all 200.</li>
<li><strong>Reduces overfitting on high-dimensional data</strong> - by aggressively simplifying the model (fewer active features), Lasso often generalizes better than an unregularized model when the number of features is large relative to the number of samples.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Arbitrary selection among correlated features</strong> - when several features are highly correlated and all genuinely relevant, Lasso tends to pick one somewhat arbitrarily and zero out the others, which can discard useful signal and make the specific selected feature sensitive to noise in the training sample.</li>
<li><strong>Has no closed-form solution</strong> - because the L1 penalty is not differentiable at zero, Lasso must be fit with an iterative optimization algorithm (such as coordinate descent, which scikit-learn uses internally) rather than a single matrix computation like OLS or Ridge.</li>
<li><strong>Requires tuning alpha carefully</strong> - too small and Lasso barely differs from OLS (little to no sparsity); too large and it can zero out even genuinely important features, underfitting the data - again typically chosen via cross-validation.</li>
</ul>`,
            codeExamples: [
                `# Sweeping alpha to show increasingly aggressive feature elimination
import numpy as np
from sklearn.linear_model import Lasso

rng = np.random.default_rng(0)
n, n_features = 150, 10
X = rng.normal(0, 1, (n, n_features))
true_beta = np.array([4.0, -3.0, 2.5, 0.1, 0.05, 0, 0, 0, 0, 0])  # only first 3 matter much
y = X @ true_beta + rng.normal(0, 0.3, n)

for alpha in [0.01, 0.1, 0.5, 1.0]:
    model = Lasso(alpha=alpha).fit(X, y)
    n_nonzero = np.sum(model.coef_ != 0)
    print(f"alpha={alpha:4.2f}  nonzero_features={n_nonzero:2d}  coefs={np.round(model.coef_, 2)}")
# OUTPUT (typical):
# alpha=0.01  nonzero_features=10  coefs=[ 3.98 -2.97  2.48  0.09  0.03 -0.01  0.02  0.   -0.01  0.  ]
# alpha=0.10  nonzero_features= 5  coefs=[ 3.9  -2.89  2.4   0.02  0.    0.    0.    0.    0.    0.  ]
# alpha=0.50  nonzero_features= 3  coefs=[ 3.53 -2.51  2.03  0.    0.    0.    0.    0.    0.    0.  ]
# alpha=1.00  nonzero_features= 3  coefs=[ 3.03 -2.02  1.53  0.    0.    0.    0.    0.    0.    0.  ]   <- exactly
#                                                                                the 3 truly important features`
            ],
            codeExplanations: [
                `Only the first three of ten features have a substantial true effect on <code>y</code>; the rest are either near-zero or exactly zero in truth. As <code>alpha</code> increases from 0.01 to 1.0, the number of nonzero coefficients Lasso keeps shrinks from all 10 down to exactly 3 - and those 3 are precisely the genuinely important features. This progression makes visible exactly how the alpha hyperparameter controls sparsity: small alpha barely regularizes at all (nearly every feature stays, however faintly), while large alpha aggressively prunes down to only the features whose real effect on the target is strong enough to outweigh the penalty for keeping them nonzero.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What penalty does Lasso Regression add to the cost function, and how does it differ from Ridge's penalty?</td><td>Lasso adds an L1 penalty, alpha times the sum of the ABSOLUTE VALUES of the coefficients, whereas Ridge adds an L2 penalty based on the sum of SQUARED coefficients; both discourage large coefficients, but only Lasso's L1 penalty can drive some coefficients to exactly zero</td></tr>
<tr class='text-center'><td>Why does Lasso's L1 penalty tend to produce exactly-zero coefficients while Ridge's L2 penalty does not?</td><td>Geometrically, the L1 penalty region in coefficient space is a diamond/cross-polytope with sharp corners lying exactly on the coordinate axes (where one or more coefficients are zero); the smooth error contours are much more likely to first touch this region at one of those corners, forcing some coefficients to exactly zero, whereas the L2 penalty's smooth circular/spherical region generically touches the error contours at a point where all coefficients remain nonzero</td></tr>
<tr class='text-center'><td>When would you choose Lasso over Ridge, and when would you choose Ridge over Lasso?</td><td>Choose Lasso when you suspect many of your features are irrelevant or redundant and want the model to automatically perform feature selection during training; choose Ridge when you believe most features carry at least some small-but-real signal, especially under multicollinearity, since Ridge stabilizes correlated coefficients without arbitrarily discarding some of them the way Lasso can</td></tr>
</table>`
        }
    ]
};
