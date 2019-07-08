import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ContaList } from '../../data-model/conta-list';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Chart } from 'chart.js';

export interface DialogData {
  conta_id: string;
  conta_nome: string;
  conta_descricao: string;
}

@Component({
  selector: 'app-contas-list',
  templateUrl: './contas-list.component.html',
  styleUrls: ['./contas-list.component.css']
})
export class ContasListComponent implements OnInit {
  contasList: ContaList[];
  contasDeletadas: boolean[] = [];
  dataSource: Object;
  contasCorrente: ContaList[] = [];
  contasCartao: ContaList[] = [];
  contaDetalhe: ContaList;
  @ViewChild('lineChart') private chartRef;
  chart: any;
  
  constructor(
    private http: HttpClientService,
    private userService: UserService,
    public dialog: MatDialog) {}

  openDetail(conta: ContaList) {
    this.contaDetalhe = conta;
    this.userService.getUserDetail().subscribe(user => {
      this.http.subtransacoesTabularGet(user.userLastDiarioUID).subscribe(transacoes => {
        
      });
    });
    let labels = ['1','2','3'];
    let dataPoints = [{
      x: 1,
      y: 10
    }, {
      x: 2,
      y: -40
    }, {
      x: 3,
      y: 20
    }];
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels, // your labels array
        datasets: [
          {
            data: dataPoints, // your data array
            borderColor: '#00AEFF',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: 3,
        legend: {
          display: false
        }, 
        tooltips: {
          mode: 'index',
					intersect: false
        },
        hover: {
					mode: 'nearest',
					intersect: true
        },
        scales: {
					xAxes: [{
						type: 'time',
						distribution: 'series',
						ticks: {
							source: 'data',
							autoSkip: true
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Saldo (R$)'
						}
					}]
				},
      }
    });
  }

  openDialog(conta_id: string, conta_nome?: string, conta_descricao?: string): void {
    if (conta_nome === undefined) {
      conta_nome = '';
    }
    if (conta_descricao === undefined) {
      conta_descricao = '';
    }
    const dialogRef = this.dialog.open(ContasEditComponent, {
      width: '500px',
      data: {conta_id: conta_id, conta_nome: conta_nome, conta_descricao: conta_descricao}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }


  private atualizaResumoContas() {
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.contasGet(userDetail.userLastDiarioUID).subscribe(
        contas => {
          this.contasList = contas;
          this.contasCartao = [];
          this.contasCorrente = [];
          this.contaDetalhe = this.contasList[0];
          for (const conta of contas) {
            if (conta.conta_cartao === '1') {
              this.contasCartao.push(conta);
            } else {
              this.contasCorrente.push(conta);
            }
          }
        },
        error => {
          this.contasList = [];
        });
    });
  }  

  ngOnInit() {
    this.atualizaResumoContas();  
  }

  deletaConta(conta: ContaList) {
    const contaID = conta.conta_id;
    this.contasDeletadas[contaID] = true;
    
    this.http.contaDelete(contaID.toString()).subscribe(
      sucesso => {
        const index = this.contasList.indexOf(conta);
        if (index !== -1) {
          this.contasList.splice(index, 1);
        }
        this.atualizaResumoContas();
      },
      erro => {
        console.log (erro);
      }
    );
  }
}

@Component({
  selector: 'app-contas-edit',
  templateUrl: 'contas-edit-dialog.html',
})

export class ContasEditComponent {
  formContas = new FormGroup({
    contaNome: new FormControl(''),
    contaDescricao: new FormControl(''),
    contaCartao: new FormControl(false),
    contaCartaoFechamento: new FormControl(''),
    contaCartaoVencimento: new FormControl(''),
    contaAberturaData: new FormControl(''),
    contaAberturaValor: new FormControl('')
  });

  constructor(
    public dialogRef: MatDialogRef<ContasEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClientService,
    private userService: UserService,
    private formBuilder: FormBuilder) {
      this.createForm();
    }


  private createForm() {
    this.formContas = this.formBuilder.group({
      contaNome: ['', [Validators.required, Validators.minLength(2)] ],
      contaDescricao: ['', Validators.required],
      contaCartao: [false],
      contaAberturaData: [''],
      contaAberturaValor: [''],
      contaCartaoFechamento: [''],
      contaCartaoVencimento: ['']
    });
    this.formContas.enable();
    if (this.data.conta_id !== 'new') {
      this.formContas.patchValue({
        contaNome: this.data.conta_nome,
        contaDescricao: this.data.conta_descricao
      });
    } else {
      this.formContas.controls['contaAberturaData'].setValidators(Validators.required);
      this.formContas.controls['contaAberturaData'].setValidators(Validators.required);
    }
    this.formContas.controls['contaCartao'].valueChanges.subscribe(value => {
      if (value === true) {
        this.formContas.controls['contaCartaoFechamento'].setValidators(Validators.required);
        this.formContas.controls['contaCartaoFechamento'].setValidators(Validators.required);
      } else {
        this.formContas.controls['contaCartaoFechamento'].setValidators(null);
        this.formContas.controls['contaCartaoFechamento'].setValidators(null);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  editaConta(): void {
    const conta = new ContaList();
    if (this.data.conta_id === 'new') {
      // nova conta:
        conta.conta_nome = this.formContas.get('contaNome').value;
        conta.conta_descricao = this.formContas.get('contaDescricao').value;
        conta.conta_budget = true;
        conta.conta_reconciliado_data = this.formContas.get('contaAberturaData').value;
        conta.conta_reconciliado_valor = this.formContas.get('contaAberturaValor').value;
        conta.conta_cartao = this.formContas.get('contaCartao').value;
        if (conta.conta_cartao) {
          conta.conta_cartao_data_fechamento = this.formContas.get('contaCartaoFechamento').value;
          conta.conta_cartao_data_vencimento = this.formContas.get('contaCartaoVencimento').value;
        }
        this.userService.getUserDetail().subscribe(userDetail => {
          conta.diario_uid = userDetail.userLastDiarioUID;
        });
    } else {
      // atualização:
      conta.conta_id = +this.data.conta_id;
      conta.conta_nome =  this.formContas.get('contaNome').value;
      conta.conta_descricao =  this.formContas.get('contaDescricao').value;
    }

    if (this.formContas.valid) {
      this.formContas.disable();
      this.http.contaPost(conta).subscribe(
        sucesso => { 
          this.dialogRef.close(true);
        },
        erro => {
          console.log (erro);
          this.formContas.enable();
          this.formContas.get('contaNome').setErrors({'incorrect': true})
          this.formContas.setErrors(Validators.requiredTrue);
        }
      );
    }
  }

}
