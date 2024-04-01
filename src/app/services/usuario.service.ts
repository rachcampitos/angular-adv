import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterForm } from '../interfaces/register-form.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';

const base_url = environment.base_url;

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  public usuario: Usuario;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.loginGoogle(this.token);
  }

  logout() {
    localStorage.removeItem('token');

    google.accounts.id.revoke('raulo87@gmail.com', () => {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/login');
      });
    });
  }
  get token(): string {
    return localStorage.getItem('token') || '';
  }
  get uid(): string {
    return this.usuario.uid || '';
  }

  validateToken(): Observable<boolean> {
    return this.http
      .get(`${base_url}/login/renew`, {
        headers: {
          'x-token': this.token,
        },
      })
      .pipe(
        map((res: any) => {
          const { email, google, nombre, role, img = '', _id } = res.usuario;
          this.usuario = new Usuario(nombre, email, '', img, google, role, _id);
          console.log('usuario', this.usuario);

          localStorage.setItem('token', res.token);
          return true;
        }),
        catchError((error) => of(false))
      );
  }

  crearUsuario(formData: RegisterForm) {
    console.log('creando usuario');
    return this.http.post(`${base_url}/usuarios`, formData).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  updateProfile(data: { email: string; nombre: string; role: string }) {
    data = {
      ...data,
      role: this.usuario.role,
    };
    console.log('uid', this.usuario.uid);

    return this.http.put(`${base_url}/usuarios/${this.usuario.uid}`, data, {
      headers: {
        'x-token': this.token,
      },
    });
  }

  loginUsuario(formData: LoginForm) {
    return this.http.post(`${base_url}/login`, formData).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        console.log('res', res);
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
