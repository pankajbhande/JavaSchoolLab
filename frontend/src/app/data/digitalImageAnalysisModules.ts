// Digital Image Analysis syllabus - modeled on the IIT Jodhpur M.Tech course outline
// (Digital Image Fundamentals -> Image Transforms -> Image Enhancement -> Color Image
// Processing -> Image Compression -> Morphology -> Segmentation -> Feature Detection).
// Same shape as dsaModules.ts / mlModules.ts: full navigation exists from day one, with
// topics starting as placeholders and getting real content filled in incrementally.

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

export const digitalImageAnalysisModules: SubTopic[] = [
    buildModule('dia-fundamentals', 'Digital Image Fundamentals', [
        'Image Modeling',
        'Sampling and Quantization',
        'Imaging Geometry',
        'Digital Geometry',
        'Image Acquisition Systems',
        'Types of Digital Images'
    ]),

    buildModule('dia-image-transforms', 'Image Transforms', [
        'Spatial Domain Transforms',
        'Frequency Domain Transforms',
        '2D Discrete Fourier Transform (DFT)',
        'Discrete Cosine Transform (DCT)',
        'Walsh-Hadamard Transform',
        'Wavelet Transform',
        'Karhunen-Loeve Transform',
        'Z-Transform'
    ]),

    buildModule('dia-image-enhancement', 'Image Enhancement', [
        'Point Processing',
        'Interpolation',
        'Enhancement in Spatial Domain',
        'Histogram Equalization',
        'Spatial Filtering',
        'Enhancement in Frequency Domain',
        'Frequency Domain Filtering'
    ]),

    buildModule('dia-color-processing', 'Color Image Processing', [
        'Color Representation',
        'Laws of Color Matching',
        'Chromaticity Diagram',
        'Color Enhancement',
        'Color Image Segmentation',
        'Color Edge Detection'
    ]),

    buildModule('dia-image-compression', 'Image Compression', [
        'Lossy Compression',
        'Lossless Compression',
        'Prediction-Based Compression',
        'Vector Quantization',
        'Sub-Band Encoding',
        'JPEG Compression Standard'
    ]),

    buildModule('dia-morphology', 'Morphology', [
        'Dilation',
        'Erosion',
        'Opening',
        'Closing',
        'Hit-or-Miss Transform',
        'Thinning',
        'Grayscale Morphology',
        'Euler Number'
    ]),

    buildModule('dia-segmentation', 'Segmentation', [
        'Thresholding',
        'Edge-Based Segmentation',
        'Region-Based Segmentation',
        'Segmentation of Grey Level Images',
        'Watershed Algorithm'
    ]),

    buildModule('dia-feature-detection', 'Feature Detection', [
        'Fourier Descriptors',
        'Shape Features',
        'Object Matching / Feature Matching'
    ])
];
