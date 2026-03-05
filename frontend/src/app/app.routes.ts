import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { GadgetListComponent } from './gadget-list.component';
import { GadgetFormComponent } from './components/gadget-form/gadget-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'gadgets', component: GadgetListComponent, canActivate: [authGuard] },
  // /gadgets/new を /:id より先に定義（new が :id としてマッチしないよう順序に注意）
  { path: 'gadgets/new', component: GadgetFormComponent, canActivate: [authGuard] },
  { path: 'gadgets/:id', component: GadgetFormComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'gadgets', pathMatch: 'full' },
  { path: '**', redirectTo: 'gadgets' },
];
