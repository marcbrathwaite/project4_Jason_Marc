const foodApp = {};

$.ajaxSettings.traditional = true;

foodApp.init = function () {
    foodApp.resetAppVariables();
    //Number of items which would be displayed per page
    foodApp.itemsPerPage = 6;
    //Initialize even listeners
    foodApp.events();
}

foodApp.resetAppVariables = function() {
    //Array of arrays, each containing the what should be displayed on the correspoding page on the DOM
    foodApp.pages = [];
    //Array to store all results of searches
    foodApp.itemsArray = [];
    //Variable for storing the number of pages of results
    foodApp.numofPages = 0;
    //Variable for keeping track of current page
    foodApp.currentPage = 0;
}

//Function to move the scrollbar to the top of the mainContent section
foodApp.scrollMain = function (duration) {
    $('html, body').animate({
        scrollTop: $('.mainContent').offset().top
    }, duration);
}

foodApp.events = function () {
    //Listen for scroll and show page buttons upon certain scroll height
    $(window).on('scroll', function () {
        let y = $(window).scrollTop();
        let mainTop = $('.mainContent').offset().top;
        if (y > mainTop - 100) {
            if (foodApp.currentPage === foodApp.pages.length - 1 || foodApp.numofPages < 1) {
                $('.pageButton--next').hide(400);
            } else {
                $('.pageButton--next').show(400);
            }
            if (foodApp.currentPage > 0) {
                $('.pageButton--prev').show(400);
            }
        } else {
            $('.pageButton').hide(400);
        }
    });

    // Get search term and value of search type=nutritional. Save value in variable
    $('#submitBtn').on('click', function (event) {
        event.preventDefault();
        // Retrieves seachTerm value from search box
        const searchTerm = $('#searchField').val();
        //Create promise for food item search
        foodApp.getFoodItems(searchTerm);
        // Clear search field
        $('#searchField').val('');
    });

    //Click next arrow
    $('.mainContent').on('click', '.pageButton--next', function () {
        //Clear the dom
        foodApp.clearResults();
        //Increment current page
        foodApp.currentPage++;
        //Temporarily hide next button on click
        foodApp.buttonDelay();
        //Display content on page
        foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage);
        //Display prev arrow if page counter == 1
        if (foodApp.currentPage === 1) {
            $('.pageButton--prev').show();
        }
        //Hide next arrow if current page === pages.length
        if (foodApp.currentPage === foodApp.pages.length - 1) {
            $('.pageButton--next').hide();
        }
    });

    //Click prev arrow
    $('.mainContent').on('click', '.pageButton--prev', function () {
        //Clear the dom
        foodApp.clearResults();
        //Decrease page counter
        foodApp.currentPage--;
        //Display content on page
        foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage);
        // Temporarily hide next button on click
        foodApp.buttonDelay();
        //Hide prev arrow if page counter === 0
        if (foodApp.currentPage === 0) {
            $('.pageButton--prev').hide();
        }
    });
}

foodApp.apiKeyUSDA = 'TqiCp1WcVXZzchDeT3DL0M8mk2OrOirzhkXgTrwa';

foodApp.buttonDelay = function () {
    // Temporarily hide next button on click
    $('.pageButton').hide();

    if (foodApp.currentPage === foodApp.pages.length - 1) {
        setTimeout(() => {
            $('.pageButton--prev').show();
        }, 500);
    } else if (foodApp.currentPage === 0) {
        setTimeout(() => {
            $('.pageButton--next').show();
        }, 500);
    } else {
        setTimeout(() => {
            $('.pageButton').show();
        }, 500);
    }
};


