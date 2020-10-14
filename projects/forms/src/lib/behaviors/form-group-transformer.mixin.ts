import { isNil, keys, reduce } from 'ramda';

import { FormGroup } from '../form-group';
import { IHasChangeDetectorRef } from '../models';
import { IControlValueAccessor } from './control-value-accessor.mixin';
import { MissingFormControlsError } from './errors';
import {
  formIsFormWithArrayControls,
  FormWithArrayControls
} from './form-with-array-controls.mixin';

// eslint-disable-next-line @typescript-eslint/no-type-alias
type Constructor<T> = new (...args: any[]) => T;

const noop: any = () => {
  // empty method
};

interface IHasFormGroup<TForm> {
  getForm(): FormGroup<TForm>;
  getDefaultValues(): Partial<TForm> | null;
}

export function mixinFormGroupTransformer<
  T extends Constructor<IHasFormGroup<TForm> & IHasChangeDetectorRef & IControlValueAccessor<TForm>>,
  TForm
>(base: T): Constructor<IHasFormGroup<TForm>> & T {
  return class extends base {
    public writeValueWithTransformation(obj: Required<TForm> | null): void {
      const formGroup = this.getForm();

      // @hack see where defining this.formGroup to undefined
      if (!formGroup) return;

      const defaultValues: Partial<TForm> | null = this.getDefaultValues();

      const transformedValue: TForm | null = this.transformToFormGroup(
        obj === undefined ? null : obj,
        defaultValues
      );

      if (isNil(transformedValue)) {
        formGroup.reset(
          // calling `reset` on a form with `null` throws an error but if nothing is passed
          // (undefined) it will reset all the form values to null (as expected)
          defaultValues === null ? undefined : defaultValues,
          { emitEvent: false }
        );
      } else {
        const missingKeys: (keyof TForm)[] = this._getMissingKeys(transformedValue, formGroup);

        if (missingKeys.length) throw new MissingFormControlsError(missingKeys as string[]);

        if (
          formIsFormWithArrayControls<FormWithArrayControls<TForm>, TForm>(
            (this as unknown) as FormWithArrayControls<TForm>
          )
        ) {
          this.handleFormArrayControls(transformedValue);
        }
        const isDisabled: boolean = formGroup.disabled;

        formGroup.setValue(transformedValue, {
          emitEvent: false
        });

        if (isDisabled) formGroup.disable();
      }

      formGroup.markAsPristine();
      formGroup.markAsUntouched();
    }

    public getForm = () => noop;
    public getDefaultValues = (): Partial<TForm> | null => noop;
    public transformToFormGroup(
      obj: TForm | null,
      defaultValues: Partial<TForm> | null
    ): TForm | null {
      return (obj as any) as TForm;
    }
    public handleFormArrayControls = (value: TForm) => noop;

    private _getMissingKeys(transformedValue: TForm | null, formGroup: FormGroup<TForm>) {
      // `controlKeys` can be an empty array, empty forms are allowed
      const missingKeys: (keyof TForm)[] = reduce(
        (keys, key) => {
          if (isNil(transformedValue) || transformedValue[key] === undefined) {
            keys.push(key);
          }

          return keys;
        },
        [] as (keyof TForm)[],
        this._getControlKeys(formGroup)
      );

      return missingKeys;
    }

    private _getControlKeys(formGroup: FormGroup<TForm>): (keyof TForm)[] {
      return keys(formGroup.controls);
    }
  };
}
