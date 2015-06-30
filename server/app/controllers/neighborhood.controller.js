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

exports.neighborhoodBounds = function(req, res, next) {
    pg.connect(connstring, function(err, client, done) {
        var handleError = function(err) {
            if(!err) return false;
            done(client);
            next(err);
            return true;

        };

        var myQuery = 'select label, id, ST_AsGeoJSON(ST_Envelope(geom)) AS geom from neighborhoodwgs84;';

        client.query(myQuery, function(err, result) {
            console.log(result)
            if(result.rowCount == 0) {
              res.send(500);
            }
            else {
                var nbhdResponse = new Array();
                for(var i=0; i<result.rowCount; i++){
                    var item = new Object;
                    item.label = result.rows[i].label;
                    item.id = result.rows[i].id;
                    item.bbox = JSON.parse(result.rows[i].geom);
                    nbhdResponse.push(item);
                }
                res.type('text/javascript');
                res.jsonp(nbhdResponse);
                done();
            }
        });
    })

}

exports.neighborhoodPolygons = function(req, res, next) {
    var label = req.query.label;
    //if label is passed in
    if(label){
        pg.connect(connstring, function(err, client, done) {
            var handleError = function(err) {
                if(!err) return false;
                done(client);
                next(err);
                return true;
            };

            var myQuery = "SELECT label, id, ST_AsGeoJSON(geom) AS geography FROM neighborhoodwgs84 WHERE LOWER(label) = LOWER('" + label + "');"
            client.query(myQuery, function(err, result) {
                // console.log(result.rowCount)
                if(result.rowCount == 0) {
                  res.send(500);
                }
                else {
                    console.log(result);
                  var featureCollection = new FeatureCollection();
                  var nbhdProps = new Array();
                  for(var i=0; i<result.rowCount; i++){
                    var item = new Object;
                    var feature = new Feature();
                    feature.geometry = JSON.parse(result.rows[i].geography);
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