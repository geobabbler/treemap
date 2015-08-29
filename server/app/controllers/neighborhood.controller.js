'use strict';

var pg = require('pg');

var env = require('../../config/env.js'),
    environment = new env(),
    connstring = environment.connstring;

/*
this makes geojson output possible
*/
function FeatureCollection(){
    this.type = 'FeatureCollection';
    this.features = new Array();
}

function Feature(){
    this.type = 'Feature';
    this.geometry = new Object;
    this.properties = new Object;
}

/*
object for tables
*/

exports.neighborhoodByBounds = function(req, res, next) {
  var neX = req.query.neLat,
      neY = req.query.neLng,
      swX = req.query.swLat,
      swY = req.query.swLng,
      zoomLev = req.query.zoomLev;

    pg.connect(connstring, function(err, client, done) {
        var handleError = function(err) {
            if(!err) return false;
            done(client);
            next(err);
            return true;

        };

        var tolerance = '.001';
        if(zoomLev > 12){
          tolerance = '.00005';
        }

        var myQuery = `SELECT label, id, ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, ${tolerance})) AS geom `+
                      `FROM neighborhoodwgs84 ` +
                      `WHERE ST_Intersects(geom, ST_GeometryFromText ('POLYGON((${swY} ${swX},${neY} ${swX},${neY} ${neX},${swY} ${neX},${swY} ${swX}))', 4326 ));`

        client.query(myQuery, function(err, result) {
            if(result.rowCount == 0) {
              res.send(500);
            }
            else {
              var featureCollection = new FeatureCollection();
              for(var i=0; i<result.rowCount; i++){
                var feature = new Feature();
                feature.properties = ({
                    "label":result.rows[i].label,
                    "id":result.rows[i].id
                })
                feature.geometry = JSON.parse(result.rows[i].geom);
                featureCollection.features.push(feature);
              }
              res.type('text/javascript');
              res.jsonp(featureCollection);
              done();
            }
        });
    })

}

exports.neighborhoodNamesBBox = function(req, res, next) {
    var searchString = req.query.searchString;
    //if label is passed in
    if(searchString){
        pg.connect(connstring, function(err, client, done) {
            var handleError = function(err) {
                if(!err) return false;
                done(client);
                next(err);
                return true;
            };

            var myQuery = "SELECT label, ST_AsGeoJSON(ST_Envelope(geom)) AS geom FROM neighborhoodwgs84 WHERE LOWER(label) LIKE LOWER('%" + searchString + "%') LIMIT 6;"
            client.query(myQuery, function(err, result) {
                // console.log(result.rowCount)
                if(result.rowCount == 0) {
                  res.send(500);
                }
                else {
                  var featureCollection = new FeatureCollection();
                  var nbhdProps = new Array();
                  for(var i=0; i<result.rowCount; i++){
                    var feature = new Feature();
                    feature.properties = ({
                        "label":result.rows[i].label
                    })
                    feature.geometry = JSON.parse(result.rows[i].geom);
                    featureCollection.features.push(feature);
                  }
                  res.type('text/javascript');
                  res.jsonp(featureCollection);
                  done();
                }
            });
        })

    }
    else{
        //send failuer
    }
}
