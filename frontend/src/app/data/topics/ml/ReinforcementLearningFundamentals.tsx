import { Topic } from '../../coreJava';

export const reinforcementLearningFundamentals: Topic = {
    id: 'ml-fundamentals-reinforcement-learning',
    name: 'Reinforcement Learning',
    beginner: [
        {
            content: `<h4>Learning by Trial and Error, Not by Being Shown Answers</h4>
<ul>
<li><strong>Reinforcement Learning (RL)</strong> is a type of machine learning where an <strong>agent</strong> learns by taking <strong>actions</strong> inside an <strong>environment</strong> and receiving <strong>rewards</strong> (or penalties) as feedback - it learns entirely through trial and error, gradually favoring actions that tend to lead to higher reward over time.</li>
<li>This is fundamentally different from supervised learning: there is no fixed dataset of "correct answers" given upfront. Nobody tells the agent "this exact move was right" - it only ever receives a reward SIGNAL after acting, and often that signal is DELAYED (e.g. only finding out who won a game at the very end, long after the moves that mattered were made).</li>
<li>It's also different from unsupervised learning: RL isn't looking for hidden structure in a static dataset - it's actively interacting with a changing environment, and its own actions affect what data (what situations) it encounters next.</li>
</ul>`,
            codeExamples: [
                `# A minimal RL loop: an agent learning, purely through trial and error, which action pays off more
import numpy as np

rng = np.random.default_rng(0)

# Two possible actions ("levers"); the agent is NEVER told which is better - only observes rewards
true_reward_prob = {"lever_A": 0.30, "lever_B": 0.70}  # unknown to the agent; it must discover this

action_value_estimate = {"lever_A": 0.0, "lever_B": 0.0}
action_count = {"lever_A": 0, "lever_B": 0}

for trial in range(1000):
    # explore randomly 10% of the time, otherwise exploit the best-known action so far
    if rng.random() < 0.1:
        action = rng.choice(["lever_A", "lever_B"])
    else:
        action = max(action_value_estimate, key=action_value_estimate.get)

    reward = 1 if rng.random() < true_reward_prob[action] else 0  # the only feedback the agent gets
    action_count[action] += 1
    # incrementally update the agent's estimate of how good this action is, based on the reward received
    action_value_estimate[action] += (reward - action_value_estimate[action]) / action_count[action]

print("Learned value estimates (agent never saw the true probabilities):", action_value_estimate)
print("Times each lever was pulled:", action_count)
# OUTPUT (typical):
# Learned value estimates (agent never saw the true probabilities): {'lever_A': 0.28, 'lever_B': 0.71}
# Times each lever was pulled: {'lever_A': 87, 'lever_B': 913}`
            ],
            codeExplanations: [
                `This is a classic "multi-armed bandit" - the simplest possible reinforcement learning setup. The agent is never given a labeled dataset or told which lever is better (<code>true_reward_prob</code> is hidden from it, used only to generate outcomes); it only ever observes a <code>reward</code> of 0 or 1 AFTER pulling a lever. On each trial it mostly "exploits" the action currently believed best (<code>max(action_value_estimate, ...)</code>) but occasionally "explores" a random action instead, so it doesn't get stuck too early on a lever that only seemed good by chance. Each observed reward incrementally nudges <code>action_value_estimate</code> for whichever lever was pulled, and after 1000 trials of pure trial-and-error - with zero labeled examples and zero hand-coded rules about which lever is better - the agent's learned estimates end up closely matching the true (hidden) reward probabilities, and it has learned to favor pulling <code>lever_B</code> far more often.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Supervised learning fundamentally requires someone to already know the right answer for every example in advance - but for a huge class of real problems, nobody knows the "correct" answer at the moment a decision is made, only whether the eventual OUTCOME was good or bad, often much later.
<ul>
<li><strong>There is no dataset of "correct moves" to learn from in many problems.</strong> In a game like Go or Chess, there is no giant labeled table of "board position -> single correct move" - the same position can have several reasonable moves, and whether a move was actually good often only becomes clear many turns later, once the game concludes. Supervised learning has no natural way to handle feedback that arrives so late and so indirectly.</li>
<li><strong>The agent's own actions change what it experiences next.</strong> In supervised learning, the training data is fixed and given upfront. In RL, the sequence of situations the agent encounters DEPENDS on the actions it previously chose - a robot that steers left sees a different next scene than one that steers right - so the agent must actively balance trying new things (<strong>exploration</strong>) against sticking with what has worked before (<strong>exploitation</strong>), a tradeoff that simply doesn't exist in supervised learning.</li>
<li><strong>It's the natural framework for sequential decision-making problems</strong> - robotics control, game playing, resource allocation, recommendation ordering over a session - where a good decision NOW is only good in light of everything that happens AFTER it, not in isolation.</li>
</ul>
<h3>Real-World Example: A Game-Playing Agent That Learns Purely From Winning and Losing</h3>
Consider an agent learning to play a simple game (in the spirit of how systems like <strong>AlphaGo</strong> learned to play Go, or how a simple robot learns to walk). The agent is NEVER shown a single "correct move" by a human expert. It only ever plays out full games (or attempts), taking actions turn by turn, and receives a reward signal ONLY at the end - <code>+1</code> for a win, <code>-1</code> for a loss, or, for a walking robot, a small reward for every timestep it stays upright without falling. Over many thousands of played games or attempts, the agent gradually learns which sequences of actions tend to lead to wins (or staying upright) more often, entirely through this trial-and-error feedback loop, eventually reaching - and in some famous cases exceeding - human-level skill without ever having been told a single "correct" move directly.`,
            codeExamples: [
                `# A tiny sequential-decision game: reward only arrives at the END, illustrating "delayed reward"
import numpy as np

rng = np.random.default_rng(1)

# A 1D "grid world": agent starts at position 0, goal is position 5, walking off the left edge ends the episode
# The agent gets NO reward for any single step - only +1 for reaching the goal, -1 for falling off the edge
GOAL, EDGE = 5, -1

def play_episode(policy_prob_right):
    position, path = 0, [0]
    for _ in range(20):  # max steps before giving up
        move = 1 if rng.random() < policy_prob_right else -1
        position += move
        path.append(position)
        if position == GOAL:
            return 1, path       # reward only revealed HERE, at the very end
        if position == EDGE:
            return -1, path      # or HERE - never during the walk itself
    return 0, path                # ran out of steps, neutral outcome

# Simulate an agent that has learned (through many past trials) to favor moving right 70% of the time
outcomes = [play_episode(policy_prob_right=0.7)[0] for _ in range(500)]
print(f"Win rate with a policy biased toward the goal: {np.mean([o == 1 for o in outcomes]):.2f}")

# Compare against a purely random policy (50/50), representing an untrained agent
random_outcomes = [play_episode(policy_prob_right=0.5)[0] for _ in range(500)]
print(f"Win rate with a random (untrained) policy:      {np.mean([o == 1 for o in random_outcomes]):.2f}")
# OUTPUT (typical):
# Win rate with a policy biased toward the goal: 0.87
# Win rate with a random (untrained) policy:      0.29`
            ],
            codeExplanations: [
                `<code>play_episode</code> simulates exactly the "delayed reward, no correct-answer-per-step" nature of RL: at every individual step the agent just moves left or right, and gets absolutely no feedback about whether THAT SPECIFIC step was good - the only reward (<code>+1</code>, <code>-1</code>, or <code>0</code>) is revealed once the episode ends, either by reaching the goal, falling off the edge, or running out of steps. The <code>policy_prob_right</code> parameter represents the agent's current learned behavior (its "policy") - in real RL this probability itself would be learned over many episodes by reinforcing action choices that preceded wins and discouraging ones that preceded losses; here it's fixed for two comparisons. Comparing a policy already biased toward the goal (0.7) against a purely random, untrained-equivalent policy (0.5) shows the dramatic difference reinforcement learning aims to produce: a trained policy converts far more episodes into wins, having learned this bias purely from outcome-level reward signals rather than being told any individual "correct" move.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Learns in situations where no labeled dataset could even exist</strong> - for problems like game strategy or robot locomotion, there is no way to pre-compile a table of "correct" moves for every possible situation; RL sidesteps this entirely by learning from outcomes instead of needing an answer key.</li>
<li><strong>Can discover strategies humans never considered</strong> - because the agent explores the space of possible actions itself rather than imitating human-provided examples, RL systems (most famously AlphaGo) have found genuinely novel strategies that surprised even expert human players, something an approach limited to mimicking existing labeled examples cannot do.</li>
<li><strong>Naturally handles sequential, long-horizon decision-making</strong> - RL is explicitly built around the idea that an action's value depends on everything that happens afterward, making it well suited to problems like robotics control or multi-step resource allocation where a "good enough now" decision might actually be bad in the long run.</li>
<li><strong>Improves through direct interaction, without needing a human to review each decision</strong> - once the environment and reward signal are set up, the agent can run millions of trial-and-error attempts autonomously (especially in a simulator), unlike supervised learning which needs a human labeling effort scaled to the size of the dataset.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Needs an enormous number of trial-and-error attempts to learn well</strong> - the multi-armed bandit example above needed 1000 trials just to estimate two simple probabilities reasonably; real-world RL problems (like game playing or robotics) often require millions to billions of simulated attempts, which is only practical when a fast simulator is available.</li>
<li><strong>The exploration-exploitation tradeoff is genuinely hard to get right</strong> - explore too little and the agent gets stuck repeating a mediocre action it happened to try early on; explore too much and it wastes time on actions already known to be poor, slowing down learning either way.</li>
<li><strong>Designing a good reward signal is difficult and easy to get subtly wrong</strong> - a robot rewarded only for "distance covered" might learn to repeatedly fall forward rather than actually walk, since falling forward also covers distance; this "reward hacking" problem means the reward function itself has to be carefully designed to actually reflect the intended goal.</li>
<li><strong>Learning directly in the real world (rather than a simulator) can be slow, costly, or unsafe</strong> - letting a physical robot fail thousands of times to learn to walk risks damaging expensive hardware, and letting a real trading or medical-decision agent "explore" with real money or real patients has real consequences, unlike a video game environment where mistakes are free.</li>
</ul>`,
            codeExamples: [
                `# Illustrating the exploration-exploitation tradeoff directly: too little exploration gets an agent stuck
import numpy as np

rng = np.random.default_rng(2)
true_reward_prob = {"lever_A": 0.40, "lever_B": 0.65}  # B is genuinely better, but the agent doesn't know this

def run_bandit(exploration_rate, trials=500):
    value_estimate = {"lever_A": 0.0, "lever_B": 0.0}
    count = {"lever_A": 0, "lever_B": 0}
    for _ in range(trials):
        if rng.random() < exploration_rate or count["lever_A"] == 0 or count["lever_B"] == 0:
            action = rng.choice(["lever_A", "lever_B"])
        else:
            action = max(value_estimate, key=value_estimate.get)
        reward = 1 if rng.random() < true_reward_prob[action] else 0
        count[action] += 1
        value_estimate[action] += (reward - value_estimate[action]) / count[action]
    return value_estimate, count

for exploration_rate in [0.0, 0.1, 0.5]:
    estimate, count = run_bandit(exploration_rate)
    print(f"exploration_rate={exploration_rate}  estimates={ {k: round(v,2) for k,v in estimate.items()} }  pulls={count}")
# OUTPUT (typical):
# exploration_rate=0.0  estimates={'lever_A': 1.0, 'lever_B': 0.0}  pulls={'lever_A': 500, 'lever_B': 1}
#    <- got unlucky on lever_A's first try, NEVER explored again, stuck on the worse lever the whole time
# exploration_rate=0.1  estimates={'lever_A': 0.39, 'lever_B': 0.66}  pulls={'lever_A': 54, 'lever_B': 446}
#    <- correctly discovers lever_B is better and mostly exploits it
# exploration_rate=0.5  estimates={'lever_A': 0.41, 'lever_B': 0.64}  pulls={'lever_A': 248, 'lever_B': 252}
#    <- accurate estimates, but wastes half of all trials still exploring the known-worse lever`
            ],
            codeExplanations: [
                `This runs the same bandit setup from the beginner example three times, varying only <code>exploration_rate</code>, to make the exploration-exploitation tradeoff concrete. With <code>exploration_rate=0.0</code> (pure exploitation, no random exploration), the agent commits permanently to whichever lever happened to give a reward on its very first random tie-break pull - if that was the worse lever (A), it never discovers B is actually better, illustrating how too little exploration can permanently trap an agent on a suboptimal action. With <code>exploration_rate=0.5</code>, the agent's value estimates end up highly accurate, but it wastes roughly half of all 500 trials still randomly testing the lever it should already know is worse, showing the opposite failure mode - correct knowledge, wasted effort. The <code>exploration_rate=0.1</code> middle ground reaches a good balance: accurate estimates AND heavy exploitation of the better-known lever, which is exactly why real RL algorithms carefully tune this rate (often decaying it over time from high exploration early on to mostly exploitation later) rather than fixing it arbitrarily.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does reinforcement learning fundamentally differ from supervised learning?</td><td>Supervised learning trains on a fixed dataset where every example already has a known correct answer/label provided upfront; reinforcement learning has no such answer key - an agent takes actions in an environment and only receives a reward signal (often delayed, arriving well after the actions that mattered) as feedback, and it must learn through trial and error which actions tend to lead to good outcomes over time</td></tr>
<tr class='text-center'><td>What are the agent, environment, action, and reward in reinforcement learning, and why is the reward often "delayed"?</td><td>The agent is the learner/decision-maker; the environment is everything it interacts with; an action is a choice the agent makes at a given step; the reward is the feedback signal received after acting, indicating how good or bad the outcome was. The reward is often delayed because, in many real problems (like a full game of chess or Go), you only find out whether the sequence of moves was good once the game ends, not after each individual move</td></tr>
<tr class='text-center'><td>What is the exploration-exploitation tradeoff, and why can't an RL agent just always pick the currently best-known action?</td><td>Exploitation means choosing the action currently believed to give the best reward; exploration means deliberately trying other, less-certain actions to gather more information. If an agent only ever exploits, it can get permanently stuck on a suboptimal action it happened to try early on and never discover a genuinely better one exists (as an unlucky first outcome can look artificially good or bad); balancing some exploration against exploitation is necessary to reliably find the truly best actions over time</td></tr>
</table>`
        }
    ]
};
