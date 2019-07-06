import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDatepicker, MatTable, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSort } from '@angular/material';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { TransacoesDataSource, Filtro } from './TransacoesDataSource';
import { Moment } from 'moment';
import * as moment from 'moment';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ContaList } from '../../data-model/conta-list';
import { CategoriasCascata, Subcategorias } from '../../data-model/categoria-cascata';

import {ErrorStateMatcher} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface DialogData {
  transacao: TransacoesCascata;
  contas: any;
  categorias: CategoriasCascata[];
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
  listaCategorias: CategoriasCascata[] = [];
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
      data: {transacao: transacao, contas: this.listaTodasContas, categorias: this.listaCategorias}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.transacaoAlterada) {
          this.transacoesDataSource.alteraTransacao(result.transacaoAlterada, result.transacaoAntiga);
        } else if (result.transacaoNova) {
          this.transacoesDataSource.novaTransacao(result.transacaoNova);
        }
        
      }
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
      this.http.categoriasTabularGet(user.userLastDiarioUID).subscribe(categorias => {
        categorias.forEach(categoria => {
          if (!this.listaCategorias.filter(x => x.categoria_id == categoria.categoria_id)[0]) {
            //ainda não existe, vamos criar:
            let novaCategoria = {} as CategoriasCascata;
            novaCategoria.categoria_id = categoria.categoria_id;
            novaCategoria.categoria_nome = categoria.categoria_nome;
            novaCategoria.categoria_ordem = categoria.categoria_ordem;
            novaCategoria.categoria_filhos = categoria.categoria_filhos;
            novaCategoria.categoria_description = categoria.categoria_description;
            novaCategoria.diario_uid = categoria.diario_uid;
            novaCategoria.subcategorias = [];
            this.listaCategorias.push(novaCategoria);
          }
          if (categoria.subcategoria_is) {
            if (!this.listaCategorias.filter(x => x.categoria_id == categoria.categoria_id)[0].subcategorias.filter(y => y.subcategoria_id == categoria.subcategoria_id)[0]) {
              //a subcategoria ainda não existe, vamos add:
              let novaSubcategoria = {} as Subcategorias;
              novaSubcategoria.subcategoria_id            = categoria.subcategoria_id;
              novaSubcategoria.subcategoria_nome          = categoria.subcategoria_nome;
              novaSubcategoria.subcategoria_ordem         = categoria.subcategoria_ordem;
              novaSubcategoria.subcategoria_description   = categoria.subcategoria_description;
              novaSubcategoria.subcategoria_carry         = categoria.subcategoria_carry;
              this.listaCategorias.filter(x => x.categoria_id == categoria.categoria_id)[0].subcategorias.push(novaSubcategoria);
            }
          }
        });
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
  styleUrls: ['./transacoes-edit-dialog.css']
})
export class TransacoesEditComponent {
  txtADistribuir = 0;
  transacaoCartao = false;
  transacaoFaturaDataMMMYY;
  formTransacoes = new FormGroup({
    conta_id: new FormControl(''),
    transacao_data: new FormControl(''),
    transacao_sacado: new FormControl(''),
    transacao_numero: new FormControl(''),
    transacao_descricao: new FormControl(''),
    transacao_fatura_data: new FormControl(''),
    transacao_valor_entrada: new FormControl(''),
    transacao_valor_saida: new FormControl('')
  });
  formTransacoesItensCategorias = new FormGroup({});
  formTransacoesItensTransferencias = new FormGroup({});
  itensCategoria: Subtransacoes[] = [];
  itensTransferencia: Subtransacoes[] = [];
  matcher = new MyErrorStateMatcher();
  
  constructor(
    public dialogRef: MatDialogRef<DialogData>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClientService,
    private userService: UserService,
    private formBuilder: FormBuilder) 
    {
      
      this.alternaTipoConta();
      if (this.data.transacao.subtransacoes) {
        this.data.transacao.subtransacoes.forEach(transacao => {
          if (transacao.transf_para_conta_id) {
            this.itensTransferencia.push(transacao);
          } else {
            this.itensCategoria.push(transacao);
          }
        });
      }
      this.createForm();
    }



