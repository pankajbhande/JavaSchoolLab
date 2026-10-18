import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { PredictOutputSection } from './app/components/learn/PredictOutput';

const el = document.createElement('div');
el.id = 'predict-preview';
el.style.cssText = 'position:fixed;inset:0;overflow:auto;background:var(--bg,#fff);z-index:99999;padding:16px';
document.body.appendChild(el);
const topic = new URLSearchParams(location.search).get('t') || 'operators';
createRoot(el).render(createElement('div', { className: 'max-w-3xl mx-auto' }, createElement(PredictOutputSection, { topicId: topic })));
