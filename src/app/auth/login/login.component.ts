import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtn: ElementRef;

  public loginForm = this.fb.group({
    email: [
      localStorage.getItem('email') || '',
      [Validators.required, Validators.email],
    ],
    password: ['', Validators.required],
    remember: [false],
  });

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  login() {
    console.log(this.loginForm.value);
    this.userService.loginUsuario(this.loginForm.value).subscribe(
      (res) => {
        console.log(res);
        if (this.loginForm.get('remember').value) {
          localStorage.setItem('email', this.loginForm.get('email').value);
        } else {
          localStorage.removeItem('email');
        }

        this.router.navigateByUrl('/');
      },
      (err) => {
        //si sucede un error
        Swal.fire('Error', err.error.msg, 'error');
      }
    );
  }
  ngAfterViewInit(): void {
    this.googleInit();
  }

  googleInit() {
    google.accounts.id.initialize({
      client_id:
        '581975471491-knthe6urrnu2h6i6su096ouedgfngstc.apps.googleusercontent.com',
      callback: (response) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(
      this.googleBtn.nativeElement,
      { theme: 'outline', size: 'large' } // customization attributes
    );
  }
  handleCredentialResponse(response: any) {
    console.log('Encoded JWT ID token: ' + response.credential);
    this.userService.loginGoogle(response.credential).subscribe((res) => {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/');
      });
    });
  }
}
