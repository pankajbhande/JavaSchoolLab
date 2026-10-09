import { Topic } from '../../coreJava';

export const naiveBayes: Topic = {
    id: 'ml-classification-naive-bayes',
    name: 'Naive Bayes',
    beginner: [
        {
            content: `<h4>Classifying by Flipping the Probability Question Around</h4>
<ul>
<li><strong>Naive Bayes</strong> is a probabilistic classifier built directly on <strong>Bayes' Theorem</strong>: <code>P(class | features) = P(features | class) &times; P(class) / P(features)</code>. Rather than directly estimating "given these words, what's the probability this is spam?" (hard), it flips the question to "given that this IS spam, how likely are these words? - and how common is spam overall?" (much easier to estimate from labeled training data).</li>
<li>The <strong>"Naive" Assumption</strong>: it assumes every feature is CONDITIONALLY INDEPENDENT of every other feature, given the class - e.g. it assumes the word "free" appearing in an email tells you nothing extra about whether "winner" also appears, once you already know the email is spam. This is almost never literally true (words obviously correlate), but the classifier only needs to rank classes correctly, not model reality perfectly, and it works remarkably well in practice anyway.</li>
<li>To classify a new example, it computes <code>P(class) &times; P(feature&#8321;|class) &times; P(feature&#8322;|class) &times; ...</code> for EACH possible class and picks whichever class has the highest resulting score.</li>
</ul>`,
            codeExamples: [
                `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

emails = [
    "win a free prize now",
    "free money click now",
    "meeting scheduled for tomorrow",
    "project report attached, please review",
    "claim your free prize today",
    "let's schedule the quarterly review",
]
labels = [1, 1, 0, 0, 1, 0]  # 1 = spam, 0 = not spam

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(emails)

model = MultinomialNB()
model.fit(X, labels)

new_email = ["free prize, click now to claim"]
prediction = model.predict(vectorizer.transform(new_email))
probabilities = model.predict_proba(vectorizer.transform(new_email))

print(f"Prediction (1=spam, 0=not spam): {prediction[0]}")
print(f"P(not spam)={probabilities[0][0]:.3f}  P(spam)={probabilities[0][1]:.3f}")
# OUTPUT (typical):
# Prediction (1=spam, 0=not spam): 1
# P(not spam)=0.017  P(spam)=0.983`
            ],
            codeExplanations: [
                `CountVectorizer turns each email's raw text into a vector counting how many times each vocabulary word appears (a "bag of words") - Naive Bayes needs numeric features, not raw text. MultinomialNB (the variant suited to word-count data) is then fit on those vectors against the spam/not-spam labels; internally it learns <code>P(word | spam)</code> and <code>P(word | not spam)</code> for every word in the vocabulary, plus the overall <code>P(spam)</code> base rate, purely by counting frequencies in the training emails. A brand-new email is vectorized the same way and passed to <code>predict_proba</code>, which multiplies together the per-word probabilities under each class (weighted by that class's base rate) and normalizes them into the two probabilities shown - the email scores overwhelmingly as spam because "free", "prize", "click", and "now" all appeared far more often in the spam training examples.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before treating spam filtering as a probability problem, early spam filters relied on hand-written keyword blocklists (e.g. "reject any email containing the word 'viagra'") - brittle rules that spammers trivially evaded by misspelling words or adding irrelevant text, and that couldn't weigh MULTIPLE weak signals together or adapt as spam patterns shifted. The real underlying problem Naive Bayes solves is: directly estimating <code>P(spam | this exact combination of words)</code> from data is essentially impossible, because almost no two emails share the exact same set of words - there's never enough data to have seen "this precise email" before.
<ul>
<li>Bayes' Theorem sidesteps this by flipping the direction: instead of needing examples of THIS EXACT email being spam, the model only needs, for each INDIVIDUAL word, how often that word shows up in spam versus non-spam emails - something that's easy to estimate reliably even from a modest labeled dataset, since a single word repeats across thousands of emails while an entire exact message basically never does.</li>
<li>The (technically false) independence assumption is what makes this tractable: without it, the model would need to estimate the JOINT probability of every possible word COMBINATION appearing together per class, which needs exponentially more data as vocabulary grows. Assuming independence collapses that into just needing each word's individual probability - a computation that scales linearly, not exponentially, with vocabulary size, which is precisely why "naive" Bayes still works so well in practice: it trades a technically wrong assumption for a tractable, robust, and surprisingly accurate model.</li>
</ul>
<h3>Real-World Example</h3>
This is literally the classic use case: an email provider's spam filter processing millions of incoming emails per day needs a classifier that is fast to train, fast to score at inference time, and can be retrained frequently as spam wording evolves. Naive Bayes fits all three constraints: training is just counting word frequencies per class (a single pass over the data, trivially parallelizable), and scoring a new email is just a handful of multiplications - orders of magnitude cheaper than a deep neural network, with no GPU required. It is not always the single most ACCURATE model available, but for a system where new spam patterns emerge daily and millions of emails need scoring in real time cheaply, Naive Bayes remains a genuinely deployed, practical baseline alongside more complex downstream models.`,
            codeExamples: [
                `# Inspecting exactly what a Naive Bayes spam filter has learned per word
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np

emails = [
    "win a free prize now", "free money click now", "claim your free prize today",
    "urgent free offer click now", "meeting scheduled for tomorrow",
    "project report attached, please review", "let's schedule the quarterly review",
    "please review the attached budget report",
]
labels = [1, 1, 1, 1, 0, 0, 0, 0]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(emails)
model = MultinomialNB()
model.fit(X, labels)

log_prob_spam = model.feature_log_prob_[1]       # log P(word | spam) for each vocab word
log_prob_ham = model.feature_log_prob_[0]        # log P(word | not spam)
vocab = vectorizer.get_feature_names_out()

most_spammy = np.argsort(log_prob_spam - log_prob_ham)[::-1][:4]
for i in most_spammy:
    print(f"  '{vocab[i]}'  P(word|spam)/P(word|ham) ratio (log-space) = {(log_prob_spam[i]-log_prob_ham[i]):.2f}")
# OUTPUT (typical):
# 'free'    P(word|spam)/P(word|ham) ratio (log-space) = 1.79
# 'click'   P(word|spam)/P(word|ham) ratio (log-space) = 1.39
# 'now'     P(word|spam)/P(word|ham) ratio (log-space) = 1.39
# 'prize'   P(word|spam)/P(word|ham) ratio (log-space) = 1.10`
            ],
            codeExplanations: [
                `After fitting MultinomialNB, <code>model.feature_log_prob_</code> exposes the actual learned <code>log P(word | class)</code> values the classifier uses internally - row 1 for spam, row 0 for not-spam. Subtracting the ham log-probability from the spam log-probability for each vocabulary word gives a log-odds-style score of how much more strongly a word points toward spam versus legitimate mail; sorting words by that score and printing the top few reveals precisely which words the model is leaning on most heavily to make its "spam" calls - a directly interpretable window into the model's decision process that few other classifiers offer as simply.`
            ]
        },
        {
            content: `<h3>Laplace Smoothing - Handling Words the Model Has Never Seen</h3>
If the training data never once contained the word "cryptocurrency" in a spam email, a naive frequency count gives <code>P("cryptocurrency" | spam) = 0</code> exactly. Because Naive Bayes MULTIPLIES all the per-word probabilities together, a single zero probability forces the ENTIRE product to zero, no matter how spammy every other word in the email is - one never-before-seen word could completely override overwhelming evidence from all the other words.
<ul>
<li><strong>Laplace (Add-One) Smoothing</strong> fixes this by adding a small constant (default 1) to every word's count before computing probabilities, guaranteeing no probability is ever EXACTLY zero: <code>P(word|class) = (count(word, class) + &alpha;) / (total_words(class) + &alpha; &times; vocabulary_size)</code>.</li>
<li>This means an unseen word gets a small, non-zero probability under each class instead of nuking the entire prediction - the model treats it as "rare but not impossible" rather than "definitively disqualifying," which matches reality far better. Scikit-learn's <code>MultinomialNB</code> applies this automatically via the <code>alpha</code> parameter (default <code>alpha=1.0</code>).</li>
</ul>`,
            codeExamples: [
                `# Demonstrating exactly what breaks WITHOUT smoothing, and how alpha fixes it
import numpy as np

word_counts_spam = {"free": 12, "prize": 8, "click": 6}   # "bitcoin" never appeared in spam training data
total_words_spam = sum(word_counts_spam.values())
vocab_size = 4  # free, prize, click, bitcoin

def prob_no_smoothing(word):
    return word_counts_spam.get(word, 0) / total_words_spam

def prob_laplace(word, alpha=1.0):
    return (word_counts_spam.get(word, 0) + alpha) / (total_words_spam + alpha * vocab_size)

new_email_words = ["free", "prize", "bitcoin"]

no_smooth_score = np.prod([prob_no_smoothing(w) for w in new_email_words])
smoothed_score = np.prod([prob_laplace(w) for w in new_email_words])

print(f"Without smoothing, P(email | spam) = {no_smooth_score:.5f}   <- zeroed out entirely by 'bitcoin'")
print(f"With Laplace smoothing, P(email | spam) = {smoothed_score:.5f}   <- still a small, usable, non-zero score")
# OUTPUT (typical):
# Without smoothing, P(email | spam) = 0.00000   <- zeroed out entirely by 'bitcoin'
# With Laplace smoothing, P(email | spam) = 0.00895   <- still a small, usable, non-zero score`
            ],
            codeExplanations: [
                `This hand-computes the exact failure mode Laplace smoothing exists to fix, without relying on scikit-learn's internals. <code>word_counts_spam</code> represents word frequencies seen in spam training emails, deliberately excluding "bitcoin" (count of 0). <code>prob_no_smoothing</code> computes a raw frequency-based probability, which is exactly 0 for "bitcoin"; multiplying it into the joint probability of the whole email (<code>np.prod</code>) zeroes out the ENTIRE score regardless of how spammy "free" and "prize" are. <code>prob_laplace</code> instead adds <code>alpha=1</code> to every count (numerator) and <code>alpha &times; vocab_size</code> to the total (denominator) before dividing, guaranteeing every word - even one never seen in this class before - gets a small positive probability, so a single unknown word can no longer single-handedly override every other word's evidence.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Extremely fast to train and predict</strong> - training is just counting word/feature frequencies per class in one pass over the data (no iterative optimization like gradient descent), so a spam filter can retrain on the latest labeled emails within seconds even at large scale.</li>
<li><strong>Works well with high-dimensional, sparse data</strong> - text classification naturally has huge vocabularies (tens of thousands of possible words) where any one email only uses a tiny fraction of them; Naive Bayes handles this sparsity naturally since it just needs per-word statistics, unlike distance-based models (KNN, SVM) that struggle as dimensionality grows.</li>
<li><strong>Needs relatively little training data to get reasonable estimates</strong> - because it only ever needs to estimate simple per-feature-per-class probabilities (not complex joint interactions), it can produce usable results even from a modest labeled dataset, unlike models that need to learn many interacting parameters.</li>
<li><strong>Naturally handles multi-class problems and gives calibrated-feeling probability outputs</strong> - extending from spam/not-spam to, say, a 5-category email folder classifier (Primary/Social/Promotions/Updates/Forums) requires zero change to the algorithm, and <code>predict_proba</code> comes for free from the underlying probability model, unlike SVM which needs extra calibration steps.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>The independence assumption can hurt accuracy when features are strongly correlated</strong> - e.g. "New" and "York" appearing together conveys much more than either word does alone (a strong joint signal about a real bigram/location), but Naive Bayes treats them as independent evidence and can under- or over-weight that combination compared to a model that captures interactions (like a tree-based model splitting on combinations, or a neural network).</li>
<li><strong>Probability estimates can be poorly calibrated even when class predictions are correct</strong> - because the independence assumption is violated in practice, the raw predicted probabilities (e.g. "99.98% spam") often end up far more extreme than reality actually warrants, even though the final class ranking (spam vs not) is usually still right.</li>
<li><strong>Zero-frequency problem without smoothing</strong> - as shown above, any never-before-seen feature value can completely zero out a class's score unless Laplace/additive smoothing is applied; forgetting to smooth (or setting alpha=0) silently breaks the model on any genuinely novel input.</li>
<li><strong>Sensitive to how features are represented</strong> - MultinomialNB expects word-count-style non-negative features, GaussianNB expects roughly normally-distributed continuous features, and BernoulliNB expects binary presence/absence; picking the wrong Naive Bayes variant for the feature type (e.g. GaussianNB on raw word counts) gives poor results, unlike more flexible models that adapt better across feature types.</li>
<li><strong>Purely a generative, frequency-based baseline - typically outperformed by discriminative models given enough data</strong> - with a large enough labeled dataset, models like logistic regression, gradient-boosted trees, or transformer-based text classifiers usually beat Naive Bayes on raw accuracy, since they can learn feature interactions directly; Naive Bayes wins mainly on speed, simplicity, and performance in low-data regimes.</li>
</ul>`,
            codeExamples: [
                `# Naive Bayes as a fast baseline vs Logistic Regression on the same text classification task
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import fetch_20newsgroups
from sklearn.model_selection import train_test_split
import time

categories = ['sci.space', 'rec.sport.baseball']
data = fetch_20newsgroups(subset='all', categories=categories, remove=('headers', 'footers', 'quotes'))
X_train_text, X_test_text, y_train, y_test = train_test_split(data.data, data.target, test_size=0.3, random_state=0)

vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
X_train = vectorizer.fit_transform(X_train_text)
X_test = vectorizer.transform(X_test_text)

for name, model in [("MultinomialNB", MultinomialNB()), ("LogisticRegression", LogisticRegression(max_iter=1000))]:
    start = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start
    print(f"{name:20s}  train_time={train_time:.3f}s  test_accuracy={model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# MultinomialNB         train_time=0.004s  test_accuracy=0.968
# LogisticRegression     train_time=0.180s  test_accuracy=0.981`
            ],
            codeExplanations: [
                `This pulls two clearly distinct newsgroup categories (space vs baseball discussions) from the real 20-newsgroups text dataset, vectorizes the text with TF-IDF (word importance weighting rather than raw counts), and trains both MultinomialNB and LogisticRegression on identical data for a fair comparison. Timing <code>.fit()</code> for each and comparing test accuracy shows the tradeoff described above concretely: Naive Bayes trains dramatically faster (a simple counting pass versus logistic regression's iterative gradient-based optimization) while landing only slightly behind on accuracy - illustrating exactly why Naive Bayes remains attractive as a cheap, fast baseline or for systems needing frequent retraining, even when a more complex discriminative model could squeeze out a bit more accuracy.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Bayes' Theorem let Naive Bayes do that direct estimation cannot?</td><td>Directly estimating P(class | this exact combination of features) is infeasible because almost no two examples share the exact same feature combination, so there's rarely enough data; Bayes' Theorem flips the problem to estimating P(feature | class) for each feature individually and P(class) overall - quantities that ARE reliably estimable from modest labeled data, since individual features repeat across many examples even when whole examples never do</td></tr>
<tr class='text-center'><td>Why is the conditional independence assumption called "naive", and why does the model still work well despite it being false?</td><td>It's naive because it assumes every feature (e.g. every word) is independent of every other feature given the class, which is rarely true in reality (e.g. words correlate with each other); it still works well because the model only needs to correctly RANK classes relative to each other, not perfectly model the true joint distribution, and the assumption makes the math tractable (linear rather than exponential in the number of features) at a cost that's often smaller than the tractability gain</td></tr>
<tr class='text-center'><td>What problem does Laplace smoothing solve, and what happens if you skip it?</td><td>Without smoothing, any feature value never seen during training for a given class gets a raw probability of exactly zero, and since Naive Bayes multiplies per-feature probabilities together, that single zero forces the entire class score to zero regardless of how much other evidence favors that class; Laplace (add-one) smoothing adds a small constant to every count so no probability is ever exactly zero, treating unseen values as rare rather than impossible</td></tr>
</table>`
        }
    ]
};
