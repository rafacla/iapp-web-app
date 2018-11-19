import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../../componentes/dashboard/dashboard.component';
import { DiarioSelecionaComponent } from '../../componentes/diario-seleciona/diario-seleciona.component';
import { DiarioEditComponent } from '../../componentes/diario-edit/diario-edit.component';
import { ContasListComponent } from '../../componentes/contas-list/contas-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent},
  { path: 'diario/seleciona', component: DiarioSelecionaComponent },
  { path: 'diario/edit/:id', component: DiarioEditComponent },
  { path: 'contas', component: ContasListComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
