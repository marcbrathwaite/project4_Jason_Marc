const foodApp = {};

$.ajaxSettings.traditional = true;

foodApp.init = function () {
    foodApp.events();
}

foodApp.events = function () {
    // Get search term and value of search type=nutritional. Save value in variable
    $('#submitBtn').on('click', function (event) {
        event.preventDefault();
        // Clears display
        foodApp.clearDOM();
        $('.pageButton--prev').hide();
        $('.pageButton--next').hide();

        //Retrive value of Search Type radio button
        const searchType = $('input[type="radio"]:checked').val();

        // Retrieves seachTerm value from search box
        const searchTerm = $('#searchField').val();

        if (searchType === 'nutrition') {
            //Create promise for food item search
            foodApp.getFoodItems(searchTerm);
        } else {
            //Create promise for Recipe search
            foodApp.getRecipeItems(searchTerm);

        }
        //Make function
        $('html, body').animate({
            scrollTop: $('.mainContent').offset().top
        }, 1500);
        
        // Clear search field
        $('#searchField').val('');

    });

    //Click next arrow
    $('.mainContent').on('click', '.pageButton--next', function () {
        //Clear the dom
        foodApp.clearDOM();
        //Increment current page
        foodApp.currentPage++;
        //Display content on page
        foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage);

        $('html, body').animate({
            scrollTop: $('.mainContent').offset().top
        }, 1000);

        //Display prev arrow if page counter == 1
        $('.pageButton--prev').show('1000');

        //Hide next arrow if current page === pages.length
        if (foodApp.currentPage === foodApp.pages.length - 1) {
            $('.pageButton--next').hide();
        }

    })

    //Click prev arrow
    $('.mainContent').on('click', '.pageButton--prev', function () {
        //Clear the dom
        foodApp.clearDOM();
        //Decrease page counter
        foodApp.currentPage--;

        //Display content on page
        foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage);

        $('html, body').animate({
            scrollTop: $('.mainContent').offset().top
        }, 1000);

        //Display next arrow if page counter === pages.length - 1
        $('.pageButton--next').show('1000');

        //Hide prev arrow if page counter === 0
        if (foodApp.currentPage === 0) {
            $('.pageButton--prev').hide();
        }

    })
}

foodApp.apiKeyUSDA = 'TqiCp1WcVXZzchDeT3DL0M8mk2OrOirzhkXgTrwa';

//Array of arrays, each containing the what should be displayed on the correspoding page on the DOM
foodApp.pages = [];

//Array to store all results of searches
foodApp.itemsArray = [];

//Number of items which would be displayed per page
foodApp.itemsPerPage = 6;

//Variable for storing the number of pages of results
foodApp.numofPages = 0;

//Variable for keeping track of current page
foodApp.currentPage = 0;

