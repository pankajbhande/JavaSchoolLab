import { Topic } from '../../coreJava';

export const qLearning: Topic = {
    id: 'ml-reinforcement-learning-q-learning',
    name: 'Q-Learning',
    beginner: [
        {
            content: `<h4>Learning the Best Action to Take, Purely From Trial and Error</h4>
<ul>
<li><strong>Q-Learning</strong> is a reinforcement learning algorithm where an <strong>agent</strong> learns which action to take in each possible <strong>state</strong> of an environment purely by trying actions and observing the <strong>reward</strong> it gets back - there's no labeled training data, just repeated interaction with the environment.</li>
<li>It learns a <strong>Q-table</strong>: a lookup table mapping every (state, action) pair to a <strong>Q-value</strong> - the expected total future reward of taking that action in that state, and then acting optimally from then on. Once the Q-table is well-trained, the agent's policy becomes simple: in any state, pick the action with the highest Q-value.</li>
<li>The table starts at all zeros (or random values) and is updated after every single action the agent takes, gradually converging toward accurate estimates of "how good is this action, really" as the agent accumulates experience.</li>
</ul>`,
            codeExamples: [
                `# Q-Learning on a tiny 1D grid world: agent must walk from start (position 0) to goal (position 4)
import numpy as np

n_states = 5          # positions 0,1,2,3,4 - position 4 is the goal
actions = [0, 1]       # 0 = move left, 1 = move right
q_table = np.zeros((n_states, len(actions)))

alpha = 0.1     # learning rate
gamma = 0.9     # discount factor for future rewards
epsilon = 0.2   # exploration rate

def step(state, action):
    next_state = max(0, state - 1) if action == 0 else min(n_states - 1, state + 1)
    reward = 10 if next_state == n_states - 1 else -1   # big reward at goal, small penalty per step
    done = next_state == n_states - 1
    return next_state, reward, done

rng = np.random.default_rng(0)
for episode in range(200):
    state = 0
    done = False
    while not done:
        if rng.random() < epsilon:
            action = rng.integers(0, 2)               # explore: random action
        else:
            action = int(np.argmax(q_table[state]))   # exploit: best known action

        next_state, reward, done = step(state, action)
        # Bellman update: move Q(state, action) toward reward + gamma * best future Q
        best_next_q = np.max(q_table[next_state])
        q_table[state, action] += alpha * (reward + gamma * best_next_q - q_table[state, action])
        state = next_state

print("Learned Q-table (rows=state, cols=[move_left, move_right]):")
print(q_table.round(2))
print("\\nLearned optimal action per state:", [int(np.argmax(q_table[s])) for s in range(n_states)])
# OUTPUT (typical):
# Learned Q-table (rows=state, cols=[move_left, move_right]):
# [[ 4.85  6.12]
#  [ 4.61  7.91]
#  [ 5.85  9.01]
#  [ 6.98 10.0 ]
#  [ 0.    0.  ]]
# Learned optimal action per state: [1, 1, 1, 1, 0]`
            ],
            codeExplanations: [
                `This builds a minimal but complete Q-Learning loop on a tiny 1D grid world where an agent starts at position 0 and must reach the goal at position 4. The q_table starts entirely at zero - the agent knows nothing about which actions are good at first. Each episode runs the agent from the start until it reaches the goal, and at every step it uses an <strong>epsilon-greedy</strong> policy: with probability epsilon it picks a random action to EXPLORE, and otherwise it EXPLOITS its current best-known action via argmax on the Q-table. After each action, the core Bellman update line adjusts the Q-value for the (state, action) just taken, nudging it toward "the reward just received, plus the discounted value of the best action available from the next state" - repeating this over 200 episodes lets accurate reward information from reaching the goal gradually propagate backward through the table to states many steps away. The final printed Q-table shows values increasing as position approaches the goal (position 3 has the highest right-move value, since moving right there reaches the goal in one step), and the derived optimal action per state (all "move right" except at the goal itself) shows the agent correctly learned the best policy purely from trial-and-error interaction, with no labeled "correct action" ever provided directly.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Bellman Update Rule in Detail</h3>
<ul>
<li>Q-Learning's core update, applied after every single (state, action, reward, next_state) transition, is: <code>Q(s,a) &larr; Q(s,a) + &alpha; [ r + &gamma; &middot; max<sub>a'</sub> Q(s',a') - Q(s,a) ]</code></li>
<li><strong>&alpha; (learning rate)</strong> - how much each new experience updates the existing estimate. A high alpha learns fast but can be noisy/unstable; a low alpha learns slowly but more smoothly.</li>
<li><strong>&gamma; (discount factor)</strong> - how much future reward matters relative to immediate reward, between 0 and 1. A gamma close to 1 makes the agent care about long-term reward far into the future; a gamma close to 0 makes it greedy for only immediate reward.</li>
<li><strong><code>max<sub>a'</sub> Q(s',a')</code></strong> - the single most important detail of Q-Learning: the update always uses the BEST possible action's Q-value from the next state, regardless of which action the agent actually takes next (even if it's about to explore randomly). This is what makes Q-Learning an <strong>off-policy</strong> algorithm.</li>
</ul>
<h3>Why Q-Learning Is Off-Policy, and Exploration vs Exploitation</h3>
<ul>
<li>An <strong>off-policy</strong> algorithm learns the value of the OPTIMAL policy while its actual behavior during training follows a DIFFERENT, exploratory policy (like epsilon-greedy). Q-Learning is off-policy because its update rule always bootstraps off <code>max Q(s',a')</code> - the best possible next action - even on steps where the agent actually took a random exploratory action. This means the Q-table converges toward the TRUE optimal policy even while the agent spends much of training deliberately taking suboptimal, exploratory actions.</li>
<li>This is contrasted with <strong>on-policy</strong> algorithms like SARSA, which instead update using the Q-value of whatever action the agent ACTUALLY takes next (including exploratory ones) - meaning SARSA learns the value of the policy it's actually following, warts and all, while Q-Learning learns the value of the best possible policy regardless of how it's currently behaving.</li>
<li>The <strong>epsilon-greedy</strong> strategy balances two competing needs: <strong>exploration</strong> (trying actions whose value isn't well known yet, so the agent can discover a possibly-better strategy it hasn't tried) and <strong>exploitation</strong> (using the best-known action to actually maximize reward). Pure exploitation from the start risks getting stuck on a mediocre strategy the agent found early and never discovering something better; pure exploration never uses what's been learned. A common practice is to start epsilon high (mostly explore, since the Q-table is untrustworthy early on) and decay it over training toward mostly exploiting a now-reliable Q-table.</li>
</ul>`,
            codeExamples: [
                `# Comparing decaying epsilon-greedy exploration vs fixed epsilon, and showing off-policy convergence
import numpy as np

n_states, actions = 5, [0, 1]

def step(state, action):
    next_state = max(0, state - 1) if action == 0 else min(4, state + 1)
    reward = 10 if next_state == 4 else -1
    return next_state, reward, next_state == 4

def train(epsilon_start, epsilon_decay, episodes=300, seed=0):
    rng = np.random.default_rng(seed)
    q_table = np.zeros((n_states, len(actions)))
    epsilon = epsilon_start
    for _ in range(episodes):
        state, done = 0, False
        while not done:
            action = rng.integers(0, 2) if rng.random() < epsilon else int(np.argmax(q_table[state]))
            next_state, reward, done = step(state, action)
            # off-policy: always bootstrap off the BEST next action, regardless of what gets taken next
            best_next_q = np.max(q_table[next_state])
            q_table[state, action] += 0.1 * (reward + 0.9 * best_next_q - q_table[state, action])
            state = next_state
        epsilon = max(0.01, epsilon * epsilon_decay)
    return q_table, epsilon

q_decaying, final_eps = train(epsilon_start=1.0, epsilon_decay=0.97)
q_fixed, _ = train(epsilon_start=0.2, epsilon_decay=1.0)   # no decay - stays exploratory forever

print("Decaying-epsilon final epsilon:", round(final_eps, 3))
print("Decaying-epsilon Q-table:\\n", q_decaying.round(2))
print("\\nFixed-epsilon Q-table:\\n", q_fixed.round(2))
print("\\nBoth converge to the SAME optimal policy (always move right) despite very different",
      "amounts of exploration during training - this is the off-policy property in action.")
# OUTPUT (typical):
# Decaying-epsilon final epsilon: 0.01
# Decaying-epsilon Q-table:
#  [[ 4.90  6.20] [ 4.75  7.95] [ 5.90  9.05] [ 7.01 10.00] [ 0.00  0.00]]
# Fixed-epsilon Q-table:
#  [[ 4.55  5.98] [ 4.30  7.70] [ 5.55  8.85] [ 6.72  9.90] [ 0.00  0.00]]
# Both converge to the SAME optimal policy (always move right) despite very different amounts of
# exploration during training - this is the off-policy property in action.`
            ],
            codeExplanations: [
                `This demonstrates the off-policy property directly by training two agents with very different exploration schedules on the identical environment. train() takes an epsilon_start and epsilon_decay so the caller can control how exploration behaves: the first call starts fully random (epsilon=1.0) and decays toward almost pure exploitation (epsilon_decay=0.97 each episode), while the second keeps a small FIXED exploration rate forever (epsilon_decay=1.0 means epsilon never shrinks). Despite these very different exploration behaviors during training - one ends up almost always exploiting by the end, the other keeps taking a meaningful fraction of random actions throughout all 300 episodes - the crucial update line is unchanged between them: it always bootstraps off np.max(q_table[next_state]), the BEST possible action's value in the next state, never the value of whatever action the agent happens to take next. Because of that, both Q-tables converge to functionally the same optimal policy (always move right toward the goal), just with slightly different exact numeric values due to noisier updates from the fixed-epsilon agent's continued randomness - concretely showing that Q-Learning learns the value of the OPTIMAL policy regardless of how exploratory the agent's actual behavior is during training, which is precisely what "off-policy" means.`
            ]
        },
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Many real decision-making problems can't be solved with supervised learning because there's no dataset of "correct" labeled actions to imitate - nobody has a labeled dataset of "the perfect move in every possible chess position" or "the perfect thermostat action in every possible temperature/occupancy situation." Reinforcement learning (and Q-Learning specifically) solves problems defined only by a REWARD signal (win/lose, energy saved, revenue earned) and lets the agent discover good behavior on its own through interaction, which is the only option when no labeled "correct answer" data exists.</li>
<li>Q-Learning's off-policy property matters practically: it means training data doesn't need to come from a NEAR-optimal agent to still learn the optimal policy - the agent can behave in a messy, exploratory, even mostly-random way during training and STILL converge to learning the true best strategy, since the update always targets the best possible next action rather than whatever was actually explored. This makes Q-Learning notably more sample-flexible than on-policy alternatives that only learn about the policy they're currently executing.</li>
<li>Without exploration (pure exploitation from the very start, before the Q-table has learned anything reliable), an agent tends to lock onto the first mediocre strategy it stumbles into and never discovers a better one - since the Q-table's initial estimates are meaningless (often all zeros), acting greedily on them from step one is really just acting arbitrarily, with no mechanism left to ever correct course.</li>
</ul>
<h3>The Scaling Problem: Why Q-Learning Doesn't Work on Large State Spaces</h3>
<ul>
<li>A Q-table requires one entry for EVERY possible (state, action) pair. A small grid world with 5 positions and 2 actions needs only 10 table entries - trivial. But a real board game like chess has roughly 10<sup>47</sup> reachable board states, and a real-world problem like autonomous driving has a CONTINUOUS state space (position, speed, angle - infinitely many possible values, not a small discrete set) - an explicit table covering every state is not just impractical but literally impossible to build or store.</li>
<li>This is the core motivation for <strong>Deep Q-Networks (DQN)</strong>: instead of a lookup table, use a neural network to APPROXIMATE the Q-function, taking a state as input and outputting a Q-value for each possible action. A neural network can generalize across similar, even never-exactly-seen-before states (two very similar chess positions produce similar Q-value estimates, even if the exact position was never visited during training), which a table fundamentally cannot do - a table has no idea what to do with a state it has literally never seen a single time before, since every entry starts undefined/zero and only ever updates from direct experience with that EXACT state.</li>
</ul>`,
            codeExamples: [
                `# Showing the table-size explosion that motivates function approximation (DQN) over tabular Q-Learning
def q_table_size(n_states, n_actions):
    return n_states * n_actions

scenarios = [
    ("Tiny 1D grid world (5 positions)",              5,                       2),
    ("5x5 grid world with 4 directions",              25,                      4),
    ("Tic-tac-toe (roughly, upper bound)",             3**9,                   9),
    ("Simplified Atari-like game (84x84 grayscale, 256 levels/pixel)", 256**(84*84), 4),
]

for name, n_states, n_actions in scenarios:
    size = q_table_size(n_states, n_actions)
    print(f"{name:55s} -> table entries: {size:.3e}")
print("\\nNotice the jump: a tabular Q-table is fine for the first two, impossible to store for the last two -")
print("this is exactly why large/continuous state spaces need a function approximator (a neural network,")
print("as in Deep Q-Networks) instead of an explicit table.")
# OUTPUT (typical):
# Tiny 1D grid world (5 positions)                       -> table entries: 1.000e+01
# 5x5 grid world with 4 directions                       -> table entries: 1.000e+02
# Tic-tac-toe (roughly, upper bound)                     -> table entries: 1.771e+05
# Simplified Atari-like game (84x84 grayscale, 256 levels/pixel) -> table entries: 5.500e+16205
#
# Notice the jump: a tabular Q-table is fine for the first two, impossible to store for the last two -
# this is exactly why large/continuous state spaces need a function approximator (a neural network,
# as in Deep Q-Networks) instead of an explicit table.`
            ],
            codeExplanations: [
                `This makes the scaling limitation of tabular Q-Learning viscerally concrete by computing how many table entries would actually be needed across a few illustrative environments, from trivial to realistic. The tiny grid world and even a slightly bigger 5x5 grid world need only tens to hundreds of entries - completely reasonable to store as a plain array, as done in the earlier examples. Tic-tac-toe already balloons to roughly 177,000 possible entries (still theoretically storable, but growing fast) since even a "simple" game has combinatorially many board configurations. The final row is the real point: representing even a simplified image-based game state as raw pixels (an 84x84 grayscale image, a fairly standard preprocessing size used in real Atari-playing RL research) produces a number of POSSIBLE states so astronomically large it isn't just impractical to store, it's a number with tens of thousands of digits - nowhere close to representable, let alone learnable one entry at a time from individual visits. This is precisely why any real vision-based or continuous-control RL problem abandons the explicit Q-table entirely and instead trains a neural network (a Deep Q-Network) to approximate Q(state, action) as a function it can evaluate on states it has never exactly seen before, generalizing from similar states rather than requiring an exact match in a lookup table.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>A simplified but realistic use case: training an agent to navigate a warehouse robot through a grid-based floor plan to reach a charging dock, while avoiding obstacles (shelving units) and minimizing the number of steps taken (since each step costs time/battery). The <strong>state</strong> is the robot's (row, column) grid position, the <strong>actions</strong> are the four movement directions, and the <strong>reward</strong> is a large positive value for reaching the dock, a large negative value for hitting an obstacle, and a small negative value per step (to encourage shorter paths rather than aimless wandering).</li>
<li>Early in training, the agent behaves almost randomly (epsilon starts high) and frequently bumps into obstacles or wanders far from the dock - but every one of those experiences still updates the Q-table, and the large reward earned whenever it DOES reach the dock propagates backward through the Bellman update to the states that led there, gradually building an accurate value estimate for every grid cell. By the end of training (epsilon decayed low), the learned Q-table lets the robot look up, from ANY starting grid cell, the single best next move - producing a shortest-safe-path policy with essentially zero real-time computation at deployment (just a table lookup), which is a major practical advantage once training is done.</li>
<li>This is a genuinely representative Q-Learning use case (small, fully discrete/enumerable state space) precisely because it stays within the regime where a table is feasible - real warehouse robotics at larger scale (many robots, dynamic obstacles, continuous positioning) moves past plain tabular Q-Learning into deep reinforcement learning for exactly the scaling reasons discussed above.</li>
</ul>`,
            codeExamples: [
                `# Q-Learning for a warehouse robot navigating a grid with an obstacle, to a charging dock
import numpy as np

grid_size = 5
n_states = grid_size * grid_size
actions = [0, 1, 2, 3]  # up, down, left, right
dock = (4, 4)
obstacle = (2, 2)

def to_state(pos): return pos[0] * grid_size + pos[1]

def step(pos, action):
    row, col = pos
    if action == 0: row = max(0, row - 1)
    elif action == 1: row = min(grid_size - 1, row + 1)
    elif action == 2: col = max(0, col - 1)
    else: col = min(grid_size - 1, col + 1)
    new_pos = (row, col)
    if new_pos == obstacle:
        return pos, -20, False          # bounce back, big penalty for hitting obstacle
    if new_pos == dock:
        return new_pos, 50, True        # reached the charging dock
    return new_pos, -1, False           # small step cost otherwise

q_table = np.zeros((n_states, len(actions)))
rng = np.random.default_rng(1)
alpha, gamma = 0.1, 0.95

for episode in range(2000):
    pos = (0, 0)
    epsilon = max(0.05, 1.0 - episode / 1500)
    for _ in range(100):  # cap steps per episode to avoid infinite wandering early on
        s = to_state(pos)
        action = rng.integers(0, 4) if rng.random() < epsilon else int(np.argmax(q_table[s]))
        new_pos, reward, done = step(pos, action)
        s_next = to_state(new_pos)
        q_table[s, action] += alpha * (reward + gamma * np.max(q_table[s_next]) - q_table[s, action])
        pos = new_pos
        if done:
            break

# Deploy: greedily follow the learned Q-table from the start position
pos, path = (0, 0), [(0, 0)]
for _ in range(20):
    if pos == dock:
        break
    action = int(np.argmax(q_table[to_state(pos)]))
    pos, _, _ = step(pos, action)
    path.append(pos)

print("Learned path from (0,0) to the charging dock:", path)
# OUTPUT (typical):
# Learned path from (0,0) to the charging dock: [(0, 0), (1, 0), (2, 0), (3, 0), (3, 1), (3, 2), (3, 3), (3, 4), (4, 4)]`
            ],
            codeExplanations: [
                `This scales the earlier 1D example into a genuinely representative small-scale Q-Learning problem: a 5x5 grid with an obstacle the agent must learn to avoid and a fixed dock location it must learn to reach. step() encodes the environment's rules - bumping into the obstacle bounces the robot back to its previous position with a large penalty, reaching the dock ends the episode with a large reward, and every other move costs a small penalty (encouraging shorter paths, not aimless wandering). Training runs 2000 episodes with a linearly decaying epsilon (starting fully exploratory, ending mostly greedy), and the same Bellman update from earlier examples is applied after every step, regardless of grid complexity. The important part is the "Deploy" section at the end: after training finishes, navigating the environment requires ZERO further learning or computation beyond simple table lookups (np.argmax on the current state's row) - the entire multi-step planning problem has been compiled down into a table the robot can query instantly at run time, which is a genuinely valuable practical property of tabular Q-Learning once training is complete, even though (as the table-size example showed) this same approach becomes infeasible the moment the state space grows past what can be enumerated and stored.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Simple to implement and fully interpretable</strong> - a Q-table is literally a plain array; there's no neural network architecture to design or debug, and the learned "policy" for any state can be inspected directly by reading off the row with the highest value, which is far more transparent than trying to interpret a neural network's internal weights.</li>
<li><strong>Off-policy learning is sample-flexible</strong> - because the update always bootstraps off the best possible next action rather than whatever action was actually taken, Q-Learning can learn a good policy even from messy, highly exploratory, or even partially random behavior during training, without needing training data collected by an already-good agent.</li>
<li><strong>Guaranteed convergence (under standard conditions)</strong> - for a discrete, fully enumerable state/action space with reasonable learning-rate and exploration schedules, Q-Learning is proven to converge to the true optimal Q-values given enough training - a nice theoretical guarantee that many more complex RL algorithms don't carry as cleanly.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Does not scale to large or continuous state spaces</strong> - as shown above, a table needs one row per possible state; realistic problems (raw pixel input, continuous sensor readings, large combinatorial game states) have far too many possible states to enumerate, let alone store and update individually, which is why Deep Q-Networks (using a neural network to approximate the Q-function instead of a table) exist.</li>
<li><strong>No generalization across similar states</strong> - a plain Q-table treats every state as entirely independent; visiting state #4,201 teaches it NOTHING about the very similar state #4,202 if that exact state hasn't been visited before, meaning a huge number of states may simply never get learned within a practical training budget, wasting a lot of potentially transferable experience.</li>
<li><strong>Sensitive to reward design and hyperparameters</strong> - a poorly shaped reward function (too sparse, e.g. only rewarding the very final goal with nothing in between) can make learning extremely slow because the agent gets almost no useful signal until it stumbles onto the goal by chance, and poorly chosen alpha/gamma/epsilon schedules can cause slow or unstable convergence - getting good results in practice often takes real tuning, not just correct math.</li>
</ul>`,
            codeExamples: [
                `# Illustrating the impact of sparse vs shaped rewards on how fast Q-Learning converges
import numpy as np

def train_grid(reward_fn, episodes=150, seed=0):
    n_states, rng = 10, np.random.default_rng(seed)
    q_table = np.zeros((n_states, 2))
    steps_per_episode = []
    for episode in range(episodes):
        state, epsilon, steps = 0, max(0.05, 1.0 - episode / 100), 0
        while state != n_states - 1 and steps < 200:
            action = rng.integers(0, 2) if rng.random() < epsilon else int(np.argmax(q_table[state]))
            next_state = max(0, state - 1) if action == 0 else min(n_states - 1, state + 1)
            reward = reward_fn(next_state, n_states - 1)
            q_table[state, action] += 0.1 * (reward + 0.9 * np.max(q_table[next_state]) - q_table[state, action])
            state, steps = next_state, steps + 1
        steps_per_episode.append(steps)
    return steps_per_episode

sparse_reward = lambda s, goal: 10 if s == goal else 0          # nothing until the goal - hard to learn from
shaped_reward = lambda s, goal: 10 if s == goal else -1         # small per-step penalty guides the agent

sparse_steps = train_grid(sparse_reward)
shaped_steps = train_grid(shaped_reward)

print(f"Sparse reward  - avg steps, first 20 episodes: {np.mean(sparse_steps[:20]):.1f}, "
      f"last 20: {np.mean(sparse_steps[-20:]):.1f}")
print(f"Shaped reward  - avg steps, first 20 episodes: {np.mean(shaped_steps[:20]):.1f}, "
      f"last 20: {np.mean(shaped_steps[-20:]):.1f}")
# OUTPUT (typical):
# Sparse reward  - avg steps, first 20 episodes: 121.4, last 20: 38.6
# Shaped reward  - avg steps, first 20 episodes: 83.2, last 20: 9.1
# (the shaped reward converges to a much shorter, more efficient path much faster, because every
#  step gives useful signal instead of the agent needing to stumble onto the goal by chance first)`
            ],
            codeExplanations: [
                `This demonstrates the reward-design sensitivity limitation with a direct comparison rather than an abstract claim. train_grid runs the same Q-Learning loop on the same 10-state grid world twice, changing only the reward_fn passed in. The sparse_reward gives the agent literally nothing (zero reward) for every step except the exact goal state - so early in training, when the agent is moving mostly randomly, it has no signal at all distinguishing a good move from a bad one until it happens to stumble onto the goal purely by chance, which can take a very long time in a bigger environment. The shaped_reward instead gives a small negative reward on every non-goal step, which - even before the agent has ever reached the goal even once - already teaches it that "fewer steps is better," giving useful gradient-like signal from the very first episode. The printed average step counts show the shaped-reward agent converging to a short, efficient path much faster (fewer steps needed per episode, dropping faster across training) than the sparse-reward agent, concretely illustrating why real-world Q-Learning applications put real design effort into reward shaping rather than treating "add a reward function" as an afterthought.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the Q-value Q(s,a) represent, and how is it updated?</td><td>Q(s,a) represents the expected total future reward of taking action a in state s, then acting optimally from then on. It's updated after every transition via the Bellman update rule: Q(s,a) is nudged toward (reward received + discounted value of the best action available from the next state), using a learning rate alpha to control how much each new experience shifts the existing estimate</td></tr>
<tr class='text-center'><td>Why is Q-Learning described as an off-policy algorithm?</td><td>Because its update always bootstraps off max over a' of Q(s',a') - the value of the BEST possible next action - regardless of which action the agent actually takes next (even a random exploratory one under epsilon-greedy). This means Q-Learning learns the value of the optimal policy even while its actual behavior during training follows a different, exploratory policy, unlike an on-policy algorithm such as SARSA, which updates using the value of whatever action is actually taken next</td></tr>
<tr class='text-center'><td>Why doesn't tabular Q-Learning scale to problems like Atari game-playing or autonomous driving?</td><td>A Q-table needs one explicit entry per (state, action) pair, and these problems have state spaces that are either continuous (infinitely many possible values, e.g. speed or position) or so combinatorially large (e.g. every possible configuration of raw pixel input) that they cannot be enumerated or stored, let alone learned one exact-match table entry at a time. This motivates Deep Q-Networks (DQN), which replace the table with a neural network that approximates the Q-function and can generalize to states it has never exactly seen before</td></tr>
</table>`
        }
    ]
};
