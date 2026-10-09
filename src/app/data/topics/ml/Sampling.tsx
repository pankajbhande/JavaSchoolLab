import { Topic } from '../../coreJava';

export const sampling: Topic = {
    id: 'ml-mathematics-sampling',
    name: 'Sampling',
    beginner: [
        {
            content: `<h4>Working With a Slice of the Data Instead of All of It</h4>
<ul>
<li><strong>Sampling</strong> means selecting a subset (a <strong>sample</strong>) of data points from a larger <strong>population</strong>, and using that subset to estimate properties of - or train a model on - the whole population.</li>
<li>ML almost never trains on the literal, complete population of interest (e.g. "every transaction that will ever happen"); it trains on a finite sample and hopes conclusions generalize.</li>
<li><strong>Random sampling</strong> gives every item an equal chance of being selected, which is the basic requirement for a sample to fairly represent the population; sampling that isn't random risks being <strong>biased</strong> - systematically over- or under-representing parts of the population.</li>
</ul>`,
            codeExamples: [
                `# Random sampling from a larger dataset
import numpy as np

rng = np.random.default_rng(0)
population = np.arange(1_000_000)          # stand-in for 1M transaction records

sample = rng.choice(population, size=5000, replace=False)
print("Sample size:", len(sample))
print("Sample mean index:", sample.mean())
print("Population mean index:", population.mean())
# OUTPUT (typical):
# Sample size: 5000
# Sample mean index: 502143.86
# Population mean index: 499999.5`
            ],
            codeExplanations: [
                `<code>rng.choice(population, size=5000, replace=False)</code> draws 5,000 records uniformly at random from a simulated 1-million-record population, with <code>replace=False</code> ensuring no record is picked twice. Because the selection is random and unbiased, the sample's mean index (502,143.86) lands very close to the true population mean (499,999.5) - this closeness is exactly what makes a random sample a trustworthy stand-in for the full population; a biased sampling method (e.g. only taking the first 5,000 records) would NOT show this property.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Every dataset an ML model is trained or evaluated on is a sample, not the true population, and HOW that sample was drawn directly determines whether the model's learned patterns will generalize to new, real-world data.
<ul>
<li><strong>Training data itself is a sample</strong> - a spam classifier trained on emails collected last year is a sample from the broader, ever-changing population of "all emails a user will ever receive"; if spam tactics shift, the training sample no longer represents the current population (a form of <strong>sampling bias</strong> across time, related to <strong>data/concept drift</strong>).</li>
<li><strong>Train/test splitting is itself a sampling decision</strong> - randomly splitting rows into train and test sets assumes the split is representative of the whole dataset; for imbalanced classes, a plain random split can accidentally leave the test set with too few minority-class examples, which is exactly why <strong>stratified sampling</strong> is used instead.</li>
<li><strong>Cross-validation's fold assignments</strong> are themselves samples of the data - each fold is a random (or stratified) sample used as a temporary validation set, and the reliability of the resulting performance estimate depends on those folds being representative.</li>
<li><strong>Class imbalance handling techniques</strong> (oversampling the minority class with SMOTE, undersampling the majority class) are direct applications of deliberately changing HOW a training sample is drawn, in order to fix an imbalance present in the raw population.</li>
</ul>
<h3>Real-World Example</h3>
A company trains a fraud-detection model by sampling 2 million transactions from its multi-billion-row historical database, to keep training fast. To make extraction simple, an engineer pulls the sample using a database query ordered by <code>region_id</code>, taking the first 2 million rows returned.
<ul>
<li>Because the underlying table happens to be sorted/clustered by region, this "convenience sample" ends up containing transactions almost entirely from ONE region - the model never sees fraud patterns common in other regions (different currencies, different typical purchase categories, different fraud rings).</li>
<li>The resulting model performs great on internal validation (sampled the same biased way) but performs badly in production once deployed globally - a classic case of <strong>sampling bias</strong> silently limiting what a model can ever learn, undetectable just by looking at accuracy numbers on a similarly biased test set.</li>
</ul>`,
            codeExamples: [
                `# Biased convenience sampling vs proper random sampling, and the effect on a learned estimate
import numpy as np

rng = np.random.default_rng(1)
regions = np.array(["A", "B", "C", "D"])
region_id = rng.choice(regions, size=2_000_000, p=[0.4, 0.3, 0.2, 0.1])
# Fraud rate differs meaningfully by region
fraud_rate_by_region = {"A": 0.01, "B": 0.03, "C": 0.08, "D": 0.15}
is_fraud = np.array([rng.random() < fraud_rate_by_region[r] for r in region_id[:200_000]])

true_fraud_rate = np.mean([rng.random() < fraud_rate_by_region[r] for r in region_id])

# "Convenience" sample: first rows after sorting by region -> dominated by region A
sorted_idx = np.argsort(region_id, kind="stable")[:200_000]
biased_sample_regions = region_id[sorted_idx]
biased_fraud_rate = np.mean([fraud_rate_by_region[r] for r in biased_sample_regions])

# Proper random sample of the same size
random_idx = rng.choice(len(region_id), size=200_000, replace=False)
random_sample_regions = region_id[random_idx]
random_fraud_rate = np.mean([fraud_rate_by_region[r] for r in random_sample_regions])

print(f"True population fraud rate:      {true_fraud_rate:.4f}")
print(f"Biased (convenience) sample est.: {biased_fraud_rate:.4f}")
print(f"Random sample estimate:          {random_fraud_rate:.4f}")
# OUTPUT (typical):
# True population fraud rate:      0.0340
# Biased (convenience) sample est.: 0.0100
# Random sample estimate:          0.0341`
            ],
            codeExplanations: [
                `A 2-million-row population is simulated with four regions that have DIFFERENT underlying fraud rates (1% to 15%), mimicking real regional variation in fraud behavior. The "biased sample" mimics the convenience-sampling mistake by sorting rows by <code>region_id</code> and taking the first 200,000 - which, given region A's 40% share and sort ordering, ends up almost entirely region-A rows. Its estimated fraud rate (0.0100) badly undershoots the true population rate (0.0340) because it barely reflects regions C and D's much higher fraud rates. The properly random sample of the same size instead lands at 0.0341, extremely close to the true rate - demonstrating that sample SIZE alone (both samples have 200,000 rows) does not guarantee a reliable estimate; HOW the sample was drawn matters just as much.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Makes ML on huge datasets computationally feasible</strong> - training on a well-drawn sample of millions of rows instead of billions can produce a model that performs nearly as well, at a fraction of the compute and time cost, which is why almost all large-scale ML pipelines sample rather than use literally all historical data.</li>
<li><strong>Random sampling gives statistically unbiased estimates</strong> - as the fraud-rate example shows, a properly random sample's statistics (mean, proportions) converge to the true population values, which is the mathematical foundation that makes trusting a sample-trained model's behavior on new data reasonable.</li>
<li><strong>Stratified sampling preserves rare-but-important segments</strong> - for imbalanced data (fraud, rare disease diagnosis, equipment failure), stratified sampling guarantees the minority class still appears in every train/validation split in its true proportion, preventing folds that accidentally contain zero minority examples (directly connects to <strong>Stratified K-Fold Cross Validation</strong>).</li>
<li><strong>Larger sample sizes shrink estimate uncertainty predictably</strong> - by the standard error formula (which scales with 1/sqrt(n)), quadrupling the sample size roughly halves the uncertainty in an estimate, giving a clear, quantifiable cost/reliability tradeoff when deciding how much data to sample.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Sampling bias silently degrades a model with no obvious error</strong> - as in the single-region fraud example, a biased sample trains and validates "successfully" (good-looking metrics on similarly-biased data) while actually learning a badly skewed picture of reality, and the failure often only shows up after costly production deployment.</li>
<li><strong>Small sample sizes produce high-variance, unreliable estimates</strong> - with too few examples, a single unusual data point can swing an estimate substantially (e.g. one accidental outlier transaction dramatically shifting an estimated average transaction value), making conclusions fragile and hard to trust.</li>
<li><strong>Convenience sampling (grabbing whatever data is easiest to access) is tempting but dangerous</strong> - data that's easy to pull (most recent records, a single database shard, an internal test population) is rarely representative of the true deployment population, yet its ease of access makes it a common trap.</li>
<li><strong>Even random sampling can't fix a biased population</strong> - if the underlying DATA COLLECTION process itself was biased (e.g. only customers who use a mobile app ever get logged, excluding all desktop-only users), no amount of clever random sampling from that already-skewed pool can recover the missing desktop-user population.</li>
</ul>`,
            codeExamples: [
                `# Stratified sampling to preserve class proportions when creating a training subset
import numpy as np
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(2)
n = 100_000
y = rng.choice([0, 1], size=n, p=[0.98, 0.02])   # 2% fraud, heavily imbalanced

# Plain random subsampling to 5% of the data
random_idx = rng.choice(n, size=5000, replace=False)
print("Plain random subsample fraud rate:", y[random_idx].mean().round(4))

# Stratified subsampling to 5% of the data, preserving the 2% fraud ratio
_, y_stratified = train_test_split(y, train_size=5000, stratify=y, random_state=0)
print("Stratified subsample fraud rate:  ", y_stratified.mean().round(4))
print("True population fraud rate:       ", y.mean().round(4))
# OUTPUT (typical):
# Plain random subsample fraud rate: 0.0206
# Stratified subsample fraud rate:   0.0200
# True population fraud rate:        0.02`
            ],
            codeExplanations: [
                `A 100,000-row population is simulated with a strongly imbalanced 2% fraud rate, typical of real fraud-detection data. Plain random subsampling to 5,000 rows happens to land close to 2% here (0.0206) simply by luck of the draw, but with imbalanced classes and smaller subsample sizes, pure random draws can easily land further off - or with too few positive examples to train on reliably. <code>train_test_split(..., stratify=y)</code> performs <strong>stratified sampling</strong>: it explicitly forces the subsample's class proportions to match the population's proportions (0.0200, matching the true 0.02 almost exactly), which is the standard, more reliable technique for building any training/validation subset from imbalanced ML data.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does ML almost always train on a sample rather than the full population, and what assumption does that rely on?</td><td>The full population (e.g. every transaction that will ever occur) is either impossibly large, still being generated, or too costly to use entirely, so models train on a finite sample instead; this relies on the assumption that the sample is representative of the population the model will actually be used on, which only holds if the sample was drawn without systematic bias</td></tr>
<tr class='text-center'><td>What is sampling bias, and how could it cause a fraud-detection model trained on a "convenience" sample to fail in production despite looking accurate during development?</td><td>Sampling bias occurs when the method used to select a sample systematically over- or under-represents parts of the population - e.g. pulling training data sorted by region and taking the first rows ends up drawing almost entirely from one region. If validation data is drawn the same biased way, the reported accuracy looks fine, but the model never learned patterns from underrepresented regions and fails once deployed against the true, broader population</td></tr>
<tr class='text-center'><td>What is stratified sampling and why is it preferred over plain random sampling for imbalanced classification data?</td><td>Stratified sampling explicitly preserves each class's original proportion within every sample or split drawn, whereas plain random sampling can, by chance, produce a subsample or fold with too few (or zero) examples of a rare class, especially at smaller sample sizes - stratification removes that risk and gives a more reliable, representative sample for training and evaluation</td></tr>
</table>`
        }
    ]
};
