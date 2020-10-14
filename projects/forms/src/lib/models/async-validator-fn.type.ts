import { ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

import { AbstractControl } from './abstract-control.interface';

export type AsyncValidatorFn<T> = (
  ctrl: AbstractControl<T>
) => Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
