// Angular Imports:
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';

// Main Components:
import { AppComponent } from './app.component';
import { AppRoutingModule } from './servicos/routing/app-routing.module';

// MaterialComponents
import { MatToolbarModule, MatCard, MatCardActions, MatCardAvatar, MatCardContent, MatCardFooter,
  MatCardHeader, MatCardImage, MatCardTitle, MatCardLgImage, MatCardMdImage, MatCardModule, MatCardSmImage,
  MatCardSubtitle, MatCardTitleGroup, MatCardXlImage, MatCheckboxModule, MatButtonModule, MatSidenavModule,
  MatIconModule, MatListModule, MatFormField, MatLabel, MatFormFieldModule, MatFormFieldAppearance,
  MatFormFieldControl, MatFormFieldBase, MatFormFieldDefaultOptions, MatProgressSpinnerModule, matFormFieldAnimations,
  MatInputModule, MatMenu, MatMenuModule,  MatDialogModule,  MatSlideToggleModule, MatDatepickerModule,
  MatNativeDateModule, MatTableModule, MatDividerModule, MatOptionModule, MatSelectModule } from '@angular/material';

// Serviços:
import { AuthInterceptor } from './servicos/comunicacao/http_auth_interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Import angular-fusioncharts
import { FusionChartsModule } from 'angular-fusioncharts';

// Import FusionCharts library and chart modules
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

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

// Pass the fusioncharts library and chart modules
FusionChartsModule.fcRoot(FusionCharts, Charts, FusionTheme);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
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
    MatTableModule,
    MatDividerModule,
    MatOptionModule,
    MatSelectModule,
    FusionChartsModule
  ],
  entryComponents: [
    ContasListComponent,
    ContasEditComponent,
    CategoriasEditComponent,
    CategoriasListComponent,
    SubcategoriasEditComponent,
    DiarioSelecionaComponent,
    DiarioEditComponent],
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
    PhoneMaskDirective
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }],
  exports: [
    PhoneMaskDirective
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
