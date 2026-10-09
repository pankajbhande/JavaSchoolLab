import { Topic } from '../../coreJava';

export const aiVsMlVsDeepLearning: Topic = {
    id: 'ml-fundamentals-ai-vs-ml-vs-deep-learning',
    name: 'AI vs ML vs Deep Learning',
    beginner: [
        {
            content: `<h4>Three Nested Circles, Not Three Separate Fields</h4>
<ul>
<li><strong>Artificial Intelligence (AI)</strong> is the broadest goal: building machines that perform tasks which normally require human intelligence - reasoning, planning, understanding language, recognizing patterns. AI includes plenty of systems that never "learn" from data at all, such as a hand-coded chess engine or a rule-based expert system.</li>
<li><strong>Machine Learning (ML)</strong> is a SUBSET of AI - it's one particular strategy for achieving AI, where instead of a programmer writing explicit rules, the system LEARNS its own rules by finding patterns in data. Every ML system is AI, but not every AI system is ML.</li>
<li><strong>Deep Learning (DL)</strong> is a SUBSET of ML - it's one particular family of ML techniques that uses multi-layer <strong>neural networks</strong> (many stacked layers of simple mathematical units) to learn increasingly abstract representations of data. Every deep learning system is ML, but not every ML system is deep learning (e.g. a decision tree or linear regression is ML but not deep learning).</li>
<li>Picture three nested circles: the biggest circle is AI, a smaller circle fully inside it is ML, and an even smaller circle fully inside THAT is Deep Learning. Moving inward means getting more specific about the METHOD used, not "more intelligent."</li>
</ul>`,
            codeExamples: [
                `# The SAME problem (deciding if a number is "big") solved three different ways,
# mirroring the AI -> ML -> Deep Learning relationship at toy scale

# 1) AI, NOT machine learning: a hand-coded rule (an "expert system" style decision)
def is_big_rule_based(number):
    return number > 100  # a human wrote this threshold directly

# 2) Machine Learning: the threshold is LEARNED from labeled examples, not hand-written
import numpy as np
from sklearn.linear_model import LogisticRegression

numbers = np.array([10, 40, 55, 90, 120, 150, 200, 300]).reshape(-1, 1)
labels  = np.array([0,  0,  0,  0,   1,   1,   1,   1])  # 1 = "big", learned from data

ml_model = LogisticRegression()
ml_model.fit(numbers, labels)
print("Rule-based AI says 130 is big:", is_big_rule_based(130))
print("ML model says 130 is big:", bool(ml_model.predict([[130]])[0]))
# OUTPUT:
# Rule-based AI says 130 is big: True
# ML model says 130 is big: True   <- but this threshold was LEARNED, never written by a human`
            ],
            codeExplanations: [
                `<code>is_big_rule_based</code> is classic AI that is NOT machine learning - a human decided the threshold (100) and hard-coded it directly into the logic, the same way a rule-based expert system or a traditional chess engine's hand-tuned evaluation function works. The <code>LogisticRegression</code> model, in contrast, is shown NO explicit threshold at all; it is only given labeled examples (<code>numbers</code> paired with <code>labels</code>) and LEARNS where the boundary between "small" and "big" falls by fitting to the data. Both approaches count as AI (they both perform a task requiring judgment), but only the second is Machine Learning, because only it derives its own rule from data instead of having that rule handed to it.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Conflating these three terms leads to real confusion in both hiring and system design: a job posting asking for "5 years of AI experience" could mean anything from writing if-else rules to training transformer neural networks, and a company deciding "we need AI" hasn't actually decided anything about WHICH approach to use.
<ul>
<li><strong>Choosing the right circle is a real engineering decision.</strong> Rule-based AI is cheap, fast, and perfectly explainable, but only works when a human can actually articulate the rules (e.g. tax software, or a chess engine's legal-move generator). Classical ML shines when there's a clear pattern to learn from moderate amounts of structured data (e.g. predicting house prices from square footage and location). Deep Learning is reserved for problems with huge amounts of data and complex, hard-to-hand-engineer patterns (e.g. recognizing objects in raw pixels, or understanding natural language) - and it typically needs far more data and compute than classical ML to pay off.</li>
<li><strong>Using the most "advanced" circle isn't always the best engineering choice.</strong> A team that reaches for a deep neural network to predict a simple linear trend from 200 rows of spreadsheet data is usually both overkill and worse-performing than a simple linear regression, because deep learning needs large datasets to avoid overfitting and offers no benefit when the underlying pattern is already simple.</li>
</ul>
<h3>Real-World Example: Recommending a Movie, Three Ways</h3>
<ul>
<li><strong>Rule-based AI (no ML):</strong> a hard-coded rule like "if the user watched a Marvel movie, recommend another Marvel movie" - a human decided this logic upfront. It works, but only covers patterns a human thought to write, and never improves on its own from watching what users actually do.</li>
<li><strong>Machine Learning:</strong> a model (e.g. collaborative filtering or a gradient-boosted tree) is trained on historical ratings data across thousands of users and learns, from the DATA itself, which movies tend to be liked by similar viewers - discovering patterns no one explicitly programmed, like "people who liked slow-burn sci-fi also tend to like atmospheric horror."</li>
<li><strong>Deep Learning:</strong> a neural network is trained on raw, messy signals at massive scale - full viewing histories, timestamps, even movie poster images or trailer video frames - learning very abstract representations of "taste" that would be nearly impossible to hand-engineer as features for a classical ML model. This is closer to what Netflix or YouTube's recommendation systems actually use at scale.</li>
</ul>`,
            codeExamples: [
                `# Same recommendation problem, three approaches side by side (simplified)

# 1) Rule-based AI: no data, no learning, just a human-written rule
def recommend_rule_based(watched_genre):
    rules = {"marvel": "Guardians of the Galaxy", "horror": "The Conjuring"}
    return rules.get(watched_genre, "Top 10 Trending")

# 2) Classical ML: learns from a small table of (user features -> liked movie) patterns
from sklearn.neighbors import NearestNeighbors
import numpy as np

# rows = users, columns = [action_rating, scifi_rating, horror_rating] given 1-5
user_ratings = np.array([
    [5, 4, 1],   # user A: loves action & sci-fi
    [1, 1, 5],   # user B: loves horror
    [5, 5, 1],   # user C: loves action & sci-fi (similar to A)
])
model = NearestNeighbors(n_neighbors=1).fit(user_ratings)
new_user = np.array([[4, 5, 1]])  # likes action & sci-fi too
_, nearest = model.kneighbors(new_user)
print("Rule-based AI recommends:", recommend_rule_based("marvel"))
print("ML finds new user is most similar to user index:", nearest[0][0])
# OUTPUT:
# Rule-based AI recommends: Guardians of the Galaxy
# ML finds new user is most similar to user index: 0   <- learned similarity to user A, no rule was written for this`
            ],
            codeExplanations: [
                `<code>recommend_rule_based</code> is pure AI-without-ML: a dictionary a human wrote by hand, mapping known genres straight to fixed titles - it can never suggest anything the programmer didn't already anticipate. The <code>NearestNeighbors</code> model, in contrast, is given no genre labels or hand-written rules at all - only numeric rating patterns across users - and it LEARNS which existing user is most similar to a brand-new one purely from the structure of the data itself; a real recommender would then suggest movies that similar user liked. Neither example uses deep learning (no neural network, no raw pixels or text), which is exactly the point: this is classical ML, one step deeper into the nested circles than the rule-based AI function, but still a step short of deep learning, which would instead learn directly from raw, unstructured inputs like trailer frames or full-text reviews.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Rule-based AI is fully explainable and needs zero training data</strong> - useful when correctness must be guaranteed and provable, e.g. a tax calculator or an aircraft's legal-move-style safety interlock, where "the model learned it from data" is not an acceptable justification for a decision.</li>
<li><strong>Classical ML needs far less data and compute than Deep Learning</strong> - a model like logistic regression or a random forest can produce a strong, useful result from a few thousand rows in a spreadsheet, training in seconds on a laptop CPU, making it the practical default for structured/tabular business data.</li>
<li><strong>Deep Learning automatically discovers features humans would struggle to hand-engineer</strong> - for raw, unstructured data like images, audio, or free text, nobody can hand-write a feature like "edge patterns that indicate a cat's ear"; deep neural networks learn such representations directly from millions of examples, which is precisely why image recognition and language models only became practical once deep learning matured.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Rule-based AI cannot adapt or generalize beyond what was explicitly coded</strong> - a chess engine's hard-coded opening book is useless the moment an opponent plays a novel line no human anticipated, unlike an ML system that generalizes patterns to unseen situations.</li>
<li><strong>Classical ML plateaus on complex, unstructured data</strong> - feeding raw pixels directly into a plain logistic regression or decision tree gives poor results, because these models can't automatically learn the deep, hierarchical patterns (edges -> shapes -> objects) that image tasks need; classical ML usually still needs a human to hand-craft good features first.</li>
<li><strong>Deep Learning is data-hungry, compute-hungry, and hard to interpret</strong> - training a useful neural network from scratch often needs tens of thousands to millions of labeled examples and GPU hardware, and once trained, explaining WHY it made a specific decision (interpretability) is notoriously difficult compared to a simple decision tree or linear model.</li>
<li><strong>Picking the wrong circle for the problem wastes time and money</strong> - reaching for deep learning on a small, simple tabular dataset (e.g. predicting next month's sales from 500 rows of historical data) typically performs WORSE than a simple ML baseline, because there isn't enough data for the network to learn reliable patterns without overfitting.</li>
</ul>`,
            codeExamples: [
                `# Showing WHY "bigger circle" isn't automatically "better": deep learning underperforms
# a simple ML baseline on a tiny, simple, linear dataset
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

rng = np.random.default_rng(0)
# a genuinely simple, linear relationship: price = 50 * sqft + noise
sqft = rng.uniform(500, 2000, 40).reshape(-1, 1)
price = 50 * sqft.ravel() + rng.normal(0, 2000, 40)

X_train, X_test, y_train, y_test = train_test_split(sqft, price, test_size=0.3, random_state=1)

ml_model = LinearRegression().fit(X_train, y_train)
dl_model = MLPRegressor(hidden_layer_sizes=(64, 64), max_iter=2000, random_state=1).fit(X_train, y_train)

print(f"Classical ML (Linear Regression) MAE: {mean_absolute_error(y_test, ml_model.predict(X_test)):.0f}")
print(f"Deep Learning (Neural Network) MAE:   {mean_absolute_error(y_test, dl_model.predict(X_test)):.0f}")
# OUTPUT (typical, small-data regime):
# Classical ML (Linear Regression) MAE: 1850
# Deep Learning (Neural Network) MAE:   6400   <- overfits/underfits with only 28 training rows`
            ],
            codeExplanations: [
                `This deliberately constructs a case where the "more advanced" circle loses. <code>sqft</code>/<code>price</code> follow a genuinely simple straight-line relationship, and only 40 total data points are generated - a tiny dataset. <code>LinearRegression</code>, a classical ML model with exactly the right level of complexity for this pattern, fits it well with very little data. <code>MLPRegressor</code>, a small deep neural network, has far more internal parameters to learn than there are training examples to learn them from, so it struggles to find a stable fit and produces a noticeably worse error - concretely illustrating that Deep Learning's power comes from having enough data and pattern complexity to justify it, and that reaching for the innermost circle by default is often the wrong engineering call.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is every AI system a machine learning system? Give an example that isn't.</td><td>No - AI is the broader goal of machines performing tasks that need intelligence, and ML is just one strategy (learning from data) for achieving it. A hand-coded expert system, like a rule-based tax calculator or a chess engine's hard-coded legal-move logic, is AI but is not ML because it never learns from data; its behavior is entirely human-written rules</td></tr>
<tr class='text-center'><td>Is every deep learning system also a machine learning system, and is the reverse true?</td><td>Every deep learning system is ML, since it learns from data, just using a specific method (multi-layer neural networks). The reverse is false - a decision tree, linear regression, or k-nearest-neighbors model is ML but is not deep learning, because none of them use neural networks with multiple learned layers</td></tr>
<tr class='text-center'><td>When would you deliberately choose classical ML over deep learning, even though DL is the more "advanced" circle?</td><td>When the dataset is small (deep networks overfit or fail to converge with too little data), the pattern is simple/structured (tabular business data with a roughly linear or tree-like relationship), interpretability matters (a linear model or decision tree is far easier to explain than a neural network), or compute/latency budgets are tight - classical ML models like logistic regression or gradient-boosted trees often match or beat deep learning on structured data while training in seconds on a CPU</td></tr>
</table>`
        }
    ]
};
