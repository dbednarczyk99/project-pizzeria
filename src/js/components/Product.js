import {classNames, templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const genratedHTML = templates.menuProduct(thisProduct.data);
      //console.log(genratedHTML);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(genratedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    initAccordion(){
      const thisProduct = this;
      
      /* find the clicable trigger (the element that should react to clicling) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log("clickableTrigger == ", thisProduct);

      /* START: add event listener to clicable trigger on event 'click' */
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        /* prevent default action for event */
        event.preventDefault();
        //console.log("Clicked!!!");

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProducts +'.'+ classNames.menuProduct.wrapperActive);
        //const activeProduct = document.querySelector();

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        //console.log("activeProduct: ", activeProduct);
        if(activeProduct && activeProduct !== thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log("initOrderForm: ", thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      //console.log("processOrder: ", thisProduct);

      /* convert from form to object */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log("formData: ", formData);

      /* set price to default price */
      let price = thisProduct.data.price;
      //console.log(thisProduct);

      /* for every category (param)... */
      for(let paramId in thisProduct.data.params){
        /* ...determine param value, np. paramId = 'toppings' */
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        /* for every option in this category... */
        for(let optionId in param.options) {
          
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          const image = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log(image);
          if(optionSelected && image){
            image.classList.add(classNames.menuProduct.imageVisible);
            //console.log(image);
          }
          else if(!optionSelected && image){
            image.classList.remove(classNames.menuProduct.imageVisible); 
          }

          /* ...determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true } */
          const option = param.options[optionId];
          if(optionSelected && !option.default){
            price += option.price;
            //console.log("znaleziono! :", option)
          }
          else if(!optionSelected && option.default){
            price -= option.price;
          }
          //console.log(optionId, option);
        }
      }
      thisProduct.priceSingle = price;
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
      /* update calculated price in the HTML */
      thisProduct.priceElem.innerHTML = price;
      //console.log("thisProduct in procesOrder:",thisProduct);
    }

    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      //app.cart.add(thisProduct.prepareCartProduct());
        
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct.prepareCartProduct(),
        },
      });

      thisProduct.element.dispatchEvent(event);
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.amountWidget.value * thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams()
      };
      //console.log(productSummary);
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      /* convert from form to object */
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      /* for every category (param)... */
      for(let paramId in thisProduct.data.params){
        /* ...determine param value, np. paramId = 'toppings' */
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {}
        }

        /* for every option in this category... */
        for(let optionId in param.options) {
          
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          const option = param.options[optionId].label;

          if(optionSelected){
            params[paramId].options[optionId] = option;
            //Object.assign(params[paramId].options, option);
          }
        }
      }
      return params;
    }
  }

export default Product;