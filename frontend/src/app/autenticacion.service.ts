import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private refreshTimeout: any;
  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private http: HttpClient) {}

  // Inicia sesion:
  login(email: string, clave: string): Observable<any> {
    let retorno = new Observable((loginApi) => {
      let credenciales = { email: email, clave: clave };
      this.http.post(environment.baseUrl + 'login', credenciales).subscribe({
        next: (response: any) => {
          localStorage.setItem('jwtToken', response.jwt);
          loginApi.next(response.jwt);
        },
        error: (err) => {
          loginApi.error(err);
        },
        complete: () => {
          loginApi.complete();
        },
      });
    });
    return retorno;
  }

  // Salir de la sesion:
  logout(): boolean {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    if (localStorage.getItem('jwtToken')) {
      localStorage.removeItem('jwtToken');
      return true;
    }
    return false;
  }

  // Verifica si hay una sesion iniciada:
  estaAutenticado(): boolean {
    let jwtToken: string | null = localStorage.getItem('jwtToken');
    return jwtToken ? true : false;
  }

  // Refresca el tiempo de exp del JWT:
  refrescarLogin() {
    let obs = this.http.post(environment.baseUrl + 'refresh', {});
    obs.subscribe({
      next: (response: any) => {
        localStorage.setItem('jwtToken', response.jwt);
      },
      error: (err) => {
        console.error(err);
        this.logout();
      },
    });
  }

  programarRefresh(): void {
    let tiempoParaRefresh = this.calcularExpira() - 60000;
    this.refreshTimeout = setTimeout(() => {
      this.refrescarLogin();
    }, tiempoParaRefresh);
  }

  private calcularExpira(): number {
    let jwtToken = localStorage.getItem('jwtToken') || '';
    let timeout = this.jwtHelper.getTokenExpirationDate(jwtToken) || new Date();
    return timeout.getTime() - Date.now();
  }
}
