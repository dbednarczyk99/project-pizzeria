/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

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
      
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
      /* update calculated price in the HTML */
      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments: ', element);
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
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      /* Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue > 0 && newValue <= 10){
        thisWidget.value = newValue;
        console.log(thisWidget.value);
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

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

      //const testProduct = new Product();
      //console.log('testProduct: ', testProduct);
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
