import { AbstractControlOptions as AngularAbstractControlOptions } from '@angular/forms';

import { AsyncValidatorFn } from './async-validator-fn.type';
import { ValidatorFn } from './validator-fn.type';

export interface AbstractControlOptions<T> extends AngularAbstractControlOptions {
  validators?: ValidatorFn<T> | ValidatorFn<T>[] | null;
  asyncValidators?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null;
}
