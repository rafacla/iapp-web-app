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
    } catch(e) {}
  }

  /** Carrega no cache os dados do usuario */
  private setCacheUserDetail() {
    try {
      localStorage.setItem('currentUser',JSON.stringify(this.userDetail))
    } catch(e) {}
  }

  /** retorna os detalhes do usuário do cache, caso não exista, pega informações do servidor */
  getUserDetail(): Observable<UserDetail> {
    if (this.userDetail != null) {
      return this.userDetail$;
    } else {
      this.loadCacheUserDetail();
      if (this.userDetail != null) {
        return this.userDetail$;
      } else {
        //não há detalhes do usuário no cache, vamos precisar recuperar do servidor:
        return this.httpClient.getUser().pipe(
          tap(resposta=>{
            var userDetail: UserDetail;
            userDetail = resposta;
            userDetail.userLastDiarioUID = null;
            this.userDetail = userDetail;
            this.setCacheUserDetail();
          })
        )
      }
    }
  }
  
  /** Atualiza as informações do usuário no cache do servidor */
  refreshUserDetail() {
    this.httpClient.getUser().pipe(
      tap(resposta=>{
        var currentDiarioUID: string;
        try {
          currentDiarioUID = this.userDetail.userLastDiarioUID;
        } catch(e) {}
        this.userDetail = resposta;
        this.userDetail.userLastDiarioUID = currentDiarioUID;
        this.setCacheUserDetail();
        this._userDetail.next(this.userDetail);
      }));
  }

  /** Atualiza manualmente as informações do usuário no cache */
  setUserDetail(userDetail: UserDetail) {
    this.userDetail = userDetail;
    this.setCacheUserDetail();
    this._userDetail.next(this.userDetail);
  }

  /** Atualiza o último diário selecionado na aplicação */
  setUserDetailLastDiarioUID(diarioUID: string) {
    this.userDetail.userLastDiarioUID = diarioUID;
    this.setCacheUserDetail();
    this._userDetail.next(this.userDetail);
  }
}
