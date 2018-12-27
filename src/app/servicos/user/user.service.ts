import { Injectable } from '@angular/core';
import { UserDetail } from '../../data-model/user-detail';
import { HttpClientService } from '../comunicacao/http_client.service';
import { tap } from 'rxjs/operators';
import * as Rx from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userDetail: UserDetail;
  private _userDetail: Rx.BehaviorSubject<UserDetail> = new Rx.BehaviorSubject(null);
  public readonly userDetail$: Rx.Observable<UserDetail> = this._userDetail.asObservable();

  constructor(private httpClient: HttpClientService) { }

  /** Carrega do cache os dados do Usuario */
  private loadCacheUserDetail() {
    try {
      this.userDetail = JSON.parse(localStorage.getItem('currentUser'));
      this._userDetail.next(this.userDetail);
    } catch (e) {}
  }

  /** Carrega no cache os dados do usuario */
  private setCacheUserDetail() {
    try {
      localStorage.setItem('currentUser', JSON.stringify(this.userDetail));
    } catch (e) {} 
  }

  /** retorna os detalhes do usuário do cache, caso não exista, pega informações do servidor */
  getUserDetail(): Observable<UserDetail> {
    if (this.userDetail != null) {
      return this.userDetail$;
    } else {
      this.loadCacheUserDetail();
      const mthis = this;
      if (this.userDetail != null) {
        this.httpClient.userGet().subscribe(user => {
          this.setUserDetail(user);
        });
        return this.userDetail$;
      } else {
        // não há detalhes do usuário no cache, vamos precisar recuperar do servidor:
        return this.httpClient.userGet().pipe(
          tap(resposta => {
            let userDetail: UserDetail;
            userDetail = resposta;
            userDetail.userLastDiarioUID = null;
            userDetail.userLastDiarioName = '';
            this.userDetail = userDetail;
            this.setCacheUserDetail();
          })
        );
      }
    }
  }
  
  /** Atualiza as informações do usuário no cache do servidor */
  refreshUserDetail(): Observable<UserDetail> {
    return this.httpClient.userGet().pipe(
      tap(resposta => {
        let currentDiarioUID: string;
        let currentDiarioName: string;
        try {
          currentDiarioUID = this.userDetail.userLastDiarioUID;
          currentDiarioName = this.userDetail.userLastDiarioName;
        } catch (e) {}
        let userDetail: UserDetail;
        userDetail = resposta;
        userDetail.userLastDiarioUID = null;
        userDetail.userLastDiarioName = '';
        this.userDetail = userDetail;
        this.setCacheUserDetail();
        this._userDetail.next(this.userDetail);
      }));
  }

  /** Atualiza manualmente as informações do usuário no cache */
  setUserDetail(userDetail: UserDetail) {
    const userLastDiarioUID = this.userDetail.userLastDiarioUID;
    const userLastDiarioName = this.userDetail.userLastDiarioName;
    if (this.userDetail.userID === userDetail.userID) {
      userDetail.userLastDiarioName = userLastDiarioName;
      userDetail.userLastDiarioUID = userLastDiarioUID;
    }
    this.userDetail = userDetail;
    this.setCacheUserDetail();
    this._userDetail.next(this.userDetail);
  }

  /** Atualiza o último diário selecionado na aplicação */
  setUserDetailLastDiarioUID(diarioUID: string, diarioName?) {
    this.userDetail.userLastDiarioUID = diarioUID;
    if (diarioName !== undefined) {
      this.userDetail.userLastDiarioName = diarioName;
    }
    this.setCacheUserDetail();
    this._userDetail.next(this.userDetail);
  }
}
