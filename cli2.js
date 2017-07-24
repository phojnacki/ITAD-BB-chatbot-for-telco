'use strict';


let Wit = null;
let interactive = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = '4QEENSRAOUJBWAJL7WY5SUJ5PUBHPALA';

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    console.log('SendRequest:' + JSON.stringify(request));
	return new Promise(function(resolve, reject) {
        console.log('SendResponse'+JSON.stringify(response));
        return resolve();
      });
  },
  recharge({sessionId, context, text, entities}) {
	console.log('Execute recharge() context:', JSON.stringify(context));
	console.log('Execute recharge() entities:', JSON.stringify(entities));

	context.frontendAction = { name : "recharge"};
    return Promise.resolve(context);
  },
  setRechargeData({sessionId, context, text, entities}){
    console.log(`Session ${sessionId} received ${text}`);
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);
	  
    var phoneNumber = firstEntityValue(entities, 'phoneNumber');
    var amountOfMoney = firstEntityValue(entities, 'amountOfMoney');
	
	if(phoneNumber){
		context.phoneNumber = phoneNumber;
	}
	
	if(amountOfMoney){
		context.amountOfMoney = amountOfMoney;
	}

	return context;  
  },
  showPhoneNumberInput({context, entities}){
    context.frontendAction = { name : "showPhoneNumberInput", amountOfMoney : context.amountOfMoney};
	return context;  
  },
  showAmountOfMoneyInput({context, entities}){
    context.frontendAction = { name : "showAmountOfMoneyInput", phoneNumber : context.phoneNumber};
	return context;  
  },
  setPaymentMethod({context, entities}){
    var paymentMethod = firstEntityValue(entities, 'paymentMethod');
	if(paymentMethod){
		context.paymentMethod = paymentMethod;
	}
	return context;  
  }, 
  showPaymentMethodInput({context, entities}){
    context.frontendAction = { name : "showPaymentMethodInput"};
	
	return context;  
  },
  showCreditCardNumberInput({context, entities}){
    context.frontendAction = { name : "showCreditCardNumberInput"};
	return context;  
  },
  showMoneyTransferWindow({context, entities}){
    context.frontendAction = { name : "showMoneyTransferWindow"};
	return context;  
  }
};

const client = new Wit({accessToken, actions});
interactive(client);