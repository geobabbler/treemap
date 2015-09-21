'use strict';

/*
data used:
homicides CSV:  https://data.baltimorecity.gov/Public-Safety/Homicides/9h5s-7d88
*/

var pg = require('pg');

var env = require('../../config/env.js'),
  environment = new env(),
  connstring = environment.connstring;

/*
this makes geojson output possible
*/
function FeatureCollection() {
  this.type = 'FeatureCollection';
  this.features = new Array();
}

function Feature() {
  this.type = 'Feature';
  this.geometry = new Object;
  this.properties = new Object;
}

/*
object for tables
*/

exports.showTrees = function(req, res, next) {
  var neX = req.query.neLat,
    neY = req.query.neLng,
    swX = req.query.swLat,
    swY = req.query.swLng,
    filter = req.query.filter;



  //if the bounding box has three values come in on param...
  if (neX && neY && swX && swY) {
    pg.connect(connstring, function(err, client, done) {
      var handleError = function(err) {
        if (!err) return false;
        done(client);
        next(err);
        return true;
      };

      // if(!filter){
      var myQuery = `SELECT common_nam, genus, species, year, ST_AsGeoJSON(geom) AS geography, count(year) AS total ` +
                    `FROM tree_plantingswgs84 ` +
                    `WHERE ST_Intersects(geom, ST_GeometryFromText ('POLYGON((${swY} ${swX},${neY} ${swX},${neY} ${neX},${swY} ${neX},${swY} ${swX}))', 4326 ))`

      if (filter) {
        myQuery += ` and year::int != all (array[${filter}])`
      }
      myQuery += ` GROUP BY common_nam, genus, species, year, geom;`

      // console.log(myQuery)
      client.query(myQuery, function(err, result) {

        if (result.rowCount == 0) {
          res.send(500);
        } else {
          var featureCollection = new FeatureCollection();
          for (var i = 0; i < result.rowCount; i++) {
            var feature = new Feature();
            feature.properties = ({
              "common_name": result.rows[i].common_nam,
              "genus": result.rows[i].genus,
              "species": result.rows[i].species,
              "year": parseInt(result.rows[i].year),
              "total": result.rows[i].total
            })
            feature.geometry = JSON.parse(result.rows[i].geography);
            featureCollection.features.push(feature);
          }
          res.type('text/javascript');
          res.jsonp(featureCollection);
          done();
        }
      });
    })

  } else {
    //send failuer
  }
}

/*clustering experiments*/
exports.clusterByReducedPrecision = function(req, res, next) {
  // var precision = req.params.precision;
  var neX = req.query.neLat,
    neY = req.query.neLng,
    swX = req.query.swLat,
    swY = req.query.swLng,
    filter = req.query.filter;
  //if the bounding box has three values come in on param...
  pg.connect(connstring, function(err, client, done) {
    var handleError = function(err) {
      if (!err) return false;
      done(client);
      next(err);
      return true;
    };



          var myQuery = `
            SELECT ST_AsGeoJSON(ST_Centroid(ST_Collect(geom))) AS geography,
            	neighborhoodname,
            	count(year) AS total,
            	sum(case when year::int = 0 then 1 else 0 end) AS unkownyr,
            	sum(case when year::int = 2008 then 1 else 0 end) AS yr2008,
            	sum(case when year::int = 2009 then 1 else 0 end) AS yr2009,
            	sum(case when year::int = 2010 then 1 else 0 end) AS yr2010,
            	sum(case when year::int = 2011 then 1 else 0 end) AS yr2011,
            	sum(case when year::int = 2012 then 1 else 0 end) AS yr2012,
            	sum(case when year::int = 2013 then 1 else 0 end) AS yr2013
            FROM tree_plantingswgs84
            WHERE ST_Intersects(geom, ST_GeometryFromText ('POLYGON((${swY} ${swX},${neY} ${swX},${neY} ${neX},${swY} ${neX},${swY} ${swX}))', 4326 ))
          `;
          if (filter) {
            myQuery += ` and year::int != all (array[${filter}])`
          }
          myQuery += ` GROUP BY neighborhoodname`;
          // console.log(myQuery);
    client.query(myQuery, function(err, result) {
      var totalTrees = 0;
      if (result.rowCount == 0) {
        res.send(500);
      } else {
        var featureCollection = new FeatureCollection();
        for (var i = 0; i < result.rowCount; i++) {
          totalTrees = totalTrees + parseInt(result.rows[i].total);
          var feature = new Feature();
          //feature.properties = ({"city_name":result.rows[i].city_name, "cntry_name":result.rows[i].cntry_name, "pop":result.rows[i].pop});
          feature.properties = ({
            "count": parseInt(result.rows[i].total),
            "neighborhood": result.rows[i].neighborhoodname,
            "YRunkown": parseInt(result.rows[i].unkownyr),
            "YR2008": parseInt(result.rows[i].yr2008),
            "YR2009": parseInt(result.rows[i].yr2009),
            "YR2010": parseInt(result.rows[i].yr2010),
            "YR2011": parseInt(result.rows[i].yr2011),
            "YR2012": parseInt(result.rows[i].yr2012),
            "YR2013": parseInt(result.rows[i].yr2013)
          })
          feature.geometry = JSON.parse(result.rows[i].geography);
          featureCollection.features.push(feature);
        }
        featureCollection.total = totalTrees;
        res.type('text/javascript');
        res.jsonp(featureCollection);
        done();
      }
    });
  })

}
