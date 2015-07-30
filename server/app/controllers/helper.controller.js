// 'use strict';
//
// var env = require('../../config/env.js'),
//     environment = new env(),
//     connstring = environment.connstring;
//
// var pg = require('pg');
//
// exports.treeStats = function(req, res, next) {
//     var neX = req.query.neLat,
//         neY = req.query.neLng,
//         swX = req.query.swLat,
//         swY = req.query.swLng;
//     // var bbox = JSON.parse(decodeURIComponent(encodedBBOX));
//
//
//     //if the bounding box has three values come in on param...
//     if(neX && neY && swX && swY){
//         pg.connect(connstring, function(err, client, done) {
//             var handleError = function(err) {
//                 if(!err) return false;
//                 done(client);
//                 next(err);
//                 return true;
//             };
//
//                 // if(!filter){
//                 var myQuery = 'SELECT year, count(gid) as total ' +
//                     'FROM tree_plantingswgs84 ' +
//                     'WHERE ST_Intersects(geom, ST_GeometryFromText (\'POLYGON((' + swY + ' ' + swX + ',' + neY + ' ' + swX + ',' + neY + ' ' + neX + ',' + swY + ' ' + neX + ',' + swY + ' ' + swX + '))\', 4326 )) ' +
//                     'GROUP BY year;'
//
//             client.query(myQuery, function(err, result) {
//                 if(result.rowCount == 0) {
//                   res.send(500);
//                 }
//                 else {
//                   var treeStatObjects = new Object;
//
//                   for(var i=0; i<result.rowCount; i++){
//                     var feature = new Feature();
//                     //feature.properties = ({"city_name":result.rows[i].city_name, "cntry_name":result.rows[i].cntry_name, "pop":result.rows[i].pop});
//                     feature.properties = ({
//                         "common_name":result.rows[i].common_nam,
//                         "genus":result.rows[i].genus,
//                         "species":result.rows[i].species,
//                         "year": parseInt(result.rows[i].year)
//                     })
//                     feature.geometry = JSON.parse(result.rows[i].geography);
//                     featureCollection.features.push(feature);
//                   }
//                   res.type('text/javascript');
//                   res.jsonp(featureCollection);
//                   done();
//                 }
//             });
//         })
//
//     }
//     else{
//         //send failuer
//     }
// }
