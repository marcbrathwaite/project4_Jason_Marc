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
        //Retrive value of Search Type radio button
        const searchType = $('input[name="searchType"]').val();

        // Retrieves nutrition value from search box
        const searchTerm = $('#searchField').val();
        // Clear search field
        $('#searchField').val('');
        //Create promise for food item search
        foodApp.getFoodItems(searchTerm);
        // console.log("​foodApp.events -> ndbnoArr", ndbnoArr);
        // Create an array of  promises for nutrient search
        // const promiseArr = foodApp.getFoodNutrients(ndbnoArr);
        // Make API request and retrieve food items
        // foodApp.makeAPIRequest(promiseArr, foodApp.displayNutritionalInfo);

    });
}

foodApp.apiKeyUSDA = 'TqiCp1WcVXZzchDeT3DL0M8mk2OrOirzhkXgTrwa';



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

    //AJAX API requiest for search term AND GET ndbno numbers
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


            //Store all Nutrients in an Array 
            foodApp.nutrientsArr = nutrientsArr;
            //Find out number of pages
            foodApp.numofPages = Math.ceil(foodApp.nutrientsArr.length / 12);

            let start = 0;
            let end = 12;

            //Used to arrays of nutrients objects per page
            foodApp.pages = [];


            for (let i=0; i < foodApp.numofPages; i++) {
                foodApp.pages.push(foodApp.nutrientsArr.slice(start, end));
                start = end;
                end += 12;
            }

            foodApp.currentPage = 0;


            //Display first 12 food nutritional items
            foodApp.displayNutritionalInfo(foodApp.pages, foodApp.currentPage)

            
        });
        
    });
};


foodApp.displayNutritionalInfo = function (arr, arrIndex) {

    let foodNutrientsHTML = `<ul class="nutrientList">`;
    
    arr[arrIndex].forEach((elem) => {
        const name = elem.name.replace(/GTIN:\s*\d*|UPC:\s*\d*/ig,'')
        .replace(/amp\;/ig,'')
        .replace(/^([a-zA-Z0-9\&\\\:\,\'\/\; ]{60})([a-zA-Z0-9\&\\\,\:\;\'\/ ]*)/ig, (matchedString, first, second) => {
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
        `<li class="nutrientLabel">
           <ul>
             <li>${name}</li>
             <li>${elem.measure} </li>
             <li>Sugar ${sugarVal}</li>
             <li>Protein ${proteinVal}</li>
             <li>Fat ${fatVal}</li>
             <li>Cholesterol ${cholesterolVal}</li>
             <li>Carbohydrates ${carbVal}</li>
             <li>Energy ${energyVal}</li>
             <li>Sodium ${sodiumVal}</li>
             <li>Fibre ${fibreVal}</li>
           </ul>
           </li>
        `;
    });

    foodNutrientsHTML += `</ul>`;

    $('.mainContent').append(foodNutrientsHTML);

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
    $('#resultsList').empty();
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
})