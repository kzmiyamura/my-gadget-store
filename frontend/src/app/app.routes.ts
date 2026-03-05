import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { GadgetListComponent } from './gadget-list.component';
import { GadgetDetailComponent } from './gadget-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'gadgets', component: GadgetListComponent, canActivate: [authGuard] },
  { path: 'gadgets/:id', component: GadgetDetailComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'gadgets', pathMatch: 'full' },
  { path: '**', redirectTo: 'gadgets' },
];
