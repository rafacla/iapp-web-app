import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Oauth2Service } from '../../servicos/oauth2/oauth2.service'
import { Router } from "@angular/router";
import { UserService } from '../../servicos/user/user.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

  constructor(
    private oauth2: Oauth2Service,
    private router:Router,
    private user:UserService
  ) { }
  userFirstName = '';
  userEmail = '';
  userDiario = '';

  private atualizaUsuario() {
    var mythis = this;
    this.user.getUserDetail().subscribe(userDetail => {
      let rotaDiario = (mythis.router.url.indexOf('/diario') >= 0);
      mythis.userFirstName = userDetail.userFirstName;
      mythis.userEmail = userDetail.userEmail;
      mythis.userDiario = 'Nenhum diario selecionado';
      if (userDetail.userLastDiarioUID == null 
        && !rotaDiario) {
        //usuário nunca escolheu um diário nesta instance, vamos convidá-lo a fazê-lo:
        this.userFirstName = userDetail.userFirstName;
        this.userEmail = userDetail.userEmail;
        this.router.navigate(['/diario/seleciona']);
      } else {
        mythis.userDiario = userDetail.userLastDiarioName;
      }
    });
  }

  ngOnInit() {
    this.atualizaUsuario();
  }

  logout() {
    this.oauth2.signout();
  }

  abreMenuDiarios() {
    
    console.log("YAH");
  }

}
