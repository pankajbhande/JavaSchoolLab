import { Topic } from '../../coreJava';

export const bayesTheorem: Topic = {
    id: 'ml-mathematics-bayes-theorem',
    name: "Bayes' Theorem",
    beginner: [
        {
            content: `<h4>Updating a Belief When New Evidence Arrives</h4>
<ul>
<li><strong>Bayes' Theorem</strong> is a formula for updating the probability of something (a <strong>hypothesis</strong>) after observing new evidence: <code>P(H|E) = P(E|H) * P(H) / P(E)</code>.</li>
<li><strong>P(H)</strong> is the <strong>prior</strong> - what you believed BEFORE seeing the evidence. <strong>P(E|H)</strong> is the <strong>likelihood</strong> - how probable the evidence is IF the hypothesis is true. <strong>P(H|E)</strong> is the <strong>posterior</strong> - your UPDATED belief after accounting for the evidence.</li>
<li>The key intuition: how much a piece of evidence should shift your belief depends not just on how well it fits the hypothesis, but on how likely the hypothesis was to begin with. Strong evidence for a rare event still often leaves that event unlikely.</li>
</ul>`,
            codeExamples: [
                `# Basic Bayes' Theorem calculation
def bayes_theorem(prior, likelihood, evidence_prob):
    return (likelihood * prior) / evidence_prob

# Hypothesis: "this email is spam"
prior_spam = 0.20          # P(spam): 20% of all emails are spam, historically
likelihood = 0.90          # P("contains 'free money'" | spam): 90% of spam contains this phrase
evidence_prob = 0.25       # P("contains 'free money'"): 25% of ALL emails (spam or not) contain it

posterior = bayes_theorem(prior_spam, likelihood, evidence_prob)
print(f"P(spam | contains 'free money') = {posterior:.3f}")
# OUTPUT:
# P(spam | contains 'free money') = 0.720`
            ],
            codeExplanations: [
                `This directly implements the Bayes' Theorem formula. <code>prior_spam</code> is what we'd guess an email is spam BEFORE reading it (20%, based on historical spam rates). <code>likelihood</code> is how common the phrase "free money" is AMONG spam emails specifically (90%). <code>evidence_prob</code> is how common that phrase is across ALL emails, spam and legitimate combined (25%) - it acts as a normalizing factor. Plugging these into <code>bayes_theorem</code> computes the <strong>posterior</strong>: given that this particular email contains "free money", the probability it's spam jumps from the 20% baseline up to 72% - a concrete example of updating belief in light of evidence.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Without a principled way to combine prior knowledge with new evidence, decision-making tends to fall into one of two traps: ignoring base rates entirely (over-trusting any single piece of evidence) or ignoring new evidence entirely (never updating a stale belief).
<ul>
<li><strong>Base rate neglect</strong> is one of the most common statistical reasoning errors humans make - treating a positive test result, or a persuasive-looking piece of evidence, as near-certain proof, while ignoring how rare the underlying condition was to begin with. Bayes' Theorem makes this error mathematically impossible to make by construction, because the prior is baked directly into the formula.</li>
<li>An entire family of ML classifiers - <strong>Naive Bayes</strong> - is a direct, practical application of this theorem: it computes <code>P(class | features)</code> for every possible class by combining each class's prior frequency with how likely the observed features are under that class, then picks whichever class has the highest resulting posterior probability.</li>
<li><strong>Bayesian reasoning</strong> also underlies more advanced ML tooling like Bayesian hyperparameter optimization (used in libraries like Optuna) and Bayesian A/B testing, where beliefs about a model's best settings, or a website variant's true conversion rate, are continuously updated as new experimental data arrives rather than requiring a single fixed-sample-size test upfront.</li>
</ul>
<h3>Real-World Example</h3>
A rare disease affects <strong>1 in 1,000</strong> people (prior = 0.1%). A diagnostic test for it is <strong>99% accurate</strong> in both directions (99% true positive rate, 1% false positive rate). A patient tests positive - what's the actual probability they have the disease?
<ul>
<li>Intuition says "99% accurate test, positive result -> 99% chance of disease" - but this ignores the prior. Because the disease is so rare, the (small) 1% false-positive rate applied across the huge pool of healthy people produces almost as many false positives as the tiny pool of truly sick people produces true positives.</li>
<li>This is exactly why real medical practice never treats a single positive screening test as a diagnosis - it triggers a confirmatory second test instead, which combined with the first (via Bayes' Theorem applied twice) pushes the posterior probability much higher.</li>
</ul>`,
            codeExamples: [
                `# The classic rare-disease example: why a 99%-accurate test still often means < 50% chance of disease
def posterior_probability(prior, true_positive_rate, false_positive_rate):
    p_positive_given_disease = true_positive_rate
    p_positive_given_healthy = false_positive_rate
    p_positive = (p_positive_given_disease * prior) + (p_positive_given_healthy * (1 - prior))
    return (p_positive_given_disease * prior) / p_positive

prior = 0.001            # 1 in 1000 people have the disease
true_positive_rate = 0.99   # test correctly flags 99% of sick people
false_positive_rate = 0.01  # test incorrectly flags 1% of healthy people

posterior = posterior_probability(prior, true_positive_rate, false_positive_rate)
print(f"P(disease | positive test) = {posterior:.4f}  ({posterior*100:.1f}%)")

# Now apply Bayes' Theorem AGAIN, using this posterior as the new prior for a second, confirmatory test
posterior_after_2nd_test = posterior_probability(posterior, true_positive_rate, false_positive_rate)
print(f"P(disease | two positive tests) = {posterior_after_2nd_test:.4f} ({posterior_after_2nd_test*100:.1f}%)")
# OUTPUT:
# P(disease | positive test) = 0.0902  (9.0%)
# P(disease | two positive tests) = 0.9078 (90.8%)`
            ],
            codeExplanations: [
                `<code>posterior_probability</code> computes the full denominator of Bayes' Theorem explicitly: <code>p_positive</code> is the TOTAL probability of testing positive, combining true positives (sick people correctly flagged) AND false positives (healthy people incorrectly flagged), weighted by how common each group is. With a 1-in-1000 disease prevalence and a 99%-accurate test, the first calculation shows that a single positive result only raises the probability of actually having the disease to about 9% - counterintuitively low, because the disease is so rare that the 1% false-positive rate applied to the enormous healthy population produces far more false alarms than true cases. The second calculation feeds that 9% posterior back in AS THE NEW PRIOR for a second, independent confirmatory test - after two positive results, the probability jumps to about 91%, which is why doctors order follow-up tests rather than trusting one screening result.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Naturally incorporates prior knowledge</strong> - unlike purely frequentist methods that look only at the current sample, Bayesian methods let you formally encode existing domain knowledge (e.g. "this disease affects 1 in 1000 people") directly into the calculation, often producing much more sensible results with SMALL amounts of data.</li>
<li><strong>Gives a full probability, not just a decision</strong> - Naive Bayes and other Bayesian classifiers output a calibrated-ish probability for each class (e.g. "72% chance spam"), not just a hard yes/no label, which is valuable when the downstream cost of false positives and false negatives differs (e.g. a spam filter can route "72% spam" to a review folder instead of outright deleting it).</li>
<li><strong>Naive Bayes is extremely fast and works well with limited data</strong> - because it only needs to estimate simple per-feature probabilities rather than complex interactions, it trains in a single pass over the data and remains a strong baseline for text classification (spam filtering, sentiment analysis) even against more complex models.</li>
<li><strong>Updates incrementally and coherently</strong> - each new piece of evidence naturally becomes the next calculation's prior (as shown in the two-tests example above), giving a principled way to keep refining a belief as more data streams in, without needing to refit everything from scratch.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Requires a prior, which can be subjective or hard to estimate</strong> - if the true base rate (e.g. actual disease prevalence, or true spam ratio in a new user's inbox) is unknown or wrong, the resulting posterior is only as trustworthy as that prior; a badly chosen prior can distort every subsequent conclusion.</li>
<li><strong>The "naive" independence assumption in Naive Bayes is usually false</strong> - it assumes all features are conditionally independent given the class (e.g. that the words "free" and "money" appearing together provide independent evidence of spam), which rarely holds exactly in real text or data, though the classifier often still performs well in practice despite the violated assumption.</li>
<li><strong>Computationally expensive for complex/continuous real-world models</strong> - beyond simple textbook cases, computing a true Bayesian posterior over many correlated parameters (as in Bayesian neural networks) is often intractable exactly, requiring approximation techniques like MCMC sampling or variational inference, which are slower and harder to implement than standard gradient-based training.</li>
<li><strong>Counterintuitive results can be hard to communicate</strong> - as the rare-disease example shows, a "9% chance of disease after a positive test" result is often misunderstood by non-experts as "the test failed", when it's actually the mathematically correct consequence of a low prior, making Bayesian results sometimes harder to explain to stakeholders than a simple accuracy percentage.</li>
</ul>`,
            codeExamples: [
                `# A tiny Naive Bayes spam classifier built directly from Bayes' Theorem, word by word
import numpy as np
from collections import Counter

spam_emails = ["free money now", "win free cash prize", "free free free offer"]
ham_emails  = ["meeting scheduled tomorrow", "project report attached", "let's grab lunch"]

def word_counts(emails):
    return Counter(word for email in emails for word in email.split())

spam_counts, ham_counts = word_counts(spam_emails), word_counts(ham_emails)
vocab = set(spam_counts) | set(ham_counts)
n_spam_words, n_ham_words = sum(spam_counts.values()), sum(ham_counts.values())

prior_spam = len(spam_emails) / (len(spam_emails) + len(ham_emails))
prior_ham = 1 - prior_spam

def word_likelihood(word, counts, total_words):
    # Laplace (add-1) smoothing so an unseen word doesn't zero out the whole probability
    return (counts.get(word, 0) + 1) / (total_words + len(vocab))

def classify(email):
    words = email.split()
    log_p_spam = np.log(prior_spam) + sum(np.log(word_likelihood(w, spam_counts, n_spam_words)) for w in words)
    log_p_ham = np.log(prior_ham) + sum(np.log(word_likelihood(w, ham_counts, n_ham_words)) for w in words)
    return "SPAM" if log_p_spam > log_p_ham else "HAM"

for email in ["free cash offer", "lunch meeting tomorrow"]:
    print(f"'{email}' -> {classify(email)}")
# OUTPUT:
# 'free cash offer' -> SPAM
# 'lunch meeting tomorrow' -> HAM`
            ],
            codeExplanations: [
                `This builds a Naive Bayes text classifier essentially from scratch to expose exactly how Bayes' Theorem powers it. <code>word_counts</code> tallies how often each word appears within the spam and ham (non-spam) training emails separately. <code>prior_spam</code>/<code>prior_ham</code> are simply the class base rates (here 50/50, since 3 of each). <code>word_likelihood</code> computes <code>P(word | class)</code> for each word using Laplace smoothing (adding 1 to every count) so a word never seen in a class doesn't force its probability to exactly zero. <code>classify</code> applies Bayes' Theorem across the WHOLE email at once by multiplying (summed as logs, to avoid tiny-number underflow) the class prior by the likelihood of every word in the email under that class - this product-of-likelihoods step is exactly the "naive" conditional-independence assumption, treating each word as independent evidence. Comparing the resulting log-posterior for spam vs. ham and picking the larger one correctly classifies "free cash offer" as spam (dominated by words seen almost only in the spam training set) and "lunch meeting tomorrow" as ham.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>State Bayes' Theorem and explain what the prior, likelihood, and posterior represent.</td><td>P(H|E) = P(E|H) * P(H) / P(E). The prior P(H) is the belief in the hypothesis before seeing evidence; the likelihood P(E|H) is how probable the observed evidence is if the hypothesis were true; the posterior P(H|E) is the updated belief in the hypothesis after accounting for the evidence</td></tr>
<tr class='text-center'><td>Why can a 99%-accurate medical test still mean a positive result has a low chance of true disease?</td><td>Because the test's accuracy describes P(positive|disease), not P(disease|positive); when the disease is rare (a low prior), the small false-positive rate applied across the much larger healthy population produces a comparable or larger number of false positives than the true positives from the small sick population, dragging the posterior probability down - this is a form of base rate neglect that Bayes' Theorem corrects for mathematically</td></tr>
<tr class='text-center'><td>What does "naive" mean in Naive Bayes, and why does the algorithm still often work well despite it?</td><td>"Naive" refers to the assumption that all features are conditionally independent given the class label (e.g. that each word's presence in an email is independent evidence of spam, ignoring word correlations); this assumption is almost always technically false in real data, but the classifier often still ranks classes correctly in practice because it only needs the RELATIVE ordering of posterior probabilities to be right, not their exact calibrated values</td></tr>
</table>`
        }
    ]
};
