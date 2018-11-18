//Angular Imports:
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';

//Main Components:
import { AppComponent }         from './app.component';
import { AppRoutingModule }     from './servicos/routing/app-routing.module';

//MaterialComponents
import { MatToolbarModule, MatCard, MatCardActions,MatCardAvatar,MatCardContent,MatCardFooter,
  MatCardHeader, MatCardImage, MatCardTitle, MatCardLgImage, MatCardMdImage, MatCardModule, MatCardSmImage,
  MatCardSubtitle, MatCardTitleGroup, MatCardXlImage, MatCheckboxModule, MatButtonModule, MatSidenavModule, 
  MatIconModule, MatListModule, MatFormField, MatLabel, MatFormFieldModule, MatFormFieldAppearance, 
  MatFormFieldControl, MatFormFieldBase, MatFormFieldDefaultOptions,MatProgressSpinnerModule, matFormFieldAnimations, 
  MatInputModule, MatMenu, MatMenuModule, MatTreeModule } from '@angular/material';
  
//Serviços:
import { AuthInterceptor } from './servicos/comunicacao/http_auth_interceptor'
import { HTTP_INTERCEPTORS } from '@angular/common/http';

//Componentes:
import { TemplateComponent } from './componentes/template/template.component';
import { LoginFormComponent } from './componentes/login-form/login-form.component';
import { DiarioSelecionaComponent } from './componentes/diario-seleciona/diario-seleciona.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { DiarioEditComponent } from './componentes/diario-edit/diario-edit.component';
import { ContasListComponent } from './componentes/contas-list/contas-list.component';

// Import angular-fusioncharts
import { FusionChartsModule } from 'angular-fusioncharts';

// Import FusionCharts library and chart modules
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';

import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

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
    MatTreeModule,
    FusionChartsModule
  ],
  declarations: [
    AppComponent,
    TemplateComponent,
    LoginFormComponent,
    DashboardComponent,
    DiarioSelecionaComponent,
    DiarioEditComponent,
    ContasListComponent
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }