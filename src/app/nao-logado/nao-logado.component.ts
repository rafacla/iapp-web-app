import { Component, OnInit } from '@angular/core';
import { Oauth2Service } from '../oauth2/oauth2.service'
import { HttpClientService } from './../comunicacao/http_client.service'
import {FormControl, FormControlName, Validators, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-nao-logado',
  templateUrl: './nao-logado.component.html',
  styleUrls: ['./nao-logado.component.css']
})
export class NaoLogadoComponent implements OnInit {
  lembrar = true;
  txtUsername = '';
  txtPassword = '';
  btLoginDisabled = false;
  wrongPassword = false;
  loading = false;

  constructor(private oauth2: Oauth2Service, private httpClient: HttpClientService) { }

  ngOnInit() {
       
  }

  autentica() {
    this.btLoginDisabled=true;
    this.loading = true;
    this.httpClient.Autentica(this.txtUsername,this.txtPassword).subscribe(
      resposta => {
        this.oauth2.signin(this.txtUsername,this.txtPassword,this.lembrar,resposta.access_token,resposta.refresh_token);
        this.loading = false;
      },
      resposta_erro => { 
        this.btLoginDisabled = false; 
        this.wrongPassword = true; 
        this.loading = false;
        localStorage.removeItem('currentUser');
      }
    )
  }

}
