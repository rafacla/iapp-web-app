import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Oauth2Service } from '../oauth2/oauth2.service'
import { HttpClientService } from '../comunicacao/http_client.service'
import { UserDetail } from '../comunicacao/data-model/user-detail';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  constructor(private oauth2: Oauth2Service, private httpClient: HttpClientService) { }
  userFirstName = '';
   
  ngOnInit() {
    this.httpClient.getUser()
    .subscribe(userDetails => this.userFirstName = userDetails.userFirstName);
  }

  logout() {
    this.oauth2.signout();
  }

}
