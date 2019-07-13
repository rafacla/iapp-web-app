import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDatepicker } from '@angular/material';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-orcamento',
  templateUrl: './orcamento.component.html',
  styleUrls: ['./orcamento.component.css']
})
export class OrcamentoComponent implements OnInit {
  orcamento_data = moment().startOf('month');
  constructor() { }

  ngOnInit() {
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
