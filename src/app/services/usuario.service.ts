import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

const base_url = environment.base_url;

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  logout() {
    localStorage.removeItem('token');

    google.accounts.id.revoke('raulo87@gmail.com', () => {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/login');
      });
    });
  }

  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';

    return this.http
      .get(`${base_url}/login/renew`, {
        headers: {
          'x-token': token,
        },
      })
      .pipe(
        tap((res: any) => {
          localStorage.setItem('token', res.token);
        }),
        map((res) => true),
        catchError((error) => of(false))
      );
  }

  crearUsuario(formData: RegisterForm) {
    console.log('creando usuario');
    return this.http.post(`${base_url}/usuarios`, formData).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        console.log(res);
      })
    );
  }
  loginUsuario(formData: LoginForm) {
    return this.http.post(`${base_url}/login`, formData).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        console.log(res);
      })
    );
  }

  loginGoogle(token: string) {
    return this.http.post(`${base_url}/login/google`, { token }).pipe(
      tap((res: any) => {
        console.log(res);
        localStorage.setItem('token', res.token);
      })
    );
  }
}
