import { Component, OnInit } from '@angular/core';
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

  constructor(private userService: UsuarioService) {
    this.usuario = userService.usuario;
    this.imgUrl = userService.usuario.imagenUrl;
    console.log('img url', this.imgUrl);
  }

  ngOnInit(): void {}
  logout() {
    this.userService.logout();
  }
}
