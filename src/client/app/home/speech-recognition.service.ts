import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Rx';

interface IWindow extends Window {
  webkitSpeechRecognition:any;
}

@Injectable()
export class SpeechRecognitionService {

  recognition:any = {};

  hotWordEnabled : boolean = false ;
  constructor(private zone:NgZone) {}

  startRecognition(hotWordEnabled): Observable<string> {
    this.hotWordEnabled = hotWordEnabled;
    return Observable.create((observer) => {
      const { webkitSpeechRecognition }:IWindow = <IWindow>window;
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = hotWordEnabled;
      this.recognition.interimResults = false;
      this.recognition.onresult = e => {
        let msg = this.prepareUserMessage(e);
        if (msg) {
          this.zone.run(() => observer.next(msg));
        }
      }
      this.recognition.lang = 'pl-PL';
      this.recognition.start();
    });
  }

  extractCoreMessage(msg:string):string {
    let listenWord = 'sluchaj';
    let okWord = 'dobra';
    let okWord2 = 'dobrze';
    let okWord3 = 'ok';

    if (!msg) {
      return null;
    }
    let normalizedMsg =  this.toNoPlChars(msg.trim().toLowerCase());

    if (normalizedMsg.startsWith(listenWord)) {
      return msg.trim().substring(8);
    } else if (normalizedMsg.startsWith(okWord)) {
      return msg.trim().substring(6);
    } else if (normalizedMsg.startsWith(okWord2)) {
      return msg.trim().substring(5);
    } else if (normalizedMsg.startsWith(okWord3)) {
      return msg.trim().substring(3);
    }
    return null;
  }

  prepareUserMessage(e:any):string {
    for (var i = e.resultIndex; i < e.results.length; ++i) {
      if (e.results[i].isFinal) {
        var str = e.results[i][0].transcript;
        console.log('Recognised: ' + str);
        if (!this.hotWordEnabled) {
          return str;
        }
        let extractedCoreMsg = this.extractCoreMessage(str);
        if (extractedCoreMsg) {
          return extractedCoreMsg;
        }
      }
    }
    return null;
  }

  toNoPlChars(msg:string) {
    return msg.replace(/ą/g, 'a').replace(/Ą/g, 'A')
      .replace(/ć/g, 'c').replace(/Ć/g, 'C')
      .replace(/ę/g, 'e').replace(/Ę/g, 'E')
      .replace(/ł/g, 'l').replace(/Ł/g, 'L')
      .replace(/ń/g, 'n').replace(/Ń/g, 'N')
      .replace(/ó/g, 'o').replace(/Ó/g, 'O')
      .replace(/ś/g, 's').replace(/Ś/g, 'S')
      .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
      .replace(/ź/g, 'z').replace(/Ź/g, 'Z');
  }
}
