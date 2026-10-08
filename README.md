# Docker tutorial: profile app

A small static profile page served by Node.js (Express), with MongoDB and mongo-express running in Docker.



## Prerequisites

- [Node.js] (https://nodejs.org) (LTS version)
- [Docker] (https://www.docker.com)



## Install dependencies

"node_modules" is not included in the repository (it is listed in ".gitignore").
Create it by running, in the project folder:

```bash
npm install
```



## Docker commands


### Create docker network

```bash
docker network create mongo-network
```

If it already exists, Docker shows an error that can be ignored.


### Start mongodb

```bash
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=password \
--net mongo-network \
--name mongodb \
mongo
```


### Start mongo-express

```bash
docker run -d \
-p 8081:8081 \
-e ME_CONFIG_MONGODB_URL="mongodb://admin:password@mongodb:27017/" \
--net mongo-network \
--name mongo-express \
mongo-express
```



## Credentials

|                                What                                | Username |  Password  |
|--------------------------------------------------------------------|----------|------------|
| MongoDB (root user, set with the environment variables above)      | `admin`  | `password` |
| mongo-express web login (browser pop-up at http://localhost:8081)  | `admin`  |   `pass`   |

These are example values for local use only.



## Start the app

```bash
node server.cjs
```

Then open http://localhost:3000.



## Stop and clean up

```bash
docker rm -f mongo-express mongodb
```

