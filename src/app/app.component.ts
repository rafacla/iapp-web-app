import { Component, OnInit } from '@angular/core';
import { Oauth2Service } from './servicos/oauth2/oauth2.service';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserService } from './servicos/user/user.service';
import { HttpClientService } from './servicos/comunicacao/http_client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Minhas Finanças';
  isLogadoSubscribe = this.oauth2.loggedIn.subscribe(valor => {
    if (valor) {
      this.httpClient.userGet().subscribe(userDetail => {
        this.userService.setUserDetail(userDetail);
        this.isLogado = true; 
      });
    } else {
      this.isLogado = valor;
    }
  });
  isLogado: boolean;

  constructor(private oauth2: Oauth2Service, private titleService: Title, private userService: UserService, private httpClient: HttpClientService) { }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    if (this.oauth2.getLoggedUser() != null) {
      this.isLogado = true;
    } else {
      this.isLogado = false;
    }
  }

  
}


