import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { combineLatest, defer, fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  startWith,
  withLatestFrom
} from 'rxjs/operators';

import { DirtyCheckConfig } from '../models';

const BEFORE_UNLOAD_EVENT: string = 'beforeunload';

export function deepEquals(a, b) {
  if (a === b) {
    return true;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) {
      return false;
    }

    let length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length) {
        return false;
      }
      for (i = length; i-- !== 0; ) {
        if (!deepEquals(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    if (a.constructor === RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }
    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }
    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) {
      return false;
    }

    for (i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }

    for (i = length; i-- !== 0; ) {
      const key = keys[i];

      if (!deepEquals(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

export function dirtyCheck<U>(
  control: AbstractControl,
  source: Observable<U>,
  config: DirtyCheckConfig = {}
) {
  const { debounce, withDisabled } = mergeConfig(config);
  const value = () => getControlValue<U>(control, withDisabled);

  const valueChanges$ = merge(
    defer(() => of(value())),
    control.valueChanges.pipe(
      debounceTime(debounce),
      distinctUntilChanged(),
      map(() => value())
    )
  );

  // eslint-disable-next-line prefer-const
  let subscription: Subscription;

  const isDirty$: Observable<boolean> = combineLatest([source, valueChanges$]).pipe(
    map(([a, b]) => !deepEquals(a, b)),
    finalize(() => subscription.unsubscribe()),
    startWith(false),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  subscription = fromEvent(window, BEFORE_UNLOAD_EVENT)
    .pipe(withLatestFrom(isDirty$))
    .subscribe(([event, isDirty]) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = false;
      }
    });

  return isDirty$;
}

function mergeConfig(config: DirtyCheckConfig): DirtyCheckConfig {
  return {
    debounce: 300,
    withDisabled: true,
    ...config
  };
}

function getControlValue<T>(control: AbstractControl, withDisabled: boolean): T {
  if (withDisabled && (control instanceof FormGroup || control instanceof FormArray)) {
    return control.getRawValue();
  }

  return control.value as T;
}
