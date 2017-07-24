import { Component } from '@angular/core';
import {WitAiService} from "../home/wit-ai.service";
/**
 * This class represents the lazy loaded AboutComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-about',
  templateUrl: 'about.component.html',
  providers: [WitAiService],
  styleUrls: ['about.component.css']
})
export class AboutComponent {

  constructor(private wit:WitAiService) { }

  message:string = 'Witaj';
  players : any;
  displayThx:boolean = false;
  intervalId:any;

  startGame() {
    return this.wit.startGame().subscribe(data => {
      this.message = data.msg;
    });
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.pollPlayers();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  pollPlayers() {
    return this.wit.pollPlayers().subscribe(data => {
      this.players = data.playersSorted;
    });
  }
  stopGame() {
    return this.wit.stopGame().subscribe(data => {
      this.message = data.msg;
      this.players = data.players;
    });
  }

  thx() {
    return this.wit.thx().subscribe(data => {
      this.message = data.msg;
      this.displayThx = data.thx;
    });
  }

  resetGame() {
    return this.wit.resetGame().subscribe(data => this.message = data.msg);
  }

}