//Method to determine number of pages of results after search
foodApp.generatePages = function(objectArr) {
    //Reset object parameters
    foodApp.pages = [];
    foodApp.numofPages = 0;
    foodApp.currentPage = 0;
    
    foodApp.itemsArray = objectArr;

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


//Function to query USDA database and display nutrient info for each result
foodApp.getFoodItems = function (search) {
    const foodItemPromise = $.ajax({
        url: 'http://api.nal.usda.gov/ndb/',
        datatype: 'json',
        method: 'GET',
        data: {
            api_key: foodApp.apiKeyUSDA,
            format: 'json',
            q: search,
            max: 50,
            nutrients: 'y'
        }
    });

    //AJAX API request for Foot Item search term to get ndbno numbers
    $.when(foodItemPromise)
        .then((res) => {
            const foodItemArray = res.list.item;
            //Generate an array of ndbno numbers
            const ndbnoArr = foodItemArray.map((elem) => {
                return elem['ndbno'];
            });

            //Generate an array of promises with ndbno search
            const nutrientPromises = ndbnoArr.map((elem) => {
                return $.ajax({
                    url: 'https://api.nal.usda.gov/ndb/nutrients',
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
                    const nutrientsArr = res.map((elem) => {
                        return elem[0].report.foods[0];
                    });

                    foodApp.generatePages(nutrientsArr);
                    foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage)

                    //Display next key arrow if length of pages is more than 1 
                    if (foodApp.numofPages > 0) {
                        $('.pageButton--next').show('1500');
                    }


                });

        });
};

foodApp.getFoodItems2 = function (search) {
    const foodItemPromise = $.ajax({
        url: 'http://api.nal.usda.gov/ndb/',
        datatype: 'json',
        method: 'GET',
        data: {
            api_key: foodApp.apiKeyUSDA,
            format: 'json',
            q: search,
            max: 50,
            nutrients: 'y'
        }
    });

    //AJAX API request for Foot Item search term to get ndbno numbers
    $.when(foodItemPromise)
        .then((res) => {
            const foodItemArray = res.list.item;
            //Generate an array of ndbno numbers
            const ndbnoArr = foodItemArray.map((elem) => {
                return elem['ndbno'];
            });

            //Generate an array of promises with ndbno search
            const nutrientPromises = ndbnoArr.map((elem) => {
                return $.ajax({
                    url: 'https://api.nal.usda.gov/ndb/nutrients',
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
                    const nutrientsArr = res.map((elem) => {
                        return elem[0].report.foods[0];
                    });

                    foodApp.generatePages(nutrientsArr);
                    foodApp.displayNutritionalInfo2(foodApp.pages);


                });

        });
};

foodApp.displayNutritionalInfo = function (arr, arrIndex) {

    let foodNutrientsHTML = '<div class="nutrientList--Block"><ul class="nutrientList">';

    arr[arrIndex].forEach((elem) => {
        const shortName = elem.name.replace(/\,\s*GTIN:\s*\d*|\,\s*UPC:\s*\d*/ig, '')
            .replace(/amp\;/ig, '')
            .replace(/^([\w\&\\\:\,\'\/\; ]{60})([\w\&\\\,\:\;\'\/ ]*)/ig, (matchedString, first, second) => {
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
             <li class="nutrientList__FoodName"><p class="nutrientList__FoodName--overlay" title="${elem.name}"><span>${shortName}</span></p><</li>
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
    $('.nutrientList--Block').show();

}

foodApp.displayNutritionalInfo2 = function(arr) {

    let foodNutrientsHTML = '<div class="gallery">';

    arr.forEach((elem) => {
        foodNutrientsHTML += `<div><ul class="nutrientList">`;
        elem.forEach((subElem) => {

            const shortName = subElem.name.replace(/\,\s*GTIN:\s*\d*|\,\s*UPC:\s*\d*/ig, '')
                .replace(/amp\;/ig, '')
                .replace(/^([\w\&\\\:\,\'\/\; ]{60})([\w\&\\\,\:\;\'\/ ]*)/ig, (matchedString, first, second) => {
                    return `${first}...`;
                });
    
            const sugarVal = `${subElem.nutrients[0].value}${subElem.nutrients[0].unit}`;
            const proteinVal = `${subElem.nutrients[1].value}${subElem.nutrients[1].unit}`;
    
            const fatVal = `${subElem.nutrients[2].value}${subElem.nutrients[2].unit}`;
            const cholesterolVal = `${subElem.nutrients[3].value}${subElem.nutrients[3].unit}`;
            const carbVal = `${subElem.nutrients[4].value}${subElem.nutrients[4].unit}`;
            const energyVal = `${subElem.nutrients[5].value}${subElem.nutrients[5].unit}`;
            const sodiumVal = `${subElem.nutrients[6].value}${subElem.nutrients[6].unit}`;
            const fibreVal = `${subElem.nutrients[7].value}${subElem.nutrients[7].unit}`;
    
            foodNutrientsHTML +=
                `<li class="nutrientList__Container">
               <ul class="nutrientList__header">
                 <li class="nutrientList__FoodName"><p class="nutrientList__FoodName--overlay" title="${subElem.name}"><span>${shortName}</span></p><</li>
               </ul>
               <ul class="nutrientLabel">
                 <li class="nutrientLabel__Title">Nutrition facts</li>
                 <li class="nutrientLabel__Serving">Serving size</li>
                 <li class="nutritionLabel__Measurement">${subElem.measure} </li>
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
        foodNutrientsHTML += `</ul></div>`
    });

    foodNutrientsHTML += `</div>`;

    $('.mainContent').append(foodNutrientsHTML);

}

foodApp.apiKeyFood = '36e1c3158aa2b6e632e8819d171aa9d4';

foodApp.getRecipeItems = function (search) {

    const recipeItemPromise = $.ajax({
        url: 'https://www.food2fork.com/api/search',
        data: {
            key: foodApp.apiKeyFood,
            q: search
        }
    });

    // AJAX API request for Recipe search term
    $.when(recipeItemPromise)
        .then((res) => {
			
            //convert res to JSON object
            const resObj = JSON.parse(res);
            const recipeItemArray = resObj.recipes;



            foodApp.generatePages(recipeItemArr);
            //Store all recipes in an Array 
            foodApp.recipesArr = recipeItemArray;
            //Find out number of pages
            foodApp.numofPages = Math.ceil(foodApp.recipesArr.length / 12);

            let start = 0;
            let end = 12;

            foodApp.pages = [];

            for (let i = 0; i <foodApp.numofPages; i++) {
                foodApp.pages.push(foodApp.recipesArr.slice(start, end));
                start = end;
                end += 12;
            }

            foodApp.currentPage = 0;
            
        }).fail((err) => {
            console.log(err);
        });

}

foodApp.displayRecipes = function (arr, arrIndex) {

}


// Recieves promise and display callback function, and displays appropriate info

foodApp.makeAPIRequest = function (promise, fn) {
    $.when(...promise).then((...res) => {
        fn(res);
    });
};



// User enters search query and selects nutritional info

// Erase any current html in aside list and main section
foodApp.clearDOM = function () {
    $('.nutrientList').empty();
}

// Create preloader while user waits for results

// Take results and add to DOM (append to <ul>). Unique ndbno added as ID for each <li>

// User recieves list of results related to search query

// User chooses from list

// Check value of selection variable 

// Create ajax for USDA nutrient API and pass value of ID:clicked into ndbno

// ????? picture

// Take results from nutrients and add to DOM

// User recieves picture from Unsplash(?) and nutritional info 






// User enters search query and selects recipes

// Erase any current html in aside list and main section

// Get search term and value of search type=recipes. Save value in variable

// Create ajax for Food2Fork API and pass search into q in API

// Create preloader while user waits for results

// Take results (name and img) and add to DOM (append to <ul>). Unique recipeID added as ID for each <li>

// User recieves recipes containing search term

// User chooses from list

// Check value of selection variable 

// Takes ID and uses it as query for API

// Recieves img, ingredients, possible instructions, and adds to DOM

// Recieves picture from not Unsplash, ingredient list, possible cooking instructions


$(function () {
    foodApp.init();

    // $('.mainContent').slick({
    //     accessibility: true,
    //     arrows: true
    // });

        // $('.gallery').flickity({

        // });
})