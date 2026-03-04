import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../core/constants/auth.constants';

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

/**
 * 認証サービス。
 * ログイン状態は Signal で管理し、コンポーネントから reactive に参照できる。
 *
 * 将来 AWS Cognito / Amplify に移行する場合は、このクラスの内部実装だけ差し替えればよい。
 * 外部からは login / logout / getCurrentUser / isLoggedIn だけを使う。
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = AUTH_TOKEN_KEY;
  private readonly USER_KEY = AUTH_USER_KEY;
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // ログイン中ユーザーを Signal で保持
  private readonly _currentUser = signal<AuthUser | null>(this.loadFromStorage());

  /** 読み取り専用 Signal（コンポーネントで使用） */
  readonly currentUser = this._currentUser.asReadonly();

  /** ログイン状態を computed Signal で導出 */
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
  }

  getCurrentUser(): AuthUser | null {
    return this._currentUser();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this._currentUser.set(res.user);
  }

  private loadFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
