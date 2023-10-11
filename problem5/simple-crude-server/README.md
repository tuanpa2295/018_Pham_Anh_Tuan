## Project Overview
This is a simple CRUD Project, there are 2 tables User and Post.

---

### Setup the Environment

* Create a virtualenv with Python 3.7 and activate it. Refer to this link for help on specifying the Python version in the virtualenv.
```bash
# At the problem5 folder, run docker-compose up to bootstrap PostgresDB for data persistence
docker-compose up
# You should see 2 docker containers running by
docker ps
# or
docker container ls

# At the simple-crude-server, the below command to install dependencies
yarn
# Then the below command for migrations
yarn prisma migrate dev
# Then the below command to start the server
yarn start
```

