import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import axios from 'axios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-pelicula',
  templateUrl: './agregar-pelicula.component.html',
  styleUrls: ['./agregar-pelicula.component.css'],
})
export class AgregarPeliculaComponent implements OnInit {
  // ------------------------------------------------------------------------------------------ //
  public miFormulario: FormGroup;
  public anioActual: any;

  // ------------------------------------------------------------------------------------------ //
  constructor(private formBuilder: FormBuilder) {
    const anio = new Date();
    this.anioActual = anio.getFullYear();
    this.miFormulario = formBuilder.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      anio: [
        '',
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(this.anioActual),
        ],
      ],
      img: ['', [Validators.required]],
    });
  }

  // ------------------------------------------------------------------------------------------ //
  public resetFormulario = () => {
    this.miFormulario.setValue({
      titulo: '',
      anio: '',
      img: '',
    });
    this.miFormulario.markAsUntouched();
  };

  // ------------------------------------------------------------------------------------------ //
  private getPeliculaTituloConParametros = async (titulo: any) => {
    let condicion: any = false;
    await axios
      .get(environment.baseUrl + 'peliculatitulo/' + titulo)
      .then((res: any) => {
        if (res.data.length > 0) {
          condicion = true;
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
    return condicion;
  };

  // ------------------------------------------------------------------------------------------ //
  public postPelicula = async () => {
    // Verifica que no se encuntre registrada una pelicula con el mismo nombre:
    const condicion = await this.getPeliculaTituloConParametros(
      this.miFormulario.value.titulo
    );
    if (condicion) {
      Swal.fire({
        icon: 'error',
        title: 'Película ya registrada',
      });
      return;
    }
    // Registra pelicula:
    await axios
      .post(environment.baseUrl + 'pelicula', this.miFormulario.value)
      .then((res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Película registrada',
        });
      })
      .catch((e: any) => {
        console.log(e);
      });
    // Resetea el formulario:
    this.resetFormulario();
  };

  // ------------------------------------------------------------------------------------------ //
  ngOnInit(): void {}
}
