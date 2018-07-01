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

  loading = false;
  txtDiarioNome = '';
  txtDiarioDescription = '';
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
        diarioNome: ['', Validators.required ],
        diarioDescription: ['', Validators.required]
      });
    }

  salvaDiario() {
    let mythis = this;
    let diarioUID = this.route.snapshot.paramMap.get('id');
    let diarioNome = this.txtDiarioNome;
    let diarioDescription = this.txtDiarioDescription;
    
    if (diarioUID == 'new') {
      //estamos criando um novo diario
      this.user.getUserDetail().subscribe(userDetail => {
        this.http.criaDiario(diarioNome, diarioDescription, userDetail.userID).subscribe(
          sucesso => { this.router.navigate(['/diario/seleciona']) },
          erro => { 
            console.log (erro);
          },
        )
      });
    } else {

    }
  }

  ngOnInit() {
    
    
  }

}
