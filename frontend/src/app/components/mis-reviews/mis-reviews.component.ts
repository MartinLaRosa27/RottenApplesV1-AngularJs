import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import axios from 'axios';

@Component({
  selector: 'app-mis-reviews',
  templateUrl: './mis-reviews.component.html',
  styleUrls: ['./mis-reviews.component.css'],
})
export class MisReviewsComponent implements OnInit {
  // ------------------------------------------------------------------------------------------ //
  public usuario: any = null;
  public reviews: any = null;
  public peliculas: any = null;
  public miFormulario: FormGroup;

  // ------------------------------------------------------------------------------------------ //
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.miFormulario = formBuilder.group({
      peliculaId: ['', [Validators.required, Validators.min(1)]],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(144),
        ],
      ],
      estrellas: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(5),
          Validators.pattern(/^(?:[1-5])[1-5]*$/i),
        ],
      ],
      _id: [null, []],
    });
  }

  // ------------------------------------------------------------------------------------------ //
  public resetFormulario = () => {
    this.miFormulario.setValue({
      peliculaId: '',
      descripcion: '',
      estrellas: '',
      _id: null,
    });
    this.miFormulario.markAsUntouched();
  };

  // ------------------------------------------------------------------------------------------ //
  private getUsuario = async () => {
    this.http.get(environment.baseUrl + 'privado').subscribe({
      next: (res) => {
        this.usuario = res;
        this.getReviewConParametros();
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {},
    });
  };

  // ------------------------------------------------------------------------------------------ //
  private getPelicula = async () => {
    await axios
      .get(environment.baseUrl + 'pelicula')
      .then((res) => {
        this.peliculas = res.data;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  private getReviewConParametros = async () => {
    await axios
      .get(environment.baseUrl + 'review/' + this.usuario[0])
      .then((res) => {
        this.reviews = res.data;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  public postReview = async () => {
    if (this.miFormulario.value._id == null) {
      await axios
        .post(environment.baseUrl + 'review', {
          peliculaId: this.miFormulario.value.peliculaId,
          descripcion: this.miFormulario.value.descripcion,
          estrellas: this.miFormulario.value.estrellas,
          usuarioId: this.usuario[0],
        })
        .then((res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Review creada',
          });
          this.getReviewConParametros();
        })
        .catch((e: any) => {
          console.log(e);
        });
    } else {
      await axios
        .patch(
          environment.baseUrl + 'review/' + this.miFormulario.value._id,
          this.miFormulario.value
        )
        .then((res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Review modificada',
          });
          this.getReviewConParametros();
        })
        .catch((e: any) => {
          console.log(e);
        });
    }
    this.resetFormulario();
  };

  // ------------------------------------------------------------------------------------------ //
  public deleteReview = (id: any) => {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: '¡No podrás revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios
          .delete(environment.baseUrl + 'review/' + id)
          .then((res: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Review eliminada',
            });
            this.getReviewConParametros();
          })
          .catch((e: any) => {
            console.log(e);
          });
      }
    });
  };

  // ------------------------------------------------------------------------------------------ //
  public patchReview = (review: any) => {
    this.miFormulario.setValue({
      peliculaId: review.peliculaId,
      descripcion: review.descripcion,
      estrellas: review.estrellas,
      _id: review._id,
    });
  };

  // ------------------------------------------------------------------------------------------ //
  ngOnInit() {
    this.getUsuario();
    this.getPelicula();
  }
}
