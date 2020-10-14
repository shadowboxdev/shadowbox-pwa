import { AbstractControl } from './abstract-control.interface';

export interface IHasControl<T> {
  control: AbstractControl<T>
}
