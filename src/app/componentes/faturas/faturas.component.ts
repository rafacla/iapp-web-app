import { Component, OnInit, Inject } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { ContaList } from 'src/app/data-model/conta-list';
import { FaturaList, CartaoList, TransacoesCartaoList } from 'src/app/data-model/fatura-list';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDatepicker } from '@angular/material';
import * as moment from 'moment';
import { TransacaoPost } from 'src/app/data-model/transacao-post';
import { TransacoesTabular } from '../transacoes-list/transacoes-list.component';


export interface DialogData {
  transacaoAntiga: TransacoesCartaoList;
  transacao_fatura_data: string;
  transacao_id: number;
  transacao_nova_fatura_data: string;
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
  transacoesList: TransacoesCartaoList[];
  displayedColumns: string[] = ['transacao_fatura_data','transacao_data','transacao_sacado','transacao_descricao','transacao_valor'];

  constructor(
    private http: HttpClientService,
    private userService: UserService,
    public dialog: MatDialog
    ) { }


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
          this.atualizaListaCartoes(faturaAntiga.fatura_data);
        });
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
      conta_id: null
    }
    let transacoesCarregando: TransacoesCartaoList[] = [transacaoEmBranco] ;
    this.transacoesList = transacoesCarregando;
    this.http.transacoesCartaoGet(fatura.conta_id.toString(),fatura.fatura_data).subscribe(transacoes => {
      this.transacoesList = transacoes;
    }, error => {
      this.transacoesList = [];      
    });
  }

  private atualizaListaCartoes(faturaSelecionada?: string) {
    this.userService.getUserDetail().subscribe(userDetail => { 
      this.http.cartoesGet(userDetail.userLastDiarioUID).subscribe(cartoes => {
        this.cartoesList = cartoes;
        cartoes.forEach(element => {
          this.http.faturasGet(element.conta_id.toString()).subscribe(faturaList => {
            element.faturas = Array.from(faturaList).slice().reverse();
            if (element.faturas[0].conta_id == cartoes[0].conta_id) {
              let fatura = faturaList.find(i => i.fatura_data == faturaSelecionada);
              if (fatura)
                this.faturaSelecionada = fatura;
              else
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

@Component({
  selector: 'fatura-data-dialog',
  templateUrl: 'fatura-data-dialog.html',
})
export class FaturaDataDialog {
  transacaoFaturaDataMMMYY: string;
  transacaoFaturaData: moment.Moment;
  transacaoFaturaDataError: boolean;


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