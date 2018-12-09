import { Component, OnInit, Inject } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { DiarioList } from '../../data-model/diario-list';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface DialogData {
  diario_id: string;
  diario_nome: string;
  diario_descricao: string;
  user_id: string;
}

@Component({
  selector: 'app-diario-seleciona',
  templateUrl: './diario-seleciona.component.html',
  styleUrls: ['./diario-seleciona.component.css']
})
export class DiarioSelecionaComponent implements OnInit {
  diariosList: DiarioList[];
  diariosDeletados: boolean[] = [];

  constructor(
    private router: Router, 
    private http: HttpClientService, 
    private userService: UserService,
    public dialog: MatDialog) { }


  openDialog(diario): void {
    let diarioA = {} as DiarioList;
    if (diario === 'new') {
      diarioA.diarioUID = 'new';
    } else {
      diarioA = diario;
    }
    this.userService.getUserDetail().subscribe(user => {
      const dialogRef = this.dialog.open(DiarioEditComponent, {
        width: '500px',
        data: {
          diario_id: diarioA.diarioUID, 
          diario_nome: diarioA.diarioNome,
          diario_descricao: diarioA.diarioDescription,
          user_id: user.userID
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          window.location.reload();
        }
      });
    });
  }

  ngOnInit() {
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.diarioGet(userDetail.userID).subscribe(diarios => {
        this.diariosList = diarios;
      })
    });
  }

  private deletaDiario(diario: DiarioList) {
    const diarioUID = diario.diarioUID;
    this.diariosDeletados[diarioUID] = true;
    this.http.diarioDelete(diarioUID).subscribe(
      sucesso => { 
        const index = this.diariosList.indexOf(diario);
        if (index !== -1) {
          this.diariosList.splice(index, 1);
      }   
      },
      erro => { 
        console.log (erro);
      }
    );
  }

  private selecionaDiario(diario: DiarioList) {
    const diarioUID = diario.diarioUID;
    this.diariosDeletados[diarioUID] = true;
    this.userService.setUserDetailLastDiarioUID(diarioUID, diario.diarioNome);
    this.router.navigate(['/']);
  }

}

@Component({
  selector: 'app-diario-edit',
  templateUrl: 'diario-edit-dialog.html'
})

export class DiarioEditComponent {
  formDiario: FormGroup;
  btSalvarEnabled = true;

  constructor(
    public dialogRef: MatDialogRef<DiarioEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private router: Router,
    private http: HttpClientService,
    private user: UserService,
    private formBuilder: FormBuilder) {
      this.createForm();
    }

  private createForm() {
    this.formDiario = this.formBuilder.group({
      diarioNome: ['', [Validators.required, Validators.minLength(2)] ],
      diarioDescription: ['', Validators.required]
    });
    this.formDiario.enable();
    const diarioUID = this.data.diario_id;
    if (diarioUID !== 'new') {
      this.formDiario.get('diarioNome').setValue(this.data.diario_nome);
      this.formDiario.get('diarioDescription').setValue(this.data.diario_descricao);
    }
  }

  salvaDiario() {
    const diarioUID = this.data.diario_id;
    const diarioNome = this.formDiario.get('diarioNome').value;
    const diarioDescription = this.formDiario.get('diarioDescription').value;


    if (this.formDiario.valid) {
      this.formDiario.disable();
      if (diarioUID === 'new') {
        // estamos criando um novo diario:
        this.user.getUserDetail().subscribe(userDetail => {
          this.http.diarioPost(diarioNome, diarioDescription, +this.data.user_id).subscribe(
            sucesso => { 
              this.dialogRef.close(true);
            },
            erro => {
              console.log (erro);
              this.formDiario.enable();
              this.formDiario.setErrors(Validators.requiredTrue);
            }
          );
        });
      } else {
        this.http.diarioPut(diarioUID, diarioNome, diarioDescription).subscribe(
          sucesso => { 
            this.dialogRef.close(true);
          },
          erro => {
            console.log (erro);
            this.formDiario.enable();
            this.formDiario.setErrors(Validators.requiredTrue);
          }
        )
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}