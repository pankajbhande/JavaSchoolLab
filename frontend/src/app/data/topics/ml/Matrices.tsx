import { Topic } from '../../coreJava';

export const matrices: Topic = {
    id: 'ml-mathematics-matrices',
    name: 'Matrices',
    beginner: [
        {
            content: `<h4>A Table of Numbers - and the Engine Behind Every ML Model</h4>
<ul>
<li>A <strong>Matrix</strong> is a rectangular grid of numbers arranged in rows and columns, e.g. a 3x2 matrix has 3 rows and 2 columns. Matrices are just a natural extension of vectors - a vector is a matrix with only one row or one column.</li>
<li>In ML, an entire dataset IS a matrix: every row is one sample (one house, one customer, one image) and every column is one feature. This is exactly what <code>X</code> means in <code>model.fit(X, y)</code> in scikit-learn - a 2D array (matrix) of shape <code>(n_samples, n_features)</code>.</li>
<li>Basic <strong>matrix operations</strong> - addition, scalar multiplication, transpose (flipping rows and columns), and matrix multiplication - are the building blocks that every ML algorithm, from Linear Regression to deep neural networks, is ultimately composed of.</li>
</ul>`,
            codeExamples: [
                `# A tiny dataset as a matrix, plus the fundamental matrix operations
import numpy as np

# 4 houses (rows), 2 features each (columns): [size_sqft/1000, bedrooms]
X = np.array([
    [1.4, 2],
    [1.8, 3],
    [2.4, 4],
    [3.0, 5],
])

print("Shape of X (samples, features):", X.shape)
print("Transpose of X (features, samples):\\n", X.T)
print("X scaled by 2 (scalar multiplication):\\n", X * 2)

Y = np.array([[0.1, 1], [0.2, 1], [0.1, 2], [0.3, 1]])
print("X + Y (elementwise matrix addition):\\n", X + Y)
# OUTPUT:
# Shape of X (samples, features): (4, 2)
# Transpose of X (features, samples):
#  [[1.4 1.8 2.4 3. ]
#   [2.  3.  4.  5. ]]
# X scaled by 2 (scalar multiplication):
#  [[2.8 4. ]
#   [3.6 6. ]
#   [4.8 8. ]
#   [6.  10. ]]
# X + Y (elementwise matrix addition):
#  [[1.5 3. ]
#   [2.  4. ]
#   [2.5 6. ]
#   [3.3 6. ]]`
            ],
            codeExplanations: [
                `<code>X</code> is a 4x2 matrix representing 4 houses, each described by 2 features - exactly the shape a scikit-learn model expects as its training data. <code>X.shape</code> confirms this is <code>(4, 2)</code>: 4 samples, 2 features. <code>X.T</code> computes the <strong>transpose</strong>, flipping rows into columns (turning "4 samples x 2 features" into "2 features x 4 samples") - a reshaping operation used constantly inside matrix-multiplication formulas. Multiplying <code>X</code> by a scalar (2) simply scales every entry, and adding two same-shaped matrices (<code>X + Y</code>) adds them entry by entry - both are the simplest matrix operations, forming the base vocabulary before matrix multiplication is introduced.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Matrix operations - especially matrix multiplication - are not just a mathematical convenience for ML, they ARE how every layer of a model actually computes its output.
<ul>
<li>A neural network layer's <strong>forward pass</strong> is literally <code>Y = XW + b</code>: the input matrix <code>X</code> is multiplied by a weight matrix <code>W</code> and a bias vector <code>b</code> is added. Every dense/linear layer in every neural network, from a simple MLP to the layers inside a Transformer, is this same matrix multiplication repeated with different learned weights.</li>
<li><strong>Matrix multiplication</strong> lets a model compute predictions for an ENTIRE dataset in one operation instead of looping row by row - <code>X @ W</code> computes every sample's weighted sum simultaneously, which is why ML libraries are built on top of matrix libraries (BLAS/LAPACK) and why GPUs (which are extremely good at matrix multiplication) are the hardware of choice for deep learning.</li>
<li>Batch <strong>Linear Regression</strong> prediction for all samples at once is <code>y_pred = X @ w</code>, and the closed-form solution for the optimal weights (the Normal Equation) is <code>w = (X^T X)^-1 X^T y</code> - built entirely from transpose, matrix multiplication, and matrix inversion.</li>
</ul>
<h3>Real-World Example</h3>
Every scikit-learn / PyTorch / TensorFlow model starts by loading its training data into a 2D array <code>X</code> - this array IS a matrix, and virtually every step from there onward (scaling, PCA, computing predictions) is a matrix operation applied to it.
<ul>
<li>A neural network image classifier takes a batch of, say, 32 flattened images (each 784 pixels, from a 28x28 MNIST digit) as a <code>(32, 784)</code> matrix, multiplies it by a <code>(784, 128)</code> weight matrix to produce a <code>(32, 128)</code> matrix of hidden-layer activations for the entire batch in a single GPU instruction.</li>
<li>Recommendation systems represent user-item ratings as a matrix (rows = users, columns = movies), and matrix factorization techniques decompose this matrix into smaller matrices representing latent "taste" factors - the same core idea behind SVD-based recommenders.</li>
</ul>`,
            codeExamples: [
                `# A neural network layer's forward pass, expressed exactly as matrix multiplication
import numpy as np

rng = np.random.default_rng(0)

# batch of 5 samples, each with 3 input features (e.g. 5 houses x 3 features)
X = rng.normal(size=(5, 3))

# a "dense layer" with 3 inputs and 2 output neurons
W = rng.normal(size=(3, 2))   # weight matrix: (n_inputs, n_outputs)
b = np.array([0.1, -0.2])     # one bias per output neuron

Y = X @ W + b   # the forward pass: Y = XW + b, for ALL 5 samples at once
print("X shape:", X.shape, " W shape:", W.shape, " Y shape:", Y.shape)
print("Y (layer output for all 5 samples):\\n", Y.round(3))
# OUTPUT:
# X shape: (5, 3)  W shape: (3, 2)  Y shape: (5, 2)
# Y (layer output for all 5 samples):
#  [[ 0.31  -0.842]
#   [-0.226  0.187]
#   [ 0.744 -1.05 ]
#   [-0.512  0.339]
#   [ 0.198 -0.406]]`
            ],
            codeExplanations: [
                `<code>X</code> is a <code>(5, 3)</code> matrix: 5 samples, each with 3 input features, simulating a mini-batch fed into a neural network layer. <code>W</code> is a <code>(3, 2)</code> weight matrix mapping 3 inputs to 2 output neurons - each COLUMN of <code>W</code> holds the weights for one output neuron. <code>X @ W</code> is <strong>matrix multiplication</strong>: for every sample (row of X), it computes the dot product against every column of W, producing a <code>(5, 2)</code> result - the weighted sum for each of the 2 neurons, for all 5 samples, in a single operation. Adding <code>b</code> (broadcast across every row) adds each neuron's bias. This one line, <code>Y = X @ W + b</code>, is precisely what a PyTorch <code>nn.Linear</code> or TensorFlow <code>Dense</code> layer computes internally - the entire "forward pass" of a neural network layer is nothing more than matrix multiplication plus addition.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Vectorized, batch computation</strong> - matrix multiplication lets an entire batch of samples be processed in one operation (<code>X @ W</code>) instead of looping row by row in Python, which is both far faster (leveraging optimized BLAS/GPU code) and far more concise to write and read.</li>
<li><strong>Natural fit for data</strong> - since a dataset already IS rows and columns, matrices require no extra transformation to represent training data; the same matrix that stores the data is directly fed into linear algebra operations that compute predictions, gradients, and transformations.</li>
<li><strong>Composable transformations</strong> - stacking matrix multiplications (as in a multi-layer neural network, where each layer's output matrix becomes the next layer's input matrix) lets arbitrarily complex functions be built from simple, well-understood linear building blocks, with nonlinear activation functions inserted between them.</li>
<li><strong>Hardware-accelerated</strong> - GPUs are architected around massively parallel matrix multiplication, so expressing an algorithm as matrix operations (rather than explicit loops) is what makes training large deep learning models on millions of samples computationally feasible at all.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Shape mismatches are the most common bug when building models</strong> - matrix multiplication <code>A @ B</code> requires the number of columns in <code>A</code> to equal the number of rows in <code>B</code>; a beginner stacking neural network layers with mismatched input/output sizes gets an immediate, often confusing, <code>ValueError: shapes not aligned</code> at runtime.</li>
<li><strong>Memory cost grows quickly</strong> - a matrix of shape <code>(n_samples, n_features)</code> with millions of rows and thousands of columns can require gigabytes of memory, and intermediate matrices produced during neural network training (activations for every layer, for every sample in a batch) multiply that cost further.</li>
<li><strong>Not all matrices are invertible</strong> - the closed-form Linear Regression solution needs <code>(X^T X)^-1</code> to exist, but if features are perfectly correlated (multicollinearity) the matrix becomes singular (non-invertible), which is why iterative gradient-based optimization or regularization (Ridge regression) is often used instead of the direct formula.</li>
<li><strong>Order matters</strong> - unlike scalar multiplication, matrix multiplication is NOT commutative (<code>A @ B != B @ A</code> in general, and one product may not even be defined if shapes don't match the other way), which is a frequent source of subtle bugs when implementing algorithms from a textbook formula.</li>
</ul>`,
            codeExamples: [
                `# A shape-mismatch bug, and how to read/fix it - plus why matrix multiplication order matters
import numpy as np

X = np.random.default_rng(0).normal(size=(10, 4))   # 10 samples, 4 features
W_wrong = np.random.default_rng(0).normal(size=(5, 2))  # WRONG: expects 5 input features, X has 4

try:
    X @ W_wrong
except ValueError as e:
    print("Shape mismatch error:", e)

W_correct = np.random.default_rng(0).normal(size=(4, 2))  # correct: matches X's 4 features
Y = X @ W_correct
print("Correct forward pass output shape:", Y.shape)

# matrix multiplication is not commutative
A = np.array([[1, 2], [3, 4]])
B = np.array([[0, 1], [1, 0]])
print("A @ B:\\n", A @ B)
print("B @ A:\\n", B @ A, " <- different result!")
# OUTPUT:
# Shape mismatch error: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size 4 is different from 5)
# Correct forward pass output shape: (10, 2)
# A @ B:
#  [[2 1]
#   [4 3]]
# B @ A:
#  [[3 4]
#   [1 2]] <- different result!`
            ],
            codeExplanations: [
                `<code>X</code> has 4 features per sample, but <code>W_wrong</code> was built expecting 5 input features - attempting <code>X @ W_wrong</code> raises exactly the kind of shape-mismatch error that is the single most common runtime bug when stacking layers or hand-implementing a formula in numpy/PyTorch; the error message names the mismatched dimension (4 vs 5), which is the key detail to check when debugging. Fixing <code>W_correct</code> to shape <code>(4, 2)</code> (matching X's 4 columns) lets the multiplication succeed, producing the expected <code>(10, 2)</code> output. The second half demonstrates that matrix multiplication is <strong>not commutative</strong> - <code>A @ B</code> and <code>B @ A</code> give different results even for two simple 2x2 matrices - a property with no analogue in ordinary scalar multiplication, and one that must be respected when transcribing a matrix formula (like the Normal Equation) exactly as written.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a neural network's forward pass relate to matrix multiplication?</td><td>A dense/linear layer computes Y = XW + b, where X is the input matrix (samples x input features), W is a learned weight matrix (input features x output neurons), and b is a bias vector; this single matrix multiplication plus addition computes the weighted sum for every neuron, for every sample in the batch, simultaneously</td></tr>
<tr class='text-center'><td>What condition must two matrices satisfy to be multiplied together, and what commonly goes wrong when violated?</td><td>The number of columns in the first matrix must equal the number of rows in the second (A of shape (m,n) times B of shape (n,p) gives shape (m,p)); the most common resulting bug when building models is a shape-mismatch error, e.g. connecting a neural network layer's output size to the next layer's expected input size incorrectly</td></tr>
<tr class='text-center'><td>Why is matrix multiplication preferred over row-by-row loops when computing predictions for a dataset?</td><td>Matrix multiplication lets an entire batch of samples be processed in a single vectorized operation that maps directly onto optimized, hardware-accelerated linear algebra libraries (BLAS) and GPU instructions, making it orders of magnitude faster than an equivalent explicit Python loop over rows</td></tr>
</table>`
        }
    ]
};
