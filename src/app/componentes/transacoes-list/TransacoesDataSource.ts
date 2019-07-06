import { DataSource } from "@angular/cdk/table";
import { TransacoesCascata, Subtransacoes, TransacoesTabular } from "./transacoes-list.component";
import { SubtransacoesTabular } from "../../data-model/subtransacoes-tabular";
import { BehaviorSubject, Observable, of } from "rxjs";
import { CollectionViewer } from "@angular/cdk/collections";
import { finalize, catchError } from "rxjs/operators";
import { HttpClientService } from "../../servicos/comunicacao/http_client.service";
import { isMoment, Moment } from "moment";
import { isNumber } from "util";
import * as moment from 'moment';

export interface Filtro {
  filtroColuna: string;
  filtroOperador: string;
  filtroValor: any;
}

export class TransacoesDataSource implements DataSource<TransacoesCascata> {
    private transacoesSubject = new BehaviorSubject<TransacoesCascata[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    public transacoes$ = this.transacoesSubject.asObservable();
    listaTransacoes: Map<string, TransacoesCascata> = new Map();
    listaFiltros: Filtro[] = [];

    constructor(private httpCliente: HttpClientService) {}

    connect(collectionViewer: CollectionViewer): Observable<TransacoesCascata[]> {
        return this.transacoesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.transacoesSubject.complete();
        this.loadingSubject.complete();
    }

    /**
     * Recupera as transações do servidor e salva no cache da aplicação e remove quaisquer filtros do cliente aplicado.
     * @param diarioUID Unique ID do Diário que as transações serão recuperadas
     * @param filter Filtro a ser aplicado no servidor. Por padrão todas as transações do diário serão recuperadas.
     * @param sortDirection ToDo: este argumento não possui função no momento.
     */
    loadTransacoes(diarioUID: string, filter = '', sortDirection = 'asc') {
        this.loadingSubject.next(true);
        
        this.httpCliente.subtransacoesTabularGet(diarioUID, filter)
        .pipe(
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(sucesso => {
            this.listaTransacoes.clear();
            let listaTransacoesMescladasPara: string[] =[];
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
                transacao_numero: element.transacao_numero,
                transacao_fatura_data: element.transacao_fatura_data,
                conta_id: element.conta_id,
                conta_nome: element.conta_nome,
                diario_uid: element.diario_uid,
                subtransacoes: []
              };
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
                if (element.transacao_merged_to_id) {
                  //essa transação está mesclada com outra transação, vamos achar esta outra transação e apontar:
                  //só devemos mesclar transações na mesma conta:
                  listaTransacoesMescladasPara.push(element.conta_id+'>'+element.transacao_merged_to_id);
                } else if (element.transacoes_item_id) {
                  // não é uma transaçao mesclada, então seguimos:
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
                  this.listaTransacoes.set(element.conta_id+'>'+element.transacao_id, novaTransacao);
                } else {
                  // não possui uma subtransação, vamos inserir apenas a transação:
                  this.listaTransacoes.set(element.conta_id+'>'+element.transacao_id, novaTransacao);
                }
              }
            }); 
            //Ok, agora vamos verificar quais transações possuem outras transações apontadas para ela:
            listaTransacoesMescladasPara.forEach(value => {
              this.listaTransacoes.get(value).transacao_merged_master = true;
            });
            let arrayTransacoes = Array.from(this.listaTransacoes.values());
            //arrayTransacoes = arrayTransacoes.sort(function(a, b){return moment.utc(a.transacao_data,'YYYY-MM-DD').diff(moment.utc(b.transacao_data,'YYYY-MM-DD'))});
            this.transacoesSubject.next(arrayTransacoes);
          },
          erro => {
            console.log(erro);
            this.transacoesSubject.next([]);
          });
    }

    /**
     * Esta função faz a atualização da transação no cache local (apenas a transação, não as subtransações) e também no servidor.
     * Lembre-se, parâmetros em JavaScript são passados por referência, você deve passar uma cópia da transação já alterada.
     * @param transacaoAlterada Uma cópia da transação já alterada
     * @param transacaoAntiga Opcional: uma cópia da transação antiga, obrigatório se for alterar a conta de origem
     */
    alteraTransacao(transacao: TransacoesCascata, transacaoAntiga?: TransacoesCascata) {
      if (!transacaoAntiga) {
        transacaoAntiga = this.listaTransacoes.get(transacao.conta_id+'>'+transacao.transacao_id);
      }
      if (transacao.conta_id !== transacaoAntiga.conta_id) {
        this.listaTransacoes.set(transacao.conta_id+'>'+transacao.transacao_id, transacao);
        this.listaTransacoes.delete(transacaoAntiga.conta_id+'>'+transacaoAntiga.transacao_id);
      } else {
        this.listaTransacoes.set(transacao.conta_id+'>'+transacao.transacao_id, transacao);
      }
      const colunasAAtualizar = Array('conta_id','transacao_numero','transacao_data','transacao_sacado','transacao_descricao','transacao_valor','transacao_conciliada','transacao_aprovada','transacao_merged_to_id','transacao_fatura_data');
      const atualizaJSON = {} as TransacoesTabular;
      colunasAAtualizar.forEach(coluna => {
        if (transacaoAntiga[coluna]!==transacao[coluna]) {
          atualizaJSON[coluna] = transacao[coluna];
        }
      });
      atualizaJSON.transacao_id = transacao.transacao_id;
      this.httpCliente.transacaoPost(atualizaJSON).subscribe(undefined, error => (console.log(error)));
      transacaoAntiga.subtransacoes.forEach(element => {
        //vamos deletar aquelas que nao existem mais:
        if (transacao.subtransacoes.indexOf(element) == -1) {
          let deletaSubtransacao = {} as SubtransacoesTabular;
          deletaSubtransacao.transacoes_item_id = element.transacoes_item_id;
          this.httpCliente.subtransacaoDelete(deletaSubtransacao);
        }
      });
      transacao.subtransacoes.forEach(element => {
        if (element.transacoes_item_id) {
          //atualiza:
          const atualizaJSONSub = {} as SubtransacoesTabular;
          atualizaJSONSub.transacoes_item_id = element.transacoes_item_id;
          atualizaJSONSub.transacoes_item_descricao = element.transacoes_item_descricao;
          atualizaJSONSub.transacoes_item_valor = element.transacoes_item_valor;
          atualizaJSONSub.subcategoria_id = element.subcategoria_id;
          atualizaJSONSub.transf_para_conta_id = element.transf_para_conta_id;
          this.httpCliente.subtransacaoPost(atualizaJSONSub).subscribe(undefined, error => (console.log(error)));
        } else {
          //nova subtransacao
        }
      });
      this.transacoesSubject.next(Array.from(this.listaTransacoes.values()));
    }

    novaTransacao(transacao: TransacoesCascata) {
      this.listaTransacoes.set(transacao.conta_id+'>'+transacao.transacao_id, transacao);
      this.transacoesSubject.next(Array.from(this.listaTransacoes.values()));
      const novaTransacao = {} as TransacoesTabular;
      novaTransacao.conta_id = transacao.conta_id;
      novaTransacao.transacao_data = transacao.transacao_data;
      novaTransacao.transacao_descricao = transacao.transacao_descricao;
      novaTransacao.transacao_fatura_data = transacao.transacao_fatura_data;
      novaTransacao.transacao_numero = transacao.transacao_numero;
      novaTransacao.transacao_sacado = transacao.transacao_sacado;
      novaTransacao.transacao_valor = transacao.transacao_valor;
      this.httpCliente.transacaoPost(novaTransacao).subscribe(null,error => {
        console.log(error);
      })
    }

    adicionaFiltro(filtro: Filtro) {
      this.listaFiltros.push(filtro);
      this.aplicaFiltros();
    }

    limpaFiltros() {
      this.listaFiltros.length = 0;
      this.aplicaFiltros();
    }

    removeFiltro(filtro: Filtro) {
      this.listaFiltros.splice(this.listaFiltros.indexOf(filtro),1);
      this.aplicaFiltros();
    }

    removeFiltroPorColuna(coluna: string) {
      this.listaFiltros.forEach(filtro => {
        if (filtro.filtroColuna.match(coluna))
          this.listaFiltros.splice(this.listaFiltros.indexOf(filtro),1);
      });
    }

    comparaValor(item1, item2, operacao) {
      if (moment.isMoment(item1) || moment.isMoment(item2)) {
        //um ou ambos os itens são datas, a comparação deve ser feita assim:
        let item11: Moment;
        let item22: Moment;
        if (isMoment(item1)) {
          item11 = item1;
        } else {
          item11 = moment.utc(item1,'YYYY-MM-DD');
        }
        if (isMoment(item2)) {
          item22 = item2;
        } else {
          item22 = moment.utc(item2,'YYYY-MM-DD');
        }
        if (operacao === '=') {
          return item11.isSame(item22);
        } else if (operacao === '>') {
          return item11.isAfter(item22);
        } else if (operacao === '<') {
          return item11.isBefore(item22);
        } else if (operacao === '>=') {
          return item11.isSameOrAfter(item22);
        } else if (operacao === '<=') {
          return item11.isSameOrBefore(item22);
        } else if (operacao === '<>' || operacao === '!=') {
          return !item11.isSame(item22);
        }
      } else if (isNumber(item1) && isNumber(item2)) {
        //a comparação é por número:
        const item11: number = item1;
        const item22: number = item2;
        if (operacao === '=') {
          return (item11 === item22);
        } else if (operacao === '>') {
          return (item11 > item22);
        } else if (operacao === '<') {
          return (item11 < item22);
        } else if (operacao === '>=') {
          return (item11 >= item22);
        } else if (operacao === '<=') {
          return (item11 <= item22);
        } else if (operacao === '<>' || operacao === '!=') {
          return (item11 !== item22);
        }
      } else {
        //vamos comparar como se fossem strings
        const item11: string = item1;
        const item22: string = item2;
        if (operacao === '%') {
          //vamos comparar se parte da string está ou não no item:
          if (item11.length >= item22.length) {
            return (item11.indexOf(item22) !== -1);
          } else {
            return (item22.indexOf(item11) !== -1);
          }
        } else {
          //vamos comparar se a string é extamente igual:
          return (item11.match(item22));
        }
      }
      
    }


    /**
     * Aplica filtros client-side no datasource recebido do servidor
     */
    aplicaFiltros() {
      let arrayTransacoes = Array.from(this.listaTransacoes.values());
      if (this.listaFiltros.length) {
        this.listaFiltros.forEach(filtro => {
          arrayTransacoes = arrayTransacoes.filter((item) => {
            return this.comparaValor(item[filtro.filtroColuna],filtro.filtroValor,filtro.filtroOperador);
          });
        });
        //arrayTransacoes = arrayTransacoes.sort(function(a, b){return moment.utc(a.transacao_data,'YYYY-MM-DD').diff(moment.utc(b.transacao_data,'YYYY-MM-DD'))});
        this.transacoesSubject.next(arrayTransacoes);
      } else {
        //arrayTransacoes = arrayTransacoes.sort(function(a, b){return moment.utc(a.transacao_data,'YYYY-MM-DD').diff(moment.utc(b.transacao_data,'YYYY-MM-DD'))});
        this.transacoesSubject.next(arrayTransacoes);
      }
    }
}