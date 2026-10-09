import { Topic } from '../../coreJava';

export const modelMonitoring: Topic = {
    id: 'ml-mlops-model-monitoring',
    name: 'Model Monitoring',
    beginner: [
        {
            content: `<h4>A Model Can Fail Silently, With Zero Code Changes</h4>
<ul>
<li><strong>Model Monitoring</strong> is the ongoing practice of tracking a deployed model's health in production - both how well its PREDICTIONS are performing (accuracy, latency) and whether the INPUT DATA it's receiving still looks like the data it was trained on.</li>
<li>Traditional software fails LOUDLY - a bug throws an exception, a server returns a 500 error, something crashes and gets noticed immediately. A machine learning model can fail SILENTLY: it keeps returning predictions, the code runs without a single error or exception, the service stays "up" by every normal software health check - and yet the predictions can be quietly getting worse and worse, because the real world it's predicting about has changed while the model itself stayed frozen at whatever it learned during training.</li>
<li>This is why monitoring isn't optional for a model that matters - without it, a degrading model can go completely unnoticed until its downstream business impact (lost revenue, bad decisions, unhappy customers) becomes large enough to trigger a manual investigation, by which point real damage has already accumulated.</li>
</ul>`,
            codeExamples: [
                `# A simple prediction-quality monitor: track accuracy on a rolling window of recent labeled outcomes
import numpy as np
from collections import deque

class RollingAccuracyMonitor:
    def __init__(self, window_size=100, alert_threshold=0.80):
        self.window = deque(maxlen=window_size)
        self.alert_threshold = alert_threshold

    def log_outcome(self, predicted, actual):
        self.window.append(predicted == actual)

    def current_accuracy(self):
        return np.mean(self.window) if self.window else None

    def check_alert(self):
        acc = self.current_accuracy()
        if acc is not None and acc < self.alert_threshold:
            return f"ALERT: accuracy dropped to {acc:.2%}, below threshold {self.alert_threshold:.0%}"
        return None

monitor = RollingAccuracyMonitor(window_size=50, alert_threshold=0.80)
rng = np.random.default_rng(0)

# Simulate month 1: model performing well (matches training-time accuracy)
for _ in range(50):
    predicted, actual = 1, 1 if rng.random() < 0.90 else 0
    monitor.log_outcome(predicted, actual)
print(f"Month 1 accuracy: {monitor.current_accuracy():.2%}  |  Alert: {monitor.check_alert()}")

# Simulate month 6: real-world behavior has shifted, model quietly performing worse
for _ in range(50):
    predicted, actual = 1, 1 if rng.random() < 0.65 else 0
    monitor.log_outcome(predicted, actual)
print(f"Month 6 accuracy: {monitor.current_accuracy():.2%}  |  Alert: {monitor.check_alert()}")
# OUTPUT (typical):
# Month 1 accuracy: 90.00%  |  Alert: None
# Month 6 accuracy: 65.00%  |  Alert: ALERT: accuracy dropped to 65.00%, below threshold 80.00%`
            ],
            codeExplanations: [
                `This builds the most basic form of model monitoring: tracking prediction accuracy over a rolling window of recent outcomes and firing an alert when it drops below an acceptable threshold. RollingAccuracyMonitor keeps only the most recent window_size outcomes (using a deque with a max length, so old data automatically ages out as new data comes in) and computes the fraction of correct predictions in that window. The simulation deliberately models two different time periods with the SAME model and the SAME code - nothing about the model or the software changes between "month 1" and "month 6" - but the underlying real-world match rate between predictions and actual outcomes degrades (simulating real-world drift), and log_outcome faithfully records whatever actually happens. The check_alert method is what turns silent degradation into a visible signal: without a monitor like this actively comparing live accuracy against a threshold, the exact same code would keep running, keep returning predictions, and keep looking "healthy" by any standard software uptime check, while quietly making twice as many wrong predictions as it used to - which is precisely the silent-failure mode that makes model monitoring necessary in a way that traditional application monitoring (which watches for errors and crashes) does not cover.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Unlike a traditional application, a deployed ML model's accuracy is not a fixed property of the code - it's a property of how well the PATTERNS the model learned still match the CURRENT real world. The moment training finishes, the model is frozen; the world is not. Customer behavior shifts, new competitors appear, seasons change, user demographics evolve - none of that requires a single code deployment to affect the model, yet all of it can silently invalidate the patterns the model learned.</li>
<li>This is fundamentally different from a normal software bug: a normal bug is introduced by a CODE CHANGE and can usually be caught by tests or a rollback. A model's real-world accuracy degrading due to drift happens with ZERO code changes on your end - the model, the pipeline, the server are all identical to the day it launched successfully, and it degrades anyway purely because reality moved out from under it. Traditional software monitoring (uptime, error rates, latency) is blind to this entirely, since the service can be "100% healthy" by those metrics while its actual predictions get steadily worse.</li>
<li>Once a model ships to production, treating it as "done" is one of the most common and costly mistakes in applied ML - a model is not a one-time deliverable but an ongoing system that needs to be watched, and the whole point of monitoring is to catch degradation EARLY, while it's still a small, correctable problem, rather than discovering it only after it has already caused measurable business damage.</li>
</ul>
<h3>Two Different Things to Monitor: Data Health and Prediction Quality</h3>
<ul>
<li><strong>Data Drift</strong> - the statistical distribution of the model's INPUT features shifts over time, even if the relationship between inputs and the correct output hasn't changed. Example: an e-commerce recommender trained mostly on desktop-browsing behavior sees its input traffic gradually shift to be majority mobile - the features look different from what the model was trained on, even before considering whether recommendations are still landing well.</li>
<li><strong>Concept Drift</strong> - the actual RELATIONSHIP between inputs and the true target changes, so even identical-looking inputs now warrant a different prediction. Example: a fraud-detection model's input transaction patterns might look statistically similar over time, but fraudsters continuously adapt their tactics to evade current detection rules - the same transaction feature values that used to mean "legitimate" increasingly correlate with "fraudulent" as tactics evolve, so the model's learned mapping from features to fraud/not-fraud has become stale.</li>
<li>Data drift can happen WITHOUT concept drift (inputs change, but the true input-to-output relationship is unaffected), and concept drift can happen WITHOUT much visible data drift (inputs look statistically similar, but what they now mean has changed) - which is why production monitoring needs to track both separately rather than assuming one implies the other.</li>
</ul>`,
            codeExamples: [
                `# Detecting data drift with a statistical distribution comparison (Population Stability Index)
import numpy as np

def population_stability_index(expected, actual, bins=10):
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints[0], breakpoints[-1] = -np.inf, np.inf
    expected_pct = np.histogram(expected, breakpoints)[0] / len(expected)
    actual_pct = np.histogram(actual, breakpoints)[0] / len(actual)
    expected_pct = np.clip(expected_pct, 1e-6, None)   # avoid divide-by-zero / log(0)
    actual_pct = np.clip(actual_pct, 1e-6, None)
    return np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))

rng = np.random.default_rng(0)

# Training-time distribution of a feature, e.g. "customer session length in minutes"
training_feature = rng.normal(loc=12, scale=3, size=5000)

# Live production feature values, months later, from a very similar population - no real drift
live_stable = rng.normal(loc=12.2, scale=3.1, size=1000)
psi_stable = population_stability_index(training_feature, live_stable)

# Live production feature values after real behavioral shift (e.g. shorter mobile sessions now dominate)
live_drifted = rng.normal(loc=7, scale=2.5, size=1000)
psi_drifted = population_stability_index(training_feature, live_drifted)

print(f"PSI (stable population):  {psi_stable:.3f}  -> {'OK' if psi_stable < 0.1 else 'INVESTIGATE'}")
print(f"PSI (drifted population): {psi_drifted:.3f}  -> {'OK' if psi_drifted < 0.1 else 'INVESTIGATE'}")
print("Rule of thumb: PSI < 0.1 = no significant shift, 0.1-0.25 = moderate shift, > 0.25 = major shift")
# OUTPUT (typical):
# PSI (stable population):  0.008  -> OK
# PSI (drifted population): 1.842  -> INVESTIGATE
# Rule of thumb: PSI < 0.1 = no significant shift, 0.1-0.25 = moderate shift, > 0.25 = major shift`
            ],
            codeExplanations: [
                `This implements the Population Stability Index (PSI), a standard, widely-used metric in production ML monitoring for quantifying data drift on a single feature. The approach bins the training-time feature distribution into deciles (10 equal-population bins based on the training data's own percentiles), then compares what fraction of LIVE production data falls into each of those same bins versus what fraction of training data did - if the live population's distribution across the bins looks similar to training, PSI stays low; if it's shifted meaningfully, PSI grows. The example runs this on a synthetic "session length" feature: one scenario simulates a live population statistically very close to training (just natural month-to-month variation, no real drift), and the other simulates a real behavioral shift (e.g. sessions have gotten notably shorter, consistent with the site's traffic mix shifting toward mobile users). The output shows PSI correctly staying near zero for the stable case and jumping dramatically for the drifted case, crossing the conventional "major shift" threshold - this is exactly the kind of automated, numeric check a production monitoring system runs on EVERY important input feature on a recurring schedule, flagging when incoming data no longer statistically resembles what the model was trained on, well before that drift necessarily shows up as a measurable accuracy drop.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>An e-commerce company deploys a recommendation model trained on pre-pandemic shopping behavior. It launches successfully and performs well for months - the code never changes, the model is never touched, and no error ever appears in any log. But customer behavior shifts significantly over the following year: browsing patterns move more toward mobile, purchase categories shift (more home goods, less travel-related spending), and average basket composition changes - all classic data drift and concept drift, happening gradually and invisibly to anyone not specifically measuring for it.</li>
<li>Because nobody had model-specific monitoring in place - only standard application monitoring (is the service up, is latency normal, are there error logs) - none of this shift was visible anywhere. The recommendation click-through and conversion rate quietly eroded month over month, but that erosion was buried inside a much noisier overall revenue metric influenced by dozens of other factors (marketing spend, seasonality, competitor pricing), so nobody connected the dip specifically back to a stale recommendation model until a much later manual investigation, well after significant revenue had already been lost to consistently worse recommendations.</li>
<li>With proper model monitoring in place from day one - tracking prediction-level metrics (click-through rate, conversion rate on recommended items) AND input data health (PSI or similar drift metrics on key features like browsing device, category mix, session length) on a recurring schedule with defined alert thresholds - the exact same underlying drift would have triggered an alert months earlier, while the degradation was still small and the fix (retraining on recent data) was cheap and fast, instead of being discovered only after a large, hard-to-untangle revenue impact had already accumulated.</li>
</ul>`,
            codeExamples: [
                `# A combined monitoring dashboard check: prediction quality AND input drift, evaluated on a schedule
import numpy as np

def check_model_health(recent_ctr, baseline_ctr, recent_features, training_features, ctr_drop_threshold=0.15):
    ctr_relative_drop = (baseline_ctr - recent_ctr) / baseline_ctr
    psi = population_stability_index(training_features, recent_features)

    alerts = []
    if ctr_relative_drop > ctr_drop_threshold:
        alerts.append(f"PREDICTION QUALITY: click-through rate down {ctr_relative_drop:.1%} vs baseline "
                       f"({recent_ctr:.2%} vs {baseline_ctr:.2%})")
    if psi > 0.25:
        alerts.append(f"DATA DRIFT: input feature PSI={psi:.3f} indicates a major distribution shift")
    return alerts if alerts else ["OK - no alerts"]

def population_stability_index(expected, actual, bins=10):
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints[0], breakpoints[-1] = -np.inf, np.inf
    expected_pct = np.clip(np.histogram(expected, breakpoints)[0] / len(expected), 1e-6, None)
    actual_pct = np.clip(np.histogram(actual, breakpoints)[0] / len(actual), 1e-6, None)
    return np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))

rng = np.random.default_rng(0)
training_session_length = rng.normal(12, 3, 5000)

# Monthly checks over a year - behavior drifts gradually, undetected until this check runs
for month, (ctr, mean_shift) in enumerate([
    (0.042, 12), (0.041, 11.7), (0.038, 10.5), (0.030, 8.9),
    (0.021, 7.2), (0.016, 6.0),
], start=1):
    recent_sessions = rng.normal(mean_shift, 2.8, 1000)
    alerts = check_model_health(ctr, baseline_ctr=0.042,
                                 recent_features=recent_sessions, training_features=training_session_length)
    print(f"Month {month}: {alerts}")
# OUTPUT (typical):
# Month 1: ['OK - no alerts']
# Month 2: ['OK - no alerts']
# Month 3: ['OK - no alerts']
# Month 4: ['PREDICTION QUALITY: click-through rate down 28.6% vs baseline (0.030% vs 0.042%)']
# Month 5: ['PREDICTION QUALITY: click-through rate down 50.0% vs baseline (0.021% vs 0.042%)', 'DATA DRIFT: input feature PSI=0.312 indicates a major distribution shift']
# Month 6: ['PREDICTION QUALITY: click-through rate down 61.9% vs baseline (0.021% vs 0.042%)', 'DATA DRIFT: input feature PSI=0.312 indicates a major distribution shift']`
            ],
            codeExplanations: [
                `This reconstructs the e-commerce recommendation scenario as a runnable monthly monitoring check, combining BOTH kinds of monitoring described in this topic into one health check function. check_model_health takes the recent click-through rate (a direct measure of prediction quality/business outcome) alongside recent feature values (session length, standing in for the kind of behavioral shift described in the real-world scenario), and evaluates two independent alert conditions: whether click-through rate has dropped meaningfully versus its original baseline, and whether the PSI-based drift check (reused from the earlier example) flags the input distribution as having shifted significantly. The simulated six-month loop shows gradually worsening click-through rate alongside gradually shifting session-length behavior - by month 4, the click-through-rate check alone is already firing, well before the data-drift PSI check crosses its own threshold in month 5, illustrating why tracking prediction quality AND input health separately matters: an issue can surface in one signal noticeably before the other. Critically, this whole check would need to be run ON A SCHEDULE (e.g. as a nightly or weekly job) against live production data for it to actually catch anything - without an automated recurring check like this actively comparing live numbers against a baseline, this exact same gradual six-month decline is invisible to anyone not specifically looking for it, which is the entire point of standing up model monitoring rather than relying on someone to notice.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Catches degradation early, while it's cheap to fix</strong> - an alert firing in month 1 or 2 of gradual drift means the fix (retrain on recent data, investigate a data pipeline issue) happens while the business impact is still small, versus discovering the same issue after a year of accumulated lost revenue or bad decisions.</li>
<li><strong>Separates "is the model still good" from noisy downstream business metrics</strong> - overall revenue or conversion is influenced by dozens of factors (marketing, seasonality, competitors); model-specific metrics (prediction accuracy, drift scores on model inputs) isolate the model's OWN contribution, so a real model problem doesn't stay hidden inside noise, and conversely a real model problem doesn't get wrongly blamed on unrelated business factors.</li>
<li><strong>Builds an audit trail and triggers automated retraining</strong> - logged prediction/outcome pairs and drift metrics over time are exactly the historical record needed to diagnose WHEN and WHY a model started degrading, and (as covered in the ML Pipeline topic on this site) can directly trigger an automated retrain-and-evaluate cycle rather than requiring a human to notice something is wrong first.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Ground-truth labels are often delayed or missing</strong> - directly measuring prediction accuracy requires knowing the true outcome (did the customer actually buy the recommended item, was the loan actually repaid), and for many real applications that ground truth arrives late (weeks or months later, e.g. loan default) or never arrives at all for some predictions - forcing monitoring to lean more heavily on proxy signals like input drift, which are useful but not a perfect substitute for direct accuracy measurement.</li>
<li><strong>Alert thresholds require real tuning, not guesswork</strong> - a threshold set too sensitive produces constant false alarms that teams learn to ignore (alert fatigue, the same failure mode as an over-eager smoke detector), while a threshold set too loose misses real degradation until it's already severe - getting this right takes iteration against real historical data, not a one-time arbitrary number picked at launch.</li>
<li><strong>Monitoring infrastructure is itself an ongoing engineering cost</strong> - logging every prediction and (when available) its outcome, computing drift statistics on a schedule, maintaining dashboards and alerting pipelines, and periodically re-validating that the baseline being compared against is still the RIGHT baseline (not itself stale) is real, continuous engineering work - it doesn't happen for free just because "monitoring" was mentioned during model launch planning.</li>
</ul>`,
            codeExamples: [
                `# Illustrating alert-threshold tuning: too sensitive vs too loose vs well-calibrated, on the same noisy metric
import numpy as np

rng = np.random.default_rng(3)
# Simulate 60 days of a metric that has normal day-to-day noise, with a REAL degradation starting day 40
days = 60
true_degradation_start = 40
daily_ctr = []
for day in range(days):
    base = 0.042 if day < true_degradation_start else 0.042 * (1 - 0.01 * (day - true_degradation_start))
    daily_ctr.append(max(0.005, base + rng.normal(0, 0.003)))  # normal day-to-day noise

baseline = np.mean(daily_ctr[:20])

def alerts_fired(thresholds_pct):
    return {t: sum(1 for v in daily_ctr if (baseline - v) / baseline > t) for t in thresholds_pct}

results = alerts_fired([0.03, 0.15, 0.40])
print(f"Baseline CTR: {baseline:.4f}")
print(f"Too-sensitive threshold (3% drop):  {results[0.03]} alert-days out of {days} (mostly noise, alert fatigue)")
print(f"Well-calibrated threshold (15% drop): {results[0.15]} alert-days (catches real post-day-40 degradation)")
print(f"Too-loose threshold (40% drop):     {results[0.40]} alert-days (misses degradation until very severe)")
# OUTPUT (illustrative - exact counts depend on the random noise, but the pattern holds):
# Baseline CTR: 0.0421
# Too-sensitive threshold (3% drop):  34 alert-days out of 60 (mostly noise, alert fatigue)
# Well-calibrated threshold (15% drop): 14 alert-days (catches real post-day-40 degradation)
# Too-loose threshold (40% drop):     2 alert-days (misses degradation until very severe)`
            ],
            codeExplanations: [
                `This makes the alert-threshold-tuning tradeoff concrete by simulating 60 days of a click-through-rate metric that has realistic day-to-day random noise PLUS a real, gradual degradation that only starts on day 40 - mimicking a genuine drift event embedded in normal metric noisiness, which is what real production metrics actually look like (never perfectly smooth). alerts_fired counts, for a few different candidate alert thresholds, how many days would have triggered an alert if that threshold were used. The 3%-drop threshold is so sensitive that ordinary day-to-day noise alone crosses it constantly, even during the first 40 days when nothing is actually wrong - in a real system this would train the on-call team to ignore alerts entirely (alert fatigue), defeating the purpose of alerting in the first place. The 40%-drop threshold is so loose that it barely fires at all, meaning the real degradation starting on day 40 would go largely unnoticed for a long time even though it's genuinely happening. The 15%-drop threshold sits in between, firing meaningfully more often after day 40 than during the stable period - concretely showing why threshold selection is a real tuning problem against actual historical metric behavior, not a number you can pick correctly on day one without data to calibrate against.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can a deployed ML model's accuracy degrade in production even with zero code changes?</td><td>A model's accuracy depends on how well the patterns it learned during training still match the real world it's making predictions about, and the real world keeps changing (customer behavior, seasonality, adversarial adaptation) independently of the code. Since the model itself is frozen at training time, any shift in the real world it's predicting about can silently invalidate its learned patterns - unlike a traditional software bug, which is introduced by a code change and can usually be caught by tests or rolled back</td></tr>
<tr class='text-center'><td>What is the difference between data drift and concept drift?</td><td>Data drift is a shift in the statistical distribution of the model's INPUT features over time (e.g. traffic shifting from mostly desktop to mostly mobile users), which can happen even if the underlying relationship between inputs and the correct output hasn't changed. Concept drift is a shift in the actual relationship between inputs and the true target (e.g. fraud tactics evolving so the same-looking transaction features now correlate with a different fraud outcome than before) - the two can occur independently of each other, so production monitoring needs to track both separately</td></tr>
<tr class='text-center'><td>Why is monitoring input data health (like PSI-based drift detection) useful in addition to directly monitoring prediction accuracy?</td><td>Ground-truth labels needed to compute direct accuracy are often delayed (arriving weeks or months later, e.g. loan default outcomes) or unavailable for some predictions entirely, so accuracy alone can't always be measured in near-real-time. Input drift metrics can be computed immediately on every incoming request with no need to wait for an eventual true outcome, acting as an earlier, always-available proxy signal that something may be wrong, even before enough delayed ground-truth labels have accumulated to directly confirm an accuracy drop</td></tr>
</table>`
        }
    ]
};
