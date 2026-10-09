import { Topic } from '../../coreJava';

export const pca: Topic = {
    id: 'ml-unsupervised-pca',
    name: 'PCA',
    beginner: [
        {
            content: `<h4>Compressing Many Features Into a Few That Matter Most</h4>
<ul>
<li><strong>Principal Component Analysis (PCA)</strong> is a technique for DIMENSIONALITY REDUCTION - it takes data with many features (columns) and finds a smaller set of new features, called <strong>principal components</strong>, that capture most of the original variation.</li>
<li>Each principal component is a direction in the data along which the points spread out the MOST. The first component captures the most variance, the second captures the most REMAINING variance while being perpendicular (uncorrelated) to the first, and so on.</li>
<li>PCA is unsupervised - it never looks at labels, only at how the features co-vary with each other. It's commonly used to visualize high-dimensional data in 2D/3D, to speed up downstream models, and to remove redundant/correlated features.</li>
</ul>`,
            codeExamples: [
                `from sklearn.decomposition import PCA
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)   # 4 features: sepal length/width, petal length/width
X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=2)   # compress 4 features down to 2
X_reduced = pca.fit_transform(X_scaled)

print("Original shape:", X.shape)
print("Reduced shape:", X_reduced.shape)
print("Explained variance ratio:", pca.explained_variance_ratio_.round(3))
# OUTPUT (typical):
# Original shape: (150, 4)
# Reduced shape: (150, 2)
# Explained variance ratio: [0.729 0.229]   <- the 2 components keep ~96% of the original information`
            ],
            codeExplanations: [
                `The iris dataset has 150 flower samples with 4 measured features. Because PCA is sensitive to feature scale (it looks at variance, and a feature measured in bigger numbers naturally has bigger variance), StandardScaler().fit_transform() standardizes every feature to mean 0 and unit variance first. PCA(n_components=2) is then created to compress the 4 original features down to just 2 new ones, and fit_transform both learns the principal component directions from the data AND projects every row onto them in one call. The printed shapes confirm the compression from 4 columns to 2. explained_variance_ratio_ shows how much of the original data's total variance each of the 2 new components captures - here roughly 73% and 23%, meaning the 2D compressed version retains about 96% of the original information despite using half the features.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before dimensionality reduction, high-dimensional datasets (hundreds or thousands of columns, such as gene-expression data with 20,000 genes per sample, or sensor arrays with hundreds of channels) were extremely hard to visualize, slow to train models on, and prone to the <strong>curse of dimensionality</strong> - as feature count grows, data becomes sparse in that space and distance-based methods (like K-Means or KNN) become less meaningful.</li>
<li>Many real-world features are also highly CORRELATED (e.g. "height in cm" and "height in inches", or dozens of genes that all activate together in the same biological pathway) - training a model on all of them wastes computation on redundant information and can make some models numerically unstable.</li>
<li>PCA addresses both problems at once: it re-expresses the data in terms of a handful of independent (uncorrelated) directions that capture the essential structure, discarding directions that are mostly noise or redundancy - without needing any domain-specific feature selection rules.</li>
</ul>
<h3>Real-World Example</h3>
A genomics lab measures the expression level of <strong>20,000 genes</strong> for each of 500 patient tissue samples, trying to distinguish cancerous from healthy tissue.
<ul>
<li>Visualizing 20,000 dimensions directly is impossible, and training a classifier directly on all 20,000 genes with only 500 samples risks severe overfitting (far more features than data points).</li>
<li>Running PCA on the standardized gene-expression matrix might show that just the first 2 principal components already separate cancerous and healthy samples into visibly distinct clusters on a scatter plot - because many of those 20,000 genes move together in a handful of underlying biological "programs", not 20,000 independent signals.</li>
<li>The lab then trains a downstream classifier (e.g. Logistic Regression) on the top 50 principal components instead of all 20,000 raw genes - training is dramatically faster, the model is less prone to overfitting, and 2D/3D PCA plots become a fast visual QC step to sanity-check that samples cluster the way expected before any modeling begins.</li>
</ul>`,
            codeExamples: [
                `# Gene-expression style example: PCA reveals group separation before any classifier is trained
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n_samples, n_genes = 500, 200   # simplified gene count for a runnable example

# simulate two underlying biological "programs" driving most genes, plus per-gene noise
program_a = rng.normal(0, 1, n_samples)
program_b = rng.normal(0, 1, n_samples)
labels = (program_a + 0.5 * program_b > 0).astype(int)   # cancerous(1) vs healthy(0)

gene_loadings_a = rng.normal(1, 0.3, n_genes)
gene_loadings_b = rng.normal(1, 0.3, n_genes)
expression = (np.outer(program_a, gene_loadings_a) + np.outer(program_b, gene_loadings_b)
              + rng.normal(0, 0.5, (n_samples, n_genes)))

X_scaled = StandardScaler().fit_transform(expression)
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print("Explained variance ratio (first 2 PCs):", pca.explained_variance_ratio_.round(3))
print("Mean PC1 for healthy vs cancerous:",
      X_pca[labels == 0, 0].mean().round(2), "vs", X_pca[labels == 1, 0].mean().round(2))
# OUTPUT (typical):
# Explained variance ratio (first 2 PCs): [0.412 0.198]
# Mean PC1 for healthy vs cancerous: -1.35 vs 1.28   <- PC1 alone strongly separates the two groups`
            ],
            codeExplanations: [
                `This simulates the genomics scenario at a smaller, runnable scale: 200 "genes" measured across 500 samples, where the underlying truth is that just two hidden biological "programs" (program_a, program_b) drive most of the correlated variation across genes, plus per-gene noise. Each gene's expression is a weighted mix of the two programs (via gene_loadings_a/b) - mimicking how thousands of real genes often co-vary because they share regulatory pathways. A binary label simulates cancerous vs. healthy tissue based on those same underlying programs. After standardizing and running PCA(n_components=2), the explained_variance_ratio_ confirms the 2 components capture a large share of the total variance despite there being 200 raw features. Comparing the mean of the first principal component (PC1) between the two label groups shows a large separation - demonstrating, as in the real lab scenario, that PCA can surface a meaningful group distinction in just 1-2 components before any classifier is even trained.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Speeds up downstream models</strong> - training a model on 50 principal components instead of 20,000 raw genes is drastically faster, and often more numerically stable, since redundant correlated columns are removed.</li>
<li><strong>Reduces overfitting risk</strong> - fewer features relative to the number of samples (a better feature-to-row ratio) reduces the chance a downstream model memorizes noise, especially valuable in domains like genomics where features vastly outnumber samples.</li>
<li><strong>Makes high-dimensional data visualizable</strong> - reducing to 2 or 3 components lets you scatter-plot data with hundreds of original columns and visually spot clusters, outliers, or trends, e.g. confirming cancerous vs. healthy tissue separates before building any classifier.</li>
<li><strong>Removes multicollinearity</strong> - principal components are by construction uncorrelated with each other, which helps linear models (like Linear/Logistic Regression) that assume/prefer independent features and can otherwise get unstable coefficient estimates from correlated inputs.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Hurts interpretability</strong> - a principal component is a weighted MIX of the original features (e.g. "0.4 &times; gene_112 + 0.3 &times; gene_5019 - 0.1 &times; gene_887 + ..."), so "component 1 went up" is far harder to explain to a doctor or business stakeholder than "debt-to-income went up".</li>
<li><strong>Assumes linear relationships</strong> - PCA only captures LINEAR combinations of features that maximize variance; if the true structure is nonlinear (e.g. data lying on a curved manifold, like a Swiss roll shape), PCA can badly distort it - techniques like t-SNE or UMAP are often used instead for nonlinear visualization.</li>
<li><strong>Sensitive to feature scaling</strong> - since PCA maximizes variance, an unscaled feature measured in large numbers (e.g. income in dollars) will dominate the components purely due to its scale, not because it's actually more informative - standardization before PCA is essentially mandatory.</li>
<li><strong>High variance does not always mean high importance</strong> - PCA is unsupervised and blind to the actual prediction target; it's possible (though less common) that a direction with LOW variance is actually the most predictive one for a specific downstream label, and PCA would discard it if it's not among the top components kept.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating why scaling matters before PCA, and how PCA can discard a label-relevant low-variance direction
import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)
n = 200
feature_big_scale = rng.normal(0, 1000, n)     # e.g. income in dollars
feature_small_scale = rng.normal(0, 1, n)      # e.g. a ratio between 0 and 1
X_unscaled = np.column_stack([feature_big_scale, feature_small_scale])

pca_unscaled = PCA(n_components=1).fit(X_unscaled)
print("Unscaled PCA component loadings:", pca_unscaled.components_.round(3))
# The large-scale feature dominates the single component almost entirely, regardless of true importance

X_scaled = (X_unscaled - X_unscaled.mean(axis=0)) / X_unscaled.std(axis=0)
pca_scaled = PCA(n_components=1).fit(X_scaled)
print("Scaled PCA component loadings:", pca_scaled.components_.round(3))
# OUTPUT (typical):
# Unscaled PCA component loadings: [[ 1.  0.001]]   <- almost entirely the big-scale feature
# Scaled PCA component loadings: [[0.707 0.707]]     <- balanced contribution after scaling`
            ],
            codeExplanations: [
                `This isolates the scaling pitfall described above. Two synthetic features are created with very different natural scales: one varying by roughly +/-1000 (like income in dollars), the other by roughly +/-1 (like a ratio). Running PCA directly on the unscaled data shows components_ (the weights defining the first principal component) putting almost all its weight on the big-scale feature (loading near 1.0) and almost none on the small-scale one (loading near 0.001) - not because the big-scale feature is actually more informative, but purely because its raw numeric variance is thousands of times larger. After standardizing both features to the same scale (subtracting the mean and dividing by standard deviation) and refitting PCA, the component loadings become balanced (about 0.707 each, i.e. equal weight) - confirming that standardization before PCA is what makes the resulting components reflect genuine shared structure in the data rather than an artifact of measurement units.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Eigenvectors, Eigenvalues, and the Covariance Matrix</h3>
<ul>
<li>PCA starts by computing the <strong>covariance matrix</strong> of the (typically standardized) features - a square matrix where entry (i, j) is how much feature i and feature j vary together.</li>
<li>It then finds the <strong>eigenvectors</strong> of that covariance matrix - these are the directions along which the data varies independently of each other (mathematically, directions the covariance matrix only stretches, never rotates).</li>
<li>Each eigenvector has a corresponding <strong>eigenvalue</strong>, which equals the amount of variance the data has along that direction. Sorting eigenvectors by DESCENDING eigenvalue and keeping the top <code>n_components</code> gives you the principal components, in order of how much information (variance) each one captures.</li>
<li><strong>explained_variance_ratio_</strong> is simply each kept eigenvalue divided by the sum of ALL eigenvalues - the fraction of total variance that component accounts for. Plotting a cumulative sum of these ratios (a "scree plot") is the standard way to decide how many components to keep (e.g. "keep enough components to explain 95% of variance").</li>
</ul>`,
            codeExamples: [
                `# Manually computing PCA via eigen-decomposition of the covariance matrix, to show what fit() does internally
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_iris

X, _ = load_iris(return_X_y=True)
X_scaled = StandardScaler().fit_transform(X)

# Manual approach
cov_matrix = np.cov(X_scaled, rowvar=False)
eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)   # eigh: for symmetric matrices, ascending order
order = np.argsort(eigenvalues)[::-1]                     # sort descending
eigenvalues, eigenvectors = eigenvalues[order], eigenvectors[:, order]
manual_explained_ratio = eigenvalues / eigenvalues.sum()

# scikit-learn's PCA for comparison
sklearn_pca = PCA().fit(X_scaled)

print("Manual explained variance ratio:  ", manual_explained_ratio.round(3))
print("sklearn explained variance ratio: ", sklearn_pca.explained_variance_ratio_.round(3))
# OUTPUT (typical):
# Manual explained variance ratio:   [0.729 0.229 0.037 0.005]
# sklearn explained variance ratio:  [0.729 0.229 0.037 0.005]   <- identical, confirming the mechanics`
            ],
            codeExplanations: [
                `This reimplements PCA's core math from scratch to demystify what PCA().fit() does internally. np.cov(X_scaled, rowvar=False) computes the 4x4 covariance matrix of the standardized iris features (rowvar=False tells numpy that columns, not rows, are the variables). np.linalg.eigh (the eigen-decomposition function optimized for symmetric matrices like a covariance matrix) returns eigenvalues and their corresponding eigenvectors; since eigh returns them in ascending order, argsort with [::-1] reverses them to descending order so the most-variance-capturing eigenvector comes first. Dividing each eigenvalue by the sum of all eigenvalues gives the manually-computed explained variance ratio. Comparing this to scikit-learn's own PCA().fit(X_scaled).explained_variance_ratio_ on the identical data produces matching numbers, confirming that "principal components" are precisely the eigenvectors of the feature covariance matrix, ranked by their eigenvalues.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is PCA and what problem does it solve?</td><td>PCA is an unsupervised dimensionality-reduction technique that finds new uncorrelated directions (principal components), ranked by how much variance in the data they capture, and projects the data onto the top few; it solves the problem of high-dimensional, correlated, hard-to-visualize data by compressing it into a smaller set of features that retain most of the original information</td></tr>
<tr class='text-center'><td>Why must you standardize features before running PCA?</td><td>PCA selects directions that maximize variance, and variance is scale-dependent - a feature measured in larger raw numbers (e.g. income in dollars vs. a 0-1 ratio) would dominate the components purely due to its units, not because it is actually more informative; standardizing every feature to mean 0 and unit variance first ensures components reflect genuine shared structure</td></tr>
<tr class='text-center'><td>How do explained_variance_ratio_ and eigenvalues relate, and how do you decide how many components to keep?</td><td>Each principal component corresponds to an eigenvector of the feature covariance matrix, and its eigenvalue equals the variance the data has along that direction; explained_variance_ratio_ is each eigenvalue divided by the sum of all eigenvalues. A common approach is to sort components by descending eigenvalue and keep just enough of them so the cumulative explained variance reaches a target threshold (e.g. 90-95%), often visualized with a scree plot</td></tr>
</table>`
        }
    ]
};
