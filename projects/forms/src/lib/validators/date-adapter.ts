import * as _moment from 'moment';
import { Moment, MomentFormatSpecification, MomentInput } from 'moment';
import { isDate, isString } from 'ramda-adjunct';

const moment = _moment;

export const MIN_DATE = moment(new Date('1/1/1753'));
export const MAX_DATE = moment(new Date('12/31/9999'));

export class TsvDateAdapter {
  private get _maxDate(): Moment {
    return MAX_DATE;
  }

  private get _minDate(): Moment {
    return MIN_DATE;
  }

  private _locale: string;

  constructor() {
    this.setLocale();
  }

  public setLocale(locale: string = 'en'): void {
    this._locale = locale;
  }

  public clone(date: Moment): Moment {
    return date.clone().locale(this._locale);
  }

  public createDate(year: number, month: number, date: number): Moment {
    // Moment.js will create an invalid date if any of the components are out of bounds, but we
    // explicitly check each case so we can throw more descriptive errors.
    if (month < 0 || month > 11) {
      throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
    }

    if (date < 1) {
      throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    }

    const result = this._createMoment({ year, month, date }).locale(this._locale);

    // If the result isn't valid, the date must have been out of bounds for this month.
    if (!result.isValid()) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return result;
  }

  public parse(value: any, parseFormat?: string | string[]): Moment | null {
    if (value && isString(value)) {
      return this._createMoment(value, parseFormat, this._locale);
    }

    return value ? this._createMoment(value).locale(this._locale) : null;
  }

  public deserialize(value: any): Moment | null {
    let date: Moment;

    if (isDate(value)) {
      date = this._createMoment(value).locale(this._locale);
    } else if (this._isDateInstance(value)) {
      // Note: assumes that cloning also sets the correct locale.
      return this.clone(value);
    }

    if (isString(value)) {
      if (!value) return null;

      date = this._createMoment(value, moment.ISO_8601).locale(this._locale);
    }

    if (date && this.isValid(date)) {
      return this._createMoment(date).locale(this._locale);
    }

    if (value == null || (this._isDateInstance(value) && this.isValid(value))) {
      return value;
    }

    return moment.invalid();
  }

  public isValid(date: Moment): boolean {
    return this.clone(date).isValid();
  }

  public isBefore(refDate: any, toCheck: any): boolean {
    refDate = this.deserialize(refDate);
    toCheck = this.deserialize(toCheck);

    return this._compareDate(refDate, toCheck) >= 0;
  }

  public isAfter(refDate: any, toCheck: any): boolean {
    refDate = this.deserialize(refDate);
    toCheck = this.deserialize(toCheck);

    return this._compareDate(refDate, toCheck) <= 0;
  }

  public validMinDate(value: any, min: Moment = this._minDate): boolean {
    const controlValue = this._getValidDateOrNull(this.deserialize(value));

    return !min || !controlValue || this._compareDate(min, controlValue) <= 0;
  }

  /** The form control validator for the max date. */
  public validMaxDate(value: any, max: Moment = this._maxDate): boolean {
    const controlValue = this._getValidDateOrNull(this.deserialize(value));

    return !max || !controlValue || this._compareDate(max, controlValue) >= 0;
  }

  private _isDateInstance(obj: any): boolean {
    return moment.isMoment(obj);
  }

  private _getValidDateOrNull(obj: unknown): Moment | null {
    const date = obj as Moment;

    return this._isDateInstance(date) && this.isValid(date) ? date : null;
  }

  private _compareDate(first: Moment, second: Moment): number {
    return (
      this._getYear(first) - this._getYear(second) ||
      this._getMonth(first) - this._getMonth(second) ||
      this._getDate(first) - this._getDate(second)
    );
  }

  private _getYear(date: Moment): number {
    return this.clone(date).year();
  }

  private _getMonth(date: Moment): number {
    return this.clone(date).month();
  }

  private _getDate(date: Moment): number {
    return this.clone(date).date();
  }

  /** Creates a Moment instance while respecting the current UTC settings. */
  private _createMoment(
    date: MomentInput,
    format?: MomentFormatSpecification,
    locale?: string
  ): Moment {
    return moment(date, format, locale, false);
  }
}
