import type { Course } from './types';
import { mathFoundationsModules } from './mathFoundationsModules';

export const MathFoundationsCourse: Course[] = [
    {
        id: 'math-foundations-cs',
        name: 'Mathematical Foundation for Computer Science',
        icon: 'Sigma',
        subTopics: mathFoundationsModules,
        cheatNotes: [
            'Propositional Logic - Statements combined with AND, OR, NOT, IMPLIES that are true or false',
            'Proof by Induction - Prove a base case, then prove step n implies step n+1',
            'Strong Induction - Assumes the statement holds for ALL smaller cases, not just n-1',
            'Pigeonhole Principle - If n items are placed into fewer than n boxes, some box holds more than one',
            'Inclusion-Exclusion - Counting a union by adding individual sets and subtracting overlaps',
            "Bayes' Theorem - Updates a prior probability using new evidence via P(A|B) = P(B|A)P(A)/P(B)",
            'Joint Probability Distribution - The probability of two or more random variables taking specific values together',
            'Gradient - The vector of partial derivatives, pointing in the direction of steepest increase',
            'Lagrange Multiplier - A technique for optimizing a function subject to equality constraints',
            'Convex Optimization - Optimization where any local minimum is guaranteed to be the global minimum',
            'Determinant - A scalar summarizing a matrix\'s scaling factor and whether it is invertible',
        ],
        interviewQuestions: [
            {
                company: 'General Mathematical Foundations Interview',
                questions: [
                    'What is the difference between proof by induction and proof by contradiction?',
                    'Explain the Pigeonhole Principle with a real example.',
                    'What is the difference between conditional probability and joint probability?',
                    "State Bayes' Theorem and explain each term.",
                    'What does it mean for a matrix to be singular (non-invertible)?',
                    'Why does convex optimization guarantee a global minimum?',
                    'What is a Lagrange multiplier used for?',
                    'How does gradient descent use the gradient to minimize a function?'
                ]
            }
        ]
    }
];