  private createForm() {
    this.formTransacoes = this.formBuilder.group({
      conta_id: [this.data.transacao ? this.data.transacao.conta_id : '', [Validators.required] ],
      transacao_data: [{value: this.data.transacao ? this.data.transacao.transacao_data : '', disabled: true}, [Validators.required]],
      transacao_sacado: [this.data.transacao ? this.data.transacao.transacao_sacado : '', [Validators.required]],
      transacao_numero: [this.data.transacao ? this.data.transacao.transacao_numero : ''],
      transacao_descricao: [this.data.transacao ? this.data.transacao.transacao_descricao : '', [Validators.required]],
      transacao_fatura_data: [this.data.transacao ? this.data.transacao.transacao_fatura_data : ''],
      transacao_valor_entrada: [this.data.transacao ? (this.data.transacao.transacao_valor >=0 ? this.data.transacao.transacao_valor : 0) : ''],
      transacao_valor_saida: [this.data.transacao ? (this.data.transacao.transacao_valor <0 ? (-1)*this.data.transacao.transacao_valor : 0) : '']
    });
    this.formTransacoes.enable();
    let arrowItensCategorias = this.formBuilder.array([].map(x => this.formBuilder.group(x)));
    this.itensCategoria.forEach(itemCategoria => {
      arrowItensCategorias.push(
        this.formBuilder.group({
          subtransacao_id: itemCategoria.transacoes_item_id,
          subcategoria_id: itemCategoria.subcategoria_id,
          subtransacao_memo: itemCategoria.transacoes_item_descricao,
          subtransacao_valor_saida: (itemCategoria.transacoes_item_valor < 0 ? (-1)*itemCategoria.transacoes_item_valor : 0),
          subtransacao_valor_entrada: (itemCategoria.transacoes_item_valor > 0 ? itemCategoria.transacoes_item_valor : 0)
        })
      );
    });
    let arrowItensTransferencias = this.formBuilder.array([]);
    this.itensTransferencia.forEach(itemTransferencia => {
      arrowItensTransferencias.push(
        this.formBuilder.group({
          subtransacao_id: itemTransferencia.transacoes_item_id,
          transf_para_conta_id: itemTransferencia.transf_para_conta_id,
          subtransacao_memo: itemTransferencia.transacoes_item_descricao,
          subtransacao_valor_saida: (itemTransferencia.transacoes_item_valor < 0 ? (-1)*itemTransferencia.transacoes_item_valor : 0),
          subtransacao_valor_entrada: (itemTransferencia.transacoes_item_valor > 0 ? itemTransferencia.transacoes_item_valor : 0)
        })
      );
    });
    this.formTransacoesItensCategorias = this.formBuilder.group({
      arrowItensCategorias
    });
    this.formTransacoesItensTransferencias = this.formBuilder.group({
      arrowItensTransferencias
    });
    this.calculaADistribuir();
  }

  addItensCategorias() {
    const arrowItensCategorias = this.formTransacoesItensCategorias.get('arrowItensCategorias') as FormArray;
    arrowItensCategorias.push(this.formBuilder.group({
      subtransacao_id: '',
      subcategoria_id: '',
      subtransacao_memo: '',
      subtransacao_valor_saida: '',
      subtransacao_valor_entrada: ''
    }));
  }

  addItensTransferencias() {
    const arrowItensTransferencias = this.formTransacoesItensCategorias.get('arrowItensTransferencias') as FormArray;
    arrowItensTransferencias.push(this.formBuilder.group({
      subtransacao_id: '',
      transf_para_conta_id: '',
      subtransacao_memo: '',
      subtransacao_valor_saida: '',
      subtransacao_valor_entrada: ''
    }));
  }

