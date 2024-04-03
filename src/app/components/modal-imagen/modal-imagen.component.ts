import { Component, OnInit } from '@angular/core';
import { ModalImagenService } from '../../services/modal-imagen.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-imagen',
  templateUrl: './modal-imagen.component.html',
  styleUrls: ['./modal-imagen.component.css'],
})
export class ModalImagenComponent implements OnInit {
  public imgUpload: File;
  public imgTemp: any = null;
  constructor(
    public modalImagenService: ModalImagenService,
    public uploadService: FileUploadService
  ) {}

  ngOnInit(): void {}

  cerrarModal() {
    this.imgTemp = null;
    this.modalImagenService.cerrarModal();
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
    const id = this.modalImagenService.id;
    const tipo = this.modalImagenService.tipo;
    this.uploadService
      .updatePhoto(this.imgUpload, tipo, id)
      .then((img) => {
        Swal.fire('Guardado', 'La imagen ha sido guardada', 'success');
        this.modalImagenService.nuevaImagen.emit(img);
        this.cerrarModal();
      })
      .catch((err) => {
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      });
  }
}
