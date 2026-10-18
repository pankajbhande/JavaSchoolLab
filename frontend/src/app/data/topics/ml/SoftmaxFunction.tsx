import { Topic } from '../../coreJava';

export const softmaxFunction: Topic = {
    id: 'ml-classification-softmax-function',
    name: 'Softmax Function',
    beginner: [
        {
            content: `<h3>Sigmoid's Generalization to Many Classes</h3>
The <strong>softmax function</strong> converts a vector of raw scores (one per class) into a vector of probabilities that all sum to exactly 1.0. Where sigmoid handles a single binary yes/no, softmax handles any number of classes at once.
<ul>
<li>For each raw score, softmax exponentiates it, then divides by the sum of ALL the exponentials - a class with a higher raw score than the others ends up with a proportionally higher probability.</li>
<li>Because every output is guaranteed positive (thanks to the exponential) and they all sum to 1, the result is a valid probability distribution over the classes.</li>
</ul>`,
            codeExamples: [
                `import numpy as np

def softmax(scores):
    exp_scores = np.exp(scores)
    return exp_scores / np.sum(exp_scores)

raw_scores = np.array([2.0, 1.0, 0.1])  # raw scores for 3 classes
probabilities = softmax(raw_scores)

print(f"Probabilities: {probabilities}")
print(f"Sum: {probabilities.sum():.4f}")
# OUTPUT: Probabilities: [0.6590 0.2424 0.0986] / Sum: 1.0000`
            ],
            codeExplanations: [
                `Three raw scores (2.0, 1.0, 0.1) - which could be any real numbers, in any order of magnitude - are converted into a clean probability distribution. The highest raw score (2.0) receives the highest probability (0.659), and all three outputs sum to exactly 1.0, confirming that softmax has turned arbitrary scores into something that can be interpreted as "probability of each class."`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Sigmoid alone only handles a single probability for a binary outcome (positive vs negative). The moment a problem has THREE OR MORE classes, a different mechanism is needed to produce a coherent probability distribution across all of them simultaneously - that mechanism is softmax.
<ul>
<li>Softmax is mathematically a direct generalization of sigmoid: applying softmax to exactly two classes reduces to the same formula as sigmoid applied to the difference of their two raw scores.</li>
<li>Its normalization step (dividing by the sum of all exponentials) is what enforces the two properties needed for a valid probability distribution: every output is strictly positive, and they all sum to 1 - properties that simply applying sigmoid independently to each raw score would NOT guarantee.</li>
</ul>
<h3>Real-World Example: A 10-Class Digit Classifier's Final Layer</h3>
A neural network trained to recognize handwritten digits (0 through 9) produces one raw score per digit in its final layer - these ten numbers can be any real values and don't sum to anything meaningful on their own. Applying softmax converts them into ten probabilities that sum to exactly 1.0, so the network can report something like "94% confident this is a 7, 4% chance it's a 1, 2% spread across the rest" - a genuine probability distribution over all 10 possible digits.`,
            codeExamples: [
                `# A 10-class digit classifier's raw output layer scores, converted by softmax into probabilities
import numpy as np

def softmax(scores):
    shifted = scores - np.max(scores)  # numerical stability trick, doesn't change the result
    exp_scores = np.exp(shifted)
    return exp_scores / np.sum(exp_scores)

# Raw, unnormalized scores the network produced for digits 0-9, given an image of a "7"
raw_scores = np.array([-1.2, 0.3, -0.5, 0.1, -2.0, -0.8, -3.1, 5.4, -0.2, 1.0])
probabilities = softmax(raw_scores)

predicted_digit = np.argmax(probabilities)
print(f"Predicted digit: {predicted_digit}  confidence: {probabilities[predicted_digit]:.3f}")
print(f"Full distribution sums to: {probabilities.sum():.4f}")
# OUTPUT (typical):
# Predicted digit: 7  confidence: 0.939
# Full distribution sums to: 1.0000`
            ],
            codeExplanations: [
                `Ten raw scores, one per digit class, are produced by a hypothetical final network layer for an image that is actually a "7" - note the raw score for class 7 (5.4) is much larger than the rest, but these numbers on their own aren't probabilities. After softmax, the output is a full probability distribution over all ten digits that sums to exactly 1.0, with digit 7 receiving the overwhelming majority of that probability mass (93.9%) - directly reflecting that its raw score was far higher than any other class's.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Produces a valid probability distribution across any number of classes</strong> - every output is positive and the full vector sums to exactly 1, so it can be interpreted directly as "how likely is each class," unlike raw, unnormalized scores.</li>
<li><strong>Preserves relative ranking while amplifying differences</strong> - because it's built on exponentials, a class with a modestly higher raw score gets pushed towards a disproportionately higher probability, which tends to produce confident, well-separated outputs when the underlying scores are genuinely different.</li>
<li><strong>Differentiable everywhere</strong> - like sigmoid, softmax's smooth gradient makes it compatible with gradient-based training via backpropagation, which is why it's the standard final layer for multiclass neural networks.</li>
<li><strong>Pairs naturally with cross-entropy loss</strong> - the combination of softmax output and cross-entropy loss has a particularly clean, numerically well-behaved gradient, which is part of why this pairing is the near-universal default for multiclass classification training.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Can produce overconfident probabilities</strong> - because of the exponential amplification, softmax often pushes the top class's probability very close to 1.0 even when the underlying raw scores weren't THAT different, which can overstate a model's real confidence (a calibration concern, similar to the one discussed for binary probability prediction).</li>
<li><strong>Numerically unstable without care</strong> - exponentiating a very large raw score can overflow standard floating-point numbers; in practice, implementations subtract the maximum score from all scores first (as shown above) to keep the exponentials in a safe numeric range without changing the final result.</li>
<li><strong>Assumes classes are mutually exclusive</strong> - softmax forces all class probabilities to sum to 1, so it's the wrong choice whenever multiple labels can genuinely apply to the same input at once (multi-label classification), where independent sigmoids per label are used instead.</li>
<li><strong>Sensitive to the relative scale of raw scores</strong> - if the raw scores are all very close together, softmax outputs a nearly uniform distribution; if they're spread far apart, it outputs a near-one-hot distribution, so the network's ability to control that raw-score spread affects how "decisive" the reported probabilities look.</li>
</ul>`,
            codeExamples: [
                `# Softmax overconfidence and numerical stability: same relative ranking, different score spread
import numpy as np

def softmax(scores):
    shifted = scores - np.max(scores)
    exp_scores = np.exp(shifted)
    return exp_scores / np.sum(exp_scores)

close_scores = np.array([1.0, 1.1, 0.9])     # classes nearly tied
spread_scores = np.array([1.0, 5.0, -3.0])   # one class clearly dominant
huge_scores = np.array([1000.0, 999.0, 998.0])  # would overflow without the max-subtraction trick

for name, scores in [("close", close_scores), ("spread", spread_scores), ("huge", huge_scores)]:
    print(f"{name:7s} -> {softmax(scores)}")
# OUTPUT (typical):
# close   -> [0.332 0.368 0.300]   <- fairly uniform, reflects genuine uncertainty
# spread  -> [0.018 0.976 0.000]   <- highly confident in class 1
# huge    -> [0.665 0.245 0.090]   <- large scores handled safely thanks to max-subtraction`
            ],
            codeExplanations: [
                `Three sets of raw scores illustrate softmax's behavior under different score spreads: nearly-tied scores produce a nearly uniform distribution (genuine uncertainty is preserved), a clearly dominant score produces a highly confident, near-one-hot distribution, and very large raw scores (which would cause <code>np.exp()</code> to overflow if exponentiated directly) are handled safely because the maximum score is subtracted from all scores before exponentiating - a standard numerical-stability trick that leaves the final softmax result mathematically unchanged.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the softmax function compute, and how does it relate to sigmoid?</td><td>Softmax takes a vector of raw scores (one per class), exponentiates each one, and divides by the sum of all the exponentials, producing a probability for each class that are all positive and sum to exactly 1; it is a direct generalization of sigmoid to more than two classes - applying softmax to exactly two classes reduces to the same formula as sigmoid</td></tr>
<tr class='text-center'><td>Why do softmax outputs sum to exactly 1, and why does that matter?</td><td>The normalization step (dividing each exponentiated score by the sum of all exponentiated scores) forces the outputs to sum to 1 by construction, which is what makes them interpretable as a valid probability distribution over mutually exclusive classes - e.g. "94% digit 7, 4% digit 1, 2% spread across the rest"</td></tr>
<tr class='text-center'><td>Why is the maximum score subtracted from all scores before exponentiating in a typical softmax implementation?</td><td>Purely for numerical stability - exponentiating a very large raw score can overflow floating-point precision; subtracting the maximum score from every score first keeps all the exponentials in a safe numeric range without changing the final normalized probabilities, since it's mathematically equivalent to the un-shifted computation</td></tr>
</table>`
        }
    ]
};
