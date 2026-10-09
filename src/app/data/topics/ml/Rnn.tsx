import { Topic } from '../../coreJava';

export const rnn: Topic = {
    id: 'ml-deep-learning-rnn',
    name: 'RNN',
    beginner: [
        {
            content: `<h4>A Network With Memory</h4>
<ul>
<li>A <strong>Recurrent Neural Network (RNN)</strong> processes a sequence one step at a time, and at each step it combines the current input with a <strong>hidden state</strong> carried over from the previous step - so the network's output at time t can depend on everything it has seen before, not just the current input.</li>
<li>This makes RNNs a natural fit for anything ordered: sentences (a sequence of words), time-series (a sequence of readings), audio (a sequence of samples).</li>
<li>The same set of weights is reused at EVERY time step ("parameter sharing"), which is what lets an RNN handle sequences of any length with a fixed number of parameters.</li>
</ul>`,
            codeExamples: [
                `# A minimal RNN in PyTorch predicting the next value in a noisy sine wave
import torch
import torch.nn as nn
import numpy as np

torch.manual_seed(0)
t = np.linspace(0, 40, 400)
series = np.sin(t) + np.random.normal(0, 0.05, 400)

def make_windows(data, window=10):
    X, y = [], []
    for i in range(len(data) - window):
        X.append(data[i:i + window])
        y.append(data[i + window])
    return np.array(X), np.array(y)

X, y = make_windows(series)
X = torch.tensor(X, dtype=torch.float32).unsqueeze(-1)   # (samples, timesteps, features=1)
y = torch.tensor(y, dtype=torch.float32).unsqueeze(-1)

class SimpleRNN(nn.Module):
    def __init__(self, hidden_size=16):
        super().__init__()
        self.rnn = nn.RNN(input_size=1, hidden_size=hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, hidden = self.rnn(x)          # out: every step's hidden state
        last_step = out[:, -1, :]          # we only need the final step to predict "next"
        return self.fc(last_step)

model = SimpleRNN()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = nn.MSELoss()

for epoch in range(200):
    optimizer.zero_grad()
    pred = model(X)
    loss = loss_fn(pred, y)
    loss.backward()
    optimizer.step()

print(f"Final training loss: {loss.item():.4f}")
# OUTPUT (typical):
# Final training loss: 0.0027   <- the RNN learns to track the sine wave's next value from its recent history`
            ],
            codeExplanations: [
                `This builds sliding windows of 10 consecutive points from a noisy sine wave, using each window to predict the very next point. The SimpleRNN class wraps PyTorch's built-in nn.RNN, which internally loops over the 10 timesteps updating a hidden state at each one; "out" holds the hidden state produced at every step, and we take only the LAST one (out[:, -1, :]) because that is the state that has "seen" the whole window, then pass it through a linear layer to produce a single predicted value. Training runs ordinary backpropagation for 200 epochs, and the shrinking loss shows the network learning to use the recent past to forecast what comes next - the same mechanism used for time-series forecasting or next-word prediction, just on a toy signal here.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Before recurrent architectures, feedforward networks needed a FIXED-size input, so a sentence or time-series had to be crammed into a fixed window - there was no way to naturally use variable-length context, and the network had no notion of "order" beyond whatever position-encoding you hand-engineered.</li>
<li>Plain RNNs solved the variable-length, order-aware part - but training them on LONG sequences (dozens to hundreds of steps) runs into a specific mathematical failure: the <strong>vanishing/exploding gradient problem</strong>. Backpropagation through time multiplies gradients across every timestep, and if that per-step multiplier is consistently less than 1, the gradient shrinks toward zero over many steps (the network "forgets" long-range dependencies); if it's consistently greater than 1, the gradient explodes into NaNs.</li>
<li>Concretely: a plain RNN trying to connect the subject of a sentence to a verb 50 words later, or a sensor reading today to a fault that only manifests after 200 timesteps, simply fails to learn that connection - the gradient signal has decayed to nothing by the time it back-propagates that far.</li>
</ul>
<h3>LSTM and GRU - The Practical Fix</h3>
<ul>
<li><strong>LSTM (Long Short-Term Memory)</strong> adds a separate <strong>cell state</strong> that runs through the sequence largely unchanged, plus three learned <strong>gates</strong> that control it: the <strong>forget gate</strong> decides what old information to discard, the <strong>input gate</strong> decides what new information to write in, and the <strong>output gate</strong> decides what part of the cell state to expose as the hidden state. Because the cell state update is mostly additive (not repeated multiplication), gradients can flow across many more timesteps without vanishing.</li>
<li><strong>GRU (Gated Recurrent Unit)</strong> is a simplified alternative with only two gates (<strong>reset</strong> and <strong>update</strong>) and no separate cell state - fewer parameters, often trains faster, and performs comparably to LSTM on many tasks, so it's a common first choice when compute or data is limited.</li>
<li>Both are drop-in replacements for a plain RNN cell (<code>nn.LSTM</code> / <code>nn.GRU</code> instead of <code>nn.RNN</code>) and are the reason "RNN-based" models in practice almost always mean LSTM or GRU, not the vanilla RNN cell.</li>
</ul>`,
            codeExamples: [
                `# Swapping a plain RNN for an LSTM to handle a much longer sequence dependency
import torch
import torch.nn as nn

torch.manual_seed(0)

# A synthetic task: the label depends ONLY on the value at position 0,
# but the sequence is 100 steps long - a stress test for long-range memory.
def make_long_range_data(n_samples=500, seq_len=100):
    X = torch.randn(n_samples, seq_len, 1)
    y = (X[:, 0, 0] > 0).float().unsqueeze(-1)   # label decided entirely by the FIRST timestep
    return X, y

X, y = make_long_range_data()

class SeqClassifier(nn.Module):
    def __init__(self, cell_type="lstm", hidden_size=32):
        super().__init__()
        rnn_cls = {"rnn": nn.RNN, "lstm": nn.LSTM, "gru": nn.GRU}[cell_type]
        self.rnn = rnn_cls(input_size=1, hidden_size=hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.rnn(x)
        return torch.sigmoid(self.fc(out[:, -1, :]))

def train(cell_type, epochs=100):
    model = SeqClassifier(cell_type)
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.BCELoss()
    for _ in range(epochs):
        opt.zero_grad()
        pred = model(X)
        loss = loss_fn(pred, y)
        loss.backward()
        opt.step()
    acc = ((pred > 0.5).float() == y).float().mean().item()
    return acc

for cell_type in ["rnn", "lstm"]:
    acc = train(cell_type)
    print(f"{cell_type.upper():4s} final training accuracy on the 100-step task: {acc:.2f}")
# OUTPUT (typical):
# RNN  final training accuracy on the 100-step task: 0.54   <- barely better than a coin flip, gradient vanished
# LSTM final training accuracy on the 100-step task: 0.97   <- gates let the signal from step 0 survive 100 steps`
            ],
            codeExplanations: [
                `This code builds a deliberately hard "long-range dependency" task: 100-step sequences whose binary label depends entirely on the value at the very FIRST timestep, so a model can only solve it if gradient information can travel backward through all 100 steps during training. The SeqClassifier class is parameterized to plug in a plain RNN, LSTM, or GRU cell interchangeably (same input/output shapes) so the comparison is fair. Training both a plain RNN and an LSTM for the same number of epochs and comparing final accuracy makes the vanishing-gradient problem directly observable: the plain RNN's accuracy stays close to 50% (random guessing) because its gradient from step 0 has decayed to near-zero by the time it is used to update early weights, while the LSTM's gated, largely-additive cell state preserves that signal and reaches high accuracy - which is exactly why LSTM/GRU replaced vanilla RNN cells in essentially all practical sequence models before transformers took over.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>A logistics company monitors a fleet of delivery trucks with a temperature sensor in each refrigerated container, logging a reading every minute. They want to predict, 30 minutes in advance, whether the temperature will drift out of the safe range - so a driver can be alerted before spoiled cargo actually happens.</li>
<li>This is a textbook sequence-to-one forecasting problem: the input is a rolling window of recent sensor readings (a sequence), and the output is a prediction about the near future. Plain feedforward networks would need a hand-picked fixed window and would ignore how far back a trend started; an LSTM naturally accumulates the recent trend into its hidden/cell state and updates its forecast every minute as new readings arrive.</li>
<li>In production this is framed as <strong>sequence-to-sequence</strong> when forecasting multiple future steps at once (e.g. the next 30 individual minute-by-minute readings, not just a single alert) - an <strong>encoder</strong> LSTM reads the historical window into a summary hidden state, and a <strong>decoder</strong> LSTM unrolls that summary forward step by step to produce the forecast sequence, the same encoder-decoder pattern used for machine translation before transformers.</li>
</ul>`,
            codeExamples: [
                `# Sequence-to-sequence style forecasting: LSTM encoder -> LSTM decoder predicts the next 5 steps
import torch
import torch.nn as nn
import numpy as np

torch.manual_seed(0)
t = np.linspace(0, 60, 600)
temp_readings = 5 + np.sin(t / 3) * 2 + np.random.normal(0, 0.1, 600)   # simulated container temps

def make_seq2seq_windows(data, in_len=20, out_len=5):
    X, Y = [], []
    for i in range(len(data) - in_len - out_len):
        X.append(data[i:i + in_len])
        Y.append(data[i + in_len:i + in_len + out_len])
    return np.array(X), np.array(Y)

X, Y = make_seq2seq_windows(temp_readings)
X = torch.tensor(X, dtype=torch.float32).unsqueeze(-1)
Y = torch.tensor(Y, dtype=torch.float32)

class EncoderDecoderLSTM(nn.Module):
    def __init__(self, hidden_size=32, out_len=5):
        super().__init__()
        self.out_len = out_len
        self.encoder = nn.LSTM(input_size=1, hidden_size=hidden_size, batch_first=True)
        self.decoder_cell = nn.LSTMCell(input_size=1, hidden_size=hidden_size)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        _, (h, c) = self.encoder(x)          # summarize the historical window
        h, c = h.squeeze(0), c.squeeze(0)
        decoder_input = x[:, -1, :]           # seed the decoder with the last known reading
        outputs = []
        for _ in range(self.out_len):
            h, c = self.decoder_cell(decoder_input, (h, c))
            pred = self.fc(h)
            outputs.append(pred)
            decoder_input = pred               # feed each prediction back in as the next input
        return torch.cat(outputs, dim=1)

model = EncoderDecoderLSTM()
opt = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = nn.MSELoss()

for epoch in range(150):
    opt.zero_grad()
    pred = model(X)
    loss = loss_fn(pred, Y)
    loss.backward()
    opt.step()

print(f"Final 5-step-ahead forecast MSE: {loss.item():.4f}")
# OUTPUT (typical):
# Final 5-step-ahead forecast MSE: 0.031   <- the decoder learns to unroll a plausible near-future trajectory`
            ],
            codeExplanations: [
                `This simulates a container's temperature sensor as a noisy oscillating signal and frames forecasting as sequence-to-sequence: given the last 20 readings, predict the next 5. The EncoderDecoderLSTM first runs an LSTM encoder over the 20-step input window and keeps only its final hidden and cell state (h, c) - a compressed summary of the recent trend. The decoder then runs an LSTMCell in a loop for 5 steps, each time producing one forecasted reading and feeding that prediction back in as the next step's input (autoregressive decoding), exactly mirroring how sequence-to-sequence translation models generate one output token at a time. The shrinking MSE over training shows the network learning to extrapolate the sinusoidal trend forward, which is the same architectural pattern a real fleet-monitoring system would use to predict an out-of-range temperature drift before it actually happens.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Handles variable-length sequences</strong> - the same weights process a 5-word sentence or a 500-word document without redesigning the model, unlike a fixed-input feedforward network.</li>
<li><strong>Naturally models order and recency</strong> - the hidden state is updated step by step, so information from nearby timesteps has more direct influence than information from far away, matching how many real sequences behave (a word's meaning depends most on its immediate neighbors).</li>
<li><strong>Memory-efficient for streaming/online use</strong> - because only a fixed-size hidden state needs to be carried forward, an RNN/LSTM can process a live, unbounded stream (e.g. a sensor feed) one step at a time without storing the whole history, unlike attention-based models which need the full sequence for training and revisit all prior tokens.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Sequential computation blocks parallelization</strong> - step t's hidden state depends on step t-1's, so timesteps cannot be computed simultaneously on a GPU the way independent operations can, making training on long sequences slow (this is the main reason Transformers displaced RNNs for NLP - see the Transformers topic).</li>
<li><strong>Even LSTM/GRU struggle on VERY long-range dependencies</strong> - gating helps a lot but doesn't eliminate the underlying gradient decay entirely; a dependency spanning thousands of steps (e.g. connecting the first and last sentence of a long document) is still hard for a recurrent model to learn reliably.</li>
<li><strong>Harder to debug and interpret</strong> - the hidden state is a dense vector with no inherent meaning, so unlike a Decision Tree's explicit split rules, it's difficult to inspect WHY an RNN made a particular prediction without extra tooling (e.g. attention visualization or SHAP-style analysis).</li>
</ul>`,
            codeExamples: [
                `# Timing plain sequential RNN processing to make the parallelization limitation concrete
import torch
import torch.nn as nn
import time

torch.manual_seed(0)
seq_len, batch, hidden = 500, 64, 64
x = torch.randn(batch, seq_len, 1)

rnn = nn.LSTM(input_size=1, hidden_size=hidden, batch_first=True)

start = time.time()
with torch.no_grad():
    out, _ = rnn(x)   # internally loops 500 times, one step depending on the last
elapsed = time.time() - start

print(f"Sequential LSTM forward pass over {seq_len} steps: {elapsed*1000:.1f} ms")
# OUTPUT (typical, CPU):
# Sequential LSTM forward pass over 500 steps: 42.3 ms
# (A Transformer's self-attention over the same 500 tokens computes all pairwise
#  interactions in one batched matrix multiply, which parallelizes far better on a GPU
#  as sequence length grows - the core practical motivation for the Transformer architecture.)`
            ],
            codeExplanations: [
                `This measures how long a single forward pass through a 500-step sequence takes with an LSTM. Even though PyTorch's nn.LSTM is a highly optimized, fused CUDA/CPU implementation, it still must process the 500 timesteps one after another internally because each step's hidden state genuinely depends on the previous step's output - there is no way to compute step 300 before step 299 is done. The comment contrasts this with self-attention, which computes every pair of timesteps' interaction as one large parallel matrix multiplication instead of a sequential loop; that structural difference is what allows Transformers to scale to much longer sequences and much larger models on modern GPU hardware, which is why they replaced RNNs as the default architecture for most sequence tasks.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the vanishing gradient problem in RNNs, and why does it happen?</td><td>Backpropagation through time multiplies gradients across every timestep of the sequence; if that per-step multiplier is consistently below 1 (common with saturating activations like tanh/sigmoid), the gradient shrinks exponentially the further back it propagates, so the network effectively cannot learn dependencies spanning many timesteps</td></tr>
<tr class='text-center'><td>How does an LSTM's forget gate help solve the vanishing gradient problem?</td><td>The cell state is updated mostly through addition and element-wise gating rather than repeated matrix multiplication through an activation function, so gradients can flow backward through many timesteps largely unchanged instead of shrinking geometrically - the forget gate specifically lets the network learn to preserve OR discard information deliberately rather than have it decay automatically</td></tr>
<tr class='text-center'><td>When would you choose a GRU over an LSTM?</td><td>GRUs have fewer parameters (no separate cell state, two gates instead of three) so they train faster and need less data to avoid overfitting; they're a good default when compute/data is limited or sequences aren't extremely long, while LSTM's extra capacity can help on tasks needing finer-grained control over what to remember versus forget</td></tr>
</table>`
        }
    ]
};
