import * as _moment from 'moment';
import { Moment } from 'moment';

import { TsvDateAdapter } from './date-adapter';

const moment = _moment;

const JAN = 0;
const DEC = 11;
const FEB = 1;

describe('TsvDateAdapter', () => {
  let adapter: TsvDateAdapter;

  beforeEach(() => {
    adapter = new TsvDateAdapter();
  });

  const assertValidDate = (date: Moment | null, valid: boolean) => {
    expect(adapter['_isDateInstance'](date)).not.toBeNull(`Expected ${date} to be a date instance`);
    expect(adapter.isValid(date)).toBe(
      valid,
      `Expected ${date} to be ${valid ? 'valid' : 'invalid'},` +
        ` but was ${valid ? 'invalid' : 'valid'}`
    );
  };

  it('should get year', () => {
    expect(adapter['_getYear'](moment([2017, JAN, 1]))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter['_getMonth'](moment([2017, JAN, 1]))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter['_getDate'](moment([2017, JAN, 1]))).toBe(1);
  });

  it('should create Moment date', () => {
    expect(adapter.createDate(2017, JAN, 1).format()).toEqual(moment([2017, JAN, 1]).format());
  });

  it('should not create Moment date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, DEC + 1, 1)).toThrow();
    expect(() => adapter.createDate(2017, JAN - 1, 1)).toThrow();
  });

  it('should not create Moment date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it('should create Moment date with low year number', () => {
    expect(adapter.createDate(-1, JAN, 1).year()).toBe(-1);
    expect(adapter.createDate(0, JAN, 1).year()).toBe(0);
    expect(adapter.createDate(50, JAN, 1).year()).toBe(50);
    expect(adapter.createDate(99, JAN, 1).year()).toBe(99);
    expect(adapter.createDate(100, JAN, 1).year()).toBe(100);
  });

  it('should not create Moment date in utc format', () => {
    expect(adapter.createDate(2017, JAN, 5).isUTC()).toEqual(false);
  });

  it('should parse string according to given format', () => {
    expect(adapter.parse('1/2/2017', 'MM/DD/YYYY').format()).toEqual(
      moment([2017, JAN, 2]).format()
    );
    expect(adapter.parse('1/2/2017', 'DD/MM/YYYY').format()).toEqual(
      moment([2017, FEB, 1]).format()
    );
  });

  it('should parse string formatted `MM/DD/YYY` w/o specified format', () => {
    expect(adapter.parse('1/2/2017').format()).toEqual(moment([2017, JAN, 2]).format());
  });

  it('should parse string formatted UTC w/o specified format', () => {
    expect(adapter.parse('2017-01-02T06:00:00.000Z').utc().format()).toEqual(
      moment.utc([2017, JAN, 2, 6]).format()
    );
  });

  it('should parse number', () => {
    const timestamp = new Date().getTime();
    expect(adapter.parse(timestamp, 'MM/DD/YYYY').format()).toEqual(moment(timestamp).format());
  });

  it('should parse Date', () => {
    const date = new Date(2017, JAN, 1);
    expect(adapter.parse(date, 'MM/DD/YYYY').format()).toEqual(moment(date).format());
  });

  it('should parse Moment date', () => {
    const date = moment([2017, JAN, 1]);
    const parsedDate = adapter.parse(date, 'MM/DD/YYYY');
    expect(parsedDate.format()).toEqual(date.format());
    expect(parsedDate).not.toBe(date);
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', 'MM/DD/YYYY')).toBeNull();
  });

  it('should parse invalid value as invalid', () => {
    const d = adapter.parse('hello', 'MM/DD/YYYY');
    expect(d).not.toBeNull();
    expect(adapter['_isDateInstance'](d)).toBe(
      true,
      'Expected string to have been fed through Date.parse'
    );
    expect(adapter.isValid(d as Moment)).toBe(false, 'Expected to parse as "invalid date" object');
  });

  it('should clone', () => {
    const date = moment([2017, JAN, 1]);
    expect(adapter.clone(date).format()).toEqual(date.format());
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should compare dates', () => {
    let refDate = moment([2017, JAN, 1]);
    let toCheck = moment([2017, JAN, 2]);

    expect(adapter['_compareDate'](refDate, toCheck)).toBeLessThan(0);

    toCheck = moment([2018, JAN, 1]);
    expect(adapter['_compareDate'](refDate, toCheck)).toBeLessThan(0);

    toCheck = moment([2017, FEB, 1]);
    expect(adapter['_compareDate'](refDate, toCheck)).toBeLessThan(0);

    refDate = moment([2018, JAN, 1]);
    toCheck = moment([2017, JAN, 1]);
    expect(adapter['_compareDate'](refDate, toCheck)).toBeGreaterThan(0);

    refDate = moment([2017, JAN, 1]);
    expect(adapter['_compareDate'](refDate, toCheck)).toBe(0);

    refDate = moment([2017, FEB, 1]);
    toCheck = moment([2017, JAN, 1]);
    expect(adapter['_compareDate'](refDate, toCheck)).toBeGreaterThan(0);

    refDate = moment([2017, JAN, 2]);
    expect(adapter['_compareDate'](refDate, toCheck)).toBeGreaterThan(0);
  });

  it('should count today as a valid date instance', () => {
    const date = moment();

    expect(adapter.isValid(date)).toBe(true);
    expect(adapter['_isDateInstance'](date)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    const date = moment(NaN);

    expect(adapter.isValid(date)).toBe(false);
    expect(adapter['_isDateInstance'](date)).toBe(true);
  });

  it('should count a string as not a date instance', () => {
    const date = '1/1/2017';

    expect(adapter['_isDateInstance'](date)).toBe(false);
  });

  it('should count a Date as not a date instance', () => {
    const date = new Date();

    expect(adapter['_isDateInstance'](date)).toBe(false);
  });

  it('should provide a method to return a valid date or null', () => {
    const date = moment();

    expect(adapter['_getValidDateOrNull'](date)).toBe(date);
    expect(adapter['_getValidDateOrNull'](moment(NaN))).toBeNull();
  });

  it('should create valid dates from valid ISO strings', () => {
    assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
    assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
    assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
    assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
    assertValidDate(adapter.deserialize('1/1/2017'), false);

    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();

    assertValidDate(adapter.deserialize(new Date()), true);
    assertValidDate(adapter.deserialize(new Date(NaN)), false);
    assertValidDate(adapter.deserialize(moment()), true);
    assertValidDate(adapter.deserialize(moment.invalid()), false);
  });

  it('should clone the date when deserializing a Moment date', () => {
    const date = moment([2017, JAN, 1]);
    expect(adapter.deserialize(date).format()).toEqual(date.format());
    expect(adapter.deserialize(date)).not.toBe(date);
  });

  it('should deserialize dates with the correct locale', () => {
    adapter.setLocale('ja');

    expect(adapter.deserialize('1985-04-12T23:20:50.52Z').locale()).toBe('ja');
    expect(adapter.deserialize(new Date()).locale()).toBe('ja');
    expect(adapter.deserialize(moment()).locale()).toBe('ja');
  });

  it('setLocale should not modify global moment locale', () => {
    expect(moment.locale()).toBe('en');

    adapter.setLocale('ja-JP');

    expect(moment.locale()).toBe('en');
  });

  it('should validate date against global min date', () => {
    expect(adapter.validMinDate(new Date('1/1/1753'))).toBe(true);
    expect(adapter.validMinDate(new Date('1/1/1752'))).toBe(false);
    expect(adapter.validMinDate(new Date('1/1/2020'))).toBe(true);
  });

  it('should validate date against global max date', () => {
    expect(adapter.validMaxDate(new Date('12/31/9999'))).toBe(true);
    expect(adapter.validMaxDate(new Date('12/30/9999'))).toBe(true);
    expect(adapter.validMaxDate(new Date('11/31/9999'))).toBe(true);
    expect(adapter.validMaxDate(new Date('1/1/10000'))).toBe(false);
  });
});
