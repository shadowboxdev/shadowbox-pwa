import { forwardRef, InjectionToken, Type } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ControlValueAccessor } from '../models';

export function createCvaProviders<T>(
  component: any
): {
  provide: InjectionToken<ControlValueAccessor<T>>;
  useExisting: Type<any>;
  multi?: boolean;
}[] {
  return [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => component),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => component),
      multi: true
    }
  ];
}
