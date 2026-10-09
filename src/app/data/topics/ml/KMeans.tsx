import { Topic } from '../../coreJava';

export const kMeans: Topic = {
    id: 'ml-unsupervised-k-means',
    name: 'K-Means',
    beginner: [
        {
            content: `<h4>Grouping Data Without Labels</h4>
<ul>
<li><strong>K-Means</strong> is an UNSUPERVISED algorithm - it groups data points into <code>K</code> clusters based purely on how close they are to each other, with no labeled "correct answer" to learn from.</li>
<li>It works by picking <code>K</code> center points (<strong>centroids</strong>), then repeating two steps: (1) assign every point to its NEAREST centroid, and (2) move each centroid to the AVERAGE position of the points assigned to it. This repeats until the centroids stop moving.</li>
<li>The result is <code>K</code> groups where points inside a group are close to each other and far from points in other groups - useful whenever you want to discover natural groupings in data you don't already have categories for.</li>
</ul>`,
            codeExamples: [
                `from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, true_labels = make_blobs(n_samples=300, centers=4, cluster_std=0.8, random_state=0)

model = KMeans(n_clusters=4, n_init=10, random_state=0)
model.fit(X)

print("Cluster centers:\\n", model.cluster_centers_.round(2))
print("First 10 assigned labels:", model.labels_[:10])
# OUTPUT (typical):
# Cluster centers:
#  [[ 2.01  0.89]
#   [-1.5   2.9 ]
#   [ 4.3  -3.1 ]
#   [-3.2  -1.4 ]]
# First 10 assigned labels: [0 0 2 1 3 0 2 1 1 2]`
            ],
            codeExplanations: [
                `make_blobs generates 300 synthetic 2D points arranged into 4 naturally separated clumps, giving us a dataset where the "right" grouping is roughly known so we can sanity-check the algorithm. A KMeans model is created with n_clusters=4 (we tell it how many groups to look for) and n_init=10 (it runs the whole centroid-finding process 10 times with different random starting points and keeps the best result, since a single run can get unlucky). fit(X) runs the assign-then-update loop described above until convergence. cluster_centers_ holds the final (x, y) position of each of the 4 centroids, and labels_ holds, for every one of the 300 input points, which of the 4 clusters (0-3) it was assigned to.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before clustering algorithms like K-Means, discovering structure in unlabeled data meant manual inspection - a person scrolling through spreadsheets or scatter plots trying to eyeball groupings, which does not scale past a handful of features or a few hundred rows.</li>
<li>Most real-world data has NO labels at all (no one has tagged each customer as "budget-conscious" or "premium" in advance) - supervised methods like Decision Trees or Logistic Regression simply cannot be applied until such labels exist. K-Means finds structure directly from the data's geometry, turning an unlabeled pile of rows into actionable groups.</li>
<li>Without a systematic clustering method, businesses either treat every customer/data point identically (a single one-size-fits-all strategy) or rely on rigid, manually-defined buckets (e.g. "age 18-25", "age 26-40") that miss real, multi-dimensional patterns the data itself contains.</li>
</ul>
<h3>Real-World Example</h3>
A marketing team at an e-commerce company wants to run different campaigns for different types of customers, but has no existing "customer type" labels - only raw behavioral data.
<ul>
<li>They gather features per customer: average order value, purchase frequency per month, and days since last purchase.</li>
<li>Running K-Means with K=3 on this data might reveal three natural segments: high-value frequent buyers (worth a loyalty program), occasional big-ticket shoppers (worth targeted upsell emails), and lapsed low-engagement customers (worth a win-back discount) - none of which were defined in advance; K-Means DISCOVERED them from the data's natural geometry.</li>
<li>The same technique is used for <strong>image color quantization</strong> - clustering the millions of RGB pixel colors in a photo into just K representative colors (e.g. K=16) to compress the image or create a stylized poster effect, where each pixel is replaced by its nearest cluster's centroid color.</li>
</ul>`,
            codeExamples: [
                `# Customer segmentation example: grouping customers by spending behavior
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n = 300
avg_order_value = np.concatenate([rng.normal(120, 15, 100), rng.normal(40, 10, 100), rng.normal(90, 20, 100)])
purchase_freq   = np.concatenate([rng.normal(8, 1.5, 100),  rng.normal(1, 0.5, 100), rng.normal(4, 1, 100)])
days_since_last = np.concatenate([rng.normal(5, 2, 100),    rng.normal(120, 20, 100), rng.normal(20, 8, 100)])

customers = pd.DataFrame({
    "avg_order_value": avg_order_value,
    "purchase_freq": purchase_freq,
    "days_since_last": days_since_last
})

X_scaled = StandardScaler().fit_transform(customers)   # scale features so no single one dominates distance
model = KMeans(n_clusters=3, n_init=10, random_state=0)
customers["segment"] = model.fit_predict(X_scaled)

print(customers.groupby("segment").mean().round(1))
# OUTPUT (typical):
#          avg_order_value  purchase_freq  days_since_last
# segment
# 0                   120.3            8.0              5.1   <- loyal high-value
# 1                    39.8            1.0            120.4   <- lapsed / at-risk
# 2                    89.7            4.0             20.3   <- occasional shopper`
            ],
            codeExplanations: [
                `This builds a synthetic customer dataset with three underlying behavioral groups baked in (high-spend/frequent, low-spend/infrequent, and moderate), across three features: average order value, purchase frequency, and days since last purchase. Because these features have very different scales (dollars vs. purchases-per-month vs. days), StandardScaler().fit_transform() is applied first so no single feature dominates the distance calculation K-Means relies on - without scaling, "days since last purchase" (values in the hundreds) would swamp "purchase frequency" (values under 10). KMeans(n_clusters=3) is fit and fit_predict assigns each customer a segment label 0-2 in one step. Grouping the resulting dataframe by segment and averaging each feature shows the algorithm recovered three interpretable business segments purely from the data's geometry, with no labels ever provided.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Fast and scalable</strong> - K-Means runtime is roughly linear in the number of points, features, and clusters, so it comfortably handles datasets with hundreds of thousands of rows (e.g. clustering millions of image pixels for color quantization), unlike many other clustering algorithms that scale quadratically.</li>
<li><strong>Simple to understand and explain</strong> - "group points near the same center" is intuitive to a non-technical stakeholder like a marketing manager, unlike more opaque unsupervised methods (e.g. spectral clustering).</li>
<li><strong>Works well when clusters are roughly round/equally sized</strong> - e.g. well-separated customer segments or naturally clumped sensor readings converge quickly and reliably.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>You must choose K in advance</strong> - unlike some algorithms that infer the number of groups automatically, K-Means needs you to specify K upfront; picking K=3 when the true structure has 5 groups will force unrelated groups together (mitigated by the Elbow Method / Silhouette Score, covered below).</li>
<li><strong>Sensitive to centroid initialization</strong> - a poor random start can converge to a bad local optimum (e.g. two centroids splitting one true cluster while two real clusters get merged); this is why <code>n_init</code> (multiple random restarts) and <strong>k-means++</strong> initialization exist.</li>
<li><strong>Assumes roughly spherical, similarly-sized clusters</strong> - it struggles with elongated, crescent-shaped, or very differently-sized clusters (e.g. it cannot correctly separate two concentric rings of points, since it only understands distance-to-centroid, not shape).</li>
<li><strong>Sensitive to outliers</strong> - because centroids are computed as a MEAN, a handful of extreme outlier points (e.g. one customer with a $50,000 single order) can pull a centroid noticeably off from where the bulk of that cluster's "real" points sit.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating sensitivity to outliers - a single extreme point shifts the centroid
import numpy as np
from sklearn.cluster import KMeans

rng = np.random.default_rng(0)
cluster_points = rng.normal(loc=[10, 10], scale=0.5, size=(50, 2))

model_clean = KMeans(n_clusters=1, n_init=10, random_state=0).fit(cluster_points)
print("Centroid without outlier:", model_clean.cluster_centers_.round(2))

with_outlier = np.vstack([cluster_points, [[500, 500]]])   # one extreme outlier added
model_outlier = KMeans(n_clusters=1, n_init=10, random_state=0).fit(with_outlier)
print("Centroid with 1 outlier added:", model_outlier.cluster_centers_.round(2))
# OUTPUT (typical):
# Centroid without outlier: [[10.02  9.98]]
# Centroid with 1 outlier added: [[19.6 19.6]]   <- pulled far from the true cluster center`
            ],
            codeExplanations: [
                `This isolates the outlier-sensitivity issue with a minimal example. 50 points are generated tightly clustered around (10, 10). Fitting KMeans with n_clusters=1 on just these points correctly finds the centroid near (10, 10), since with one cluster the "centroid" is just the mean of all points. Then a single extreme outlier point at (500, 500) is appended to the same data and KMeans is refit - because the centroid for a single cluster is literally the arithmetic mean of every point assigned to it, that one far-away point drags the centroid from (10, 10) roughly a fifth of the way toward (500, 500), even though it represents just 1 out of 51 points. This is exactly why real pipelines often remove or cap outliers (or use a more robust variant like K-Medoids) before running K-Means on real-world data such as customer spending, which can contain rare extreme values.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - k-means++ Initialization and Choosing K</h3>
<ul>
<li><strong>The core objective</strong>: K-Means minimizes WCSS (Within-Cluster Sum of Squares, also called <strong>inertia</strong>) - the total squared distance from every point to its assigned centroid: <code>&sum;&#8342; &sum;&#8339;&isin;C&#8342; ||x&#8339; - &mu;&#8342;||&sup2;</code>. The assign/update loop is a form of coordinate descent that provably never increases this objective, guaranteeing convergence (though possibly to a local, not global, minimum).</li>
<li><strong>k-means++ initialization</strong> (scikit-learn's default) picks the first centroid randomly, then picks each subsequent centroid with probability proportional to its squared distance from the nearest already-chosen centroid - spreading initial centroids out instead of risking two random starts landing in the same true cluster. This dramatically reduces the chance of a bad local optimum compared to fully random initialization.</li>
<li><strong>Choosing K - the Elbow Method</strong>: plot WCSS/inertia against K; inertia always decreases as K increases (more clusters can only fit the data at least as well), but it typically drops sharply then levels off - the "elbow" point is a good candidate for K.</li>
<li><strong>Choosing K - the Silhouette Score</strong>: for each point, compares its average distance to points in its own cluster vs. the nearest other cluster, producing a score from -1 to 1 (higher is better-separated); unlike the Elbow Method it gives one clean number per K to directly compare, rather than requiring eyeballing a bend in a curve.</li>
</ul>`,
            codeExamples: [
                `# Choosing K with the Elbow Method and Silhouette Score together
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.7, random_state=0)

for k in range(2, 7):
    model = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    inertia = model.inertia_
    sil = silhouette_score(X, model.labels_)
    print(f"K={k}  inertia={inertia:8.1f}  silhouette={sil:.3f}")
# OUTPUT (typical):
# K=2  inertia=  2350.4  silhouette=0.487
# K=3  inertia=  1180.2  silhouette=0.612
# K=4  inertia=   410.6  silhouette=0.783   <- elbow here + highest silhouette -> true K
# K=5  inertia=   375.1  silhouette=0.601
# K=6  inertia=   345.0  silhouette=0.554`
            ],
            codeExplanations: [
                `This runs KMeans for K ranging from 2 to 6 on data that truly has 4 underlying clusters, computing two diagnostics for each K. model.inertia_ is scikit-learn's built-in WCSS value - it always decreases as K grows, but the code looks for where that decrease sharply slows (the "elbow"), which happens right around K=4 in the output (a huge drop from K=3 to K=4, then only a small further drop to K=5). silhouette_score(X, model.labels_) independently measures how well-separated the resulting clusters are, peaking at K=4 as well. Seeing both diagnostics agree at K=4 gives much stronger confidence in choosing that K than either signal alone - exactly the workflow used in practice (e.g. the marketing team from the earlier example would run this same loop before committing to K=3 customer segments).`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Walk through the K-Means algorithm step by step.</td><td>Choose K and initialize K centroids (ideally via k-means++); repeat: (1) assign every point to its nearest centroid by distance, (2) recompute each centroid as the mean of the points now assigned to it; stop when assignments stop changing (or after a max iteration count) - this minimizes within-cluster sum of squared distances (inertia)</td></tr>
<tr class='text-center'><td>Why does K-Means need feature scaling, and how do you choose K?</td><td>K-Means relies on Euclidean distance, so a feature with a much larger numeric range (e.g. income in dollars vs. age in years) would dominate the distance calculation and distort clusters unless features are standardized first; K is typically chosen using the Elbow Method (plotting inertia vs. K and looking for the bend) and/or the Silhouette Score (a single number per K measuring cluster separation), ideally combined with domain knowledge</td></tr>
<tr class='text-center'><td>What are K-Means' main limitations, and what would you use instead?</td><td>It requires specifying K in advance, is sensitive to outliers (since centroids are means) and to initialization (mitigated by k-means++ and multiple n_init restarts), and assumes roughly spherical, similarly-sized clusters - for non-spherical or density-varying clusters, DBSCAN or hierarchical/agglomerative clustering are often better alternatives since they don't assume a particular cluster shape</td></tr>
</table>`
        }
    ]
};
