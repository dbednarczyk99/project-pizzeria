import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

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

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.peopleHoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
  
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

        thisBooking.dom.datePicker.addEventListener('updated', function(){
            thisBooking.datePicked = thisBooking.datePickerWidget.value;
        });
        thisBooking.dom.hourPicker.addEventListener('updated', function(){
            thisBooking.hourPicked = thisBooking.hourPickerWidget.value;
        });
    }
}

export default Booking;