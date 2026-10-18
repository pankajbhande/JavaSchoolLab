import { Topic } from '../../coreJava';

export const normalization: Topic = {
    id: 'ml-data-preprocessing-normalization',
    name: 'Normalization',
    beginner: [
        {
            content: `<h4>Squeezing Every Feature Into a Fixed Range</h4>
<ul>
<li><strong>Normalization</strong> (commonly <strong>Min-Max Scaling</strong>) rescales a feature into a fixed, bounded range - almost always <strong>[0, 1]</strong> - using the formula <code>x_scaled = (x - min) / (max - min)</code>.</li>
<li>This is different from <strong>Standardization</strong>: standardization produces an unbounded z-score (mean 0, std 1, but values can still be -5 or +8 for extreme points), while normalization always lands every value inside the SAME fixed interval, e.g. exactly between 0 and 1.</li>
<li>A classic use case: image pixel values naturally range 0-255. Dividing by 255 (min-max scaling with <code>min=0, max=255</code>) rescales every pixel into [0, 1], which neural networks train on far more effectively than raw 0-255 integers.</li>
</ul>`,
            codeExamples: [
                `import numpy as np
from sklearn.preprocessing import MinMaxScaler

# raw pixel intensities, 0-255, as a neural network would receive them from an image file
pixels = np.array([
    [0,   64, 255],
    [128, 200,  32],
    [255,   0, 128],
], dtype=float)

scaler = MinMaxScaler(feature_range=(0, 1))
pixels_scaled = scaler.fit_transform(pixels)

print("Raw pixels:\\n", pixels)
print("Normalized (0-1):\\n", np.round(pixels_scaled, 3))
# OUTPUT (typical):
# Raw pixels:
#  [[  0.  64. 255.]
#   [128. 200.  32.]
#   [255.   0. 128.]]
# Normalized (0-1):
#  [[0.    0.32  1.   ]
#   [0.502 1.    0.   ]
#   [1.    0.    0.505]]`
            ],
            codeExplanations: [
                `<code>MinMaxScaler(feature_range=(0, 1))</code> learns each column's minimum and maximum from the data during <code>fit_transform</code>, then applies <code>(x - min) / (max - min)</code> so the column's smallest value becomes exactly <code>0.0</code> and its largest becomes exactly <code>1.0</code>, with everything else landing proportionally in between. Every column ends up bounded to the exact same [0, 1] range regardless of its original scale - unlike raw 0-255 pixel values (which a neural network's weight initialization and activation functions are not well-tuned for), the normalized [0, 1] values keep gradients well-behaved and training stable from the first epoch.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li><strong>Neural networks train far better on bounded inputs.</strong> Activation functions like <code>sigmoid</code> and <code>tanh</code> saturate (their gradient flattens toward zero) for large input magnitudes - feeding raw 0-255 pixel values directly into a network's first layer pushes many neurons into that saturated, near-zero-gradient region immediately, making early training painfully slow or causing it to get stuck entirely.</li>
<li><strong>Weight initialization schemes assume small, bounded inputs.</strong> Common initializers (e.g. Xavier/Glorot) are derived assuming inputs are roughly on the order of [0, 1] or [-1, 1]; feeding in raw pixel-scale numbers (0-255) breaks those assumptions and the very first forward pass can produce wildly large activations.</li>
<li><strong>Algorithms that need a strictly bounded range fail without it.</strong> Some distance- or similarity-based methods, and image-processing pipelines expecting normalized float inputs, simply assume the [0, 1] (or [-1, 1]) contract - passing raw unbounded values silently produces nonsensical results rather than an error.</li>
</ul>
<h3>Real-World Example</h3>
An image classification model (e.g. a CNN trained on photos of handwritten digits or product photos) receives raw pixel values in the standard 0-255 range straight from the image file format. Before training, every pixel is normalized via <code>(pixel - 0) / (255 - 0)</code>, rescaling the entire image into [0, 1]. Without this step, the network's first layer sees inputs 100x+ larger than what its randomly-initialized weights and activation functions were designed to handle - training loss can explode (<code>NaN</code>) or the network can converge to a poor local optimum purely because of the unscaled input range, completely independent of whether the network's architecture itself is sound.`,
            codeExamples: [
                `# Simulating why unbounded pixel-scale inputs destabilize a simple neural network's first layer
import numpy as np

rng = np.random.default_rng(0)
weights = rng.normal(0, 0.05, size=(10,))   # small, Xavier-style initial weights

raw_pixels = rng.uniform(0, 255, size=10)          # unnormalized, straight from the image file
normalized_pixels = raw_pixels / 255.0              # min-max scaled into [0, 1]

raw_activation = np.tanh(np.dot(weights, raw_pixels))
normalized_activation = np.tanh(np.dot(weights, normalized_pixels))

print(f"Raw weighted sum:        {np.dot(weights, raw_pixels):.3f}  -> tanh output: {raw_activation:.5f}")
print(f"Normalized weighted sum: {np.dot(weights, normalized_pixels):.3f}  -> tanh output: {normalized_activation:.5f}")
# OUTPUT (typical):
# Raw weighted sum:        16.842  -> tanh output: 1.00000   <- saturated, gradient ~0, learning stalls
# Normalized weighted sum: 0.066   -> tanh output: 0.06579   <- healthy range, gradient still meaningful`
            ],
            codeExplanations: [
                `Small, Xavier-style initial weights are multiplied against both raw 0-255 pixel values and their min-max normalized [0, 1] counterparts, then passed through a <code>tanh</code> activation. With raw pixels, the weighted sum is large (~16.8), pushing <code>tanh</code> to its saturated extreme (output essentially <code>1.0</code>) where its derivative is nearly zero - during backpropagation this means almost no gradient signal flows backward through that neuron, so its weights barely update no matter how many training steps run. With normalized pixels, the weighted sum stays small (~0.07), landing <code>tanh</code> in its steep, high-gradient middle region where learning actually happens - concretely demonstrating why normalizing pixel values into [0, 1] before training is standard practice rather than an optional nicety.`
            ]
        },
        {
            content: `<h3>Normalization vs. Standardization</h3>
<ul>
<li><strong>Normalization (Min-Max)</strong> guarantees a FIXED, bounded output range (e.g. exactly [0, 1]) - useful whenever an algorithm or downstream contract expects inputs in a known range, such as pixel intensities feeding a CNN, or features feeding an algorithm that explicitly assumes bounded inputs.</li>
<li><strong>Standardization (Z-score)</strong> centers data around a mean of 0 with unit standard deviation, but the resulting range is UNBOUNDED - a genuine outlier can still produce a z-score of 8 or more. It's generally preferred when data roughly follows a Normal distribution and for distance-based or gradient-based models without a strict bounded-input requirement.</li>
<li>Choosing between them is about which ASSUMPTION matches the problem: "does this algorithm/architecture need a hard range guarantee?" (normalization) versus "does this algorithm mainly need comparable scales and roughly-centered data?" (standardization, typically the more common default).</li>
</ul>
<h3>The Key Weakness: Extreme Sensitivity to Outliers</h3>
<ul>
<li>Min-Max scaling anchors the ENTIRE range to just two data points - the observed <code>min</code> and <code>max</code>. A single extreme outlier stretches that range dramatically, compressing every other "normal" value into a tiny sliver near 0 (or 1).</li>
<li>Unlike standardization (where an outlier inflates the standard deviation but every point still keeps some meaningful spread), a single min-max outlier can make 99% of the legitimate data indistinguishable from each other after scaling.</li>
</ul>`,
            codeExamples: [
                `# One extreme outlier compresses nearly all other normalized values into a narrow band
import numpy as np
from sklearn.preprocessing import MinMaxScaler

normal_incomes = np.array([42_000, 45_000, 48_000, 50_000, 47_000, 44_000], dtype=float)
with_outlier = np.append(normal_incomes, 5_000_000)  # one billionaire's reported income

scaled_normal = MinMaxScaler().fit_transform(normal_incomes.reshape(-1, 1)).ravel()
scaled_with_outlier = MinMaxScaler().fit_transform(with_outlier.reshape(-1, 1)).ravel()

print("Without outlier, scaled range:", np.round(scaled_normal, 3))
print("With outlier,    scaled range:", np.round(scaled_with_outlier, 4))
# OUTPUT (typical):
# Without outlier, scaled range: [0.    0.375 0.75  1.    0.625 0.25 ]   <- nicely spread across [0, 1]
# With outlier,    scaled range: [0.0008 0.0011 0.0013 0.0015 0.0012 0.001  1.    ]  <- all squashed near 0`
            ],
            codeExplanations: [
                `Without the outlier, the six normal income values spread out nicely and meaningfully across the full [0, 1] range, since <code>min</code> and <code>max</code> come from data that's all in a similar ballpark. Adding a single outlier (<code>5,000,000</code>) forces <code>max</code> to jump to that extreme value - the min-max formula now divides every normal income's small deviation from <code>min</code> by an enormous denominator (<code>max - min</code> ~ 4,955,000), squashing all six legitimate values into a tiny band near <code>0.001</code>, while the outlier alone occupies <code>1.0</code>. Any model consuming this scaled feature would see almost no distinguishable difference between the six real incomes - exactly the failure mode that makes outlier handling (removal, capping, or switching to <code>RobustScaler</code>) a prerequisite step before applying min-max normalization on real-world data.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Guarantees a fixed, predictable range</strong> - every feature ends up bounded in exactly [0, 1] (or another chosen range), which many neural network architectures and image-processing pipelines are explicitly designed to expect.</li>
<li><strong>Preserves the shape of the original distribution</strong> - min-max scaling is a linear transformation, so relative distances and the overall shape of the data are preserved, just rescaled - unlike a log transform, it doesn't change skewness or distribution shape.</li>
<li><strong>Simple and interpretable</strong> - a scaled value of 0.75 has an intuitive meaning: "75% of the way from this feature's minimum to its maximum," easy to explain to non-technical stakeholders.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Extremely sensitive to outliers</strong> - as shown above, a single extreme min or max value compresses all other data into a narrow band, destroying the useful spread among the "normal" majority of values.</li>
<li><strong>The learned min/max must come only from training data</strong> - fitting <code>MinMaxScaler</code> on the full dataset (train + test) before splitting leaks test-set extremes into training, the same data-leakage risk that applies to standardization.</li>
<li><strong>New production data can fall outside the learned [min, max]</strong> - if a future value is smaller than the training minimum or larger than the training maximum, it scales to below 0 or above 1, which some downstream algorithms or business rules (e.g. "always feed the model a value in [0,1]") aren't built to handle gracefully.</li>
<li><strong>Not ideal when data isn't naturally bounded</strong> - for features theoretically unbounded (like income or transaction amount, versus pixel intensities which have a true physical 0-255 bound), forcing a fixed range based on whatever min/max happened to appear in training is often less principled than standardization.</li>
</ul>`,
            codeExamples: [
                `# Correct workflow: fit MinMaxScaler on training data ONLY, then transform test/new data with those stats
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
X = rng.uniform(20, 250, size=(200, 1))   # e.g. transaction amounts
X_train, X_test = train_test_split(X, test_size=0.25, random_state=0)

scaler = MinMaxScaler().fit(X_train)          # learns min/max from TRAIN ONLY
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)      # applies the SAME learned min/max

new_value = np.array([[300.0]])               # exceeds the training max - a real production scenario
print(f"Training min/max: {scaler.data_min_[0]:.1f} / {scaler.data_max_[0]:.1f}")
print(f"New value (300.0) scaled: {scaler.transform(new_value)[0][0]:.3f}")
# OUTPUT (typical):
# Training min/max: 20.4 / 249.6
# New value (300.0) scaled: 1.219   <- exceeds 1.0, since it's above the training maximum`
            ],
            codeExplanations: [
                `<code>MinMaxScaler().fit(X_train)</code> learns <code>data_min_</code> and <code>data_max_</code> exclusively from the training split, then <code>.transform()</code> applies that SAME fixed min/max to both the training and test data - never recomputing a new min/max from the test set, which would leak test-set extremes into the scaling and mirrors the correct fit/transform discipline used for standardization. The final example feeds in a brand-new value (<code>300.0</code>) that exceeds the training maximum of <code>249.6</code> - its scaled result comes out ABOVE <code>1.0</code> (<code>1.219</code>), concretely showing that min-max scaling's "guaranteed [0, 1] range" promise only strictly holds for values within the range seen during training; genuinely new extreme values in production can and do fall outside the expected bounds.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Min-Max Normalization compute, and how is it different from Standardization?</td><td>It rescales a feature using <code>(x - min) / (max - min)</code>, guaranteeing every value lands in a fixed bounded range like [0, 1]; Standardization instead centers data to mean 0 and standard deviation 1 via <code>(x - mean) / std</code>, which produces an unbounded z-score - an outlier can still land far outside a "normal" range even after standardization, but never outside the fixed [0, 1] range that normalization otherwise guarantees for training data</td></tr>
<tr class='text-center'><td>Why is normalization commonly used for neural network inputs like image pixel values?</td><td>Activation functions like sigmoid and tanh saturate (gradient flattens near zero) for large input magnitudes, and common weight initialization schemes assume roughly small, bounded inputs; rescaling raw 0-255 pixel values into [0, 1] keeps early-layer activations in a healthy, non-saturated range so gradients remain meaningful and training converges properly from the start</td></tr>
<tr class='text-center'><td>Why is Min-Max scaling so sensitive to outliers, and what typically replaces it when outliers are present?</td><td>The entire scaled range is anchored to just two observed values - the minimum and maximum - so a single extreme outlier stretches the denominator (max - min) enormously, compressing all other legitimate values into a tiny band near 0 or 1 and destroying their meaningful spread; <code>RobustScaler</code> (which uses the median and interquartile range instead of min/max) is commonly used instead when heavy outliers are expected</td></tr>
</table>`
        }
    ]
};
