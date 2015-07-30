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
    var neX = req.query.neLat,
        neY = req.query.neLng,
        swX = req.query.swLat,
        swY = req.query.swLng;
    // var bbox = JSON.parse(decodeURIComponent(encodedBBOX));


    //if the bounding box has three values come in on param...
    if(neX && neY && swX && swY){
        pg.connect(connstring, function(err, client, done) {
            var handleError = function(err) {
                if(!err) return false;
                done(client);
                next(err);
                return true;
            };

                // if(!filter){
                var myQuery = 'SELECT common_nam, genus, species, year, ST_AsGeoJSON(geom) AS geography ' +
                    'FROM tree_plantingswgs84 ' +
                    'WHERE ST_Intersects(geom, ST_GeometryFromText (\'POLYGON((' + swY + ' ' + swX + ',' + neY + ' ' + swX + ',' + neY + ' ' + neX + ',' + swY + ' ' + neX + ',' + swY + ' ' + swX + '))\', 4326 ));'

                // var getStatus = 'SELECT count(gid) as total ' +
                //         'FROM tree_plantingswgs84 ' +
                //         'WHERE ST_Intersects(geom, ST_GeometryFromText (\'POLYGON((' + swY + ' ' + swX + ',' + neY + ' ' + swX + ',' + neY + ' ' + neX + ',' + swY + ' ' + neX + ',' + swY + ' ' + swX + '))\', 4326 )) ' +
                //         'GROUP BY year;'
                    // 'WHERE ST_Intersects(geom, ST_GeometryFromText (\'POLYGON((' + swX + ' ' + swY + ',' + neX + ' ' + swY + ',' + neX + ' ' + neY + ',' + swX + ' ' + neY + ',' + swX + ' ' + swY + '))\', 4326 ));'
                // };
                //with neighborhood filter
                // if(filter){
                //     console.log(filter);
                //     var myQuery = 'SELECT common_nam, genus, species, ST_AsGeoJSON(geom) AS geography ' +
                //         'FROM tree_plantingswgs84 ' +
                //         'WHERE ST_Within(geom, (SELECT geom FROM neighborhoodwgs84 WHERE id = ' + filter + '));'
                //     console.log(myQuery);
                // }
                // var featureCollection = new FeatureCollection();
              // client.query(getStatus, function(err, result){
              //   var sendOut = {}
              //   console.log('1',err)
              //   console.log('5',result)
              //   if(result.rowCount) {
              //     console.log('huh')
              //     res.send(500);
              //   }
              //   else {
              //     for (var a = 0; a < result.rowCount; a ++){
              //       if(result.rows[a]){
              //         sendOut[result.rows[a]] = sendOut[result.rows[a]] + total
              //       }
              //     }
              //   }
              //   console.log(sendOut.rows)
              //   // featureCollection.properties[sendOut];
              // })
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
                        "species":result.rows[i].species,
                        "year": parseInt(result.rows[i].year)
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

/*clustering experiments*/
exports.clusterByReducedPrecision = function(req, res, next) {
  var precision = req.params.precision;
  var neX = req.query.neLat,
      neY = req.query.neLng,
      swX = req.query.swLat,
      swY = req.query.swLng;
    //if the bounding box has three values come in on param...
        pg.connect(connstring, function(err, client, done) {
            var handleError = function(err) {
                if(!err) return false;
                done(client);
                next(err);
                return true;
            };

                // if(!filter){
              var  myQuery = 'SELECT count(gid) as total, \'{"type":"Point","coordinates":[\'||round(longitude, '+precision+')||\',\'||round(latitude, '+precision+')||\']}\' as geography ' +
                             'FROM tree_plantingswgs84 ' +
                             'WHERE ST_Intersects(geom, ST_GeometryFromText (\'POLYGON((' + swY + ' ' + swX + ',' + neY + ' ' + swX + ',' + neY + ' ' + neX + ',' + swY + ' ' + neX + ',' + swY + ' ' + swX + '))\', 4326 )) ' +
                             'GROUP BY round(latitude, '+precision+'), round(longitude, '+precision+');'

                //with neighborhood filter
                // if(filter){
                //     console.log(filter);
                //     var myQuery = 'SELECT common_nam, genus, species, ST_AsGeoJSON(geom) AS geography ' +
                //         'FROM tree_plantingswgs84 ' +
                //         'WHERE ST_Within(geom, (SELECT geom FROM neighborhoodwgs84 WHERE id = ' + filter + '));'
                //     console.log(myQuery);
                // }

            client.query(myQuery, function(err, result) {
              var totalTrees = 0;
                if(result.rowCount == 0) {
                  res.send(500);
                }
                else {
                  var featureCollection = new FeatureCollection();
                  for(var i=0; i<result.rowCount; i++){
                    totalTrees = totalTrees + parseInt(result.rows[i].total);
                    var feature = new Feature();
                    //feature.properties = ({"city_name":result.rows[i].city_name, "cntry_name":result.rows[i].cntry_name, "pop":result.rows[i].pop});
                    feature.properties = ({
                        "count":result.rows[i].total
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
