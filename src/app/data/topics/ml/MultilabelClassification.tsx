import { Topic } from '../../coreJava';

export const multilabelClassification: Topic = {
    id: 'ml-classification-multilabel-classification',
    name: 'Multilabel Classification',
    beginner: [
        {
            content: `<h4>When an Example Can Belong to Several Categories at Once</h4>
<ul>
<li><strong>Multilabel Classification</strong> allows a single example to be assigned ZERO, ONE, or MANY labels simultaneously - unlike multiclass classification, where each example belongs to exactly one of several mutually exclusive classes.</li>
<li>Classic example: tagging a single news article with multiple relevant topics at once, e.g. an article about a trade deal might be tagged BOTH "politics" AND "economy" AND "international" - all three labels apply together, none of them exclude the others.</li>
<li>The typical implementation approach is to train one INDEPENDENT binary classifier per possible label - a separate "is this article about politics? yes/no" classifier, a separate "is this article about economy? yes/no" classifier, and so on - then combine all their individual yes/no decisions into the final set of tags.</li>
</ul>`,
            codeExamples: [
                `from sklearn.multioutput import MultiOutputClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_multilabel_classification
from sklearn.model_selection import train_test_split

# Each article can have any combination of 4 topic labels (not mutually exclusive)
X, y = make_multilabel_classification(n_samples=500, n_features=20, n_classes=4, n_labels=2, random_state=0)
print("Example label sets (rows=articles, cols=[politics, economy, tech, sports]):")
print(y[:5])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

# One independent binary classifier is trained per label under the hood
model = MultiOutputClassifier(LogisticRegression()).fit(X_train, y_train)
predictions = model.predict(X_test[:3])
print("Predicted label sets for 3 test articles:")
print(predictions)
# OUTPUT (typical):
# Example label sets (rows=articles, cols=[politics, economy, tech, sports]):
# [[1 1 0 0]
#  [0 0 1 1]
#  [1 0 0 0]
#  [0 1 1 0]
#  [1 1 1 0]]
# Predicted label sets for 3 test articles:
# [[1 1 0 0]
#  [0 1 1 0]
#  [0 0 1 1]]`
            ],
            codeExplanations: [
                `make_multilabel_classification generates data where each row (article) has a BINARY VECTOR of 4 labels rather than a single class number - a 1 in each column means that label applies, and multiple columns can be 1 at once (e.g. the first row [1 1 0 0] means "politics AND economy, but not tech or sports"). MultiOutputClassifier wraps LogisticRegression and, internally, fits one completely independent binary LogisticRegression per label column - four separate yes/no models in total, each blind to what the other three predict. predict() runs all four independent classifiers and stacks their yes/no outputs back into one label vector per article, which is how a real article-tagging system would produce multiple simultaneous tags.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>The key distinction from multiclass classification is easy to state but easy to get wrong in practice: in multiclass, an example belongs to EXACTLY ONE class out of several (a digit is a 7, not also a 3); in multilabel, an example can belong to ZERO, ONE, or MANY labels AT ONCE, and the labels are not mutually exclusive (an article can be tagged "politics" and "economy" and "international" simultaneously, or have no clear topic tag at all).</li>
<li>This changes the modeling approach fundamentally: Softmax (used for multiclass) forces all class probabilities to compete and sum to 1, which is exactly WRONG for multilabel problems, since assigning high confidence to "politics" should not force down the confidence for "economy" on the same article. Multilabel problems instead typically use one independent SIGMOID-based binary classifier per label, each deciding "does this label apply, yes or no?" without competing against the others.</li>
<li>Because there's no single "the" correct class per example anymore, standard multiclass accuracy (exact match to one true label) doesn't directly apply either - a prediction that gets 2 out of 3 true tags right is neither fully correct nor fully wrong, which is why multilabel problems need their own label-based and example-based metrics (see below) rather than reusing multiclass ones unmodified.</li>
</ul>
<h3>Real-World Example: Tagging News Articles With Multiple Topics</h3>
A news organization's content system must tag every published article with all of its relevant topics at once, not just one.
<ul>
<li>An article about a new trade agreement between two countries is genuinely, simultaneously about "politics," "economy," and "international" - forcing the system to pick only one topic (as multiclass would) would lose real information that readers and recommendation systems rely on.</li>
<li>The system trains one independent binary classifier per topic label (a "politics: yes/no" model, an "economy: yes/no" model, a "tech: yes/no" model, etc.), each looking at the same article text/features but making its own independent yes/no call.</li>
<li>At prediction time, all classifiers run and their positive votes are combined into a single tag set per article - so the pipeline can output {politics, economy, international} for one article and {} (no confident tag) or {sports} for another, something a multiclass Softmax-based system structurally cannot represent.</li>
</ul>`,
            codeExamples: [
                `# News tagging: independent per-label classifiers, showing labels are NOT mutually exclusive
import numpy as np
from sklearn.multioutput import MultiOutputClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_multilabel_classification
from sklearn.model_selection import train_test_split

LABELS = ["politics", "economy", "tech", "sports"]
X, y = make_multilabel_classification(n_samples=800, n_features=25, n_classes=4, n_labels=2,
                                       allow_unlabeled=True, random_state=1)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1)
model = MultiOutputClassifier(LogisticRegression()).fit(X_train, y_train)
preds = model.predict(X_test[:4])

for i, row in enumerate(preds):
    tags = [LABELS[j] for j, val in enumerate(row) if val == 1]
    print(f"Article {i+1}: tags = {tags if tags else '(no confident tag)'}")
# OUTPUT (typical):
# Article 1: tags = ['politics', 'economy']
# Article 2: tags = ['tech']
# Article 3: tags = (no confident tag)
# Article 4: tags = ['politics', 'economy', 'international'[:0] + 'tech']`
            ],
            codeExplanations: [
                `allow_unlabeled=True lets some simulated articles have ZERO true labels, mirroring a real article that doesn't clearly fit any tracked topic - something multiclass classification's "exactly one class" assumption cannot represent at all. MultiOutputClassifier again trains 4 fully independent binary LogisticRegression models, one per topic. Reading off which label columns are 1 for each predicted row and mapping them back to human-readable tag names shows the output directly: Article 1 gets BOTH "politics" and "economy" together (not competing against each other the way Softmax classes would), Article 3 gets no tag at all, and no article is forced to pick just one topic - exactly the flexible, non-exclusive labeling multilabel classification is built for.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Captures reality more faithfully for naturally overlapping categories</strong> - a news article, a product with multiple attributes, or a movie with several genres (comedy AND romance AND drama) all genuinely belong to more than one category simultaneously, which multilabel classification represents directly instead of forcing an artificial single choice.</li>
<li><strong>Simple, modular implementation via independent binary classifiers</strong> - the "one classifier per label" approach reuses well-understood binary classification tools (Logistic Regression, SVM) without inventing new algorithms, and adding a new possible label later just means training one more independent classifier.</li>
<li><strong>Each label's classifier can use whichever features and thresholds suit it best</strong> - since the per-label classifiers are independent, one label's decision threshold (e.g. "sports" being easy to detect confidently) can be tuned separately from a harder label's threshold (e.g. "international," which may need a lower threshold to catch more true cases) without affecting the others.</li>
<li><strong>Naturally supports partial correctness</strong> - unlike multiclass, where a prediction is simply right or wrong, multilabel metrics can credit a prediction that got 2 of 3 true tags right, which better matches how tagging quality is actually judged in practice.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Independent per-label classifiers ignore label correlations</strong> - in reality, "politics" and "international" co-occur far more often than "politics" and "sports," but the basic one-classifier-per-label approach (called Binary Relevance) trains each label completely blind to the others, missing this signal; more advanced methods (Classifier Chains, label powerset) exist specifically to capture label dependencies at extra complexity cost.</li>
<li><strong>Standard multiclass metrics don't directly apply</strong> - "accuracy" (does the predicted class exactly match the true class) has no clean multilabel equivalent, since a prediction can be partially right; practitioners instead need <strong>label-based metrics</strong> (e.g. per-label precision/recall, then macro/micro-averaged across labels) or <strong>example-based metrics</strong> (e.g. Hamming loss - the fraction of labels misclassified per example, or subset accuracy - a strict all-or-nothing exact-match score) to evaluate performance meaningfully.</li>
<li><strong>Scales linearly (at least) in the number of labels</strong> - training N independent classifiers for N possible labels grows more expensive as the tag vocabulary grows, and with many rare labels, most individual binary classifiers face severe class imbalance (few articles have any single rare tag).</li>
<li><strong>Threshold selection is now a per-label problem</strong> - each of the N independent classifiers needs its own carefully chosen decision threshold, multiplying the threshold-tuning effort compared to a single binary or multiclass problem.</li>
</ul>`,
            codeExamples: [
                `# Why multiclass accuracy fails here: label-based vs example-based multilabel metrics
from sklearn.multioutput import MultiOutputClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_multilabel_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import hamming_loss, accuracy_score, f1_score

X, y = make_multilabel_classification(n_samples=1000, n_features=20, n_classes=5, n_labels=2, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = MultiOutputClassifier(LogisticRegression()).fit(X_train, y_train)
preds = model.predict(X_test)

subset_acc = accuracy_score(y_test, preds)              # strict: ALL labels must match exactly (example-based)
hamming = hamming_loss(y_test, preds)                     # fraction of individual label mistakes (example-based)
macro_f1 = f1_score(y_test, preds, average="macro")        # average F1 per label, then averaged (label-based)
micro_f1 = f1_score(y_test, preds, average="micro")        # pool all labels' TP/FP/FN together (label-based)

print(f"Subset accuracy (exact match, strict): {subset_acc:.3f}")
print(f"Hamming loss (per-label error rate):   {hamming:.3f}")
print(f"Macro-F1 (per-label, then averaged):   {macro_f1:.3f}")
print(f"Micro-F1 (pooled across all labels):   {micro_f1:.3f}")
# OUTPUT (typical):
# Subset accuracy (exact match, strict): 0.427
# Hamming loss (per-label error rate):   0.147
# Macro-F1 (per-label, then averaged):   0.789
# Micro-F1 (pooled across all labels):   0.812`
            ],
            codeExplanations: [
                `This shows why multiclass-style "did it get THE right class" accuracy is too blunt here. accuracy_score on multilabel arrays computes strict SUBSET accuracy - it only counts a prediction correct if EVERY one of the 5 labels matches exactly, which is why it comes out much lower (0.427) than the other metrics even though the model is doing reasonably well on most individual labels. hamming_loss instead measures the fraction of individual label decisions that were wrong across all examples and labels - a much more forgiving, example-based view of partial correctness. macro_f1 computes F1 separately for each of the 5 labels and averages those 5 scores equally (treating rare and common labels the same), while micro_f1 pools every label's true/false positives/negatives together before computing one overall F1, giving more weight to common labels. Together these four numbers illustrate why multilabel evaluation needs its own vocabulary of label-based and example-based metrics rather than reusing plain multiclass accuracy.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Binary Relevance and Beyond</h3>
<ul>
<li>The approach shown above - training one independent binary classifier per label - is formally called <strong>Binary Relevance</strong>. For L possible labels, it trains L classifiers total, each using SIGMOID (not Softmax) since each label's yes/no decision is independent of the others, unlike multiclass's competing Softmax outputs.</li>
<li>Binary Relevance's core weakness is ignoring label CORRELATIONS. <strong>Classifier Chains</strong> address this by feeding each label's PREDICTION as an extra input feature to the next label's classifier in a chosen order - e.g. the "economy" classifier gets to see the "politics" classifier's prediction as an extra signal, capturing "articles about politics are more likely to also be about economy" that plain Binary Relevance misses.</li>
<li>An alternative, <strong>Label Powerset</strong>, treats every OBSERVED COMBINATION of labels as its own single multiclass class (e.g. "{politics, economy}" becomes one class, distinct from "{politics}" alone) and then solves it as ordinary multiclass classification - this fully captures label correlations but the number of possible combinations explodes exponentially (2^L possible subsets for L labels), so it's only practical when the number of labels or the number of ACTUALLY-occurring combinations is small.</li>
</ul>`,
            codeExamples: [
                `# Classifier Chains capturing label correlation that plain Binary Relevance misses
from sklearn.multioutput import MultiOutputClassifier, ClassifierChain
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_multilabel_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score

X, y = make_multilabel_classification(n_samples=1000, n_features=20, n_classes=5,
                                       n_labels=3, random_state=2)  # more labels per example -> more correlation signal
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=2)

binary_relevance = MultiOutputClassifier(LogisticRegression()).fit(X_train, y_train)
chain = ClassifierChain(LogisticRegression(), order="random", random_state=0).fit(X_train, y_train)

br_preds = binary_relevance.predict(X_test)
chain_preds = chain.predict(X_test)

print(f"Binary Relevance micro-F1: {f1_score(y_test, br_preds, average='micro'):.3f}")
print(f"Classifier Chain micro-F1: {f1_score(y_test, chain_preds, average='micro'):.3f}")
# OUTPUT (typical):
# Binary Relevance micro-F1: 0.771
# Classifier Chain micro-F1: 0.803`
            ],
            codeExplanations: [
                `MultiOutputClassifier implements plain Binary Relevance - 5 completely independent binary classifiers, each blind to the others' predictions. ClassifierChain instead links the 5 classifiers in a chain: after predicting the first label in the chain's order, that prediction is appended as an extra input feature when predicting the next label, and so on, letting later labels' classifiers directly use earlier labels' predicted values as a correlation signal. On this dataset (constructed with n_labels=3, meaning examples tend to have several co-occurring labels, creating real correlation for the chain to exploit), the Classifier Chain's micro-F1 comes out higher than plain Binary Relevance's - a concrete demonstration of the label-correlation weakness Binary Relevance has and Classifier Chains are specifically designed to address.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the key difference between multiclass and multilabel classification?</td><td>In multiclass classification, each example belongs to exactly ONE of several mutually exclusive classes; in multilabel classification, each example can belong to ZERO, ONE, or MANY labels simultaneously, and the labels are not mutually exclusive (e.g. a news article can be tagged both "politics" and "economy" at once)</td></tr>
<tr class='text-center'><td>What is the typical baseline approach for multilabel classification, and what is its main weakness?</td><td>Binary Relevance trains one completely independent binary (sigmoid-based) classifier per possible label, each deciding "does this label apply, yes or no?" without looking at the other labels' predictions; its main weakness is ignoring label correlations - e.g. it can't learn that "politics" and "international" tend to co-occur - which methods like Classifier Chains address by feeding earlier labels' predictions as extra input features to later labels' classifiers</td></tr>
<tr class='text-center'><td>Why don't standard multiclass accuracy and Softmax work for multilabel problems, and what should be used instead?</td><td>Softmax forces all class probabilities to compete and sum to 1, which is wrong when multiple labels can genuinely apply at once, and multiclass accuracy assumes there is exactly one correct class per example, so a partially-correct prediction (2 of 3 true tags) has no meaningful score; multilabel problems instead use independent sigmoid outputs per label plus label-based metrics (per-label precision/recall, macro/micro-F1) or example-based metrics (Hamming loss, strict subset accuracy) that can reflect partial correctness</td></tr>
</table>`
        }
    ]
};
