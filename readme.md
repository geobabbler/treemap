###Getting Started

for current example/to see progress, go to http://192.81.216.203/

to deploy:

1. clone this repo down. make sure you have npm install and nodejs on your system (currently verified with node 5.4.0)
2. From the project root - `cd server` then `sudo npm install`
3. From the project root - `cd client`, `sudo npm install -g bower`, then `bower install`
4. go back to the root project level and run `node server/server.js`. This has babel on-the-fly convert the backend files, which some files contain es2015, to es5.

This app is running on a digital ocean 512mb droplet. The node backend is the API and hosts the static front end angular app

#####NGINX Proxy (3000 to 80)
```
follow these instructions until 'install apache': https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy-for-apache

here is my configuration file:

server {
        listen   80;

        server_name treemap.hogan.io;

        location / {

        proxy_set_header X-Real-IP  $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:3000;

         }

}

```

#### API Endpoints/params/query items
__coming soon__


####database stuff
first:
ALTER TABLE tree_plantingswgs84
ADD COLUMN neighborhoodName character varying(50)

then:
UPDATE tree_plantingswgs84
SET neighborhoodName = neighborhoodwgs84.label
FROM neighborhoodwgs84
WHERE ST_Intersects(neighborhoodwgs84.geom,tree_plantingswgs84.geom);

SELECT name
  FROM jacksonco_schools, medford_citylimits
  WHERE ST_Within(jacksonco_schools.the_geom, medford_citylimits.the_geom);
