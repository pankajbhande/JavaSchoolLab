import { Topic } from '../../coreJava';

export const semiSupervisedLearning: Topic = {
    id: 'ml-fundamentals-semi-supervised-learning',
    name: 'Semi-Supervised Learning',
    beginner: [
        {
            content: `<h4>A Little Labeled Data, A Lot of Unlabeled Data</h4>
<ul>
<li><strong>Semi-Supervised Learning</strong> sits between supervised and unsupervised learning: the model trains on a SMALL amount of LABELED data plus a LARGE amount of UNLABELED data, combining both to learn better than it could from the small labeled set alone.</li>
<li>This matters because, in the real world, getting labels is expensive and slow (it usually needs a human expert to manually tag each example), while collecting raw, unlabeled data is often cheap and abundant (it just needs to be gathered, not reviewed).</li>
<li>The core idea behind many semi-supervised techniques is <strong>self-training</strong>: train an initial model on the small labeled set, use it to make predictions on the unlabeled data, treat its MOST CONFIDENT predictions as "pseudo-labels" (trusted as if they were real labels), add those to the training set, and retrain - repeating this to gradually make use of the unlabeled data.</li>
</ul>`,
            codeExamples: [
                `# Self-training: bootstrapping from a small labeled set using a model's own confident predictions
import numpy as np
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification

X, y_true = make_classification(n_samples=300, n_features=4, random_state=0)

# Simulate reality: only 20 of the 300 examples actually have labels; the rest are unlabeled
y = np.copy(y_true)
rng = np.random.default_rng(0)
unlabeled_idx = rng.choice(300, size=280, replace=False)
y[unlabeled_idx] = -1  # scikit-learn's convention: -1 means "no label"

base_model = LogisticRegression()
self_training_model = SelfTrainingClassifier(base_model, threshold=0.8)
self_training_model.fit(X, y)

print("Labeled examples used to start:", 300 - len(unlabeled_idx))
print("Pseudo-labels the model assigned itself:", (self_training_model.transduction_ != -1).sum() - 20)
print("Final training accuracy vs true labels:", (self_training_model.predict(X) == y_true).mean())
# OUTPUT (typical):
# Labeled examples used to start: 20
# Pseudo-labels the model assigned itself: 245
# Final training accuracy vs true labels: 0.947`
            ],
            codeExplanations: [
                `<code>make_classification</code> creates a fully labeled synthetic dataset, and then most of those labels are deliberately erased (set to <code>-1</code>, scikit-learn's "unlabeled" marker) to simulate the realistic situation of having only 20 labeled examples out of 300 total. <code>SelfTrainingClassifier</code> wraps a normal <code>LogisticRegression</code> model: it first trains only on the 20 labeled examples, then predicts on the 280 unlabeled ones, keeps only the predictions it is at least 80% confident about (<code>threshold=0.8</code>) as trustworthy "pseudo-labels," adds those to the labeled set, and repeats this process - progressively expanding how much data it trains on without ever needing a human to label anything beyond the original 20. The final accuracy check against the TRUE labels (which the model never directly saw for most examples) shows the model ends up performing far better than a model trained on just 20 labeled points alone would.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Labeling data is frequently the single biggest bottleneck in building a machine learning system, and the cost asymmetry between labeled and unlabeled data is often extreme.
<ul>
<li><strong>Labeling requires scarce expertise and time that raw data collection doesn't.</strong> A radiologist manually reviewing and labeling a single X-ray as "shows a tumor" or "healthy" might take several minutes of focused expert attention - multiplied across thousands of images, that's weeks of a highly paid specialist's time. Meanwhile, the HOSPITAL'S IMAGING SYSTEM already generates raw, unlabeled X-rays continuously just from normal patient care, at essentially zero additional cost.</li>
<li><strong>Throwing away the unlabeled data wastes real signal.</strong> Even without labels, the SHAPE of the unlabeled data - how the images cluster, which ones look similar to each other, where the natural groupings and boundaries fall - carries useful information about the underlying structure of the problem. Purely supervised learning ignores all of this and learns only from the tiny labeled slice, throwing away information that's sitting right there for free.</li>
<li><strong>It's a practical middle ground, not a compromise for its own sake.</strong> Fully unsupervised learning can find structure but can't tell you what a cluster actually MEANS (is this the "tumor" cluster or the "healthy" cluster?) without any labels at all; fully supervised learning needs more labels than are affordable. Semi-supervised learning uses the few labels available to anchor the MEANING of the patterns that the abundant unlabeled data reveals.</li>
</ul>
<h3>Real-World Example: A Medical Imaging Startup</h3>
A startup building an X-ray tumor-detection model has only <strong>500 labeled X-rays</strong> (reviewed and confirmed by a radiologist) but <strong>50,000 unlabeled X-rays</strong> sitting in partner hospitals' archives, collected over years of routine care. Training on just the 500 labeled images alone would likely overfit badly and miss rare presentation patterns. A semi-supervised approach trains an initial model on the 500 labeled images, then runs it across the 50,000 unlabeled ones, keeping only the predictions it is highly confident about as pseudo-labels, and folding those back into training - letting the startup benefit from nearly 100x more data than it could afford to have a radiologist manually review, without waiting months (or spending a fortune) for full manual labeling.`,
            codeExamples: [
                `# Comparing supervised-only (20 labels) vs semi-supervised (20 labels + 280 unlabeled) on the same data
import numpy as np
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y_true = make_classification(n_samples=500, n_features=6, n_informative=4,
                                  class_sep=0.9, random_state=1)
X_train, X_test, y_train_true, y_test = train_test_split(X, y_true, test_size=0.3, random_state=1)

rng = np.random.default_rng(1)
y_train_partial = np.copy(y_train_true)
unlabeled_idx = rng.choice(len(y_train_partial), size=len(y_train_partial) - 20, replace=False)
y_train_partial[unlabeled_idx] = -1  # only 20 examples keep their real label

# Approach 1: supervised-only, trained on JUST the 20 labeled examples
labeled_mask = y_train_partial != -1
supervised_only = LogisticRegression().fit(X_train[labeled_mask], y_train_partial[labeled_mask])

# Approach 2: semi-supervised, using the 20 labels PLUS the remaining unlabeled examples
semi_supervised = SelfTrainingClassifier(LogisticRegression(), threshold=0.75).fit(X_train, y_train_partial)

print(f"Supervised-only (20 labels) test accuracy:      {supervised_only.score(X_test, y_test):.3f}")
print(f"Semi-supervised (20 labels + unlabeled) accuracy: {semi_supervised.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Supervised-only (20 labels) test accuracy:      0.807
# Semi-supervised (20 labels + unlabeled) accuracy: 0.873`
            ],
            codeExplanations: [
                `Both models start from the exact same 20 labeled training examples, isolating the effect of the unlabeled data. <code>supervised_only</code> is a plain <code>LogisticRegression</code> trained ONLY on the labeled 20, completely ignoring the other 330 unlabeled training rows - representing what a team with only a small labeling budget would be stuck with under a purely supervised approach. <code>semi_supervised</code> uses <code>SelfTrainingClassifier</code> with the SAME base model, but is given the full training set including the <code>-1</code>-marked unlabeled rows, letting it iteratively expand its effective training set via confident self-labeling. Comparing test accuracy on data neither model was trained on shows the semi-supervised approach outperforming the supervised-only one, concretely demonstrating the value of not throwing away the unlabeled majority of the data.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Dramatically reduces the amount of expensive manual labeling needed</strong> - a model can approach the performance of a fully labeled dataset while only requiring a small fraction of it to actually be reviewed by a human expert, directly cutting the cost and time of the most expensive part of the ML pipeline.</li>
<li><strong>Makes use of abundant "free" data that would otherwise be wasted</strong> - unlabeled data that already exists (server logs, scanned documents, routine medical images, unannotated customer reviews) can be put to work instead of sitting idle simply because nobody labeled it.</li>
<li><strong>Often improves generalization over a small labeled set alone</strong> - the added unlabeled data helps the model learn the true shape and boundaries of the underlying data distribution, rather than overfitting to whatever narrow pattern happened to be present in just the tiny labeled sample.</li>
<li><strong>Scales naturally as more unlabeled data arrives</strong> - since new unlabeled data doesn't need review before being useful, a semi-supervised pipeline can keep improving simply by feeding it more raw data over time, without a matching increase in labeling effort.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Errors in pseudo-labels can compound</strong> - if the initial model (trained on very little labeled data) is confidently WRONG about some unlabeled examples, those incorrect pseudo-labels get folded back into training as if they were true, reinforcing the mistake rather than correcting it; this is sometimes called "confirmation bias" in self-training.</li>
<li><strong>Still highly sensitive to how representative the small labeled set is</strong> - if the 500 labeled X-rays happen to miss a rare but important tumor presentation entirely, the model has no ground-truth signal to ever learn that pattern correctly, no matter how much unlabeled data is added.</li>
<li><strong>Requires careful tuning of the confidence threshold</strong> - too low a threshold lets in many incorrect pseudo-labels (compounding errors, as above); too high a threshold means almost no unlabeled data actually gets used, largely defeating the purpose.</li>
<li><strong>Assumes the unlabeled data's structure is actually informative for the task</strong> - semi-supervised methods work best when data naturally clusters along the same boundaries as the true labels (e.g. tumor vs. healthy X-rays really do look visually distinct); if the labels don't correspond to any natural structure in the raw data, the unlabeled data provides little to no benefit.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating the risk: a low confidence threshold lets bad pseudo-labels poison training
import numpy as np
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y_true = make_classification(n_samples=400, n_features=5, class_sep=0.6, random_state=3)
X_train, X_test, y_train_true, y_test = train_test_split(X, y_true, test_size=0.3, random_state=3)

rng = np.random.default_rng(3)
y_train_partial = np.copy(y_train_true)
unlabeled_idx = rng.choice(len(y_train_partial), size=len(y_train_partial) - 15, replace=False)
y_train_partial[unlabeled_idx] = -1  # only 15 labeled examples - a very small, noisy starting point

for threshold in [0.55, 0.95]:
    model = SelfTrainingClassifier(LogisticRegression(), threshold=threshold).fit(X_train, y_train_partial)
    print(f"threshold={threshold}  test_accuracy={model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# threshold=0.55  test_accuracy=0.708   <- low bar lets in many wrong pseudo-labels, hurting the model
# threshold=0.95  test_accuracy=0.850   <- only very confident pseudo-labels accepted, much cleaner result`
            ],
            codeExplanations: [
                `This starts from a deliberately small (15-example) and noisy (<code>class_sep=0.6</code>, meaning the two classes overlap more) labeled set, making the initial model's early predictions less reliable. Running <code>SelfTrainingClassifier</code> twice with different <code>threshold</code> values isolates the effect of the confidence bar for accepting pseudo-labels: at <code>threshold=0.55</code>, the model accepts pseudo-labels it is barely more than a coin-flip confident about, so many WRONG guesses get folded back into training as if they were correct, dragging down final accuracy. At <code>threshold=0.95</code>, only pseudo-labels the model is very sure about get accepted, resulting in fewer but more trustworthy additions to the training set and a noticeably better final result - a concrete illustration of why the confidence threshold is a critical, non-trivial tuning knob rather than an implementation detail.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does semi-supervised learning differ from both supervised and unsupervised learning?</td><td>Supervised learning needs every training example labeled; unsupervised learning needs no labels at all and only finds structure; semi-supervised learning trains on a small amount of labeled data combined with a much larger amount of unlabeled data, using the few labels to anchor meaning while the abundant unlabeled data helps the model learn the true shape of the underlying distribution</td></tr>
<tr class='text-center'><td>Explain self-training (pseudo-labeling) as used in semi-supervised learning.</td><td>Train an initial model on the small labeled dataset, use that model to predict labels for the unlabeled data, keep only the predictions the model is highly confident about and treat them as trusted "pseudo-labels," add those to the training set, and retrain - repeating this process to progressively make use of more of the unlabeled data without any additional human labeling</td></tr>
<tr class='text-center'><td>What is the main risk of self-training, and how is it usually mitigated?</td><td>If the initial model (trained on very little labeled data) is confidently wrong about some unlabeled examples, those incorrect pseudo-labels get added to training as if correct, reinforcing the mistake in later rounds (compounding error / confirmation bias); this is mitigated by setting a high confidence threshold so only pseudo-labels the model is very sure about get accepted, trading off how much unlabeled data gets used against how trustworthy the additions are</td></tr>
</table>`
        }
    ]
};
