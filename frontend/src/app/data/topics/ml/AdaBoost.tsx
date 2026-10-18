import { Topic } from '../../coreJava';

export const adaBoost: Topic = {
    id: 'ml-classification-adaboost',
    name: 'AdaBoost',
    beginner: [
        {
            content: `<h4>Combining Many Weak Guessers Into One Strong Model</h4>
<ul>
<li><strong>AdaBoost</strong> (Adaptive Boosting) was the historically FIRST successful boosting algorithm - it builds an ensemble of many "weak learners" (models barely better than random guessing, often simple one-split Decision Trees called "stumps") and combines them into a single strong classifier.</li>
<li>After each weak learner is trained, AdaBoost <strong>reweights</strong> the training examples - the ones the weak learner got WRONG have their weight increased, so the NEXT weak learner is forced to pay more attention to exactly the mistakes made so far.</li>
<li>The final prediction is a <strong>weighted vote</strong> of every weak learner's prediction - learners that performed better overall get a bigger say in the final vote than learners that performed poorly.</li>
</ul>`,
            codeExamples: [
                `from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

# Weak learner: a "stump" - a Decision Tree with max_depth=1 (a single split)
stump = DecisionTreeClassifier(max_depth=1)
model = AdaBoostClassifier(estimator=stump, n_estimators=100, random_state=0)
model.fit(X_train, y_train)

print(f"Single stump alone accuracy: {stump.fit(X_train, y_train).score(X_test, y_test):.3f}")
print(f"AdaBoost (100 stumps) accuracy: {model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Single stump alone accuracy: 0.888
# AdaBoost (100 stumps) accuracy: 0.972`
            ],
            codeExplanations: [
                `A single decision stump (max_depth=1, one split) is a genuinely "weak" learner - barely better than a coin flip on complex data, here 88.8% accuracy alone. AdaBoostClassifier is given that same weak stump as its base estimator and told to combine 100 of them (n_estimators=100). Internally, AdaBoost trains stump 1, checks which training examples it got wrong, increases those examples' weights, trains stump 2 on the reweighted data (which now cares more about stump 1's mistakes), and repeats 100 times, finally combining all 100 stumps' votes weighted by each one's individual accuracy. The jump from 88.8% (one stump) to 97.2% (100 combined, reweighted stumps) shows the core promise of boosting: many weak learners, each fixing the previous ones' blind spots, can combine into a strong one.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>AdaBoost, introduced in 1995, was the first algorithm to PROVE that boosting - combining many weak learners sequentially - could reliably produce a strong learner, turning "boosting" from a theoretical question ("can weak learners be boosted to strong ones?") into a practical, widely-used technique. It directly paved the way for the entire modern gradient-boosting family (Gradient Boosting, XGBoost, LightGBM, CatBoost).</li>
<li>Its core innovation, which later boosting methods all inherit in some form, is ADAPTIVE reweighting: instead of every weak learner training on the same static dataset (as in bagging/Random Forest), each new learner trains on a dataset where the previous learners' MISTAKES have been given more weight - forcing the ensemble's attention to progressively shift toward its hardest, most error-prone examples.</li>
<li>Because each weak learner only needs to be slightly better than random guessing (>50% accuracy on a binary problem) to help the ensemble, AdaBoost makes it practical to use extremely simple, fast, low-variance base models (stumps) and still reach high overall accuracy through the sheer number and adaptive focus of the ensemble.</li>
</ul>
<h3>Real-World Example: Viola-Jones Face Detection</h3>
The Viola-Jones algorithm (2001), the first face detector fast and accurate enough to run in real time on consumer hardware (famously used in early digital camera "smile detection" and autofocus), is built directly on AdaBoost.
<ul>
<li>Individually, simple rectangular image features (e.g. "is the region around the eyes darker than the region around the nose bridge?") are each only weakly predictive of "is this a face" - each one alone is barely better than a guess.</li>
<li>AdaBoost combines thousands of these weak, simple rectangular-feature classifiers into a cascade: early rounds quickly reject obviously-non-face regions, while later rounds - trained on the reweighted, harder-to-classify borderline regions the earlier weak classifiers struggled with - refine the decision on ambiguous cases.</li>
<li>The result is a strong classifier built entirely out of extremely cheap, simple weak learners, which is precisely why Viola-Jones could run in real time on 2001-era hardware - a feat that would have been computationally infeasible with a single, complex classifier evaluated directly.</li>
</ul>`,
            codeExamples: [
                `# Simulating Viola-Jones-style detection: combining many weak, simple feature-based classifiers
import numpy as np
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Simulate simple "weak" rectangular image features, each only mildly informative about "is this a face"
X, y = make_classification(n_samples=2000, n_features=30, n_informative=5,
                            n_redundant=10, flip_y=0.15, random_state=0)  # noisy, weakly-informative features
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

weak_stump = DecisionTreeClassifier(max_depth=1)
face_detector = AdaBoostClassifier(estimator=weak_stump, n_estimators=200, learning_rate=1.0, random_state=0)
face_detector.fit(X_train, y_train)

single_weak_acc = weak_stump.fit(X_train, y_train).score(X_test, y_test)
ensemble_acc = face_detector.score(X_test, y_test)
print(f"One weak feature-stump accuracy:        {single_weak_acc:.3f}")
print(f"AdaBoost of 200 weak stumps accuracy:    {ensemble_acc:.3f}")
# OUTPUT (typical):
# One weak feature-stump accuracy:        0.717
# AdaBoost of 200 weak stumps accuracy:    0.891`
            ],
            codeExplanations: [
                `flip_y=0.15 and mostly non-informative/redundant features simulate the Viola-Jones setting: each individual simple rectangular feature is only weakly predictive (here, one stump alone reaches just 71.7% accuracy - barely better than a coin flip on a noisy problem). Wrapping 200 such stumps in AdaBoostClassifier and training them sequentially - each new stump focused via reweighting on whatever the ensemble so far still gets wrong - lifts accuracy to 89.1%. This mirrors exactly how Viola-Jones combines thousands of individually weak rectangular-feature tests into a single strong, fast face detector: no single test needs to be good, only "better than random," as long as there are enough of them and each new one targets the previous ensemble's specific mistakes.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Turns weak learners into a strong one with a simple, well-understood mechanism</strong> - the adaptive reweighting rule is simple to explain and implement, yet AdaBoost has a formal guarantee that training error decreases exponentially as more weak learners are added (provided each stays better than random guessing).</li>
<li><strong>Very fast weak learners keep the whole ensemble cheap</strong> - since decision stumps (a single if/else split) are extremely fast to train and evaluate, an AdaBoost ensemble of hundreds of them can still be fast overall, which is exactly what made Viola-Jones practical for real-time face detection on 2001-era hardware.</li>
<li><strong>Few hyperparameters to tune</strong> - mainly n_estimators (how many weak learners) and learning_rate (how much each one's vote counts), making it comparatively simple to configure versus later boosting methods with many more knobs.</li>
<li><strong>Little risk of underfitting</strong> - because more weak learners can always be added to keep chasing remaining mistakes, AdaBoost rarely stops short of fitting the training data's real signal, unlike a single shallow model that structurally cannot represent complex patterns.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Highly sensitive to noisy data and outliers</strong> - a mislabeled or genuinely anomalous training example gets classified WRONG by weak learner after weak learner, so its weight keeps getting increased round after round; eventually the ensemble can start over-focusing on fitting that one noisy point at the expense of the real signal in the rest of the data.</li>
<li><strong>Sequential training, like all boosting</strong> - each weak learner depends on the reweighted output of all previous ones, so training cannot be parallelized across estimators the way Random Forest's independent trees can.</li>
<li><strong>Largely superseded by Gradient Boosting and its optimized descendants</strong> - AdaBoost's reweighting scheme is really a special case of gradient boosting with exponential loss; XGBoost, LightGBM, and CatBoost generalize the same "sequentially correct mistakes" idea with regularization, more flexible loss functions, and far more engineering optimization, and typically outperform plain AdaBoost on modern tabular benchmarks.</li>
<li><strong>Weak learners must be genuinely weak but consistently better than random</strong> - if a base learner is too strong (e.g. an unconstrained deep tree), boosting rounds can overfit very quickly; if a base learner ever performs at or below 50% accuracy (worse than a coin flip on a binary problem), AdaBoost's core weighting math breaks down.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating AdaBoost's sensitivity to a handful of mislabeled (noisy) training examples
import numpy as np
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=10, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

y_train_noisy = y_train.copy()
rng = np.random.default_rng(0)
noisy_idx = rng.choice(len(y_train_noisy), size=int(0.1 * len(y_train_noisy)), replace=False)
y_train_noisy[noisy_idx] = 1 - y_train_noisy[noisy_idx]  # flip 10% of labels - simulated mislabeling

stump = DecisionTreeClassifier(max_depth=1)
clean_model = AdaBoostClassifier(estimator=stump, n_estimators=150, random_state=0).fit(X_train, y_train)
noisy_model = AdaBoostClassifier(estimator=stump, n_estimators=150, random_state=0).fit(X_train, y_train_noisy)

print(f"AdaBoost trained on clean labels:  test accuracy = {clean_model.score(X_test, y_test):.3f}")
print(f"AdaBoost trained on 10%-noisy labels: test accuracy = {noisy_model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# AdaBoost trained on clean labels:  test accuracy = 0.923
# AdaBoost trained on 10%-noisy labels: test accuracy = 0.847`
            ],
            codeExplanations: [
                `10% of training labels are randomly flipped to simulate real-world mislabeling noise. Training identical AdaBoost ensembles on the clean versus noisy labels and comparing test accuracy (evaluated on the same, unmodified, clean test set) shows a clear drop when noise is present (92.3% down to 84.7%). This happens because the mislabeled examples are, by construction, inherently hard to classify correctly (their label contradicts the real pattern), so AdaBoost's reweighting mechanism keeps increasing their weight round after round, as if they were simply "hard but learnable" cases - wasting many of the 150 rounds chasing noise rather than real signal, exactly the outlier-sensitivity limitation described above.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - The Reweighting and Voting Math</h3>
<ul>
<li>Every training example starts with EQUAL weight <code>w&#7522; = 1/N</code>. At each round <code>t</code>, a weak learner is trained on the (weighted) data and its weighted error rate <code>&epsilon;&#7515;</code> is computed.</li>
<li>The learner's VOTE WEIGHT (how much its opinion counts in the final ensemble) is <code>&alpha;&#7515; = 0.5 &middot; ln((1 - &epsilon;&#7515;) / &epsilon;&#7515;)</code> - a learner with low error gets a large positive &alpha; (strong vote), a learner near 50% error gets &alpha; close to 0 (almost no vote), which is exactly why weak learners must stay meaningfully better than random.</li>
<li>Example weights are then updated: correctly-classified examples' weights are multiplied by <code>e&#8315;&#7515;</code> (shrinking), misclassified examples' weights are multiplied by <code>e&#7515;</code> (growing) - then all weights are renormalized to sum to 1. This is the literal mechanism behind "the next learner focuses harder on this round's mistakes."</li>
<li>The final strong classifier's prediction is <code>sign(&Sigma;&#7515; &alpha;&#7515; &middot; h&#7515;(x))</code> - a WEIGHTED VOTE where each weak learner <code>h&#7515;</code> contributes according to its own &alpha;&#7515;, not an equal, unweighted average.</li>
</ul>`,
            codeExamples: [
                `# Manually implementing 3 rounds of AdaBoost's core reweighting/voting math on a tiny example
import numpy as np
from sklearn.tree import DecisionTreeClassifier

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])
y = np.array([1, 1, 1, -1, -1, -1, 1, 1])  # AdaBoost's math traditionally uses +1/-1 labels

n = len(y)
weights = np.full(n, 1 / n)   # start with equal weights
alphas, learners = [], []

for round_num in range(3):
    stump = DecisionTreeClassifier(max_depth=1).fit(X, y, sample_weight=weights)
    preds = stump.predict(X)
    incorrect = (preds != y)
    error = np.sum(weights[incorrect]) / np.sum(weights)
    alpha = 0.5 * np.log((1 - error) / max(error, 1e-10))
    weights = weights * np.exp(-alpha * y * preds)   # grow weight where wrong, shrink where right
    weights = weights / weights.sum()                 # renormalize
    alphas.append(alpha); learners.append(stump)
    print(f"round {round_num+1}: weighted error={error:.3f}  vote weight (alpha)={alpha:.3f}")

final_preds = np.sign(sum(a * l.predict(X) for a, l in zip(alphas, learners)))
print("Final weighted-vote predictions:", final_preds.astype(int))
# OUTPUT (typical):
# round 1: weighted error=0.250  vote weight (alpha)=0.549
# round 2: weighted error=0.167  vote weight (alpha)=0.805
# round 3: weighted error=0.107  vote weight (alpha)=1.061
# Final weighted-vote predictions: [1 1 1 -1 -1 -1 1 1]`
            ],
            codeExplanations: [
                `This hand-codes AdaBoost's exact update rule instead of calling AdaBoostClassifier, to make the math concrete. Each round, a stump is fit using sample_weight=weights (scikit-learn natively supports per-example weights, which is how AdaBoost's reweighting is actually applied under the hood), its weighted error is computed only over the examples it got wrong, and alpha is derived from that error using the formula above - note alpha increases round to round (0.549, 0.805, 1.061) as the weighted error decreases, meaning later, more-accurate-on-the-hard-cases stumps earn a bigger say. The weights update line grows weight on misclassified examples and shrinks it on correct ones via the exponential terms, then renormalizes. The final prediction combines every round's stump prediction weighted by its own alpha and takes the sign - exactly the weighted-vote formula AdaBoost uses internally, correctly recovering the true labels on this small example after just 3 rounds.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does AdaBoost's core reweighting mechanism work?</td><td>Every training example starts with equal weight; after each weak learner is trained, examples it misclassified have their weight INCREASED and examples it got right have their weight DECREASED (then all weights are renormalized), so the next weak learner's training is forced to pay more attention to exactly the mistakes made so far</td></tr>
<tr class='text-center'><td>How does AdaBoost combine its weak learners into a final prediction, and why isn't it a simple average?</td><td>It's a WEIGHTED vote: each weak learner gets a vote weight (alpha) based on how accurate it was (alpha = 0.5*ln((1-error)/error)), so a highly accurate weak learner's vote counts far more than a nearly-random one's; an unweighted average would let a barely-better-than-random learner drag down the ensemble as much as a genuinely good one</td></tr>
<tr class='text-center'><td>Why is AdaBoost particularly sensitive to noisy data or outliers?</td><td>A mislabeled or anomalous example is, almost by definition, hard to classify correctly using the real underlying pattern, so successive weak learners keep getting it wrong and its weight keeps increasing round after round; eventually the ensemble can spend a large fraction of its capacity trying to fit that noisy point specifically, at the expense of learning the genuine signal in the rest of the data</td></tr>
</table>`
        }
    ]
};
