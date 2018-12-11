import { Component, OnInit } from '@angular/core';
import { Oauth2Service } from '../../servicos/oauth2/oauth2.service'
import { HttpClientService } from '../../servicos/comunicacao/http_client.service'
import {FormControl, FormControlName, Validators, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  lembrar = true;
  txtUsername = '';
  txtPassword = '';
  btLoginDisabled = false;
  wrongPassword = false;
  inactiveUser = false;
  loading = false;
  lostPassword = false;
  lostPasswordMsg = false;

  constructor(private oauth2: Oauth2Service, private httpClient: HttpClientService) { }

  ngOnInit() {
       
  }

  autentica() {
    this.btLoginDisabled = true;
    this.loading = true;

    this.httpClient.authPost(this.txtUsername, this.txtPassword).subscribe(
      resposta => {
        this.oauth2.signin(this.txtUsername, this.txtPassword, this.lembrar, resposta.access_token, resposta.refresh_token);
        this.loading = false;
      },
      resposta_erro => { 
        this.btLoginDisabled = false;
        if (resposta_erro.error.error === 'usuario_inativo') {
          this.inactiveUser = true;
        } else {
          this.wrongPassword = true; 
        }
        this.loading = false;
        localStorage.removeItem('currentToken');
      });
  }

  mostraLostPassword() {
    this.lostPassword = true;
  }

  getLostPassword() {
    this.httpClient.authPost(this.txtUsername, this.txtPassword).subscribe(
      resposta => {
        this.oauth2.signin(this.txtUsername, this.txtPassword, this.lembrar, resposta.access_token, resposta.refresh_token);
        this.loading = false;
      },
      resposta_erro => { 
        this.btLoginDisabled = false;
        if (resposta_erro.error.error === 'usuario_inativo') {
          this.inactiveUser = true;
        } else {
          this.wrongPassword = true; 
        }
        this.loading = false;
        localStorage.removeItem('currentToken');
      }
    );
  }

}
