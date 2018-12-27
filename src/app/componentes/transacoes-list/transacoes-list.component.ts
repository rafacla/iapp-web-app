import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';

export interface TransacoesTabular {
  transacao_id: number;
  transacao_nome: string;
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


@Component({
  selector: 'app-transacoes-list',
  templateUrl: './transacoes-list.component.html',
  styleUrls: ['./transacoes-list.component.css']
})
export class TransacoesListComponent implements OnInit {
  transacoesColumns: string[] = ['select', 'transacao_data', 'conta_nome', 'transacao_sacado', 'transacao_classificacao',
                            'transacao_descricao', 'transacao_valor_saida', 'transacao_valor_entrada', 'transacao_conciliada'];
  dataSource = new MatTableDataSource<TransacoesTabular>([]);
  selection = new SelectionModel<TransacoesTabular>(true, []);
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(private http: HttpClientService, private userService: UserService) { }

  ngOnInit() {
    this.userService.getUserDetail().subscribe(user => {
      this.http.subtransacoesTabularGet(user.userLastDiarioUID).subscribe(
        sucesso => {
          this.dataSource.data = sucesso;
        },
        erro => {
          console.log(erro);
        });
    });
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
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
