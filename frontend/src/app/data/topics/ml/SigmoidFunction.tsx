import { Topic } from '../../coreJava';

export const sigmoidFunction: Topic = {
    id: 'ml-classification-sigmoid-function',
    name: 'Sigmoid Function',
    beginner: [
        {
            content: `<h3>Squashing Any Number Into [0, 1]</h3>
The <strong>sigmoid function</strong>, <code>&sigma;(x) = 1 / (1 + e&#8315;&#8348;)</code>, takes any real number - however large, small, positive, or negative - and squashes it into a value strictly between 0 and 1.
<ul>
<li>Very negative inputs map close to 0; very positive inputs map close to 1; an input of exactly 0 maps to exactly 0.5.</li>
<li>Its output shape is an S-curve, which is why it's called "sigmoid" (Greek for "S-shaped").</li>
</ul>`,
            codeExamples: [
                `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

for x in [-10, -2, 0, 2, 10]:
    print(f"sigmoid({x:>4}) = {sigmoid(x):.4f}")
# OUTPUT:
# sigmoid( -10) = 0.0000
# sigmoid(  -2) = 0.1192
# sigmoid(   0) = 0.5000
# sigmoid(   2) = 0.8808
# sigmoid(  10) = 1.0000`
            ],
            codeExplanations: [
                `Feeding a range of raw values - including large negative and positive numbers - through the sigmoid formula shows its defining behavior: no matter how extreme the input, the output always lands strictly between 0 and 1, and it passes through exactly 0.5 at an input of 0. This is what makes it suitable for converting an unbounded number into something interpretable as a probability.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Many models internally compute an unbounded linear combination of features (<code>w&#8321;x&#8321; + w&#8322;x&#8322; + ... + b</code>), which can be any real number - clearly unusable directly as a probability. Sigmoid is the standard bridge between that unbounded quantity and a valid [0, 1] probability.
<ul>
<li>In <strong>Logistic Regression</strong>, sigmoid is applied to the linear combination of features (the log-odds) to produce the model's final probability output - it is the one nonlinear step in an otherwise linear model.</li>
<li>Historically, sigmoid was also the default <strong>activation function</strong> used inside neural network hidden layers, since it gave each neuron a smooth, bounded, differentiable nonlinearity - important for gradient-based training via backpropagation.</li>
</ul>
<h3>Real-World Example: Logistic Regression's Raw Score Becoming a Probability</h3>
Logistic Regression's raw linear output (<code>w&#8321;x&#8321; + ... + b</code>) can be any number from negative infinity to positive infinity depending on the feature values and learned weights - a "probability" of -4.2 or 7.9 makes no sense on its own. Passing that raw score through sigmoid squashes it into a clean, valid probability between 0 and 1 that can be reported and thresholded.`,
            codeExamples: [
                `# Watching sigmoid convert Logistic Regression's raw linear score into a probability
import numpy as np
from sklearn.linear_model import LogisticRegression

X = np.array([[1], [2], [3], [4], [5], [6]])
y = np.array([0, 0, 0, 1, 1, 1])
model = LogisticRegression().fit(X, y)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for hours in [0.5, 3.5, 8]:
    raw_score = model.coef_[0][0] * hours + model.intercept_[0]  # unbounded, can be any real number
    probability = sigmoid(raw_score)                              # squashed into [0, 1]
    print(f"hours={hours:4}  raw_score={raw_score:6.2f}  probability={probability:.3f}")
# OUTPUT (typical):
# hours= 0.5  raw_score= -5.10  probability=0.006
# hours= 3.5  raw_score=  0.05  probability=0.512
# hours= 8.0  raw_score=  6.30  probability=0.998`
            ],
            codeExplanations: [
                `The raw linear score (<code>coef_ * x + intercept_</code>) is computed manually for three inputs, and it ranges from a large negative number to a large positive one - not something interpretable as a probability on its own. Applying the <code>sigmoid</code> function to each raw score converts it into a genuine [0, 1] probability, confirming that sigmoid is the exact mechanism by which Logistic Regression's internal linear computation becomes its externally reported probability.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Guarantees a valid probability-like output</strong> - no matter how extreme the input score, sigmoid's output is always strictly between 0 and 1, making it safe to interpret directly as a probability.</li>
<li><strong>Smooth and differentiable everywhere</strong> - this matters enormously for gradient-based optimization (like the gradient descent used to train Logistic Regression or a neural network), since the loss function's gradient can be computed cleanly at every point.</li>
<li><strong>Simple, well-understood closed-form derivative</strong> - sigmoid's derivative can be written directly in terms of its own output (<code>&sigma;'(x) = &sigma;(x)(1 - &sigma;(x))</code>), which historically made it computationally convenient for backpropagation.</li>
<li><strong>Intuitive S-shape</strong> - the function's behavior (confident near the extremes, uncertain near the middle) mirrors how humans think about the transition from "definitely no" to "definitely yes."</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Vanishing gradients at the tails</strong> - for large positive or negative inputs, sigmoid's curve is nearly flat, so its derivative is close to zero; in a deep neural network, chaining many such near-zero gradients together during backpropagation makes earlier layers learn extremely slowly or not at all.</li>
<li><strong>Not zero-centered</strong> - sigmoid's output is always positive (between 0 and 1), which can cause the gradient updates for a layer's weights to move in a biased, zig-zagging direction during training, slowing convergence.</li>
<li><strong>Largely replaced by ReLU in hidden layers</strong> - ReLU (<code>max(0, x)</code>) avoids the vanishing-gradient problem for positive inputs and is far cheaper to compute, which is why modern deep networks use sigmoid mainly at the OUTPUT layer for binary probabilities, not throughout the hidden layers.</li>
<li><strong>Computationally more expensive than simpler alternatives</strong> - sigmoid requires an exponential calculation per neuron, whereas ReLU is just a comparison, which adds up across millions of neurons in a large network.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating the vanishing-gradient problem: sigmoid's derivative flattens at the tails
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    s = sigmoid(x)
    return s * (1 - s)

def relu_derivative(x):
    return np.where(x > 0, 1.0, 0.0)

for x in [-10, -3, 0, 3, 10]:
    print(f"x={x:4}  sigmoid_grad={sigmoid_derivative(x):.5f}  relu_grad={relu_derivative(x):.2f}")
# OUTPUT:
# x= -10  sigmoid_grad=0.00005  relu_grad=0.00
# x=  -3  sigmoid_grad=0.04518  relu_grad=0.00
# x=   0  sigmoid_grad=0.25000  relu_grad=0.00
# x=   3  sigmoid_grad=0.04518  relu_grad=1.00
# x=  10  sigmoid_grad=0.00005  relu_grad=1.00`
            ],
            codeExplanations: [
                `Comparing sigmoid's derivative to ReLU's derivative across a range of inputs shows the vanishing-gradient problem directly: at x=10 (or x=-10), sigmoid's gradient has collapsed to nearly 0.00005 - meaning almost no learning signal flows backward through a neuron sitting in that region - while ReLU's gradient stays a full 1.0 for any positive input, no matter how large. This is exactly why deep networks with many hidden layers, where gradients from each layer multiply together during backpropagation, replaced sigmoid with ReLU in their hidden layers to keep the learning signal from disappearing.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the sigmoid function's formula, and what shape does it produce?</td><td><code>&sigma;(x) = 1 / (1 + e&#8315;&#8348;)</code>; it produces a smooth S-shaped curve where very negative inputs map close to 0, very positive inputs map close to 1, and an input of 0 maps to exactly 0.5 - always outputting a value strictly between 0 and 1</td></tr>
<tr class='text-center'><td>Why is sigmoid a natural choice for producing a binary probability output?</td><td>A model's raw internal score (e.g. a linear combination of features) can be any real number, which isn't directly interpretable as a probability; sigmoid squashes that unbounded value into the [0, 1] range in a smooth, differentiable way, so the result can be safely read as "probability of the positive class"</td></tr>
<tr class='text-center'><td>Why has ReLU mostly replaced sigmoid as the activation function in neural network hidden layers?</td><td>Sigmoid's curve is nearly flat for large positive or negative inputs, so its gradient there is close to zero; in a deep network, multiplying many such near-zero gradients together during backpropagation causes the vanishing-gradient problem, where earlier layers barely learn - ReLU keeps a constant gradient of 1 for any positive input, avoiding this issue and being cheaper to compute</td></tr>
</table>`
        }
    ]
};
