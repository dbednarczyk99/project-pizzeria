import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
    constructor(element){
      super(element, settings.amountWidget.defaultValue);

      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.initActions();

      //console.log(thisWidget.value);
      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }

    getElements(){
      const thisWidget = this;

      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    isValid(value){
      return !isNaN(value) && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax;
    }

    renderValue(){
      const thisWidget = this;
      thisWidget.dom.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.value = thisWidget.dom.input.value;
      });
      thisWidget.dom.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        const newVal = parseInt(thisWidget.dom.input.value) - 1;
        thisWidget.value = newVal;
      });
      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        const newVal = parseInt(thisWidget.dom.input.value) + 1;
        thisWidget.value = newVal;
      });
    }
  }

  export default AmountWidget;