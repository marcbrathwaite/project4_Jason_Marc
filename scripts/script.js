const foodApp = {};

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
        console.log(searchTerm);
        // Clear search field
        $('#searchField').val('');
        //Create promise for food item search
        const promise = foodApp.getFoodItems(searchTerm);
        foodApp.makeAPIRequest(promise, foodApp.displayFoodItem);
    });
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

foodApp.makeAPIRequest = function(promise, fn){
    $.when(promise).then((res) => {
        fn(res);
    });
};

foodApp.displayFoodItem = function(res) {
    const foodItemArray = res.list.item;
    let foodItemHTML = '';
    foodItemArray.forEach(function(elm){
        // const name = elm.name.replace(/(GTIN:\s+\d+)|(UPC:\s+\d+) /ig,'');
        const name = elm.name.replace(/GTIN:\s*\d*|UPC:\s*\d*/ig,'');
        foodItemHTML += `<li id=${elm.ndbno}>${name}</li>`;
    });
    $('#resultsList').append(foodItemHTML);
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
