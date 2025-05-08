import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking{
    constructor(element){
        const thisBooking = this;

        //thisBooking.element = element;
        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element){
        const thisBooking = this;

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;

        const generatedHTML = templates.bookingWidget();
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.peopleHoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
  
        thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
            event.preventDefault();
            thisBooking.peopleAmount = thisBooking.peopleAmountWidget.value;
            //console.log(thisBooking.peopleAmount);
        });
        thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
            event.preventDefault();
            thisBooking.hoursAmount = thisBooking.peopleHoursWidget.value;
            //console.log(thisBooking.hoursAmount);
        });
    }
}

export default Booking;