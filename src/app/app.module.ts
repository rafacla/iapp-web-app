// Angular Imports:
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt );

import { LOCALE_ID } from '@angular/core';

// Main Components:
import { AppComponent } from './app.component';
import { AppRoutingModule } from './servicos/routing/app-routing.module';

// MaterialComponents
import { MatToolbarModule, MatAutocompleteModule, MatCard, MatCardActions, MatCardAvatar, MatCardContent, MatCardFooter,
  MatCardHeader, MatCardImage, MatCardTitle, MatCardLgImage, MatCardMdImage, MatCardModule, MatCardSmImage,
  MatCardSubtitle, MatCardTitleGroup, MatCardXlImage, MatCheckboxModule, MatButtonModule, MatSidenavModule,
  MatIconModule, MatListModule, MatFormField, MatLabel, MatFormFieldModule, MatFormFieldAppearance,
  MatFormFieldControl, MatFormFieldDefaultOptions, MatProgressSpinnerModule,MatProgressBarModule, matFormFieldAnimations,
  MatInputModule, MatMenu, MatMenuModule,  MatDialogModule,  MatSlideToggleModule, MatDatepickerModule,
  MatNativeDateModule, MatTableModule, MatDividerModule, MatOptionModule, MatSelectModule, MatSortModule, MatTooltipModule, DateAdapter, MatStepperModule } from '@angular/material';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

// Serviços:
import { AuthInterceptor } from './servicos/comunicacao/http_auth_interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


// Componentes:
import { TemplateComponent } from './componentes/template/template.component';
import { LoginFormComponent } from './componentes/login-form/login-form.component';
import { DiarioSelecionaComponent, DiarioEditComponent } from './componentes/diario-seleciona/diario-seleciona.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { ContasListComponent, ContasEditComponent } from './componentes/contas-list/contas-list.component';
import { CategoriasListComponent, CategoriasEditComponent, SubcategoriasEditComponent } 
from './componentes/categorias-list/categorias-list.component';
import { UserEditComponent } from './componentes/user-edit/user-edit.component';
import { PhoneMaskDirective } from './diretivas/phone-mask.directive';
import { TransacoesListComponent, TransacoesEditComponent, TransacoesOFXComponent } from './componentes/transacoes-list/transacoes-list.component';
import { OrcamentoComponent } from './componentes/orcamento/orcamento.component';
import { from } from 'rxjs';
import { FaturasComponent } from './componentes/faturas/faturas.component';



@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatTableModule,
    MatDividerModule,
    MatOptionModule,
    MatSelectModule,
    MatSortModule,
    MatTooltipModule,
    MatStepperModule
  ],
  entryComponents: [
    ContasListComponent,
    ContasEditComponent,
    CategoriasEditComponent,
    CategoriasListComponent,
    SubcategoriasEditComponent,
    DiarioSelecionaComponent,
    DiarioEditComponent,
    TransacoesListComponent,
    TransacoesEditComponent,
    TransacoesOFXComponent],
  declarations: [
    AppComponent,
    TemplateComponent,
    LoginFormComponent,
    DashboardComponent,
    DiarioSelecionaComponent,
    DiarioEditComponent,
    ContasListComponent,
    ContasEditComponent,
    CategoriasListComponent,
    CategoriasEditComponent,
    SubcategoriasEditComponent,
    UserEditComponent, 
    PhoneMaskDirective, 
    TransacoesListComponent,
    TransacoesEditComponent,
    TransacoesOFXComponent,
    OrcamentoComponent,
    FaturasComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { 
      provide: LOCALE_ID, useValue: 'pt-br' 
    }, 
    {
      provide: DateAdapter, useClass: MomentDateAdapter
    },
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } 
    }
  ],
  exports: [
    PhoneMaskDirective
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
