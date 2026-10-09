// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const DataScienceCourse: Course[] = [
    {
        id: 'data-science',
        name: 'Data Science',
        icon: 'Database',
        subTopics: [
            {
                id: 'ds-fundamentals',
                name: 'Data Science Fundamentals',
                topics: [
                    {
                        id: 'ds-intro',
                        name: 'Introduction to Data Science',
                        beginner: [
                            {
                                content: `<h3>What is Data Science?</h3>
• Data Science is the interdisciplinary field of extracting knowledge and actionable insights from data, combining statistics, programming, and domain expertise.<br>
• The typical <strong>Data Science Lifecycle</strong>:<br>
1. Problem Definition - what question are we answering?<br>
2. Data Collection - gathering raw data from files, databases, or APIs.<br>
3. Data Cleaning - handling missing values, duplicates, and inconsistent formats.<br>
4. Exploratory Data Analysis (EDA) - summarizing and visualizing data to find patterns.<br>
5. Modeling - applying statistics or machine learning to answer the question.<br>
6. Communication - presenting findings via reports, dashboards, or visualizations.<br>`,
                                codeExamples: [
                                    `import pandas as pd

# Loading and inspecting a dataset
df = pd.read_csv("students.csv")

print(df.head())          # first 5 rows
print(df.shape)            # (rows, columns)
print(df.describe())       # count, mean, std, min, max for numeric columns
print(df.isnull().sum())   # count of missing values per column`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'ds-data-cleaning',
                        name: 'Data Cleaning',
                        beginner: [
                            {
                                content: `<h3>Handling Missing & Duplicate Data</h3>
Real-world datasets are messy. Common cleaning steps: dropping or filling missing values (<code>NaN</code>), removing duplicate rows, and correcting inconsistent data types.<br>`,
                                codeExamples: [
                                    `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name": ["Pankaj", "Sheru", "Dheeraj", "Sheru"],
    "score": [85, np.nan, 78, 90]
})

# Fill missing numeric values with the column mean
df["score"] = df["score"].fillna(df["score"].mean())

# Remove exact duplicate rows
df = df.drop_duplicates(subset=["name"])  # without subset it compares WHOLE rows, and the two Sheru rows differ, so nothing would be removed

print(df)
# OUTPUT:
#       name  score
# 0   Pankaj   85.0
# 1    Sheru   84.3   (mean-filled)
# 2  Dheeraj   78.0
# (duplicate "Sheru" row removed)`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'ds-analysis',
                name: 'Data Analysis & Visualization',
                topics: [
                    {
                        id: 'ds-pandas-numpy',
                        name: 'Pandas & NumPy Basics',
                        beginner: [
                            {
                                content: `<h3>Pandas & NumPy</h3>
• <strong>NumPy</strong> provides fast, memory-efficient array operations - the numerical foundation most Python data tools are built on.<br>
• <strong>Pandas</strong> provides the <code>DataFrame</code> - a labeled, table-like structure (rows and named columns) for loading, filtering, grouping, and transforming data.<br>`,
                                codeExamples: [
                                    `import numpy as np
import pandas as pd

# NumPy - vectorized math, much faster than a plain Python loop
arr = np.array([10, 20, 30, 40])
print(arr.mean())      # 25.0
print(arr * 2)          # [20 40 60 80]

# Pandas - filtering and grouping a DataFrame
df = pd.DataFrame({
    "department": ["IT", "HR", "IT", "HR"],
    "salary": [60000, 50000, 75000, 52000]
})

it_only = df[df["department"] == "IT"]
avg_by_dept = df.groupby("department")["salary"].mean()

print(it_only)
print(avg_by_dept)
# OUTPUT: avg_by_dept -> HR: 51000.0, IT: 67500.0`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'ds-visualization',
                        name: 'Data Visualization',
                        beginner: [
                            {
                                content: `<h3>Visualizing Data</h3>
Visualization turns raw numbers into patterns humans can quickly interpret. <strong>Matplotlib</strong> is Python's foundational plotting library; <strong>Seaborn</strong> builds on it with higher-level, statistically-aware chart types.<br>`,
                                codeExamples: [
                                    `import matplotlib.pyplot as plt
import pandas as pd

df = pd.DataFrame({
    "month": ["Jan", "Feb", "Mar", "Apr"],
    "visitors": [1200, 1500, 1100, 1800]
})

plt.plot(df["month"], df["visitors"], marker="o")
plt.title("Monthly Visitors")
plt.xlabel("Month")
plt.ylabel("Visitors")
plt.show()
# OUTPUT: A line chart showing visitor counts trending across the 4 months`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Correlation Analysis</h4>
Before modeling, data scientists check how features relate to each other and to the target variable using a <strong>correlation matrix</strong> - values close to +1 or -1 indicate strong relationships, values near 0 indicate little to none.<br>`,
                                codeExamples: [
                                    `import pandas as pd

df = pd.DataFrame({
    "hours_studied": [1, 2, 3, 4, 5],
    "exam_score": [50, 55, 65, 70, 80],
    "sleep_hours": [8, 7, 6, 6, 5]
})

correlation_matrix = df.corr()
print(correlation_matrix["exam_score"])
# OUTPUT (approximate):
# hours_studied    0.99   (strong positive correlation)
# exam_score       1.00
# sleep_hours     -0.97   (strong negative correlation)`
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        cheatNotes: [
            'Data Science Lifecycle - Define problem -> Collect -> Clean -> EDA -> Model -> Communicate',
            'EDA (Exploratory Data Analysis) - Summarizing and visualizing data to find patterns',
            'DataFrame - Pandas\' labeled, table-like data structure',
            'Series - A single labeled column/array in Pandas',
            'df.head() / df.describe() - Quick preview and statistical summary of a DataFrame',
            'NaN - Represents a missing value in Pandas/NumPy',
            'fillna() / dropna() - Handle missing values by filling or removing them',
            'drop_duplicates() - Removes duplicate rows from a DataFrame',
            'groupby() - Groups rows by column value(s) for aggregate analysis',
            'NumPy array - Fast, fixed-type, vectorized numeric array',
            'Correlation - Measures the strength of a linear relationship between two variables',
            'Matplotlib - Core Python plotting library',
            'Seaborn - Statistical visualization library built on Matplotlib',
            'Outlier - A data point significantly different from the rest of the dataset',
            'Feature engineering - Creating new input variables to improve model performance',
            'Normalization / Standardization - Rescaling numeric features to a common range',
            'Jupyter Notebook - Interactive environment commonly used for data science work',
        ],
        interviewQuestions: [
            {
                company: 'General Data Science Interview',
                questions: [
                    'What are the typical steps in the data science lifecycle?',
                    'How do you handle missing data in a dataset?',
                    'What is the difference between a Pandas Series and a DataFrame?',
                    'What is correlation, and how is it different from causation?',
                    'What is an outlier, and how would you detect one?',
                    'What is the difference between NumPy arrays and Python lists?',
                    'Why is exploratory data analysis (EDA) important before modeling?',
                    'What is feature engineering, and can you give an example?'
                ]
            }
        ]
    }
];
