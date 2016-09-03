'use strict';

/*
data used:
homicides CSV:  https://data.baltimorecity.gov/Public-Safety/Homicides/9h5s-7d88
*/

var pg = require('pg');

var env = require('../../config/env.js'),
  environment = new env(),
  connstring = environment.connstring;
var cfg = {
   user: environment.user,
   database: environment.database,
   password: environment.password,
   port: environment.pgport,
   host: environment.host,
   hostname: environment.hostname,
};
console.log(cfg);
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
exports.getAddress = function(req, res, next) {
  var request = require('request');
  var addy = req.query.address;
  var url = `https://gis.baltimorecity.gov/egis/rest/services/locator/New_ADDRDB_ALIAS_WGS84_Combo/GeocodeServer/findAddressCandidates?Street=${addy}&SingleLine=&category=&outFields=&maxLocations=&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=pjson`;
  request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    res.type('text/javascript');
    res.jsonp(body);
    //done();
  }
  });
}

exports.showTrees = function(req, res, next) {
  console.log('hi');
  var neX = req.query.neLat,
    neY = req.query.neLng,
    swX = req.query.swLat,
    swY = req.query.swLng,
    filter = req.query.filter,
    baseyear = req.query.baseyear;

if(baseyear){
    console.log("Base year: " + baseyear);
}

console.log("here");

  //if the bounding box has three values come in on param...
  if (neX && neY && swX && swY) {
    pg.connect(cfg, function(err, client, done) {
      console.log(connstring);
      console.log(err);
      var handleError = function(err) {
        if (!err) return false;
        done(client);
        next(err);
        return true;
      };

      // if(!filter){
      var myQuery = `SELECT common_nam, genus, species, year, planted_by, neighborhoodname, ST_AsGeoJSON(geom) AS geography, count(year) AS total ` +
                    `FROM tree_plantingswgs84 ` +
                    `WHERE ST_Intersects(geom, ST_GeometryFromText ('POLYGON((${swY} ${swX},${neY} ${swX},${neY} ${neX},${swY} ${neX},${swY} ${swX}))', 4326 ))`

      if (filter) {
        myQuery += ` and year::int != all (array[${filter}])`
      }
      myQuery += ` GROUP BY common_nam, genus, species, year, geom, planted_by, neighborhoodname;`
console.log(myQuery);
      client.query(myQuery, function(err, result) {
//console.log(err);
        if (result.rowCount == 0) {
          res.send(500);
        } else {
          var featureCollection = new FeatureCollection();
          for (var i = 0; i < result.rowCount; i++) {
            var feature = new Feature();
            feature.properties = ({
              "common_name": result.rows[i].common_nam,
              "genus": result.rows[i].genus === null ? "unknown" : result.rows[i].genus,
              "species": result.rows[i].species === null ? "unknown" : result.rows[i].species,
              "year": parseInt(result.rows[i].year),
              "planted_by": result.rows[i].planted_by === null ? "unknown" : result.rows[i].planted_by,
              "neighborhoodname": result.rows[i].neighborhoodname === null ? "unknown" : result.rows[i].neighborhoodname,
              "total": result.rows[i].total
            })
            //console.log(JSON.stringify(feature));
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
    filter = req.query.filter,
    baseyear = parseInt(req.query.baseyear);
  //if the bounding box has three values come in on param...
  pg.connect(cfg, function(err, client, done) {
    var handleError = function(err) {
      if (!err) return false;
      done(client);
      next(err);
      return true;
    };

    var year0 = baseyear; //new Date().getFullYear();
    var year1 = year0 - 1;
    var year2 = year1 - 1;
    var year3 = year2 - 1;
    var year4 = year3 - 1;

          var myQuery = `
            SELECT ST_AsGeoJSON(ST_Centroid(ST_Collect(geom))) AS geography,
            	neighborhoodname,
            	count(year) AS total,
            	sum(case when year::int = 0 then 1 else 0 end) AS unkownyr,
            	sum(case when year::int < 2008 then 1 else 0 end) AS yr2008,
            	sum(case when year::int < ${year3} then 1 else 0 end) AS yr2009,
            	sum(case when year::int = ${year3} then 1 else 0 end) AS yr2010,
            	sum(case when year::int = ${year2} then 1 else 0 end) AS yr2011,
            	sum(case when year::int = ${year1} then 1 else 0 end) AS yr2012,
            	sum(case when year::int = ${year0} then 1 else 0 end) AS yr2013
            FROM tree_plantingswgs84
            WHERE ST_Intersects(geom, ST_GeometryFromText ('POLYGON((${swY} ${swX},${neY} ${swX},${neY} ${neX},${swY} ${neX},${swY} ${swX}))', 4326 ))
          `;
console.log(myQuery);
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
