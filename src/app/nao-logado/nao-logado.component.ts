import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../comunicacao/http_client.service'
import { in_oauth_auth } from '../comunicacao/data-model/in_oauth_auth';

@Component({
  selector: 'app-nao-logado',
  templateUrl: './nao-logado.component.html',
  styleUrls: ['./nao-logado.component.css']
})
export class NaoLogadoComponent implements OnInit {
  lembrar = true;
  mensagem = '';
  resposta: in_oauth_auth;

  constructor(private httpClient: HttpClientService) { }

  ngOnInit() {
  }

  autentica() {
    this.httpClient.Autentica('rafacla@live.com','9228726')
    .subscribe(
      resposta => this.mensagem = resposta.access_token,
      resposta_erro => this.mensagem = resposta_erro.error.error      
    );
  }

}
