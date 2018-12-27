import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../../componentes/dashboard/dashboard.component';
import { DiarioSelecionaComponent } from '../../componentes/diario-seleciona/diario-seleciona.component';
import { ContasListComponent } from '../../componentes/contas-list/contas-list.component';
import { CategoriasListComponent } from '../../componentes/categorias-list/categorias-list.component';
import { UserEditComponent } from '../../componentes/user-edit/user-edit.component';
import { TransacoesListComponent } from '../../componentes/transacoes-list/transacoes-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent},
  { path: 'diario/seleciona', component: DiarioSelecionaComponent },
  { path: 'contas', component: ContasListComponent },
  { path: 'categorias', component: CategoriasListComponent},
  { path: 'user/edit', component: UserEditComponent },
  { path: 'transacoes', component: TransacoesListComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
