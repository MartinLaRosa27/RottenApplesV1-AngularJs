import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

@Injectable()
export class AutInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let token: string | null = localStorage.getItem("jwtToken");
    if (token) {
      request = request.clone({ 
        headers: request.headers.set('Authorization', 'Bearer ' + token) 
      });
    }
    return next.handle(request);
  }
}
