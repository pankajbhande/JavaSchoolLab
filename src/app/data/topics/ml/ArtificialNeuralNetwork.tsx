import { Topic } from '../../coreJava';

export const artificialNeuralNetwork: Topic = {
    id: 'ml-deep-learning-artificial-neural-network',
    name: 'Artificial Neural Network',
    beginner: [
        {
            content: `<h4>A Network of Simple Units Stacked in Layers</h4>
<ul>
<li>An <strong>Artificial Neural Network (ANN)</strong> is made of layers of <strong>neurons</strong>: an <strong>input layer</strong> (one unit per feature), one or more <strong>hidden layers</strong>, and an <strong>output layer</strong> (one unit per prediction, e.g. one per class).</li>
<li>Each neuron computes a WEIGHTED SUM of its inputs plus a <strong>bias</strong> term, then passes that sum through an <strong>activation function</strong> (e.g. <code>ReLU</code> or <code>sigmoid</code>) which introduces NON-LINEARITY - without it, stacking layers would collapse into nothing more than a single linear model, no matter how many layers you add.</li>
<li><strong>Weights</strong> and <strong>biases</strong> are the network's learnable parameters, adjusted during training via <strong>backpropagation</strong> so the network's predictions get closer to the true labels.</li>
</ul>`,
            codeExamples: [
                `# A small feedforward ANN for tabular binary classification (loan approval), using Keras
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow import keras

X, y = make_classification(n_samples=2000, n_features=12, weights=[0.7, 0.3], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = keras.Sequential([
    keras.layers.Dense(16, activation="relu", input_shape=(12,)),   # hidden layer 1
    keras.layers.Dense(8, activation="relu"),                        # hidden layer 2
    keras.layers.Dense(1, activation="sigmoid"),                     # output: probability of approval
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
model.fit(X_train, y_train, epochs=20, batch_size=32, verbose=0)

loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"Test accuracy: {acc:.3f}")
# OUTPUT (typical):
# Test accuracy: 0.913`
            ],
            codeExplanations: [
                `A <code>StandardScaler</code> is applied first because neural networks (unlike trees) are sensitive to feature scale - unscaled features with very different ranges make training slow and unstable. The <code>Sequential</code> model stacks three <code>Dense</code> (fully-connected) layers: two hidden layers with 16 and then 8 neurons using <code>relu</code> activation, followed by a single output neuron with <code>sigmoid</code> activation that squashes its result into a 0-1 probability of loan approval. <code>model.compile</code> configures training: <code>adam</code> as the optimizer (an efficient variant of gradient descent), and <code>binary_crossentropy</code> as the loss function appropriate for two-class probability outputs. <code>model.fit</code> runs 20 full passes (epochs) over the training data in batches of 32 examples, during which backpropagation repeatedly adjusts every weight and bias to reduce the loss, and <code>model.evaluate</code> reports how well the trained network generalizes to the untouched test set.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before neural networks were practical, complex non-linear relationships between features had to be captured by hand-engineered feature crosses or by simpler models like decision trees, which handle some non-linearity but struggle to model very high-dimensional, subtle interactions (e.g. raw pixel values in an image, or raw audio waveforms).</li>
<li>Linear models (logistic/linear regression) can only draw a straight decision boundary - problems where the true decision boundary is curved or highly interactive (e.g. XOR-like patterns) are provably impossible for a single linear model to solve, no matter how much data it sees.</li>
<li>ANNs solve this by stacking non-linear transformations: each hidden layer can warp the input space so that patterns which were tangled and inseparable in the raw features become simple and separable by the time they reach the output layer.</li>
</ul>
<h3>Real-World Example</h3>
A bank wants to predict <strong>loan approval risk</strong> from a mix of tabular features (income, credit history length, existing debt, employment years, etc.). The team first tries a small ANN like the one above. In practice, for this kind of STRUCTURED, TABULAR data with a modest number of features, a well-tuned Gradient Boosted Trees model (e.g. XGBoost) often matches or beats a small ANN's accuracy, trains much faster, needs no feature scaling, and is easier to explain to a regulator who requires model interpretability for credit decisions. The lesson the team learns: ANNs shine on UNSTRUCTURED, high-dimensional data (images, audio, text, raw sensor streams) where hand-designed features are impractical - for smaller tabular problems, simpler models are frequently the better engineering choice, and the extra complexity of a neural network should be justified by an actual accuracy gain, not used by default.`,
            codeExamples: [
                `# Manually implementing forward propagation + one backprop step for a tiny 2-layer network,
# to see exactly what training a network actually computes under the hood
import numpy as np

rng = np.random.default_rng(0)

# Tiny network: 3 inputs -> 4 hidden (ReLU) -> 1 output (sigmoid)
W1 = rng.normal(0, 0.5, (3, 4)); b1 = np.zeros(4)
W2 = rng.normal(0, 0.5, (4, 1)); b2 = np.zeros(1)

def relu(z): return np.maximum(0, z)
def relu_deriv(z): return (z > 0).astype(float)
def sigmoid(z): return 1 / (1 + np.exp(-z))

x = np.array([[0.5, -1.2, 0.3]])   # one training example, 3 features
y_true = np.array([[1.0]])         # true label

# --- Forward propagation ---
z1 = x @ W1 + b1          # weighted sum into hidden layer
a1 = relu(z1)              # hidden layer activations
z2 = a1 @ W2 + b2          # weighted sum into output layer
y_pred = sigmoid(z2)       # predicted probability

loss = -(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))  # binary cross-entropy
print(f"Prediction: {y_pred[0,0]:.4f}   Loss: {loss[0,0]:.4f}")

# --- Backpropagation: chain rule, layer by layer, output -> hidden -> input ---
dz2 = y_pred - y_true                     # dL/dz2 (derivative of BCE + sigmoid combined)
dW2 = a1.T @ dz2
db2 = dz2.sum(axis=0)

da1 = dz2 @ W2.T
dz1 = da1 * relu_deriv(z1)                # chain rule through ReLU
dW1 = x.T @ dz1
db1 = dz1.sum(axis=0)

lr = 0.1
W1 -= lr * dW1; b1 -= lr * db1
W2 -= lr * dW2; b2 -= lr * db2
print("Weights updated one gradient-descent step toward lower loss.")
# OUTPUT (typical):
# Prediction: 0.4863   Loss: 0.7211
# Weights updated one gradient-descent step toward lower loss.`
            ],
            codeExplanations: [
                `This strips away the Keras abstraction to show what "training a neural network" literally computes. The FORWARD PASS computes <code>z1 = x @ W1 + b1</code> (each hidden neuron's weighted sum of the 3 inputs plus its bias), applies <code>relu</code> to get the hidden activations <code>a1</code>, then repeats the same weighted-sum-plus-bias pattern into the single output neuron, finishing with <code>sigmoid</code> to turn the output into a 0-1 probability - this chain of "linear combination then non-linear activation, layer after layer" IS forward propagation. The binary cross-entropy <code>loss</code> measures how wrong that prediction was compared to the true label. BACKPROPAGATION then works backward through the exact same layers using the chain rule: <code>dz2 = y_pred - y_true</code> is the (algebraically simplified) gradient of the loss with respect to the output layer's pre-activation, <code>dW2</code>/<code>db2</code> are the gradients for the output layer's weights and bias, and those gradients are then propagated backward into the hidden layer (<code>da1</code>, then <code>dz1</code> using <code>relu_deriv</code> to account for the ReLU non-linearity) to compute <code>dW1</code>/<code>db1</code>. The final lines are one step of gradient descent: every weight and bias is nudged in the direction that REDUCES the loss, scaled by the <code>learning_rate</code> - repeating this forward-then-backward cycle thousands of times, across many examples, is exactly what <code>model.fit</code> automated in the earlier Keras example.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Learns complex non-linear patterns automatically</strong> - stacking layers lets the network discover feature interactions and curved decision boundaries without a human hand-engineering them, essential for tasks like image or speech recognition.</li>
<li><strong>Scales well with more data</strong> - unlike many classical models that plateau, a sufficiently large network's accuracy tends to keep improving as training data grows, which is why deep learning dominates domains with massive datasets (e.g. web-scale image or text corpora).</li>
<li><strong>Flexible architecture</strong> - the same core building block (layers of weighted sums + activations) can be specialized into CNNs for images, RNNs/Transformers for sequences, etc., by changing how layers connect.</li>
<li><strong>Transfer learning</strong> - a network trained on one large dataset (e.g. ImageNet) can be fine-tuned on a smaller, related dataset, letting teams with limited data still benefit from deep learning's representational power.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Data-hungry</strong> - a network with many parameters typically needs a LOT of labeled examples to train well; on a small tabular dataset (a few thousand rows), a Random Forest or Gradient Boosting model frequently outperforms a neural network simply because it needs far less data to find a good fit.</li>
<li><strong>Prone to overfitting without regularization</strong> - deep, high-capacity networks can memorize the training set outright; techniques like <code>Dropout</code>, weight decay (L2 regularization), and early stopping are usually necessary, not optional.</li>
<li><strong>Vanishing/exploding gradients in very deep networks</strong> - as gradients are propagated backward through many layers via the chain rule, they can shrink toward zero (early layers barely update, learning stalls) or blow up to huge values; this is why activation choice (e.g. ReLU over sigmoid in hidden layers) and techniques like batch normalization and residual connections matter for deep architectures.</li>
<li><strong>Low interpretability</strong> - it's hard to explain WHY a network produced a specific prediction in human terms, which is a real obstacle in regulated domains like lending or healthcare that require explainability, and part of why the loan-approval example above favored a simpler, more interpretable model.</li>
<li><strong>Expensive to train and tune</strong> - training often requires GPUs, and there are many more hyperparameters to tune (layer count, neurons per layer, learning rate, batch size, activation choice, regularization strength) than a classical model.</li>
</ul>`,
            codeExamples: [
                `# Showing overfitting risk and the effect of a Dropout layer as a mitigation
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from tensorflow import keras

X, y = make_classification(n_samples=400, n_features=20, n_informative=5, random_state=0)  # small, noisy dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

def build_model(use_dropout: bool):
    layers = [keras.layers.Dense(64, activation="relu", input_shape=(20,))]
    if use_dropout:
        layers.append(keras.layers.Dropout(0.5))   # randomly zeroes 50% of activations each training step
    layers += [keras.layers.Dense(64, activation="relu")]
    if use_dropout:
        layers.append(keras.layers.Dropout(0.5))
    layers.append(keras.layers.Dense(1, activation="sigmoid"))
    model = keras.Sequential(layers)
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model

for use_dropout in [False, True]:
    model = build_model(use_dropout)
    model.fit(X_train, y_train, epochs=100, verbose=0)
    train_acc = model.evaluate(X_train, y_train, verbose=0)[1]
    test_acc = model.evaluate(X_test, y_test, verbose=0)[1]
    label = "WITH Dropout" if use_dropout else "WITHOUT Dropout"
    print(f"{label:16s}  train_acc={train_acc:.3f}  test_acc={test_acc:.3f}")
# OUTPUT (typical):
# WITHOUT Dropout   train_acc=1.000  test_acc=0.783   <- memorized training data, gap to test = overfitting
# WITH Dropout      train_acc=0.912  test_acc=0.842   <- lower train accuracy, but generalizes noticeably better`
            ],
            codeExplanations: [
                `A deliberately small, noisy dataset (400 samples, only 5 truly informative out of 20 features) is used so a moderately-sized network (two 64-neuron hidden layers) has more than enough capacity to memorize it. The first model trains with no regularization at all; after 100 epochs it reaches 100% TRAINING accuracy but noticeably lower TEST accuracy - the gap between the two is the textbook signature of overfitting: the network memorized training-set-specific noise rather than the general pattern. The second model adds <code>Dropout(0.5)</code> layers, which during training randomly zero out 50% of that layer's activations on every batch, forcing the network to not rely too heavily on any single neuron or exact co-adapted pathway - this acts as a regularizer. Comparing the two results shows the typical Dropout effect: training accuracy goes down (the network can no longer perfectly memorize the data) while test accuracy goes UP, which is the whole point - regularization trades a bit of training fit for meaningfully better generalization.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why do neural networks need non-linear activation functions?</td><td>Without a non-linear activation between layers, stacking any number of layers of pure weighted sums mathematically collapses into a single equivalent linear transformation - no matter how "deep" the network looks, it could only ever represent what a plain linear model can, so non-linearities like ReLU or sigmoid are what actually let depth add representational power</td></tr>
<tr class='text-center'><td>What is backpropagation, in plain terms?</td><td>It's the algorithm that computes how much each weight and bias contributed to the network's prediction error, by applying the chain rule backward from the output layer's loss through each preceding layer, producing a gradient for every parameter; gradient descent then nudges each parameter slightly in the direction that reduces the loss, and this forward-then-backward cycle repeats over many batches of data until the network converges</td></tr>
<tr class='text-center'><td>What is the vanishing gradient problem and how is it commonly addressed?</td><td>In deep networks, gradients computed via the chain rule can shrink multiplicatively as they're propagated backward through many layers, causing early layers to receive almost no learning signal and stop improving; it's commonly addressed by using activation functions like ReLU (whose gradient doesn't saturate for positive inputs, unlike sigmoid/tanh), adding batch normalization, using residual/skip connections, and careful weight initialization</td></tr>
</table>`
        }
    ]
};
