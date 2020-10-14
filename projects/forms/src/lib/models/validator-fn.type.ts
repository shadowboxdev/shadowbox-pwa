import { ValidationErrors } from '@angular/forms';

import { AbstractControl } from './abstract-control.interface';

export type ValidatorFn<T> = (ctrl: AbstractControl<T>) => ValidationErrors | null;
