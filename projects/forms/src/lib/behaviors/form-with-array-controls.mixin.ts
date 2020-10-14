import { isArray, isFunction } from 'ramda-adjunct';

import { FormArray } from '../form-array';
import { FormControl } from '../form-control';
import { FormGroup } from '../form-group';
import { IControlValueAccessor } from './control-value-accessor.mixin';

// eslint-disable-next-line @typescript-eslint/no-type-alias
type Constructor<T> = new (...args: any[]) => T;

const noop: any = () => {
  // empty method
};

interface IHasFormGroup<TForm> {
  getForm(): FormGroup<TForm>;
  getDefaultValues(): Partial<TForm> | null;
}

export type KeysWithType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
export type ArrayPropertyKey<T> = KeysWithType<T, Array<any>>;
export type ArrayPropertyValue<
  T,
  K extends ArrayPropertyKey<T> = ArrayPropertyKey<T>
> = T[K] extends Array<infer U> ? U : never;

// Unfortunately due to https://github.com/microsoft/TypeScript/issues/13995#issuecomment-504664533 the initial value
// cannot be fully type narrowed to the exact type that will be passed.
export interface FormWithArrayControls<TForm> extends IHasFormGroup<TForm> {
  createFormArrayControl(
    key: ArrayPropertyKey<TForm>,
    value: ArrayPropertyValue<TForm>
  ): FormControl<TForm>;
}

export function mixinFormWithArrayControls<
  T extends Constructor<FormWithArrayControls<TForm> & IControlValueAccessor<TForm>>,
  TForm
>(base: T): Constructor<FormWithArrayControls<TForm>> & T {
  return class extends base {
    public getForm = () => noop;
    public getDefaultValues = (): Partial<TForm> | null => noop;

    public handleFormArrayControls(obj: TForm): void {
      const formGroup: FormGroup<TForm> = this.getForm();

      if (!formGroup) return;

      Object.entries(obj).forEach(([key, value]) => {
        if (formGroup.get(key) instanceof FormArray && isArray(value)) {
          const formArray: FormArray<TForm> = formGroup.get(key) as FormArray<TForm>;

          // instead of creating a new array every time and push a new FormControl
          // we just remove or add what is necessary so that:
          // - it is as efficient as possible and do not create unnecessary FormControl every time
          // - validators are not destroyed/created again and eventually fire again for no reason
          while (formArray.length > value.length) {
            formArray.removeAt(formArray.length - 1);
          }

          for (let i = formArray.length; i < value.length; i++) {
            if (formIsFormWithArrayControls<FormWithArrayControls<TForm>, TForm>(this)) {
              formArray.insert(
                i,
                this.createFormArrayControl(key as ArrayPropertyKey<TForm>, value[i])
              );
            } else {
              formArray.insert(i, new FormControl<TForm>(value[i]));
            }
          }
        }
      });
    }
  };
}

export function formIsFormWithArrayControls<T extends FormWithArrayControls<TForm>, TForm>(
  ctor: T
): ctor is FormWithArrayControls<TForm> & T {
  return isFunction(((ctor as unknown) as FormWithArrayControls<TForm>).createFormArrayControl);
}
