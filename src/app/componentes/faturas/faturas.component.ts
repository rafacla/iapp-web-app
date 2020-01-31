import { Component, OnInit, Inject } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { ContaList } from 'src/app/data-model/conta-list';
import { FaturaList, CartaoList, TransacoesCartaoList } from 'src/app/data-model/fatura-list';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDatepicker } from '@angular/material';
import * as moment from 'moment';
import { TransacaoPost } from 'src/app/data-model/transacao-post';
import { TransacoesTabular, TransacoesCascata } from '../transacoes-list/transacoes-list.component';
import { CategoriasCascata, Subcategorias } from 'src/app/data-model/categoria-cascata';
import { Subject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';


export interface DialogData {
  transacaoAntiga: TransacoesCartaoList;
  transacao_fatura_data: string;
  transacao_id: number;
  transacao_nova_fatura_data: string;
}

export interface TransacaoDialogData {
  transacaoAntiga?: TransacoesCartaoList;
  transacaoNova?: TransacoesCartaoList;
  conta_id: number;
  transacao_fatura_data?: string;
  transacao_id?: number;
  categorias: CategoriasCascata[];
}

@Component({
  selector: 'app-faturas',
  templateUrl: './faturas.component.html',
  styleUrls: ['./faturas.component.css']
})
export class FaturasComponent implements OnInit {
  cartoesList: CartaoList[];
  faturaSelecionada: FaturaList = {
    fatura_data: null,
    fatura_index: null,
    fatura_valor: null,
    fatura_valor_pago: null,
    conta_id: null,
    conta_nome: null,
    conta_fechamento: null,
    conta_vencimento: null
  };
  categorias: CategoriasCascata[] = [];
  transacoesList: TransacoesCartaoList[];
  displayedColumns: string[] = ['select','transacao_fatura_data','transacao_data','transacao_sacado','transacao_descricao','transacao_valor'];
  selection = new SelectionModel<TransacoesCartaoList>(true, []);

  constructor(
    private http: HttpClientService,
    private userService: UserService,
    public dialog: MatDialog
    ) { }

  ngOnInit() {
    this.atualizaListaCartoes();
    this.atualizaCategorias();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.transacoesList.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.transacoesList.forEach(row => this.selection.select(row));
  }

  atualizaCategorias()  { 
    this.userService.getUserDetail().subscribe(user => {
      this.http.categoriasTabularGet(user.userLastDiarioUID).subscribe(categorias => {
        categorias.forEach(categoria => {
          if (!this.categorias.filter(x => +x.categoria_id == +categoria.categoria_id)[0]) {
            //ainda não existe, vamos criar:
            let novaCategoria = {} as CategoriasCascata;
            novaCategoria.categoria_id = +categoria.categoria_id;
            novaCategoria.categoria_nome = categoria.categoria_nome;
            novaCategoria.categoria_ordem = categoria.categoria_ordem;
            novaCategoria.categoria_filhos = categoria.categoria_filhos;
            novaCategoria.categoria_description = categoria.categoria_description;
            novaCategoria.diario_uid = categoria.diario_uid;
            novaCategoria.subcategorias = [];
            this.categorias.push(novaCategoria);
          }
          if (categoria.subcategoria_is) {
            if (!this.categorias.filter(x => x.categoria_id == +categoria.categoria_id)[0].subcategorias.filter(y => +y.subcategoria_id == +categoria.subcategoria_id)[0]) {
              //a subcategoria ainda não existe, vamos add:
              let novaSubcategoria = {} as Subcategorias;
              novaSubcategoria.subcategoria_id            = +categoria.subcategoria_id;
              novaSubcategoria.subcategoria_nome          = categoria.subcategoria_nome;
              novaSubcategoria.subcategoria_ordem         = categoria.subcategoria_ordem;
              novaSubcategoria.subcategoria_description   = categoria.subcategoria_description;
              novaSubcategoria.subcategoria_carry         = categoria.subcategoria_carry;
              this.categorias.filter(x => +x.categoria_id == +categoria.categoria_id)[0].subcategorias.push(novaSubcategoria);
            }
          }
        });
      });
    });
  }

  openDialog(item: TransacoesCartaoList): void {
    let transacao_fatura_data = item.fatura_data;
    let transacao_id = item.transacao_id;
    const dialogRef = this.dialog.open(FaturaDataDialog, {
      width: '250px',
      data: {transacaoAntiga: item, transacao_fatura_data: transacao_fatura_data, transacao_id: transacao_id}
    });

    dialogRef.afterClosed().subscribe(result => {
      let transacao: TransacoesTabular = {
        transacao_id: result.transacao_id,
        transacao_fatura_data: result.transacao_nova_fatura_data
      }
      if (result.transacao_fatura_data != result.transacao_nova_fatura_data) {
        this.http.transacaoPost(transacao).subscribe(resultado => {
          let faturas = this.cartoesList.find(i => i.conta_id == result.transacaoAntiga.conta_id).faturas;
          let faturaAntiga = faturas.find(i => i.fatura_data == result.transacao_fatura_data);
          faturaAntiga.fatura_valor -= result.transacaoAntiga.transacao_valor;
          this.atualizaListaCartoes(faturaAntiga.fatura_data, faturaAntiga.conta_id);
        });
      }
    });
  }

  addTransacao(transacao?: TransacoesCascata): void {
    
    const dialogRef = this.dialog.open(FaturaTransacaoDialog, {
      width: '600px',
      data: {
        transacaoAntiga: (transacao ? transacao : null),
        conta_id: this.faturaSelecionada.conta_id,
        transacao_fatura_data: this.faturaSelecionada.fatura_data,
        categorias: this.categorias
       },
       panelClass: 'fatura-transacao-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.atualizaListaCartoes(this.faturaSelecionada.fatura_data,this.faturaSelecionada.conta_id);
      }
    });
  }

  selecionaFatura(fatura: FaturaList) {
    let transacaoEmBranco:TransacoesCartaoList = {
      transacao_sacado: 'Carregando...',
      transacao_id: null,
      transacao_data: null,
      fatura_data: null,
      transacao_descricao: null,
      transacao_valor: null,
      transacao_numero: null,
      subtransacoes: null,
      conta_id: null
    }
    this.faturaSelecionada = fatura;
    let transacoesCarregando: TransacoesCartaoList[] = [transacaoEmBranco] ;
    this.transacoesList = transacoesCarregando;
    this.http.transacoesCartaoGet(fatura.conta_id.toString(),fatura.fatura_data).subscribe(transacoes => {
      this.transacoesList = transacoes.sort((n1,n2) => moment.utc(n1.transacao_data).diff(moment.utc(n2.transacao_data)));
    }, error => {
      this.transacoesList = [];      
    });
    this.selection.clear();
  }

  private atualizaListaCartoes(faturaSelecionada?: string, conta_id?: number) {
    this.userService.getUserDetail().subscribe(userDetail => { 
      this.http.cartoesGet(userDetail.userLastDiarioUID).subscribe(cartoes => {
        this.cartoesList = cartoes;
        cartoes.forEach(element => {
          this.http.faturasGet(element.conta_id.toString()).subscribe(faturaList => {
            element.faturas = Array.from(faturaList).slice().reverse();
            if (faturaSelecionada && conta_id) {
              if (element.conta_id == conta_id) {
                let fatura = element.faturas.find(i => i.fatura_data == faturaSelecionada);
                if (fatura) {
                  this.selecionaFatura(fatura);
                }
              }
            } else {
              if (element.faturas[0].conta_id == cartoes[0].conta_id) {
                this.selecionaFatura(element.faturas[0]);
              }
            } 
          });
        });
      })
    });
  }

  private deletaSelecionados() {
    let transacao_id = [];
    this.selection.selected.forEach(selected => {
      transacao_id.push(selected.transacao_id)
    })
    this.http.transacaoDeleteBatch(transacao_id).subscribe(sucesso => {
      this.atualizaListaCartoes(this.faturaSelecionada.fatura_data, this.faturaSelecionada.conta_id);
    });
  }

}

