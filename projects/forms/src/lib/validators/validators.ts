import { Validators, ValidationErrors } from '@angular/forms';
import { isNil } from 'ramda';
import { AbstractControl, ValidatorFn } from '../models';

import { TsvDateAdapter } from './date-adapter';

export interface DateRangeError {
  dateRange: boolean;
}

export interface DateError {
  invalidDate: boolean;
}

export interface IDateRangeValidatorOptions {
  startCtrlName: string;
  endCtrlName: string;
}

const DATE_RANGE_ERROR: DateRangeError = { dateRange: true };
const INVALID_DATE_ERROR: DateError = { invalidDate: true };

const DEFAULT_DATE_RANGE_OPTS: IDateRangeValidatorOptions = {
  startCtrlName: 'start',
  endCtrlName: 'end'
};

/** @important
 * The logic in this validator that calls `control.setErrors` is an anti pattern and is slated to be addressed in
 * Tech Debt User Story 31417.
 * We started to address it in PR 5741 however it caused regression in functionality for Scope.
 * Please do not copy this pattern to use elsewhere
 */

export const tsvValidators = new (class {
  private static _dateAdapter = new TsvDateAdapter();

  public static gt<T>(value: number): ValidatorFn<T> {
    return (control: AbstractControl<T>): ValidationErrors => {
      if (isNil(value) || isNil(Validators.required(control))) return null;

      const v: number = +control.value;
      return v > +value ? null : { gt: { value: value } };
    };
  }

  public static min(minValue: number | Date): ValidatorFn<number| Date> {
    const validatorFn = function (c: AbstractControl<number>): ValidationErrors {
      if (!!Validators.required(c) || (!minValue && minValue !== 0)) {
        return undefined;
      }
      const v: number | Date = c.value;

      return v < minValue ? { min: { minValue: minValue, actualValue: v } } : undefined;
    };

    return validatorFn;
  }

  public static max(maxValue: number | Date): ValidatorFn<number | Date> {
    const validatorFn = function (c: AbstractControl<number | Date>): ValidationErrors {
      if (!!Validators.required(c) || (!maxValue && maxValue !== 0)) {
        return undefined;
      }
      const v: number | Date = c.value;

      return v > maxValue ? { max: { maxValue: maxValue, actualValue: v } } : undefined;
    };

    return validatorFn;
  }

  public static numberRequired<T>(c: AbstractControl<T>): ValidationErrors {
    return Number.isNaN(c.value) ? { required: true } : undefined;
  }

  public static dateRange<T>(opts: IDateRangeValidatorOptions = DEFAULT_DATE_RANGE_OPTS): ValidatorFn<T> {
    const validatorFn = function (ctrl: AbstractControl<T>): DateRangeError | null {
      const adapter = this._dateAdapter;

      const startCtrl = ctrl.get(opts.startCtrlName);
      const endCtrl = ctrl.get(opts.endCtrlName);

      if (!startCtrl || !endCtrl) return null;

      const dateValidator = this.date();
      const startDateValid = isNil(dateValidator(startCtrl));
      const endDateValid = isNil(dateValidator(endCtrl));

      const startDate: Date = startCtrl.value;
      const endDate: Date = endCtrl.value;

      if (!startDate || !endDate || !startDateValid || !endDateValid) return null;

      if (adapter.isBefore(startDate, endDate)) {
        return DATE_RANGE_ERROR;
      }

      return null;
    };

    return validatorFn;
  }

  public static date<T>(formatOptions?: string | string[]): ValidatorFn<T> {
    const validatorFn = function (ctrl: AbstractControl<T>): DateError | null {
      const adapter = this._dateAdapter;

      if (ctrl?.value) {
        const date = adapter.parse(ctrl.value, formatOptions);

        if (!adapter.isValid(date) || !adapter.validMinDate(date) || !adapter.validMaxDate(date)) {
          return INVALID_DATE_ERROR;
        }
      }

      return null;
    };

    return validatorFn;
  }
})();
