var neighborhoodController = require('./controllers/neighborhood.controller.js'),
  geoController = require('./controllers/geographic.controller');

module.exports = function(app) {
  // set up the routes themselves
  app.get("/api/neighborhood", neighborhoodController.neighborhoodByBounds);
  app.get("/api/neighborhoodNames", neighborhoodController.neighborhoodNamesBBox);
  app.get("/api/getSingleNeighborhood", neighborhoodController.getSingleNeighborhood);

  app.get("/api/geo/trees", geoController.showTrees);
  app.get("/api/geo/address", geoController.getAddress);
  app.get("/api/geo/clusterByReducedPrecision", geoController.clusterByReducedPrecision);

  app.get("/api/stats/trees", geoController.showTrees);
};