//Method to determine number of pages of results after search
foodApp.generatePages = function (objectArr) {
    //Reset object parameters
    foodApp.pages = [];
    foodApp.numofPages = 0;
    foodApp.currentPage = 0;

    foodApp.itemsArray = objectArr.filter((elem) => {
        return elem.nutrients.length > 0;
    });

    //Determine the number of results pages
    foodApp.numofPages = Math.ceil(foodApp.itemsArray.length / foodApp.itemsPerPage);

    let start = 0;
    let end = foodApp.itemsPerPage;

    //Loops for putting results on appropriate pages
    for (let i = 0; i < foodApp.numofPages; i++) {
        foodApp.pages.push(foodApp.itemsArray.slice(start, end));
        start = end;
        end += foodApp.itemsPerPage;
    }

}

foodApp.showSpinner = function() {
    $('.spinner').show();
}

foodApp.hideSpinner = function() {
    $('.spinner').hide();
}

foodApp.showMainContent = function() {
    $('.mainContent').show();
}
//Function to query USDA database and display nutrient info for each result
foodApp.getFoodItems = function (search) {
    //If search is not empty or doesnt contain only spaces
    if (search.length !== 0 && !/^ +$/.test(search)) {
        //Remove error text
        $('.errorText').remove();
        //Clear Results from DOM
        foodApp.clearResults();
        $('.mainContent').hide();
        $('.pageButton--prev').hide();
        $('.pageButton--next').hide();
        //Reset app variables
        foodApp.resetAppVariables()
        //Show main content
        foodApp.showMainContent();
        //Show Spinner
        foodApp.showSpinner();
        foodApp.scrollMain(500);
        
        const foodItemPromise = $.ajax({
            url: '//api.nal.usda.gov/ndb/',
            datatype: 'json',
            method: 'GET',
            data: {
                api_key: foodApp.apiKeyUSDA,
                format: 'json',
                q: search,
                max: 60,
                nutrients: 'y'
            }
        });

        //AJAX API request for Foot Item search term to get ndbno numbers
        $.when(foodItemPromise)
            .then((res) => {
                if (res.list) {
                    const foodItemArray = res.list.item;

                    //Generate an array of ndbno numbers
                    const ndbnoArr = foodItemArray.map((elem) => {
                        return elem['ndbno'];
                    });

                    //Generate an array of promises with ndbno search
                    const nutrientPromises = ndbnoArr.map((elem) => {
                        return $.ajax({
                            url: '//api.nal.usda.gov/ndb/nutrients',
                            dataType: 'json',
                            method: 'GET',
                            data: {
                                api_key: foodApp.apiKeyUSDA,
                                format: 'json',
                                lt: 'n',
                                ndbno: elem,
                                nutrients: ['208', '204', '601', '307', '205', '291', '269', '203']
                            }
                        });
                    });

                    $.when(...nutrientPromises)
                        .then((...res) => {

                            let nutrientsArr = [];
                            //Handles the scenario for multiple results
                            if (typeof res[0][0] !== 'undefined') {
                                nutrientsArr = res.map((elem) => {
                                    return elem[0].report.foods[0];
                                });
                            } else { //Handles the scenario when only one result is returned
                                nutrientsArr.push(res[0].report.foods[0]);
                            }

                            foodApp.generatePages(nutrientsArr);
                            foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage)
                        }).fail(() => {
                            foodApp.hideSpinner();
                            foodApp.displayAPIError();
                            foodApp.showMainContent();
                            foodApp.scrollMain(500);
                        });
                } else {
                    foodApp.hideSpinner();
                    foodApp.displaySearchError();
                    foodApp.showMainContent();
                    foodApp.scrollMain(500);
                }
            }).fail(() => {
                foodApp.hideSpinner();
                foodApp.displayAPIError();
                foodApp.showMainContent();
                foodApp.scrollMain(500);

            });
    }
};

//Function to display message letting user know that no results were returned for their input
foodApp.displaySearchError = function () {
    const searchErrorHTML = `<h2 class="errorText">No results were found for that search term. Please change your search term and try again!</h2>`;

    $('.mainContent').append(searchErrorHTML);
    
}
//Function to display message letting user that there are issues with the API
foodApp.displayAPIError = function() {
    const searchErrorHTML = `<h2 class="errorText">We are experiencing issues retrieving results from the USDA Food Composition API. Please wait 15 minutes and try again!</h2>`;

    $('.mainContent').append(searchErrorHTML);
}

