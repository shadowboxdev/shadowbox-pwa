import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { TsvValidators } from './validators';

const template: string = `
  <form [formGroup]="form">
    <mat-form-field>
      <input matInput [matDatepicker]="picker" formControlName="testDate">
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>

    <div formGroupName="range">
        <mat-form-field>
          <input matInput [matDatepicker]="start" formControlName="start">
          <mat-datepicker-toggle matSuffix [for]="start"></mat-datepicker-toggle>
          <mat-datepicker #start></mat-datepicker>
        </mat-form-field>

        <mat-form-field>
          <input matInput [matDatepicker]="end" formControlName="end">
          <mat-datepicker-toggle matSuffix [for]="end"></mat-datepicker-toggle>
          <mat-datepicker #end></mat-datepicker>
        </mat-form-field>
    </div>
  </form>
`;

@Component({ selector: 'tsv-host', template })
class TestComponent {
  public form = new FormGroup({
    testDate: new FormControl('', [TsvValidators.date()]),
    range: new FormGroup(
      {
        start: new FormControl('', [TsvValidators.date()]),
        end: new FormControl('')
      },
      [TsvValidators.dateRange()]
    )
  });
}

describe('TsvValidators', () => {
  let fixture: Spectator<TestComponent>;

  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatInputModule,
      MatMomentDateModule
    ]
  });

  beforeEach(() => (fixture = createComponent()));

  describe('date Validator', () => {
    it('should validate in valid dates', fakeAsync(() => {
      const form = fixture.component.form;
      const ctrl = form.get('testDate');

      ctrl.setValue(new Date('1/20/2012'));

      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(ctrl.valid).toBe(true);

      ctrl.setValue('asdf');

      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      fixture.tick();

      expect(ctrl.invalid).toBe(true);
    }));

    it('should validate global max date', fakeAsync(() => {
      const form = fixture.component.form;
      const ctrl = form.get('testDate');

      ctrl.setValue(new Date('12/31/10000'));

      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(ctrl.invalid).toBe(true);
    }));

    it('should validate global min date', fakeAsync(() => {
      const form = fixture.component.form;
      const ctrl = form.get('testDate');

      ctrl.setValue(new Date('1/1/1752'));

      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(ctrl.invalid).toBe(true);
    }));
  });

  describe('dateRange Validator', () => {
    it('should validate global max date', fakeAsync(() => {
      const form = fixture.component.form;
      const start = form.get(['range', 'start']);
      const end = form.get(['range', 'end']);

      start.setValue(new Date('1/21/12'));
      end.setValue(new Date('1/21/11'));

      form.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(form.invalid).toBe(true);

      start.setValue(new Date('1/21/12'));
      end.setValue(new Date('1/21/13'));

      form.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(form.invalid).toBe(false);
    }));

    it('should validate when one date is outside of the valid range', fakeAsync(() => {
      const form = fixture.component.form;
      const start = form.get(['range', 'start']);
      const end = form.get(['range', 'end']);

      start.setValue(new Date('1/1/11111'));
      end.setValue(new Date('1/21/11'));

      form.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(form.invalid).toBe(true);
      expect(start.invalid).toBe(true);
      expect(end.invalid).toBe(false);

      start.setValue(new Date('1/21/12'));
      end.setValue(new Date('1/21/13'));

      form.updateValueAndValidity();
      fixture.detectChanges();
      fixture.detectComponentChanges();
      fixture.tick();

      expect(form.invalid).toBe(false);
    }));
  });
});
