import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { ContaList } from 'src/app/data-model/conta-list';
import { FaturaList, CartaoList } from 'src/app/data-model/fatura-list';

@Component({
  selector: 'app-faturas',
  templateUrl: './faturas.component.html',
  styleUrls: ['./faturas.component.css']
})
export class FaturasComponent implements OnInit {
  cartoesList: CartaoList[];
  faturaSelecionada: FaturaList;

  constructor(
    private http: HttpClientService,
    private userService: UserService,
    ) { }

  private atualizaListaCartoes() {
    this.userService.getUserDetail().subscribe(userDetail => { 
      this.http.cartoesGet(userDetail.userLastDiarioUID).subscribe(cartoes => {
        this.cartoesList = cartoes;
        cartoes.forEach(element => {
          this.http.faturasGet(element.conta_id.toString()).subscribe(faturaList => {
            element.faturas = faturaList.slice().reverse();
            if (element.faturas[0].conta_id == cartoes[0].conta_id) {
              this.faturaSelecionada = element.faturas[0];
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
