import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterForm } from '../interfaces/register-form.interface';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import Swal from 'sweetalert2';

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
    google.accounts.id.initialize({
      client_id:
        '581975471491-knthe6urrnu2h6i6su096ouedgfngstc.apps.googleusercontent.com',
      callback: () => console.log('Google Identity API initialized'),
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('menu');
    google.accounts.id.revoke('raulo87@gmail.com', () => {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/login');
      });
    });
  }
  get token(): string {
    return localStorage.getItem('token') || '';
  }
  get role(): 'ADMIN_ROLE' | 'USER_ROLE' {
    return this.usuario.role;
  }
  get uid(): string {
    return this.usuario._id || '';
  }
  get headers() {
    return {
      headers: {
        'x-token': this.token,
      },
    };
  }

  guardarLocalStorage(token: string, menu: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
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
          this.guardarLocalStorage(res.token, res.menu);
          return true;
        }),
        catchError((error) => of(false))
      );
  }

  crearUsuario(formData: RegisterForm) {
    console.log('creando usuario');
    return this.http.post(`${base_url}/usuarios`, formData).pipe(
      tap((res: any) => {
        this.guardarLocalStorage(res.token, res.menu);
      })
    );
  }

  updateProfile(data: { email: string; nombre: string; role: string }) {
    data = {
      ...data,
      role: this.usuario.role,
    };
    return this.http.put(
      `${base_url}/usuarios/${this.usuario._id}`,
      data,
      this.headers
    );
  }

  guardarUsuario(usuario: Usuario) {
    return this.http.put(
      `${base_url}/usuarios/${this.usuario._id}`,
      usuario,
      this.headers
    );
  }

  loginUsuario(formData: LoginForm) {
    return this.http.post(`${base_url}/login`, formData).pipe(
      tap((res: any) => {
        this.guardarLocalStorage(res.token, res.menu);
        console.log('res', res);
      })
    );
  }

  loginGoogle(token: string) {
    return this.http.post(`${base_url}/login/google`, { token }).pipe(
      tap((res: any) => {
        console.log(res);
        this.guardarLocalStorage(res.token, res.menu);
      })
    );
  }

  cargarUsuarios(desde: number = 0) {
    return this.http
      .get<CargarUsuario>(`${base_url}/usuarios?desde=${desde}`, this.headers)
      .pipe(
        map((res) => {
          const usuarios = res.usuarios.map(
            (usuario) =>
              new Usuario(
                usuario.nombre,
                usuario.email,
                '',
                usuario.img,
                usuario.google,
                usuario.role,
                usuario._id
              )
          );
          return {
            total: res.total,
            usuarios,
          };
        })
      );
  }

  eliminarUsuario(usuario: Usuario) {
    return this.http.delete(
      `${base_url}/usuarios/${usuario._id}`,
      this.headers
    );
  }
}
