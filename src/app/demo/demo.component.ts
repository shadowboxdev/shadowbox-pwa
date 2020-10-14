import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  FormControl,
  mixinControlValueAccessor,
  createCvaProviders,
  IControlValueAccessor,
  AbstractControl,
  FormGroup
} from '@tsv/forms';

interface DemoForm {
  name: string;
  age: number;
}

const DemoComponentBase = mixinControlValueAccessor<DemoForm>(
  class {
    constructor(public _changeDetectorRef: ChangeDetectorRef, public control: AbstractControl<DemoForm>) { }
  }
);


@Component({
  selector: 'tsv-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  providers: createCvaProviders(DemoComponent),
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent extends DemoComponentBase implements IControlValueAccessor<DemoForm> {

  constructor(public _changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef, new FormGroup<DemoForm>({
      name: new FormControl<string>(),
      age: new FormControl<number>()
    }));
  }
}
