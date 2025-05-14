import { classNames, select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
    constructor(element){
        const thisBooking = this;

        //thisBooking.element = element;
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.tableSelected = '';
        console.log(thisBooking);
    }

    getData(){
        const thisBooking = this;
        //console.log(thisBooking.datePickerWidget.minDate);

        const starDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);

        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

        const params = {
            bookings: [
                starDateParam,
                endDateParam,
            ],
            eventsCurrnet: [
                settings.db.notRepeatParam,
                starDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };
        //console.log('getData params: ', params);

        const urls = {
            bookings:      settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
            eventsCurrnet: settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrnet.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
        };
        //console.log('getData urls: ', urls.bookings);

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrnet),
            fetch(urls.eventsRepeat),
        ])
        .then(function(allResponses){
            //console.log(bookingsResponse);
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
            // console.log(bookings);
            // console.log(eventsCurrnet);
            // console.log(eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePickerWidget.minDate;
        const maxDate = thisBooking.datePickerWidget.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat === 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
                thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
            }
        }

        //console.log(thisBooking.booked);

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let incrementTime = startHour; incrementTime < startHour + duration; incrementTime += 0.5){            
            if(typeof thisBooking.booked[date][incrementTime] == 'undefined'){
                thisBooking.booked[date][incrementTime] = [];
            }
            thisBooking.booked[date][incrementTime].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePickerWidget.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

        let allAvailable = false;

        if(typeof thisBooking.booked[thisBooking.date] === 'undefined' || 
           typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
                table.classList.add(classNames.booking.tableBooked);
                //console.log('table: ',table);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
            table.classList.remove(classNames.booking.tableSelected);
        }
        thisBooking.tableSelected = '';
        //console.log(thisBooking.tableSelected);
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

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.allTables = thisBooking.dom.wrapper.querySelector('.floor-plan');

        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

        thisBooking.dom.checkbox = thisBooking.dom.wrapper.querySelectorAll(select.booking.checkbox);


    }

    initTables(element){
        const thisBooking = this;

        if(element.classList.contains('booked')){
            alert('This table is not available at the time.');
        } else {
            thisBooking.tableSelected = element.getAttribute('data-table');

            for(let table of thisBooking.dom.tables){
                if(table.classList.contains('selected') && table.getAttribute('data-table') !== thisBooking.tableSelected){
                    table.classList.toggle(classNames.booking.tableSelected);
                }
            }
            element.classList.toggle(classNames.booking.tableSelected);
        }
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
  
        thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
            event.preventDefault();
            thisBooking.peopleAmount = thisBooking.peopleAmountWidget.value;
            //console.log(thisBooking.peopleAmount);
        });
        thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
            event.preventDefault();
            thisBooking.hoursAmount = thisBooking.hoursAmountWidget.value;
            //console.log(thisBooking.hoursAmount);
        });

        thisBooking.dom.datePicker.addEventListener('updated', function(){
            thisBooking.datePicked = thisBooking.datePickerWidget.value;
        });
        thisBooking.dom.hourPicker.addEventListener('updated', function(){
            thisBooking.hourPicked = thisBooking.hourPickerWidget.value;
        });

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
        });

        thisBooking.dom.allTables.addEventListener('click', function(event){
            event.preventDefault();
            if(event.target.classList.contains('table')){
                thisBooking.initTables(event.target);
                //console.log('table clicked!: ', event.target);
            }
        });

        //console.log(thisBooking.dom);
        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        })
    }

    sendBooking(){
        const thisBooking = this;
  
        const url = settings.db.url + '/' + settings.db.bookings;
  
        const payload = {
          date: thisBooking.datePickerWidget.value,
          hour: thisBooking.hourPickerWidget.value,
          table: parseInt(thisBooking.tableSelected),
          duration: parseInt(thisBooking.hoursAmountWidget.value),
          ppl: parseInt(thisBooking.peopleAmountWidget.value),
          starters: [],
          phone: thisBooking.dom.address.value,
          addres: thisBooking.dom.phone.value,
        }
    
        console.log(thisBooking.dom);
        //payload.starters.push(prod.getData());
        for(let option of thisBooking.dom.checkbox){
            if(option.checked) payload.starters.push(option.value);
        }
        console.log(payload.starters);


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

        if(confirm("Do you confirm your reservation?")) {
            fetch(url, transferOptions)
                .then(function(rawResponse){
                return rawResponse.json();
            })
            .then(function(parsedResponse){
                console.log('powrtór',parsedResponse);
                thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
                thisBooking.updateDOM();
            }); 
        }
    }
}

export default Booking;