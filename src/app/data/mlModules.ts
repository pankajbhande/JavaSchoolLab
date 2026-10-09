// The Machine Learning syllabus: 20 modules spanning fundamentals through GenAI/LLMs.
// Most topics start as placeholders (name + a short "coming soon" body) and get real
// content filled in one at a time - the navigation and routing for the whole syllabus
// exists from day one, same shape as dsaModules.ts and springBootModules.ts.
//
// A handful of topics already had full write-ups under the old two-module ML course;
// those are kept below as overrides, slotted into their matching module.

import type { Topic, SubTopic } from './types';
import { biasVariance } from './topics/ml/BiasVariance';
import { decisionTree } from './topics/ml/DecisionTree';
import { kFoldCrossValidation } from './topics/ml/KFoldCrossValidation';
import { randomForest } from './topics/ml/RandomForest';
import { supportVectorMachine } from './topics/ml/SupportVectorMachine';
import { kNearestNeighbors } from './topics/ml/KNearestNeighbors';
import { naiveBayes } from './topics/ml/NaiveBayes';
import { hyperparameterOptimization } from './topics/ml/HyperparameterOptimization';
import { recursiveFeatureElimination } from './topics/ml/RecursiveFeatureElimination';
import { artificialNeuralNetwork } from './topics/ml/ArtificialNeuralNetwork';
import { cnn } from './topics/ml/Cnn';
import { gradientBoosting } from './topics/ml/GradientBoosting';
import { kMeans } from './topics/ml/KMeans';
import { pca } from './topics/ml/Pca';
import { polynomialFeatures } from './topics/ml/PolynomialFeatures';
import { rnn } from './topics/ml/Rnn';
import { transformers } from './topics/ml/Transformers';
import { shap } from './topics/ml/Shap';
import { mlPipeline } from './topics/ml/MlPipeline';
import { rag } from './topics/ml/Rag';
import { confusionMatrix } from './topics/ml/ConfusionMatrix';
import { precision } from './topics/ml/Precision';
import { rocCurve } from './topics/ml/RocCurve';
import { baggingBoostingStacking } from './topics/ml/BaggingBoostingStacking';
import { vectors } from './topics/ml/Vectors';
import { bayesTheorem } from './topics/ml/BayesTheorem';
import { normalDistribution } from './topics/ml/NormalDistribution';
import { gradientDescentMath } from './topics/ml/GradientDescentMath';
import { standardization } from './topics/ml/Standardization';
import { oneHotEncoding } from './topics/ml/OneHotEncoding';
import { tfIdf } from './topics/ml/TfIdf';
import { word2Vec } from './topics/ml/Word2Vec';
import { promptEngineering } from './topics/ml/PromptEngineering';
import { vectorDatabases } from './topics/ml/VectorDatabases';
import { qLearning } from './topics/ml/QLearning';
import { modelMonitoring } from './topics/ml/ModelMonitoring';
import { aiVsMlVsDeepLearning } from './topics/ml/AiVsMlVsDeepLearning';
import { unsupervisedLearning } from './topics/ml/UnsupervisedLearning';
import { semiSupervisedLearning } from './topics/ml/SemiSupervisedLearning';
import { reinforcementLearningFundamentals } from './topics/ml/ReinforcementLearningFundamentals';
import { generalization } from './topics/ml/Generalization';
import { curseOfDimensionality } from './topics/ml/CurseOfDimensionality';
import { noFreeLunchTheorem } from './topics/ml/NoFreeLunchTheorem';
import { trainingValidationTestData } from './topics/ml/TrainingValidationTestData';
import { featuresLabels } from './topics/ml/FeaturesLabels';
import { parametersVsHyperparameters } from './topics/ml/ParametersVsHyperparameters';
import { modelHypothesisLearning } from './topics/ml/ModelHypothesisLearning';
import { matrices } from './topics/ml/Matrices';
import { dotProduct } from './topics/ml/DotProduct';
import { eigenvaluesEigenvectors } from './topics/ml/EigenvaluesEigenvectors';
import { singularValueDecomposition } from './topics/ml/SingularValueDecomposition';
import { probabilityBasics } from './topics/ml/ProbabilityBasics';
import { randomVariables } from './topics/ml/RandomVariables';
import { expectationVariance } from './topics/ml/ExpectationVariance';
import { meanMedianMode } from './topics/ml/MeanMedianMode';
import { rank } from './topics/ml/Rank';
import { sampling } from './topics/ml/Sampling';
import { confidenceIntervals } from './topics/ml/ConfidenceIntervals';
import { hypothesisTesting } from './topics/ml/HypothesisTesting';
import { derivatives } from './topics/ml/Derivatives';
import { gradients } from './topics/ml/Gradients';
import { convexVsNonConvexOptimization } from './topics/ml/ConvexVsNonConvexOptimization';
import { centralLimitTheorem } from './topics/ml/CentralLimitTheorem';
import { whatIsMachineLearning } from './topics/ml/WhatIsMachineLearningDeep';
import { supervisedLearningFundamentals } from './topics/ml/SupervisedLearningDeep';
import { underfittingVsOverfitting } from './topics/ml/UnderfittingOverfittingDeep';
import { simpleLinearRegression } from './topics/ml/SimpleLinearRegressionDeep';
import { logisticRegression } from './topics/ml/LogisticRegressionDeep';
import { univariateAnalysis } from './topics/ml/UnivariateAnalysis';
import { bivariateAnalysis } from './topics/ml/BivariateAnalysis';
import { multivariateAnalysis } from './topics/ml/MultivariateAnalysis';
import { distributionAnalysis } from './topics/ml/DistributionAnalysis';
import { correlationAnalysisEda } from './topics/ml/CorrelationAnalysisEda';
import { outlierAnalysisEda } from './topics/ml/OutlierAnalysisEda';
import { featureRelationships } from './topics/ml/FeatureRelationships';
import { histogram } from './topics/ml/HistogramEda';
import { boxPlot } from './topics/ml/BoxPlotEda';
import { scatterPlot } from './topics/ml/ScatterPlotEda';
import { heatmap } from './topics/ml/HeatmapEda';
import { statisticalSummary } from './topics/ml/StatisticalSummary';
import { featureImportanceEda } from './topics/ml/FeatureImportanceEda';
import { dataCollection } from './topics/ml/DataCollection';
import { dataCleaning } from './topics/ml/DataCleaning';
import { missingValueHandling } from './topics/ml/MissingValueHandling';
import { duplicateHandling } from './topics/ml/DuplicateHandling';
import { outlierDetectionPreprocessing } from './topics/ml/OutlierDetectionPreprocessing';
import { categoricalData } from './topics/ml/CategoricalData';
import { numericalData } from './topics/ml/NumericalData';
import { labelEncoding } from './topics/ml/LabelEncoding';
import { targetEncoding } from './topics/ml/TargetEncoding';
import { normalization } from './topics/ml/Normalization';
import { featureTransformation } from './topics/ml/FeatureTransformationPreprocessing';
import { dataImbalance } from './topics/ml/DataImbalance';
import { trainTestSplit } from './topics/ml/TrainTestSplit';
import { dataLeakage } from './topics/ml/DataLeakagePreprocessing';
import { pipelinePreprocessing } from './topics/ml/PipelinePreprocessing';
import { multipleLinearRegression } from './topics/ml/MultipleLinearRegression';
import { costFunction } from './topics/ml/CostFunction';
import { ordinaryLeastSquares } from './topics/ml/OrdinaryLeastSquares';
import { gradientDescentRegression } from './topics/ml/GradientDescentRegression';
import { ridgeRegression } from './topics/ml/RidgeRegression';
import { lassoRegression } from './topics/ml/LassoRegression';
import { elasticNet } from './topics/ml/ElasticNet';
import { polynomialRegression } from './topics/ml/PolynomialRegression';
import { robustRegression } from './topics/ml/RobustRegression';
import { decisionTreeRegression } from './topics/ml/DecisionTreeRegression';
import { randomForestRegression } from './topics/ml/RandomForestRegression';
import { gradientBoostingRegression } from './topics/ml/GradientBoostingRegression';
import { mse } from './topics/ml/Mse';
import { mae } from './topics/ml/Mae';
import { rmse } from './topics/ml/Rmse';
import { rSquared } from './topics/ml/RSquared';
import { adjustedRSquared } from './topics/ml/AdjustedRSquared';
import { residualAnalysis } from './topics/ml/ResidualAnalysis';
import { decisionBoundary } from './topics/ml/DecisionBoundary';
import { probabilityPrediction } from './topics/ml/ProbabilityPrediction';
import { threshold } from './topics/ml/Threshold';
import { sigmoidFunction } from './topics/ml/SigmoidFunction';
import { softmaxFunction } from './topics/ml/SoftmaxFunction';
import { margin } from './topics/ml/Margin';
import { kernelTrick } from './topics/ml/KernelTrick';
import { binaryClassification } from './topics/ml/BinaryClassification';
import { multiclassClassification } from './topics/ml/MulticlassClassification';
import { multilabelClassification } from './topics/ml/MultilabelClassification';
import { adaBoost } from './topics/ml/AdaBoost';
import { xgBoost } from './topics/ml/XgBoost';
import { lightGbm } from './topics/ml/LightGbm';
import { catBoost } from './topics/ml/CatBoost';

