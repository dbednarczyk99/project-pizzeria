/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { name } = require("browser-sync");

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    }
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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

      app.cart.add(thisProduct.prepareCartProduct());
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

  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        //console.log(thisCart.dom.wrapper);
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
    }

    update(){
      const thisCart = this;
      let deliveryFee = 0;

      let totalNumber = 0;
      let subtotalPrice = 0;

      for (let product of thisCart.products){
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      if(totalNumber === 0 && subtotalPrice === 0){
        deliveryFee = 0;      }
      else{
        deliveryFee = settings.cart.defaultDeliveryFee;
      }

      thisCart.totalPrice = subtotalPrice + deliveryFee;
      
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      for(let totalPrice of thisCart.dom.totalPrice){
        totalPrice.innerHTML = thisCart.totalPrice;
      }


      console.log('Produkty w koszyku: ', thisCart.products);
      //console.log('subtotalPrice: ', subtotalPrice);
      //console.log('thisCart.totalPrice: ', thisCart.totalPrice);
    }

    add(menuProduct){
      const thisCart = this;
      //console.log('adding product', menuProduct);

      /* generate HTML based on template */
      const genratedHTML = templates.cartProduct(menuProduct);
      //console.log(genratedHTML);

      /* create element using utils.createElementFromHTML */
      const generatedDom = utils.createDOMFromHTML(genratedHTML);
      //console.log(generatedDom);

      /* add element to cart */
      thisCart.dom.productList.appendChild(generatedDom);
      
      thisCart.products.push(new CartProduct(menuProduct, generatedDom));
      //console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    remove(menuProduct){
      const thisCart = this;

      /* find the index of menuProduct */
      const index = thisCart.products.indexOf(menuProduct);
      //console.log('index: ', index);

      /* remove menuProduct from DOM */
      //console.log(menuProduct.dom.wrapper);
      menuProduct.dom.wrapper.remove();

      /* remove menuProduct from table thisCart.products */
      thisCart.products.splice(index, 1);
      
      /* call thisCart.uptade() */
      thisCart.update();
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log('inside: ',thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        //console.log('thisCartProduct.amountWidget: ', thisCartProduct.amountWidget);
        //console.log('thisCartProduct.price: ', thisCartProduct.price);
        //console.log('thisCartProduct.amount: ', thisCartProduct.amount);
        //console.log('thisCartProduct.dom.price: ', thisCartProduct.dom.price);
        //console.log('thisCartProduct.dom.amountWidget: ', thisCartProduct.dom.amountWidget);
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();        
      })

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();

        //console.log('remove clicked!');
      })
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data: ', thisApp.data);

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
      thisApp.initCart();
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
  };

  app.init();
}
