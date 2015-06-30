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

exports.showTrees = function(req, res, next) {
    var encodedBBOX = req.params.bbox,
        zlev = req.params.zlev;
    console.log(encodedBBOX);
    var bbox = JSON.parse(decodeURIComponent(encodedBBOX));
    var filter = req.params.filterID;


    //if the bounding box has three values come in on param...
    if(bbox){
        pg.connect(connstring, function(err, client, done) {
            var handleError = function(err) {
                if(!err) return false;
                done(client);
                next(err);
                return true;

            };
            var swX = bbox._southWest.lng,
                swY = bbox._southWest.lat,
                neX = bbox._northEast.lng,
                neY = bbox._northEast.lat;
            // if((zlev > 15) || (zlev == undefined)){
                if(!filter){
                    var myQuery = 'SELECT common_nam, genus, species, ST_AsGeoJSON(geom) AS geography ' +
                        'FROM tree_plantingswgs84 ' +
                        'WHERE ST_Intersects(geom, ST_GeometryFromText (\'POLYGON((' + swX + ' ' + swY + ',' + neX + ' ' + swY + ',' + neX + ' ' + neY + ',' + swX + ' ' + neY + ',' + swX + ' ' + swY + '))\', 4326 ));'
                };
                //with neighborhood filter
                if(filter){
                    console.log(filter);
                    var myQuery = 'SELECT common_nam, genus, species, ST_AsGeoJSON(geom) AS geography ' +
                        'FROM tree_plantingswgs84 ' +
                        'WHERE ST_Within(geom, (SELECT geom FROM neighborhoodwgs84 WHERE id = ' + filter + '));'
                }

            client.query(myQuery, function(err, result) {
                if(result.rowCount == 0) {
                  res.send(500);
                }
                else {
                  var featureCollection = new FeatureCollection();
                  for(var i=0; i<result.rowCount; i++){
                    var feature = new Feature();
                    //feature.properties = ({"city_name":result.rows[i].city_name, "cntry_name":result.rows[i].cntry_name, "pop":result.rows[i].pop});
                    feature.properties = ({
                        "common_name":result.rows[i].common_nam,
                        "genus":result.rows[i].genus,
                        "species":result.rows[i].species
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

    }
    else{
        //send failuer
    }
}
