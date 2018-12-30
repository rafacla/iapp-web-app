import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSort } from '@angular/material';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';

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
}



@Component({
  selector: 'app-transacoes-list',
  templateUrl: './transacoes-list.component.html',
  styleUrls: ['./transacoes-list.component.css']
})
export class TransacoesListComponent implements OnInit {
  transacoesColumns: string[] = ['select', 'transacao_data', 'conta_nome', 'transacao_sacado', 'transacao_classificacao',
                            'transacao_descricao', 'transacao_valor_saida', 'transacao_valor_entrada', 'transacao_conciliada'];
  dataSource = new MatTableDataSource<TransacoesCascata>([]);
  selection = new SelectionModel<TransacoesCascata>(true, []);
  listaTransacoes: Map<string, TransacoesCascata> = new Map();
  listaContas: Map<number, string> = new Map();
  fDataInicio = new Date();
  fDataTermino = new Date();
  arrayContas = new Array();
  nomeContaAtual = "Todas as Contas";
  //Checkboxes dos filtros de contas:
  ckContasAll = true;
  ckContas: boolean[] = [];
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  saldoCompensado = 9999999.24;
  saldoACompensar = 9999999.24;
  saldoTotal = 999999.25;
  saldoSelecionados = 0;
  constructor(private http: HttpClientService, private userService: UserService) { }

  
  ngOnInit() {
    this.recuperaTransacoes();
    this.selection.changed.subscribe(event => {
      this.calcSaldoSelecionados();
    })
  }

  recuperaTransacoes() {
    let fDataInicio = new Date();
    let fDataTermino = new Date();
    this.userService.getUserDetail().subscribe(user => {
      this.http.subtransacoesTabularGet(user.userLastDiarioUID).subscribe(
        sucesso => {
          this.listaTransacoes.clear();
          sucesso.forEach(element => {
            const novaTransacao: TransacoesCascata = {
              transacao_id: element.transacao_id,
              transacao_data: element.transacao_data,
              transacao_descricao: element.transacao_descricao,
              transacao_merged_to_id: element.transacao_merged_to_id,
              transacao_sacado: element.transacao_sacado,
              transacao_valor: element.transacao_valor,
              transacao_aprovada: element.transacao_aprovada,
              transacao_conciliada: element.transacao_conciliada,
              conta_id: element.conta_id,
              conta_nome: element.conta_nome,
              diario_uid: element.diario_uid,
              subtransacoes: []
            };
            this.listaContas.set(element.conta_id,element.conta_nome);
            this.ckContas[element.conta_id] = true;
            if (!fDataInicio) {
              fDataInicio = new Date(element.transacao_data);
            } else if (fDataInicio > new Date(Date.parse(element.transacao_data))) {
              fDataInicio = new Date(element.transacao_data);
            }
            if (this.listaTransacoes.has(element.conta_id+'>'+element.transacao_id)) {
              // a transação já existe, vamos só adicionar eventuais subtransações
              const editaTransacao = this.listaTransacoes.get(element.conta_id+'>'+element.transacao_id);
              if (element.transacoes_item_id) {
                const novaSubtransacao: Subtransacoes = {
                  subcategoria_id: element.subcategoria_id,
                  subcategoria_nome: element.subcategoria_nome,
                  transacoes_item_descricao: element.transacoes_item_descricao,
                  transacoes_item_id: element.transacoes_item_id,
                  transacoes_item_valor: element.transacoes_item_valor,
                  transf_para_conta_id: element.transf_para_conta_id,
                  transf_para_conta_nome: element.transf_para_conta_nome,
                  transf_para_tipo: element.transf_para_tipo,
                  categoria_id: element.categoria_id,
                  categoria_nome: element.categoria_nome
                };
                editaTransacao.subtransacoes.push(novaSubtransacao);
                this.listaTransacoes.set(element.conta_id+'>'+element.transacao_id, editaTransacao);
              }
            } else {
              // a transação ainda não existe no nosso objeto, vamos criá-la e então adicionar eventuais subtransações:
              if (element.transacoes_item_id) {
                const novaSubtransacao: Subtransacoes = {
                  subcategoria_id: element.subcategoria_id,
                  subcategoria_nome: element.subcategoria_nome,
                  transacoes_item_descricao: element.transacoes_item_descricao,
                  transacoes_item_id: element.transacoes_item_id,
                  transacoes_item_valor: element.transacoes_item_valor,
                  transf_para_conta_id: element.transf_para_conta_id,
                  transf_para_conta_nome: element.transf_para_conta_nome,
                  transf_para_tipo: element.transf_para_tipo,
                  categoria_id: element.categoria_id,
                  categoria_nome: element.categoria_nome
                };
                novaTransacao.subtransacoes.push(novaSubtransacao);
              }
              this.listaTransacoes.set(element.conta_id+'>'+element.transacao_id, novaTransacao);
            }
          }); 
          this.fDataInicio = fDataInicio;
          this.dataSource.data = Array.from(this.listaTransacoes.values());
          this.dataSource.sort = this.sort;
          this.arrayContas = Array.from(this.listaContas.entries());
        },
        erro => {
          console.log(erro);
        });
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
    } else {
      this.ckContasAll = false;
      this.arrayContas.forEach(item => {
        if (item[0]===conta_id)
          this.ckContas[item[0]] = true;
        else
          this.ckContas[item[0]] = false;
      });
      this.nomeContaAtual = this.listaContas.get(conta_id);
    }
  }
  
  filtraPorData() {
    const dataInicio = this.fDataInicio;
    const dataTermino = this.fDataTermino;
    if (dataInicio && dataTermino) {
      this.dataSource.filterPredicate = (data: TransacoesCascata, filter: string) => 
        (new Date(Date.parse(data.transacao_data)) >=(dataInicio) && new Date(Date.parse(data.transacao_data)) <= (dataTermino));
        this.dataSource.filter = "!";
    } else if (dataInicio) {
      this.dataSource.filterPredicate = (data: TransacoesCascata, filter: string) => 
        (new Date(Date.parse(data.transacao_data)) >= (dataInicio));
        this.dataSource.filter = "!";
    } else if (dataTermino) {
      this.dataSource.filterPredicate = (data: TransacoesCascata, filter: string) => 
        (new Date(Date.parse(data.transacao_data)) <= (dataTermino));
        this.dataSource.filter = "!";
    } else {
      this.dataSource.filter = null;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  numeroSelecionados() {
    return this.selection.selected.length;
  }
  calcSaldoSelecionados() {
    this.selection.selected.reduce((a, b) => a + b.transacao_valor, 0);
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
