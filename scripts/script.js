const foodApp = {};

$.ajaxSettings.traditional = true;

foodApp.init = function(){
    foodApp.events();
}

foodApp.events = function(){
    // Get search term and value of search type=nutritional. Save value in variable
    $('#submitBtn').on('click', function(event){
        event.preventDefault();
        // Clears display
        foodApp.clearDOM();
        // Retrieves value of search box
        const searchTerm = $('#searchField').val();
        // console.log(searchTerm);
        // Clear search field
        $('#searchField').val('');
        //Create promise for food item search
        const promise = foodApp.getFoodItems(searchTerm);
        // Make API request and retrieve food items
        foodApp.makeAPIRequest(promise, foodApp.displayFoodItem);
    });
// WHen user clicks on food item on result list
    $('#resultsList').on('click', 'li', function(){
        // Clear current results
        $('#nutrientListNames').empty();
        // Retrieve value of ID
        const foodID = ($(this).attr('id'));
        // console.log(foodID);
        // Create promise for nutrient search
        const promise = foodApp.getFoodNutrients(foodID);
        // Make API requet and retrieve nutritional info
        foodApp.makeAPIRequest(promise, foodApp.displayNutritionalInfo);
    })
};

foodApp.apiKeyUSDA = 'TqiCp1WcVXZzchDeT3DL0M8mk2OrOirzhkXgTrwa';

// Create ajax for USDA(?) foodItem API and pass search into q in API

foodApp.getFoodItems = function(search) {
    return $.ajax({
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
};

// Create ajax for USDA nutrients API and pass ndbno into query

foodApp.getFoodNutrients = function(search){
    return $.ajax({
        url: 'https://api.nal.usda.gov/ndb/nutrients',
        dataType: 'json',
        method: 'GET',
        data: {
            api_key: foodApp.apiKeyUSDA,
            format: 'json',
            lt: 'n',
            ndbno: search,
            nutrients: ['208', '204', '601', '307', '205', '291', '269', '203']
        }   
    }); 
}

// Recieves promise and display callback function, and displays appropriate info

foodApp.makeAPIRequest = function(promise, fn){
    $.when(promise).then((res) => {
        fn(res);
    });
};

// Function to display food items

foodApp.displayFoodItem = function(res) {
    // Gets name value of food items
    const foodItemArray = res.list.item;
    let foodItemHTML = '';
    // Itterates through food items and creates HTML for list (removes GTIN and UPC numbers if present)
    foodItemArray.forEach(function(elm){
        // const name = elm.name.replace(/(GTIN:\s+\d+)|(UPC:\s+\d+) /ig,'');
        const name = elm.name.replace(/GTIN:\s*\d*|UPC:\s*\d*/ig,'');
        foodItemHTML += `<li id=${elm.ndbno}>${name}</li>`;
    });
    // Displays the results
    $('#resultsList').append(foodItemHTML);
}

// Function to display nutritional info

foodApp.displayNutritionalInfo = function(res) {

    const foodObject = res.report.foods[0];
    const foodName = foodObject.name;
    const foodMeasure = foodObject.measure;
    const foodNutrients = foodObject.nutrients;
    let foodNutrientsHTML = '';
    // Itterates through nutrients and creates HTML for food info section
    foodNutrients.forEach(function(elm){
        foodNutrientsHTML += `<li>${elm.nutrient} ${elm.value} ${elm.unit}</li>`
    });
    // Displays the results
    $('#nutrientListNames').append(foodNutrientsHTML);

}

// User enters search query and selects nutritional info

    // Erase any current html in aside list and main section
    foodApp.clearDOM = function(){
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


$(function(){
    foodApp.init();
})
