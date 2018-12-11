import { Component, OnInit } from '@angular/core';
import { Oauth2Service } from '../../servicos/oauth2/oauth2.service'
import { HttpClientService } from '../../servicos/comunicacao/http_client.service'
import {FormControl, FormControlName, Validators, FormGroup} from '@angular/forms';
import { UserDetail } from '../../data-model/user-detail';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  lembrar = true;
  txtUsername = '';
  txtPassword = '';
  formNewUser = new FormGroup({
    userEmail: new FormControl('', [Validators.required, Validators.email]),
    userEmailAgain: new FormControl('', [Validators.required, Validators.email]),
    userPassword: new FormControl('', [Validators.minLength(5)]),
    userPasswordAgain: new FormControl('', [Validators.minLength(5)]),
    userFirstName: new FormControl('', [Validators.minLength(3)]),
    userLastName: new FormControl('', [Validators.minLength(3)]),
    userPhoneNumber: new FormControl('', [Validators.required])
  });
  btLoginDisabled = false;
  wrongPassword = false;
  inactiveUser = false;
  loading = false;
  lostPassword = false;
  lostPasswordMsg = false;
  newUser = false;
  newUserSuccess = false;
  loginForm = true;


  constructor(private oauth2: Oauth2Service, private httpClient: HttpClientService) { }

  ngOnInit() {
       
  }

  alternaView(viewAtiva: string) {
    this.lostPassword     = (viewAtiva === 'lostPassword');
    this.lostPasswordMsg  = (viewAtiva === 'lostPasswordMsg');
    this.newUser  = (viewAtiva === 'newUser');
    this.newUserSuccess  = (viewAtiva === 'newUserSuccess');
    this.loginForm = (viewAtiva === 'loginForm');
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
    this.alternaView('lostPassword');
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

  mostraRegistro() {
    this.alternaView('newUser');
  }

  registraUsuario() {
    if (this.formNewUser.get('userEmail').value !== this.formNewUser.get('userEmailAgain').value) {
      this.formNewUser.get('userEmailAgain').setErrors(Validators.required);
    } else if (this.formNewUser.get('userPassword').value !== this.formNewUser.get('userPasswordAgain').value) {
      this.formNewUser.get('userPasswordAgain').setErrors(Validators.required);
    } else if (this.formNewUser.valid) {
      const user = new UserDetail();
      user.userEmail        = this.formNewUser.get('userEmail').value;
      user.userFirstName    = this.formNewUser.get('userFirstName').value;
      user.userLastName     = this.formNewUser.get('userLastName').value;
      user.userPhoneNumber  = this.formNewUser.get('userPhoneNumber').value;
      user.userPassword     = this.formNewUser.get('userPassword').value;
      this.loading = true;
      this.httpClient.userPost(user).subscribe(sucesso => {
        this.alternaView('newUserSuccess');
        this.loading = false;
      }, error => {
        this.loading = false;
        console.log(error);
        this.formNewUser.get('userEmail').setErrors(Validators.required);
      });
    }
  }

}
