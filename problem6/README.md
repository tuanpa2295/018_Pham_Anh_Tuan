## Project Overview
This is a simple SRS for a scoreboard.

---

### 1. Assumptions & identifications of functional requirements
* The primary use cases of the system is to update the score and display the leaderboard
* The clients distributed across the globe
* The amount of Daily Active Users (DAU) for writes is 50 million
* Anticipated read: write ratio is 5: 1
* The leaderboard be available in real-time

### 2. Requirements
#### 2.1 Functional Requirements
* The client can view the top 10 users on the leaderboard in real-time
* The client can view a specific user’s rank and score
* The client can view the surrounding ranked users to a particular user (relative leaderboard)
* The client can receive score updates through push notifications
* The leaderboard can be configured for global, regional, and friend circles
* The client can view the historical game scores and historical leaderboards
* The leaderboards can rank users based on gameplay on a daily, weekly, or monthly basis
* The clients can update the leaderboard in a fully distributed manner across the globe
* The leaderboard should support thousands of concurrent users

#### 2.2 Non-Functional Requirements
* High availability
* Low latency
* Scalability
* Reliability
* Minimal operational overhead

### Leaderboard database assessments & design
The **major** entities of the **in-memory database (Redis)** are **Leaderboards** and **Users**. We use **sorted sets** data type in Redis to store the Leaderboards and the **hash** data type in Redis to store the metadata of the Users. The key of the sorted set is the leaderboard ID. The ID of the user is the key of the hash.

![alt text for screen readers](/99tech-code-challenge/src/problem6/initial_db.png "Leaderboard & User DB design")

#### Game table
| game_id      | name |  created_at |  description |
| ----------- | ----------- | ------------- | -------------|
| 1    | counter-strike-1       | 10-2-2023       | a game       |
| 2	   | counter-strike-1        | 10-2-2023       | a game       |

#### User table
| user_id      | name |  created_at |  email | last_login    |  location |  game_id |
| ----------- | ----------- | ------------- | -----------| ----------- | ------------- | -------------|
| 1    | name-1       | 10-2-2023       | a@game.com    | 10-2-2023   | counter-strike-1 | 1       |
| 2	   | name-2       | 10-2-2023       | a1@game.com   | 10-2-2023   | counter-strike-1 | 1       |
#### Leaderboard table
| leaderboard_id      | score |  created_at |  game_id | user_id    |
| ----------- | ----------- | ------------- | -----------| ----------- |
| 1    | 150       | 10-2-2023       | 1    | 1   |
| 2	   | 125       | 10-2-2023       | 2   | 1  |



### SQL Queries
```sql
# Insert a new user
INSERT INTO leaderboards (leaderboard_id, score, created_at, game_id, user_id)
VALUES ("apex_legends", 1, "2050-08-22", "1", "42");

# Update the score of a user
UPDATE leaderboards
SET score = score + 1
WHERE user_id = '42';

# Fetch the total score of a user for the current month
SELECT sum(score)
FROM leaderboards
WHERE user_id = '42' and created_at >= "2025-03-10";
# Calculate the scores and rank the top 10 players
SELECT user_id, SUM(score) AS total
FROM leaderboards
GROUP BY user_id
ORDER BY total DESC
LIMIT 10;

# calculate the rank of a specific player
SELECT _,
(
SELECT COUNT(_)
FROM leaderboards AS l2
WHERE l2.score >= l1.score
)
AS RANK
FROM leaderboards AS l1
WHERE l1.user_id = '42';
```

