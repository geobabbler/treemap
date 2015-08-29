###Getting Started

for current example/to see progress, go to http://treemap.hogan.io/

to deploy:

1. clone this repo down. make sure you have npm install and nodejs on your system
2. In the project root - `sudo npm install`
3. go in to the client repo `cd server`, and `sudo npm install -g bower` then `bower install`
4. go back to the root project leve `cd ..` and run the index.js file `node server/server.js`. This has babel on-the-fly convert the backend files, which some files contain es2015, to es5.

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
