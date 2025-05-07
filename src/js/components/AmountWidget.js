import {select} from './settings.js';


class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      //console.log(thisWidget.value);
      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce(){
      const thisWidget = this;
      //const event = new Event('updated');
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      thisWidget.input.value = 1;
      /* Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue > 0 && newValue <= 10){
        thisWidget.value = newValue;
        //console.log(thisWidget.value);
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        const newVal = parseInt(thisWidget.input.value) - 1;
        thisWidget.setValue(newVal);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        const newVal = parseInt(thisWidget.input.value) + 1;
        thisWidget.setValue(newVal);
      });
    }
  }

  export default AmountWidget;