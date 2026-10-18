import { Topic } from '../../coreJava';

export const sensitivity: Topic = {
    id: 'ml-model-evaluation-sensitivity',
    name: 'Sensitivity',
    beginner: [
        {
            content: `<h4>Recall's Other Name - the Term Medicine and Statistics Use</h4>
<ul>
<li><strong>Sensitivity</strong> is mathematically IDENTICAL to <strong>Recall</strong>: <code>Sensitivity = TP / (TP + FN)</code> - of all the cases that were REALLY positive, how many did the test or model correctly catch.</li>
<li>The formula never changes, only the vocabulary does: data scientists and ML engineers say "recall," while doctors, epidemiologists, and statisticians say "sensitivity" - both describe the exact same calculation.</li>
<li>Sensitivity is almost always reported alongside its mirror image, <strong>Specificity</strong> (the True Negative Rate), giving a complete picture of how a test performs on both the positive and negative classes.</li>
</ul>`,
            codeExamples: [
                `from sklearn.metrics import recall_score

# 1 = infected, 0 = healthy (a diagnostic test's results)
y_actual =    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
y_predicted = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]

# scikit-learn has no separate "sensitivity_score" - it's the same function as recall
sensitivity = recall_score(y_actual, y_predicted)
print(f"Sensitivity: {sensitivity:.2f}")
# OUTPUT:
# Sensitivity: 0.60   <- of the 5 actually infected patients, the test caught 3`
            ],
            codeExplanations: [
                `This scores a diagnostic test's results using scikit-learn's recall_score() function - there is no separate "sensitivity_score" in scikit-learn because sensitivity and recall are literally the same computation. Of the 5 patients who are actually infected, the test correctly flagged 3, giving a sensitivity (equivalently, recall) of 0.60. Reading medical literature, this exact number would typically be reported as "the test has 60% sensitivity" rather than "60% recall" - same math, different field's convention.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Sensitivity is usually the FIRST number reported for a new diagnostic test in medical literature, because in screening contexts a missed diagnosis (a false negative) is typically considered the primary risk - a sensitive test is one that rarely lets a real case slip through undetected.</li>
<li>Knowing that sensitivity and recall are the same thing matters practically: a data scientist reading a clinical trial paper, or a doctor reading an ML model's evaluation report, needs to translate between the two vocabularies to avoid thinking they're looking at two different metrics.</li>
<li>This terminology gap isn't unique to sensitivity - specificity and the "True Negative Rate," or precision and "Positive Predictive Value" in medicine, are further examples of the same underlying math being described with field-specific names.</li>
</ul>
<h3>Real-World Example</h3>
A research paper introduces a new blood test for detecting a rare autoimmune disease, and reports its evaluation results.
<ul>
<li>The paper's headline results table leads with "<strong>Sensitivity: 94%, Specificity: 89%</strong>" - the standard way clinical performance is communicated in medicine, prioritizing sensitivity first because missing a sick patient (false negative) is the primary concern in a screening context.</li>
<li>A data science team evaluating whether to build a similar ML-based screening tool reads this paper and needs to recognize that "Sensitivity: 94%" is exactly equivalent to "Recall: 0.94" in their own vocabulary - the same TP/(TP+FN) calculation, just described with the medical field's convention.</li>
<li>Recognizing this equivalence lets the team directly compare their own model's recall against the published test's sensitivity on an apples-to-apples basis, without needing to re-derive anything.</li>
</ul>`,
            codeExamples: [
                `# Confirming sensitivity and recall are numerically identical - same formula, different name
from sklearn.metrics import recall_score

# Simulated ML model results, to compare against a paper reporting "94% sensitivity"
y_actual =    [1]*50 + [0]*50
y_predicted = [1]*47 + [0]*3 + [0]*45 + [1]*5   # 47 of 50 actual positives caught

ml_recall = recall_score(y_actual, y_predicted)
print(f"ML team's 'Recall': {ml_recall:.2f}")
print(f"Equivalent to reporting: 'Sensitivity: {ml_recall*100:.0f}%' in a clinical paper")
# OUTPUT:
# ML team's 'Recall': 0.94
# Equivalent to reporting: 'Sensitivity: 94%' in a clinical paper`
            ],
            codeExplanations: [
                `This computes recall_score() on a simulated model that catches 47 of 50 actual positive cases, giving 0.94. The point of the example is not the calculation itself (which is identical to any other recall calculation) but the framing: this exact 0.94 is what a clinical paper would report as "94% sensitivity." There is no additional math or conversion needed - recognizing this equivalence is what lets a data science team and a clinical research team compare their respective models/tests directly, despite reporting results in different vocabularies.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - The Sensitivity-Specificity Tradeoff (Medicine's Framing of Precision-Recall)</h3>
<ul>
<li>Just as ML practitioners talk about the precision-recall tradeoff, the medical field talks about the <strong>sensitivity-specificity tradeoff</strong> - the same underlying phenomenon of moving a diagnostic decision threshold (e.g. a lab value cutoff for calling a test "positive") and watching one metric rise while the other falls.</li>
<li>A very LOW cutoff for calling a test positive (e.g. any trace amount of a biomarker) tends to maximize sensitivity (catches almost every real case) but tanks specificity (flags many healthy people too). A very HIGH cutoff does the reverse.</li>
<li>This is visualized in medicine using the exact same tool as in ML - the ROC curve - which plots sensitivity against (1 - specificity) across every possible cutoff, making the medical framing and the ML framing of this tradeoff literally the same graph with different vocabulary painted on the axes.</li>
</ul>`,
            codeExamples: [
                `# Moving a diagnostic cutoff and watching sensitivity trade off against specificity
import numpy as np
from sklearn.metrics import recall_score, confusion_matrix

rng = np.random.default_rng(1)
# simulated biomarker levels: higher in truly infected patients
y_actual = np.array([1]*30 + [0]*70)
biomarker = np.concatenate([rng.normal(6, 1.5, 30), rng.normal(3, 1.5, 70)])

for cutoff in [3.0, 4.5, 6.0]:
    y_pred = (biomarker >= cutoff).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_actual, y_pred).ravel()
    sensitivity = tp / (tp + fn)
    specificity = tn / (tn + fp)
    print(f"cutoff={cutoff}  sensitivity={sensitivity:.2f}  specificity={specificity:.2f}")
# OUTPUT (typical):
# cutoff=3.0  sensitivity=0.97  specificity=0.44   <- low bar: catches almost everyone, many false alarms
# cutoff=4.5  sensitivity=0.77  specificity=0.83   <- balanced
# cutoff=6.0  sensitivity=0.40  specificity=0.97   <- high bar: rarely wrong when positive, misses many real cases`
            ],
            codeExplanations: [
                `This simulates a biomarker that tends to run higher in truly infected patients, then tests three different diagnostic cutoffs for calling the test "positive." At the lowest cutoff (3.0), almost anyone with even a modest biomarker level tests positive, so sensitivity is high (0.97, catching almost every real case) but specificity is poor (0.44, many healthy people wrongly flagged). At the highest cutoff (6.0), only patients with a very elevated biomarker test positive, so specificity is excellent (0.97) but sensitivity collapses (0.40, missing most real cases). This is the sensitivity-specificity tradeoff in its native medical framing - numerically and conceptually the same tradeoff as ML's precision-recall tradeoff, just applied to a lab cutoff instead of a model's probability threshold.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between sensitivity and recall?</td><td>There is no mathematical difference - both are TP/(TP+FN); "recall" is the term used in machine learning and data science, while "sensitivity" is the term used in medicine and statistics for the exact same calculation</td></tr>
<tr class='text-center'><td>Why is sensitivity usually the first metric reported for a new diagnostic test?</td><td>In screening contexts a missed diagnosis (false negative) is typically the primary risk, so a test's ability to catch real cases (its sensitivity) is treated as the headline number, often reported before specificity</td></tr>
<tr class='text-center'><td>What is the sensitivity-specificity tradeoff, and how does it relate to precision-recall?</td><td>It is medicine's framing of the exact same phenomenon as the ML precision-recall tradeoff: moving a diagnostic cutoff/threshold increases sensitivity at the cost of specificity, or vice versa; both are commonly visualized with the same tool, the ROC curve, which plots sensitivity against 1 - specificity</td></tr>
</table>`
        }
    ]
};
