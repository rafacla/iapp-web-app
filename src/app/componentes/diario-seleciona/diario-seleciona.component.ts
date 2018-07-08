import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { DiarioList } from '../../data-model/diario-list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diario-seleciona',
  templateUrl: './diario-seleciona.component.html',
  styleUrls: ['./diario-seleciona.component.css']
})
export class DiarioSelecionaComponent implements OnInit {
  diariosList: DiarioList[];
  diariosDeletados: boolean[] = [];

  constructor(private router: Router, private http: HttpClientService, private userService: UserService) { }

  ngOnInit() {
    this.userService.getUserDetail().subscribe(userDetail => {
      this.http.diarioGet(userDetail.userID).subscribe(diarios => {
        this.diariosList = diarios;
      })
    });
  }

  private deletaDiario(diario: DiarioList) {
    let diarioUID = diario.diarioUID;
    this.diariosDeletados[diarioUID] = true;
    this.http.diarioDelete(diarioUID).subscribe(
      sucesso => { 
        const index = this.diariosList.indexOf(diario);
        if (index !== -1) {
          this.diariosList.splice(index, 1);
      }   
      },
      erro => { 
        console.log (erro);
      }
    );
  }

}
