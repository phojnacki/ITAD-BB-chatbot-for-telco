import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: HomeComponent },
      { path: 'a4a46b6e715c6', component: HomeComponent }
    ])
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
