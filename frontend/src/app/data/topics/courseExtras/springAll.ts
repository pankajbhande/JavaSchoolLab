// Aggregates every Spring MVC / Spring Boot extras batch (smvcNN.ts, sbootNN.ts) into two maps.
import type { Extra } from '../mysql/extras/extra';
import type { Deep } from '../mysql/extras/deep';
import { smvc01Extras, smvc01Deep } from './smvc01';
import { smvc02Extras, smvc02Deep } from './smvc02';
import { smvc03Extras, smvc03Deep } from './smvc03';
import { smvc04Extras, smvc04Deep } from './smvc04';
import { smvc05Extras, smvc05Deep } from './smvc05';
import { smvc06Extras, smvc06Deep } from './smvc06';
import { smvc07Extras, smvc07Deep } from './smvc07';
import { smvc08Extras, smvc08Deep } from './smvc08';
import { smvc09Extras, smvc09Deep } from './smvc09';
import { smvc11Extras, smvc11Deep } from './smvc11';
import { smvc12Extras, smvc12Deep } from './smvc12';
import { smvc10Extras, smvc10Deep } from './smvc10';
import { smvc13Extras, smvc13Deep } from './smvc13';
import { smvc14Extras, smvc14Deep } from './smvc14';
import { smvc19Extras, smvc19Deep } from './smvc19';
import { smvc15Extras, smvc15Deep } from './smvc15';
import { smvc16Extras, smvc16Deep } from './smvc16';
import { smvc17Extras, smvc17Deep } from './smvc17';
import { smvc18Extras, smvc18Deep } from './smvc18';
import { smvc20Extras, smvc20Deep } from './smvc20';
import { smvc21Extras, smvc21Deep } from './smvc21';
import { smvc22Extras, smvc22Deep } from './smvc22';
import { smvc23Extras, smvc23Deep } from './smvc23';
import { smvc26Extras, smvc26Deep } from './smvc26';
import { smvc27Extras, smvc27Deep } from './smvc27';
import { smvc28Extras, smvc28Deep } from './smvc28';
import { smvc24Extras, smvc24Deep } from './smvc24';
import { smvc25Extras, smvc25Deep } from './smvc25';
import { smvc29Extras, smvc29Deep } from './smvc29';
import { smvc30Extras, smvc30Deep } from './smvc30';
import { smvc31Extras, smvc31Deep } from './smvc31';
import { smvc32Extras, smvc32Deep } from './smvc32';
import { smvc34Extras, smvc34Deep } from './smvc34';
import { smvc35Extras, smvc35Deep } from './smvc35';
import { smvc36Extras, smvc36Deep } from './smvc36';
import { smvc37Extras, smvc37Deep } from './smvc37';
import { smvc39Extras, smvc39Deep } from './smvc39';
import { smvc40Extras, smvc40Deep } from './smvc40';

export const springExtras: Record<string, Extra> = Object.assign(
    {},
    smvc01Extras,
    smvc02Extras,
    smvc03Extras,
    smvc04Extras,
    smvc05Extras,
    smvc06Extras,
    smvc07Extras,
    smvc08Extras,
    smvc09Extras,
    smvc11Extras,
    smvc12Extras,
    smvc10Extras,
    smvc13Extras,
    smvc14Extras,
    smvc19Extras,
    smvc15Extras,
    smvc16Extras,
    smvc17Extras,
    smvc18Extras,
    smvc20Extras,
    smvc21Extras,
    smvc22Extras,
    smvc23Extras,
    smvc26Extras,
    smvc27Extras,
    smvc28Extras,
    smvc24Extras,
    smvc25Extras,
    smvc29Extras,
    smvc30Extras,
    smvc31Extras,
    smvc32Extras,
    smvc34Extras,
    smvc35Extras,
    smvc36Extras,
    smvc37Extras,
    smvc39Extras,
    smvc40Extras
);

export const springDeep: Record<string, Deep> = Object.assign(
    {},
    smvc01Deep,
    smvc02Deep,
    smvc03Deep,
    smvc04Deep,
    smvc05Deep,
    smvc06Deep,
    smvc07Deep,
    smvc08Deep,
    smvc09Deep,
    smvc11Deep,
    smvc12Deep,
    smvc10Deep,
    smvc13Deep,
    smvc14Deep,
    smvc19Deep,
    smvc15Deep,
    smvc16Deep,
    smvc17Deep,
    smvc18Deep,
    smvc20Deep,
    smvc21Deep,
    smvc22Deep,
    smvc23Deep,
    smvc26Deep,
    smvc27Deep,
    smvc28Deep,
    smvc24Deep,
    smvc25Deep,
    smvc29Deep,
    smvc30Deep,
    smvc31Deep,
    smvc32Deep,
    smvc34Deep,
    smvc35Deep,
    smvc36Deep,
    smvc37Deep,
    smvc39Deep,
    smvc40Deep
);
