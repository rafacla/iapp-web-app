import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-diario-edit',
  templateUrl: './diario-edit.component.html',
  styleUrls: ['./diario-edit.component.css']
})
export class DiarioEditComponent implements OnInit {
  formDiario: FormGroup;
  btSalvarEnabled = true;
  loading = false;
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClientService, 
    private user:UserService,
    private formBuilder: FormBuilder) { 
      this.createForm();
    }

  private createForm() {
    this.formDiario = this.formBuilder.group({
      diarioNome: ['', [Validators.required,Validators.minLength(2)] ],
      diarioDescription: ['', Validators.required]
    });
    this.formDiario.enable();
  }

  salvaDiario() {
    let diarioUID = this.route.snapshot.paramMap.get('id');
    let diarioNome = this.formDiario.get('diarioNome').value;
    let diarioDescription = this.formDiario.get('diarioDescription').value;
    
    
    if (this.formDiario.valid) {
      this.formDiario.disable();
      if (diarioUID == 'new') {
        //estamos criando um novo diario
        this.user.getUserDetail().subscribe(userDetail => {
          this.http.diarioPost(diarioNome, diarioDescription, userDetail.userID).subscribe(
            sucesso => { this.router.navigate(['/diario/seleciona']) },
            erro => { 
              console.log (erro);
              this.formDiario.enable();
              this.formDiario.setErrors(Validators.requiredTrue);
            }
          )
        });
      } else {
        this.http.diarioPut(diarioUID,diarioNome,diarioDescription).subscribe(
          sucesso => { this.router.navigate(['/diario/seleciona']) },
          erro => { 
            console.log (erro);
            this.formDiario.enable();
            this.formDiario.setErrors(Validators.requiredTrue);
          }
        )
      }
    }
  }

  ngOnInit() {
    let diarioUID = this.route.snapshot.paramMap.get('id');
    if (diarioUID != 'new') {
      this.formDiario.disable();
      this.http.diarioGetByUID(diarioUID).subscribe(diario => {
        this.formDiario.enable();
        this.formDiario.get('diarioNome').setValue(diario.diarioNome);
        this.formDiario.get('diarioDescription').setValue(diario.diarioDescription);
      });
    }
  }

}
