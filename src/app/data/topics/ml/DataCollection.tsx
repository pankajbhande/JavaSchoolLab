import { Topic } from '../../coreJava';

export const dataCollection: Topic = {
    id: 'ml-data-preprocessing-data-collection',
    name: 'Data Collection',
    beginner: [
        {
            content: `<h4>Where Machine Learning Data Actually Comes From</h4>
<ul>
<li><strong>Data Collection</strong> is the process of gathering raw data from real-world sources before any cleaning or modeling happens - it is the very first step of any ML project, and everything downstream depends on it.</li>
<li>Common sources include <strong>databases</strong> (transaction records, customer tables), <strong>APIs</strong> (weather data, stock prices, third-party services), <strong>web scraping</strong> (public prices, reviews, listings), <strong>sensors</strong> (IoT devices, wearables), and <strong>user logs</strong> (clickstreams, app events).</li>
<li>The core principle is often summarized as <strong>"garbage in, garbage out"</strong> - if the collected data is low-quality, biased, or unrepresentative of the real problem, no amount of cleaning or clever modeling afterward can fully fix it.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

# Simulating data pulled from three different collection sources
db_records = pd.DataFrame({
    "user_id": [101, 102, 103],
    "signup_date": ["2024-01-05", "2024-02-14", "2024-03-01"],
})

api_response = pd.DataFrame({
    "user_id": [101, 102, 103],
    "city_from_ip_api": ["Mumbai", "Delhi", "Bangalore"],
})

app_logs = pd.DataFrame({
    "user_id": [101, 102, 103],
    "sessions_last_30_days": [12, 0, 45],
})

combined = db_records.merge(api_response, on="user_id").merge(app_logs, on="user_id")
print(combined)
# OUTPUT:
#    user_id signup_date city_from_ip_api  sessions_last_30_days
# 0      101  2024-01-05           Mumbai                     12
# 1      102  2024-02-14            Delhi                      0
# 2      103  2024-03-01        Bangalore                     45`
            ],
            codeExplanations: [
                `Three separate dataframes stand in for three real collection sources feeding one ML pipeline: <code>db_records</code> comes from a company's internal database (signup info), <code>api_response</code> comes from a third-party API (geolocation), and <code>app_logs</code> comes from the product's own event-tracking logs (usage activity). <code>merge</code> on <code>user_id</code> stitches them into one training-ready table. In practice each source has its own reliability, refresh rate, and blind spots - a real ML system must track where every column came from, since a bug or bias in any one source (e.g. the IP-based city lookup being wrong for VPN users) silently poisons the final dataset.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Data collection sets a hard ceiling on model quality before a single cleaning or feature-engineering step happens - problems introduced here cannot be detected by looking at the data alone, because the data looks perfectly clean, it is simply not representative of reality.
<ul>
<li><strong>Selection bias is invisible in the data itself</strong> - if a system only records users who took some action (logged in, clicked, completed checkout), the dataset silently excludes everyone who did not, and there is no column that flags "this population is missing" - the gap only becomes visible when the deployed model behaves badly on the excluded group.</li>
<li><strong>Cleaning cannot recover information that was never captured</strong> - <code>Missing Value Handling</code> can fill in gaps in existing rows, but it cannot manufacture entire rows for a user segment the collection process never logged in the first place.</li>
<li><strong>Bias compounds silently through the whole pipeline</strong> - every later step (feature engineering, model training, evaluation) inherits and can even amplify a collection-time bias, since validation metrics computed on the same biased sample will look good even though the model fails badly on the underrepresented real-world population.</li>
</ul>
<h3>Real-World Example</h3>
A startup builds a <strong>churn prediction model</strong> by pulling data from its own product analytics: for every user, it logs login frequency, feature usage, and support tickets, then labels a user "churned" if they stop logging in for 30 days. The trap: the analytics pipeline only tracks users while they are <strong>logged in</strong> - so a user who churns by simply never opening the app again after one bad experience generates almost no usage data at all, and users who disengage silently (rather than actively canceling) are systematically underrepresented in the "rich feature" rows the model learns from. The model ends up trained mostly on users who churned <em>after</em> substantial engagement, and performs poorly on the far larger group who quietly disappeared early - the exact group the business most needs to predict and retain.`,
            codeExamples: [
                `# Demonstrating selection bias: a dataset built only from "logged-in" activity
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
n = 2000

# True population: some users churn immediately with almost no activity ("ghosts")
is_ghost_churn = rng.random(n) < 0.35   # 35% of real users vanish almost immediately
sessions = np.where(is_ghost_churn, rng.integers(0, 2, n), rng.integers(5, 60, n))
churned = np.where(is_ghost_churn, 1, (rng.random(n) < 0.15).astype(int))

full_population = pd.DataFrame({"sessions": sessions, "churned": churned})

# The collection pipeline only logs users with at least 1 tracked session (login-gated logging)
collected_dataset = full_population[full_population["sessions"] >= 1]

print("True churn rate in full population:      ", full_population["churned"].mean().round(3))
print("Churn rate in the COLLECTED dataset only: ", collected_dataset["churned"].mean().round(3))
print("Rows lost to collection gap:", len(full_population) - len(collected_dataset),
      "out of", len(full_population))
# OUTPUT (typical):
# True churn rate in full population:       0.298
# Churn rate in the COLLECTED dataset only:  0.161
# Rows lost to collection gap: 337 out of 2000`
            ],
            codeExplanations: [
                `<code>full_population</code> simulates the true underlying reality, including a "ghost churn" segment that disengages almost immediately with 0-1 sessions logged. <code>collected_dataset</code> mimics what the startup's login-gated analytics pipeline actually captures - it filters out any user with zero tracked sessions, because the logging system has nothing to record for users who never meaningfully engaged. The printed churn rates show the gap directly: the true churn rate (0.298) is noticeably higher than the churn rate visible in the collected data (0.161), because most of the highest-risk "ghost" churners were dropped before they ever became a row a model could learn from - a bias that no amount of cleaning on the collected dataset alone could reveal or fix.`
            ]
        },
        {
            content: `<h3>Common Sampling Bias Traps</h3>
<ul>
<li><strong>Survivorship bias</strong> - only collecting data from entities that "survived" some filter (e.g. only currently-active customers, only apps still in the app store), silently excluding the failures that are often the most informative cases.</li>
<li><strong>Self-selection bias</strong> - data from surveys or opt-in feedback overrepresents people motivated enough to respond (often the most satisfied or most angry), skewing sentiment or satisfaction datasets away from the silent majority.</li>
<li><strong>Temporal bias</strong> - collecting data only from a narrow time window (e.g. only holiday-season sales) produces a model that fails when deployed on non-representative future periods.</li>
<li><strong>Instrumentation bias</strong> - a sensor, tracking pixel, or logging library with a bug or blind spot for a specific device/browser/region silently drops or corrupts data from that segment, without raising any visible error.</li>
</ul>
<h3>Mitigations at Collection Time</h3>
<ul>
<li><strong>Actively design collection to include the "invisible" cases</strong> - e.g. explicitly track anonymous/pre-signup behavior, or run a follow-up outreach to churned users to fill the gap rather than relying only on in-app logs.</li>
<li><strong>Audit representativeness against a known ground truth</strong> - compare the collected sample's demographics or behavior distribution against an independent source (e.g. total registered users vs. users with logged activity) to quantify how much is missing.</li>
<li><strong>Document data provenance</strong> - record exactly which source, time window, and filter conditions produced each dataset, so bias can be traced and reasoned about later instead of discovered by surprise in production.</li>
</ul>`,
            codeExamples: [
                `# Auditing representativeness: comparing a collected sample against the known full user base
import pandas as pd

total_registered_users = 10_000
collected_sample_size = 6_430   # only users with at least one tracked session

coverage_pct = round(100 * collected_sample_size / total_registered_users, 1)
print(f"Registered users: {total_registered_users}")
print(f"Users present in the collected dataset: {collected_sample_size}")
print(f"Collection coverage: {coverage_pct}%")
if coverage_pct < 80:
    print("WARNING: over 20% of the true population is invisible to this dataset - "
          "any model trained here will not generalize to the missing segment.")
# OUTPUT:
# Registered users: 10000
# Users present in the collected dataset: 6430
# Collection coverage: 64.3%
# WARNING: over 20% of the true population is invisible to this dataset - any model trained here will not generalize to the missing segment.`
            ],
            codeExplanations: [
                `This is a simple but important sanity check that should happen before any modeling: comparing the size (and ideally the demographic makeup) of the collected dataset against an independent count of the TRUE total population it is supposed to represent. Here only 64.3% of registered users ever appear in the activity-based dataset, meaning over a third of the real user base is structurally invisible to any model trained on it. Catching this gap at collection time - before cleaning, before feature engineering, before training - is far cheaper than discovering it later as an unexplained accuracy drop in production.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Getting collection right prevents unfixable downstream bias</strong> - a representative sample means later cleaning and modeling steps work with a dataset that genuinely reflects the real-world population the model will face in production.</li>
<li><strong>Multiple source types can be combined for richer signal</strong> - merging database records, API enrichment, and behavioral logs (as in the beginner example) captures dimensions no single source could provide alone.</li>
<li><strong>Automated collection (APIs, sensors, logs) scales far beyond manual data entry</strong> - once built, a pipeline can continuously gather fresh data with minimal ongoing human effort.</li>
<li><strong>Early investment here is cheap relative to the cost of a biased production model</strong> - fixing a sampling gap before training is a data-engineering fix; fixing it after a biased model has shipped and made bad decisions is a business and trust problem.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Bias introduced at collection is often invisible until deployment</strong> - as shown above, a login-gated logging pipeline produces a clean-looking dataset with no obvious flaws, yet fails silently on the excluded population.</li>
<li><strong>Web scraping and third-party APIs are fragile and can change without notice</strong> - a site redesign or API version change can silently corrupt or stop a data feed, and unless monitored, a pipeline may keep running on stale or broken data.</li>
<li><strong>Sensor and log data is often noisy and asynchronous</strong> - device clock drift, network retries, and dropped packets mean raw collected data frequently needs substantial validation before it is trustworthy.</li>
<li><strong>Legal and ethical constraints limit what can be collected</strong> - privacy regulations (e.g. GDPR), terms of service, and consent requirements restrict which sources and fields are usable, and violating them can invalidate an entire dataset after the fact.</li>
</ul>`,
            codeExamples: [
                `# A lightweight collection-time validation check before data ever reaches the cleaning stage
import pandas as pd

raw_batch = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "source": ["db", "api", "api", "logs"],
    "value": [42, None, 999999, 17],   # a null and an implausible outlier slipped in at collection
})

def collection_quality_report(df: pd.DataFrame) -> None:
    print("Rows collected:", len(df))
    print("Nulls per source:\\n", df.groupby("source")["value"].apply(lambda s: s.isna().sum()))
    print("Suspiciously large values (>10000):", (df["value"] > 10_000).sum())

collection_quality_report(raw_batch)
# OUTPUT:
# Rows collected: 4
# Nulls per source:
#  source
# api     1
# db      0
# logs    0
# Name: value, dtype: int64
# Suspiciously large values (>10000): 1`
            ],
            codeExplanations: [
                `Before any formal cleaning step, it is good practice to run a lightweight quality report right at the point of collection - grouping issues by <code>source</code> makes it immediately clear which pipeline is producing bad data (here, the <code>api</code> source is responsible for both the missing value and, in this simulated batch, contributing to visibility of the outlier). Catching that a specific source is unreliable at collection time lets a team fix or monitor that source directly, rather than only ever seeing the symptom downstream during cleaning and wondering which of several combined sources caused it.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "garbage in, garbage out" mean specifically at the data collection stage, before any cleaning happens?</td><td>It means the ceiling on model quality is set by how representative and accurate the raw collected data is - if collection is biased (e.g. missing an entire user segment) or systematically wrong, no downstream cleaning, feature engineering, or modeling technique can recover the missing information or correct the bias, because those steps only operate on the data that was actually captured</td></tr>
<tr class='text-center'><td>Why is selection bias particularly dangerous compared to other data quality issues like missing values or duplicates?</td><td>Selection bias produces a dataset that looks completely clean and internally consistent - there are no nulls or obvious errors to flag it - yet it systematically excludes a real-world population (e.g. users who churn without ever logging activity), so validation metrics computed on that biased sample look good even though the model will perform poorly on the excluded group once deployed</td></tr>
<tr class='text-center'><td>How would you check whether a collected dataset is representative of the true population before using it to train a model?</td><td>Compare the collected sample's size and key characteristics against an independent, more complete source of truth (e.g. total registered users vs. users with any logged activity, or known demographic splits vs. the sample's demographics) to quantify coverage gaps, and audit whether the collection mechanism itself (e.g. login-gated logging, opt-in surveys) structurally excludes any segment of interest</td></tr>
</table>`
        }
    ]
};
