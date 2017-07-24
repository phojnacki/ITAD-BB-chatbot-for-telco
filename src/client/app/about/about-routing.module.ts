import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './about.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '55yl35g76y56', component: AboutComponent }
    ])
  ],
  exports: [RouterModule]
})
export class AboutRoutingModule { }
