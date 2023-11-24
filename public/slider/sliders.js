const priceInputs = document.querySelectorAll('.filters-form__price'); // все инпуты с ценой (коллекция из 2х инпутов)
const minPriceField = document.querySelector('#min-price-field'); // поле ввода минимальной цены
const maxPriceField = document.querySelector('#max-price-field'); // поле ввода максимальной цены

const minPrice = minPriceField.getAttribute('min'); // получаем аттрибут минимальной цен
const maxPrice = maxPriceField.getAttribute('max'); // получаем аттрибут максимальной цены

const AVERAGE_CHAR_WIDTH = 8; //px
const PIXEL_CORRECTION = 2; //px

const sliderController = document.querySelector('.slider-contoller'); // находим слайдер

const grips = sliderController.querySelectorAll('.slider-contoller__grip'); // коллекция из двух ползунков
const gripMin = sliderController.querySelector('.slider-contoller__grip--min'); // левый ползунок
const gripMax = sliderController.querySelector('.slider-contoller__grip--max'); // правый ползунок

const gripWidth = gripMin.offsetWidth; // узнаем ширину ползунка - данном случае 20px

const gripGrowingDelta = 1; // +1px at both sides of grip when it picked-up
let gripMinPosition = 0;
let gripMaxPosition = 0;

const sliderLineWidth = sliderController.querySelector('.slider-contoller__scale').offsetWidth; // ширина slider-scale - линии, по которой бегают ползунки; - 176px по макету

const costPerPixel = (maxPrice - minPrice) / sliderLineWidth; // цена в одном пикселе
const sliderBar = sliderController.querySelector('.slider-contoller__current-range'); // элемент, показывающий текущее расстояние между ползунками

let sliderBarMin = 0;
let sliderBarMax = 0;

var KeyCode = {
  ESC: 27,
  ENTER: 13
};

const resizeInputs = function() { //changes inputs width
  priceInputs.forEach((input) => {
    input.style.width = (input.value.length * AVERAGE_CHAR_WIDTH + PIXEL_CORRECTION) + 'px';
  });
  // old way
  // for (var i = 0; i < priceInputs.length; i++) {
  //   priceInputs[i].style.width = (priceInputs[i].value.length * AVERAGE_CHAR_WIDTH + PIXEL_CORRECTION) + 'px';
  // };
};

const updateFields = function() { //updates inputs value while grip's moving
  minPriceField.value = Math.round(minPrice + gripMinPosition * costPerPixel);
  maxPriceField.value = Math.round(minPrice + gripMaxPosition * costPerPixel);
  resizeInputs();
};

// check grip's position and change it when grip is outside it's position range
const checkGripPosition = function(grip) { 
  if (grip === gripMin) {
    if (gripMinPosition < 0) {
      gripMinPosition = 0;
    }
    if (gripMinPosition > sliderLineWidth - gripWidth) {
      gripMinPosition = sliderLineWidth - gripWidth;
    }
  }
  if (grip === gripMax) {
    if (gripMaxPosition > sliderLineWidth) {
      gripMaxPosition = sliderLineWidth;
    }
    if (gripMaxPosition < gripWidth) {
      gripMaxPosition = gripWidth;
    }
  }
};

const updateGrips = function(targetField) { //updates grips positions after fields changing and while mouse moving
  gripMinPosition = (minPriceField.value - minPrice) / costPerPixel;
  checkGripPosition(gripMin);
  gripMaxPosition = (maxPriceField.value - minPrice) / costPerPixel;
  checkGripPosition(gripMax);
  let delta = gripWidth - (gripMaxPosition - gripMinPosition);
  if (delta > 0) {
    if (targetField === minPriceField) {
      gripMaxPosition = gripMaxPosition + delta;
    }
    if (targetField === maxPriceField) {
      gripMinPosition = gripMinPosition - delta;
    }
  }
  sliderBarMin = gripMinPosition;
  sliderBarMax = gripMaxPosition;
  gripMin.style.left = gripMinPosition + 'px';
  gripMax.style.left = gripMaxPosition + 'px';
  sliderBar.style.marginLeft = sliderBarMin + 'px';
  sliderBar.style.marginRight = (sliderLineWidth - sliderBarMax) + 'px';
};

const addPriceFieldHandler = function(priceInput) {
  priceInput.addEventListener('input', (evt) => {
    resizeInputs();
    updateGrips(evt.target);
  });
  priceInput.addEventListener('change', (evt) => {
    if (+priceInput.value < minPrice || priceInput.value == '') {
      if (evt.target === maxPriceField) {
        minPriceField.value = minPrice;
        priceInput.value = Math.round(minPrice + gripWidth * costPerPixel);
      } else {
        priceInput.value = minPrice;
      }
    }
    if (+priceInput.value > maxPrice) {
      if (evt.target === minPriceField) {
        maxPriceField.value = maxPrice;
        priceInput.value = Math.round(maxPrice - gripWidth * costPerPixel);
      } else {
        priceInput.value = maxPrice;
      }
    }
    
    priceInput.value = +priceInput.value; // removes leading zeros (00125 ->  125)
    // console.log(+priceInput.value);
    resizeInputs();
  });
  priceInput.addEventListener('keydown', (evt) => {
    if (evt.which === KeyCode.ENTER) {
      evt.preventDefault();
      evt.target.blur();
    }
  });
};

const addGripHandler = function(grip) {
  grip.onmousedown = function(evt) {
    evt.preventDefault();
    let gripLeftCoord = grip.getBoundingClientRect().left + window.pageXOffset;
    let shiftX = evt.pageX - gripLeftCoord - gripGrowingDelta;
    let sliderLeftCoord = sliderController.getBoundingClientRect().left + window.pageXOffset;

    function moveAt(evtMove) {
      let field = minPriceField;
      gripPosition = evtMove.pageX - sliderLeftCoord - shiftX;
      if (evt.target === gripMin) {
        gripMinPosition = gripPosition;
        checkGripPosition(gripMin);
      }
      if (evt.target === gripMax) {
        gripMaxPosition = gripPosition;
        checkGripPosition(gripMax);
        field = maxPriceField;
      }
      updateFields();
      updateGrips(field);
    }

    document.onmousemove = function(evtMove) {
      moveAt(evtMove);
    };

    document.onmouseup = function(evtUp) {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
};

updateGrips(minPriceField); //initialization
resizeInputs();

grips.forEach(grip => addGripHandler(grip));

priceInputs.forEach(input => addPriceFieldHandler(input));