  get itensCategorias() {
    return this.formTransacoesItensCategorias.get('arrowItensCategorias') as FormArray;
  }

  get itensTransferencias() {
    return this.formTransacoesItensTransferencias.get('arrowItensTransferencias') as FormArray;
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
        transacaoEditar.transacao_valor = this.formTransacoes.get('transacao_valor_entrada').value - this.formTransacoes.get('transacao_valor_saida').value;
        transacaoEditar.transacao_id = this.data.transacao.transacao_id;
        const Subtransacoes = [] as Subtransacoes[];
        //formTransacoesItensTransferencias arrowItensTransferencias
        //formTransacoesItensCategorias arrowItensCategorias
        this.formTransacoesItensCategorias.controls.arrowItensCategorias.value.forEach(element => {
          const subtransacao = {} as Subtransacoes;
          subtransacao.transacoes_item_id = element.controls.subtransacao_id.value;
          subtransacao.transacoes_item_descricao = element.controls.subtransacao_memo.value;
          subtransacao.transacoes_item_valor = element.controls.subtransacao_valor_entrada.value*1 - element.controls.subtransacao_valor_saida.value*1;
          subtransacao.subcategoria_id = element.controls.subcategoria_id.value;
          Subtransacoes.push(subtransacao);
        });
        this.formTransacoesItensTransferencias.controls.arrowItensTransferencias.value.forEach(element => {
          const subtransacao = {} as Subtransacoes;
          subtransacao.transacoes_item_id = element.controls.subtransacao_id.value;
          subtransacao.transacoes_item_descricao = element.controls.subtransacao_memo.value;
          subtransacao.transacoes_item_valor = element.controls.subtransacao_valor_entrada.value*1 - element.controls.subtransacao_valor_saida.value*1;
          subtransacao.transf_para_conta_id = element.controls.transf_para_conta_id.value;
          Subtransacoes.push(subtransacao);
        });
        transacaoEditar.subtransacoes = Subtransacoes;
        let resposta = {
          transacaoAlterada: transacaoEditar,
          transacaoAntiga: this.data.transacao};
        this.dialogRef.close(resposta);
      } else {
        // from inválido... informa ao user?
      }
    } else {
      // nova transação
      if (this.formTransacoes.valid) {
        const novaTransacao = {} as TransacoesCascata;
        novaTransacao.conta_id = this.formTransacoes.get('conta_id').value;
        novaTransacao.conta_nome = this.data.contas.filter(x => x.conta_id == novaTransacao.conta_id)[0].conta_nome;
        novaTransacao.transacao_data = this.formTransacoes.get('transacao_data').value;
        novaTransacao.transacao_sacado = this.formTransacoes.get('transacao_sacado').value;
        novaTransacao.transacao_numero = this.formTransacoes.get('transacao_numero').value;
        novaTransacao.transacao_descricao = this.formTransacoes.get('transacao_descricao').value;
        novaTransacao.transacao_fatura_data = this.formTransacoes.get('transacao_fatura_data').value;
        novaTransacao.transacao_valor = this.formTransacoes.get('transacao_valor').value;
        novaTransacao.subtransacoes = [];
        let resposta = {
          transacaoNova:novaTransacao
        };
        this.dialogRef.close(resposta);
      }
    }
  }

  alternaTipoConta(): void {
    let conta = this.data.contas.find(element => element.conta_id == this.formTransacoes.get('conta_id').value);
    if (conta) {
      this.transacaoCartao = (conta.conta_cartao == '1');
      if (this.transacaoCartao) {
        this.formTransacoes.get('transacao_fatura_data').setValidators(Validators.required);
        if (this.data.transacao) {
          const dataFatura = moment(this.data.transacao.transacao_fatura_data);
          if (dataFatura.isValid()) {
            this.formTransacoes.get('transacao_fatura_data').setValue(this.data.transacao.transacao_fatura_data);
            this.transacaoFaturaDataMMMYY = dataFatura.format('MMM-YY');
          } else if (moment(this.data.transacao.transacao_data).isValid()) {
            let data = moment(this.data.transacao.transacao_data).clone();
            if (+data.format('D') > +conta.conta_cartao_data_fechamento) {
              // entrará na próxima fatura
              data.add(1,'months').calendar();
              data.startOf('month');
            } else {
              // entrará na fatura do mês atual
              data.startOf('month');
            }
            this.formTransacoes.get('transacao_fatura_data').setValue(data.format('YYYY-MM-DD'));
            this.transacaoFaturaDataMMMYY = data.format('MMM-YY');
          }
        }       
      } else {
        this.formTransacoes.get('transacao_fatura_data').clearValidators();
      }
    }
  }

  chosenMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    this.formTransacoes.get('transacao_fatura_data').setValue(normlizedMonth);
    this.transacaoFaturaDataMMMYY = normlizedMonth.format('MMM-YY');
    datepicker.close();
  }

  calculaDataFatura() {
    let conta = this.data.contas.find(element => element.conta_id == this.formTransacoes.get('conta_id').value);
    if (conta && conta.conta_cartao == '1') {
      let data = moment(this.formTransacoes.get('transacao_data').value).clone();
        if (+data.format('D') > +conta.conta_cartao_data_fechamento) {
          // entrará na próxima fatura
          data.add(1,'months').calendar();
          data.startOf('month');
        } else {
          // entrará na fatura do mês atual
          data.startOf('month');
        }
        this.formTransacoes.get('transacao_fatura_data').setValue(data.format('YYYY-MM-DD'));
        this.transacaoFaturaDataMMMYY = data.format('MMM-YY');
    }
  }

  get transacao_fatura_data() {
    return this.formTransacoes.get('transacao_fatura_data');
  }

  getCategoria(subcategoria_id: number): [CategoriasCascata, Subcategorias] {
   const categoria = this.data.categorias.filter(x=> x.subcategorias.filter(y => y.subcategoria_id == subcategoria_id)[0])[0];
   if (!categoria) {
     return [undefined,undefined];
   }
   const subcategoria = categoria.subcategorias.filter(x => x.subcategoria_id == subcategoria_id)[0];
   return [categoria, subcategoria];
  }

  getCategoriaValor(subcategoria_id?: number): string | undefined {
    return subcategoria_id ? this.getCategoria(subcategoria_id)[0].categoria_nome+': '+this.getCategoria(subcategoria_id)[1].subcategoria_nome : undefined;
  }

  public displayFn = (key) => {
    if (key) {
      return this.getCategoriaValor(key);
    } else {
      return undefined;
    }
  };

  formataCategoria(categoria_id: number, subcategoria_id: number): string {
    if (this.data.categorias.filter(x=> x.categoria_id == categoria_id)[0]) {
      if (this.data.categorias.filter(x=> x.categoria_id == categoria_id)[0].subcategorias.filter(y=> y.subcategoria_id == subcategoria_id)[0]) {
        const categoriaNome = this.data.categorias.filter(x=> x.categoria_id == categoria_id)[0].categoria_nome;
        const subcategoriaNome = this.data.categorias.filter(x=> x.categoria_id == categoria_id)[0].subcategorias.filter(y=> y.subcategoria_id == subcategoria_id)[0].subcategoria_nome;
        return categoriaNome+': '+subcategoriaNome;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  calculaADistribuir() {
    const valorTransacao = 1*this.formTransacoes.get('transacao_valor_entrada').value+1*this.formTransacoes.get('transacao_valor_saida').value;
    let valorItens = 0;
    this.itensCategorias.controls.forEach(element => {
      valorItens += element.get('subtransacao_valor_entrada').value*1-element.get('subtransacao_valor_saida').value*1;
    });
    this.txtADistribuir = valorTransacao - valorItens;
  }
}