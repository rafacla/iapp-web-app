import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDatepicker, MatTable, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSort } from '@angular/material';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { TransacoesDataSource, Filtro } from './TransacoesDataSource';
import { Moment } from 'moment';
import * as moment from 'moment';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ContaList } from '../../data-model/conta-list';


export interface DialogData {
  transacao: TransacoesCascata;
  contas: any;
}
export interface TransacoesTabular {
  transacao_id: number;
  transacao_data: string;
  transacao_sacado: string;
  transacao_descricao: string;
  transacao_valor: number;
  transacao_conciliada: boolean;
  transacao_aprovada: boolean;
  transacao_merged_to_id: number;
  transacao_numero: string;
  transacao_fatura_data: string;
  conta_id: number;
  conta_nome: string;
  diario_uid: string;
  transacoes_item_id: number;
  transacoes_item_descricao: string;
  transacoes_item_valor: number;
  categoria_id: number;
  categoria_nome: string;
  subcategoria_id: number;
  subcategoria_nome: string;
  transf_para_conta_id: number;
}

export interface Subtransacoes {
  transacoes_item_id: number;
  transacoes_item_descricao: string;
  transacoes_item_valor: number;
  categoria_id: number;
  categoria_nome: string;
  subcategoria_id: number;
  subcategoria_nome: string;
  transf_para_conta_id: number;
  transf_para_conta_nome: string;
  transf_para_tipo: string;
}

export interface TransacoesCascata {
  transacao_id: number;
  transacao_data: string;
  transacao_sacado: string;
  transacao_descricao: string;
  transacao_valor: number;
  transacao_conciliada: boolean;
  transacao_aprovada: boolean;
  transacao_merged_to_id: number;
  transacao_numero: string;
  transacao_fatura_data: string;
  conta_id: number;
  conta_nome: string;
  diario_uid: string;
  subtransacoes: Subtransacoes[];
  transacao_merged_master?: boolean; //Este item não vem do servidor (deveria?), calculamos localmente (a SQL já está demasiadamente complexa, ok?)
}

@Component({
  selector: 'app-transacoes-list',
  templateUrl: './transacoes-list.component.html',
  styleUrls: ['./transacoes-list.component.css']
})
export class TransacoesListComponent implements OnInit {
  transacoesColumns: string[] = ['select', 'transacao_data', 'conta_nome', 'transacao_sacado', 'transacao_classificacao',
                            'transacao_descricao', 'transacao_valor_saida', 'transacao_valor_entrada', 'transacao_conciliada'];
  //dataSource = new MatTableDataSource<TransacoesCascata>([]);
  transacoesDataSource: TransacoesDataSource;
  selection = new SelectionModel<TransacoesCascata>(true, []);
  //listaTransacoes: Map<string, TransacoesCascata> = new Map();
  listaContas: Map<number, string> = new Map();
  fDataInicio = moment.utc();
  fDataTermino = moment.utc();
  arrayContas = new Array();
  listaTodasContas: ContaList[] = [];
  nomeContaAtual = "Todas as Contas";

  //Checkboxes dos filtros de contas:
  ckContasAll = true;
  ckContas: boolean[] = [];

  //Mat-Table
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  
  //Variáveis de Saldo
  saldoCompensado = 0;
  saldoACompensar = 0;
  saldoTotal = 0;
  saldoSelecionados = 0;


  constructor(
    private http: HttpClientService,
    private userService: UserService,
    public dialog: MatDialog) {}

  openDialog(transacao?: TransacoesCascata): void {
    if (!transacao) {
      transacao = null;
    }
    const dialogRef = this.dialog.open(TransacoesEditComponent, {
      width: '1024px',
      data: {transacao: transacao, contas: this.listaTodasContas}
    });

    dialogRef.afterClosed().subscribe(result => {
      //const Transacao = <TransacoesTabular>result;
      this.transacoesDataSource.alteraTransacao(result.transacaoAlterada, result.transacaoAntiga);
    });
  }

