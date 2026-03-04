import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * ログイン済みユーザーのみ通過を許可するルートガード。
 * 未ログインの場合は /login にリダイレクトする。
 *
 * 使い方:
 *   { path: '', component: GadgetListComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