foodApp.displayNutritionalInfo = function (arr, arrIndex) {

    let foodNutrientsHTML = '<div class="nutrientListBlock"><ul class="nutrientList">';

    arr[arrIndex].forEach((elem) => {
        //Remove ampersand unicode from name, and get the first 40 characters of the name and add '...' to it
        const shortName = elem.name
            .replace(/amp\;/ig, '')
            .replace(/^([\w\&\\\:\,\'\/\;\.\-\+\=\%\!\#\@\(\)\<\>\{\}\? ]{40})([\w\&\\\,\:\;\'\/\;\.\-\+\=\%\!\#\@\(\)\<\>\{\}\? ]*)/ig, (matchedString, first, second) => {
                return `${first}...`;
            });

        const sugarVal = `${elem.nutrients[0].value}${elem.nutrients[0].unit}`;
        const proteinVal = `${elem.nutrients[1].value}${elem.nutrients[1].unit}`;

        const fatVal = `${elem.nutrients[2].value}${elem.nutrients[2].unit}`;
        const cholesterolVal = `${elem.nutrients[3].value}${elem.nutrients[3].unit}`;
        const carbVal = `${elem.nutrients[4].value}${elem.nutrients[4].unit}`;
        const energyVal = `${elem.nutrients[5].value}${elem.nutrients[5].unit}`;
        const sodiumVal = `${elem.nutrients[6].value}${elem.nutrients[6].unit}`;
        const fibreVal = `${elem.nutrients[7].value}${elem.nutrients[7].unit}`;

        foodNutrientsHTML +=
            `<li class="nutrientList__Container">
           <ul class="nutrientList__header">
             <li class="nutrientList__FoodName"><p class="nutrientList__FoodName--overlay" title="${elem.name}"><span>${shortName}</span></p></li>
           </ul>
           <ul class="nutrientLabel">
             <li class="nutrientLabel__Title">Nutrition facts</li>
             <li class="nutrientLabel__Serving">Serving size</li>
             <li class="nutritionLabel__Measurement">${elem.measure} </li>
             <li><hr></li>
             <li class="nutrientLabel__Nutrient">Energy <span class="nutrientLabel__Nutrient--measurement">${energyVal}</span></li>
             <li class="nutrientLabel__Nutrient">Fat <span class="nutrientLabel__Nutrient--measurement">${fatVal}</span></li>
             <li class="nutrientLabel__Nutrient">Cholesterol <span class="nutrientLabel__Nutrient--measurement">${cholesterolVal}</span></li>
             <li class="nutrientLabel__Nutrient">Sodium <span class="nutrientLabel__Nutrient--measurement">${sodiumVal}</span></li>
             <li class="nutrientLabel__Nutrient">Carbohydrates <span class="nutrientLabel__Nutrient--measurement">${carbVal}</span></li>
                <ul>
                    <li class = "nutrientLabel__Nutrient nutrientLabel__Nutrient--indent"> Fibre  <span class = "nutrientLabel__Nutrient--measurement"> ${fibreVal} </span></li>
                    <li class = "nutrientLabel__Nutrient nutrientLabel__Nutrient--indent"> Sugar <span class = "nutrientLabel__Nutrient--measurement"> ${sugarVal} </span></li>
                </ul>
             <li class="nutrientLabel__Nutrient">Protein<span class="nutrientLabel__Nutrient--measurement">${proteinVal}</span></li>
           </ul>
           </li>
        `;
    });

    foodNutrientsHTML += `</ul></div>`;

    $('.mainContent').append(foodNutrientsHTML);
    $('.nutrientListBlock').show();
    foodApp.hideSpinner();
    foodApp.showMainContent();
    foodApp.scrollMain(100);

}

// Clear results from the page
foodApp.clearResults = function () {
    $('.nutrientList').empty();
}


$(function () {
    foodApp.init();
})