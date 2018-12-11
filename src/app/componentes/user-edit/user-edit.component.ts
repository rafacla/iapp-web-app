import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UserService } from '../../servicos/user/user.service';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserDetail } from '../../data-model/user-detail';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  DadosPessoais = true;
  Email = false;
  Senha = false;
  emailNotEqual = false;
  passNotEqual = false;
  formDadosPessoais = new FormGroup({
    userFirstName: new FormControl(''),
    userLastName: new FormControl(''),
    userPhoneNumber: new FormControl('')
  });
  formEmail = new FormGroup({
    userEmail: new FormControl(''),
    userEmailAgain: new FormControl('')
  });
  formSenha = new FormGroup({
    userPassword: new FormControl(''),
    userPasswordAgain: new FormControl('')
  });
  constructor(private user: UserService, private formBuilder: FormBuilder, private http: HttpClientService) { }

  ngOnInit() {
    this.alterar('DadosPessoais');
  }

  alterar(tipo: string) {
    this.Email = (tipo === 'Email');
    this.Senha = (tipo === 'Senha');
    this.DadosPessoais = (tipo === 'DadosPessoais');
    this.user.getUserDetail().subscribe(user => {
      if (tipo === 'DadosPessoais') {
        this.formDadosPessoais = this.formBuilder.group({
          userFirstName: ['', [Validators.required, Validators.minLength(3)] ],
          userLastName: ['', [Validators.required, Validators.minLength(3)]],
          userPhoneNumber: ['']
        });
        this.formDadosPessoais.enable();
        this.formDadosPessoais.patchValue({
          userFirstName: user.userFirstName,
          userLastName: user.userLastName,
          userPhoneNumber: user.userPhoneNumber
        });
      } else if (tipo === 'Email') {
        this.formEmail = this.formBuilder.group({
          userEmail: ['', [Validators.required, Validators.email] ],
          userEmailAgain: ['', Validators.required],
        });
        this.formEmail.enable();
        this.formEmail.patchValue({
          userEmail: '',
          userEmailAgain: ''
        });
      } else if (tipo === 'Senha') {
        this.formSenha = this.formBuilder.group({
          userPassword: ['', [Validators.required, Validators.minLength(5)] ],
          userPasswordAgain: ['', Validators.required],
        });
        this.formSenha.enable();
        this.formSenha.patchValue({
          userPassword: '',
          userPasswordAgain: ''
        });
      }
    });
  }

  editarDadosPessoais() {
    if (this.formDadosPessoais.valid) {
      const json = new UserDetail();
      json.userFirstName = this.formDadosPessoais.get('userFirstName').value;
      json.userLastName = this.formDadosPessoais.get('userLastName').value;
      json.userPhoneNumber = this.formDadosPessoais.get('userPhoneNumber').value;
      
      this.formDadosPessoais.disable();
      this.http.userPut(json).subscribe(sucesso => {
        this.user.refreshUserDetail().subscribe(sucesso2 => {
          this.formDadosPessoais.enable();
        });
      }, erro => {
        this.formDadosPessoais.setErrors(Validators.required);
        this.formDadosPessoais.enable();
      });
    }
  }

  editarEmail() {
    if (this.formEmail.valid) {
      if (this.formEmail.get('userEmail').value === this.formEmail.get('userEmailAgain').value) {
        const json = new UserDetail();
        json.userEmail = this.formEmail.get('userEmail').value;
        
        this.formEmail.disable();
        this.http.userPut(json).subscribe(sucesso => {
          this.user.refreshUserDetail().subscribe(sucesso2 => {
            this.formEmail.enable();
          });
        }, erro => {
          this.formEmail.setErrors(Validators.required);
          this.formEmail.enable();
        });
      } else {
        this.formEmail.get('userEmailAgain').setErrors(Validators.email);
      }
    }
  }

  editarSenha() {
    if (this.formSenha.valid) {
      if (this.formSenha.get('userPassword').value === this.formSenha.get('userPasswordAgain').value) {
        const json = new UserDetail();
        json.userPassword = this.formSenha.get('userPassword').value;
        
        this.formSenha.disable();
        this.http.userPut(json).subscribe(sucesso => {
          this.user.refreshUserDetail().subscribe(sucesso2 => {
            this.formSenha.enable();
          });
        }, erro => {
          this.formSenha.setErrors(Validators.required);
          this.formSenha.enable();
        });
      } else {
        this.formSenha.get('userPasswordAgain').setErrors(Validators.email);
      }
    }
  }
}
