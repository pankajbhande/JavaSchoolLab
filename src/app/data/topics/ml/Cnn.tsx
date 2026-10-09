import { Topic } from '../../coreJava';

export const cnn: Topic = {
    id: 'ml-deep-learning-cnn',
    name: 'CNN',
    beginner: [
        {
            content: `<h4>A Network Built to "See" Local Patterns</h4>
<ul>
<li>A <strong>Convolutional Neural Network (CNN)</strong> is a type of ANN specialized for grid-like data such as images. Instead of connecting every input pixel to every neuron (like a plain fully-connected layer), it slides small learnable <strong>filters</strong> (also called kernels) across the image.</li>
<li>Each filter detects a specific local pattern (e.g. a vertical edge, a corner, a patch of color) wherever it appears in the image, producing a <strong>feature map</strong> that highlights where that pattern occurs.</li>
<li>A typical CNN stacks <strong>convolution</strong> layers (detect patterns) with <strong>pooling</strong> layers (shrink the feature maps down, keeping only the strongest signal), then finishes with one or more fully-connected <strong>dense</strong> layers that turn the detected patterns into a final prediction.</li>
</ul>`,
            codeExamples: [
                `# A small CNN for image classification (e.g. defect vs no-defect on a manufacturing line)
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Input(shape=(64, 64, 3)),                       # 64x64 RGB image
    keras.layers.Conv2D(16, kernel_size=3, activation="relu"),    # detect 16 kinds of local patterns
    keras.layers.MaxPooling2D(pool_size=2),                        # downsample by 2x
    keras.layers.Conv2D(32, kernel_size=3, activation="relu"),    # detect 32 more complex patterns
    keras.layers.MaxPooling2D(pool_size=2),
    keras.layers.Flatten(),                                        # turn feature maps into a flat vector
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(1, activation="sigmoid"),                   # probability of "defect"
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
model.summary()
# OUTPUT (abridged):
# Layer (type)                Output Shape              Param #
# conv2d (Conv2D)              (None, 62, 62, 16)        448
# max_pooling2d (MaxPooling2D) (None, 31, 31, 16)        0
# conv2d_1 (Conv2D)            (None, 29, 29, 32)        4640
# max_pooling2d_1 (MaxPooling2D)(None, 14, 14, 32)       0
# flatten (Flatten)            (None, 6272)              0
# dense (Dense)                (None, 64)                401472
# dense_1 (Dense)              (None, 1)                 65
# Total params: 406,625`
            ],
            codeExplanations: [
                `The <code>Input</code> layer expects 64x64 pixel RGB images (3 color channels). The first <code>Conv2D(16, kernel_size=3)</code> slides sixteen separate 3x3 learnable filters across the image, each producing its own feature map that lights up wherever that filter's pattern (e.g. an edge at a certain angle) is detected. <code>MaxPooling2D(pool_size=2)</code> then shrinks each feature map by taking the maximum value in every 2x2 block, halving its width and height while keeping the strongest activations - this reduces computation and makes the detected pattern's exact pixel position matter less. The pattern repeats with a second, wider <code>Conv2D(32, ...)</code> layer that combines the first layer's simple patterns (edges, corners) into more complex ones (shapes, textures). <code>Flatten</code> converts the final stack of small feature maps into one long vector, which two <code>Dense</code> layers then turn into a single sigmoid probability of "defect present." The <code>model.summary()</code> output's <code>Param #</code> column shows how few parameters the convolutional layers need (448 and 4640) compared to the dense layers (401,472) for the same amount of "coverage" over the image - the core efficiency advantage of convolution over full connectivity.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>A plain fully-connected (dense) network applied directly to an image would need one weight PER PIXEL PER NEURON in the first layer - for a modest 224x224 RGB image (150,528 pixel values) feeding a layer of just 500 neurons, that's over 75 million weights in a single layer alone, which is both computationally wasteful and desperately prone to overfitting on realistic dataset sizes.</li>
<li>It also throws away an important prior we know about images: a pattern like "an edge" or "a cat's ear" means the same thing regardless of WHERE in the image it appears. A dense network has to separately re-learn that pattern for every possible pixel position, since none of its weights are shared across positions.</li>
<li>CNNs solve both problems at once via <strong>parameter sharing</strong> (the SAME small filter slides across every position in the image, so a pattern learned in one corner is automatically recognized anywhere else) and <strong>local connectivity</strong> (each filter only looks at a small neighborhood of pixels at a time, not the whole image at once) - this is why the Conv2D layers in the example above needed only a few thousand parameters to process the whole image, versus hundreds of thousands for the dense layers that only handle the already-shrunk, flattened output.</li>
</ul>
<h3>Real-World Example</h3>
A manufacturing plant wants to automatically flag defective parts (e.g. scratches, dents, misalignments) from photos taken by a camera on the assembly line, instead of relying solely on manual visual inspection which is slow and inconsistent between shifts. A CNN is trained on thousands of labeled images (defect / no-defect). During training, the early convolutional layers learn to detect low-level patterns like edges and color gradients; deeper layers combine those into higher-level patterns like "a scratch-shaped mark" or "a misaligned seam," without any engineer having to hand-write rules for what a scratch looks like in pixels. In production, the trained CNN scores each new photo in milliseconds, flagging likely defects for a human to do a final check on - dramatically cutting the number of images a human needs to review from scratch while catching subtle defects a tired human eye might miss. The same architecture pattern (swap the dataset) is used for medical imaging, e.g. classifying chest X-rays for signs of pneumonia.`,
            codeExamples: [
                `# Visualizing what a single convolution operation actually computes - sliding a filter over an image
import numpy as np

# A tiny 6x6 grayscale "image" with a vertical edge in the middle
image = np.array([
    [10, 10, 10, 200, 200, 200],
    [10, 10, 10, 200, 200, 200],
    [10, 10, 10, 200, 200, 200],
    [10, 10, 10, 200, 200, 200],
    [10, 10, 10, 200, 200, 200],
    [10, 10, 10, 200, 200, 200],
], dtype=float)

# A 3x3 vertical-edge-detecting filter (classic Sobel-style kernel)
vertical_edge_filter = np.array([
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1],
])

def convolve2d(img, kernel):
    kh, kw = kernel.shape
    out_h, out_w = img.shape[0] - kh + 1, img.shape[1] - kw + 1
    output = np.zeros((out_h, out_w))
    for i in range(out_h):
        for j in range(out_w):
            patch = img[i:i+kh, j:j+kw]
            output[i, j] = np.sum(patch * kernel)   # elementwise multiply + sum = one "dot product"
    return output

feature_map = convolve2d(image, vertical_edge_filter)
print(feature_map)
# OUTPUT:
# [[  0.   0. 570.   0.]
#  [  0.   0. 570.   0.]
#  [  0.   0. 570.   0.]
#  [  0.   0. 570.   0.]]
# (High activation (570) exactly where the filter crosses the vertical edge - flat regions produce 0,
#  since the filter's positive and negative weights cancel out on uniform pixel values.)`
            ],
            codeExplanations: [
                `<code>convolve2d</code> reimplements, in plain numpy, exactly what a <code>Conv2D</code> layer does at inference time: it slides the 3x3 <code>vertical_edge_filter</code> across every valid position of the 6x6 image, and at each position computes the elementwise product of the filter and the underlying image patch, then sums it into a single output value - this is the "convolution" operation, effectively a dot product repeated at every location. The chosen filter has positive weights on the left column and negative weights on the right column, so it produces a LARGE output wherever pixel values jump from low to high moving left-to-right (a vertical edge), and near-zero output over flat, uniform regions where the positive and negative parts cancel out. The resulting <code>feature_map</code> is smaller than the original image (4x4 instead of 6x6, since a 3x3 filter can't be centered on the outer border pixels) and has a clear column of high activation (570) exactly where the real vertical edge sits in the input - this is precisely what a trained Conv2D filter learns to do automatically for whatever pattern is useful to the task, except the filter's numbers are learned via backpropagation instead of hand-chosen.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Far fewer parameters than a dense network on images</strong> - parameter sharing means one small filter (e.g. 3x3x3 = 27 weights) handles pattern detection across the ENTIRE image, instead of needing a unique weight per pixel per neuron, directly avoiding the 75-million-weight problem described above.</li>
<li><strong>Translation invariance</strong> - because the same filter slides across every position, a CNN recognizes a pattern (e.g. a defect) whether it appears in the top-left or bottom-right of the image, without needing separately labeled examples for every position.</li>
<li><strong>Learns a feature hierarchy automatically</strong> - early layers learn generic low-level features (edges, colors, textures) and deeper layers combine them into task-specific high-level features (a face, a scratch, a tumor shape), removing the need for manual feature engineering that dominated computer vision before deep learning.</li>
<li><strong>Pooling adds robustness to small shifts/noise</strong> - by keeping only the strongest activation in each local region, minor translations or noise in the input have little effect on the final feature representation, making the model more robust to real-world camera jitter or lighting variation.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Still needs substantial labeled data</strong> - a CNN trained from scratch on a small dataset (a few hundred images) will overfit badly; this is commonly mitigated with <strong>transfer learning</strong> (starting from a network pre-trained on a huge dataset like ImageNet) or data augmentation, rather than training truly from scratch.</li>
<li><strong>Computationally intensive to train</strong> - convolutions over large images with many filters and layers require GPU/TPU acceleration for practical training times; a manufacturing team without ML infra investment may need cloud compute or pre-trained models to get started.</li>
<li><strong>Sensitive to distribution shift</strong> - a CNN trained on daytime, well-lit factory photos may perform much worse on images taken under different lighting or camera angles at deployment time, since it only learned to recognize what it saw in training.</li>
<li><strong>Limited built-in support for large spatial/global relationships</strong> - convolution filters are inherently LOCAL (they only see a small neighborhood at a time); capturing very long-range relationships across an image (e.g. "the left half is structurally related to the right half") requires stacking many layers to grow the receptive field, or switching to newer architectures like Vision Transformers that model global relationships more directly.</li>
</ul>`,
            codeExamples: [
                `# Quantifying the parameter-count advantage: a Dense layer vs a Conv2D layer covering the same image
from tensorflow import keras
import numpy as np

image_shape = (64, 64, 3)   # same 64x64 RGB image as the beginner example

# A fully-connected Dense layer applied directly to the flattened image
dense_model = keras.Sequential([
    keras.layers.Input(shape=image_shape),
    keras.layers.Flatten(),
    keras.layers.Dense(16, activation="relu"),   # 16 output units, same as the Conv2D filter count earlier
])
dense_params = dense_model.count_params()

# A Conv2D layer with 16 filters, same input, covering the WHOLE image via sliding
conv_model = keras.Sequential([
    keras.layers.Input(shape=image_shape),
    keras.layers.Conv2D(16, kernel_size=3, activation="relu"),
])
conv_params = conv_model.count_params()

print(f"Dense layer params:  {dense_params:,}")
print(f"Conv2D layer params: {conv_params:,}")
print(f"Dense uses {dense_params / conv_params:.0f}x more parameters for the same 16-unit output width")
# OUTPUT:
# Dense layer params:  196,624
# Conv2D layer params: 448
# Dense uses 439x more parameters for the same 16-unit output width`
            ],
            codeExplanations: [
                `Both models take the same 64x64x3 image as input and produce 16 output "units" (16 dense neurons vs 16 convolutional filters), which makes them a fair comparison of parameter efficiency. The <code>Flatten</code> + <code>Dense(16)</code> model must learn a SEPARATE weight for every one of the 12,288 flattened pixel values, for each of the 16 output neurons (plus 16 biases) - <code>count_params()</code> reports that total. The <code>Conv2D(16, kernel_size=3)</code> model instead learns just 16 small 3x3x3 filters (3x3 spatial size times 3 color channels), each with a single shared bias, and reuses those same 16 filters by sliding them across every position in the image - <code>count_params()</code> shows this needs dramatically fewer weights. The final ratio makes the "far fewer parameters" advantage concrete and numeric rather than a vague claim: the dense layer needs roughly 439x more parameters to nominally cover the same image at the same output width, which is why CNNs remain practical to train on images where an equivalent dense network would not be.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why do CNNs use far fewer parameters than a fully-connected network for the same image?</td><td>Through parameter sharing and local connectivity - a single small filter (e.g. 3x3) is reused ("slid") across every position in the image rather than each pixel-neuron pair needing its own unique weight, so the number of learnable parameters depends on the filter size, not the image size</td></tr>
<tr class='text-center'><td>What is the purpose of a pooling layer in a CNN?</td><td>It downsamples feature maps (e.g. by taking the max value in each small region with max pooling), reducing computation for later layers and making the learned representation more robust to small translations or noise in the input, since exact pixel position within a pooled region no longer changes the output</td></tr>
<tr class='text-center'><td>What does a typical CNN architecture look like, and why do deeper convolutional layers detect more complex patterns?</td><td>A common pattern is alternating Conv2D and pooling layers to progressively extract and downsample features, followed by one or more Dense layers for final classification; each successive convolutional layer operates on the OUTPUT of the previous layer's feature maps, so it can combine simple patterns (edges, colors) detected earlier into progressively more complex, higher-level patterns (shapes, textures, objects) - this hierarchical composition is what lets deep CNNs recognize complex objects without any feature being hand-engineered</td></tr>
</table>`
        }
    ]
};
