import { Component, OnInit } from '@angular/core';
import { HospitalService } from '../../../services/hospital.service';
import { Hospital } from 'src/app/models/hospital.model';
import Swal from 'sweetalert2';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BusquedasService } from 'src/app/services/busquedas.service';

@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styleUrls: ['./hospitales.component.css'],
})
export class HospitalesComponent implements OnInit {
  public hospitales: Hospital[] = [];
  public loading: boolean = true;
  public hospitalTemp: Hospital[] = [];

  public imgSubs: Subscription;

  constructor(
    private hospitalService: HospitalService,
    private modalImagenService: ModalImagenService,
    private busquedaService: BusquedasService
  ) {}

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarHospitales();
    this.imgSubs = this.modalImagenService.nuevaImagen
      .pipe(delay(200))
      .subscribe((img) => this.cargarHospitales());
  }

  buscar(termino: string) {
    if (termino.length === 0) {
      return (this.hospitales = this.hospitalTemp);
    }
    this.busquedaService.buscar('hospitales', termino).subscribe((res) => {
      this.hospitales = res;
    });
  }

  cargarHospitales() {
    this.loading = true;
    this.hospitalService.cargarHospitales().subscribe((hospitales) => {
      this.loading = false;
      this.hospitalTemp = hospitales;
      this.hospitales = hospitales;
    });
  }
  guardarCambios(hospital: Hospital) {
    this.hospitalService
      .actualizarHospitales(hospital._id, hospital.nombre)
      .subscribe((res) => {
        Swal.fire('Actualizado', hospital.nombre, 'success');
      });
  }

  eliminarHospital(hospital: Hospital) {
    this.hospitalService.eliminarHospitales(hospital._id).subscribe((res) => {
      this.cargarHospitales();
      Swal.fire('Borrado', hospital.nombre, 'success');
    });
  }

  async abrirSweetAlert() {
    const { value = '' } = await Swal.fire<string>({
      title: 'Crear Hospital',
      text: 'Ingrese el nombre del nuevo hospital',
      input: 'text',
      inputPlaceholder: 'Nombre del Hospital',
      showCancelButton: true,
    });
    console.log(value);
    if (value.trim().length > 0) {
      this.hospitalService.crearHospitales(value).subscribe((res: any) => {
        this.hospitales.push(res.hospital);
        console.log(res);
      });
    }
  }
  abrirModal(hospital: Hospital) {
    this.modalImagenService.abrirModal(
      'hospitales',
      hospital._id,
      hospital.img
    );
  }
}
