import { FormControl as AngularFormControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  FormStatus,
  AbstractControlOptions,
  AsyncValidatorFn,
  ValidatorFn,
  AbstractControl
} from './models';
import { stream } from './stream';
import { setDisabled, setEnabled } from './utils';

/**
 * @description Provides a type safe FormControl class which accepts a generic type T.
 */
export class FormControl<T> extends AngularFormControl implements AbstractControl<T> {
  // public validator!: ValidatorFn<T> | null;
  // public asyncValidator!: AsyncValidatorFn<T> | null;

  public value!: T;
  public valueChanges!: Observable<T>;

  constructor(
    formState?: T,
    validatorOrOpts?: ValidatorFn<T> | ValidatorFn<T>[] | AbstractControlOptions<T> | null,
    asyncValidator?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null
  ) {
    super(formState, validatorOrOpts, asyncValidator);
  }

  public setValidators(newValidator: ValidatorFn<T> | ValidatorFn<T>[] | null): void {
    super.setValidators(newValidator);
  }

  public setAsyncValidators(
    newValidator: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null
  ): void {
    super.setAsyncValidators(newValidator);
  }

  public setValue(
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ): void {
    super.setValue(value, options);
  }

  public patchValue(
    value: Partial<T>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ): void {
    super.patchValue(value, options);
  }

  public reset(formState?: T, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.reset(formState, options);
  }

  public get value$(): Observable<T> {
    return stream.formControlValue$(this);
  }

  public get error$(): Observable<ValidationErrors | null> {
    return stream.formControlError$(this);
  }

  public get enabled$(): Observable<boolean> {
    return stream.formControlEnabled$(this);
  }

  public get pristine$(): Observable<boolean> {
    return stream.formControlPristine$(this);
  }

  public get valid$(): Observable<boolean> {
    return stream.formControlValid$(this);
  }

  public get status$(): Observable<FormStatus> {
    return stream.formControlStatus$(this);
  }

  public get disabled$(): Observable<boolean> {
    return stream.abstractControlDisabled$(this);
  }

  public get dirty$(): Observable<boolean> {
    return stream.abstractControlDirty$(this);
  }

  public get invalid$(): Observable<boolean> {
    return stream.formControlInvalid$(this);
  }

  public setEnabled(enabled: boolean = true): void {
    setEnabled(this, enabled);
  }

  public setDisabled(disabled: boolean = true): void {
    setDisabled(this, disabled);
  }
}
