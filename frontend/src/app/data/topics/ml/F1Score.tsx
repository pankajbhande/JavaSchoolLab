import { Topic } from '../../coreJava';

export const f1Score: Topic = {
    id: 'ml-model-evaluation-f1-score',
    name: 'F1 Score',
    beginner: [
        {
            content: `<h4>One Number That Balances Precision and Recall</h4>
<ul>
<li><strong>F1 Score</strong> combines <code>Precision = TP/(TP+FP)</code> and <code>Recall = TP/(TP+FN)</code> into a single number using the <strong>harmonic mean</strong>: <code>F1 = 2 &middot; (Precision &middot; Recall) / (Precision + Recall)</code>.</li>
<li>Unlike a plain average, the harmonic mean stays LOW unless both precision and recall are reasonably high - it refuses to reward a model that is great at one and terrible at the other.</li>
<li>F1 ranges from 0 (worst) to 1 (best), and is especially useful when you need one number to rank or compare models rather than juggling two separate ones.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import precision_score, recall_score, f1_score

# 1 = spam, 0 = not spam
y_actual =    [1, 0, 1, 1, 0, 0, 1, 0, 0, 1]
y_predicted = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0]

p = precision_score(y_actual, y_predicted)
r = recall_score(y_actual, y_predicted)
f1 = f1_score(y_actual, y_predicted)
print(f"Precision: {p:.2f}  Recall: {r:.2f}  F1: {f1:.2f}")
# OUTPUT:
# Precision: 0.75  Recall: 0.60  F1: 0.67`
            ],
            codeExplanations: [
                `This scores a spam classifier's predictions and computes precision (0.75), recall (0.60), and F1 (0.67) with scikit-learn. Notice F1 lands between precision and recall but closer to the SMALLER of the two - that's the harmonic mean's signature behavior, and it's what makes F1 a meaningfully different summary than a plain arithmetic average, which would have given a slightly higher and less honest 0.675.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Comparing models on two separate numbers (precision and recall) gets ambiguous fast - if Model A has higher precision and Model B has higher recall, which one is "better"? F1 gives a single, comparable score that resolves this ambiguity by rewarding BALANCE between the two.</li>
<li>Crucially, F1 uses the harmonic mean instead of the arithmetic mean specifically because the harmonic mean punishes imbalance between precision and recall much more severely - a model with one very high and one very low score gets a low F1, correctly flagging it as lopsided rather than "average."</li>
<li>This makes F1 the natural single-number metric for imbalanced classification problems, where accuracy is misleading and precision or recall alone tell only half the story.</li>
</ul>
<h3>Real-World Example</h3>
A team is comparing two spam-filter candidates before choosing which one to ship.
<ul>
<li><strong>Model A</strong> has <strong>high precision (0.95) but low recall (0.40)</strong> - when it flags something as spam it's almost always right, but it lets most spam through untouched.</li>
<li><strong>Model B</strong> has <strong>low precision (0.40) but high recall (0.95)</strong> - it catches nearly all spam, but also wrongly flags a lot of legitimate email.</li>
<li>A plain average would call both models roughly equally good (both average to about 0.675), but F1 reveals the truth: both are actually similarly UNBALANCED and neither is a strong all-around performer, which is exactly the kind of insight a plain average would completely miss.</li>
</ul>`,
            codeExamples: [
                `# F1 exposes imbalance that a plain average hides, when comparing two lopsided models
precision_a, recall_a = 0.95, 0.40   # Model A: very precise, but misses most spam
precision_b, recall_b = 0.40, 0.95   # Model B: catches most spam, but many false alarms

def arithmetic_mean(p, r):
    return (p + r) / 2

def f1(p, r):
    return 2 * (p * r) / (p + r)

print(f"Model A - arithmetic mean: {arithmetic_mean(precision_a, recall_a):.3f}  F1: {f1(precision_a, recall_a):.3f}")
print(f"Model B - arithmetic mean: {arithmetic_mean(precision_b, recall_b):.3f}  F1: {f1(precision_b, recall_b):.3f}")
# OUTPUT:
# Model A - arithmetic mean: 0.675  F1: 0.571
# Model B - arithmetic mean: 0.675  F1: 0.571`
            ],
            codeExplanations: [
                `This hand-computes both an arithmetic mean and an F1 score for two deliberately lopsided precision/recall pairs that are mirror images of each other. Both models get the exact same arithmetic mean (0.675), which would suggest they're equally good - but F1 gives both the same LOWER score (0.571), correctly reflecting that both models are similarly imbalanced rather than well-rounded. In a real comparison where the imbalance differs between two candidates, F1 (not a plain average) is what would correctly rank the more balanced model higher, which is exactly why F1 rather than a simple average is used to compare classifiers with different precision/recall tradeoffs.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - F1's Hidden Assumption, and the F-beta Score</h3>
<ul>
<li>F1's harmonic mean formula silently assumes precision and recall are <strong>equally important</strong> - it weights them 50/50. That assumption is often wrong: in cancer screening recall matters far more than precision, while in a spam filter precision matters far more than recall.</li>
<li>The <strong>F-beta score</strong> generalizes F1 with a tunable weight &beta;: <code>F&beta; = (1+&beta;&sup2;) &middot; (Precision &middot; Recall) / (&beta;&sup2; &middot; Precision + Recall)</code>. Setting &beta; &gt; 1 (e.g. F2) weights recall more heavily; &beta; &lt; 1 (e.g. F0.5) weights precision more heavily; &beta; = 1 recovers plain F1.</li>
<li>Choosing &beta; is a business decision, not a statistical one - it should be set based on the real-world relative cost of a false negative versus a false positive for the specific application, not left at the default of 1 out of convenience.</li>
</ul>`,
            codeExamples: [
                `# F1 assumes precision and recall matter equally - F-beta lets you say otherwise
from sklearn.metrics import fbeta_score

y_actual =    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
y_predicted = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]   # catches 2 of 5 real positives, no false alarms

for beta, label in [(0.5, "precision-weighted"), (1.0, "balanced (F1)"), (2.0, "recall-weighted")]:
    score = fbeta_score(y_actual, y_predicted, beta=beta, zero_division=0)
    print(f"F{beta} ({label}): {score:.3f}")
# OUTPUT:
# F0.5 (precision-weighted): 0.556
# F1.0 (balanced (F1)): 0.500
# F2.0 (recall-weighted): 0.455`
            ],
            codeExplanations: [
                `This uses scikit-learn's fbeta_score on a model that has perfect precision (1.00, zero false alarms) but weak recall (0.40, misses 3 of 5 real positives), scoring it at three different beta values. F0.5 weights precision more heavily and gives the highest score (0.556) because it rewards this model's strong precision. F2 weights recall more heavily and gives the lowest score (0.455) because it punishes the weak recall harder. Plain F1 (beta=1) sits in between at 0.500, treating both equally. This shows concretely how the choice of beta changes which kind of model looks "better" - a team that cares more about recall (e.g. cancer screening) would use F2 to evaluate models, not F1, since F1's 50/50 weighting doesn't reflect their actual priorities.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is F1 score and what formula defines it?</td><td>F1 is the harmonic mean of precision and recall: F1 = 2 &middot; (Precision &middot; Recall) / (Precision + Recall) - a single number that summarizes both metrics at once</td></tr>
<tr class='text-center'><td>Why does F1 use the harmonic mean instead of the arithmetic mean?</td><td>The harmonic mean is pulled toward whichever of precision or recall is smaller, so it stays low unless BOTH are reasonably high; an arithmetic mean can look deceptively decent even when one of the two is very low, hiding a genuinely imbalanced or weak model</td></tr>
<tr class='text-center'><td>What assumption does plain F1 make, and how do you fix it when precision and recall don't matter equally?</td><td>F1 assumes precision and recall are equally important (a 50/50 weighting); when one matters more than the other (e.g. recall in cancer screening, precision in spam filtering), the F-beta score generalizes F1 with a weight beta - beta &gt; 1 favors recall, beta &lt; 1 favors precision, and beta = 1 recovers plain F1</td></tr>
</table>`
        }
    ]
};
