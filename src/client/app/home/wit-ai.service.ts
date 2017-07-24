import { Injectable, NgZone } from '@angular/core';
import {Http,  URLSearchParams, Headers, RequestOptions} from "@angular/http";
import {Jsonp} from '@angular/http';
import { Observable } from 'rxjs/Observable';

interface IWindow extends Window {
  webkitSpeechRecognition:any;
}

@Injectable()
export class WitAiService {

  constructor(private http: Http, private jsonp: Jsonp) { }
  sessionId = this.newGuid();
  //backendUrl = 'http://192.168.0.15:8001';
  backendUrl = 'http://rcitad.alkiia.ath.bielsko.pl';

  query(sentence: string) : Observable<any> {
    return this.http.post(this.backendUrl + '/converse', {
      "query" : sentence
    }).map(res => res.json());
  }

  startGame() {
    return this.http.post(this.backendUrl + '/startGame', {}).map(res => res.json());
  }

  stopGame() {
    return this.http.post(this.backendUrl + '/stopGame', {}).map(res => res.json());
  }

  thx() {
    return this.http.post(this.backendUrl + '/thx', {}).map(res => res.json());
  }

  resetGame() {
    return this.http.post(this.backendUrl + '/resetGame', {}).map(res => res.json());
  }

  completeTask(task: any) {
    return this.http.post(this.backendUrl + '/completeTask', task).map(res => res.json());
  }

  login(id: any) {
    return this.http.post(this.backendUrl + '/login', id).map(res => res.json());
  }

  pollPlayers() : any{
    return this.http.post(this.backendUrl + '/pollPlayers', {}).map(res => res.json());
  }

  newGuid(): string {
    var result: string;
    var i: string;
    var j: number;

    result = "";
    for (j = 0; j < 32; j++) {
      if (j == 8 || j == 12 || j == 16 || j == 20)
        result = result + '-';
      i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
      result = result + i;
    }
    return result;
  }


}
