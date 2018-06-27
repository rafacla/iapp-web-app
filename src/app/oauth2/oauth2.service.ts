import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { in_oauth_auth } from '../comunicacao/data-model/in_oauth_auth';
import { Oauth2Data } from './oauth2-data'
import * as Rx from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class Oauth2Service {
  private currentUser: Oauth2Data;
  private accessToken: string;
  private refreshToken: string;
  /** Se verdadeiro, usaremos o refreshToken para recuperar um novo AccessToken, se falso, fazemos log-out */
  private rememberUser: boolean;
  private resposta: Oauth2Data;

  private _loggedIn: Rx.BehaviorSubject<boolean> = new Rx.BehaviorSubject(false);
  public readonly loggedIn: Rx.Observable<boolean> = this._loggedIn.asObservable();
  private _accessToken: Rx.BehaviorSubject<string> = new Rx.BehaviorSubject(null);
  public readonly accessToken$: Rx.Observable<string> = this._accessToken.asObservable();
  
  

  
  constructor(private http: HttpClient) {
    try {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.accessToken = this.currentUser.accessToken;
      this.refreshToken = this.currentUser.refreshToken;
      this.rememberUser = this.currentUser.rememberUser;
      this._accessToken.next(this.accessToken);
    } catch (e) {
      
    }    
  }
  
  
  /** Método para autenticar um usuário e salvar seus detalhes */
  signin(username: string, password: string, rememberUser: boolean, access_token: string, refresh_token: string) {
    this.accessToken = access_token; 
    this.refreshToken = refresh_token; 
    this.rememberUser = rememberUser; 
    let resposta: Oauth2Data = {
      accessToken: access_token,
      refreshToken: refresh_token,
      rememberUser: this.rememberUser
    };
    this.resposta = resposta;
    localStorage.setItem('currentUser',JSON.stringify(this.resposta))

    this._loggedIn.next(true);
  }

  /** Método para deslogar um usuário e remover seus dados de login do sistema (e tokens) */
  signout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.rememberUser = false;
      this._loggedIn.next(false);
      localStorage.removeItem('currentUser');
  }

  /** Retorna um acessToken (se existente) */
  getAccessToken(): string {
    if (this.accessToken != null) {
      return this.accessToken;
    } else
      return null;
  }

  /** Retorna um AccessToken observável (se existente) 
   * se não existe um AccessToken, mas existe um refresh token
   * então solicita um novo accesstoken */
  getOAccessToken(): Observable<string> {
    if (this.accessToken != null) {
      this._accessToken.next(this.accessToken);
      return this.accessToken$;
    } else if (this.refreshToken != null && this.rememberUser) {
      var apiUrl = "https://api.rafacla.com/auth";
      var json = JSON.stringify({refresh_token: this.refreshToken, grant_type: 'refresh_token', client_id: 'web'});

      var httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json; charset=UTF-8'
        })
      };

      return this.http.post<in_oauth_auth>(apiUrl, json, httpOptions).pipe(
        tap(resposta => {
          
          this.setAccessToken(resposta.access_token,resposta.refresh_token);
          this._accessToken.next(resposta.access_token);
        }),
        map(resposta => resposta.access_token)        
      );
    } else {
      this._accessToken.next(null);
      return this.accessToken$;
    }
  }

  getRefreshToken(): string {
    if (this.refreshAccessToken != null) {
      if (this.rememberUser) {
        return this.refreshToken;
      } else {
        return null;
      }
    } else
      return null;
  }

  getLoggedUser(): Oauth2Data {
    var currentUser: Oauth2Data;
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser;
  }

  /** Grava uma nova Access_Token */
  setAccessToken(accessToken: string, refreshToken?: string) {
    var currentUser: Oauth2Data;
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.accessToken = accessToken;
    if (refreshToken != null) {
      currentUser.refreshToken = refreshToken;
      this.refreshToken = refreshToken;
    }
    this.accessToken = accessToken;
    localStorage.setItem('currentUser',JSON.stringify(currentUser))
    
  }

  /** Recupera um novo AccessToken se o usuário marcou a opção de "Lembrar", caso contrário faz log-out */
  refreshAccessToken() {
    if (this.rememberUser) {
      //TODO: escrever a função de atualizar o access token
      this.signout();
      return null;
    } else {
      this.signout();
      return null;
    }
  }
  

}
