import { AbstractControl } from '@angular/forms';

export function setEnabled(ctrl: AbstractControl, enabled: boolean = true): void {
  if (enabled) return ctrl.enable();

  ctrl.disable();
}

export function setDisabled(ctrl: AbstractControl, disabled: boolean = true): void {
  setEnabled(ctrl, !disabled);
}
