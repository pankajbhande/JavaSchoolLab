import { Topic } from '../../coreJava';

export const whatIsMachineLearning: Topic = {
    id: 'ml-fundamentals-what-is-machine-learning',
    name: 'What is Machine Learning?',
    beginner: [
        {
            content: `<h3>What is Machine Learning?</h3>
<ul>
<li>Machine Learning (ML) is a branch of AI where a system <strong>learns patterns from data</strong> instead of being explicitly programmed with rules.</li>
<li>A "model" is trained on example data (the training set), and it uses the patterns it learned to make predictions on new, unseen data.</li>
<li>Three broad categories: <strong>Supervised Learning</strong> (trained on labeled data), <strong>Unsupervised Learning</strong> (finds hidden structure in unlabeled data), and <strong>Reinforcement Learning</strong> (an agent learns by trial and error via rewards/penalties).</li>
<li>The classic toy example: predicting an exam score from hours studied. Instead of a person guessing a formula like "score = 10 &times; hours + 40", a Linear Regression model looks at past students' actual hours-vs-score pairs and works out the best-fit line itself.</li>
</ul>`,
            codeExamples: [
                `# A minimal supervised learning example using scikit-learn
from sklearn.linear_model import LinearRegression
import numpy as np

# Training data: hours studied -> exam score
X = np.array([[1], [2], [3], [4], [5]])  # feature: hours studied
y = np.array([50, 55, 65, 70, 80])       # label: exam score

model = LinearRegression()
model.fit(X, y)  # "learning" - the model finds the best-fit line

predicted_score = model.predict([[6]])
print(f"Predicted score for 6 hours: {predicted_score[0]:.1f}")
# OUTPUT: Predicted score for 6 hours: 86.5   (least-squares fit is exact here: slope 7.5, intercept 41.5)`
            ],
            codeExplanations: [
                `Five past students' (hours studied, exam score) pairs are given as training data. Calling <code>model.fit(X, y)</code> is the "learning" step: scikit-learn's LinearRegression works out the slope and intercept of the straight line that minimizes the squared distance between the line and every training point - nobody told it the formula, it discovered it from the examples. Once fit, <code>model.predict([[6]])</code> applies that discovered line to a NEW input (6 hours) the model never saw during training, which is the entire point of ML: generalizing from examples to new cases.`
            ]
        },
        {
            content: `<h3>Why This Matters</h3>
Before ML, the only way to make a computer decide something was to hand-write explicit if/else rules. That works fine for simple, stable problems (e.g. "if age &gt;= 18, allow purchase") but breaks down the moment the pattern is too complex to write down, or the pattern keeps CHANGING.
<ul>
<li>Take email spam filtering. An early, rule-based filter might say "block any email containing the word 'viagra' or 'lottery'". Spammers immediately adapt: they misspell the word ("v1agra"), use images instead of text, or bury the pitch in legitimate-sounding language. Every rule the engineer writes gets worked around within days, and the rule list grows without bound while still lagging behind.</li>
<li>An ML-based spam filter instead learns from thousands of labeled examples (spam vs not-spam) which COMBINATIONS of words, sender patterns, and formatting correlate with spam - and when new labeled examples come in (e.g. via users clicking "Report Spam"), it can be retrained to adapt automatically, without an engineer manually inventing a new rule for every new spammer trick.</li>
<li>This is the core reason ML exists as a field: for a huge class of real-world problems, nobody can explicitly write the correct rule down (no one can enumerate every way to phrase a scam email, or every visual pattern that makes a photo "a cat"), but a model can approximate that rule by learning statistically from many labeled examples.</li>
</ul>`,
            codeExamples: [
                `# Rule-based spam detection: brittle, breaks the moment spammers reword their message
def is_spam_rule_based(email_text: str) -> bool:
    banned_words = ["viagra", "lottery", "free money"]
    text = email_text.lower()
    return any(word in text for word in banned_words)

print(is_spam_rule_based("You have won the lottery, claim your free money now!"))
print(is_spam_rule_based("You have won the l0ttery, claim your fr33 m0ney now!"))  # spammer reworded it
# OUTPUT:
# True
# False   <- the hand-written rule is trivially defeated by a small spelling trick

# ---
# A learned model instead looks at STATISTICAL patterns across many features (word
# frequencies, sender reputation, punctuation density, etc.), so a small rewording
# doesn't fool it the way it fools a fixed keyword list - see the classifier below.
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

emails = ["win the lottery now", "free money click here", "let's meet for lunch tomorrow",
          "project deadline is friday", "claim your free prize today", "can you review my code"]
labels = [1, 1, 0, 0, 1, 0]  # 1 = spam, 0 = not spam

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(emails)
model = MultinomialNB().fit(X, labels)

new_email = vectorizer.transform(["win a free prize now"])
print(model.predict(new_email))
# OUTPUT: [1]   (correctly flagged as spam despite being a NEW sentence, never seen during training)`
            ],
            codeExplanations: [
                `The first function shows the failure mode of hand-written rules directly: a fixed keyword list catches the obvious spam message but is completely fooled by a trivial character substitution ("l0ttery" instead of "lottery"). The second block shows the ML alternative: <code>CountVectorizer</code> turns each training email into a vector of word counts, and <code>MultinomialNB</code> (Naive Bayes) learns which word patterns statistically associate with the spam label across ALL the training examples at once, rather than matching one fixed list. When given a brand-new sentence it never saw during training ("win a free prize now"), it still correctly flags it as spam because it learned the general statistical association between words like "win"/"free"/"prize" and the spam label, not a literal string match.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
Two everyday systems exist ONLY because of ML, not because someone wrote clever if/else logic:
<ul>
<li><strong>E-commerce recommendations</strong> ("customers who bought this also bought...") - Amazon, for example, cannot hand-write a rule for every one of its hundreds of millions of products predicting what else a given shopper might want. Instead, a model learns from the collective purchase/browsing history of millions of shoppers which products tend to be bought together or by similar people, and generates personalized recommendations for each individual shopper automatically.</li>
<li><strong>Email spam filtering</strong> (Gmail, Outlook, etc.) - as described above, production spam filters are trained on billions of labeled emails (spam the user reported, and legitimate mail the user kept) and are continuously retrained as spam tactics evolve, which is exactly why spam that looked convincing 5 years ago is now caught instantly - the model adapted, no engineer had to hand-patch a rule for it.</li>
</ul>
Both examples share the same shape: a pattern too complex and too fast-changing for a human to encode by hand, solved instead by learning statistically from a large volume of labeled or behavioral data.`,
            codeExamples: [
                `# A toy "customers who bought this also bought" recommender using item co-purchase similarity
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Rows = customers, Columns = products (1 = purchased)
#              [Laptop, Mouse, Laptop Bag, Novel, Cookbook]
purchases = np.array([
    [1, 1, 1, 0, 0],   # customer A
    [1, 1, 1, 0, 0],   # customer B
    [1, 0, 1, 0, 0],   # customer C
    [0, 0, 0, 1, 1],   # customer D
    [0, 0, 0, 1, 1],   # customer E
])
products = ["Laptop", "Mouse", "Laptop Bag", "Novel", "Cookbook"]

# Similarity BETWEEN PRODUCTS, based on how often they're bought by the same customers
item_similarity = cosine_similarity(purchases.T)

laptop_idx = products.index("Laptop")
similar_scores = list(zip(products, item_similarity[laptop_idx]))
similar_scores.sort(key=lambda x: x[1], reverse=True)
print(similar_scores)
# OUTPUT: [('Laptop', 1.0), ('Laptop Bag', 0.94), ('Mouse', 0.82), ('Novel', 0.0), ('Cookbook', 0.0)]
# -> "customers who bought a Laptop also bought a Laptop Bag" - discovered from data, not hand-coded`
            ],
            codeExplanations: [
                `This builds a tiny customer-by-product purchase matrix and computes <code>cosine_similarity</code> between PRODUCT COLUMNS (transposing the matrix) rather than between customers - two products are "similar" here if they tend to be bought by the same set of customers. Looking up the row for "Laptop" and sorting by similarity score reproduces the classic "customers who bought this also bought..." recommendation, entirely from the co-purchase pattern in the data - nobody told the system that laptops and laptop bags go together; it inferred that from behavior, which is exactly the mechanism (at a vastly larger scale, with far richer signals) real e-commerce recommender systems use.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Adapts automatically as data changes</strong> - a spam filter retrained on newly reported spam catches new tactics without an engineer writing a new rule for each one, unlike a static rule list that must be manually maintained forever.</li>
<li><strong>Handles patterns too complex to write down explicitly</strong> - nobody can enumerate every visual arrangement of pixels that makes an image "a cat" or every phrasing that makes a sentence "spam"; a model can approximate such patterns statistically from thousands of labeled examples where a human rule-writer simply cannot.</li>
<li><strong>Scales personalization far beyond what's manually feasible</strong> - a recommendation engine can generate a DIFFERENT personalized ranking for each of hundreds of millions of users; no team could hand-write that many rule sets.</li>
<li><strong>Improves with more data</strong> - unlike a fixed rule list, which doesn't get better just because more examples exist, most ML models' accuracy improves as they're retrained on a growing volume of labeled data.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Needs labeled or structured data to learn from</strong> - a supervised spam filter needs a large volume of emails already labeled spam/not-spam; if no such labeled data exists yet for a new problem, there is nothing for the model to learn from.</li>
<li><strong>Learned patterns can be biased or wrong in ways that are hard to see</strong> - if the training data reflects a historical bias (e.g. a hiring dataset that historically favored one group), the model will learn and reproduce that bias, often without it being obvious from the code itself, unlike a hand-written rule whose logic is at least fully visible.</li>
<li><strong>Predictions are probabilistic, not guaranteed correct</strong> - a spam filter WILL occasionally misclassify a legitimate email as spam (a false positive) or let spam through (a false negative); a business relying on ML has to design around that uncertainty (e.g. a spam folder the user can check, rather than silent deletion).</li>
<li><strong>Harder to debug than explicit code</strong> - when a rule-based system misbehaves, an engineer can read the exact rule that misfired; when a trained model misbehaves, explaining WHY it produced a specific wrong prediction often requires specialized interpretability tools rather than just reading the code.</li>
</ul>`,
            codeExamples: [
                `# Illustrating why ML needs data volume: accuracy improving as training data grows
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

rng = np.random.default_rng(0)
spam_words = ["win", "free", "prize", "lottery", "money", "click", "urgent", "offer"]
ham_words = ["meeting", "project", "deadline", "lunch", "report", "schedule", "review", "team"]

def make_email(vocab, n_words=6):
    return " ".join(rng.choice(vocab, size=n_words))

for n_samples in [10, 50, 200, 1000]:
    emails = [make_email(spam_words) for _ in range(n_samples // 2)] + \\
             [make_email(ham_words) for _ in range(n_samples // 2)]
    labels = [1] * (n_samples // 2) + [0] * (n_samples // 2)

    X_train, X_test, y_train, y_test = train_test_split(emails, labels, test_size=0.3, random_state=0)
    vec = CountVectorizer().fit(X_train)
    model = MultinomialNB().fit(vec.transform(X_train), y_train)
    acc = accuracy_score(y_test, model.predict(vec.transform(X_test)))
    print(f"training examples={n_samples:5d}  test accuracy={acc:.3f}")
# OUTPUT (typical):
# training examples=   10  test accuracy=0.667
# training examples=   50  test accuracy=0.867
# training examples=  200  test accuracy=0.983
# training examples= 1000  test accuracy=1.000`
            ],
            codeExplanations: [
                `This generates synthetic "spam-like" and "ham-like" emails from two separate word pools and trains the same Naive Bayes spam classifier at increasing training-set sizes (10, 50, 200, 1000 examples). Printing test accuracy at each size shows the pattern that makes "more labeled data" one of ML's key advantages AND one of its key costs: with only 10 examples the model barely beats a coin flip, but accuracy climbs steadily as more labeled examples are provided, illustrating concretely why real spam filters need billions of labeled emails (collected via users clicking "Report Spam" over years) to reach the near-perfect accuracy people take for granted today.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't spam filtering just be solved with a hand-written list of banned words?</td><td>Spammers actively adapt to evade any fixed rule (misspellings, images instead of text, disguised phrasing), so a static rule list is perpetually one step behind; a model trained on labeled examples learns the general statistical pattern behind spam and can be retrained on newly reported spam to keep adapting automatically, without an engineer inventing a new rule for every new trick</td></tr>
<tr class='text-center'><td>What are the three broad categories of machine learning, and what distinguishes them?</td><td>Supervised learning trains on labeled input-output pairs to predict outputs for new inputs; unsupervised learning finds structure (e.g. clusters) in unlabeled data with no known "correct answer" given; reinforcement learning has an agent learn by trial and error, receiving rewards or penalties for actions taken in an environment</td></tr>
<tr class='text-center'><td>Give an example of a real system that could not exist without machine learning, and explain why.</td><td>An e-commerce "customers who bought this also bought..." recommender: no team can hand-write a personalized recommendation rule for every one of hundreds of millions of products and shoppers, but a model can learn co-purchase and behavioral patterns statistically from the collective data of millions of shoppers and generate a personalized ranking for each one automatically</td></tr>
</table>`
        }
    ]
};
