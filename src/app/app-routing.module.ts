import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoogleMapComponent } from './google-map/google-map.component';
import { HeaderComponent } from './header/header.component';

const routes: Routes = [
  {path:"map", component:GoogleMapComponent},
  {path:"header", component:HeaderComponent},
  // {path:"", redirectTo:"map", pathMatch:"full"}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
