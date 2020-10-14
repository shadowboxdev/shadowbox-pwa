import { ControlValueAccessor as AngularControlValueAccessor } from '@angular/forms';

/**
 * @description Provides a type safe ControlValueAccessor interface which accepts a generic type T.
 */
export interface ControlValueAccessor<T> extends AngularControlValueAccessor {
  writeValue(value: Required<T> | null): void;
  registerOnChange(onChange: (value: T | null) => void): void;
}
