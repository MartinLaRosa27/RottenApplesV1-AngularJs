import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AutenticacionService } from 'src/app/autenticacion.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  // ------------------------------------------------------------------------------------------ //
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public isExpanded = false;
  public usuario: any;

  // ------------------------------------------------------------------------------------------ //
  constructor(
    private router: Router,
    public autenticador: AutenticacionService
  ) {}

  // ------------------------------------------------------------------------------------------ //
  public logOut = () => {
    if (this.autenticador.logout()) {
      this.router.navigate(['/']);
      this.usuario = null;
    } else {
      alert('Error en logout');
    }
  };

  // ------------------------------------------------------------------------------------------ //
  ngOnInit(): void {}
}
