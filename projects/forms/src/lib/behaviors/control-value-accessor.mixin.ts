import { ValidationErrors } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { IHasChangeDetectorRef, IHasControl, ControlValueAccessor, AbstractControl } from '../models';

// eslint-disable-next-line @typescript-eslint/no-type-alias
type Constructor<T> = new (...args: any[]) => T;

const noop: any = () => {
  // empty method
};

export interface IControlValueAccessor<T> extends ControlValueAccessor<T> {
  control: AbstractControl<T>
  value: T;
  valueChanges: Observable<T>;
  onChange: (_: T) => any;
  onTouched: () => any;
}

/** Mixin to augment a component with ngModel support. */
export function mixinControlValueAccessor<U, T extends Constructor<IHasChangeDetectorRef> = Constructor<IHasChangeDetectorRef>>(
  base: T,
  initialValue?: U
): Constructor<IControlValueAccessor<U>> & T {
  return class extends base {
    public control: AbstractControl<U>;
    protected _value: U =
      initialValue instanceof Array ? Object.assign([], initialValue) : initialValue;

    private _subjectValueChanges: Subject<U>;
    public valueChanges: Observable<U>;

    constructor(...args: any[]) {
      super(...args);

      this._subjectValueChanges = new Subject<U>();
      this.valueChanges = this._subjectValueChanges.asObservable();

      if(this.control) {
        this.control.valueChanges.subscribe(v => this.value = v);
      }
    }

    public set value(v: U) {
      if (v === this._value) return;

      this._value = v;
      this.onChange(v);
      this._changeDetectorRef.markForCheck();
      this._subjectValueChanges.next(v);
    }

    public get value(): U {
      return this._value;
    }

    public writeValue(value: Required<U> | null): void {
      this.value = value;
      this.control.setValue(value, { emitEvent: false });
      this._changeDetectorRef.markForCheck();
    }

    public setDisabledState(disabled: boolean): void {
      disabled
        ? this.control.disable({ emitEvent: false })
        : this.control.enable({ emitEvent: false });
    }

    public validate(): ValidationErrors | null {
      return this.control.invalid ? { invalid: true } : null;
    }

    public registerOnChange(fn: any): void {
      this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
      this.onTouched = fn;
    }

    public onChange = (_: U) => noop;
    public onTouched = () => noop;
  };
}
