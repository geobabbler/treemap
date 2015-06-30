'use strict';

var env = require('../../config/env.js'),
    environment = new env(),
    connstring = environment.connstring;
    
var pg = require('pg');

/**
 * A module that defines the response format.
 * @module app_schema_controller
 */
var fs = require('fs'),
	diskspace = require('diskspace');

exports.showAPIdocs = function(req, res) {
	var update = 'GISAPI Workshop API Docs</br>' + 
        		 '</br></br><b>Helpers</b></br>' +
        		 'GET /api</br>' +
        		 'GET /api/showStorageAvailable</br></br></br>' +
        		 '<b>Geo Services</b></br>' + 
        		 'GET /api/boundingBox </br>' + 
        		 'GET /api/overlap </br>' + 
        		 'GET /api/simplify </br>' + 
        		 'GET /api/buffer </br>' + 
        		 'GET /api/funFilter'
    res.send(update)
}

exports.showStorageAvailable = function(req, res) {
	diskspace.check('/', function (total, free, status){
		//convert to gigabytes
	    res.jsonp({
	    	total:(total/1000000000),
	    	free:(free/1000000000),
	    	status:status
	    })
	});
}

exports.homicideDateRange = function(req, res){
	pg.connect(connstring, function(err, client, done) {
		console.log(err)
            var handleError = function(err) {
            	console.log(err)
                if(!err) return false;
                done(client);
                next(err);
                return true;

            };

            var myQuery = "SELECT  min(crimedate) as start_date, max(crimedate) as end_date FROM homicides;"

            // console.log(myQuery)

            client.query(myQuery, function(err, result) {
                // console.log(result.rowCount)
                console.log(result)
                if(result.rowCount == 0) {
                  res.send(500);
                } 
                else {
                	res.type('text/javascript');
                  	res.jsonp({
                  		start_date: result.rows[0].start_date,
                  		end_date: result.rows[0].end_date
                  	});
                  
                  done();
                }
            });
        })
}