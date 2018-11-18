import { Component, OnInit } from '@angular/core';
import { ContaList } from '../../data-model/conta-list';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { TreeControl, NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';
import { ContaTree } from '../../data-model/conta-tree';

import { of } from 'rxjs';

interface ContasData {
  name: string;
  // level: number;
  children?: ContasData[];
}
// const GetLevel = (node: ContasData) => node.level;
// const IsExpandable = (node: ContasData) => node.children && node.children.length > 0;
const GetChildren = (node: ContasData) => of(node.children);
// const TC = new FlatTreeControl(GetLevel, IsExpandable);
const TC = new NestedTreeControl(GetChildren);

@Component({
  selector: 'app-contas-list',
  templateUrl: './contas-list.component.html',
  styleUrls: ['./contas-list.component.css']
})
export class ContasListComponent implements OnInit {
  contasList: ContaList[];
  contasDeletadas: boolean[] = [];
  dataSource: Object;
  tc = TC;
    
  data = [
    {
      name: 'Contas Corrente',
      children: []
    },
    {
      name: 'Cartões de Crédito',
      children: [
        { name: 'Santander Cartão'},
        { name: 'Itaú Cartão'},
      ]
    }
  ];
  

  hasChild(_: number, node: ContasData) {
    console.log(node);
    return node.children != null && node.children.length > 0;
  }

  constructor(
    private http: HttpClientService, 
    private userService: UserService) { 
      this.dataSource = {
          "chart": {
              "xAxisName": "Country",
              "yAxisName": "Reserves (MMbbl)",
              "numberSuffix": "K",
              "theme": "fusion",
          },
          // Chart Data
          "data": [{
              "label": "Venezuela",
              "value": "290"
          }, {
              "label": "Saudi",
              "value": "260"
          }, {
              "label": "Canada",
              "value": "180"
          }, {
              "label": "Iran",
              "value": "-140"
          }, {
              "label": "Russia",
              "value": "115"
          }, {
              "label": "UAE",
              "value": "100"
          }, {
              "label": "US",
              "value": "30"
          }, {
              "label": "China",
              "value": "30"
          }]
      };
    }

  ngOnInit() {
    let contasTree: ContaTree[] = [new ContaTree("Conta Corrente"), new ContaTree("Cartões")];
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.contasGet(userDetail.userLastDiarioUID).subscribe(
        contas => {
          this.contasList = contas;
          for (let conta of contas) {
            if (conta.conta_cartao) {
              contasTree[1].addItem(conta.conta_id,conta.conta_nome,conta.conta_reconciliado_valor);
            } else {
              contasTree[0].addItem(conta.conta_id,conta.conta_nome,conta.conta_reconciliado_valor);
            }
          }
          this.data = contasTree;
        }, 
        error => {
          this.contasList = []
        })
    });
  }

  private deletaConta(conta: ContaList) {
    let contaID = conta.conta_id;
    this.contasDeletadas[contaID] = true;
    /*
    this.http.diarioDelete(diarioUID).subscribe(
      sucesso => { 
        */
        const index = this.contasList.indexOf(conta);
        /*
       if (index !== -1) {
    */
          this.contasList.splice(index, 1);
    /*  }   
      },
      erro => { 
        console.log (erro);
      }
    );
    */
  }

}
