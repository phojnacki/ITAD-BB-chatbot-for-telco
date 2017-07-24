import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';
//import {InputModalComponent} from "modals/input-modal.component";
import { ModalModule } from 'ng2-bootstrap';
import { InputModalComponent } from './modals/input-modal.component';

@NgModule({
  //imports: [CommonModule, HomeRoutingModule, SharedModule, ModalModule.forRoot()],
  imports: [CommonModule, HomeRoutingModule, SharedModule, ModalModule.forRoot()],
  declarations: [HomeComponent, InputModalComponent],
  exports: [HomeComponent],
  providers: [NameListService]
})
export class HomeModule { }
