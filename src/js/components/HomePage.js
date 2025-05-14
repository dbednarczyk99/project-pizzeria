import {templates, select} from '../settings.js';
import utils from '../utils.js';
//import Flickity from 'src/vendor/flickity.pkgd.js';

class HomePage {
  constructor(data) {
    const thisPage = this;

    thisPage.data = data;

    thisPage.render();
    thisPage.initWidgets();

    //console.log(thisPage.data);
  }

   initWidgets() {
    const thisPage = this;
    
    // eslint-disable-next-line no-undef
    thisPage.carousel = new Flickity ( thisPage.dom.carousel, {
        draggable: true,
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
        autoPlay: 3000,
        selectedAttraction: 0.01,
        friction: 0.3,
    });
   }

  render() {
    const thisPage = this;
    
    thisPage.dom = {};
    thisPage.dom.home = document.querySelector(select.containerOf.home);
    
    

    const homeGenratedHTML = templates.homePage(thisPage.data);
    thisPage.elementHome = utils.createDOMFromHTML(homeGenratedHTML);
    thisPage.dom.home.appendChild(thisPage.elementHome);

    thisPage.dom.carousel = document.querySelector(select.containerOf.carousel);
    console.log('thisPage.dom.carousel: ', thisPage.dom.carousel);
  }
}

export default HomePage;