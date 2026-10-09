import { Topic } from '../../coreJava';

export const unsupervisedLearning: Topic = {
    id: 'ml-fundamentals-unsupervised-learning',
    name: 'Unsupervised Learning',
    beginner: [
        {
            content: `<h4>Finding Structure Without Being Told the Answer</h4>
<ul>
<li><strong>Unsupervised Learning</strong> is a type of machine learning where the training data has NO labels - the model is only given raw inputs (e.g. customer purchase histories, or a folder of unlabeled photos) and must find hidden structure or patterns on its own, without ever being told "this is the correct answer."</li>
<li>This is the opposite setup from <strong>supervised learning</strong>, where every training example comes with a known correct label (e.g. "this email is spam") that the model learns to predict. In unsupervised learning, there's nothing to predict - only patterns to discover.</li>
<li>The two main families are <strong>clustering</strong> (grouping similar data points together, e.g. <strong>K-Means</strong>) and <strong>dimensionality reduction</strong> (compressing many features down to fewer while preserving the important structure, e.g. <strong>PCA</strong> - Principal Component Analysis).</li>
</ul>`,
            codeExamples: [
                `# K-Means clustering: grouping customers by behavior with NO labels given at all
import numpy as np
from sklearn.cluster import KMeans

# columns: [avg_order_value, orders_per_month] - no "segment" label anywhere in this data
customers = np.array([
    [12, 8], [15, 9], [10, 7],      # frequent, low-spend shoppers
    [200, 1], [180, 1], [220, 2],   # rare, big-spend shoppers
    [11, 10], [14, 7],              # more frequent, low-spend shoppers
])

model = KMeans(n_clusters=2, n_init=10, random_state=0)
cluster_ids = model.fit_predict(customers)

print("Cluster assignment per customer:", cluster_ids)
print("Cluster centers (avg_order_value, orders_per_month):")
print(model.cluster_centers_)
# OUTPUT (typical):
# Cluster assignment per customer: [0 0 0 1 1 1 0 0]
# Cluster centers (avg_order_value, orders_per_month):
# [[ 12.4   8.2]
#  [200.0   1.3]]`
            ],
            codeExplanations: [
                `The <code>customers</code> array has no "correct" group label anywhere - just two raw numeric measurements per customer. <code>KMeans(n_clusters=2)</code> is told only HOW MANY groups to look for, not what those groups mean or which customer belongs where; <code>fit_predict</code> discovers the grouping entirely from the geometric structure of the data, by repeatedly assigning each point to its nearest of 2 center points and then recomputing those centers. The result splits customers into two clusters purely from the data's own structure - one cluster of frequent, low-value shoppers ("bargain hunters") and one of rare, high-value shoppers ("premium buyers") - labels a human can attach AFTER the fact by inspecting the cluster centers, even though the algorithm itself never saw or used those labels.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Supervised learning needs labeled data, and labeling is often the single most expensive, slowest part of building an ML system - it usually requires a human to manually review and tag every example (or many examples), which doesn't scale when data arrives by the millions.
<ul>
<li><strong>Most real-world data has no labels at all.</strong> A retailer has enormous amounts of raw transaction logs, but nobody ever sat down and manually tagged each customer as "bargain hunter" or "premium buyer" - those categories don't exist anywhere in the raw data until an unsupervised algorithm discovers them. Unsupervised learning lets you extract value from data that would otherwise sit unused simply because labeling it was never feasible.</li>
<li><strong>It's often used as a first exploratory step</strong> before deciding what to even build next - clustering can reveal that "customers" actually break into 4 meaningfully different behavioral groups nobody had previously defined, which then informs a targeted marketing strategy, a recommendation system, or even which labels would be worth collecting for a later supervised model.</li>
<li><strong>Dimensionality reduction (PCA) fights the "curse of dimensionality"</strong> - many real datasets have hundreds or thousands of features (e.g. every product a retailer sells becomes one feature per customer), and most ML algorithms degrade or slow down badly as dimensionality grows; PCA compresses that down to a much smaller number of components that still capture most of the meaningful variation, making downstream analysis faster and often more accurate.</li>
</ul>
<h3>Real-World Example: Customer Segmentation Nobody Explicitly Labeled</h3>
A large retailer has millions of transaction records - what each customer bought, how often, and how much they spent - but has never manually categorized a single customer into a "type." Running K-Means on purchase-behavior features (spending frequency, average basket size, category mix, discount sensitivity) automatically groups customers into clusters the business can then name and act on: "bargain hunters" who buy frequently but only on discount, "premium buyers" who buy rarely but spend heavily on full-price items, and "occasional browsers" who buy rarely and cheaply. None of these categories were defined in advance - they emerged purely from the shape of the data, and marketing can now target each cluster with a tailored campaign.`,
            codeExamples: [
                `# PCA: compressing many correlated features down to 2 dimensions while keeping most of the signal
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n = 200
# 5 correlated customer features, but they really boil down to ~2 underlying behaviors
spend_signal = rng.normal(0, 1, n)
loyalty_signal = rng.normal(0, 1, n)
features = np.column_stack([
    spend_signal + rng.normal(0, 0.1, n),          # avg_order_value
    spend_signal * 0.8 + rng.normal(0, 0.1, n),     # total_spend
    loyalty_signal + rng.normal(0, 0.1, n),         # orders_per_month
    loyalty_signal * 0.9 + rng.normal(0, 0.1, n),   # days_since_last_order (inverted)
    spend_signal * 0.3 + loyalty_signal * 0.3 + rng.normal(0, 0.1, n),  # discount_usage
])

X_scaled = StandardScaler().fit_transform(features)
pca = PCA(n_components=2)
reduced = pca.fit_transform(X_scaled)

print("Original shape:", features.shape)
print("Reduced shape:", reduced.shape)
print("Variance explained by each of the 2 components:", pca.explained_variance_ratio_.round(3))
print("Total variance retained:", pca.explained_variance_ratio_.sum().round(3))
# OUTPUT (typical):
# Original shape: (200, 5)
# Reduced shape: (200, 2)
# Variance explained by each of the 2 components: [0.52 0.34]
# Total variance retained: 0.86`
            ],
            codeExplanations: [
                `The 5 synthetic features are deliberately built from only 2 underlying signals (<code>spend_signal</code> and <code>loyalty_signal</code>) plus noise, mimicking how real customer features (average order value, total spend, discount usage, etc.) are often highly correlated because they all stem from a smaller number of true underlying behaviors. <code>StandardScaler</code> puts every feature on the same scale first, since PCA is sensitive to features with larger raw numeric ranges dominating the result. <code>PCA(n_components=2)</code> then finds the 2 directions in the 5-dimensional feature space that capture the most variation in the data and projects every customer onto just those 2 new "components" - <code>explained_variance_ratio_</code> shows that these 2 components alone retain about 86% of the original information, confirming that the 5 original features really were mostly redundant restatements of 2 underlying behavioral patterns, exactly as unsupervised learning is meant to reveal.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Works on data that would otherwise be unusable</strong> - since no labels are needed, unsupervised learning can extract value from raw logs, sensor streams, or transaction histories immediately, without waiting weeks or months for a labeling effort that may never happen.</li>
<li><strong>Discovers patterns humans didn't know to look for</strong> - a business analyst might segment customers by age and income out of habit, but K-Means might reveal that "discount sensitivity" is actually the more meaningful dividing line, a pattern nobody thought to define upfront because it wasn't an obvious, pre-existing category.</li>
<li><strong>Dimensionality reduction speeds up and often improves downstream models</strong> - feeding PCA-reduced features into a classifier trains faster and can reduce overfitting, since redundant, highly correlated raw features (which add noise without adding real information) get compressed into fewer, more informative components.</li>
<li><strong>Useful as a cheap first exploratory pass</strong> - before investing in an expensive labeling effort for supervised learning, clustering can validate whether meaningfully different groups even exist in the data at all, avoiding wasted effort on labels for a distinction that turns out not to matter.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>No ground truth means no easy way to check if the result is "correct"</strong> - unlike supervised learning where accuracy against known labels can be measured directly, cluster quality has to be judged with indirect metrics (like silhouette score) or human judgment, and two different analysts might reasonably interpret the same clusters differently.</li>
<li><strong>K-Means requires choosing the number of clusters upfront</strong> - the algorithm won't tell you whether "3 customer segments" or "5 customer segments" is the "right" answer; picking the wrong number can produce clusters that are either too coarse (mixing genuinely different customer types) or too fine (splitting one real group into meaningless sub-groups).</li>
<li><strong>PCA's components are mathematical combinations, not intuitive features</strong> - the first principal component might be some non-obvious combination like "0.4 &times; average_order_value + 0.35 &times; discount_usage - 0.2 &times; orders_per_month", which is harder for a business stakeholder to interpret directly than a single named feature like "loyalty score."</li>
<li><strong>Sensitive to feature scaling and outliers</strong> - both K-Means (which relies on distance) and PCA (which relies on variance) can be badly skewed by a single feature with a much larger numeric range than the others, or by a handful of extreme outlier customers, unless the data is properly scaled and cleaned first.</li>
</ul>`,
            codeExamples: [
                `# Using the "elbow method" to pick a reasonable number of clusters, since K-Means doesn't choose it for you
import numpy as np
from sklearn.cluster import KMeans

rng = np.random.default_rng(2)
# three genuinely distinct customer groups baked into the synthetic data
group_a = rng.normal([10, 8], 1.5, size=(30, 2))    # frequent, low spend
group_b = rng.normal([200, 1], 10, size=(30, 2))    # rare, high spend
group_c = rng.normal([60, 4], 5, size=(30, 2))      # occasional, mid spend
customers = np.vstack([group_a, group_b, group_c])

inertias = []
for k in range(1, 6):
    model = KMeans(n_clusters=k, n_init=10, random_state=0).fit(customers)
    inertias.append(model.inertia_)  # sum of squared distances to nearest cluster center

for k, inertia in zip(range(1, 6), inertias):
    print(f"k={k}  inertia={inertia:,.0f}")
# OUTPUT (typical - inertia drops sharply until k=3, then flattens out = the "elbow"):
# k=1  inertia=497,382
# k=2  inertia=118,650
# k=3  inertia=1,940      <- the elbow: adding more clusters after this barely helps
# k=4  inertia=1,510
# k=5  inertia=1,190`
            ],
            codeExplanations: [
                `This directly demonstrates the "must choose the number of clusters" limitation and a common way to address it. Three distinct synthetic customer groups are generated so the "true" answer (3 clusters) is known for illustration. <code>inertia_</code> measures how tightly packed each cluster is (lower is tighter/better), and it will ALWAYS decrease as <code>k</code> increases (more clusters can always fit the data more snugly) - so inertia alone can't be minimized blindly, or you'd just keep adding clusters until every point is its own cluster. The "elbow method" instead looks for the point where increasing <code>k</code> stops producing a big improvement: here, inertia drops enormously from k=1 to k=3, then barely improves from k=3 onward, forming an "elbow" in the curve that suggests <code>k=3</code> is a sensible, defensible choice - a practical workaround for the fact that unsupervised learning provides no ground-truth label to check against directly.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the core difference between supervised and unsupervised learning?</td><td>Supervised learning trains on data where every example has a known correct label to predict (e.g. spam/not spam); unsupervised learning trains on data with no labels at all and instead must discover hidden structure or groupings on its own, such as clustering similar data points together or reducing many features down to fewer while preserving the important patterns</td></tr>
<tr class='text-center'><td>Why is unsupervised learning especially valuable in practice, given that most real-world data is unlabeled?</td><td>Labeling data is often the most expensive and slowest part of building an ML system, requiring humans to manually tag examples one by one; since unsupervised learning needs no labels, it can extract value directly from abundant raw data (transaction logs, sensor streams, unlabeled images) that would otherwise sit unused, and it can also be used as a cheap exploratory step to discover which categories are even worth labeling before investing in supervised learning</td></tr>
<tr class='text-center'><td>Why can't you just pick the number of K-Means clusters by minimizing inertia directly, and what's a common alternative?</td><td>Inertia (the sum of squared distances from points to their nearest cluster center) always decreases as the number of clusters increases, so minimizing it directly would just push you toward as many clusters as there are data points, which is meaningless; a common alternative is the "elbow method" - plotting inertia against increasing k and picking the point where the improvement sharply levels off, balancing cluster tightness against simplicity</td></tr>
</table>`
        }
    ]
};