  ngOnInit() {
    this.userService.getUserDetail().subscribe(user => {
      this.transacoesDataSource = new TransacoesDataSource(this.http);
      this.transacoesDataSource.loadTransacoes(user.userLastDiarioUID);
      this.transacoesDataSource.transacoes$.subscribe(transacoes => {
        this.saldoCompensado = 0;
        this.saldoACompensar = 0;
        this.saldoTotal = 0;
        transacoes.forEach(element => {
          if (!this.fDataInicio) {
            this.fDataInicio = moment.utc();
          } else if (this.fDataInicio.isAfter(moment.utc(element.transacao_data,'YYYY-MM-DD'))) {
            this.fDataInicio = moment.utc(element.transacao_data,'YYYY-MM-DD');
          }
          this.saldoTotal += +element.transacao_valor;
          if (+element.transacao_conciliada) {
            this.saldoCompensado += +element.transacao_valor;
          } else {
            this.saldoACompensar += +element.transacao_valor;
          }
          this.listaContas.set(element.conta_id,element.conta_nome);
          this.ckContas[element.conta_id] = true;
        });
        this.arrayContas = Array.from(this.listaContas.entries());
      });
      this.http.contasGet(user.userLastDiarioUID).subscribe(contas => {
        this.listaTodasContas = contas;
      });
    });

    this.selection.changed.subscribe(event => {
      this.calcSaldoSelecionados();
    });
  }

  filtraPorConta(conta_id) {
    event.preventDefault();
    if (conta_id === 'all') {
      this.nomeContaAtual = "Todas as Contas";
      this.arrayContas.forEach(item => {
        this.ckContas[item[0]] = true;
      });
      this.ckContasAll = true;
      this.transacoesDataSource.removeFiltroPorColuna('conta_nome');
      this.transacoesDataSource.aplicaFiltros();
    } else {
      this.ckContasAll = false;
      this.arrayContas.forEach(item => {
        if (item[0]===conta_id)
          this.ckContas[item[0]] = true;
        else
          this.ckContas[item[0]] = false;
      });
      this.nomeContaAtual = this.listaContas.get(conta_id);
      this.transacoesDataSource.removeFiltroPorColuna('conta_nome');
      const filtro: Filtro = {
        filtroColuna: 'conta_nome',
        filtroOperador: '=',
        filtroValor: this.nomeContaAtual
      };
      this.transacoesDataSource.adicionaFiltro(filtro);
    }
  }
  
  filtraPorData() {
    const dataInicio: Moment = this.fDataInicio;
    const dataTermino:Moment = this.fDataTermino;
    this.transacoesDataSource.removeFiltroPorColuna('transacao_data');
    if (dataInicio) {
      const filtroInicio: Filtro = {
        filtroColuna: 'transacao_data',
        filtroOperador: '>=',
        filtroValor: dataInicio
      };
      this.transacoesDataSource.adicionaFiltro(filtroInicio);
    }
    if (dataTermino) {
      const filtroTermino: Filtro = {
        filtroColuna: 'transacao_data',
        filtroOperador: '<=',
        filtroValor: dataTermino
      };
      this.transacoesDataSource.adicionaFiltro(filtroTermino);
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.transacoesDataSource.listaTransacoes.size;
    return numSelected === numRows;
  }
  numeroSelecionados() {
    return this.selection.selected.length;
  }
  calcSaldoSelecionados() {
    this.saldoSelecionados = +this.selection.selected.reduce((a, b) => +a + +b.transacao_valor, 0);
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.transacoesDataSource.listaTransacoes.forEach(row => this.selection.select(row));
  }

  alternaConciliada(transacao: TransacoesCascata, transacao_conciliada) {
    event.stopPropagation();
    let copyTransacao = { ...transacao };
    copyTransacao.transacao_conciliada = transacao_conciliada;
    this.transacoesDataSource.alteraTransacao(copyTransacao);
  }
}

@Component({
  selector: 'app-transacoes-edit',
  templateUrl: 'transacoes-edit-dialog.html',
  styleUrls: ['./transacoes-list.component.css']
})
export class TransacoesEditComponent {
  transacaoCartao = false;
  transacaoFaturaDataMMMYY;
  formTransacoes = new FormGroup({
    conta_id: new FormControl(''),
    transacao_data: new FormControl(''),
    transacao_sacado: new FormControl(''),
    transacao_numero: new FormControl(''),
    transacao_descricao: new FormControl(''),
    transacao_fatura_data: new FormControl(''),
    transacao_valor: new FormControl('')
  });
  