### Type of data store
The relational database or NoSQL data store can meet the requirements. The relational database is an optimal choice when the dataset is small. The relational database can be a suboptimal solution for the real-time leaderboard because of the scalability limitations for a million players due to the following reasons
* computing the rank of a user requires the recomputation of the ranking of every player through a full table scan
* caching the read queries on the relational database for performance might result in stale leaderboard data
* query time can be slow when the count of players is in millions
* different tables should be joined based on the player ID to display the leaderboard on a normalized data schema
* a relational database that is not in memory will provide suboptimal performance for real-time updates on a large-scale list of records sorted by score due to disk seeks

 The relational database can take on an average of 10 seconds to execute the query to compute the rank of a user on a table with 10 million records even with database indexes. The creation of database indexes on user_id and created_at columns will improve the read operations but slow down the write operations. Besides, the result cannot be easily cached as the scores are constantly changing.

 An in-memory database such as Redis can be used to build a scalable and performant real-time leaderboard because:
 * The sorted set data type in Redis offers in-memory and responsive access to the requirements of the leaderboard in logarithmic time complexity, O(log(n)), where n is the number of elements in the sorted set 8.
 * The sorted set data type in Redis contains a set of items (players) with associated scores, which are used to rank the items in ascending order.
 * The sorted set data type in Redis automatically sorts the item based on the score during the upsert operations. The queries are significantly faster due to the presorting of items.
 * On the contrary, the relational database sorts the items during the query time resulting in latency and adding further computational burden to the database.
 * In summary, the Redis sorted sets can offer significant performance gains and also be a cost-efficient solution.

Therefore, we have decided to use Redis for the following reasons:
 * frees up database resources to handle other types of requests
 * supports a data structure optimized to handle leaderboard use cases

### Capacity Planning
#### Assumptions:
 The user-id can be a 30-character string consuming approximately 30 bytes. The score of a player can be a 16-bit integer consuming 2 bytes of storage.
#### Traffic
| Description      | Estimated  Value |
| ----------- | ----------- |
| DAU (write)      | 50 million       |
| QPS (write)		   | 600        |
| read: write   | 5: 1        |
| QPS (read)	   | 3000       |
| peak QPS (read)	   | 3000        |

#### Memory
| Description      | Calculation | Estimated Total |
| ----------- | ----------- | ----------- |
| total player count      |        | 70 million |
| single record of a user		   | (30 + 2) bytes        | 32 bytes |
| total storage for all users   | 70 million * 32 bytes        | 2.2 GB |

#### Storage
| Description      | Calculation | Estimated Total |
| ----------- | ----------- | ----------- |
| single record of a user      |        | 32 bytes |
| storage for a day		   | 50 million players/day * 32 bytes/player        | 1600 MB |
| storage for 5 years   | 1600 MB * 5 * 365        | 2.920 TB |

#### Bandwidth
| Description      | Calculation | Estimated Total |
| ----------- | ----------- | ----------- |
| Ingress      |  32 bytes/player * 50 million players/day * 10^(-5) day/sec	      | 16 KB/sec |
| Egress		   | 64 bytes/player * 250 million players/day * 10^(-5) day/sec        | 160 KB/sec |

#### Capacity Planning Summary
| Description      | Estimated  Value |
| ----------- | ----------- |
| QPS (write)		   | 600        |
| QPS (read)	   | 3000       |
| Storage	   | 2.920 TB        |
| Ingress	   | 16 KB/sec        |
| Egress	   | 160 KB/sec        |
| Memory	   | 2.2 GB        |

### Leaderboard high-level design
A small-scale leaderboard can leverage the cache-aside pattern on the caching layer for the relational database. The following operations are performed when a player updates the score:
![alt text for screen readers](/99tech-code-challenge/src/problem6/1%20Score%20update%20workflow.png "Leaderboard Score Update")
1. The client creates a WebSocket connection to the load balancer for real-time communication
2. The load balancer delegates the client’s request to the closest data center
3. The server updates the user’s score record on the relational database following the cache-aside pattern
4. The server updates the same user’s score record on the cache server following the cache-aside pattern


The following operations are performed when a player wants to view the leaderboard9:
![alt text for screen readers](/99tech-code-challenge/src/problem6/2%20Display%20leaderboard%20workflow.png "Leaderboard Score Fetch")
1. The client creates a WebSocket connection to the load balancer for real-time communication
2. The load balancer delegates the client’s request to the closest data center
3. The server queries the cache server to display the leaderboard
4. The server queries the relational database on a cache miss and populates the cache server with fetched data

