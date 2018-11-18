import { Component } from '@angular/core';
import { Oauth2Service } from './servicos/oauth2/oauth2.service';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = "Minhas Finanças";
  constructor(private oauth2: Oauth2Service, private titleService: Title) { }
  isLogado: boolean;

  ngOnInit() {
    this.titleService.setTitle(this.title);
    if (this.oauth2.getLoggedUser()!=null) {
      this.isLogado = true; 
    } else {
      this.isLogado = false;
    }
  }

  isLogadoSubscribe = this.oauth2.loggedIn.subscribe(valor => this.isLogado = valor);
}


