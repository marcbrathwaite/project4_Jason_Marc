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

// Make Ajax API query of the search term and get all of the NDBNO values for the results

foodApp.getFoodItems = function (search) {
    let nutrientsArr = [];
    const foodItemPromise = $.ajax({
        url: 'http://api.nal.usda.gov/ndb/',
        datatype: 'json',
        method: 'GET',
        data: {
            api_key: foodApp.apiKeyUSDA,
            format: 'json',
            q: search, // Get from search query
            max: 50,
            nutrients: 'y'
        }
    });

    $.when(foodItemPromise)
        .then((res) => {
            const foodItemArray = res.list.item;
            const ndbnoArr = foodItemArray.map((elem) => {
                return elem['ndbno'];
            });

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
            // console.log(res[1][0].report.foods[0]);
            // console.log(res);
            nutrientsArr = res.map((elem) => {
                return elem[0].report.foods[0];
            });
        });

    });
};

//Takes an array of NDBNOs and returns an array of promises
// foodApp.getFoodNutrients = function (ndbnoArr) {
//     return ndbnoArr.map((elem) => {
//         return $.ajax({
//             url: 'https://api.nal.usda.gov/ndb/nutrients',
//             dataType: 'json',
//             method: 'GET',
//             data: {
//                 api_key: foodApp.apiKeyUSDA,
//                 format: 'json',
//                 lt: 'n',
//                 ndbno: elem,
//                 nutrients: ['208', '204', '601', '307', '205', '291', '269', '203']
//             }
//         });
//     });
// }

// Create ajax for USDA nutrients API and pass ndbno into query

// foodApp.getFoodNutrients = function(search){
//     return $.ajax({
//         url: 'https://api.nal.usda.gov/ndb/nutrients',
//         dataType: 'json',
//         method: 'GET',
//         data: {
//             api_key: foodApp.apiKeyUSDA,
//             format: 'json',
//             lt: 'n',
//             ndbno: search,
//             nutrients: ['208', '204', '601', '307', '205', '291', '269', '203']
//         }   
//     }); 
// }

// Recieves promise and display callback function, and displays appropriate info

foodApp.makeAPIRequest = function (promise, fn) {
    $.when(...promise).then((...res) => {
        fn(res);
    });
};


foodApp.displayNutritionalInfo = function (res) {

    console.log(res);
    let foodNutrientsHTML = `<ul class="nutrientList">`;
    // Itterates through nutrients and creates HTML for food info section
    res.forEach((elm) => {

    });
    // Displays the results
    $('#nutrientListNames').append(foodNutrientsHTML);
};

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