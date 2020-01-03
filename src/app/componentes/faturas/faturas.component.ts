import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { ContaList } from 'src/app/data-model/conta-list';
import { FaturaList, CartaoList, TransacoesCartaoList } from 'src/app/data-model/fatura-list';

@Component({
  selector: 'app-faturas',
  templateUrl: './faturas.component.html',
  styleUrls: ['./faturas.component.css']
})
export class FaturasComponent implements OnInit {
  cartoesList: CartaoList[];
  faturaSelecionada: FaturaList;
  transacoesList: TransacoesCartaoList[];
  displayedColumns: string[] = ['transacao_data','transacao_sacado','transacao_descricao','transacao_valor'];

  constructor(
    private http: HttpClientService,
    private userService: UserService,
    ) { }


  selecionaFatura(fatura: FaturaList) {
    this.http.transacoesCartaoGet(fatura.conta_id.toString(),fatura.fatura_data).subscribe(transacoes => {
      this.transacoesList = transacoes;
    });
  }

  private atualizaListaCartoes() {
    this.userService.getUserDetail().subscribe(userDetail => { 
      this.http.cartoesGet(userDetail.userLastDiarioUID).subscribe(cartoes => {
        this.cartoesList = cartoes;
        cartoes.forEach(element => {
          this.http.faturasGet(element.conta_id.toString()).subscribe(faturaList => {
            element.faturas = faturaList.slice().reverse();
            if (element.faturas[0].conta_id == cartoes[0].conta_id) {
              this.faturaSelecionada = element.faturas[0];
              this.selecionaFatura(this.faturaSelecionada);
            }
          });
        });
      })
    });
  }

  ngOnInit() {
    this.atualizaListaCartoes();
  }

}
