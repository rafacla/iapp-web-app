import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UserService } from '../../servicos/user/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  DadosPessoais = true;
  Email = false;
  Senha = false;
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
  constructor(private user: UserService, private formBuilder: FormBuilder) { }

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
    console.log(this.formDadosPessoais.get('userPhoneNumber').value);
  }

  editarEmail() {

  }

  editarSenha() {

  }
}
