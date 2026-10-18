// Lazy loaders for the per-file extras data (one entry per file imported by index.ts). Each entry is
// a dynamic import, so a course downloads only the extras files that hold its own topics.
// Which files belong to which course is recorded in courseLoadMap.ts (npm run gen:course-stats).

import type { Extra } from '../mysql/extras/extra';
import type { Deep } from '../mysql/extras/deep';

export interface ExtrasFile { extras: Record<string, Extra>; deep: Record<string, Deep>; }

export const extrasModules: Record<string, () => Promise<ExtrasFile>> = {
    hibernate: () => import('./hibernate').then(m => ({ extras: m.hibernateExtras, deep: m.hibernateDeep })),
    jdbc: () => import('./jdbc').then(m => ({ extras: m.jdbcExtras, deep: m.jdbcDeep })),
    angular: () => import('./angular').then(m => ({ extras: m.angularExtras, deep: m.angularDeep })),
    javafx: () => import('./javafx').then(m => ({ extras: m.javafxExtras, deep: m.javafxDeep })),
    springcore: () => import('./springcore').then(m => ({ extras: m.springCoreExtras, deep: m.springCoreDeep })),
    javascript1: () => import('./javascript1').then(m => ({ extras: m.javascript1Extras, deep: m.javascript1Deep })),
    javascript2: () => import('./javascript2').then(m => ({ extras: m.javascript2Extras, deep: m.javascript2Deep })),
    react1: () => import('./react1').then(m => ({ extras: m.react1Extras, deep: m.react1Deep })),
    react2: () => import('./react2').then(m => ({ extras: m.react2Extras, deep: m.react2Deep })),
    collection1: () => import('./collection1').then(m => ({ extras: m.collection1Extras, deep: m.collection1Deep })),
    collection2: () => import('./collection2').then(m => ({ extras: m.collection2Extras, deep: m.collection2Deep })),
    java01: () => import('./java01').then(m => ({ extras: m.java01Extras, deep: m.java01Deep })),
    java02: () => import('./java02').then(m => ({ extras: m.java02Extras, deep: m.java02Deep })),
    java03: () => import('./java03').then(m => ({ extras: m.java03Extras, deep: m.java03Deep })),
    java04: () => import('./java04').then(m => ({ extras: m.java04Extras, deep: m.java04Deep })),
    java05: () => import('./java05').then(m => ({ extras: m.java05Extras, deep: m.java05Deep })),
    java06: () => import('./java06').then(m => ({ extras: m.java06Extras, deep: m.java06Deep })),
    java07: () => import('./java07').then(m => ({ extras: m.java07Extras, deep: m.java07Deep })),
    java08: () => import('./java08').then(m => ({ extras: m.java08Extras, deep: m.java08Deep })),
    java09: () => import('./java09').then(m => ({ extras: m.java09Extras, deep: m.java09Deep })),
    java10: () => import('./java10').then(m => ({ extras: m.java10Extras, deep: m.java10Deep })),
    java11: () => import('./java11').then(m => ({ extras: m.java11Extras, deep: m.java11Deep })),
    java12: () => import('./java12').then(m => ({ extras: m.java12Extras, deep: m.java12Deep })),
    jvm1: () => import('./jvm1').then(m => ({ extras: m.jvm1Extras, deep: m.jvm1Deep })),
    jvm2: () => import('./jvm2').then(m => ({ extras: m.jvm2Extras, deep: m.jvm2Deep })),
    jvm3: () => import('./jvm3').then(m => ({ extras: m.jvm3Extras, deep: m.jvm3Deep })),
    jvm4: () => import('./jvm4').then(m => ({ extras: m.jvm4Extras, deep: m.jvm4Deep })),
    jvm5: () => import('./jvm5').then(m => ({ extras: m.jvm5Extras, deep: m.jvm5Deep })),
    jvm6: () => import('./jvm6').then(m => ({ extras: m.jvm6Extras, deep: m.jvm6Deep })),
    jsp1: () => import('./jsp1').then(m => ({ extras: m.jsp1Extras, deep: m.jsp1Deep })),
    jsp2: () => import('./jsp2').then(m => ({ extras: m.jsp2Extras, deep: m.jsp2Deep })),
    jsp3: () => import('./jsp3').then(m => ({ extras: m.jsp3Extras, deep: m.jsp3Deep })),
    jsp4: () => import('./jsp4').then(m => ({ extras: m.jsp4Extras, deep: m.jsp4Deep })),
    jsp5: () => import('./jsp5').then(m => ({ extras: m.jsp5Extras, deep: m.jsp5Deep })),
    jsp6: () => import('./jsp6').then(m => ({ extras: m.jsp6Extras, deep: m.jsp6Deep })),
    jsp7: () => import('./jsp7').then(m => ({ extras: m.jsp7Extras, deep: m.jsp7Deep })),
    springAll: () => import('./springAll').then(m => ({ extras: m.springExtras, deep: m.springDeep })),
};
