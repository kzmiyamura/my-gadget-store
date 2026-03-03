import { Component } from '@angular/core';
import { GadgetListComponent } from './gadget-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GadgetListComponent],
  template: '<app-gadget-list></app-gadget-list>'
})

export class App {}