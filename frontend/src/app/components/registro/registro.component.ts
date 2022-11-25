import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/autenticacion.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import axios from 'axios';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit {
  // ------------------------------------------------------------------------------------------ //
  public credenciales: any = {};
  public miFormulario: FormGroup;
  public miFormulario2: FormGroup;

  // ------------------------------------------------------------------------------------------ //
  constructor(
    private router: Router,
    private autenticador: AutenticacionService,
    private formBuilder: FormBuilder
  ) {
    this.miFormulario = formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(60),
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
          Validators.pattern(/^(?:[0-9]+[a-z]|[a-z]+[0-9])[a-z0-9]*$/i),
        ],
      ],
      passwordAux: ['', [Validators.required]],
      confirmacion: ['true', [Validators.required]],
    });
    this.miFormulario2 = formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  // ------------------------------------------------------------------------------------------ //
  login(): void {
    this.autenticador
      .login(this.miFormulario2.value.email, this.miFormulario2.value.password)
      .subscribe({
        next: () => {},
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error en los datos ingresados',
          });
        },
        complete: () => {
          this.router.navigate(['/reviews']);
        },
      });
  }

  // ------------------------------------------------------------------------------------------ //
  private resetMiFormulario = () => {
    this.miFormulario.setValue({
      username: '',
      email: '',
      password: '',
      passwordAux: '',
      confirmacion: true,
    });
    this.miFormulario.markAsUntouched();
  };

  // ------------------------------------------------------------------------------------------ //
  private getUsernameConParametros = async (username: any) => {
    let condicion: any = false;
    await axios
      .get(environment.baseUrl + 'username/' + username)
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
  private getEmailConParametros = async (email: any) => {
    let condicion: any = false;
    await axios
      .get(environment.baseUrl + 'email/' + email)
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
  public postUsuario = async () => {
    // Variables:
    let condicion: any = false;
    // No coinciden password:
    if (
      this.miFormulario.value.password != this.miFormulario.value.passwordAux
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas ingresadas no coinciden',
      });
      return;
    }
    // Verifica que no se encuntre registrado un usuario con el mismo username:
    condicion = await this.getUsernameConParametros(
      this.miFormulario.value.username
    );
    if (condicion) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre de usuario ya registrado',
      });
      return;
    }
    // Verifica que no se encuntre registrado un usuario con el mismo email:
    condicion = await this.getEmailConParametros(this.miFormulario.value.email);
    if (condicion) {
      Swal.fire({
        icon: 'error',
        title: 'Email ya registrado',
      });
      return;
    }
    // Crea el usuario:
    await axios
      .post(environment.baseUrl + 'usuario', this.miFormulario.value)
      .then((res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
        });
        this.resetMiFormulario();
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  // ------------------------------------------------------------------------------------------ //
  ngOnInit(): void {}
}
