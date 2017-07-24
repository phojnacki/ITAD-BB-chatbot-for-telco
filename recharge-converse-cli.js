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
  console.log('AI recognized entities: ', JSON.stringify(entities));
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
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('Sending:' + JSON.stringify(request));
    console.log('Received:' + JSON.stringify(response));
  },
  recharge({context, entities}) {
	console.log('Execute recharge() context:', JSON.stringify(context));
	console.log('Execute recharge() entities:', JSON.stringify(entities));

	context.frontendAction = { name : "recharge"};
    return context;
  },
  noMatch({context, entities}) {
	console.log('Execute noMatch() context:', JSON.stringify(context));
	console.log('Execute noMatch() entities:', JSON.stringify(entities));

	context.frontendAction = {};
	
	context.frontendAction = { name : "noMatch"};
    return context;
  },
  setRechargeData({context, entities}){
	  
	console.log('Execute setRechargeData() context:', JSON.stringify(context));
	console.log('Execute setRechargeData() entities:', JSON.stringify(entities));
	
	context.frontendAction = {};
		
    var phoneNumber = firstEntityValue(entities, 'phoneNumber');
    var amountOfMoney = firstEntityValue(entities, 'amountOfMoney');
	
	if(phoneNumber){
		context.phoneNumber = phoneNumber;
	}
	
	if(amountOfMoney){
		context.amountOfMoney = amountOfMoney;
	}
	
	if (!phoneNumber && !amountOfMoney) {
		context.missingData = true;
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
    console.log('Execute setPaymentMethod() context:', JSON.stringify(context));
	console.log('Execute setPaymentMethod() entities:', JSON.stringify(entities));
	context.frontendAction = {};
	var paymentMethodCard = firstEntityValue(entities, 'paymentMethodCard');
	var paymentMethod = firstEntityValue(entities, 'paymentMethodTransfer');
	
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
