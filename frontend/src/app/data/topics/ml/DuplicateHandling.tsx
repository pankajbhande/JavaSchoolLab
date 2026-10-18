import { Topic } from '../../coreJava';

export const duplicateHandling: Topic = {
    id: 'ml-data-preprocessing-duplicate-handling',
    name: 'Duplicate Handling',
    beginner: [
        {
            content: `<h4>When the Same Record Shows Up More Than Once</h4>
<ul>
<li><strong>Duplicate Handling</strong> is the process of finding and removing rows that represent the same real-world record appearing more than once in a dataset.</li>
<li><strong>Exact duplicates</strong> are rows that are identical (or identical on the columns that define uniqueness, like a transaction ID). <strong>Near-duplicates</strong> (fuzzy duplicates) are rows that represent the same real thing but differ slightly - e.g. tiny formatting differences, a re-submitted form with one field corrected.</li>
<li>Left unchecked, duplicates quietly give one real event extra "votes" in whatever the model learns, and they can leak the same record across both the training set and the test set.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

df = pd.DataFrame({
    "transaction_id": ["T1", "T2", "T2", "T3", "T4"],
    "amount": [250, 900, 900, 75, 1200],
    "is_fraud": [0, 1, 1, 0, 0],
})

# Detect exact duplicates (based on transaction_id, which should be unique)
duplicate_mask = df.duplicated(subset=["transaction_id"], keep="first")
print("Duplicate rows found:\\n", df[duplicate_mask])

# Remove them, keeping only the first occurrence
deduped = df.drop_duplicates(subset=["transaction_id"], keep="first")
print("\\nAfter removing duplicates:\\n", deduped)
# OUTPUT:
# Duplicate rows found:
#   transaction_id  amount  is_fraud
# 2             T2     900         1
#
# After removing duplicates:
#   transaction_id  amount  is_fraud
# 0             T1     250         0
# 1             T2     900         1
# 3             T3      75         0
# 4             T4    1200         0`
            ],
            codeExplanations: [
                `<code>df.duplicated(subset=["transaction_id"], keep="first")</code> flags every row whose <code>transaction_id</code> has already appeared earlier in the dataframe - here, transaction <code>T2</code> appears twice with identical details, almost certainly because a retry or logging bug recorded the same real transaction twice. <code>drop_duplicates</code> with the same <code>subset</code> and <code>keep="first"</code> removes the extra copy while keeping one instance of each real transaction, restoring the dataset to one row per genuine event before it is used for training or evaluation.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Duplicates cause two distinct, serious problems - one during training, one during evaluation - and both can happen silently without any error or warning.
<ul>
<li><strong>Training bias from overweighting</strong> - if the same real transaction appears twice, a model trained via gradient descent or any loss-minimizing algorithm effectively counts that one event's pattern twice in the loss function, nudging the model to overfit to that specific pattern as if it were twice as common in reality as it actually is.</li>
<li><strong>Data leakage via train/test overlap</strong> - if a duplicate row lands in the training set AND its twin lands in the test set (an easy accident when duplicates are removed AFTER splitting, or not removed at all), the model is effectively evaluated on a data point it already memorized during training - producing an artificially high validation score that will not hold up on genuinely new data in production.</li>
<li><strong>Inflated confidence in a fraud/anomaly model specifically</strong> - fraud datasets are often heavily imbalanced (fraud is rare), so a duplicated fraud row disproportionately affects the minority class the model is trying hardest to learn, exaggerating how "learnable" that specific fraud pattern is.</li>
</ul>
<h3>Real-World Example</h3>
A bank's <strong>fraud detection</strong> pipeline ingests transaction events from a payment processor. Due to a <strong>network retry bug</strong>, a small percentage of transactions get submitted twice to the logging system whenever the processor's acknowledgment response is delayed - the SAME transaction (same ID, amount, merchant, timestamp) is recorded as two separate rows. If these duplicates are not removed before splitting into train/test sets, two things go wrong: first, the duplicated fraud transactions get double weight during training, causing the model to overfit to those specific fraud patterns as if they were twice as common as they really are; second, if one copy of a duplicated transaction lands in training and its exact twin lands in the test set, the model is being "tested" on a transaction it has already seen verbatim - producing a misleadingly high fraud-detection accuracy that will not hold up on real, unseen transactions in production.`,
            codeExamples: [
                `# Demonstrating data leakage: a duplicate transaction split across train and test inflates accuracy
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

rng = np.random.default_rng(0)
n = 300
amount = rng.uniform(10, 2000, n)
is_fraud = (amount > 1500).astype(int)   # simple rule the model should learn
df = pd.DataFrame({"amount": amount, "is_fraud": is_fraud})

# Simulate the retry bug: 15% of rows get logged a second time (exact duplicates)
dup_rows = df.sample(frac=0.15, random_state=1)
df_with_dupes = pd.concat([df, dup_rows], ignore_index=True)

# WRONG: split AFTER duplicates exist -> a transaction's twin can land in both train and test
X, y = df_with_dupes[["amount"]], df_with_dupes["is_fraud"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
model_leaky = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_train, y_train)
leaky_acc = accuracy_score(y_test, model_leaky.predict(X_test))

# CORRECT: remove duplicates BEFORE splitting
df_clean = df_with_dupes.drop_duplicates()
Xc, yc = df_clean[["amount"]], df_clean["is_fraud"]
Xc_train, Xc_test, yc_train, yc_test = train_test_split(Xc, yc, test_size=0.25, random_state=0)
model_clean = DecisionTreeClassifier(max_depth=2, random_state=0).fit(Xc_train, yc_train)
clean_acc = accuracy_score(yc_test, model_clean.predict(Xc_test))

print(f"Accuracy WITH duplicate leakage (split after dupes):    {leaky_acc:.3f}")
print(f"Accuracy WITHOUT leakage (deduped before split):        {clean_acc:.3f}")
# OUTPUT (typical):
# Accuracy WITH duplicate leakage (split after dupes):    1.000
# Accuracy WITHOUT leakage (deduped before split):        0.987`
            ],
            codeExplanations: [
                `The simulation injects exact duplicates BEFORE splitting - just like the bank's retry bug would - then splits into train/test. Because duplicate rows exist, some transactions' exact twins end up on both sides of the split, so the model is effectively tested on data it memorized during training, and the leaky accuracy comes out at a suspiciously perfect 1.000. When duplicates are removed first with <code>drop_duplicates()</code> and THEN the data is split, no transaction can appear on both sides, and the reported accuracy (0.987) is a more honest estimate of how the model would perform on genuinely unseen transactions - the gap between the two numbers is exactly the size of the illusion that duplicate-driven leakage created.`
            ]
        },
        {
            content: `<h3>Exact vs Near-Duplicate Detection</h3>
<ul>
<li><strong>Exact duplicates</strong> - rows identical across all columns (or a defined key subset, like transaction ID) are found with <code>duplicated()</code>/<code>drop_duplicates()</code>, an efficient, deterministic check.</li>
<li><strong>Near-duplicates (fuzzy duplicates)</strong> - rows that represent the same real-world entity but differ slightly due to formatting, typos, or partial updates (e.g. "Jiva Smith, 123 Main St" vs "Jon Smith, 123 Main Street") require <strong>fuzzy matching</strong> - comparing string similarity (e.g. Levenshtein distance) or matching on a normalized subset of fields (name + phone number, ignoring address formatting) rather than requiring exact equality.</li>
<li>Near-duplicate detection is inherently a judgment call with a tunable threshold - too strict and real duplicates are missed, too loose and genuinely different records get incorrectly merged, so it typically needs manual review of borderline matches rather than a single automated cutoff.</li>
</ul>
<h3>Duplicates and the Train/Test Split Order</h3>
<ul>
<li>The safe rule: <strong>always deduplicate BEFORE splitting</strong> into train/test (or before cross-validation folds are created) - this guarantees no near-identical record can appear on both sides of the split.</li>
<li>For near-duplicates specifically, even after fuzzy-deduplication, it's worth checking that no two very similar (but not byte-identical) records still ended up split across train and test, since this is a subtler form of the same leakage.</li>
<li>Time-series or grouped data (e.g. multiple transactions from the same customer) has a related risk: even without literal duplicate rows, splitting randomly instead of by group/customer can leak information about a customer's OTHER transactions between train and test - a lesson duplicate handling generalizes into.</li>
</ul>`,
            codeExamples: [
                `# Near-duplicate (fuzzy) detection using simple string normalization + similarity
import pandas as pd
from difflib import SequenceMatcher

df = pd.DataFrame({
    "customer_name": ["Jiva Smith", "Jon Smith", "Prataprao Patel", "Anandrao Verma"],
    "phone": ["9998887771", "9998887771", "9112223334", "9556667778"],
})

def normalized_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

flagged_pairs = []
for i in range(len(df)):
    for j in range(i + 1, len(df)):
        same_phone = df.loc[i, "phone"] == df.loc[j, "phone"]
        name_sim = normalized_similarity(df.loc[i, "customer_name"], df.loc[j, "customer_name"])
        if same_phone and name_sim > 0.8:
            flagged_pairs.append((df.loc[i, "customer_name"], df.loc[j, "customer_name"], round(name_sim, 2)))

print("Likely near-duplicate pairs (same phone, similar name):", flagged_pairs)
# OUTPUT:
# Likely near-duplicate pairs (same phone, similar name): [('Jiva Smith', 'Jon Smith', 0.9)]`
            ],
            codeExplanations: [
                `Exact-match <code>duplicated()</code> would completely miss "Jiva Smith" vs "Jon Smith" - the strings are different, so pandas would treat them as two distinct customers. This fuzzy approach instead combines a strong, reliable signal (identical <code>phone</code> number) with a string similarity score (<code>SequenceMatcher.ratio()</code>, ranging 0 to 1) on the name field, flagging pairs that share a phone number AND have a high name similarity (above 0.8 here) as likely referring to the same real customer with a typo. This kind of fuzzy detection needs a chosen threshold and ideally a human review step for borderline cases, since it trades perfect precision for the ability to catch duplicates that exact matching cannot see at all.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Prevents artificial overweighting of specific patterns</strong> - removing exact duplicates ensures each real event contributes to model training exactly once, matching its true frequency in reality.</li>
<li><strong>Closes a subtle but serious data leakage path</strong> - deduplicating before splitting guarantees no record (or its near-identical twin) can appear in both train and test, keeping evaluation metrics honest.</li>
<li><strong>Fuzzy matching catches real-world duplication that formatting hides</strong> - customer records, addresses, and free-text fields rarely repeat byte-for-byte, so near-duplicate detection surfaces genuine duplicate entities that exact matching would completely miss.</li>
<li><strong>Cheap to apply relative to the damage duplicates cause</strong> - <code>drop_duplicates()</code> is a nearly free, one-line operation compared to the cost of a fraud model's accuracy numbers being systematically inflated in production.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Deciding what counts as a "duplicate" is not always obvious</strong> - two rows sharing every field except a timestamp could be a genuine retry-bug duplicate, or could be two real, separate events (e.g. the same customer legitimately buying the identical item twice); blindly deduplicating on partial keys can wrongly delete real data.</li>
<li><strong>Fuzzy/near-duplicate detection is computationally expensive at scale</strong> - naive pairwise string comparison is O(n&sup2;), which becomes impractical on datasets with millions of rows without smarter blocking or indexing strategies.</li>
<li><strong>Fuzzy matching thresholds involve a real precision/recall tradeoff</strong> - too loose a similarity threshold merges genuinely different records (e.g. two different people who happen to share a similar name and area code); too strict a threshold misses real duplicates.</li>
<li><strong>Deduplication must be threaded consistently through the whole pipeline</strong> - if it's only applied to the training set and not consistently to how production data is validated, silently duplicated production inputs can still distort real-time predictions or downstream aggregates.</li>
</ul>`,
            codeExamples: [
                `# Choosing the right subset of columns matters: deduplicating on the wrong key deletes real data
import pandas as pd

df = pd.DataFrame({
    "customer_id": [1, 1, 2],
    "item": ["Coffee", "Coffee", "Tea"],
    "purchase_date": ["2024-05-01", "2024-05-01", "2024-05-01"],  # customer 1 bought coffee twice same day
})

# Wrong: dedupe only on customer_id + item, ignoring that they may be two REAL separate purchases
too_aggressive = df.drop_duplicates(subset=["customer_id", "item"])

# Better: only treat rows as duplicates if EVERY relevant column matches, including an order/transaction id
df["order_id"] = ["O1", "O2", "O3"]  # each purchase actually has a distinct order id
correct = df.drop_duplicates(subset=["customer_id", "item", "purchase_date", "order_id"])

print("Rows after aggressive dedup (loses a real repeat purchase):", len(too_aggressive))
print("Rows after correct dedup (keeps both real purchases):     ", len(correct))
# OUTPUT:
# Rows after aggressive dedup (loses a real repeat purchase): 2
# Rows after correct dedup (keeps both real purchases):      3`
            ],
            codeExplanations: [
                `Deduplicating only on <code>customer_id</code> and <code>item</code> incorrectly treats customer 1's two separate coffee purchases on the same day as one duplicate row, deleting a real transaction. Once the true unique identifier - <code>order_id</code>, which the original data actually has but the aggressive version ignored - is included in the dedup key, both real purchases are correctly kept, and only genuine byte-for-byte duplicates (identical across every column including order id) would be removed. This illustrates why choosing the right subset of columns to define "duplicate" requires understanding what a truly unique real-world event looks like in the specific dataset, not just picking a plausible-looking set of columns.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do exact duplicates and near-duplicates differ, and how would you detect each?</td><td>Exact duplicates are rows identical across all (or a defined key subset of) columns, detected reliably and efficiently with <code>duplicated()</code>/<code>drop_duplicates()</code>; near-duplicates represent the same real-world entity with slight formatting or typo differences (e.g. "Jon Smith" vs "Jiva Smith") and require fuzzy matching - comparing string similarity or matching on a normalized subset of strongly identifying fields - since exact equality checks would miss them entirely</td></tr>
<tr class='text-center'><td>Why can duplicate rows cause data leakage, and how do you prevent it?</td><td>If the same record (or its near-identical twin) is split so that one copy lands in the training set and the other in the test set, the model is effectively evaluated on data it already memorized during training, producing an artificially inflated accuracy that won't hold up on genuinely unseen data; the fix is to always deduplicate the full dataset BEFORE performing the train/test split, guaranteeing no record can appear on both sides</td></tr>
<tr class='text-center'><td>Why is it risky to deduplicate on the wrong subset of columns?</td><td>If the chosen key doesn't actually uniquely identify a real-world event, rows that are genuinely different (e.g. the same customer legitimately buying the same item twice on the same day) can get incorrectly collapsed into one, silently deleting real data; the dedup key must be chosen based on what truly makes two records the same event in that specific domain - ideally a genuine unique identifier like a transaction or order ID rather than just a plausible-looking combination of fields</td></tr>
</table>`
        }
    ]
};