@Component({
  selector: 'fatura-data-dialog',
  templateUrl: 'fatura-data-dialog.html',
})
export class FaturaDataDialog {
  transacaoFaturaDataMMMYY: string;
  transacaoFaturaData: moment.Moment;
  transacaoFaturaDataError: boolean;
  transacao: TransacoesCascata;

  constructor(
    public dialogRef: MatDialogRef<FaturaDataDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    this.transacaoFaturaDataMMMYY = moment.utc(this.data.transacao_fatura_data).format('MMM-YY');
    this.transacaoFaturaData = moment.utc(this.data.transacao_fatura_data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.transacaoFaturaDataError = !this.transacaoFaturaData.isValid();
    if (this.transacaoFaturaData.isValid())
      this.dialogRef.close(this.data);      
  }

  chosenMonthHandler(normlizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    this.transacaoFaturaData = normlizedMonth.clone();
    this.data.transacao_nova_fatura_data = normlizedMonth.format('YYYY-MM-DD');
    this.transacaoFaturaDataMMMYY = normlizedMonth.format('MMM-YY');
    datepicker.close();
  }

}

@Component({
  selector: 'fatura-transacao-dialog',
  templateUrl: 'fatura-transacao-dialog.html'
})
export class FaturaTransacaoDialog {
  txtADistribuir: string = '0';
  transacao: TransacoesCartaoList;
  categoriasFiltradas = new Subject<CategoriasCascata[]>();
  clicked = false; 
  count_enviadas = 0;
  count_recebidas = 0;
  avisa_recebido = new Subject<number>();
  