const slug = (s: string) =>
    s.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

function placeholder(categoryId: string, name: string): Topic {
    return {
        id: `${categoryId}-${slug(name)}`,
        name,
        beginner: [
            {
                content: `<h4>${name}</h4>
Content for this topic is coming soon.`
            }
        ]
    };
}

/** Builds a module from topic names, swapping in a pre-written Topic wherever `overrides` names one. */
function buildModule(id: string, name: string, topicNames: string[], overrides: Record<string, Topic> = {}): SubTopic {
    return {
        id,
        name,
        topics: topicNames.map(n => overrides[n] ?? placeholder(id, n))
    };
}

export const mlModules: SubTopic[] = [
    buildModule('ml-fundamentals', 'ML Fundamentals', [
        'What is Machine Learning?',
        'AI vs ML vs Deep Learning',
        'Supervised Learning',
        'Unsupervised Learning',
        'Semi-Supervised Learning',
        'Reinforcement Learning',
        'Training, Validation & Test Data',
        'Features & Labels',
        'Parameters vs Hyperparameters',
        'Model, Hypothesis & Learning',
        'Generalization',
        'Bias & Variance',
        'Underfitting vs Overfitting',
        'Curse of Dimensionality',
        'No Free Lunch Theorem'
    ], {
        'What is Machine Learning?': whatIsMachineLearning,
        'AI vs ML vs Deep Learning': aiVsMlVsDeepLearning,
        'Supervised Learning': supervisedLearningFundamentals,
        'Unsupervised Learning': unsupervisedLearning,
        'Semi-Supervised Learning': semiSupervisedLearning,
        'Reinforcement Learning': reinforcementLearningFundamentals,
        'Training, Validation & Test Data': trainingValidationTestData,
        'Features & Labels': featuresLabels,
        'Parameters vs Hyperparameters': parametersVsHyperparameters,
        'Model, Hypothesis & Learning': modelHypothesisLearning,
        'Generalization': generalization,
        'Bias & Variance': biasVariance,
        'Underfitting vs Overfitting': underfittingVsOverfitting,
        'Curse of Dimensionality': curseOfDimensionality,
        'No Free Lunch Theorem': noFreeLunchTheorem
    }),

    buildModule('ml-mathematics', 'Mathematics for ML', [
        'Vectors',
        'Matrices',
        'Matrix Operations',
        'Dot Product',
        'Matrix Inverse',
        'Eigenvalues & Eigenvectors',
        'Rank',
        'Singular Value Decomposition (SVD)',
        'Probability Basics',
        'Conditional Probability',
        "Bayes' Theorem",
        'Random Variables',
        'Probability Distributions',
        'Expectation & Variance',
        'Covariance & Correlation',
        'Mean, Median, Mode',
        'Standard Deviation',
        'Normal Distribution',
        'Sampling',
        'Confidence Intervals',
        'Hypothesis Testing',
        'Central Limit Theorem',
        'Derivatives',
        'Partial Derivatives',
        'Gradients',
        'Chain Rule',
        'Gradient Descent',
        'Convex vs Non-Convex Optimization'
    ], {
        'Vectors': vectors,
        'Matrices': matrices,
        'Dot Product': dotProduct,
        'Eigenvalues & Eigenvectors': eigenvaluesEigenvectors,
        'Rank': rank,
        'Singular Value Decomposition (SVD)': singularValueDecomposition,
        'Probability Basics': probabilityBasics,
        "Bayes' Theorem": bayesTheorem,
        'Random Variables': randomVariables,
        'Expectation & Variance': expectationVariance,
        'Mean, Median, Mode': meanMedianMode,
        'Normal Distribution': normalDistribution,
        'Sampling': sampling,
        'Confidence Intervals': confidenceIntervals,
        'Hypothesis Testing': hypothesisTesting,
        'Central Limit Theorem': centralLimitTheorem,
        'Derivatives': derivatives,
        'Gradients': gradients,
        'Gradient Descent': gradientDescentMath,
        'Convex vs Non-Convex Optimization': convexVsNonConvexOptimization
    }),

    buildModule('ml-data-preprocessing', 'Data Preprocessing', [
        'Data Collection',
        'Data Cleaning',
        'Missing Value Handling',
        'Duplicate Handling',
        'Outlier Detection',
        'Categorical Data',
        'Numerical Data',
        'Label Encoding',
        'One-Hot Encoding',
        'Target Encoding',
        'Standardization',
        'Normalization',
        'Feature Transformation',
        'Data Imbalance',
        'Train-Test Split',
        'Data Leakage',
        'Pipeline'
    ], {
        'Data Collection': dataCollection,
        'Data Cleaning': dataCleaning,
        'Missing Value Handling': missingValueHandling,
        'Duplicate Handling': duplicateHandling,
        'Outlier Detection': outlierDetectionPreprocessing,
        'Categorical Data': categoricalData,
        'Numerical Data': numericalData,
        'Label Encoding': labelEncoding,
        'One-Hot Encoding': oneHotEncoding,
        'Target Encoding': targetEncoding,
        'Standardization': standardization,
        'Normalization': normalization,
        'Feature Transformation': featureTransformation,
        'Data Imbalance': dataImbalance,
        'Train-Test Split': trainTestSplit,
        'Data Leakage': dataLeakage,
        'Pipeline': pipelinePreprocessing
    }),

    buildModule('ml-eda', 'Exploratory Data Analysis (EDA)', [
        'Univariate Analysis',
        'Bivariate Analysis',
        'Multivariate Analysis',
        'Distribution Analysis',
        'Correlation Analysis',
        'Covariance',
        'Outlier Analysis',
        'Feature Relationships',
        'Histogram',
        'Box Plot',
        'Scatter Plot',
        'Heatmap',
        'Statistical Summary',
        'Feature Importance'
    ], {
        'Univariate Analysis': univariateAnalysis,
        'Bivariate Analysis': bivariateAnalysis,
        'Multivariate Analysis': multivariateAnalysis,
        'Distribution Analysis': distributionAnalysis,
        'Correlation Analysis': correlationAnalysisEda,
        'Outlier Analysis': outlierAnalysisEda,
        'Feature Relationships': featureRelationships,
        'Histogram': histogram,
        'Box Plot': boxPlot,
        'Scatter Plot': scatterPlot,
        'Heatmap': heatmap,
        'Statistical Summary': statisticalSummary,
        'Feature Importance': featureImportanceEda
    }),

    buildModule('ml-regression', 'Supervised Learning: Regression', [
        'Simple Linear Regression',
        'Multiple Linear Regression',
        'Cost Function',
        'Ordinary Least Squares',
        'Gradient Descent',
        'Ridge Regression - L2',
        'Lasso Regression - L1',
        'Elastic Net',
        'Polynomial Regression',
        'Robust Regression',
        'Decision Tree Regression',
        'Random Forest Regression',
        'Gradient Boosting Regression',
        'MSE',
        'MAE',
        'RMSE',
        'R²',
        'Adjusted R²',
        'Residual Analysis'
    ], {
        'Simple Linear Regression': simpleLinearRegression,
        'Multiple Linear Regression': multipleLinearRegression,
        'Cost Function': costFunction,
        'Ordinary Least Squares': ordinaryLeastSquares,
        'Gradient Descent': gradientDescentRegression,
        'Ridge Regression - L2': ridgeRegression,
        'Lasso Regression - L1': lassoRegression,
        'Elastic Net': elasticNet,
        'Polynomial Regression': polynomialRegression,
        'Robust Regression': robustRegression,
        'Decision Tree Regression': decisionTreeRegression,
        'Random Forest Regression': randomForestRegression,
        'Gradient Boosting Regression': gradientBoostingRegression,
        'MSE': mse,
        'MAE': mae,
        'RMSE': rmse,
        'R²': rSquared,
        'Adjusted R²': adjustedRSquared,
        'Residual Analysis': residualAnalysis
    }),

    buildModule('ml-classification', 'Supervised Learning: Classification', [
        'Binary Classification',
        'Multiclass Classification',
        'Multilabel Classification',
        'Logistic Regression',
        'K-Nearest Neighbors (KNN)',
        'Naive Bayes',
        'Decision Tree',
        'Random Forest',
        'Support Vector Machine (SVM)',
        'Gradient Boosting',
        'AdaBoost',
        'XGBoost',
        'LightGBM',
        'CatBoost',
        'Decision Boundary',
        'Probability Prediction',
        'Threshold',
        'Sigmoid Function',
        'Softmax Function',
        'Margin',
        'Kernel Trick'
    ], {
        'Logistic Regression': logisticRegression,
        'Decision Tree': decisionTree,
        'Random Forest': randomForest,
        'Support Vector Machine (SVM)': supportVectorMachine,
        'K-Nearest Neighbors (KNN)': kNearestNeighbors,
        'Naive Bayes': naiveBayes,
        'Gradient Boosting': gradientBoosting,
        'Binary Classification': binaryClassification,
        'Multiclass Classification': multiclassClassification,
        'Multilabel Classification': multilabelClassification,
        'AdaBoost': adaBoost,
        'XGBoost': xgBoost,
        'LightGBM': lightGbm,
        'CatBoost': catBoost,
        'Decision Boundary': decisionBoundary,
        'Probability Prediction': probabilityPrediction,
        'Threshold': threshold,
        'Sigmoid Function': sigmoidFunction,
        'Softmax Function': softmaxFunction,
        'Margin': margin,
        'Kernel Trick': kernelTrick
    }),

    buildModule('ml-model-evaluation', 'Model Evaluation', [
        'Confusion Matrix',
        'Accuracy',
        'Precision',
        'Recall',
        'F1 Score',
        'Specificity',
        'Sensitivity',
        'ROC Curve',
        'AUC',
        'Precision-Recall Curve',
        'Log Loss',
        'MAE',
        'MSE',
        'RMSE',
        'R²',
        'Adjusted R²',
        'MAPE',
        'Holdout Validation',
        'K-Fold Cross Validation',
        'Stratified K-Fold',
        'Leave-One-Out',
        'Time-Series Cross Validation',
        'Bias-Variance Tradeoff',
        'Learning Curves',
        'Validation Curves'
    ], {
        'K-Fold Cross Validation': kFoldCrossValidation,
        'Confusion Matrix': confusionMatrix,
        'Precision': precision,
        'ROC Curve': rocCurve
    }),

    buildModule('ml-trees-ensembles', 'Decision Trees & Ensemble Learning', [
        'Entropy',
        'Information Gain',
        'Gini Impurity',
        'Splitting Criteria',
        'Tree Pruning',
        'Maximum Depth',
        'Minimum Samples Split',
        'Bagging',
        'Boosting',
        'Stacking',
        'Voting',
        'Random Forest',
        'AdaBoost',
        'Gradient Boosting',
        'XGBoost',
        'LightGBM',
        'CatBoost',
        'Bagging vs Boosting vs Stacking'
    ], {
        'Bagging vs Boosting vs Stacking': baggingBoostingStacking
    }),

    buildModule('ml-unsupervised', 'Unsupervised Learning', [
        'K-Means',
        'K-Medoids',
        'Hierarchical Clustering',
        'DBSCAN',
        'Gaussian Mixture Models',
        'Centroid',
        'Distance Metrics',
        'Elbow Method',
        'Silhouette Score',
        'Dendrogram',
        'PCA',
        'SVD',
        'LDA',
        't-SNE',
        'UMAP'
    ], {
        'K-Means': kMeans,
        'PCA': pca
    }),

    buildModule('ml-feature-engineering', 'Feature Engineering & Feature Selection', [
        'Numerical Transformation',
        'Log Transformation',
        'Polynomial Features',
        'Binning',
        'Interaction Features',
        'Date/Time Features',
        'Text Features',
        'Domain-Based Features',
        'Filter Methods',
        'Wrapper Methods',
        'Embedded Methods',
        'Correlation-Based Selection',
        'Chi-Square Test',
        'ANOVA',
        'Mutual Information',
        'Recursive Feature Elimination (RFE)',
        'L1 Regularization',
        'Tree-Based Feature Importance'
    ], {
        'Recursive Feature Elimination (RFE)': recursiveFeatureElimination,
        'Polynomial Features': polynomialFeatures
    }),

    buildModule('ml-advanced', 'Advanced Machine Learning', [
        'Bayesian Learning',
        'Naive Bayes',
        'Gaussian Processes',
        'Kernel Methods',
        'SVM',
        'Probabilistic Models',
        'Hidden Markov Models',
        'Expectation-Maximization',
        'Mixture Models',
        'Markov Decision Processes',
        'Reinforcement Learning Basics'
    ]),

    buildModule('ml-time-series', 'Time Series Machine Learning', [
        'Trend',
        'Seasonality',
        'Cyclicity',
        'Noise',
        'Stationarity',
        'Autocorrelation',
        'Partial Autocorrelation',
        'Lag Features',
        'Moving Average',
        'Exponential Smoothing',
        'AR',
        'MA',
        'ARIMA',
        'SARIMA',
        'Prophet',
        'Time-Series Cross Validation',
        'Forecasting Metrics'
    ]),

    buildModule('ml-nlp', 'Natural Language Processing with ML', [
        'Text Preprocessing',
        'Tokenization',
        'Stop Words',
        'Stemming',
        'Lemmatization',
        'N-Grams',
        'Bag of Words',
        'TF-IDF',
        'Word Embeddings',
        'Word2Vec',
        'GloVe',
        'Document Similarity',
        'Text Classification',
        'Sentiment Analysis',
        'Named Entity Recognition'
    ], {
        'TF-IDF': tfIdf,
        'Word2Vec': word2Vec
    }),

    buildModule('ml-deep-learning', 'Deep Learning', [
        'Perceptron',
        'Artificial Neural Network',
        'ReLU',
        'Sigmoid',
        'Tanh',
        'Softmax',
        'Forward Propagation',
        'Backpropagation',
        'Loss Functions',
        'Gradient Descent',
        'CNN',
        'RNN',
        'LSTM',
        'GRU',
        'Autoencoders',
        'GANs',
        'Attention Mechanism',
        'Transformers'
    ], {
        'Artificial Neural Network': artificialNeuralNetwork,
        'CNN': cnn,
        'RNN': rnn,
        'Transformers': transformers
    }),

    buildModule('ml-reinforcement-learning', 'Reinforcement Learning', [
        'Agent',
        'Environment',
        'State',
        'Action',
        'Reward',
        'Policy',
        'Value Function',
        'Q-Function',
        'Bellman Equation',
        'Markov Decision Process',
        'Q-Learning',
        'SARSA',
        'Deep Q Network (DQN)',
        'Exploration vs Exploitation',
        'Policy Gradient',
        'Actor-Critic'
    ], {
        'Q-Learning': qLearning
    }),

    buildModule('ml-optimization', 'Model Optimization & Hyperparameter Tuning', [
        'Hyperparameter Optimization',
        'Grid Search',
        'Random Search',
        'Bayesian Optimization',
        'Optuna',
        'Learning Rate Optimization',
        'Early Stopping',
        'Regularization',
        'Feature Selection',
        'Ensemble Optimization',
        'Bias-Variance Tradeoff',
        'Model Complexity',
        'Overfitting Control'
    ], {
        'Hyperparameter Optimization': hyperparameterOptimization
    }),

    buildModule('ml-explainable-ai', 'Explainable AI (XAI)', [
        'Model Interpretability',
        'Feature Importance',
        'Permutation Importance',
        'SHAP',
        'LIME',
        'Partial Dependence Plot',
        'ICE Plot',
        'Counterfactual Explanation',
        'Global vs Local Explainability'
    ], {
        'SHAP': shap
    }),

    buildModule('ml-mlops', 'ML Engineering / MLOps', [
        'ML Pipeline',
        'Data Pipeline',
        'Model Training Pipeline',
        'Model Versioning',
        'Data Versioning',
        'Experiment Tracking',
        'Model Registry',
        'Model Deployment',
        'Batch Prediction',
        'Real-Time Prediction',
        'REST API for ML',
        'Docker',
        'CI/CD',
        'Model Monitoring',
        'Data Drift',
        'Concept Drift',
        'Model Drift',
        'Retraining',
        'Feature Store',
        'MLflow',
        'Kubernetes',
        'Airflow',
        'DVC',
        'FastAPI',
        'Cloud ML Platforms'
    ], {
        'ML Pipeline': mlPipeline,
        'Model Monitoring': modelMonitoring
    }),

    buildModule('ml-production', 'Production Machine Learning', [
        'Model Serialization',
        'Model Serving',
        'REST/gRPC Inference',
        'Batch Inference',
        'Online Inference',
        'Latency Optimization',
        'Throughput Optimization',
        'Model Caching',
        'A/B Testing',
        'Canary Deployment',
        'Shadow Deployment',
        'Model Monitoring',
        'Logging',
        'Alerting',
        'Scalability',
        'Fault Tolerance'
    ]),

    buildModule('ml-genai', 'Modern AI / GenAI', [
        'Generative AI Fundamentals',
        'Large Language Models (LLMs)',
        'Transformers',
        'Self-Attention',
        'Tokenization',
        'Embeddings',
        'Prompt Engineering',
        'Context Windows',
        'Fine-Tuning',
        'Instruction Tuning',
        'RAG',
        'Vector Databases',
        'Semantic Search',
        'Hybrid Search',
        'Reranking',
        'Function Calling',
        'Tool Use',
        'AI Agents',
        'Agentic RAG',
        'Evaluation',
        'Hallucination',
        'Guardrails',
        'LLM Observability',
        'LoRA / PEFT',
        'Quantization'
    ], {
        'RAG': rag,
        'Prompt Engineering': promptEngineering,
        'Vector Databases': vectorDatabases
    })
];
