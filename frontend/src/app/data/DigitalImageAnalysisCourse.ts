import type { Course } from './types';
import { digitalImageAnalysisModules } from './digitalImageAnalysisModules';

export const DigitalImageAnalysisCourse: Course[] = [
    {
        id: 'digital-image-analysis',
        name: 'Digital Image Analysis',
        icon: 'Image',
        subTopics: digitalImageAnalysisModules,
        cheatNotes: [
            'Sampling - Converting a continuous image into a discrete grid of pixels',
            'Quantization - Mapping continuous pixel intensity into a finite set of discrete levels',
            'Spatial Domain - Processing pixels directly by their (x, y) position and value',
            'Frequency Domain - Processing an image via its Fourier/DCT transform coefficients',
            'Point Processing - A pixel-wise operation depending only on that pixel\'s own value',
            'Histogram Equalization - Redistributing intensity values to spread contrast across the full range',
            'Dilation - A morphological operation that grows/thickens bright regions',
            'Erosion - A morphological operation that shrinks/thins bright regions',
            'Opening - Erosion followed by dilation, removes small bright noise while preserving shape',
            'Closing - Dilation followed by erosion, fills small dark holes while preserving shape',
            'Segmentation - Partitioning an image into meaningful regions/objects',
            'Watershed Algorithm - Treats intensity as topography and floods it to find region boundaries',
            'JPEG - A lossy compression standard using block-based DCT and quantization',
            'Fourier Descriptors - Shape boundary encoded compactly via Fourier coefficients',
        ],
        interviewQuestions: [
            {
                company: 'General Digital Image Processing Interview',
                questions: [
                    'What is the difference between sampling and quantization?',
                    'Why is the Discrete Cosine Transform (DCT) preferred over the DFT for JPEG compression?',
                    'What is the difference between spatial domain and frequency domain image processing?',
                    'Explain histogram equalization and what problem it solves.',
                    'What is the difference between erosion and dilation in morphology?',
                    'How does the Watershed algorithm segment an image?',
                    'What is the difference between lossy and lossless image compression?',
                    'What are Fourier descriptors used for in shape analysis?',
                    'Why is color represented differently for display (RGB) versus print (CMYK)?',
                    'What is the Pigeonhole Principle, and how is it used in a computer science proof?'
                ]
            }
        ]
    }
];
