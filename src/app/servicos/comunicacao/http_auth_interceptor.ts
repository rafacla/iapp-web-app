import { Injectable } from '@angular/core';

import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { HttpClientService } from './http_client.service'
import { Oauth2Service } from '../oauth2/oauth2.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private oauth2: Oauth2Service, private http: HttpClientService, private httpHandler: HttpHandler) {}
  respHandler: Observable<HttpEvent<any>>
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const dupReq = req.clone({
      headers: req.headers.set('authorization', 'Bearer ' + this.oauth2.getAccessToken()),
    });

    return next.handle(dupReq)
    .pipe(
      catchError(error => {
        if (error.error.error_description === 'The access token provided is invalid') {
          // chave inválida
          this.oauth2.signout();
          return throwError(error);
        } else if (error.error.error_description === 'The access token provided has expired') {
          const refreshToken = this.oauth2.getRefreshToken();
          if (refreshToken == null) {
            // não ha um refresh token ou a opção lembrar nao foi marcada, faça log out:
            this.oauth2.signout();
            return throwError(error);
          } else {
            this.oauth2.setAccessToken(null);
            return this.oauth2.getOAccessToken().pipe(
              switchMap(resposta => this.RetryRequest(req, next, resposta))
              );
          }
        } else if (error.error.error === 'usuario_inativo') {
          // o usuário está inativo, vamos deslogar!
          this.oauth2.signout();
          return throwError(error);
        }
        return throwError(error);
      })      
    );
  }

  private RetryWithRefreshToken(req: HttpRequest<any>, next: HttpHandler, error: HttpEvent<any>, refreshToken: string): 
  Observable<HttpEvent<any>> {
    return this.http.authRefreshTokenPost(refreshToken).pipe(
        switchMap(resposta => this.RetryRequest(req,next,resposta.access_token))
      );
  }

  private RetryRequest(req: HttpRequest<any>, next: HttpHandler, newAccessToken: string): Observable<HttpEvent<any>> {
      this.oauth2.setAccessToken(newAccessToken);
      const dupReq2 = req.clone({
        headers: req.headers.set('authorization', 'Bearer ' + newAccessToken),
      });
      return this.httpHandler.handle(dupReq2);
  }
} 
