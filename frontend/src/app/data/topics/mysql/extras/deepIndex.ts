import type { Deep } from './deep';
import { d01 } from './deepdata/d01';
import { d02 } from './deepdata/d02';
import { d03 } from './deepdata/d03';
import { d04 } from './deepdata/d04';
import { d05 } from './deepdata/d05';
import { d06 } from './deepdata/d06';
import { d07 } from './deepdata/d07';
import { d08 } from './deepdata/d08';
import { d09 } from './deepdata/d09';
import { d10 } from './deepdata/d10';
import { d11 } from './deepdata/d11';
import { d12 } from './deepdata/d12';
import { d13 } from './deepdata/d13';
import { d14 } from './deepdata/d14';
import { d15 } from './deepdata/d15';
import { d16 } from './deepdata/d16';
import { d17 } from './deepdata/d17';

// Explicit imports (not import.meta.glob) so Node-based scripts can load this too.
// Add a new deep-dive file here when you create one.
export const mysqlDeep: Record<string, Deep> = Object.assign(
    {},
    d01,
    d02,
    d03,
    d04,
    d05,
    d06,
    d07,
    d08,
    d09,
    d10,
    d11,
    d12,
    d13,
    d14,
    d15,
    d16,
    d17
);
