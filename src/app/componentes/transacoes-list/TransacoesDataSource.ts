import { DataSource } from "@angular/cdk/table";
import { TransacoesCascata, Subtransacoes } from "./transacoes-list.component";
import { BehaviorSubject, Observable, of } from "rxjs";
import { CollectionViewer } from "@angular/cdk/collections";
import { finalize, catchError } from "rxjs/operators";
import { HttpClientService } from "../../servicos/comunicacao/http_client.service";

export class TransacoesDataSource implements DataSource<TransacoesCascata> {
    private transacoesSubject = new BehaviorSubject<TransacoesCascata[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    public transacoes$ = this.transacoesSubject.asObservable();
    listaTransacoes: Map<string, TransacoesCascata> = new Map();

    constructor(private httpCliente: HttpClientService) {}

    connect(collectionViewer: CollectionViewer): Observable<TransacoesCascata[]> {
        return this.transacoesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.transacoesSubject.complete();
        this.loadingSubject.complete();
    }

    loadTransacoes(diarioUID: string, filter = '', sortDirection = 'asc') {
        this.loadingSubject.next(true);

        this.httpCliente.subtransacoesTabularGet(diarioUID, filter)
        .pipe(
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(sucesso => {
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
              this.transacoesSubject.next(Array.from(this.listaTransacoes.values()));
            }); 
          },
          erro => {
            console.log(erro);
            this.transacoesSubject.next([]);
          });
    }
}