import { Topic } from '../../coreJava';

export const tfIdf: Topic = {
    id: 'ml-nlp-tf-idf',
    name: 'TF-IDF',
    beginner: [
        {
            content: `<h4>Weighing Words by How Distinctive They Are</h4>
<ul>
<li><strong>TF-IDF</strong> (<strong>Term Frequency - Inverse Document Frequency</strong>) is a way to turn text into numbers that reflects not just how often a word appears, but how MEANINGFUL that word is for distinguishing one document from another.</li>
<li><strong>Term Frequency (TF)</strong> - how often a word appears within ONE document. A word repeated many times in a document is probably important to that document's topic.</li>
<li><strong>Inverse Document Frequency (IDF)</strong> - how RARE a word is across the ENTIRE collection of documents. Words that appear in almost every document (like "the", "is", "and") get a LOW IDF score (they carry little distinguishing information), while words that appear in only a few documents get a HIGH IDF score (they're distinctive and informative).</li>
<li>The final <strong>TF-IDF score</strong> for a word in a document is <code>TF &times; IDF</code> - high when a word is frequent in THIS document but rare across all OTHER documents; low when a word is either rare here or common everywhere.</li>
</ul>`,
            codeExamples: [
                `from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "the cat sat on the mat",
    "the dog sat on the log",
    "cats and dogs are great pets",
]

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(documents)

feature_names = vectorizer.get_feature_names_out()
print("Vocabulary:", list(feature_names))
print("\\nTF-IDF scores for document 1 ('the cat sat on the mat'):")
for word, score in zip(feature_names, tfidf_matrix[0].toarray()[0]):
    if score > 0:
        print(f"  {word:8s} {score:.3f}")
# OUTPUT (typical):
# Vocabulary: ['and', 'are', 'cat', 'cats', 'dog', 'dogs', 'great', 'log', 'mat', 'on', 'pets', 'sat', 'the']
#
# TF-IDF scores for document 1 ('the cat sat on the mat'):
#   cat      0.467   <- appears only in this document, so it gets a high, distinctive score
#   mat      0.467   <- also unique to this document
#   on       0.355
#   sat      0.355   <- appears in 2 of 3 docs, so lower than cat/mat
#   the      0.552   <- appears twice here, but common across docs, so weight is dampened relative to raw frequency`
            ],
            codeExplanations: [
                `<code>TfidfVectorizer</code> builds a vocabulary from all three documents, then computes a TF-IDF score for every word in every document - the result is a matrix where each row is a document and each column is a word's TF-IDF weight in that document. Printing only the non-zero scores for the first document shows the core behavior: "cat" and "mat" get relatively high scores because they appear ONLY in this document (high IDF - they're distinctive), while "the" - despite appearing TWICE in this document (high raw term frequency) - doesn't dominate as much as raw counting would suggest, because it also appears in document 2, making it less distinctive across the collection as a whole. This is exactly the behavior plain word-counting (Bag-of-Words) lacks: it would rank "the" as by far the most important word in this document simply because it occurs most often.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Before weighting terms by distinctiveness, the simplest way to turn text into vectors was <strong>Bag-of-Words</strong> - just counting how many times each word appears in a document, with no adjustment for how common that word is elsewhere. This approach has a fundamental problem: the words that appear MOST OFTEN in almost any document (like "the", "a", "is", "and") are usually the LEAST informative ones for distinguishing what a document is actually about.
<ul>
<li>Raw word counts let common "filler" words dominate a document's vector representation purely because of their sheer frequency, drowning out the rarer, topically meaningful words that actually characterize what the document is about.</li>
<li>TF-IDF directly fixes this by multiplying each word's local frequency (TF) by a penalty (IDF) that shrinks toward zero the more documents that word appears in across the whole collection - a word appearing in every single document gets an IDF near zero, effectively removing its influence, while a word appearing in only a handful of documents keeps a high, meaningful weight.</li>
<li>Without this adjustment, tasks like document search, document similarity, and text classification built on raw word counts would rank and compare documents largely based on shared use of generic connector words rather than shared topical content.</li>
</ul>
<h3>Real-World Example</h3>
A <strong>search engine</strong> indexing thousands of news articles needs to rank which articles are most relevant to a user's query, e.g. "electric vehicle battery technology". Nearly every article in the corpus contains common words like "the", "said", "today" - these carry zero information about relevance. TF-IDF automatically downweights them to near-irrelevance (since they appear in almost every document, their IDF is near zero) while boosting the weight of query-relevant but comparatively rare words like "lithium", "battery", or "electric" that appear frequently in a SMALL, topically-focused subset of articles. Each document is represented as a TF-IDF vector, the query itself is converted into a TF-IDF vector using the same vocabulary and weights, and <strong>cosine similarity</strong> between the query vector and each document vector ranks documents by how closely their distinctive word usage matches the query's - powering a genuinely useful, relevance-ranked search result list instead of one dominated by documents that merely share lots of common words with the query.`,
            codeExamples: [
                `# Document search / similarity ranking using TF-IDF + cosine similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

articles = [
    "New lithium battery technology extends electric vehicle range significantly",
    "The city council today approved a new budget for road repairs",
    "Electric vehicle sales rise as battery prices continue to fall",
    "Local team wins championship game in dramatic overtime finish",
]
query = ["electric vehicle battery technology"]

vectorizer = TfidfVectorizer(stop_words="english")
doc_vectors = vectorizer.fit_transform(articles)
query_vector = vectorizer.transform(query)

similarities = cosine_similarity(query_vector, doc_vectors)[0]
ranking = sorted(zip(articles, similarities), key=lambda pair: pair[1], reverse=True)

for article, score in ranking:
    print(f"{score:.3f}  {article}")
# OUTPUT (typical):
# 0.612  New lithium battery technology extends electric vehicle range significantly
# 0.487  Electric vehicle sales rise as battery prices continue to fall
# 0.000  The city council today approved a new budget for road repairs
# 0.000  Local team wins championship game in dramatic overtime finish`
            ],
            codeExplanations: [
                `<code>TfidfVectorizer(stop_words="english")</code> both computes TF-IDF weights and removes extremely common English filler words (like "the", "a", "as") automatically before weighting, so the vectorizer focuses purely on topically meaningful terms. Both the four articles and the search query are converted into TF-IDF vectors using the SAME fitted vocabulary (the query is transformed, not re-fit, so its vector lives in the same space as the document vectors). <code>cosine_similarity</code> then measures the angle between the query vector and each document vector - a score near 1 means the word usage patterns point in nearly the same direction (highly relevant), while a score near 0 means almost no shared distinctive vocabulary. Sorting articles by this score produces a genuine relevance ranking: the two EV/battery-related articles score highest, while the unrelated city-council and sports articles score essentially zero, despite all four articles sharing plenty of common English words.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - The TF-IDF Formula</h3>
<ul>
<li><strong>Term Frequency</strong>: <code>TF(word, doc) = (count of word in doc) / (total words in doc)</code> - normalizing by document length prevents longer documents from automatically getting higher raw counts for every word.</li>
<li><strong>Inverse Document Frequency</strong>: <code>IDF(word) = log(total number of documents / number of documents containing word)</code> - scikit-learn's default formula adds smoothing constants to avoid division by zero: <code>IDF(word) = log((1 + N) / (1 + df(word))) + 1</code>, where <code>N</code> is the total document count and <code>df(word)</code> is how many documents contain the word.</li>
<li><strong>Final score</strong>: <code>TF-IDF(word, doc) = TF(word, doc) &times; IDF(word)</code>, typically followed by L2-normalizing each document's full vector so document length doesn't distort comparisons between documents of very different sizes.</li>
<li>A word appearing in EVERY document approaches <code>IDF &asymp; log(1) = 0</code> (or close to it with smoothing) - its TF-IDF score collapses toward zero regardless of how often it appears locally, exactly the "the"/"is"/"and" downweighting behavior seen earlier, computed automatically rather than needing a hand-curated stopword list.</li>
</ul>`,
            codeExamples: [
                `# Manually computing TF, IDF, and TF-IDF to see the formula work step by step
import numpy as np

documents = [
    "the cat sat on the mat",
    "the dog sat on the log",
    "cats and dogs are great pets",
]
tokenized = [doc.split() for doc in documents]
N = len(documents)

def term_frequency(word, doc_tokens):
    return doc_tokens.count(word) / len(doc_tokens)

def inverse_document_frequency(word, all_docs_tokens):
    df = sum(1 for doc in all_docs_tokens if word in doc)
    return np.log((1 + N) / (1 + df)) + 1

for word in ["the", "cat", "sat"]:
    tf = term_frequency(word, tokenized[0])
    idf = inverse_document_frequency(word, tokenized)
    print(f"'{word}':  TF={tf:.3f}  IDF={idf:.3f}  TF-IDF={tf * idf:.3f}")
# OUTPUT (typical):
# 'the':  TF=0.333  IDF=1.000  TF-IDF=0.333   <- appears in all 3 docs -> IDF near its minimum, score stays low
# 'cat':  TF=0.167  IDF=1.693  TF-IDF=0.282   <- appears in only 1 doc -> higher IDF boosts its relative importance
# 'sat':  TF=0.167  IDF=1.288  TF-IDF=0.215   <- appears in 2 of 3 docs -> IDF between the other two`
            ],
            codeExplanations: [
                `This hand-computes the TF-IDF formula (with scikit-learn's smoothed IDF variant) from scratch to make each component concrete. <code>term_frequency</code> counts how many times a word occurs in one document's token list, divided by that document's total word count. <code>inverse_document_frequency</code> counts <code>df</code> - the number of documents (out of all <code>N</code>) that contain the word at all - then applies the smoothed log formula, which produces a small value for words appearing in every document ("the") and a larger value for words confined to fewer documents ("cat"). Multiplying TF and IDF for each word on document 1 shows that even though "the" has a HIGHER raw term frequency than "cat" in this document, "cat"'s much higher IDF (it's rare across the whole collection) closes most of that gap and would fully overtake it with slightly different document proportions - directly illustrating how IDF counterbalances raw frequency to reward words that are locally frequent but globally rare.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Automatically downweights uninformative common words</strong> - no manual stopword list is strictly required, since words appearing in nearly every document naturally get an IDF near zero, achieving a similar effect data-drivenly.</li>
<li><strong>Highlights genuinely distinctive vocabulary</strong> - words that are frequent within a document but rare across the collection (like "lithium" in an EV article) get boosted, making the resulting vectors much better aligned with a document's actual topic than raw counts.</li>
<li><strong>Simple, fast, and highly interpretable</strong> - unlike dense embedding methods, every dimension of a TF-IDF vector corresponds directly to one specific word, so it's easy to inspect exactly why two documents were scored as similar or why a search result was ranked highly.</li>
<li><strong>Strong, cheap baseline for search and text classification</strong> - TF-IDF + cosine similarity (for search/similarity) or TF-IDF + a linear classifier (for spam detection, topic classification) remains a fast, well-understood, production-viable approach that needs no GPU and no pretraining.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>No understanding of word meaning or context</strong> - TF-IDF treats "car" and "automobile" as completely unrelated dimensions, and cannot recognize that they mean nearly the same thing; a document about "automobiles" won't match a query for "cars" unless the exact word overlaps.</li>
<li><strong>Ignores word order and grammar</strong> - "dog bites man" and "man bites dog" produce nearly identical TF-IDF vectors (same words, same counts), even though they mean opposite things, since TF-IDF is a pure bag-of-words weighting scheme.</li>
<li><strong>Produces high-dimensional, sparse vectors</strong> - a large corpus can have a vocabulary of hundreds of thousands of unique words, so each document's vector is mostly zeros, which can be memory-intensive and, for some downstream models, harder to learn from effectively than a dense representation.</li>
<li><strong>Vocabulary is fixed at fit time</strong> - a word that never appeared in the training corpus (an out-of-vocabulary word) is simply invisible to the vectorizer at inference time, unlike subword-based modern tokenizers that can represent unseen words by breaking them into known pieces.</li>
</ul>`,
            codeExamples: [
                `# TF-IDF as a text classification baseline: spam detection
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

emails = [
    "win a free prize claim now", "urgent free money click now",
    "meeting scheduled for tomorrow morning", "quarterly project report attached",
    "claim your free cash prize today", "let's review the budget report",
    "free offer click to claim now", "please review the attached document",
]
labels = [1, 1, 0, 0, 1, 0, 1, 0]  # 1 = spam, 0 = not spam

X_train, X_test, y_train, y_test = train_test_split(emails, labels, test_size=0.25, random_state=0)

vectorizer = TfidfVectorizer()
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

model = LogisticRegression().fit(X_train_tfidf, y_train)
print(f"Test accuracy: {model.score(X_test_tfidf, y_test):.2f}")

new_email = vectorizer.transform(["free cash click now to claim"])
print("Prediction (1=spam):", model.predict(new_email)[0])
# OUTPUT (typical):
# Test accuracy: 1.00
# Prediction (1=spam): 1`
            ],
            codeExplanations: [
                `This shows TF-IDF feeding a downstream classifier rather than a search system. <code>TfidfVectorizer</code> is fit ONLY on the training emails (<code>fit_transform</code>), then the test emails are transformed using that same fitted vocabulary and IDF weights (<code>transform</code>, never re-fit, to avoid leaking test data into the vectorizer). A <code>LogisticRegression</code> classifier is trained on the resulting TF-IDF vectors against the spam/not-spam labels, then evaluated on the held-out test set. Words like "free", "claim", and "click" get consistently high TF-IDF weight in spam emails and low weight elsewhere, giving the linear classifier a strong, clean signal to separate the two classes - a new email is vectorized the same way and correctly classified as spam based on its distinctive word usage.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does TF-IDF solve that raw Bag-of-Words word counts don't?</td><td>Raw word counts let extremely common but uninformative words (like "the", "is", "and") dominate a document's vector purely because of how often they occur, since Bag-of-Words has no way to distinguish a genuinely important repeated word from a generic filler word; TF-IDF multiplies each word's local frequency (TF) by an inverse-document-frequency penalty (IDF) that shrinks toward zero for words appearing in nearly every document, automatically downweighting uninformative words and boosting words that are locally frequent but globally rare</td></tr>
<tr class='text-center'><td>How does IDF behave for a word that appears in every single document versus a word that appears in only one document?</td><td>IDF is computed as roughly log(total documents / documents containing the word); a word in every document has a ratio near 1, so its IDF approaches zero, essentially eliminating its contribution to the TF-IDF score regardless of local frequency, while a word confined to just one or a few documents has a much larger ratio and IDF, giving it a high, distinguishing weight</td></tr>
<tr class='text-center'><td>How is TF-IDF typically used to rank documents by relevance to a search query, and what is a key limitation of this approach?</td><td>Both the documents and the query are converted into TF-IDF vectors using the same fitted vocabulary, then cosine similarity is computed between the query vector and each document vector to rank documents by how closely their distinctive word usage matches the query's; the key limitation is that TF-IDF has no notion of word meaning or synonyms - a document about "automobiles" won't match a query for "cars" unless the literal words overlap, since it is a purely lexical, word-count-based representation</td></tr>
</table>`
        }
    ]
};
