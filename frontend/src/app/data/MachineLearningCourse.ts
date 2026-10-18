// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
import { mlModules } from './mlModules';
export type { ContentBlock, Topic, SubTopic, Course };

export const MachineLearningCourse: Course[] = [
    {
        id: 'machine-learning',
        name: 'Machine Learning',
        icon: 'BookOpen',
        subTopics: mlModules,
        cheatNotes: [
            'Supervised Learning - Model learns from labeled input-output pairs',
            'Unsupervised Learning - Model finds structure in unlabeled data',
            'Reinforcement Learning - Agent learns via rewards and penalties',
            'Regression - Predicts a continuous numeric value',
            'Classification - Predicts a discrete category/class',
            'Feature - An input variable used to make a prediction',
            'Label / Target - The known correct output in supervised learning',
            'Training set / Test set - Data used to fit vs evaluate a model',
            'Overfitting - Model memorizes training data, fails to generalize',
            'Underfitting - Model too simple, fails on both training and test data',
            'Bias-Variance Tradeoff - Balancing model simplicity against flexibility',
            'Linear Regression - Fits a straight line to predict a continuous target',
            'Logistic Regression - Classification algorithm outputting class probabilities',
            'K-Means - Unsupervised clustering algorithm grouping similar points',
            'PCA - Dimensionality reduction by projecting onto directions of maximum variance',
            'Mean Squared Error (MSE) - Common loss metric for regression',
            'Accuracy - Fraction of correct predictions (common classification metric)',
            'Precision - Of predicted positives, how many were actually positive',
            'Recall - Of actual positives, how many were correctly predicted',
            'Cross-validation - Splitting data multiple ways to reliably estimate performance',
            'Feature scaling / normalization - Rescaling features to comparable ranges',
            'Regularization - Penalizing model complexity to reduce overfitting (L1/L2)',
            'Ensemble Learning - Combining multiple models (bagging, boosting, stacking) for better predictions',
            'Gradient Descent - Iteratively adjusting parameters to minimize a loss function',
            'Hyperparameter Tuning - Searching for the best model configuration (grid/random/Bayesian search)',
            'MLOps - Practices for reliably deploying, monitoring and retraining ML models in production',
            "RAG (Retrieval-Augmented Generation) - Grounding an LLM's answers in retrieved documents",
            'scikit-learn - Popular Python library for classical ML algorithms',
        ],
        interviewQuestions: [
            {
                company: 'General Machine Learning Interview',
                questions: [
                    'What is the difference between supervised and unsupervised learning?',
                    'What is the difference between regression and classification?',
                    'What is overfitting, and how can you prevent it?',
                    'Explain how Linear Regression works.',
                    'What is the difference between accuracy and precision/recall?',
                    'What is cross-validation and why is it used?',
                    'What is the bias-variance tradeoff?',
                    'How does K-Means clustering work?',
                    'What is regularization, and how do L1 and L2 differ?',
                    'What is the difference between bagging and boosting?',
                    'How does a Random Forest reduce overfitting compared to a single Decision Tree?',
                    'What is the kernel trick in SVM?',
                    'How does gradient descent minimize a loss function?',
                    'What is the purpose of a confusion matrix, and what does each cell mean?',
                    'What is PCA, and when would you use it?',
                    'What is the difference between a parameter and a hyperparameter?'
                ]
            }
        ]
    }
];
