var neighborhoodController = require('./controllers/neighborhood.controller.js'),
    geoController = require('./controllers/geographic_controller');

module.exports = function (app) {
    // set up the routes themselves
    app.get("/api/neighborhood", neighborhoodController.neighborhoodByBounds);

    app.get("/api/geo/trees", geoController.showTrees);
    app.get("/api/geo/clusterByReducedPrecision/:precision", geoController.clusterByReducedPrecision);
};
