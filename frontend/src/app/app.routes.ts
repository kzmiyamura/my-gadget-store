import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { GadgetListComponent } from './gadget-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: GadgetListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