The leaderboard data is served directly from the cache server on a cache hit. The caching layer allows handling high spiky traffic with a low hardware footprint. The personalized leaderboards can make use of dedicated cache servers. The services can communicate with each other through RPC or REST. The server-sent events (SSE) or WebSockets can be used for real-time updates on the leaderboard.

The sorted set is a unique collection of items (users) sorted based on the associated score. The hash data type on the cache server can be used to store the player metadata.
The Least Recently Used (LRU) policy can be used for cache eviction.
The time-to-live (TTL) based caching doesn’t meet the requirements of the leaderboard because the score changes are not time based but based on the game activity. The leaderboard will not be real-time with a TTL-based caching layer.
The leaderboard can be configured with a low TTL cache for high accuracy but the request will be blocked until fresh data is fetched from the database. The high TTL cache doesn’t block the request but will return stale data.

In addition, the database will be hit with frequent access (thundering herd problem) due to the TTL-based caching layer when multiple cache servers expire simultaneously. The thundering herd problem can be resolved by adding a jitter on cache expiration. However, the addition of a jitter will result in stale leaderboard data for some clients. The cache push model can be used in a real-time leaderboard without the database becoming a bottleneck. The database changes are pushed directly to the cache servers using a database trigger.

The technical challenges for a scalable real-time leaderboard are the following:
1. providing high availability on a real-time leaderboard
2. enable players to receive notifications on leaderboard changes
3. allow updates on the leaderboard in a fully distributed manner and support a global view of the leaderboard
4. support massive scale across millions of players
5. support computations on a large number of data attributes

#### NoSQL database for leaderboard
The NoSQL datastore such as Amazon DynamoDB can be used to build the leaderboard. The benefits of using DynamoDB are the following:
1. fully managed service
2. serverless (no server to provision or manage)
3. supports ACID transactions
4. performance at scale through partitioning
5. supports data change capture through the DynamoDB stream

The DynamoDB internally uses consistent hashing to partition the database for scalability. The database can be partitioned using the player-id as the partition key for uniform data distribution.

ChallengesThe limitations of using DynamoDB:
1. scatter-gather pattern increases complexity
2. sorting the score can be relatively expensive
3. not write optimized due to B-Trees managing data

### Update the score of a user on the leaderboard?
Web services can be substituted with serverless functions for minimal operational overhead. The cache server and relational database should be configured for active-active geo-replication to enable each data center to accept writes. A global load balancer can be provisioned to distribute the client requests. The stateless web server can be replicated across data centers for scalability. The following operations are performed when a player updates the score:

![alt text for screen readers](/99tech-code-challenge/src/problem6/3%20update%20the%20score%20of%20a%20player%20on%20the%20leaderboard.png "Leaderboard Update Score of player")
1. The client creates a WebSocket connection to the load balancer for real-time communication
2. The load balancer delegates the client’s request to the closest data center
3. The server updates the score on the sorted set data type in Redis
4. The serverless function updates the records on the relational database using the write-behind cache pattern


The serverless functions are relatively more expensive than a virtual machine but fewer serverless function execution is required to meet the scalability requirement of the leaderboard. In layman’s terms, serverless functions enable 100 percent utilization of computing resources and keep the costs lower while running the leaderboard at a high scale.

The popular data such as the leaderboard for the top 10 players are stored on a cross-region cache server for low latency. The leaderboard data is also persisted in the relational database for durability. The relational database supports complex analytics queries against the database follower replicas. The popular complex queries on the relational database can be cached for performance

### Retrieve the leaderboard data

The following operations are performed when a player wants to view the leaderboard:
![alt text for screen readers](/99tech-code-challenge/src/problem6/4%20retrieve%20the%20leaderboard%20data.png "Leaderboard Get Score of player")
1. The client creates a WebSocket connection to the load balancer for real-time communication
2. The load balancer delegates the client’s request to the closest data center
3. The serverless function invokes the sorted set data type in Redis
4. The serverless function queries the relational database on a cache miss using the read-through cache pattern

