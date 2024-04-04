import { Component, OnDestroy, OnInit } from '@angular/core';
import { MedicoService } from '../../../services/medico.service';
import { Medico } from 'src/app/models/medico.model';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { BusquedasService } from 'src/app/services/busquedas.service';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styleUrls: ['./medicos.component.css'],
})
export class MedicosComponent implements OnInit, OnDestroy {
  public loading: boolean = true;
  public medicos: Medico[] = [];
  public medicosTemp: Medico[] = [];

  public imgSubs: Subscription;

  constructor(
    private medicoService: MedicoService,
    private modalImagenService: ModalImagenService,
    private busquedaService: BusquedasService
  ) {}

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarMedicos();
    this.imgSubs = this.modalImagenService.nuevaImagen
      .pipe(delay(200))
      .subscribe((img) => this.cargarMedicos());
  }

  cargarMedicos() {
    this.loading = true;
    this.medicoService.cargarMedicos().subscribe((medicos) => {
      this.medicos = medicos;
      this.medicosTemp = medicos;
      this.loading = false;
      console.log(medicos);
    });
  }
  abrirModal(medico: Medico) {
    this.modalImagenService.abrirModal('medicos', medico._id, medico.img);
  }

  buscar(termino: string) {
    if (termino.length === 0) {
      return (this.medicos = this.medicosTemp);
    }
    this.busquedaService.buscar('medicos', termino).subscribe((res) => {
      this.medicos = res;
    });
  }
  borrarMedico(medico: Medico) {
    Swal.fire({
      title: 'Borrar Medico?',
      text: `Estas a punto de borrar a ${medico.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, borrarlo',
    }).then((result) => {
      if (result.isConfirmed) {
        this.medicoService.eliminarMedico(medico._id).subscribe((res) => {
          Swal.fire({
            title: 'Usuario Eliminado',
            text: `${medico.nombre} fue eliminado correctamente`,
            icon: 'success',
          });
          this.cargarMedicos();
        });
      }
    });
  }
}
