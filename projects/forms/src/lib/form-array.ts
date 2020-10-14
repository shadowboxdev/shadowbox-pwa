import { FormArray as AngularFormArray, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  AbstractControlOptions,
  AsyncValidatorFn,
  ValidatorFn,
  FormStatus,
  AbstractControl
} from './models';
import { stream } from './stream';
import { setDisabled, setEnabled } from './utils';

/**
 * @description Provides a type safe FormControl class which accepts a generic type T.
 */
export class FormArray<T> extends AngularFormArray implements AbstractControl<T[]> {
  // public validator!: ValidatorFn<T[]> | null;
  // public asyncValidator!: AsyncValidatorFn<T[]> | null;

  public value!: T[];
  public valueChanges!: Observable<T[]>;

  constructor(
    public controls: AbstractControl<T>[],
    validatorOrOpts?: ValidatorFn<T[]> | ValidatorFn<T[]>[] | AbstractControlOptions<T[]> | null,
    asyncValidator?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  public setValidators(newValidator: ValidatorFn<T[]> | ValidatorFn<T[]>[] | null): void {
    super.setValidators(newValidator);
  }

  public setAsyncValidators(
    newValidator: AsyncValidatorFn<T[]> | AsyncValidatorFn<T[]>[] | null
  ): void {
    super.setAsyncValidators(newValidator);
  }

  public at(index: number): AbstractControl<T> {
    return super.at(index);
  }

  public push(control: AbstractControl<T>): void {
    return super.push(control);
  }

  public insert(index: number, control: AbstractControl<T>): void {
    return super.insert(index, control);
  }

  public setControl(index: number, control: AbstractControl<T>): void {
    return super.setControl(index, control);
  }

  public setValue(value: T[], options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    return super.setValue(value, options);
  }

  public patchValue(value: T[], options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    return super.patchValue(value, options);
  }

  public reset(value?: T[], options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    return super.reset(value, options);
  }

  public getRawValue(): T[] {
    return super.getRawValue();
  }

  public get value$(): Observable<T[]> {
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
