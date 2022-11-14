import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';




@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule
  ],
  exports:[ButtonModule,DropdownModule]
})
export class PrimeModule { }
