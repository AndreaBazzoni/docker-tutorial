# Docker tutorial: profile app

A small static profile page served by Node.js (Express), with MongoDB and mongo-express running in Docker.



## Prerequisites

- [Node.js](https://nodejs.org) (LTS version)
- [Docker](https://www.docker.com)



## Install dependencies

"node_modules" is not included in the repository (it is listed in ".gitignore").
Create it by running, in the project folder:

```bash
npm install
npm install mongodb
```



## Docker commands


### Create docker network

```bash
docker network create mongo-network
```

If it already exists, Docker shows an error that can be ignored.


### Create and start mongodb

```bash
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=password \
-v mongo-data:/data/db \
-v mongo-config:/data/configdb \
--net mongo-network \
--name mongodb \
mongo
```

MongoDB is the DataBase where we store the Data. It persists even if we delete the container.


### Create and start mongo-express

```bash
docker run -d \
-p 8081:8081 \
-e ME_CONFIG_MONGODB_URL="mongodb://admin:password@mongodb:27017/" \
--net mongo-network \
--name mongo-express \
mongo-express
```

Mongo Express is the web interface for viewing and editing Data in MongoDB. It is not required for the app and MongoDB to work.


### Start mongodb e mongo-express

```bash
docker start mongodb mongo-express
```


### Stop mongo-express

```bash
docker stop mongodb mongo-express
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



## Stop and clean up (Containers AND Volumes)

```bash
docker rm -fv mongo-express mongodb
```


## Thanks to

Thanks to [TechWorld with Nana](https://www.youtube.com/@techworldwithnana) for the Docker tutorial this project is based on.
Check out her channel and her [website](https://www.techworld-with-nana.com/) for more DevOps and cloud content.
The reference video is ["Docker tutorial for Beginners"](https://www.youtube.com/watch?v=3c-iBn73dDE&list=WL&index=1).