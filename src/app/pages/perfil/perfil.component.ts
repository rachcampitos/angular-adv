import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  public profileForm: FormGroup;
  public usuario: Usuario;
  public imgUpload: File;
  public imgTemp: any = null;

  constructor(
    private fb: FormBuilder,
    private userService: UsuarioService,
    private uploadService: FileUploadService
  ) {
    this.usuario = userService.usuario;
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nombre: [this.usuario.nombre, Validators.required],
      email: [this.usuario.email, [Validators.required, Validators.email]],
    });
  }

  updateForm() {
    console.log(this.profileForm.value);
    this.userService.updateProfile(this.profileForm.value).subscribe(
      (res) => {
        const { nombre, email } = this.profileForm.value;
        this.usuario.nombre = nombre;
        this.usuario.email = email;

        Swal.fire('Guardado', 'Cambios fueron guardados', 'success');
      },
      (err) => {
        Swal.fire('Error', err.error.msg, 'error');
      }
    );
  }
  changeImg(file: File) {
    this.imgUpload = file;
    if (!file) {
      return (this.imgTemp = null);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgTemp = reader.result;
    };
  }
  uploadImg() {
    this.uploadService
      .updatePhoto(this.imgUpload, 'usuarios', this.usuario._id)
      .then((img) => {
        Swal.fire('Guardado', 'La imagen ha sido guardada', 'success');
        this.usuario.img = img;
      })
      .catch((err) => {
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      });
  }
}
