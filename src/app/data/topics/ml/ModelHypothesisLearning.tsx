import { Topic } from '../../coreJava';

export const modelHypothesisLearning: Topic = {
    id: 'ml-fundamentals-model-hypothesis-learning',
    name: 'Model, Hypothesis & Learning',
    beginner: [
        {
            content: `<h4>A Model Is a Function, a Hypothesis Is One Candidate, Learning Is the Search</h4>
<ul>
<li>A <strong>Model</strong> is a mathematical function that maps inputs to outputs - e.g. "Linear Regression" is a whole FAMILY of functions of the form <code>y = w&#8321;x&#8321; + w&#8322;x&#8322; + ... + b</code>, for any choice of weights.</li>
<li>A <strong>Hypothesis</strong> is one SPECIFIC function from that family - one particular choice of weights <code>w</code> and bias <code>b</code>. All the hypotheses a model COULD represent together form its <strong>hypothesis space</strong>.</li>
<li><strong>Learning</strong> (training) is the process of searching through the hypothesis space - usually with an algorithm like gradient descent - to find the one hypothesis that fits the training data best.</li>
</ul>`,
            codeExamples: [
                `# Watching "learning" search through a hypothesis space of candidate lines (weight, bias)
import numpy as np

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, 50)
y = 3 * X + 7 + rng.normal(0, 1, 50)   # true hypothesis: weight=3, bias=7 (plus noise)

def mse(w, b):
    predictions = w * X + b
    return np.mean((predictions - y) ** 2)

# "Learning" = searching the hypothesis space (every possible w, b) for the best-fitting one
w, b = 0.0, 0.0          # start with an arbitrary hypothesis: the flat line y = 0
learning_rate = 0.01
for step in range(500):
    grad_w = np.mean(2 * (w * X + b - y) * X)
    grad_b = np.mean(2 * (w * X + b - y))
    w -= learning_rate * grad_w
    b -= learning_rate * grad_b

print(f"Starting hypothesis: y = 0*x + 0   (MSE={mse(0, 0):.2f})")
print(f"Learned hypothesis:  y = {w:.2f}*x + {b:.2f}   (MSE={mse(w, b):.2f})")
# OUTPUT (typical):
# Starting hypothesis: y = 0*x + 0   (MSE=353.71)
# Learned hypothesis:  y = 2.97*x + 7.21   (MSE=0.98)`
            ],
            codeExplanations: [
                `The linear regression MODEL is the family of all functions <code>y = w*x + b</code>. Each specific <code>(w, b)</code> pair - including the starting <code>(0, 0)</code> and every value visited during the loop - is one HYPOTHESIS from that family. The loop performs LEARNING: it uses the gradients of the mean squared error to repeatedly nudge <code>w</code> and <code>b</code> toward values that fit the data better, ending on a hypothesis very close to the true relationship (weight near 3, bias near 7) that generated the data.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>The hypothesis space DEFINES what a model can possibly represent, no matter how much training happens - if the true relationship isn't in the hypothesis space, no amount of learning can find it. This directly explains <strong>underfitting</strong>: a Linear Regression model's hypothesis space is "all straight lines," so if the true pattern is a curve, training will find the BEST straight line, but it will never find the curve, because a curve simply isn't a member of that hypothesis space.</li>
<li>Choosing a model is really choosing a hypothesis space, BEFORE any learning happens - picking Linear Regression vs. a Decision Tree vs. a Neural Network is picking a fundamentally different set of shapes the final function is allowed to take.</li>
<li>Learning algorithms (gradient descent, the CART splitting algorithm for trees, etc.) are search strategies over that space - different algorithms can search the same hypothesis space differently, with different speed, reliability, or tendency to get stuck, but they can't expand what's actually in the space.</li>
</ul>
<h3>Real-World Example</h3>
A team tries to predict a car's fuel efficiency (mpg) from its engine horsepower.
<ul>
<li>The true relationship is curved: efficiency drops sharply at first as horsepower increases, then levels off - a classic diminishing-returns curve.</li>
<li>If the team picks plain <strong>Linear Regression</strong>, its hypothesis space is only straight lines - training (learning) will find the single best-fitting STRAIGHT line through the curved data, but that line will systematically miss both the steep drop at low horsepower and the flattening at high horsepower, no matter how long training runs or how much data is added. This is underfitting caused entirely by a hypothesis space that's too restrictive for the true pattern.</li>
<li>Switching the MODEL to something with a richer hypothesis space - e.g. Polynomial Regression (adding <code>horsepower&sup2;</code> as a feature) or a Decision Tree (which can represent step-wise, non-linear shapes) - expands what hypotheses are even reachable, and only then can learning find a hypothesis that actually matches the curve.</li>
</ul>`,
            codeExamples: [
                `# Two different models = two different hypothesis spaces, searched on the SAME curved data
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
horsepower = np.sort(rng.uniform(50, 300, 60)).reshape(-1, 1)
# a curved, diminishing-returns true relationship
mpg = 60 - 40 * (1 - np.exp(-horsepower.ravel() / 100)) + rng.normal(0, 1.5, 60)

# Model A: plain Linear Regression - hypothesis space = straight lines only
linear_model = LinearRegression().fit(horsepower, mpg)
linear_mse = mean_squared_error(mpg, linear_model.predict(horsepower))

# Model B: Polynomial Regression (degree 3) - hypothesis space includes curves
poly_model = make_pipeline(PolynomialFeatures(degree=3), LinearRegression()).fit(horsepower, mpg)
poly_mse = mean_squared_error(mpg, poly_model.predict(horsepower))

print(f"Linear model (straight-line hypothesis space):   best-fit MSE = {linear_mse:.2f}")
print(f"Polynomial model (curved hypothesis space):       best-fit MSE = {poly_mse:.2f}")
# OUTPUT (typical):
# Linear model (straight-line hypothesis space):   best-fit MSE = 9.84
# Polynomial model (curved hypothesis space):       best-fit MSE = 2.11</br>(the curve was simply not reachable by a straight line, no matter how well the search ran)`
            ],
            codeExplanations: [
                `Both models are trained (learning happens) on the exact same curved data, using the same underlying least-squares search. <code>linear_model</code>'s hypothesis space contains only straight lines, so even its BEST possible hypothesis (the line minimizing error) still fits the curved data poorly - a ceiling that training cannot break through. <code>poly_model</code> first expands the features with <code>PolynomialFeatures(degree=3)</code>, which enlarges the hypothesis space to include curves, and only then does the identical learning algorithm find a hypothesis that tracks the true diminishing-returns shape far more closely, shown by the much lower MSE.`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<ul>
<li><strong>Advantage - a restricted hypothesis space acts as a safeguard against overfitting</strong> - a simple model like Linear Regression can't represent wild, overly-flexible curves that chase individual noisy points, so even without extra regularization it's naturally resistant to memorizing noise (though at the cost of possibly underfitting a genuinely complex pattern).</li>
<li><strong>Advantage - a rich hypothesis space can represent almost any relationship</strong> - deep neural networks have hypothesis spaces so large and flexible (the "universal approximation" property) that, given enough data and the right training, they can approximate extremely complex real-world functions like speech or image recognition that no simple formula could capture.</li>
<li><strong>Disadvantage - a hypothesis space that's too small guarantees underfitting</strong> - no amount of extra data, extra training time, or hyperparameter tuning can fix a Linear Regression model applied to a fundamentally non-linear problem; the fix has to be choosing a different MODEL, not tuning the existing one harder.</li>
<li><strong>Disadvantage - a hypothesis space that's too large risks overfitting and is harder/slower to search</strong> - a model with a huge, highly flexible hypothesis space (e.g. an unpruned deep Decision Tree, or a massive neural network) can easily find a hypothesis that fits training noise perfectly, and searching such a large space typically needs far more data and compute to reliably land on a hypothesis that generalizes well.</li>
</ul>`,
            codeExamples: [
                `# Hypothesis space size vs. overfitting - comparing three polynomial degrees on the same data
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(1)
X = np.sort(rng.uniform(0, 1, 40)).reshape(-1, 1)
y = np.sin(2 * np.pi * X.ravel()) + rng.normal(0, 0.2, 40)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

for degree in [1, 3, 15]:   # increasingly larger hypothesis spaces
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(X_train, y_train)
    train_mse = mean_squared_error(y_train, model.predict(X_train))
    test_mse = mean_squared_error(y_test, model.predict(X_test))
    print(f"degree={degree:2d}  train_mse={train_mse:.3f}  test_mse={test_mse:.3f}")
# OUTPUT (typical):
# degree= 1  train_mse=0.480  test_mse=0.540   <- hypothesis space too small: underfits (high error everywhere)
# degree= 3  train_mse=0.052  test_mse=0.068   <- hypothesis space well matched to the true pattern
# degree=15  train_mse=0.004  test_mse=0.410   <- hypothesis space too large: memorizes training noise`
            ],
            codeExplanations: [
                `Increasing <code>degree</code> enlarges the hypothesis space that <code>PolynomialFeatures</code> makes available to the linear regression search - degree 1 only allows straight lines, degree 15 allows extremely wiggly curves. Degree 1 underfits because the true sine-wave pattern simply isn't in such a small hypothesis space; degree 15 overfits because its enormous hypothesis space contains a hypothesis flexible enough to snake through every noisy training point exactly, which then fails badly on new test data - degree 3 sits at a hypothesis space size that's roughly the right complexity for the true underlying pattern.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between a model, a hypothesis, and learning?</td><td>A model is a family of possible functions (e.g. "all straight lines" for Linear Regression); a hypothesis is one specific function from that family (one particular choice of weights); learning is the process - typically an algorithm like gradient descent - of searching the model's hypothesis space to find the hypothesis that best fits the training data</td></tr>
<tr class='text-center'><td>Why can't a Linear Regression model learn a curved relationship, no matter how it's trained?</td><td>Linear Regression's hypothesis space consists only of straight lines - a curve is not a member of that space at all, so no search algorithm, however well-run, and no amount of additional training data can produce a curved hypothesis from it; fixing this requires choosing a different model (e.g. adding polynomial features) that expands the hypothesis space to include curves</td></tr>
<tr class='text-center'><td>How does hypothesis space size relate to underfitting and overfitting?</td><td>A hypothesis space that is too small/restrictive can't represent the true pattern at all, guaranteeing underfitting (high error on both training and test data); a hypothesis space that is too large/flexible can represent the training data's noise as well as its signal, risking overfitting (very low training error but high test error) - model choice is effectively choosing a hypothesis space of appropriate size for the problem</td></tr>
</table>`
        }
    ]
};
