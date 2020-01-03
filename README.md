# Fulltext portal search with Elasticsearch
Example project for portal fulltext search solution based on Apache Nutch crawler and Elasticsearch indexer



## Sources
- `docker-compose.yml` - docker compose for elasticsearch, kibana and nutch
- `/nutch` - contains configuration files for Apache Nutch crawler and simple node.js-based server which acts as API for nutch crawler.
  - see /nutch/server/crawler-api.yaml swagger file for API documentation


## How to run
- start elasticsearch, kibana and nutch using `docker-compose up`
- Check whether kibana and elasticsearch is up & running - navigate to `localhost:5601` in your browser
- Start crawl process asynchronously by REST call:
```json
POST http://localhost:9080/crawl/start
{
	"depth": "3",
	"url": "http://wikipedia.org",
	"index": "test"
}
```
- In terminal in which you run `docker-compose` you should see nutch logs - the proof that the crawl is running
- After few moments, you will see new index in Kibana, called `fulltext-search`
