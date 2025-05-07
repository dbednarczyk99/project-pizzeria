import {settings, classNames, templates, select} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

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
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
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

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.totalPrice - settings.cart.defaultDeliveryFee,
        totalNumber: thisCart.totalNumber,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: []
      }

      for(let prod of thisCart.products){
        //console.log('prod.getData(): ', prod.getData());
        payload.products.push(prod.getData());
      }

      //console.log('payload: ', payload);
      //console.log(url);
      //console.log(thisCart.products);

      const transferOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, transferOptions)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedREsponse){
          console.log(parsedREsponse)
        });
    }

    update(){
      const thisCart = this;
      let deliveryFee = 0;

      //let totalNumber = 0;
      let subtotalPrice = 0;
      thisCart.totalNumber = 0;

      for (let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      if(thisCart.totalNumber === 0 && subtotalPrice === 0){
        deliveryFee = 0;      }
      else{
        deliveryFee = settings.cart.defaultDeliveryFee;
      }

      thisCart.totalPrice = subtotalPrice + deliveryFee;
      
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
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

export default Cart;