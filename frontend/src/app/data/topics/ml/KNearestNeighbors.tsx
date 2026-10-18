import { Topic } from '../../coreJava';

export const kNearestNeighbors: Topic = {
    id: 'ml-classification-k-nearest-neighbors-knn',
    name: 'K-Nearest Neighbors (KNN)',
    beginner: [
        {
            content: `<h4>Predicting by Looking at Your Closest Neighbors</h4>
<ul>
<li><strong>K-Nearest Neighbors</strong> makes no assumptions about the shape of the data and does no real "training" - it simply stores the entire training set. To classify a new point, it finds the <code>K</code> closest training points (by some distance metric, usually Euclidean) and lets them VOTE - the majority class among those K neighbors becomes the prediction.</li>
<li>This is called a <strong>LAZY / instance-based learner</strong> - all the "work" happens at prediction time (searching for nearest neighbors), not at training time (which is just storing the data).</li>
<li><code>K</code> is the one key hyperparameter: a small K (e.g. 1) makes predictions very sensitive to individual noisy points; a large K smooths predictions out but can blur genuine local structure by pulling in points from a different neighborhood.</li>
</ul>`,
            codeExamples: [
                `from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

scaler = StandardScaler().fit(X_train)
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)

model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train_s, y_train)

print(f"Test accuracy (K=5): {model.score(X_test_s, y_test):.3f}")
sample = X_test_s[0].reshape(1, -1)
distances, indices = model.kneighbors(sample)
print(f"5 nearest neighbors of first test point (distances): {distances.round(2)}")
# OUTPUT (typical):
# Test accuracy (K=5): 0.978
# 5 nearest neighbors of first test point (distances): [[0.14 0.22 0.24 0.27 0.29]]`
            ],
            codeExplanations: [
                `This loads the Iris flower dataset and, critically, standardizes the features with StandardScaler BEFORE fitting KNN - since KNN's predictions depend directly on distance, unscaled features would let whichever column happens to have the largest numeric range dominate every distance calculation. A KNeighborsClassifier with K=5 is then fit (which just stores the scaled training points internally) and scored on the test set. The second part calls <code>model.kneighbors()</code> directly on one test point to show exactly what KNN does under the hood at prediction time: it finds the 5 closest stored training points and reports how far away each one is - those 5 points' labels are what get voted on to produce the prediction.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Many classifiers (like logistic regression) work by assuming the data roughly follows some global shape (e.g. classes separated by a straight-ish boundary) and fitting a small number of parameters to that assumed shape. When the true decision boundary is highly irregular - looping, disconnected regions with no simple formula - a rigid global-shape assumption underfits badly, no matter how the parameters are tuned. KNN sidesteps that problem entirely by making NO assumption about the boundary's shape at all: it just asks "what do similar things near this new point look like?", letting arbitrarily complex, wiggly boundaries emerge naturally from the data's own local density, without any explicit boundary equation ever being fit.
<ul>
<li>The cost of that flexibility is the <strong>Curse of Dimensionality</strong>: in high-dimensional feature spaces, the very notion of "nearest" breaks down. As dimensions increase, the volume of space grows exponentially, so data points become sparse and roughly EQUIDISTANT from each other - the gap between the nearest and farthest neighbor shrinks toward zero relative to the distances involved, so "nearest neighbor" stops being a meaningfully informative signal.</li>
</ul>
<h3>Real-World Example</h3>
A movie streaming platform's "users similar to you also watched..." recommendation feature is a textbook KNN application: each user is represented as a vector of ratings/watch behavior across many titles, and to generate recommendations for a given user, the system finds the K other users whose viewing/rating vectors are closest (most similar taste), then recommends titles those neighbors rated highly that the target user hasn't seen yet. This works well when the feature space is moderate-sized and meaningful (e.g. a curated set of a few hundred genre/actor/rating-behavior features), but breaks down if engineers naively throw in tens of thousands of raw one-hot title-watched features - the curse of dimensionality kicks in, everyone's viewing vector ends up looking roughly equidistant from everyone else's, and "nearest neighbor" recommendations become no better than random. This is exactly why production recommender systems first reduce to a compact, dense set of learned features (e.g. via matrix factorization or embeddings) before ever doing a nearest-neighbor lookup.`,
            codeExamples: [
                `# Demonstrating the curse of dimensionality: nearest/farthest distance ratio collapsing as dimensions grow
import numpy as np

rng = np.random.default_rng(0)

def near_far_ratio(n_dims, n_points=1000):
    X = rng.uniform(0, 1, size=(n_points, n_dims))
    query = rng.uniform(0, 1, size=(1, n_dims))
    dists = np.linalg.norm(X - query, axis=1)
    return dists.min() / dists.max()

for d in [2, 10, 50, 200, 1000]:
    ratio = near_far_ratio(d)
    print(f"dimensions={d:5d}  nearest/farthest distance ratio={ratio:.3f}")
# OUTPUT (typical):
# dimensions=    2  nearest/farthest distance ratio=0.021
# dimensions=   10  nearest/farthest distance ratio=0.208
# dimensions=   50  nearest/farthest distance ratio=0.517
# dimensions=  200  nearest/farthest distance ratio=0.738
# dimensions= 1000  nearest/farthest distance ratio=0.877   <- nearest and farthest neighbor are nearly the same distance!`
            ],
            codeExplanations: [
                `This generates 1,000 random points uniformly inside a unit hypercube of increasing dimensionality, computes the Euclidean distance from a random query point to every one of them, and reports the ratio of the CLOSEST point's distance to the FARTHEST point's distance. In low dimensions (2D) that ratio is tiny - a clear "nearest neighbor" exists, much closer than the far ones. As dimensions climb into the hundreds, the ratio creeps toward 1.0, meaning the nearest and farthest points end up almost the same distance away - there effectively stops being a meaningful "neighborhood" at all, which is the curse of dimensionality made concrete, and exactly why naive high-dimensional KNN recommendation features degrade as engineers described in the recommender-system example above.`
            ]
        },
        {
            content: `<h3>Distance Metrics and Choosing K</h3>
<ul>
<li><strong>Euclidean distance</strong> (<code>sqrt(&sum;(x&#7522;-y&#7522;)&sup2;)</code>) - straight-line distance; the default and most common choice for continuous numeric features.</li>
<li><strong>Manhattan distance</strong> (<code>&sum;|x&#7522;-y&#7522;|</code>) - sums absolute differences per dimension; often preferred in higher-dimensional or grid-like spaces, and less sensitive to outliers in any single dimension than squaring does.</li>
<li><strong>Cosine similarity</strong> - measures the ANGLE between two vectors rather than their magnitude; standard for text/recommendation data where what matters is the PATTERN of preferences/word-usage, not the raw scale (e.g. a user who rated 5 movies 5-star and one who rated 500 movies 5-star can still have identical "taste direction").</li>
<li><strong>Choosing K</strong> - small K (e.g. K=1) fits training data almost perfectly but is highly sensitive to mislabeled or noisy points nearby (high variance); large K smooths decisions by pooling more neighbors' votes but can wash out real local structure and start pulling in points from a genuinely different class's region (high bias). K is typically chosen via cross-validation, and an ODD K is preferred for binary classification to avoid tie votes.</li>
</ul>`,
            codeExamples: [
                `# Choosing K via cross-validation - watching the classic bias-variance curve for KNN
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)
X = StandardScaler().fit_transform(X)  # essential before any distance-based model

for k in [1, 3, 5, 11, 25, 51]:
    scores = cross_val_score(KNeighborsClassifier(n_neighbors=k), X, y, cv=5)
    print(f"K={k:3d}  mean CV accuracy={scores.mean():.3f}")
# OUTPUT (typical):
# K=  1  mean CV accuracy=0.955   <- fits training noise closely, still decent here
# K=  3  mean CV accuracy=0.972
# K=  5  mean CV accuracy=0.978   <- sweet spot
# K= 11  mean CV accuracy=0.972
# K= 25  mean CV accuracy=0.933
# K= 51  mean CV accuracy=0.815   <- too smoothed out, starts pulling in wrong-class votes`
            ],
            codeExplanations: [
                `The Wine dataset's features are scaled first (as always for a distance-based model), then a loop runs 5-fold cross-validated KNN across a range of K values from 1 to 51 and prints the mean accuracy for each. The pattern printed shows the classic KNN bias-variance curve directly: accuracy rises as K grows from 1 (too noisy/high-variance) to a middle sweet spot around K=5, then falls off again as K keeps growing past that point, because at K=51 with only ~178 total wine samples the neighborhood is so large it starts averaging in genuinely different classes' votes (high bias/underfitting) - this sweep is exactly the process used to pick K in practice, rather than guessing.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Simple, intuitive, and makes no assumption about data shape</strong> - unlike logistic regression's implicit linear-boundary assumption, KNN can represent arbitrarily complex, disconnected decision regions, since the boundary just emerges from wherever the local neighbor votes flip - useful for genuinely irregular real-world class boundaries.</li>
<li><strong>Naturally handles multi-class problems</strong> - the majority-vote mechanism extends to any number of classes with zero modification, unlike SVM which needs one-vs-rest tricks for more than 2 classes.</li>
<li><strong>Zero training cost</strong> - "fitting" a KNN model is just storing the data, which is useful when new labeled data arrives constantly (e.g. new user ratings) and needs to be incorporated without a costly retraining step.</li>
<li><strong>Easy to reason about individual predictions</strong> - because a prediction is literally "these K specific training examples were closest, and here's how they voted," it is trivial to show a human exactly WHY a prediction was made (e.g. "we recommended this movie because these 5 similar users all rated it highly"), which is valuable for user-facing recommendation explanations.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Prediction is slow on large datasets</strong> - a naive KNN search compares a new point against every stored training point (<code>O(n)</code> per prediction), which becomes a real bottleneck for a streaming service with tens of millions of users - production systems need approximate-nearest-neighbor indexes (e.g. KD-trees, ball trees, or ANN libraries like FAISS) to stay fast.</li>
<li><strong>Degrades badly in high dimensions (the curse of dimensionality)</strong> - as demonstrated above, once feature counts climb into the hundreds, nearest and farthest points become nearly equidistant, and "nearest neighbor" stops carrying real signal, which is exactly why raw high-dimensional recommendation features need dimensionality reduction first.</li>
<li><strong>Extremely sensitive to feature scaling</strong> - since predictions are driven entirely by distance, a single unscaled large-range feature can dominate the distance calculation and silently make the other features irrelevant, exactly as with SVM.</li>
<li><strong>Memory-heavy</strong> - the entire training set must be kept in memory (or a fast-lookup index built over it) for prediction, unlike a linear model that reduces training data down to a handful of learned coefficients.</li>
<li><strong>Sensitive to irrelevant features and class imbalance</strong> - an uninformative feature still contributes equally to the distance calculation, diluting the informative features' signal; and with imbalanced classes, a query point's K nearest neighbors can be dominated by the majority class purely by base-rate chance, even when the true nearest same-class neighbor is only slightly farther away.</li>
</ul>`,
            codeExamples: [
                `# Curse of dimensionality's real effect on accuracy - adding noisy, irrelevant features degrades KNN
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_classification
import numpy as np

rng = np.random.default_rng(0)
X, y = make_classification(n_samples=400, n_features=10, n_informative=10,
                            n_redundant=0, random_state=0)

for n_noise in [0, 20, 100, 500]:
    noise = rng.normal(0, 1, size=(400, n_noise))
    X_aug = np.hstack([X, noise]) if n_noise else X
    scores = cross_val_score(KNeighborsClassifier(n_neighbors=5), X_aug, y, cv=5)
    print(f"noise features added={n_noise:4d}  (total dims={X_aug.shape[1]:4d})  mean CV accuracy={scores.mean():.3f}")
# OUTPUT (typical):
# noise features added=   0  (total dims=  10)  mean CV accuracy=0.938
# noise features added=  20  (total dims=  30)  mean CV accuracy=0.878
# noise features added= 100  (total dims= 110)  mean CV accuracy=0.798
# noise features added= 500  (total dims= 510)  mean CV accuracy=0.705`
            ],
            codeExplanations: [
                `Starting from a dataset where all 10 features are genuinely informative, this progressively appends purely RANDOM noise columns (which carry zero real signal) and re-evaluates 5-fold cross-validated KNN accuracy each time. Because Euclidean distance treats every dimension equally, adding more and more irrelevant noise dimensions increasingly drowns out the real signal from the 10 informative features in the overall distance calculation, and accuracy drops steadily as the noise-feature count grows - a direct, measurable demonstration of why KNN needs careful feature selection or dimensionality reduction before use, unlike tree-based models which can simply ignore uninformative features by never splitting on them.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is KNN called a "lazy learner", and what tradeoff does that create?</td><td>KNN does no real work at training time - it just stores the training data - and defers all computation to prediction time, where it must search for the K nearest stored points; this makes "training" essentially free but makes every single prediction relatively expensive (naively O(n) per query), the opposite tradeoff of a model like logistic regression which does heavy work upfront and predicts cheaply</td></tr>
<tr class='text-center'><td>Why is feature scaling essential for KNN specifically, more so than for a Decision Tree?</td><td>KNN predictions are driven directly by distance calculations across all features simultaneously, so a feature on a much larger numeric scale will dominate the distance and effectively drown out other features regardless of their real predictive value; a Decision Tree instead splits on one feature's threshold at a time based only on value ORDER, so absolute scale never matters to it</td></tr>
<tr class='text-center'><td>What is the curse of dimensionality, and how does it specifically hurt KNN?</td><td>As the number of features grows, data points become increasingly sparse and roughly equidistant from each other in that space, so the gap between a point's nearest and farthest neighbor shrinks toward zero in relative terms; since KNN's entire prediction mechanism depends on there being a meaningfully "closer" set of neighbors, once that gap collapses in high dimensions, nearest-neighbor lookups stop carrying reliable signal and accuracy degrades</td></tr>
</table>`
        }
    ]
};
