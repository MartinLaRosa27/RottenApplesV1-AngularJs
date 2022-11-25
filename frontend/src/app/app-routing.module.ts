import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth-guard.service';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { MisReviewsComponent } from './components/mis-reviews/mis-reviews.component';
import { AdministradorComponent } from './components/administrador/administrador.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'reviews',
    component: ReviewsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'mis-reviews',
    component: MisReviewsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'administrador',
    component: AdministradorComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
