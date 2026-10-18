// Module 37 (Data Science Ecosystem), part B: Plotly and machine-learning basics.
import { dd, r, type DeepDive } from './deepDive';

export const m37b: Record<string, DeepDive> = {
    'Plotly': dd(
        [`<b>Plotly</b> builds interactive charts (hover, zoom, pan, legend toggle) that render in the browser via plotly.js. <code>plotly.express</code> creates a full figure from a DataFrame in one call.`,
            r`import pandas as pd
import plotly.express as px

df = pd.DataFrame({"day": [1, 2, 3, 4], "visits": [120, 150, 90, 200]})
fig = px.line(df, x="day", y="visits", title="Daily visits", markers=True)
print(type(fig).__name__, fig.data[0].type, fig.layout.title.text)

# OUTPUT:
# Figure scatter Daily visits`],
        [`Stakeholders explore data themselves: they hover for exact values, zoom into a spike and filter series. Static PNGs cannot do that, and web dashboards need a browser-native format.`,
            r`import plotly.express as px

fig = px.bar(x=["A", "B", "C"], y=[3, 7, 5])
fig.update_traces(hovertemplate="%{x}: %{y} units")   # custom tooltip text
print(fig.data[0].type, list(fig.data[0].y))

# OUTPUT:
# bar [3, 7, 5]`],
        [`Business dashboards (with Dash or Streamlit), notebook exploration, geographic maps, financial candlestick charts, and shareable single-file HTML reports.`,
            r`import plotly.express as px, pandas as pd

df = pd.DataFrame({"x": [1, 2, 3, 4], "y": [2, 3, 5, 9], "kind": ["a", "a", "b", "b"]})
fig = px.scatter(df, x="x", y="y", color="kind", size="y")   # color/size mapping
fig.write_html("report.html", include_plotlyjs="cdn")        # one shareable file
print(len(fig.data), "traces")                               # one trace per color

# OUTPUT:
# 2 traces`],
        [`<b>Advantages:</b> interactivity out of the box, concise express API, 40+ chart types including 3-D and maps, exports to HTML/JSON, and integrates with Dash.`,
            r`import plotly.graph_objects as go

fig = go.Figure()
fig.add_trace(go.Bar(x=["Q1", "Q2"], y=[10, 14], name="Sales"))
fig.add_trace(go.Scatter(x=["Q1", "Q2"], y=[8, 12], name="Target"))   # combine types
fig.update_layout(template="plotly_white")
print([t.name for t in fig.data])

# OUTPUT:
# ['Sales', 'Target']`],
        [`<b>Disadvantages:</b> large HTML files (the plotly.js bundle is several MB unless loaded from a CDN), slower than Matplotlib for static batch figures, and fine-grained styling needs graph_objects knowledge.`,
            r`import plotly.express as px

fig = px.scatter(x=[1, 2], y=[3, 4])
html = fig.to_html(include_plotlyjs=True)         # embeds the whole JS library
print(len(html) > 1_000_000)                      # over 1 MB for 2 points

# OUTPUT:
# True`],
        [`<b>Limitations:</b> browsers choke on hundreds of thousands of SVG points (use scattergl or aggregate), and exporting static images needs the extra kaleido package.`,
            r`import plotly.express as px

# 'render_mode="webgl"' uses the GPU for big scatter plots instead of SVG
fig = px.scatter(x=range(5), y=range(5), render_mode="webgl")
print(fig.data[0].type)
# fig.write_image("p.png") needs:  pip install kaleido

# OUTPUT:
# scattergl`],
        `
   DataFrame --> plotly.express / graph_objects --> Figure (JSON spec)
                                                       |
                         +-----------------------------+----------------+
                         v                             v                v
                  Notebook / Dash app           write_html()      write_image()
                  (plotly.js in browser)        (shareable file)  (needs kaleido)
                  hover - zoom - filter
`,
        `Use Plotly where users must explore data in a browser; keep Matplotlib for static, print-ready figures. Aggregate server-side before plotting, cap point counts, load plotly.js from a CDN or a shared bundle, and treat the figure as JSON so the same spec can be cached and served by an API.`
    ),

    'scikit-learn Basics': dd(
        [`<b>scikit-learn</b> offers a uniform estimator API: <code>fit(X, y)</code> to learn, <code>predict(X)</code> to infer, <code>transform</code> for preprocessing. X is a 2-D array (samples x features); y is the target.`,
            r`from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4]]          # 4 samples, 1 feature
y = [2, 4, 6, 8]                  # target: y = 2x
model = LinearRegression().fit(X, y)
print(round(model.coef_[0], 3), round(model.intercept_, 3))
print(model.predict([[10]]).round(2))

# OUTPUT:
# 2.0 0.0
# [20.]`],
        [`Writing learning algorithms from scratch is slow and error-prone. A consistent interface lets you swap models (linear, trees, KNN) by changing one line and reuse tools for evaluation.`,
            r`from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

X = [[0], [1], [10], [11]]
y = [0, 0, 1, 1]
for model in (KNeighborsClassifier(n_neighbors=1), DecisionTreeClassifier(random_state=0)):
    print(type(model).__name__, model.fit(X, y).predict([[2], [9]]))   # same API

# OUTPUT:
# KNeighborsClassifier [0 1]
# DecisionTreeClassifier [0 1]`],
        [`Spam filters, churn and fraud prediction, demand forecasting, recommendation baselines, medical risk scoring - classic tabular ML.`,
            r`from sklearn.linear_model import LogisticRegression

# hours studied -> pass (1) / fail (0)
X = [[1], [2], [3], [8], [9], [10]]
y = [0, 0, 0, 1, 1, 1]
clf = LogisticRegression().fit(X, y)
print(clf.predict([[2], [9]]))
print(clf.predict_proba([[5.5]]).round(2))     # probabilities near the boundary

# OUTPUT:
# [0 1]
# [[0.5 0.5]]`],
        [`<b>Advantages:</b> consistent API, excellent docs, robust defaults, many algorithms, and Pipelines that chain preprocessing and models safely.`,
            r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())     # scaler + model as ONE estimator
pipe.fit([[0, 100], [1, 200], [10, 100], [11, 200]], [0, 0, 1, 1])
print(pipe.predict([[0.5, 150]]))
print(list(pipe.named_steps))

# OUTPUT:
# [0]
# ['standardscaler', 'svc']`],
        [`<b>Disadvantages:</b> no deep learning and no GPU, models are mostly batch (not streaming), and it expects clean numeric arrays, so preprocessing is on you.`,
            r`from sklearn.linear_model import LinearRegression

try:
    LinearRegression().fit([["red"], ["blue"]], [1, 2])   # strings are not accepted
except ValueError as e:
    print("ValueError:", str(e)[:28])

# OUTPUT:
# ValueError: could not convert string to `],
        [`<b>Limitations:</b> data must fit in memory (some estimators offer partial_fit), and scaling beyond one machine needs other tools (Dask-ML, Spark MLlib). Input must be 2-D.`,
            r`from sklearn.linear_model import LinearRegression

try:
    LinearRegression().fit([1, 2, 3], [1, 2, 3])   # 1-D X is rejected
except ValueError as e:
    print("ValueError:", str(e).splitlines()[0][:40])

# OUTPUT:
# ValueError: Expected 2D array, got 1D array instead:`],
        `
   raw data --> Pipeline
                +--------------------+     +--------------------+
   X, y  ------>| transformer        |---->| estimator          |--> predictions
                | fit/transform      |     | fit / predict      |
                | (scale, encode)    |     | (model)            |
                +--------------------+     +--------------------+
   learned state lives in attributes ending with an underscore (coef_, ...)
`,
        `scikit-learn is the right default for tabular data: strong baselines with little code, and gradient boosting (HistGradientBoosting, XGBoost, LightGBM) often wins. Always wrap preprocessing and model into a Pipeline and persist that single object (joblib) so training and serving cannot diverge. Move to PyTorch for unstructured data (images, text, audio) or custom losses.`
    ),

    'Feature Engineering': dd(
        [`<b>Feature engineering</b> turns raw columns into numeric inputs a model can learn from: scaling, encoding categories, creating ratios, dates and interactions.`,
            r`import pandas as pd

df = pd.DataFrame({"signup": pd.to_datetime(["2024-01-05", "2024-03-20"]),
                   "spend": [100, 300], "visits": [4, 10]})
df["month"] = df["signup"].dt.month              # date part
df["spend_per_visit"] = df["spend"] / df["visits"]   # derived ratio
print(df[["month", "spend_per_visit"]])

# OUTPUT:
#    month  spend_per_visit
# 0      1             25.0
# 1      3             30.0`],
        [`Models only understand numbers on comparable scales. Good features often improve accuracy more than switching algorithms.`,
            r`from sklearn.preprocessing import StandardScaler

# age (tens) vs income (tens of thousands): distance-based models are dominated by income
X = [[1], [2], [3]]
print(StandardScaler().fit_transform(X).ravel().round(2))   # mean 0, std 1

# OUTPUT:
# [-1.22  0.    1.22]`],
        [`Text to counts, categories to one-hot, timestamps to hour/weekday, geo coordinates to distances, rolling averages for time series.`,
            r`from sklearn.preprocessing import OneHotEncoder
import pandas as pd

df = pd.DataFrame({"color": ["red", "blue", "red"]})
enc = OneHotEncoder(sparse_output=False)          # sklearn >= 1.2 name
out = enc.fit_transform(df[["color"]])
print(enc.get_feature_names_out())
print(out)

# OUTPUT:
# ['color_blue' 'color_red']
# [[0. 1.]
#  [1. 0.]
#  [0. 1.]]`],
        [`<b>Advantages:</b> injects domain knowledge, lets simple models perform well, improves interpretability, and ColumnTransformer applies the right step to the right column.`,
            r`from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import pandas as pd

df = pd.DataFrame({"age": [20, 30, 40], "city": ["A", "B", "A"]})
ct = ColumnTransformer([("num", StandardScaler(), ["age"]),
                        ("cat", OneHotEncoder(), ["city"])])
print(ct.fit_transform(df).shape)       # 1 scaled + 2 one-hot columns

# OUTPUT:
# (3, 3)`],
        [`<b>Disadvantages:</b> time-consuming, needs domain knowledge, one-hot on high-cardinality columns explodes the width, and every step must be reproduced exactly at serving time.`,
            r`from sklearn.preprocessing import OneHotEncoder
import numpy as np

ids = np.arange(10_000).reshape(-1, 1)           # a user-id column
wide = OneHotEncoder().fit_transform(ids)
print(wide.shape)                                # 10,000 new columns

# OUTPUT:
# (10000, 10000)`],
        [`<b>Limitations:</b> fitting a scaler or encoder on all data before splitting leaks test information into training; unseen categories at prediction time raise errors unless handled.`,
            r`from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder().fit([["red"], ["blue"]])
try:
    enc.transform([["green"]])                   # category never seen in training
except ValueError as e:
    print("ValueError:", str(e)[:34])
safe = OneHotEncoder(handle_unknown="ignore").fit([["red"], ["blue"]])
print(safe.transform([["green"]]).toarray())     # all zeros instead of crashing

# OUTPUT:
# ValueError: Found unknown categories ['green']
# [[0. 0.]]`],
        `
   raw columns            transform                    model-ready matrix
   +-----------+     +-----------------------+     +------------------------+
   | date      |---> | month, weekday        |---> |                        |
   | city      |---> | one-hot               |---> |  numeric, scaled,      |
   | income    |---> | scale / log           |---> |  no leakage            |
   | spend,vis |---> | ratio spend/visit     |---> |                        |
   +-----------+     +-----------------------+     +------------------------+
        fit on TRAIN only  -->  same fitted object reused on test and prod
`,
        `Put every transformation inside a Pipeline/ColumnTransformer fitted on training data only; that is the single best defence against leakage and train/serve skew. For high-cardinality features prefer target or hashing encoders, and for shared features across teams consider a feature store. Do not hand-engineer what a gradient-boosted model or neural net learns reliably on its own.`
    ),

    'Model Training & Evaluation': dd(
        [`<b>Training</b> fits model parameters to data; <b>evaluation</b> measures how well it will do on unseen data using a held-out test set and metrics such as accuracy, precision, recall, F1 or RMSE.`,
            r`from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix

y_true = [1, 0, 1, 1, 0, 0]
y_pred = [1, 0, 0, 1, 0, 1]
print(accuracy_score(y_true, y_pred))
print(round(precision_score(y_true, y_pred), 3), round(recall_score(y_true, y_pred), 3))
print(confusion_matrix(y_true, y_pred))     # rows = truth, cols = prediction

# OUTPUT:
# 0.6666666666666666
# 0.667 0.667
# [[2 1]
#  [1 2]]`],
        [`A model that memorizes the training data looks perfect and fails in production (overfitting). You must test on data it has never seen.`,
            r`from sklearn.tree import DecisionTreeClassifier

X_train, y_train = [[0], [1], [2], [3]], [0, 1, 0, 1]     # noisy labels
X_test,  y_test  = [[0.4], [1.4], [2.4], [3.4]], [0, 0, 1, 1]
tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)   # unlimited depth
print("train acc:", tree.score(X_train, y_train))
print("test  acc:", tree.score(X_test, y_test))

# OUTPUT:
# train acc: 1.0
# test  acc: 0.5`],
        [`Fraud and churn models tuned for recall, medical screening for sensitivity, forecasting for RMSE; teams track metrics per release.`,
            r`from sklearn.model_selection import train_test_split

X = list(range(10)); y = [0, 1] * 5
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)     # keep class balance
print(len(X_tr), len(X_te), sum(y_te))                    # 8 train, 2 test, 1 positive

# OUTPUT:
# 8 2 1`],
        [`<b>Advantages:</b> held-out metrics estimate real-world performance, comparing candidates is objective, and metric choice encodes business cost.`,
            r`from sklearn.metrics import mean_squared_error
import numpy as np

y_true = [3.0, 5.0, 7.0]
y_pred = [2.0, 5.0, 9.0]
rmse = np.sqrt(mean_squared_error(y_true, y_pred))   # error in target units
print(round(float(rmse), 3))

# OUTPUT:
# 1.291`],
        [`<b>Disadvantages:</b> a single metric can mislead, and accuracy is useless on imbalanced data.`,
            r`from sklearn.metrics import accuracy_score, recall_score

y_true = [0] * 95 + [1] * 5       # 5% fraud
y_pred = [0] * 100                # a "model" that always says not-fraud
print(accuracy_score(y_true, y_pred))     # looks great
print(recall_score(y_true, y_pred))       # catches no fraud at all

# OUTPUT:
# 0.95
# 0.0`],
        [`<b>Limitations:</b> test data must match production data (drift breaks it), repeatedly tuning against one test set overfits to it, and metrics do not explain why a model errs.`,
            r`# Data leakage: preprocessing fit on ALL data before the split
from sklearn.preprocessing import StandardScaler
import numpy as np

X = np.array([[1.], [2.], [3.], [100.]])        # the outlier lives in the test set
leaky = StandardScaler().fit(X)                 # sees the test outlier: WRONG
clean = StandardScaler().fit(X[:3])             # train rows only: RIGHT
print(leaky.mean_.round(1), clean.mean_.round(1))

# OUTPUT:
# [26.5] [2.]`],
        `
   dataset
      |
      +--> train 80% --> fit(model) -----+
      |                                  v
      +--> test  20% -----------------> predict --> metrics
            (never touched while tuning)         accuracy / F1 / RMSE
                                                      |
                                      train >> test  =>  overfitting
`,
        `Pick the metric from the business cost of errors (recall for rare dangerous events, precision when false alarms are expensive) and set thresholds with a precision-recall curve. Keep a final untouched test set, use time-based splits for temporal data, and monitor live metrics because offline scores decay with drift. Report confidence intervals, not a single number.`
    ),

    'Cross-Validation': dd(
        [`<b>Cross-validation</b> splits the data into k folds; each fold is the test set once while the rest train the model. The k scores give a more reliable estimate than one split.`,
            r`from sklearn.model_selection import KFold

X = list(range(6))
for tr, te in KFold(n_splits=3).split(X):       # no shuffle: contiguous folds
    print("train", list(tr), "test", list(te))

# OUTPUT:
# train [2, 3, 4, 5] test [0, 1]
# train [0, 1, 4, 5] test [2, 3]
# train [0, 1, 2, 3] test [4, 5]`],
        [`With small datasets a single train/test split is a lucky-or-unlucky draw. Averaging over folds reduces variance and uses all data for both training and testing.`,
            r`from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.arange(6).reshape(-1, 1)
y = 2 * np.arange(6) + 1                      # perfectly linear
scores = cross_val_score(LinearRegression(), X, y, cv=3)   # R^2 per fold
print(scores.round(2), scores.mean().round(2))

# OUTPUT:
# [1. 1. 1.] 1.0`],
        [`Comparing algorithms fairly, tuning hyperparameters with GridSearchCV/RandomizedSearchCV, and reporting mean +- std of a metric.`,
            r`from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KNeighborsClassifier

X = [[0], [1], [2], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
gs = GridSearchCV(KNeighborsClassifier(), {"n_neighbors": [1, 3]}, cv=3)
gs.fit(X, y)
print(sorted(gs.cv_results_["params"], key=lambda p: p["n_neighbors"]))
print(gs.best_score_ <= 1.0)

# OUTPUT:
# [{'n_neighbors': 1}, {'n_neighbors': 3}]
# True`],
        [`<b>Advantages:</b> lower-variance estimates, all data used, reveals instability (a large spread across folds), and StratifiedKFold keeps class ratios in every fold.`,
            r`from sklearn.model_selection import StratifiedKFold
import numpy as np

y = np.array([0, 0, 0, 0, 1, 1, 1, 1])
X = np.zeros((8, 1))
for tr, te in StratifiedKFold(n_splits=2).split(X, y):
    print("test class counts:", np.bincount(y[te]))      # balanced in each fold

# OUTPUT:
# test class counts: [2 2]
# test class counts: [2 2]`],
        [`<b>Disadvantages:</b> k times more expensive than one split, and expensive models (deep nets) make it impractical.`,
            r`# Cost grows linearly with k:  total fits = k folds  x  grid size
folds, grid = 5, 3 * 4        # 5 folds, 3 x 4 hyperparameter combos
print("model fits needed:", folds * grid)     # plus one refit on all data

# OUTPUT:
# model fits needed: 60`],
        [`<b>Limitations:</b> plain KFold is wrong for time series (it trains on the future) and for grouped data (the same user in train and test leaks). Use TimeSeriesSplit and GroupKFold.`,
            r`from sklearn.model_selection import TimeSeriesSplit

for tr, te in TimeSeriesSplit(n_splits=3).split(list(range(8))):
    print("train", list(tr), "-> test", list(te))   # test is always AFTER train

# OUTPUT:
# train [0, 1] -> test [2, 3]
# train [0, 1, 2, 3] -> test [4, 5]
# train [0, 1, 2, 3, 4, 5] -> test [6, 7]`],
        `
   data: [ F1 | F2 | F3 ]            k = 3
   round 1:  TEST  train train   --> score1
   round 2:  train TEST  train   --> score2     mean(score) +- std
   round 3:  train train TEST    --> score3
   Time series: [train][test] ->  [train....][test] -> [train.......][test]
`,
        `Choose the splitter to match how production data arrives: stratified for imbalance, group-based when entities repeat, expanding-window for time. Put preprocessing inside the Pipeline so each fold fits it independently, and use nested CV when you both tune and estimate performance. With big data or slow models a single well-designed holdout is often the pragmatic choice.`
    )
};
