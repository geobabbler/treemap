var neighborhoodController = require('./controllers/neighborhood.controller.js'),
  geoController = require('./controllers/geographic.controller');

module.exports = function(app) {
  // set up the routes themselves
  app.get("/api/neighborhood", neighborhoodController.neighborhoodByBounds);

  app.get("/api/geo/trees", geoController.showTrees);
  app.get("/api/geo/clusterByReducedPrecision/:precision", geoController.clusterByReducedPrecision);

  app.get("/api/stats/trees", geoController.showTrees);
};
