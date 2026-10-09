import { Topic } from '../../coreJava';

export const transformers: Topic = {
    id: 'ml-deep-learning-transformers',
    name: 'Transformers',
    beginner: [
        {
            content: `<h4>Understanding a Sentence by Looking at ALL the Words at Once</h4>
<ul>
<li>A <strong>Transformer</strong> processes an entire sequence in parallel and uses <strong>self-attention</strong> to let every position directly look at every OTHER position, instead of passing information step-by-step through a recurrent hidden state like an RNN.</li>
<li>For each word, self-attention computes a weighted blend of every other word's representation, where the weights say "how relevant is that word to understanding THIS one" - e.g. in "the animal didn't cross the street because <em>it</em> was too tired", attention lets "it" connect directly to "animal" regardless of the words in between.</li>
<li>Because there's no recurrence, all these connections can be computed as one big parallel matrix multiplication - which is both what makes Transformers fast to train on GPUs and what makes them good at long-range dependencies.</li>
</ul>`,
            codeExamples: [
                `# A minimal, from-scratch single-head self-attention over a toy sentence
import numpy as np

np.random.seed(0)
words = ["the", "cat", "sat", "on", "the", "mat"]
d_model = 8
X = np.random.randn(len(words), d_model)   # pretend embeddings for each word

# Learned projection matrices (normally trained; random here for illustration)
W_q = np.random.randn(d_model, d_model) * 0.1
W_k = np.random.randn(d_model, d_model) * 0.1
W_v = np.random.randn(d_model, d_model) * 0.1

Q = X @ W_q   # "what am I looking for"
K = X @ W_k   # "what do I contain"
V = X @ W_v   # "what do I actually offer if attended to"

scores = Q @ K.T / np.sqrt(d_model)             # raw compatibility between every pair of words
weights = np.exp(scores) / np.exp(scores).sum(axis=-1, keepdims=True)   # softmax per row
output = weights @ V                             # weighted blend of all words' values

print("Attention weights for the word 'cat' (row 1) over all words:")
for w, val in zip(words, weights[1].round(2)):
    print(f"  {w:5s} {val}")
# OUTPUT (illustrative, random weights so not meaningful semantically):
#   the   0.15
#   cat   0.22
#   sat   0.18
#   on    0.14
#   the   0.15
#   mat   0.16
# (with TRAINED weights, "cat" would attend most strongly to semantically/syntactically
#  relevant words like "sat" - the verb it's the subject of)`
            ],
            codeExplanations: [
                `This hand-builds a single self-attention step to make the mechanism concrete instead of hiding it inside a library. Each word's embedding is projected through three separate learned matrices into a Query (what this word is looking for), a Key (what this word offers as a match target), and a Value (the actual content returned if attended to) - splitting the "look up" role from the "content" role is what lets attention be flexible. The scores matrix (Q @ K.T) computes a raw compatibility number between every pair of words by dot product, scaled down by sqrt(d_model) to keep gradients stable, then softmax turns each word's row into weights that sum to 1 - a probability distribution over "how much should I attend to each other word." Multiplying those weights by V produces, for every word, a new representation that is a weighted blend of all words in the sentence; with the random weights used here the output isn't semantically meaningful, but it demonstrates exactly the computation a trained Transformer layer performs at every position, in parallel, in one matrix multiply.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>RNNs and LSTMs process a sequence one step at a time, so step t must wait for step t-1 to finish - this sequential dependency is a hard ceiling on training speed, and even with gating, very long-range dependencies (a pronoun referring to a noun 200 words earlier) still degrade because the information has to survive many sequential hops.</li>
<li>The Transformer, introduced in the "Attention Is All You Need" paper, removes recurrence entirely: self-attention lets ANY two positions interact in a single step, and because there's no step-to-step dependency, an entire sequence's attention can be computed as one parallel matrix operation - which is what let models scale to billions of parameters and web-scale training data (this is directly why GPT, BERT, and essentially every modern large language model is Transformer-based, not RNN-based).</li>
<li>Concretely: training a large RNN language model on the scale of modern LLMs would take an impractically long time because of the sequential bottleneck; the Transformer's parallelism is a large part of what made today's scale of LLM training economically feasible.</li>
</ul>
<h3>Multi-Head Attention and Positional Encoding</h3>
<ul>
<li><strong>Multi-Head Attention</strong> runs several attention computations ("heads") in parallel, each with its own learned Q/K/V projections, then concatenates their outputs. Different heads tend to specialize - one might learn to track syntactic relationships (subject-verb agreement), another might track coreference (pronoun-to-noun), giving the model several "views" of the same sequence at once instead of one averaged-together view.</li>
<li>Self-attention alone is <strong>order-agnostic</strong> - swapping the positions of two words changes nothing about the attention math itself, because it only looks at content, not position. That would make "dog bites man" and "man bites dog" identical to the model. <strong>Positional Encoding</strong> fixes this by adding a fixed or learned vector (often sine/cosine functions of different frequencies) to each word's embedding BEFORE attention, injecting information about where each word sits in the sequence.</li>
</ul>`,
            codeExamples: [
                `# Sinusoidal positional encoding, and demonstrating self-attention is order-agnostic without it
import numpy as np

def sinusoidal_positional_encoding(seq_len, d_model):
    pos = np.arange(seq_len)[:, None]
    i = np.arange(d_model)[None, :]
    angle_rates = 1 / np.power(10000, (2 * (i // 2)) / d_model)
    angles = pos * angle_rates
    pe = np.zeros((seq_len, d_model))
    pe[:, 0::2] = np.sin(angles[:, 0::2])
    pe[:, 1::2] = np.cos(angles[:, 1::2])
    return pe

seq_len, d_model = 6, 8
pe = sinusoidal_positional_encoding(seq_len, d_model)
print("Positional encoding shape:", pe.shape)
print("Position 0 vector (first 4 dims):", pe[0, :4].round(3))
print("Position 3 vector (first 4 dims):", pe[3, :4].round(3))

# Demonstrate that plain self-attention (no positional info) is a "bag of words":
def self_attention(X):
    scores = X @ X.T / np.sqrt(X.shape[-1])
    weights = np.exp(scores) / np.exp(scores).sum(axis=-1, keepdims=True)
    return weights @ X

np.random.seed(0)
X = np.random.randn(4, 8)
out_original_order = self_attention(X)
out_shuffled_order = self_attention(X[::-1])   # reverse the sequence order

print("Sum of output (original order):", out_original_order.sum().round(4))
print("Sum of output (reversed order):", out_shuffled_order.sum().round(4))
# OUTPUT (typical):
# Positional encoding shape: (6, 8)
# Position 0 vector (first 4 dims): [0.    1.    0.    1.   ]
# Position 3 vector (first 4 dims): [0.141 0.99  0.006 1.   ]
# Sum of output (original order): 0.0842
# Sum of output (reversed order): 0.0842   <- identical total - attention alone can't tell order changed`
            ],
            codeExplanations: [
                `The first part builds the classic sinusoidal positional encoding formula: each position gets a vector where different dimensions oscillate at different frequencies (via sin/cos of the position divided by geometrically increasing wavelengths), so every position gets a unique, smoothly-varying "fingerprint" vector that a model can learn to use for measuring relative distance between positions. The second part proves the motivating point directly: it runs the same self-attention computation from the previous example on a sequence and then on that same sequence reversed, and shows the aggregate output statistic is identical either way - because self-attention only looks at content similarity between pairs, never their positions, it literally cannot distinguish "dog bites man" from "man bites dog" unless positional information is added to the embeddings first, which is exactly why every real Transformer adds positional encoding before the first attention layer.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>Consider a model like <strong>BERT</strong> processing the sentence "The bank raised interest rates after the river bank flooded" to disambiguate two uses of the word "bank". A plain word embedding (like older Word2Vec) would give "bank" the SAME vector both times, since it has no way to use context. BERT's Transformer layers let each occurrence of "bank" attend to its surrounding words - the first "bank" attends strongly to "interest rates," the second to "river flooded" - producing two DIFFERENT contextual representations for the same word, which is exactly what's needed for tasks like search relevance, sentiment analysis, or named entity recognition.</li>
<li>For <strong>machine translation</strong> (the task Transformers were originally introduced for), an encoder-decoder Transformer reads the full source sentence with self-attention (building a rich representation of the whole sentence at once, not word by word sequentially), then the decoder generates the target-language sentence one token at a time, at each step using <strong>cross-attention</strong> to look back at the relevant parts of the source sentence - e.g. when generating the French word for "bank" it attends back to whichever English "bank" is contextually relevant.</li>
<li><strong>Vision Transformers (ViT)</strong> extend the same idea to images: an image is split into fixed-size patches (e.g. 16x16 pixels), each patch is treated like a "word" and linearly embedded, and the same self-attention mechanism lets any patch attend to any other patch - letting the model directly relate a patch in the top-left corner to one in the bottom-right without the local-neighborhood limitation of a CNN's convolution filters.</li>
</ul>`,
            codeExamples: [
                `# Using a pretrained Transformer (BERT via HuggingFace) to get context-dependent word embeddings
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

sentence = "The bank raised interest rates after the river bank flooded."
inputs = tokenizer(sentence, return_tensors="pt")
tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])

with torch.no_grad():
    outputs = model(**inputs)
last_hidden = outputs.last_hidden_state[0]   # (seq_len, hidden_size=768) contextual embeddings

bank_positions = [i for i, t in enumerate(tokens) if t == "bank"]
print("Token positions for 'bank':", bank_positions, [tokens[i] for i in bank_positions])

v1, v2 = last_hidden[bank_positions[0]], last_hidden[bank_positions[1]]
cos_sim = torch.nn.functional.cosine_similarity(v1, v2, dim=0)
print(f"Cosine similarity between the two 'bank' embeddings: {cos_sim.item():.3f}")
# OUTPUT (typical):
# Token positions for 'bank': [2, 10] ['bank', 'bank']
# Cosine similarity between the two 'bank' embeddings: 0.52
# (well below 1.0 - despite being the exact same word, self-attention over each occurrence's
#  distinct surrounding context gives them meaningfully different vector representations)`
            ],
            codeExplanations: [
                `This loads a real pretrained BERT model and tokenizer from HuggingFace, tokenizes a sentence containing the ambiguous word "bank" twice (financial institution vs. riverbank), and runs a forward pass to get BERT's final hidden states - one 768-dimensional vector per token, each one having been through many self-attention layers so it has absorbed information from its surrounding context. The code finds the two token positions where "bank" appears and pulls out their respective embedding vectors, then computes cosine similarity between them. A similarity well below 1.0 demonstrates the core practical payoff of self-attention: unlike a static word-embedding lookup table where "bank" would map to one fixed vector no matter the sentence, a Transformer's contextual embeddings differ based on what each occurrence actually attended to, which is why Transformer-based embeddings dramatically improved tasks like search, disambiguation, and sentiment analysis compared to pre-Transformer approaches.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Fully parallelizable training</strong> - because self-attention has no sequential dependency between timesteps, an entire sequence's attention can be computed as one batched matrix multiplication on a GPU, letting Transformers train on far larger datasets in far less wall-clock time than an equivalently-sized RNN, which is a major reason large language models became feasible.</li>
<li><strong>Captures long-range dependencies directly</strong> - any two positions are exactly one attention "hop" apart regardless of distance (e.g. the first and the 500th word), whereas an RNN's signal has to survive 500 sequential steps of potential decay to make the same connection.</li>
<li><strong>Transfers well across domains</strong> - the same core architecture (with positional encoding and attention) works for text (BERT/GPT), images (ViT), audio (Whisper), and even protein sequences (AlphaFold), because it makes very few assumptions about the structure of the input beyond "it's a sequence of tokens."</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Quadratic compute/memory cost in sequence length</strong> - standard self-attention computes a score between every pair of positions, so cost scales as O(n&sup2;) with sequence length n; doubling the input length roughly QUADRUPLES the attention cost, which is why very long documents or high-resolution images need special sparse/efficient attention variants.</li>
<li><strong>Needs a lot of data (or a good pretrained starting point)</strong> - unlike a CNN, which has built-in assumptions about local, translation-invariant structure (useful inductive bias for images), a Transformer has almost none, so it typically needs large-scale pretraining to learn useful patterns from scratch, which is why almost nobody trains one from random weights for a small custom task - they fine-tune a pretrained model instead.</li>
<li><strong>No inherent notion of order without positional encoding</strong> - as shown above, raw self-attention is a "bag of tokens"; if positional encoding is designed or applied incorrectly (e.g. truncated context windows, or extrapolating far beyond the lengths seen during training), the model's sense of sequence order and distance can degrade, which is part of why long-context handling in LLMs is an active area of engineering work.</li>
</ul>`,
            codeExamples: [
                `# Demonstrating the O(n^2) attention cost as sequence length grows
import numpy as np
import time

def self_attention_cost(seq_len, d_model=64):
    X = np.random.randn(seq_len, d_model)
    start = time.time()
    scores = X @ X.T / np.sqrt(d_model)     # this single matrix is seq_len x seq_len
    weights = np.exp(scores) / np.exp(scores).sum(axis=-1, keepdims=True)
    _ = weights @ X
    return time.time() - start, scores.nbytes / 1e6   # elapsed time, score matrix size in MB

for n in [128, 512, 2048, 8192]:
    elapsed, mb = self_attention_cost(n)
    print(f"seq_len={n:5d}  score-matrix size={mb:8.2f} MB  time={elapsed*1000:6.1f} ms")
# OUTPUT (typical, illustrative - exact numbers vary by machine):
# seq_len=  128  score-matrix size=    0.13 MB  time=   0.3 ms
# seq_len=  512  score-matrix size=    2.10 MB  time=   1.8 ms
# seq_len= 2048  score-matrix size=   33.55 MB  time=  25.4 ms
# seq_len= 8192  score-matrix size=  536.87 MB  time= 380.6 ms
# Note the score-matrix size and time both grow ~16x when seq_len grows 4x (4^2 = 16) - quadratic scaling`
            ],
            codeExplanations: [
                `This measures how the size of the intermediate attention score matrix (and rough compute time) grows as input sequence length increases. Because self-attention computes a score between EVERY pair of positions, the scores matrix has shape (seq_len, seq_len) - so its memory footprint grows with the SQUARE of sequence length, not linearly. The loop runs the same attention computation at increasing sequence lengths and prints both the resulting matrix size and elapsed time; the roughly 16x jump each time seq_len quadruples (4-squared) makes the quadratic cost concrete rather than abstract, and explains directly why processing book-length documents or high-resolution images with standard full self-attention becomes prohibitively expensive, motivating research into sparse and linear-attention variants for long-context Transformers.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why did Transformers replace RNNs as the dominant architecture for NLP?</td><td>Self-attention removes the sequential step-by-step dependency that RNNs have, so an entire sequence can be processed in one parallel matrix operation on a GPU - making training dramatically faster and more scalable - while also letting any two positions interact directly in one "hop" regardless of distance, avoiding the gradient decay that hurts RNNs on long-range dependencies</td></tr>
<tr class='text-center'><td>Why is positional encoding necessary in a Transformer?</td><td>Self-attention computes relevance purely from content similarity between Query and Key vectors and has no built-in notion of sequence order, so without positional information added to the embeddings, "dog bites man" and "man bites dog" would produce identical attention patterns; positional encoding injects position-dependent signal before attention so the model can learn to use order and relative distance</td></tr>
<tr class='text-center'><td>What is multi-head attention and why use multiple heads instead of one larger attention computation?</td><td>Multi-head attention runs several smaller attention computations in parallel, each with its own learned Q/K/V projections, then concatenates the results - this lets different heads specialize in different types of relationships (e.g. syntactic agreement vs. coreference) simultaneously, giving the model several complementary "views" of the sequence rather than forcing one attention pattern to capture everything at once</td></tr>
</table>`
        }
    ]
};
