import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent }         from './app.component';
import { HeroDetailComponent }  from './hero-detail/hero-detail.component';
import { HeroesComponent }      from './heroes/heroes.component';
import { MessagesComponent }    from './messages/messages.component';

import { AppRoutingModule }     from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatCard, MatCardActions,MatCardAvatar,MatCardContent,MatCardFooter,
  MatCardHeader, MatCardImage, MatCardTitle, MatCardLgImage, MatCardMdImage, MatCardModule, MatCardSmImage,
  MatCardSubtitle, MatCardTitleGroup, MatCardXlImage, MatCheckboxModule, MatButtonModule, MatSidenavModule, 
  MatIconModule, MatListModule, MatFormField, MatLabel, MatFormFieldModule, MatFormFieldAppearance, 
  MatFormFieldControl, MatFormFieldBase, MatFormFieldDefaultOptions, matFormFieldAnimations, MatInputModule } from '@angular/material';
import { TemplateComponent } from './template/template.component';
import { NaoLogadoComponent } from './nao-logado/nao-logado.component';

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
    MatInputModule
  ],
  declarations: [
    AppComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent,
    TemplateComponent,
    NaoLogadoComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }