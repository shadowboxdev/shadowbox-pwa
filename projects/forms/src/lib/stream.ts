import { AbstractControl, ValidationErrors } from '@angular/forms';
import { defer, merge, Observable, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { FormStatus } from './models';
import { mapToOpposite } from './operators/map-to-opposite.operator';

export interface IFormControlStream {
  abstractControlDirty$(ctrl: AbstractControl): Observable<boolean>;
  abstractControlDisabled$(ctrl: AbstractControl): Observable<boolean>;
  formControlEnabled$(ctrl: AbstractControl): Observable<boolean>;
  formControlError$(ctrl: AbstractControl): Observable<ValidationErrors | null>;
  formControlInvalid$(ctrl: AbstractControl): Observable<boolean>;
  formControlPristine$(ctrl: AbstractControl): Observable<boolean>;
  formControlStatus$(ctrl: AbstractControl): Observable<FormStatus>;
  formControlValid$(ctrl: AbstractControl): Observable<boolean>;
  formControlValue$<T>(ctrl: AbstractControl): Observable<T>;
}

export const stream: IFormControlStream = new (class {
  public abstractControlDirty$(ctrl: AbstractControl): Observable<boolean> {
    return this.formControlPristine$(ctrl).pipe(mapToOpposite());
  }

  public abstractControlDisabled$(ctrl: AbstractControl): Observable<boolean> {
    return this.formControlEnabled$(ctrl).pipe(mapToOpposite());
  }

  public formControlEnabled$(ctrl: AbstractControl): Observable<boolean> {
    return merge(
      defer(() => of(ctrl.enabled)),
      ctrl.statusChanges.pipe(
        map(() => ctrl.enabled),
        distinctUntilChanged()
      )
    );
  }

  public formControlError$(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    return merge(
      defer(() => of(ctrl.errors)),
      ctrl.valueChanges.pipe(
        map(() => ctrl.errors),
        distinctUntilChanged()
      )
    );
  }

  public formControlInvalid$(ctrl: AbstractControl): Observable<boolean> {
    return this.formControlValid$(ctrl).pipe(mapToOpposite());
  }

  public formControlPristine$(ctrl: AbstractControl): Observable<boolean> {
    return merge(
      defer(() => of(ctrl.valid)),
      ctrl.valueChanges.pipe(
        map(() => ctrl.pristine),
        distinctUntilChanged()
      )
    );
  }

  public formControlStatus$(ctrl: AbstractControl): Observable<FormStatus> {
    return merge(
      defer(() => of(ctrl.status as FormStatus)),
      ctrl.statusChanges.pipe(map(() => ctrl.status as FormStatus))
    );
  }

  public formControlValid$(ctrl: AbstractControl): Observable<boolean> {
    return merge(
      defer(() => of(ctrl.valid)),
      ctrl.statusChanges.pipe(
        map(() => ctrl.valid),
        distinctUntilChanged()
      )
    );
  }

  public formControlValue$<T>(ctrl: AbstractControl): Observable<T> {
    return merge(
      defer(() => of(ctrl.value)),
      ctrl.valueChanges
    );
  }
})();
