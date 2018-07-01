import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { DiarioList } from '../../data-model/diario-list';

@Component({
  selector: 'app-diario-seleciona',
  templateUrl: './diario-seleciona.component.html',
  styleUrls: ['./diario-seleciona.component.css']
})
export class DiarioSelecionaComponent implements OnInit {
  diariosList: DiarioList[];

  constructor(private http: HttpClientService, private userService: UserService) { }

  ngOnInit() {
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.getDiarios(userDetail.userID).subscribe(diarios => {
        this.diariosList = diarios;
      })
    });
  }

}