  constructor(
    public dialogRef: MatDialogRef<FaturaTransacaoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TransacaoDialogData,
    private http: HttpClientService) {}

  ngOnInit(): void {
    this.categoriasFiltradas.next(this.data.categorias);
    if (this.data.transacaoAntiga) {
      this.transacao = JSON.parse(JSON.stringify(this.data.transacaoAntiga));
      if (!this.transacao.subtransacoes) {
        this.transacao.subtransacoes = [{
            transacao_id: null,
            transacoes_item_id: null,
            transacoes_item_descricao: '',
            transacoes_item_valor: 0,
            subcategoria_id: null
          }];
      }
    }
    else 
      this.transacao = {
        transacao_id: null,
        transacao_data: '',
        transacao_descricao: '',
        transacao_sacado: '',
        transacao_numero: '',
        transacao_valor: 0,
        fatura_data: null,
        conta_id: this.data.conta_id,
        subtransacoes: [
          {
            transacao_id: null,
            transacoes_item_id: null,
            transacoes_item_descricao: '',
            transacoes_item_valor: 0,
            subcategoria_id: null
          }
        ]
      }
      this.calculaADistribuir()
      this.avisa_recebido.subscribe(recebidas => {
        if (recebidas >= this.count_enviadas)
          this.dialogRef.close(this.data);
      })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(tooltip): void {
    if (parseFloat(this.txtADistribuir) != 0) {
      tooltip.show();
    } else {
      this.clicked = true;
      let transacao_id = 0;
      this.data.transacaoNova = this.transacao;
      if (this.data.transacaoNova.transacao_id != null) {
        transacao_id = this.data.transacaoNova.transacao_id;
      }
      
      
      this.count_enviadas++;
      let transacaoPost = JSON.parse(JSON.stringify(this.data.transacaoNova));
      transacaoPost.transacao_valor = (-1)*transacaoPost.transacao_valor;
      transacaoPost.transacao_fatura_data = this.data.transacao_fatura_data;
      this.http.transacaoPost(transacaoPost).subscribe(resposta => {
        if (transacao_id == 0) {
          transacao_id = resposta.id;
          this.data.transacaoNova.transacao_id = transacao_id;
        }        
        this.count_recebidas++;
        this.avisa_recebido.next(this.count_recebidas);
        this.data.transacaoNova.subtransacoes.forEach(subtransacao => {
          if (subtransacao.transacoes_item_id == null) {
            //esta é uma nova subtransacao, vamos criar:
            this.count_enviadas++;
            subtransacao.transacao_id = transacao_id;
            let subtransacaoPost = JSON.parse(JSON.stringify(subtransacao));
            subtransacaoPost.transacoes_item_valor = (-1)*subtransacaoPost.transacoes_item_valor;
            this.http.subtransacaoPost(subtransacaoPost).subscribe(sucesso => {
              this.count_recebidas++;
              this.avisa_recebido.next(this.count_recebidas);
              subtransacao.transacoes_item_id = sucesso.id;
            });
          } else {
            this.count_enviadas++;
            let subtransacaoPost = JSON.parse(JSON.stringify(subtransacao));
            subtransacaoPost.transacoes_item_valor = (-1)*subtransacaoPost.transacoes_item_valor;
            this.http.subtransacaoPost(subtransacaoPost).subscribe(sucesso => {
              this.count_recebidas++;
              this.avisa_recebido.next(this.count_recebidas);
            })
          }
        });
      });
      
      this.data.transacaoAntiga.subtransacoes.forEach(subtransacaoAntiga => {
        let encontrou = false;
        this.data.transacaoNova.subtransacoes.forEach(subtransacaoNova => {
          if (subtransacaoAntiga.transacoes_item_id == subtransacaoNova.transacoes_item_id) {
            encontrou = true;
          }
        });
        if (!encontrou) {
            //não existe mais, vamos deletar:
            this.count_enviadas++;
            this.http.subtransacaoDelete({transacoes_item_id: [subtransacaoAntiga.transacoes_item_id]}).subscribe(sucesso => {
              this.count_recebidas++;
              this.avisa_recebido.next(this.count_recebidas);
            })
        }
      });
      
    }
  }

  calculaADistribuir() {
    let valorItens: number = 0;
    this.transacao.subtransacoes.forEach(subtransacao => {
      valorItens += 1*(subtransacao.transacoes_item_valor ? subtransacao.transacoes_item_valor : 0 );
    });
    this.txtADistribuir = (this.transacao.transacao_valor - valorItens).toFixed(2);
  }

  editarTransacao() {

  }

  delItemCategoria(item) {
    this.transacao.subtransacoes.splice(this.transacao.subtransacoes.indexOf(item),1);
    this.calculaADistribuir();
  }

  addItensCategorias() {
    this.transacao.subtransacoes.push(
      {
        transacoes_item_id: null,
        transacoes_item_descricao: '',
        transacoes_item_valor: 0,
        subcategoria_id: null,
        transacao_id: this.data.transacao_id
      });
  }

  public displayFn = (key) => {
    if (key) {
      return this.getCategoriaValor(key);
    } else {
      return undefined;
    }
  };

  getCategoriaValor(subcategoria_id?: number): string | undefined {
    return subcategoria_id ? this.getCategoria(subcategoria_id)[0].categoria_nome+': '+this.getCategoria(subcategoria_id)[1].subcategoria_nome : undefined;
  }

  getCategoria(subcategoria_id: number): [CategoriasCascata, Subcategorias] {
    const categoria = this.data.categorias.filter(x=> x.subcategorias.filter(y => y.subcategoria_id == subcategoria_id)[0])[0];
    if (!categoria) {
      return [undefined,undefined];
    }
    const subcategoria = categoria.subcategorias.filter(x => x.subcategoria_id == subcategoria_id)[0];
    return [categoria, subcategoria];
   }

   filterCategorias(search: string) {
    let categorias = [] as CategoriasCascata[];
    if (search) {
      search = search.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      this.data.categorias.forEach(categoria => {
        categoria.subcategorias.forEach(subcategoria => {
          if (subcategoria.subcategoria_nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search.toLowerCase())) {
            if (categorias.filter(categoriaF => categoriaF.categoria_nome === categoria.categoria_nome).length) {
              categorias.filter(categoriaF => categoriaF.categoria_nome === categoria.categoria_nome)[0].subcategorias.push(subcategoria);
            } else {
              let novaCategoria = {
                categoria_description: categoria.categoria_description,
                categoria_filhos: categoria.categoria_filhos,
                categoria_id: categoria.categoria_id,
                categoria_nome: categoria.categoria_nome,
                categoria_ordem: categoria.categoria_ordem,
                subcategorias: [],
                diario_uid: categoria.diario_uid            
              } as CategoriasCascata;
              novaCategoria.subcategorias.push(subcategoria);
              categorias.push(novaCategoria);
            }
          }
        });
      });
    } else {
      categorias = this.data.categorias;
    }
    return categorias;
  }
   
  categoriasAutoCompleteOnChange(element) {
    this.categoriasFiltradas.next(this.filterCategorias(element.target.value));
  }

  chosenMonthHandler(normlizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    this.data.transacao_fatura_data = normlizedMonth.utc().format('Y-M-D');
    datepicker.close();
  }
}