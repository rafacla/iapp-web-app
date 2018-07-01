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
  MatInputModule, MatMenu, MatMenuModule } from '@angular/material';
  
//FontAwersomeModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserCircle, faSignOutAlt, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { faListAlt, faClock } from '@fortawesome/free-regular-svg-icons';
library.add(faUserCircle, faSignOutAlt, faUserEdit, faListAlt, faClock);

//Serviços:
import { AuthInterceptor } from './servicos/comunicacao/http_auth_interceptor'
import { HTTP_INTERCEPTORS } from '@angular/common/http';

//Componentes:
import { TemplateComponent } from './componentes/template/template.component';
import { LoginFormComponent } from './componentes/login-form/login-form.component';
import { DiarioSelecionaComponent } from './componentes/diario-seleciona/diario-seleciona.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { DiarioEditComponent } from './componentes/diario-edit/diario-edit.component';

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
    FontAwesomeModule,
    MatMenuModule
  ],
  declarations: [
    AppComponent,
    TemplateComponent,
    LoginFormComponent,
    DashboardComponent,
    DiarioSelecionaComponent,
    DiarioEditComponent
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }