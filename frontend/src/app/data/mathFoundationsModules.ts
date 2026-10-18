// Mathematical Foundation for Computer Science syllabus - modeled on the IIT Jodhpur
// M.Tech (AI) course outline (Logic & Proofs -> Counting -> Linear Algebra ->
// Probability -> Vector Calculus -> Optimization). Same shape as dsaModules.ts /
// mlModules.ts: full navigation exists from day one, topics start as placeholders and
// get real content filled in incrementally.

import type { Topic, SubTopic } from './types';

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

export const mathFoundationsModules: SubTopic[] = [
    buildModule('mfcs-logic-proofs', 'Logic & Proofs', [
        'Propositional Logic',
        'Rules of Inference',
        'Introduction to Proofs',
        'Proof by Contradiction',
        'Proof by Induction',
        'Strong Induction'
    ]),

    buildModule('mfcs-counting', 'Counting & Combinatorics', [
        'Counting Principles',
        'Pigeonhole Principle',
        'Principle of Inclusion-Exclusion'
    ]),

    buildModule('mfcs-linear-algebra', 'Linear Algebra', [
        'Matrices',
        'Determinants',
        'Systems of Linear Equations'
    ]),

    buildModule('mfcs-probability', 'Probability', [
        'Random Variables',
        'Discrete Probability Distributions',
        'Continuous Probability Distributions',
        'Conditional Probability',
        "Bayes' Theorem",
        'Joint Probability Distributions',
        'Standard Distributions',
        'Chain Rule (Probability)'
    ]),

    buildModule('mfcs-vector-calculus', 'Vector Calculus', [
        'Differentiation of Univariate Functions',
        'Gradients of Matrices',
        'Gradients of Vector-Valued Functions'
    ]),

    buildModule('mfcs-optimization', 'Optimization', [
        'Gradient Descent',
        'Constrained Optimization',
        'Lagrange Multiplier',
        'Convex Optimization'
    ])
];
