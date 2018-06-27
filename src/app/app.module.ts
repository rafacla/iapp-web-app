import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }    from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent }         from './app.component';
import { MessagesComponent }    from './messages/messages.component';

import { AppRoutingModule }     from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatCard, MatCardActions,MatCardAvatar,MatCardContent,MatCardFooter,
  MatCardHeader, MatCardImage, MatCardTitle, MatCardLgImage, MatCardMdImage, MatCardModule, MatCardSmImage,
  MatCardSubtitle, MatCardTitleGroup, MatCardXlImage, MatCheckboxModule, MatButtonModule, MatSidenavModule, 
  MatIconModule, MatListModule, MatFormField, MatLabel, MatFormFieldModule, MatFormFieldAppearance, 
  MatFormFieldControl, MatFormFieldBase, MatFormFieldDefaultOptions,MatProgressSpinnerModule, matFormFieldAnimations, MatInputModule } from '@angular/material';
import { TemplateComponent } from './template/template.component';
import { NaoLogadoComponent } from './nao-logado/nao-logado.component';
import { AuthInterceptor } from './comunicacao/http_auth_interceptor'
import { HTTP_INTERCEPTORS } from '@angular/common/http';

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
    MatProgressSpinnerModule
  ],
  declarations: [
    AppComponent,
    MessagesComponent,
    TemplateComponent,
    NaoLogadoComponent
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }