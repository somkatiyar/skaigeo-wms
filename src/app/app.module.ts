import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { PrimeModule } from './prime/prime.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CropMonitoringService } from './crop-monitoring.service';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapComponent } from './google-map/google-map.component';
const baseURL = 'https://skaigeo.com/arms-api/';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GoogleMapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeModule,
    HttpClientModule
  ],

  exports:[PrimeModule],
  providers: [CropMonitoringService,{provide:"baseURL", useValue:baseURL} ],

  bootstrap: [AppComponent]
})
export class AppModule { }
