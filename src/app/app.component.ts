import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@tsv/forms';

interface UserForm {
  name: string;
  age: number;
}

interface AppForm {
  user: UserForm
}

@Component({
  selector: 'tsf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public form = new FormGroup<AppForm>({
    user: new FormControl<UserForm>()
  })

  public ngOnInit(): void {
    const userCtrl = this.form.get('user');

    userCtrl.setValue({
      name: 'paul',
      age: 33
    })

    userCtrl.valueChanges.subscribe(console.log);
  }
}
