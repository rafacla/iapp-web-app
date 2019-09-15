import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDatepicker, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { HttpClientService } from 'src/app/servicos/comunicacao/http_client.service';
import { UserService } from 'src/app/servicos/user/user.service';
import { OrcamentoList, OrcamentoGet, OrcamentoPost } from 'src/app/data-model/orcamento-list';
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
  receita_mes = 0;
  receita_acum = 0;
  orcado_mes = 0;
  orcado_acum = 0;
  sobreorcado_mes = 0;
  sobregasto_mes = 0;
  categoriasColumns: string[] = ['categoria_nome', 'orcamento_valor', 'transacoes_valor', 'disponivel_valor'];
  subcategoriasColumns: string[] = ['subcategoria_nome', 'orcamento_valor', 'transacoes_valor', 'disponivel_valor'];
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
        this.receita_mes = orcamento.receita_mes;
        this.receita_acum = orcamento.receita_acum;
        this.orcado_acum = orcamento.orcado_acum;
        this.orcado_mes = orcamento.orcado_mes;
        this.sobreorcado_mes = orcamento.sobreorcado;
        this.sobregasto_mes = orcamento.sobregasto;
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

  atualizaOrcamento(subcategoria_id, e) {
    let novoOrcamento = e.target.value;
    let subcategoria = this.dataSource.data.find(element => element.subcategoria_id == subcategoria_id);

    if (+subcategoria.orcamento_valor != +novoOrcamento) {
      let diferenca = +novoOrcamento - +subcategoria.orcamento_valor;
      subcategoria.disponivel_valor += diferenca;
      this.orcado_acum += diferenca;
      this.orcado_mes += diferenca;
      this.dataSource.data.find(element => element.subcategoria_id == subcategoria_id).orcamento_valor = novoOrcamento;

      this.userService.getUserDetail().subscribe(user => {
        let orcamentoPost: OrcamentoPost = {
          orcamento_date: this.orcamento_data.value.format('YYYY-MM-DD'),
          orcamento_valor: novoOrcamento,
          subcategoria_id: subcategoria.subcategoria_id,
          diario_uid: user.userLastDiarioUID
        }
        this.http.orcamentosPost(orcamentoPost).subscribe(sucesso => {});
      });
    }
  }

}
