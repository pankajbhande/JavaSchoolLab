import { Topic } from '../../coreJava';

export const elasticNet: Topic = {
    id: 'ml-regression-elastic-net',
    name: 'Elastic Net',
    beginner: [
        {
            content: `<h3>Splitting the Difference Between Ridge and Lasso</h3>
<strong>Elastic Net</strong> is a linear regression model that combines BOTH regularization penalties you might already know separately - Ridge's <strong>L2 penalty</strong> (shrinks coefficients toward zero, keeps correlated features together) and Lasso's <strong>L1 penalty</strong> (can shrink coefficients all the way to exactly zero, performing automatic feature selection).
<ul>
<li>A mixing parameter called <code>l1_ratio</code> (between 0 and 1) controls the blend: <code>l1_ratio=1</code> is pure Lasso, <code>l1_ratio=0</code> is pure Ridge, and anything in between is a genuine combination of both effects.</li>
<li>A second parameter, <code>alpha</code>, controls the overall STRENGTH of the combined penalty, just like it does in Ridge and Lasso individually.</li>
<li>Elastic Net exists because Ridge and Lasso each have a specific weakness - Ridge never zeroes out useless features, while Lasso behaves erratically when features are highly correlated with each other (picking one at random from a correlated group and zeroing the rest) - and Elastic Net's blend fixes both at once.</li>
</ul>`,
            codeExamples: [
                `from sklearn.linear_model import ElasticNet, Ridge, Lasso
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

X, y = make_regression(n_samples=200, n_features=10, n_informative=5, noise=15, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

ridge = Ridge(alpha=1.0).fit(X_train, y_train)
lasso = Lasso(alpha=1.0).fit(X_train, y_train)
elastic = ElasticNet(alpha=1.0, l1_ratio=0.5).fit(X_train, y_train)

for name, model in [("Ridge", ridge), ("Lasso", lasso), ("Elastic Net", elastic)]:
    mse = mean_squared_error(y_test, model.predict(X_test))
    zero_coefs = sum(1 for c in model.coef_ if abs(c) < 1e-6)
    print(f"{name:12s} test MSE={mse:8.2f}  zeroed-out coefficients={zero_coefs}")
# OUTPUT (typical):
# Ridge        test MSE=  245.10  zeroed-out coefficients=0
# Lasso        test MSE=  268.40  zeroed-out coefficients=3
# Elastic Net  test MSE=  251.80  zeroed-out coefficients=2`
            ],
            codeExplanations: [
                `A synthetic regression dataset with 10 features, only 5 of which are actually informative, is split into train/test sets. Ridge, Lasso, and ElasticNet (with <code>l1_ratio=0.5</code>, an even blend) are each fit on the same training data. Printing test MSE alongside how many coefficients each model drove to exactly zero shows the tradeoff concretely: Ridge keeps every feature (zero coefficients dropped) since its L2 penalty only shrinks, Lasso aggressively zeroes out several coefficients via its L1 penalty, and Elastic Net lands in between - some feature selection happens, but less aggressively and less erratically than pure Lasso, which is exactly the middle-ground behavior <code>l1_ratio</code> is designed to produce.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before Elastic Net, practitioners regularizing a linear model had to commit to one of two penalties, each with a real cost. Ridge (L2) shrinks all coefficients smoothly toward zero but essentially never sets any of them to EXACTLY zero, so it never simplifies the model or tells you which features are truly irrelevant. Lasso (L1) can zero out coefficients entirely, which is great for feature selection - but when several features are highly CORRELATED with each other (measuring almost the same underlying thing), Lasso tends to arbitrarily pick just one of them to keep and zero out the rest, and which one it picks can change unpredictably with small changes in the data.
<ul>
<li>Elastic Net's combined L1 + L2 penalty inherits Lasso's ability to zero out genuinely useless features while inheriting Ridge's tendency to keep CORRELATED useful features together instead of arbitrarily discarding all but one.</li>
<li>This matters most whenever your feature set has groups of correlated variables - which is extremely common in real data (multiple sensors measuring similar things, multiple financial ratios derived from the same underlying numbers, or genes that tend to be expressed together).</li>
</ul>
<h3>Real-World Example</h3>
A genomics research team is building a model to predict a disease outcome from a patient's gene expression profile, where the dataset has THOUSANDS of gene features, many of which are highly correlated because genes in the same biological pathway tend to switch on and off together. Using pure Lasso here is dangerous: for each correlated GROUP of pathway genes, Lasso will typically keep just one arbitrary gene from the group and zero out the rest, even though biologically the whole group is relevant - and a different random train/test split could cause Lasso to keep a completely DIFFERENT gene from the same group, making the "important genes" list unstable and scientifically misleading. Elastic Net's Ridge component encourages correlated genes in the same pathway to receive similar, non-zero coefficients together, while its Lasso component still zeroes out entire pathways that truly have no relationship to the outcome - giving researchers a stable, biologically coherent set of relevant genes instead of an arbitrary single representative per pathway.`,
            codeExamples: [
                `# Simulating genomics-style correlated feature groups: Lasso's instability vs Elastic Net's grouping
import numpy as np
from sklearn.linear_model import Lasso, ElasticNet

rng = np.random.default_rng(0)
n_samples = 150

# Simulate a "pathway": 4 genes that are almost identical (highly correlated) and truly relevant
pathway_signal = rng.normal(0, 1, n_samples)
gene_group = np.column_stack([pathway_signal + rng.normal(0, 0.05, n_samples) for _ in range(4)])
# 6 unrelated, irrelevant genes (pure noise)
noise_genes = rng.normal(0, 1, (n_samples, 6))
X = np.column_stack([gene_group, noise_genes])
y = 5 * pathway_signal + rng.normal(0, 1, n_samples)  # outcome truly depends on the whole pathway

lasso = Lasso(alpha=0.5).fit(X, y)
elastic = ElasticNet(alpha=0.5, l1_ratio=0.5).fit(X, y)

print("Lasso coefficients on the 4 correlated pathway genes:      ", np.round(lasso.coef_[:4], 2))
print("Elastic Net coefficients on the 4 correlated pathway genes:", np.round(elastic.coef_[:4], 2))
# OUTPUT (typical):
# Lasso coefficients on the 4 correlated pathway genes:       [4.6  0.   0.   0. ]   <- arbitrarily kept only 1
# Elastic Net coefficients on the 4 correlated pathway genes: [1.2  1.1  1.3  1.2]   <- kept the whole group`
            ],
            codeExplanations: [
                `This builds a synthetic stand-in for the genomics scenario: 4 "pathway genes" that are nearly identical to each other (highly correlated) and genuinely drive the outcome, plus 6 unrelated noise genes. Lasso and Elastic Net are both fit on this data with comparable overall regularization strength. Printing each model's coefficients on just the 4 correlated pathway genes shows the exact failure mode described above: Lasso assigns almost all the weight to a single arbitrarily-chosen gene from the group and zeroes out the other three identical signals, while Elastic Net spreads the weight roughly evenly across all four - correctly reflecting that the whole correlated group matters, not just one arbitrary member of it.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Handles correlated features far better than Lasso alone</strong> - as shown above, its Ridge component keeps correlated groups together instead of arbitrarily discarding all but one member, which is critical whenever features aren't cleanly independent.</li>
<li><strong>Still performs automatic feature selection</strong> - unlike pure Ridge, it can drive genuinely irrelevant coefficients all the way to zero, producing a simpler, more interpretable model than Ridge would.</li>
<li><strong>A safe default when you're unsure whether Ridge or Lasso is the better fit</strong> - rather than having to guess or run both separately, tuning <code>l1_ratio</code> (alongside <code>alpha</code>) via cross-validation lets the data itself decide how much of each penalty is appropriate, with <code>l1_ratio</code> values of 0 or 1 recovering pure Ridge or pure Lasso as special cases anyway.</li>
<li><strong>More stable coefficient estimates across resampled datasets</strong> - because it doesn't make the same all-or-nothing, easily-flipped choices among correlated features that pure Lasso does, retraining on a slightly different sample tends to produce a similar set of selected features rather than a different arbitrary subset.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Two hyperparameters to tune instead of one</strong> - both <code>alpha</code> (overall strength) and <code>l1_ratio</code> (blend) need to be searched, typically via cross-validation (e.g. <code>ElasticNetCV</code>), which is more expensive than tuning Ridge or Lasso's single <code>alpha</code> alone.</li>
<li><strong>Loses some of Lasso's sparsity</strong> - because part of the penalty is always L2, Elastic Net with a moderate <code>l1_ratio</code> typically keeps more nonzero coefficients than pure Lasso would at the same overall strength, which can be a downside if maximal sparsity/simplicity is the actual goal.</li>
<li><strong>Still assumes an underlying linear relationship</strong> - like Ridge and Lasso, Elastic Net only regularizes a LINEAR model's coefficients; it does nothing to help if the true relationship between features and target is fundamentally nonlinear.</li>
<li><strong>Requires feature scaling</strong> - since both L1 and L2 penalties are sensitive to the scale of each feature (a feature measured in the thousands would be penalized very differently from one measured in fractions), features must be standardized before fitting, or the penalty will be applied unevenly and unfairly across features.</li>
</ul>`,
            codeExamples: [
                `# Using ElasticNetCV to let cross-validation pick both alpha and l1_ratio automatically
import numpy as np
from sklearn.linear_model import ElasticNetCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.datasets import make_regression

X, y = make_regression(n_samples=300, n_features=20, n_informative=8, noise=10, random_state=1)

model = make_pipeline(
    StandardScaler(),
    ElasticNetCV(l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 1.0], alphas=np.logspace(-2, 1, 20), cv=5)
)
model.fit(X, y)

enet = model.named_steps["elasticnetcv"]
print(f"Best alpha found:    {enet.alpha_:.4f}")
print(f"Best l1_ratio found: {enet.l1_ratio_:.2f}")
print(f"Nonzero coefficients: {sum(1 for c in enet.coef_ if abs(c) > 1e-6)} out of {len(enet.coef_)}")
# OUTPUT (typical):
# Best alpha found:    0.0480
# Best l1_ratio found: 0.70
# Nonzero coefficients: 9 out of 20`
            ],
            codeExplanations: [
                `Rather than guessing <code>alpha</code> and <code>l1_ratio</code> by hand, <code>ElasticNetCV</code> performs 5-fold cross-validation over a grid of candidate <code>l1_ratio</code> values and a range of <code>alpha</code> values (generated on a log scale via <code>np.logspace</code>), selecting whichever combination minimizes cross-validated error - the features are standardized first via <code>StandardScaler</code> inside a pipeline, since both penalties are scale-sensitive. The fitted model's <code>alpha_</code> and <code>l1_ratio_</code> attributes report the winning combination, and counting nonzero coefficients shows that, on this dataset (20 features, 8 truly informative), the cross-validated Elastic Net settled on a fairly Lasso-leaning blend (<code>l1_ratio</code> around 0.7) that keeps roughly the right number of features rather than all 20 or an overly sparse handful.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Elastic Net solve that neither Ridge nor Lasso solves alone?</td><td>Ridge shrinks coefficients but never zeroes any out, so it can't perform feature selection; Lasso can zero out coefficients but behaves erratically with correlated features, arbitrarily keeping one from a correlated group and discarding the rest. Elastic Net combines both penalties so it can still zero out irrelevant features while keeping correlated groups of relevant features together with similar coefficients instead of arbitrarily picking one</td></tr>
<tr class='text-center'><td>What does the l1_ratio parameter control in Elastic Net?</td><td>It sets the blend between the L1 (Lasso) and L2 (Ridge) penalties, ranging from 0 (pure Ridge, only L2) to 1 (pure Lasso, only L1); values in between combine both effects, and it is typically tuned via cross-validation alongside the overall penalty strength alpha</td></tr>
<tr class='text-center'><td>Why would you reach for Elastic Net specifically on a dataset like gene expression data?</td><td>Gene expression datasets commonly have thousands of features with many highly correlated groups (genes in the same biological pathway); pure Lasso would arbitrarily select one gene per group and zero out the rest, producing an unstable and misleading feature list, while Elastic Net's Ridge component keeps correlated pathway genes together with similar nonzero coefficients while still zeroing out entire pathways that are truly irrelevant</td></tr>
</table>`
        }
    ]
};
