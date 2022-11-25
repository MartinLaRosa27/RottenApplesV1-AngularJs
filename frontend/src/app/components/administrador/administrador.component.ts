import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent implements OnInit {
  // ------------------------------------------------------------------------------------------ //
  public usuario: any = null;
  public usuarios: any = null;
  public reviews: any = null;
  public peliculas: any = null;
  private cantPeliculas: any = 0;

  // ------------------------------------------------------------------------------------------ //
  constructor(private http: HttpClient) {}

  // ------------------------------------------------------------------------------------------ //
  private getUsuario = async () => {
    this.http.get(environment.baseUrl + 'privado').subscribe({
      next: (res) => {
        this.usuario = res;
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {},
    });
  };

  // ------------------------------------------------------------------------------------------ //
  private getUsuarioNormal = async () => {
    await axios
      .get(environment.baseUrl + 'usuarioNormal')
      .then((res) => {
        this.usuarios = res.data;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  public deleteUsuario = async (id: any) => {
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
          .delete(environment.baseUrl + 'usuario/' + id)
          .then((res: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
            });
            this.getUsuarioNormal();
          })
          .catch((e: any) => {
            console.log(e);
          });
      }
    });
  };

  // ------------------------------------------------------------------------------------------ //
  private getReview = async () => {
    await axios
      .get(environment.baseUrl + 'review')
      .then((res) => {
        this.reviews = res.data;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  public deleteReview = async (id: any) => {
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
            this.getReview();
          })
          .catch((e: any) => {
            console.log(e);
          });
      }
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
  private getCantidadPeliculas = async () => {
    await axios
      .get(environment.baseUrl + 'cantidadpeliculas')
      .then((res: any) => {
        this.cantPeliculas = res.data.cantidad;
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  public deletePelicula = async (id: any) => {
    // Se verifica que se encuntre más de 1 pelicula registrada en la BD:
    if (this.cantPeliculas <= 1) {
      Swal.fire({
        icon: 'error',
        title:
          'No se puede eliminar la película. Es la única registrada en el sistema.',
      });
      return;
    }
    // Se pregunta y elimina pelicula:
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
          .delete(environment.baseUrl + 'pelicula/' + id)
          .then((res: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Pelicula eliminada',
            });
            this.getPelicula();
            this.getReview();
            this.getCantidadPeliculas();
          })
          .catch((e: any) => {
            console.log(e);
          });
      }
    });
  };

  // ------------------------------------------------------------------------------------------ //
  ngOnInit(): void {
    this.getUsuario();
    this.getUsuarioNormal();
    this.getReview();
    this.getPelicula();
    this.getCantidadPeliculas();
  }
}
