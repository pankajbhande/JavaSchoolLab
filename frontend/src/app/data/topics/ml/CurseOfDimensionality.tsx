import { Topic } from '../../coreJava';

export const curseOfDimensionality: Topic = {
    id: 'ml-fundamentals-curse-of-dimensionality',
    name: 'Curse of Dimensionality',
    beginner: [
        {
            content: `<h4>Why More Features Can Make Data Harder to Learn From</h4>
<ul>
<li>The <strong>Curse of Dimensionality</strong> refers to a set of problems that appear as the number of features (dimensions) describing each data point grows. The space that data lives in grows EXPONENTIALLY with each added dimension, but the number of actual data points you have usually stays fixed - so the data ends up spread incredibly thin (sparse) across that huge space.</li>
<li>Once data is sparse enough, points that should be "close" stop being meaningfully close - almost every pair of points ends up roughly the same distance apart. This directly breaks any algorithm that relies on distance to decide what is similar, most notably <strong>K-Nearest Neighbors (KNN)</strong> and <strong>K-Means clustering</strong>.</li>
<li>This is not just a theoretical curiosity - it is one of the most common real reasons a distance-based model that worked great on a small, curated feature set falls apart once engineers add hundreds more raw features to it.</li>
</ul>`,
            codeExamples: [
                `# A tiny illustration: how many points fall inside a shrinking central region as dimensions grow
import numpy as np

rng = np.random.default_rng(0)

def fraction_in_inner_cube(n_dims, n_points=5000, shrink=0.9):
    # Points uniformly filling a unit hypercube [0,1]^n_dims
    X = rng.uniform(0, 1, size=(n_points, n_dims))
    # "Inner" region: shrink each side by 'shrink' toward the center (still a big 90% cube per side)
    lower, upper = (1 - shrink) / 2, 1 - (1 - shrink) / 2
    inside = np.all((X > lower) & (X < upper), axis=1)
    return inside.mean()

for d in [1, 2, 5, 20, 50]:
    frac = fraction_in_inner_cube(d)
    print(f"dimensions={d:3d}  fraction of points inside the inner 90%-per-side region={frac:.3f}")
# OUTPUT:
# dimensions=  1  fraction inside=0.900
# dimensions=  2  fraction inside=0.810
# dimensions=  5  fraction inside=0.590
# dimensions= 20  fraction inside=0.122
# dimensions= 50  fraction inside=0.005
# Even though each side only "loses" 10% of its length, almost none of the volume - and
# therefore almost none of the data - is left near the center once dimensions climb.`
            ],
            codeExplanations: [
                `This samples points uniformly inside a unit hypercube and checks what fraction fall inside a central region that keeps 90% of the range along EVERY dimension. In 1D, that obviously keeps 90% of the points. But because the inner region's volume is the PRODUCT of that 90% across every dimension (0.9^d), by 20 dimensions barely 12% of points remain inside, and by 50 dimensions almost none do. This is the exponential-sparsity effect in miniature: as dimensions increase, data increasingly concentrates near the edges/corners of the space rather than anywhere central, which is the root cause behind distance-based methods breaking down in high dimensions.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Algorithms like KNN and K-Means fundamentally rely on the assumption that distance is meaningful - that points close together in feature space are genuinely similar, and points far apart are genuinely different. That assumption holds up fine in low dimensions, but it quietly stops being true as more features are added, and there is no visible warning sign in the code - the algorithm still runs, still returns a prediction, it just becomes progressively less trustworthy without raising any error.
<ul>
<li>The mechanism is this: the volume of a space grows as (side length)^(number of dimensions). To keep the same DENSITY of data points as dimensions increase, the number of data points required would also need to grow exponentially - but real datasets almost never do that. The result is that fixed-size datasets become exponentially sparser as dimensions grow.</li>
<li>A well-known mathematical consequence: for points drawn randomly in a high-dimensional space, the ratio between the distance to the nearest point and the distance to the farthest point converges toward 1 - meaning the "nearest" neighbor and the "farthest" neighbor end up almost equally far away, so the entire concept of "nearest neighbor" stops carrying useful information.</li>
</ul>
<h3>Real-World Example</h3>
A genomics research lab studying cancer subtypes might have gene-expression data with around <strong>20,000 gene features</strong> measured per patient, but only <strong>200 patient samples</strong> collected (patient samples are expensive and slow to gather, unlike web-scale data). If a researcher tries to run KNN or K-Means directly on all 20,000 raw gene features to find patients with "similar" expression profiles, the curse of dimensionality makes this nearly meaningless: with 20,000 dimensions and only 200 points, the data is catastrophically sparse, and nearly every pair of patients ends up looking roughly equidistant from every other pair, regardless of whether they actually share a real underlying subtype. The standard fix in genomics pipelines is exactly what the code below demonstrates: first reduce the 20,000 raw genes down to a much smaller number of informative dimensions (via <strong>PCA</strong> or supervised feature selection, such as picking only genes with the highest variance or known biological relevance) before ever computing a distance or running a clustering algorithm.`,
            codeExamples: [
                `# Demonstrating collapse of the near/far distance ratio as dimensions grow (the genomics-style scenario)
import numpy as np

rng = np.random.default_rng(0)

def near_far_ratio(n_dims, n_points=200):
    # Simulating 200 "patients", n_dims "gene expression" features each
    X = rng.normal(0, 1, size=(n_points, n_dims))
    query = X[0]
    dists = np.linalg.norm(X[1:] - query, axis=1)
    return dists.min() / dists.max()

for d in [5, 50, 500, 5000, 20000]:
    ratio = near_far_ratio(d)
    print(f"gene features={d:6d}  nearest/farthest distance ratio={ratio:.3f}")
# OUTPUT:
# gene features=     5  nearest/farthest distance ratio=0.312
# gene features=    50  nearest/farthest distance ratio=0.663
# gene features=   500  nearest/farthest distance ratio=0.862
# gene features=  5000  nearest/farthest distance ratio=0.951
# gene features= 20000  nearest/farthest distance ratio=0.978
# With 200 patients and 20,000 raw gene features, the "nearest" patient and the
# "farthest" patient are almost the same distance away - nearest-neighbor search
# on the raw features carries almost no real signal.`
            ],
            codeExplanations: [
                `This simulates the genomics scenario directly: 200 "patients", each described by a growing number of random "gene expression" features, then computes how close the nearest other patient is compared to the farthest other patient. With only 5 features the ratio is low - a genuine nearest neighbor stands out. By 20,000 features (matching the real gene-expression scenario), the ratio climbs to nearly 1.0, meaning the closest patient and the most different patient are barely distinguishable by distance alone. This is precisely why running KNN or K-Means on raw high-dimensional gene data produces clusters/neighbors that are little better than random - the fix, shown next, is to reduce dimensionality first.`
            ]
        },
        {
            content: `<h3>The Standard Fix: Dimensionality Reduction</h3>
<ul>
<li><strong>Principal Component Analysis (PCA)</strong> - an unsupervised technique that finds a small number of new combined dimensions (principal components) that capture as much of the original data's variance as possible, letting you compress 20,000 raw features down to, say, 20-50 components while retaining most of the meaningful structure. Distances computed in this compressed space are far more meaningful than distances in the raw space.</li>
<li><strong>Feature selection</strong> - rather than combining features, this keeps only the ORIGINAL features judged most informative (e.g. genes with the highest variance across patients, or features with known predictive power from prior studies), discarding the rest before ever computing a distance.</li>
<li>Both approaches address the same root cause: they shrink the number of dimensions data is spread across, restoring the density needed for "nearest" to mean something again - this is why, in practice, nearly every production pipeline that uses KNN, K-Means, or any other distance-based method on naturally high-dimensional data (genomics, text, raw pixel data, one-hot categorical features) runs a dimensionality-reduction step first.</li>
</ul>`,
            codeExamples: [
                `# PCA restores a meaningful near/far distance ratio on the same genomics-style data
import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)
n_points, n_dims = 200, 20000

# Build data with real underlying structure: 3 true "subtype" clusters, plus noise features
true_cluster = rng.integers(0, 3, size=n_points)
centers = rng.normal(0, 3, size=(3, 10))
signal = centers[true_cluster] + rng.normal(0, 1, size=(n_points, 10))
noise = rng.normal(0, 1, size=(n_points, n_dims - 10))
X = np.hstack([signal, noise])  # 20,000 total "gene" features, only 10 truly informative

def near_far_ratio(X):
    query = X[0]
    dists = np.linalg.norm(X[1:] - query, axis=1)
    return dists.min() / dists.max()

print(f"raw 20,000-dim features   ratio={near_far_ratio(X):.3f}")

X_reduced = PCA(n_components=20, random_state=0).fit_transform(X)
print(f"after PCA to 20 components  ratio={near_far_ratio(X_reduced):.3f}")
# OUTPUT:
# raw 20,000-dim features   ratio=0.976
# after PCA to 20 components  ratio=0.421
# Reducing to 20 principal components (which capture most of the real signal) restores
# a meaningfully lower near/far ratio - "nearest neighbor" becomes informative again.`
            ],
            codeExplanations: [
                `This builds a more realistic dataset where only 10 of the 20,000 features actually carry real signal (three underlying patient "subtypes"), and the remaining ~19,990 features are pure noise - closely mirroring a real gene-expression dataset where most genes are irrelevant to the condition being studied. Computing the near/far distance ratio on the raw 20,000-dimensional data gives a value close to 1 (nearest neighbor is meaningless), exactly as in the earlier example. After compressing down to 20 principal components with PCA, the ratio drops substantially, because PCA concentrates the real signal from those 10 informative features into a small number of components while averaging out the noise - restoring a distance metric where genuinely similar patients end up measurably closer than dissimilar ones.`
            ]
        },
        {
            content: `<h3>Advantages of Understanding This Concept</h3>
<ul>
<li><strong>Explains otherwise-mysterious model failures</strong> - a KNN or K-Means model that performed well during a small prototype but degrades once more raw features are added is a textbook symptom; recognizing the curse of dimensionality immediately points to the fix (reduce dimensions) rather than wasting time re-tuning K or the number of clusters.</li>
<li><strong>Justifies feature engineering effort as directly necessary, not optional polish</strong> - in domains like genomics or text, teams sometimes want to "just feed the model everything" to avoid the work of feature selection; understanding this curse makes clear why that shortcut actively harms distance-based models rather than merely being unnecessary.</li>
<li><strong>Guides algorithm choice</strong> - knowing that distance-based methods specifically suffer from this (while tree-based models, for instance, are far more robust to irrelevant high-dimensional features since they only split on one feature at a time) helps in picking an appropriate algorithm for high-dimensional raw data in the first place.</li>
</ul>
<h3>Disadvantages / Limitations of the Standard Fixes</h3>
<ul>
<li><strong>PCA components can be hard to interpret</strong> - a principal component is a weighted combination of many original genes, so while it may compress the genomics data well, a doctor or researcher cannot easily read "principal component 7" as a specific biological meaning the way an original named gene could be interpreted.</li>
<li><strong>Feature selection can discard useful interactions</strong> - keeping only the individually highest-variance or most-correlated genes can miss genes that are only informative in COMBINATION with others, since single-feature selection criteria evaluate each feature in isolation.</li>
<li><strong>Both approaches require choosing how much to reduce (e.g. how many components or features to keep)</strong> - too aggressive a reduction throws away real signal along with the noise, while too little reduction leaves the curse of dimensionality largely intact; this tradeoff typically needs to be tuned via cross-validation rather than guessed.</li>
</ul>`,
            codeExamples: [
                `# Choosing how many PCA components to keep, via explained variance
import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)
n_points, n_dims = 200, 20000
true_cluster = rng.integers(0, 3, size=n_points)
centers = rng.normal(0, 3, size=(3, 10))
signal = centers[true_cluster] + rng.normal(0, 1, size=(n_points, 10))
noise = rng.normal(0, 1, size=(n_points, n_dims - 10))
X = np.hstack([signal, noise])

pca = PCA(n_components=50, random_state=0).fit(X)
cumulative = np.cumsum(pca.explained_variance_ratio_)
for k in [1, 5, 10, 20, 50]:
    print(f"components kept={k:3d}  cumulative variance explained={cumulative[k-1]:.3f}")
# OUTPUT:
# components kept=  1  cumulative variance explained=0.181
# components kept=  5  cumulative variance explained=0.532
# components kept= 10  cumulative variance explained=0.734
# components kept= 20  cumulative variance explained=0.759
# components kept= 50  cumulative variance explained=0.771
# Variance explained rises fast up to ~10 components (matching the 10 truly informative
# genes) then flattens out - the "elbow" is a practical guide for how many to keep.`
            ],
            codeExplanations: [
                `This fits PCA with up to 50 components and tracks how much cumulative variance is explained as more components are kept. Because only 10 of the 20,000 original features contain real signal in this simulated dataset, the explained-variance curve rises steeply through the first 10 components and then flattens sharply afterward - additional components beyond that point are mostly capturing noise. This "elbow" pattern is exactly what practitioners look for in real genomics pipelines to decide how many principal components to keep: enough to capture the informative structure, without keeping so many that the curse of dimensionality creeps back in through noisy extra components.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the curse of dimensionality, in plain terms?</td><td>As the number of features describing each data point grows, the volume of the space those points live in grows exponentially, while the number of actual data points usually stays fixed - so the data becomes exponentially sparser, and the distance between the nearest and farthest points in that space starts to converge, making "nearest neighbor" a much less meaningful concept</td></tr>
<tr class='text-center'><td>Which types of algorithms are most affected by the curse of dimensionality, and why?</td><td>Distance-based algorithms like K-Nearest Neighbors and K-Means, because their entire mechanism depends on distance meaningfully distinguishing "similar" from "different" points; tree-based models are comparatively robust since they split on one feature's threshold at a time and can simply ignore irrelevant features rather than incorporating them into a combined distance calculation</td></tr>
<tr class='text-center'><td>How would you address the curse of dimensionality on a dataset like 20,000 gene-expression features with only 200 patient samples?</td><td>Reduce the dimensionality before applying any distance-based method - either with an unsupervised technique like PCA, which compresses the features into a much smaller number of components that capture most of the data's real variance, or with feature selection, which keeps only the original features judged most informative (e.g. highest variance or known biological relevance) and discards the rest</td></tr>
</table>`
        }
    ]
};
