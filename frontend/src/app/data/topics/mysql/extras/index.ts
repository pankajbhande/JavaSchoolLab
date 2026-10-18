import type { Extra } from './extra';
import { e01 } from './e01';
import { e02 } from './e02';
import { e03 } from './e03';
import { e04 } from './e04';
import { e05 } from './e05';
import { e06 } from './e06';
import { e07 } from './e07';
import { e08 } from './e08';
import { e09 } from './e09';
import { e10 } from './e10';
import { e11 } from './e11';
import { e12 } from './e12';
import { e13 } from './e13';
import { e14 } from './e14';

// Explicit imports (not import.meta.glob) so Node-based scripts can load this too.
// Add a new extras file here when you create one.
export const mysqlExtras: Record<string, Extra> = Object.assign(
    {},
    e01,
    e02,
    e03,
    e04,
    e05,
    e06,
    e07,
    e08,
    e09,
    e10,
    e11,
    e12,
    e13,
    e14
);
