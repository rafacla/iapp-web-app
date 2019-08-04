import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDatepicker, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { HttpClientService } from 'src/app/servicos/comunicacao/http_client.service';
import { UserService } from 'src/app/servicos/user/user.service';
import { OrcamentoList, OrcamentoGet } from 'src/app/data-model/orcamento-list';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-orcamento',
  templateUrl: './orcamento.component.html',
  styleUrls: ['./orcamento.component.css']
})
export class OrcamentoComponent implements OnInit {
  orcamento_data = new BehaviorSubject<moment.Moment>(moment().startOf('month'));
  orcamento_data$ = this.orcamento_data.asObservable();
  dataSource = new MatTableDataSource<OrcamentoList>([]);
  categoriasColumns: string[] = ['categoria_nome', 'orcamento_valor', 'transacoes_valor'];
  subcategoriasColumns: string[] = ['subcategoria_nome', 'orcamento_valor', 'transacoes_valor'];
  constructor(
    private http: HttpClientService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    //this.orcamentosGet();
    this.orcamento_data$.subscribe(valor => this.orcamentosGet());
  }

  orcamentosGet() {
    this.dataSource.data = [];
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.orcamentosGet(userDetail.userLastDiarioUID, this.orcamento_data.value.format('MM'), this.orcamento_data.value.format('YYYY')).subscribe(orcamento => {
        this.dataSource.data = orcamento.lista_orcamentos;
      });
    });
  }
  isSubcategoria = (index: number, row: OrcamentoList) => {
    return row.subcategoria_is;
  }
  chosenYearHandler(normalizedYear: moment.Moment) {
    this.orcamento_data.value.year(normalizedYear.year());
  }
  chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    this.orcamento_data.value.month(normalizedMonth.month());
    this.orcamento_data.next(moment(this.orcamento_data.value));
    datepicker.close();
  }
  subtraiMes() {
    this.orcamento_data.value.subtract(1,'month').startOf('month');
    this.orcamento_data.next(moment(this.orcamento_data.value));
  }
  adicionaMes() {
    this.orcamento_data.value.add(1,'month').startOf('month');
    this.orcamento_data.next(moment(this.orcamento_data.value));
  }

}
