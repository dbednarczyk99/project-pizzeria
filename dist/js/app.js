  import {settings, classNames, templates, select} from './settings.js';

  import Product from './components/Product.js';
  import Cart from './components/Cart.js';
  import Booking from './components/Booking.js';
  
  const app = {
    initPages: function(){
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      const idFromHash = window.location.hash.substring(2);
      //console.log(idFromHash);

      let useId = thisApp.pages[0].id;
      for(let page of thisApp.pages){
        if(page.id === idFromHash) {
          useId = page.id; 
          break;
        }
      }
      //console.log(useId);
      thisApp.activatePage(useId);

      for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          event.preventDefault();
          const clickedElement = this;

          const pageId = clickedElement.getAttribute('href').substr(1);
          thisApp.activatePage(pageId);

          /* change URL hash */
          window.location.hash = '#/' + pageId;
        });
      }
    },

    activatePage: function(pageId){
      const thisApp = this;

      /* add class active to matching pages, remove from, non-matching pages */
      for(let page of thisApp.pages){
        page.classList.toggle(classNames.pages.active, page.id === pageId);
      }

      /* add class active to matching link, remove from, non-matching link */
      for(let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active, 
          link.getAttribute('href') === '#' + pageId
        );
      }
    },

    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }

      //const testProduct = new Product();
      //console.log('testProduct: ', testProduct);
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedREsponse', parsedResponse);

          /*save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method */
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initBooking: function(){
      const thisApp = this;

      const bookingElem = document.querySelector(select.containerOf.booking);
      thisApp.booking = new Booking(bookingElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
      thisApp.initPages();
      thisApp.initBooking();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
    }
  };

  app.init();