  constructor(
    public dialogRef: MatDialogRef<DialogData>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClientService,
    private userService: UserService,
    private formBuilder: FormBuilder) {
      this.createForm();
    }



  private createForm() {
    this.formTransacoes = this.formBuilder.group({
      conta_id: [this.data.transacao ? this.data.transacao.conta_id : '', [Validators.required] ],
      transacao_data: [{value: this.data.transacao ? this.data.transacao.transacao_data : '', disabled: true}, [Validators.required]],
      transacao_sacado: [this.data.transacao ? this.data.transacao.transacao_sacado : '', [Validators.required]],
      transacao_numero: [this.data.transacao ? this.data.transacao.transacao_numero : '', [Validators.required]],
      transacao_descricao: [this.data.transacao ? this.data.transacao.transacao_descricao : '', [Validators.required]],
      transacao_fatura_data: [this.data.transacao ? this.data.transacao.transacao_fatura_data : ''],
      transacao_valor: [this.data.transacao ? this.data.transacao.transacao_valor : '']
    });
    this.formTransacoes.enable();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  editarTransacao(): void {
    if (this.data.transacao) {
      // atualização
      if (this.formTransacoes.valid) {
        const transacaoEditar = {} as TransacoesCascata;
        transacaoEditar.conta_id = this.formTransacoes.get('conta_id').value;
        transacaoEditar.conta_nome = this.data.contas.filter(x => x.conta_id == transacaoEditar.conta_id)[0].conta_nome;
        transacaoEditar.transacao_data = this.formTransacoes.get('transacao_data').value;
        transacaoEditar.transacao_sacado = this.formTransacoes.get('transacao_sacado').value;
        transacaoEditar.transacao_numero = this.formTransacoes.get('transacao_numero').value;
        transacaoEditar.transacao_descricao = this.formTransacoes.get('transacao_descricao').value;
        transacaoEditar.transacao_fatura_data = this.formTransacoes.get('transacao_fatura_data').value;
        transacaoEditar.transacao_valor = this.formTransacoes.get('transacao_valor').value;
        transacaoEditar.transacao_id = this.data.transacao.transacao_id;
        transacaoEditar.subtransacoes = this.data.transacao.subtransacoes;
        let resposta = {
          transacaoAlterada: transacaoEditar,
          transacaoAntiga: this.data.transacao};
        this.dialogRef.close(resposta);
      } else {

      }
    } else {
      // nova transação
    }
  }

  alternaTipoConta(): void {
    let conta = this.data.contas.find(element => element.conta_id == this.formTransacoes.get('conta_id').value);
    this.transacaoCartao = (conta.conta_cartao == '1');
    if (this.transacaoCartao) {
      this.formTransacoes.get('transacao_fatura_data').setValidators(Validators.required);
    } else {
      this.formTransacoes.get('transacao_fatura_data').setValidators(Validators.nullValidator);
    }
  }

  chosenMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.formTransacoes.get('transacao_fatura_data').setValue(normlizedMonth);
    this.transacaoFaturaDataMMMYY = normlizedMonth.format('MMM-YY');
    datepicker.close();
  }

  calculaDataFatura() {
    let conta = this.data.contas.find(element => element.conta_id == this.formTransacoes.get('conta_id').value);
    if (conta.conta_cartao == '1') {
      let data = this.formTransacoes.get('transacao_data').value.clone();
        if (+data.format('D') > +conta.conta_cartao_data_fechamento) {
          // entrará na próxima fatura
          data.add(1,'months').calendar();
          data.startOf('month');
        } else {
          // entrará na fatura do mês atual
          data.startOf('month');
        }
        this.formTransacoes.get('transacao_fatura_data').setValue(data);
        this.transacaoFaturaDataMMMYY = data.format('MMM-YY');
    }
  }
}