An additional cache layer can be introduced in front of the database to prevent thundering herd problems13. The WebSocket connection is used to stream the changes on the leaderboard in real-time. The client can watch for specific leaderboards using a JavaScript rules engine on the client. A high-end web server can be provisioned to manage 100 thousand concurrent socket connections. The personalized leaderboard can store only the IDs to generate a personalization cache for saving memory.

### Leaderboard API Design
#### Request headers
| Header      | Description |
| ----------- | ----------- |
| authorization      | authorize your user account       |
| content-encoding	   | compression type used by the data payload        |
| method   | HTTP Verb        |
| content-type	   | type of data format       |
| user-agent	   | use to identify the client for analytics        |
#### Response headers
| Header      | Description |
| ----------- | ----------- |
| status code	      | shows the request was successful/error       |
| cache-control		   | set cache       |
| content-encoding	   | compression type used by the payload        |
| content-type	   | type of data format        |

#### User score update
This API design is to update a user score by his id
```bash
/users/:user-id/scores
method: POST
authorization: Bearer <JWT>
content-length: 100
content-type: application/JSON
content-encoding: gzip
{
    user_id: <int>,
    score: <int>,
    location: Geohash
}
```
##### Status code
```bash
# on success
status code: 200 ok
# on asynchronous processing of score updates
status code: 202 accepted
# on an invalid request payload by the client
status code: 400 bad request
# the client has valid credentials but not sufficient privileges to act on the resource
status code: 403 forbidden
```

#### View user scores
This API design is to get a user's score and rank
```bash
/users/:user-id
method: GET
authorization: Bearer <JWT>
user-agent: Chrome
accept: application/json, text/html
```
##### Status code
Sample response
```bash
status code: 200 OK
cache-control: private, no-cache, must-revalidate, max-age=5
content-encoding: gzip
content-type: application/json

{
    user_id: "45231",
    user_name: "Rick",
    score: 1562,
    rank: 1,
    updated_at: "2030-10-10T12:11:42Z"
}
```

#### View top N users' scores in the leaderboard
This API design is to view scores and ranks of top N number of users in the leaderboard
```bash
/leaderboard/top/:count
method: GET
authorization: Bearer <JWT>
user-agent: Chrome
accept: application/json, text/html
```
##### Status code
Sample response
```bash
status code: 200 OK
cache-control: public, no-cache, must-revalidate, max-age=5
content-encoding: gzip
content-type: application/json

{
  total: 10, (count)
  updated_at: "2030-10-10T12:11:42Z",
  data: [
    {
      user_id: "45231",
      user_name: "Rick",
      score: 1562,
      rank: 1,
    },
    {...}
  ]
}

```

#### View surrounding ranked users in the leaderboard
This API design is to view scores and ranks of N number of users surrounding a user in the leaderboard
```bash
/leaderboard/:user-id/:count
method: GET
authorization: Bearer <JWT>
user-agent: Chrome
accept: application/json, text/html
```
##### Status code
Sample response
```bash
status code: 200 OK
cache-control: private, no-cache, must-revalidate, max-age=5
content-encoding: gzip
content-type: application/json

{
  total: 6, (count)
  updated_at: "2030-10-10T12:11:42Z",
  data: [
    {
      user_id: "45231",
      user_name: "Morty",
      score: 1562,
      rank: 2,
    },
    {...}
  ]
}
```
### Security
1. Redesign db for permission
![alt text for screen readers](/99tech-code-challenge/src/problem6/db_permission.png "Updated DB Design for permission")

2. Redesign db for hashing password & email verification status
![alt text for screen readers](/99tech-code-challenge/src/problem6/db_design_updated_for_security.png "Updated DB Design hashing password, email status")

3. encrypt the communication to prevent packet sniffing
4. telemetry can be used on the server to detect anomalies in the score
5. shadow ban the malicious player
6. use JWT token for authorization
7. rate limit the requests
8. use the principle of least privilege

### Improvements
1. Shard the leaderboard cache server
2. Redis cluster partitioning
