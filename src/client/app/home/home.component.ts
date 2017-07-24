import { Component, OnInit, ViewChild } from '@angular/core';
import { InputModalComponent } from './modals/input-modal.component';
import { NameListService } from '../shared/name-list/name-list.service';
import {SpeechRecognitionService} from './speech-recognition.service'
import {WitAiService} from "./wit-ai.service";
//import { ModalDirective,ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
import { Router } from '@angular/router';
/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-home',
  providers: [SpeechRecognitionService, WitAiService],
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {

  name:string = '';
  amount:string = '';
  location:string = '';
  time:string = '';
  errorMessage:string;
  names:any[] = [];
  userMessage:string = 'Rozpocznij konwersację';
  aiAction:string = 'Akcja';
  context:any = {};
  contextTxt:string;
  witTxt:string;
  rootIntent:string;
  intentModel:any = {};
  hotWordEnabled: boolean;
  completedTasks:string;
  completedTasksInfo:string;
  allTasksCompleted:boolean = false;
  nick:string;
  logged:boolean = false;
  thx:boolean = false;
  loginMessage:string;

  /**
   * Creates an instance of the HomeComponent with the injected
   * NameListService.
   *
   * @param {NameListService} nameListService - The injected NameListService.
   */
  constructor(public nameListService:NameListService, private speech:SpeechRecognitionService, private wit:WitAiService, private router:Router) {
  }

  loginValid():boolean {
    return this.nick && (this.nick.length > 3);
  }

  /**
   * Get the names OnInit
   */
  ngOnInit() {
    this.getNames();
    if (this.router.url.indexOf('a4a46b6e715c6') > -1) {
      this.hotWordEnabled = true;
    } else {
      this.hotWordEnabled = false;
    }
    //this.start();
  }

  login() {
    if (this.loginValid()) {
      this.wit.login({"id" : this.nick}).subscribe(data => {
        if (data.logged) {
          this.logged = true;
        } else {
          this.loginMessage = data.msg;
        }
      });
    } else {
      this.loginMessage = 'Login powinien mieć przynajmniej 4 znaki';
    }
  }

  /**
   * Handle the nameListService observable
   */
  getNames() {
    this.nameListService.get()
      .subscribe(
        names => this.names = names,
        error => this.errorMessage = <any>error
    );
  }


  start() {
    this.speech.startRecognition(this.hotWordEnabled).flatMap(message => {
      this.userMessage = message;
      this.errorMessage = '';
      return this.wit.query(message);
    }).subscribe(data => {
          if (data.txt) {
            this.thx = true
          }
          this.witTxt = JSON.stringify(data);
          let intent = this.firstEntityValue(data.entities, 'intent');
          if (intent == 'recharge') {
            this.rootIntent = intent;
            this.parseRechargeEntities(data);
          } else if (intent == 'sms') {
            this.rootIntent = intent;
            this.parseSmsEntities(data);
          } else if (intent == 'invoice') {
            this.rootIntent = intent;
            this.parseInvoiceEntities(data);
          } else  if ((intent == 'modifyPhoneNumber') && ((this.rootIntent == 'recharge') || (this.rootIntent == 'sms'))) {
            this.parseModifyPhoneNumberEntities(data);
          } else  if ((intent == 'performAction') && ((this.rootIntent == 'recharge') || (this.rootIntent == 'sms'))) {
            this.performAction();
          } else  if ((intent == 'modifyAmountOfMoney') && (this.rootIntent == 'recharge')) {
            this.parseModifyAmountOfMoney(data);
          } else  if ((intent == 'modifySmsContent') && (this.rootIntent == 'sms')) {
            this.parseModifySmsContent(data);
          }
          this.contextTxt = JSON.stringify(this.intentModel);
        return false;
        }, err => {
          console.log(JSON.stringify(err));
        }
      );
  }

  accomplishTask(tasks) {
    this.completedTasks = tasks;
    let tasksListed = '('
    let count = 0;
    if (tasks.recharge) {
      count++;
      tasksListed = tasksListed + ' doładowanie ';
    }
    if (tasks.sms) {
      count++;
      tasksListed = tasksListed + ' sms ';
    }
    if (tasks.invoice) {
      count++;
      tasksListed = tasksListed + ' faktura ';
    }
    tasksListed = tasksListed + ')';
    if (count == 3) {
      this.completedTasksInfo = 'Ukończyłeś wszystkie zadania! :-)';
    } else {
      this.completedTasksInfo = 'Ukończyłeś ' + count + '/3 zadań ' + tasksListed + '.';
    }

  }

  performAction() {
    if (this.rootIntent == 'recharge') {
      if (this.intentModel.phoneNumber && this.validPhoneNumber(this.intentModel.phoneNumber)) {
        if (this.intentModel.amountOfMoney && this.validAmountOfMoney(this.intentModel.amountOfMoney)) {
          this.wit.completeTask({"id":this.nick,"recharge": {"phoneNumber" : this.intentModel.phoneNumber, "amountOfMoney" : this.intentModel.amountOfMoney}}).subscribe( data => {
            this.userMessage = data.msg;
            this.accomplishTask(data.player);
          });
        } else {
          this.errorMessage =  "Zmień proszę kwotę doładowania na poprawną";
        }
      } else {
        this.errorMessage =  "Zmień proszę numer telefonu na poprawny";
      }
    } else if (this.rootIntent == 'sms') {
      if (this.intentModel.phoneNumber && this.validPhoneNumber(this.intentModel.phoneNumber)) {
        if (this.intentModel.smsContent && (this.intentModel.smsContent.length > 2)) {
          this.wit.completeTask({"id":this.nick, "sms" : {"phoneNumber" : this.intentModel.phoneNumber, "smsContent" : this.intentModel.smsContent}}).subscribe( data => {
            this.userMessage = data.msg
            this.accomplishTask(data.player);
          });
        } else {
          this.errorMessage =  "Podaj proszę minimum jedno słowo w treści SMSa";
        }
      } else {
        this.errorMessage =  "Zmień proszę numer telefonu na poprawny";
      }
    }
  }



  parseModifyPhoneNumberEntities(data) {
    this.intentModel.phoneNumber = this.parsePhoneNumber(this.firstEntityValue(data.entities, 'phoneNumber'));
  }

  parseModifyAmountOfMoney(data) {
    this.intentModel.amountOfMoney = this.parsePhoneNumber(this.firstEntityValue(data.entities, 'amountOfMoney'));
  }
  parseModifySmsContent(data) {
    this.intentModel.smsContent = this.firstEntityValue(data.entities, 'smsContent');
  }

  parseRechargeEntities(data) {
    this.clearIntentModel();
    this.intentModel.phoneNumber = this.parsePhoneNumber(this.firstEntityValue(data.entities, 'phoneNumber'));
    this.intentModel.amountOfMoney = this.firstEntityValue(data.entities, 'amountOfMoney');
  }

  parseSmsEntities(data) {
    this.clearIntentModel();
    this.intentModel.phoneNumber = this.parsePhoneNumber(this.firstEntityValue(data.entities, 'phoneNumber'));
    this.intentModel.smsContent = this.firstEntityValue(data.entities, 'smsContent');
  }

  parseInvoiceEntities(data) {
    this.clearIntentModel();
    let invoiceDateString = this.firstEntityValue(data.entities, 'datetime');
    if (invoiceDateString) {
      let invoiceDate = this.parseMonth(invoiceDateString);
      let currentDate = new Date();
      this.intentModel.date = invoiceDate.getFullYear() + '.' + invoiceDate.getMonth();
      if (invoiceDate <= currentDate) {
        this.intentModel.invoiceNumber = 'FV ' + invoiceDate.getMonth() + '/' + invoiceDate.getFullYear();
        this.completeInvoiceTask(invoiceDate.getMonth()+'', invoiceDate.getFullYear()+'');
      }
    }
  }

  completeInvoiceTask(month : string, year: string) {
    if (this.rootIntent == 'invoice') {
      if (month && year && month == '1' && year =='2015') {
          this.wit.completeTask({"id":this.nick,"invoice": {"invoiceNumber" : this.intentModel.invoiceNumber}}).subscribe( data => {
            this.userMessage = data.msg;
            this.accomplishTask(data.player);
          });
      } else {
        this.errorMessage =  "Podaj poprawną, konkursową datę";
      }
    }
  }

  parseMonth(dateString) {
    var match = /^(\d{4})-(\d\d)-(\d\d)/.exec(dateString);
    return new Date(Number(match[1]), Number(match[2]) , 1);
  }

  parsePhoneNumber(n) {
    if (!n) {
      return '';
    }
    let onlyDigits = n.replace(/\s/g, '').replace('/[^\\d.]/g', '');
    if (onlyDigits.length > 9) {
      return onlyDigits.substr(0, 9);
    }
    return onlyDigits;
  }

  validPhoneNumber(n) {
    if (!n) {
      return false;
    }
    let trimmedN = n.trim();
    let onlyDigits = trimmedN.replace(/\s/g, '').replace('/[^\\d.]/g', '');

    if ((onlyDigits.length == 9) || (onlyDigits.length == 11)) {
      return true;
    }
    return false;
  }

  validAmountOfMoney(n) {
    if (!n) {
      return false;
    }
    let trimmedN = n.trim();
    let onlyDigits = trimmedN.replace(/\s/g, '').replace('/[^\\d.]/g', '');
    if (onlyDigits.length == trimmedN.length) {
      return true;
    }
    return false;
  }

  firstEntityValue(entities, entity) {
    let val = entities && entities[entity] && Array.isArray(entities[entity]) && entities[entity].length > 0 && entities[entity][0].value;
    if (!val) {
      return null;
    }
    return val;
  }

  clearIntentModel() {
    for (var member in this.intentModel) delete this.intentModel[member];
  }


}


export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
