import { Topic } from '../../coreJava';

export const baggingBoostingStacking: Topic = {
    id: 'ml-trees-ensembles-bagging-vs-boosting-vs-stacking',
    name: 'Bagging vs Boosting vs Stacking',
    beginner: [
        {
            content: `<h4>Three Different Ways to Combine Multiple Models</h4>
<ul>
<li><strong>Bagging</strong> (Bootstrap AGGregatING) trains many models in PARALLEL, each on a random bootstrapped (sampled-with-replacement) subset of the training data, then averages their predictions. It mainly reduces VARIANCE. <strong>Random Forest</strong> is the classic example.</li>
<li><strong>Boosting</strong> trains many models SEQUENTIALLY, where each new model focuses on correcting the mistakes of the ones before it. It mainly reduces BIAS. <strong>AdaBoost</strong> and <strong>Gradient Boosting</strong> (XGBoost, LightGBM) are the classic examples.</li>
<li><strong>Stacking</strong> trains several DIFFERENT model types (e.g. a Random Forest, an SVM, a neural net) and then trains a "meta-model" that learns how to best COMBINE their predictions, rather than just averaging or voting.</li>
</ul>`,
            codeExamples: [
                `from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

bagging_model = RandomForestClassifier(n_estimators=100, random_state=0)
boosting_model = AdaBoostClassifier(n_estimators=100, random_state=0)
stacking_model = StackingClassifier(
    estimators=[('rf', RandomForestClassifier(random_state=0)), ('svc', SVC(probability=True))],
    final_estimator=LogisticRegression()
)

for name, model in [("Bagging (RandomForest)", bagging_model),
                     ("Boosting (AdaBoost)", boosting_model),
                     ("Stacking", stacking_model)]:
    model.fit(X_train, y_train)
    print(f"{name}: test accuracy = {model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Bagging (RandomForest): test accuracy = 0.965
# Boosting (AdaBoost): test accuracy = 0.971
# Stacking: test accuracy = 0.977`
            ],
            codeExplanations: [
                `This trains one representative model from each ensembling family on the same breast-cancer dataset, side by side. RandomForestClassifier builds 100 trees in parallel on bootstrapped samples and averages their votes (bagging). AdaBoostClassifier builds 100 trees sequentially, reweighting misclassified examples after each round so the next tree focuses harder on them (boosting). StackingClassifier trains a Random Forest and an SVM as "base" models, then trains a LogisticRegression "meta-model" on top of their predictions to learn how to best combine them (stacking). Comparing test accuracy across all three on identical data shows how each strategy for combining models can push accuracy higher than any single model alone, with stacking often edging out the others here because it gets to exploit the different strengths of two structurally different base models.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>A single model, no matter how well-tuned, is stuck with one particular bias-variance tradeoff and one particular "view" of the data. Ensembling exists because combining multiple imperfect models, in the right way, routinely beats even a very well-tuned single model.</li>
<li>Without knowing WHICH ensembling strategy targets WHICH weakness, teams often reach for the wrong tool - e.g. throwing more bagging (more Random Forest trees) at a model that is systematically wrong in a predictable way (high bias) does little good, since bagging mainly fights variance, not bias; that situation calls for boosting instead.</li>
<li>Understanding the three strategies also explains why top Kaggle solutions and production systems rarely rely on one model type - the strategies solve different problems and STACK on top of each other (a stacked ensemble can itself contain bagged and boosted models as its base learners).</li>
</ul>
<h3>Real-World Example</h3>
A Kaggle competition to predict customer churn is won by a team that combines three structurally different models via stacking:
<ul>
<li>A <strong>Random Forest</strong> (bagging) that is robust to noisy features and captures broad nonlinear patterns without much tuning.</li>
<li>An <strong>XGBoost</strong> model (boosting) that squeezes out extra accuracy by specifically targeting the hard-to-classify borderline customers the Random Forest tends to get wrong.</li>
<li>A small <strong>neural network</strong> that captures a different kind of nonlinear interaction between features entirely, thanks to its different architecture and training process.</li>
<li>Rather than simply averaging the three predictions, the team trains a lightweight <strong>meta-model</strong> (often just Logistic Regression) on top of the three base models' out-of-fold predictions - this meta-model learns, from data, how much to trust each base model in different situations, typically edging out any single model or a plain average by a meaningful margin on the leaderboard.</li>
</ul>`,
            codeExamples: [
                `# Building a stacked ensemble from a bagged model, a boosted model, and a linear model
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score

X, y = make_classification(n_samples=2000, n_features=20, n_informative=10, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

base_learners = [
    ('bagging_rf', RandomForestClassifier(n_estimators=150, random_state=0)),
    ('boosting_gb', GradientBoostingClassifier(n_estimators=150, random_state=0)),
]
stacked = StackingClassifier(estimators=base_learners, final_estimator=LogisticRegression(), cv=5)

for name, model in base_learners + [('stacked_ensemble', stacked)]:
    model.fit(X_train, y_train)
    print(f"{name}: test accuracy = {model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# bagging_rf: test accuracy = 0.892
# boosting_gb: test accuracy = 0.905
# stacked_ensemble: test accuracy = 0.917   <- beats both individual base models`
            ],
            codeExplanations: [
                `This builds a StackingClassifier whose base learners are themselves a bagged model (RandomForestClassifier) and a boosted model (GradientBoostingClassifier), with a simple LogisticRegression as the meta-model that combines their outputs. The cv=5 setting means the meta-model is trained on out-of-fold predictions from the base learners (each base model predicts on data it did NOT see during that fold's training), which prevents the meta-model from just learning to trust whichever base model overfit the training data most. Training and scoring each base learner individually alongside the stacked ensemble on the same test set shows the stacked combination outperforming either base model alone - demonstrating concretely how stacking can extract extra accuracy by learning to weigh different models' strengths rather than just picking one.`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages of Each Strategy</h3>
<h4>Bagging (Random Forest)</h4>
<ul>
<li><strong>Advantage</strong> - highly resistant to overfitting even with very deep, low-bias individual trees, because averaging many independent trees cancels out their individual noise; e.g. Random Forest can use fully-grown trees and still generalize well, unlike a single unpruned tree.</li>
<li><strong>Advantage</strong> - trees train in parallel, so it scales well on multi-core machines and large datasets.</li>
<li><strong>Disadvantage</strong> - does little to fix a model that is systematically wrong (high bias); averaging 500 trees that all share the same blind spot still leaves that blind spot.</li>
</ul>
<h4>Boosting (AdaBoost / Gradient Boosting)</h4>
<ul>
<li><strong>Advantage</strong> - typically the highest raw accuracy on structured/tabular data, because each new model explicitly targets current weaknesses rather than being trained independently.</li>
<li><strong>Disadvantage</strong> - trains sequentially, so it's slower to train than bagging and can't be trivially parallelized across trees; also more prone to overfitting on noisy data if learning_rate/n_estimators aren't tuned, since it keeps chasing residuals.</li>
</ul>
<h4>Stacking</h4>
<ul>
<li><strong>Advantage</strong> - can combine fundamentally different model types (tree-based, linear, neural), capturing complementary strengths that no single model family has on its own; often the winning approach in competitions where squeezing out a fraction of a percent of accuracy matters.</li>
<li><strong>Disadvantage</strong> - the most complex and slowest to train/serve of the three, since it requires training and running multiple full base models plus a meta-model, and the meta-model needs careful cross-validation to avoid leaking training-set information (via out-of-fold predictions), making it harder to set up correctly and less common in latency-sensitive production systems.</li>
</ul>`,
            codeExamples: [
                `# Bagging fails to fix a systematically biased base learner; boosting fixes it
from sklearn.ensemble import BaggingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=10, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

# deliberately weak, high-bias base learner (depth=1 "stump")
stump = DecisionTreeClassifier(max_depth=1, random_state=0)

bagged_stumps = BaggingClassifier(estimator=stump, n_estimators=100, random_state=0)
boosted_stumps = AdaBoostClassifier(estimator=stump, n_estimators=100, random_state=0)

for name, model in [("Bagging 100 stumps", bagged_stumps), ("Boosting 100 stumps", boosted_stumps)]:
    model.fit(X_train, y_train)
    print(f"{name}: test accuracy = {model.score(X_test, y_test):.3f}")
# OUTPUT (typical):
# Bagging 100 stumps: test accuracy = 0.780   <- bagging can't fix each stump's high bias
# Boosting 100 stumps: test accuracy = 0.913   <- boosting sequentially corrects the stumps' shared blind spots`
            ],
            codeExplanations: [
                `This deliberately uses a very weak base learner - a depth-1 decision "stump", which by itself is high-bias and can only ask one yes/no question. Wrapping 100 of these stumps in a BaggingClassifier averages 100 independent, similarly-biased stumps trained on different bootstrapped samples - since they all share roughly the same blind spot (each can only make one split), averaging them barely helps, and accuracy stays low. Wrapping the same stumps in an AdaBoostClassifier instead trains them sequentially, where each new stump is specifically reweighted to focus on the examples the previous stumps got wrong - this directly targets and corrects the shared bias, producing a much higher accuracy. This is the clearest possible illustration of the core claim above: bagging reduces variance but not bias, while boosting reduces bias.`
            ]
        },
        {
            content: `<h3>Deeper Mechanics - Which Strategy to Reach For</h3>
<ul>
<li>Diagnose the problem FIRST: if a single well-tuned model has low training error but much higher test error (overfitting / high variance), reach for <strong>bagging</strong>. If a single model has high error on BOTH training and test data (underfitting / high bias), reach for <strong>boosting</strong> instead - more bagging won't fix that.</li>
<li><strong>Bagging</strong> works best combining many instances of the SAME high-variance, low-bias base model (e.g. deep, unpruned decision trees).</li>
<li><strong>Boosting</strong> works best combining many instances of the SAME low-variance, high-bias base model (e.g. shallow "stump" trees), letting the sequential correction process gradually reduce the shared bias.</li>
<li><strong>Stacking</strong> works best combining DIFFERENT model families that each capture different, complementary patterns in the data - its extra complexity is usually only worth it when squeezing out the last bit of accuracy matters more than training/serving simplicity (e.g. competition leaderboards, high-value risk models), rather than in every production system by default.</li>
</ul>`,
            codeExamples: [
                `# Deciding which strategy to reach for, based on the train/test error gap
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=10, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

for depth, label in [(1, "shallow stump (likely high bias)"), (None, "unpruned tree (likely high variance)")]:
    model = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"{label}: train={train_acc:.3f}  test={test_acc:.3f}  gap={train_acc - test_acc:.3f}")
# OUTPUT (typical):
# shallow stump (likely high bias): train=0.710  test=0.700  gap=0.010      <- both low, both close -> needs BOOSTING
# unpruned tree (likely high variance): train=1.000  test=0.873  gap=0.127  <- big gap -> needs BAGGING`
            ],
            codeExplanations: [
                `This diagnostic checks the train/test accuracy gap for two extreme base-model configurations, which is exactly the signal used to decide between bagging and boosting in practice. The shallow "stump" (max_depth=1) shows LOW accuracy on both train AND test data with almost no gap between them - a textbook sign of high bias/underfitting, meaning the model is too simple everywhere, which calls for boosting (sequential error-correction) rather than bagging. The unpruned tree (max_depth=None) shows near-perfect training accuracy but a noticeably lower test accuracy - a textbook sign of high variance/overfitting, meaning the model memorized training-set noise, which calls for bagging (averaging many such trees trained on different samples) to smooth that noise out. This gap-based diagnosis is the practical first step before choosing an ensembling strategy for a real problem.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the fundamental difference between bagging and boosting?</td><td>Bagging trains many models in PARALLEL and independently on bootstrapped samples, then averages/votes them to reduce VARIANCE (e.g. Random Forest); boosting trains models SEQUENTIALLY, where each new model is trained specifically to correct the errors of the ensemble so far, primarily reducing BIAS (e.g. AdaBoost, Gradient Boosting)</td></tr>
<tr class='text-center'><td>When would you choose stacking over bagging or boosting?</td><td>When you have several structurally different, already-decent models (e.g. a tree-based model, a linear model, a neural net) and want to squeeze out extra accuracy by learning how to optimally combine their complementary strengths via a meta-model - it's the most complex and slowest of the three to train and serve, so it's usually reached for when maximum accuracy matters more than simplicity, such as in competitions or high-value models</td></tr>
<tr class='text-center'><td>Why does bagging fail to fix a base learner with high bias?</td><td>Bagging only reduces variance by averaging many independent models trained on different samples - if every one of those models shares the same systematic blind spot (high bias), averaging them still leaves that same blind spot untouched, since averaging cancels out random noise, not a consistent, shared error</td></tr>
</table>`
        }
    ]
};
