var helperController = require('./controllers/helper.controller.js'),
    neighborhoodController = require('./controllers/neighborhood.controller.js'),
    geoController = require('./controllers/geographic_controller');

module.exports = function (app) {
    // set up the routes themselves

    //helper route
    // app.get("/api", helperController.showAPIdocs);
    // app.get("/api/status", helperController.showStorageAvailable);

    //neighborhoods routes
    app.get("/api/neighborhood/bounds", neighborhoodController.neighborhoodBounds);
    app.get("/api/neighborhood/polygons", neighborhoodController.neighborhoodPolygons);

    app.get("/api/geo/trees", geoController.showTrees);

    // app.get("/api/showTrees", geoController.showTrees);

    // app.get("/api/filter", geoController.filters);
    // app.get("/api/buffer", geoController.buffer);
    // app.get("/api/nearClick", geoController.nearClick);
};
