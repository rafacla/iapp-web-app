import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSort } from '@angular/material';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { TransacoesDataSource, Filtro } from './TransacoesDataSource';
import { Moment } from 'moment';
import * as moment from 'moment';

export interface TransacoesTabular {
  transacao_id: number;
  transacao_data: string;
  transacao_sacado: string;
  transacao_descricao: string;
  transacao_valor: number;
  transacao_conciliada: true;
  transacao_aprovada: true;
  transacao_merged_to_id: number;
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
  transacao_conciliada: true;
  transacao_aprovada: true;
  transacao_merged_to_id: number;
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


  constructor(private http: HttpClientService, private userService: UserService) { }

  
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
