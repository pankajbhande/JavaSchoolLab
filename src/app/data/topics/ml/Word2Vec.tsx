import { Topic } from '../../coreJava';

export const word2Vec: Topic = {
    id: 'ml-nlp-word2vec',
    name: 'Word2Vec',
    beginner: [
        {
            content: `<h4>Turning Words Into Dense Vectors That Capture Meaning</h4>
<ul>
<li><strong>Word2Vec</strong> is a technique that learns a <strong>dense vector representation</strong> (typically 100-300 numbers) for every word in a vocabulary, called a <strong>word embedding</strong> - unlike TF-IDF's sparse, mostly-zero vectors sized to the whole vocabulary, a Word2Vec vector is compact and every dimension carries information.</li>
<li>The core idea is the <strong>distributional hypothesis</strong>: <em>"a word is defined by the company it keeps."</em> Word2Vec learns embeddings by training a model to predict a word from its surrounding context words (or vice versa) across a huge amount of text - words that tend to appear in similar contexts (like "king" and "queen", or "happy" and "joyful") end up with similar vectors purely as a side effect of this training process.</li>
<li>The famous result of this is that the learned vector SPACE captures real semantic relationships as geometric directions - most famously, <code>vector("king") - vector("man") + vector("woman") &asymp; vector("queen")</code>, meaning the direction from "man" to "king" (roughly "royalty") is similar to the direction from "woman" to "queen".</li>
</ul>`,
            codeExamples: [
                `from gensim.models import Word2Vec

# a toy corpus - in practice this would be millions of sentences
sentences = [
    ["the", "king", "rules", "the", "kingdom"],
    ["the", "queen", "rules", "the", "kingdom"],
    ["the", "man", "walks", "to", "work"],
    ["the", "woman", "walks", "to", "work"],
    ["the", "king", "and", "queen", "attended", "the", "royal", "wedding"],
    ["the", "man", "and", "woman", "attended", "the", "wedding"],
] * 50  # repeated to give the toy model enough signal to learn from

model = Word2Vec(sentences, vector_size=50, window=3, min_count=1, sg=1, epochs=100)

print("Vector for 'king' (first 5 of 50 dims):", model.wv["king"][:5].round(3))
print("\\nWords most similar to 'king':")
for word, score in model.wv.most_similar("king", topn=3):
    print(f"  {word:10s} {score:.3f}")
# OUTPUT (typical, exact numbers vary by run):
# Vector for 'king' (first 5 of 50 dims): [ 0.021 -0.134  0.087  0.045 -0.019]
#
# Words most similar to 'king':
#   queen      0.912
#   royal      0.784
#   kingdom    0.701`
            ],
            codeExplanations: [
                `<code>gensim.models.Word2Vec</code> trains embeddings directly from a list of tokenized sentences - <code>vector_size=50</code> sets how many dimensions each word's embedding has, <code>window=3</code> sets how many neighboring words count as "context" on each side, and <code>sg=1</code> selects the Skip-gram training mode. After training, <code>model.wv["king"]</code> retrieves the learned 50-dimensional vector for the word "king" - a dense array of real numbers with no direct human-readable meaning per dimension, unlike a TF-IDF vector where each dimension is a specific word. <code>model.wv.most_similar("king")</code> finds the words whose vectors are geometrically closest (by cosine similarity) to "king"'s vector - because "king", "queen", and "royal" tended to appear in similar surrounding contexts in the training sentences, the model places their vectors near each other in the embedding space purely by learning to predict context words, without ever being told these words are related.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before dense embeddings, the standard way to represent words numerically was sparse counting-based methods like <strong>Bag-of-Words</strong> or <strong>TF-IDF</strong> - each word gets its own dimension in a vector as large as the entire vocabulary, and there is no notion of similarity BETWEEN words baked in at all: "car" and "automobile" are just two arbitrary, completely unrelated dimensions to a TF-IDF vectorizer, exactly as unrelated as "car" and "banana".
<ul>
<li><strong>TF-IDF/Bag-of-Words vectors carry no semantic relationships</strong> - a search for "car" using TF-IDF will not match a document that only mentions "automobile", even though a human reader instantly recognizes they mean nearly the same thing; the representation is purely lexical (matching literal word spelling), not semantic (matching meaning).</li>
<li><strong>Sparse vectors don't generalize to unseen combinations</strong> - a classifier trained on TF-IDF vectors that has only ever seen the word "excellent" in positive reviews has learned nothing at all about the word "outstanding" if it never happened to co-occur in the training data, even though the two words are near-synonyms.</li>
<li>Word2Vec fixes this at the representation level: because embeddings are learned from HOW words are actually used across huge amounts of text, semantically related words end up numerically close automatically - a model or downstream classifier built on embeddings can generalize from "excellent" to "outstanding" even without ever seeing "outstanding" during supervised training, since their vectors already sit near each other in the embedding space.</li>
</ul>
<h3>Real-World Example</h3>
The canonical demonstration of what Word2Vec actually captures is <strong>vector arithmetic on analogies</strong>: taking the vector for "king", subtracting the vector for "man", and adding the vector for "woman" lands remarkably close to the vector for "queen" - <code>king - man + woman &asymp; queen</code>. This isn't a coincidence or a lookup table; it emerges purely from training on the statistical patterns of how these words are used in context across a large text corpus. This same property is what powers practical systems: an <strong>e-commerce search/recommendation engine</strong> using product-description embeddings can recognize that a query for "running shoes" should also surface results tagged "jogging sneakers" - the embeddings for the two phrases land close together in vector space because they tend to appear in similar surrounding contexts across millions of product listings, letting the system generalize past exact keyword matching.`,
            codeExamples: [
                `# The classic king - man + woman ~= queen analogy, demonstrated with a pre-trained-style embedding lookup
from gensim.models import Word2Vec

sentences = [
    ["the", "king", "is", "a", "powerful", "ruler", "of", "the", "kingdom"],
    ["the", "queen", "is", "a", "powerful", "ruler", "of", "the", "kingdom"],
    ["the", "man", "works", "hard", "every", "day"],
    ["the", "woman", "works", "hard", "every", "day"],
    ["the", "king", "married", "the", "queen", "in", "a", "royal", "ceremony"],
    ["a", "man", "and", "a", "woman", "attended", "the", "royal", "ceremony"],
    ["the", "prince", "is", "the", "son", "of", "the", "king", "and", "queen"],
] * 80

model = Word2Vec(sentences, vector_size=50, window=4, min_count=1, sg=1, epochs=200)

# king - man + woman ~= ?
result = model.wv.most_similar(positive=["king", "woman"], negative=["man"], topn=3)
print("king - man + woman  ~=")
for word, score in result:
    print(f"  {word:10s} {score:.3f}")
# OUTPUT (typical, exact ranking depends on corpus/training):
# king - man + woman  ~=
#   queen      0.878
#   royal      0.652
#   prince     0.611`
            ],
            codeExplanations: [
                `<code>model.wv.most_similar(positive=["king", "woman"], negative=["man"])</code> is gensim's direct API for vector analogy arithmetic - internally it computes <code>vector("king") - vector("man") + vector("woman")</code> and then finds which word's embedding is closest (by cosine similarity) to that resulting vector, excluding the input words themselves. The training corpus repeatedly places "king" and "queen" in similar royal/ruling contexts and "man" and "woman" in similar everyday contexts, so the model learns a consistent direction in the embedding space roughly corresponding to "royalty" and another roughly corresponding to "gender" - subtracting "man" from "king" isolates something like the "royalty" direction, and adding "woman" lands near "queen", reproducing the famous analogy purely from the geometry the model learned during training, with no rule ever hand-coded about royal titles or gender.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - CBOW vs Skip-gram</h3>
Word2Vec is trained using one of two related prediction tasks, both of which force the model to compress each word into a vector that's useful for predicting its context:
<ul>
<li><strong>CBOW (Continuous Bag of Words)</strong> - given the surrounding CONTEXT words (e.g. "the ___ sat on the mat", with "the", "sat", "on", "the", "mat" as context), predict the single MISSING center word ("cat"). It averages the context word vectors together to make one prediction, which trains faster and tends to work well on frequent words.</li>
<li><strong>Skip-gram</strong> - the reverse task: given a single CENTER word ("cat"), predict each of its surrounding CONTEXT words individually. It makes multiple separate predictions per center word (one per nearby context word), which is slower to train but tends to produce higher-quality embeddings for rarer words, since each occurrence generates more individual training signal.</li>
<li>In both cases, the actual mechanism that produces useful embeddings is a shallow neural network: a hidden layer with no activation function whose learned weight matrix, once training finishes, literally IS the table of word embeddings - each word's row in that matrix becomes its final vector representation, and the "prediction" task itself is discarded after training; only the learned weights matter.</li>
<li>Neither objective needs any labeled data - the "labels" are just neighboring words extracted automatically from raw, unlabeled text, which is why Word2Vec can be trained on virtually unlimited text (Wikipedia, news archives, book corpora) without any human annotation.</li>
</ul>`,
            codeExamples: [
                `# Comparing CBOW (sg=0) and Skip-gram (sg=1) on the same corpus
from gensim.models import Word2Vec
import time

sentences = [
    ["the", "cat", "sat", "on", "the", "mat"],
    ["the", "dog", "sat", "on", "the", "rug"],
    ["a", "cat", "and", "a", "dog", "played", "together"],
    ["the", "cat", "chased", "the", "mouse"],
    ["the", "dog", "chased", "the", "ball"],
] * 200

for name, sg_flag in [("CBOW", 0), ("Skip-gram", 1)]:
    start = time.time()
    model = Word2Vec(sentences, vector_size=30, window=2, min_count=1, sg=sg_flag, epochs=20)
    train_time = time.time() - start
    similar = model.wv.most_similar("cat", topn=2)
    print(f"{name:10s}  train_time={train_time:.2f}s  most similar to 'cat': {similar}")
# OUTPUT (typical):
# CBOW        train_time=0.35s  most similar to 'cat': [('dog', 0.87), ('mouse', 0.61)]
# Skip-gram   train_time=0.58s  most similar to 'cat': [('dog', 0.91), ('mouse', 0.68)]`
            ],
            codeExplanations: [
                `The same small corpus is trained twice with identical settings except <code>sg</code> - <code>sg=0</code> selects CBOW (predict the center word FROM its context) and <code>sg=1</code> selects Skip-gram (predict context words FROM the center word). Timing each shows Skip-gram taking noticeably longer, consistent with it generating multiple separate context-word predictions per center word occurrence versus CBOW's single averaged prediction. Both find "dog" as most similar to "cat" (both animals appear in near-identical surrounding contexts across the corpus - "sat on the X", "chased the Y"), confirming both objectives successfully learn the same underlying semantic relationship, just via different training mechanics and at different computational cost.`
            ]
        },
        {
            content: `<h3>Why Embeddings Enable Transfer Learning</h3>
<ul>
<li>A Word2Vec model trained once on a massive general-purpose text corpus (news articles, Wikipedia, books) produces embeddings that capture broad, general semantic relationships between words - this trained model can then be REUSED as a starting point for many different downstream tasks (sentiment analysis, document classification, named entity recognition) instead of learning word representations from scratch for each new task.</li>
<li>This is a direct precursor to the modern deep learning practice of <strong>transfer learning</strong>: rather than every NLP project needing millions of labeled examples to learn what words even mean, a project can start from pre-trained embeddings and fine-tune only a smaller task-specific layer on top, dramatically reducing the labeled data needed.</li>
<li>Word2Vec's core insight - that meaning can be captured as a point in a continuous, dense vector space, learned from unlabeled text via a "predict the context" objective - is the direct conceptual ancestor of the token/word embeddings sitting at the very first layer of every modern Transformer-based Large Language Model (BERT, GPT, and beyond). Those models use far richer, CONTEXTUAL embeddings (the vector for "bank" changes depending on whether it's a river bank or a financial bank), but the foundational idea of representing meaning as a dense, geometrically-structured vector, learned unsupervised from raw text, began with Word2Vec.</li>
</ul>
<h3>Advantages</h3>
<ul>
<li><strong>Captures semantic similarity that sparse methods (TF-IDF, Bag-of-Words) completely miss</strong> - "excellent" and "outstanding" land near each other in vector space, letting downstream models generalize between near-synonyms without ever seeing every possible synonym during supervised training.</li>
<li><strong>Compact, dense representation</strong> - a 100-300 dimension vector per word is vastly smaller than a one-hot or TF-IDF vector sized to the entire vocabulary (which can be hundreds of thousands of dimensions), reducing memory and often improving downstream model performance.</li>
<li><strong>Trained unsupervised from raw, unlabeled text</strong> - no manual labeling is required; the "labels" are simply nearby words extracted automatically from ordinary sentences, so training data is effectively unlimited.</li>
<li><strong>Reusable across tasks (transfer learning)</strong> - one trained embedding set can be plugged into many different downstream models/tasks, saving enormous training cost and data compared to learning representations from scratch each time.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>One fixed vector per word, regardless of context</strong> - the word "bank" gets exactly ONE embedding, so Word2Vec cannot distinguish "river bank" from "savings bank"; modern contextual embeddings (BERT, GPT-style models) fix this by producing a different vector for the same word depending on its surrounding sentence.</li>
<li><strong>Cannot handle out-of-vocabulary words</strong> - a word never seen during training has no embedding at all, unlike subword-based tokenization schemes used by modern LLMs that can represent unseen words by combining known sub-word pieces.</li>
<li><strong>Requires a large training corpus to produce good-quality embeddings</strong> - the toy examples above use small, repeated corpora purely for illustration; real, useful embeddings typically need training on gigabytes of text to reliably capture nuanced relationships, especially for less common words.</li>
<li><strong>Embeddings can encode and amplify biases present in the training text</strong> - since the model learns purely from how words are actually used in a corpus, any societal or historical bias baked into that text (e.g. gender-stereotyped associations) gets baked directly into the geometry of the embedding space, requiring explicit debiasing techniques to mitigate.</li>
</ul>`,
            codeExamples: [
                `# Word2Vec embeddings as input features for a downstream sentiment classifier (transfer learning style)
import numpy as np
from gensim.models import Word2Vec
from sklearn.linear_model import LogisticRegression

sentences = [
    "the movie was excellent and thrilling".split(),
    "what a fantastic and wonderful film".split(),
    "the movie was boring and dull".split(),
    "what a terrible and awful film".split(),
    "outstanding acting made it excellent".split(),
    "poor acting made it dull and boring".split(),
] * 100
labels = [1, 1, 0, 0, 1, 0] * 100  # 1 = positive, 0 = negative

w2v = Word2Vec(sentences, vector_size=20, window=3, min_count=1, sg=1, epochs=50)

def sentence_vector(tokens):
    vectors = [w2v.wv[t] for t in tokens if t in w2v.wv]
    return np.mean(vectors, axis=0) if vectors else np.zeros(20)

X = np.array([sentence_vector(s) for s in sentences])
clf = LogisticRegression(max_iter=500).fit(X, labels)

new_review = "outstanding and wonderful acting".split()   # note: uses words never seen together before
prediction = clf.predict([sentence_vector(new_review)])
print("Prediction (1=positive):", prediction[0])
# OUTPUT (typical):
# Prediction (1=positive): 1`
            ],
            codeExplanations: [
                `A Word2Vec model is first trained purely to learn word embeddings from the raw sentences (no labels involved in this step). <code>sentence_vector</code> then builds a fixed-length feature vector for an ENTIRE sentence by averaging together the embeddings of its individual words - a simple but common way to turn variable-length text into a fixed-size numeric input a standard classifier can use. A <code>LogisticRegression</code> classifier is trained on these averaged embeddings against sentiment labels. The key demonstration is the final prediction: the new review combines "outstanding" and "wonderful" in a way never literally seen together in training, but because both words individually have embeddings that sit close to other positive-sentiment words like "excellent" and "fantastic" (learned purely from their contexts), the averaged sentence vector still lands in the "positive" region the classifier learned - showing the semantic generalization that a purely word-count-based (TF-IDF) approach would not achieve for this unseen word combination.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How is a Word2Vec embedding fundamentally different from a TF-IDF vector?</td><td>TF-IDF produces a sparse vector as large as the entire vocabulary, where each dimension corresponds to one specific word and there is no built-in notion of similarity between different words; Word2Vec produces a dense, compact vector (typically 100-300 dimensions) per word learned by predicting context, such that semantically related words end up numerically close together in the vector space - a relationship TF-IDF has no mechanism to represent at all</td></tr>
<tr class='text-center'><td>What is the distributional hypothesis, and how does Word2Vec use it to learn word meaning without labeled data?</td><td>The distributional hypothesis is the idea that "a word is defined by the company it keeps" - words used in similar surrounding contexts tend to have similar meanings; Word2Vec operationalizes this by training a shallow neural network to predict a word from its context (CBOW) or context words from a center word (Skip-gram), using only naturally occurring neighboring words extracted from raw, unlabeled text as training signal, so no human annotation is required</td></tr>
<tr class='text-center'><td>What does the "king - man + woman ~= queen" example demonstrate, and what is a key limitation of Word2Vec that this example doesn't reveal?</td><td>It demonstrates that the embedding space learned by Word2Vec captures semantic relationships as consistent geometric directions (e.g. a "royalty" direction and a "gender" direction), purely as an emergent property of training on word co-occurrence statistics, with no rules hand-coded; a key limitation the analogy doesn't reveal is that Word2Vec assigns exactly ONE fixed vector per word regardless of context, so it cannot distinguish different senses of the same word (e.g. "bank" as a river bank vs a financial bank) - a problem later solved by contextual embeddings in Transformer-based models like BERT and GPT</td></tr>
</table>`
        }
    ]
};
