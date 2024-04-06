import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent implements OnInit {
  public usuario: Usuario;
  public imgUrl = '';

  constructor(private userService: UsuarioService, private router: Router) {
    this.usuario = userService.usuario;
    this.imgUrl = userService.usuario.imagenUrl;
  }

  ngOnInit(): void {}
  logout() {
    this.userService.logout();
  }
  buscar(termino: string) {
    if (termino.length === 0) {
      this.router.navigateByUrl('/dashboard');
    }
    this.router.navigateByUrl(`dashboard/buscar/${termino}`);
  }
}
