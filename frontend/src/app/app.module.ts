import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { AuthGuard } from './guard/auth-guard.service';
import { AutInterceptor } from './aut-interceptor';
import { RegistroComponent } from './components/registro/registro.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MisReviewsComponent } from './components/mis-reviews/mis-reviews.component';
import { AdministradorComponent } from './components/administrador/administrador.component';
import { AgregarPeliculaComponent } from './components/administrador/agregar-pelicula/agregar-pelicula.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegistroComponent,
    ReviewsComponent,
    HeaderComponent,
    FooterComponent,
    MisReviewsComponent,
    AdministradorComponent,
    AgregarPeliculaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AutInterceptor, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
