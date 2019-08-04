import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDatepicker, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { HttpClientService } from 'src/app/servicos/comunicacao/http_client.service';
import { UserService } from 'src/app/servicos/user/user.service';
import { OrcamentoList, OrcamentoGet } from 'src/app/data-model/orcamento-list';

@Component({
  selector: 'app-orcamento',
  templateUrl: './orcamento.component.html',
  styleUrls: ['./orcamento.component.css']
})
export class OrcamentoComponent implements OnInit {
  orcamento_data = moment().startOf('month');
  dataSource = new MatTableDataSource<OrcamentoList>([]);
  categoriasColumns: string[] = ['categoria_nome', 'orcamento_valor', 'transacoes_valor'];
  subcategoriasColumns: string[] = ['subcategoria_nome', 'orcamento_valor', 'transacoes_valor'];
  constructor(
    private http: HttpClientService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.orcamentosGet();
  }

  orcamentosGet() {
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.orcamentosGet(userDetail.userLastDiarioUID, this.orcamento_data.format('MM'), this.orcamento_data.format('YYYY')).subscribe(orcamento => {
        this.dataSource.data = orcamento.lista_orcamentos;
      });
    });
  }
  isSubcategoria = (index: number, row: OrcamentoList) => {
    return row.subcategoria_is;
  }
  chosenYearHandler(normalizedYear: moment.Moment) {
    this.orcamento_data.year(normalizedYear.year());
  }
  chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    this.orcamento_data.month(normalizedMonth.month());
    this.orcamento_data = moment(this.orcamento_data);
    datepicker.close();
  }
  subtraiMes() {
    this.orcamento_data.subtract(1,'month').startOf('month');
    this.orcamento_data = moment(this.orcamento_data);
  }
  adicionaMes() {
    this.orcamento_data.add(1,'month').startOf('month');
    this.orcamento_data = moment(this.orcamento_data);
  }

}
