'use strict';

const PORT = 9080,
	HOST = '0.0.0.0',
	NUTCH_LOC = '/root/nutch',
	JAVA_HOME = '/usr/lib/jvm/java-8-openjdk-amd64';

const spawn = require('child_process').spawn,
	spawnSync = require('child_process').spawnSync,
    exec = require('child_process').exec,
	bodyParser = require('body-parser'),
    app = require('express')(),
    server = require('http').Server(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/crawl/start', (req, res) => {
	if(!req.body.depth || !req.body.url || !req.body.index){
		res.status(405);
		return;
	}

	exec(`rm -rf ${NUTCH_LOC}/localcrawl || true && echo "${req.body.url}" > ${NUTCH_LOC}/seed.txt`,  function(e, stdout, stderr) {
		if(e) {
			res.json({"result":e});
			res.status(500);
			return;
		}
		console.log(stdout);
		console.log(stderr);

		const crawlProcess = spawn(`${NUTCH_LOC}/bin/crawl`, ['-i', '-D', `elastic.rest.index=${req.body.index}`, '-s', `${NUTCH_LOC}/seed.txt`, 'localcrawl', req.body.depth], {
			env: {
				'JAVA_HOME': `${JAVA_HOME}`
			}
		});
		crawlProcess.stdout.setEncoding('utf8');
		crawlProcess.stderr.setEncoding('utf8');
		crawlProcess.on('error', (error) => {
			console.log(`Crawl process terminated with error ${error}`);
		});
		crawlProcess.on('close', (code) => {
			console.log(`Crawl process terminated with code ${code}`);
		});
		crawlProcess.stdout.on('data', (chunk) => {
			console.log(chunk);
		});
		crawlProcess.stderr.on('data', (chunk) => {
			console.log(chunk);
		});

		res.json({"result":"started"});
		res.status(200);
	});
});

app.post('/crawl/start-sync', (req, res) => {
	if(!req.body.depth || !req.body.url || !req.body.index){
		res.status(405);
		return;
	}
	exec(`rm -rf ${NUTCH_LOC}/localcrawl || true && echo "${req.body.url}" > ${NUTCH_LOC}/seed.txt`,  function(e, stdout, stderr) {
		if(e) {
			res.json({"result":e});
			res.status(500);
			return;
		}
		console.log(stdout);
		console.log(stderr);

		const crawlProcess = spawnSync(`${NUTCH_LOC}/bin/crawl`, ['-i', '-D', `elastic.rest.index=${req.body.index}`, '-s', `${NUTCH_LOC}/seed.txt`, 'localcrawl', req.body.depth], {
			env: {
				'JAVA_HOME': `${JAVA_HOME}`
			}
		});
		if (crawlProcess.error) {
			res.json({"result":crawlProcess.error});
			res.status(500);
			return;
		}
		res.json({"result":"crawl complete"});
		res.status(200);
	});

});

app.post("/crawl/stop", (req, res) => {
	exec('killall java', function(e, stdout, stderr) {
		commandCallback(res, stdout, e, stderr);
	});
});

app.get('/crawl/ps', (req, res) => {
	exec('ps -A', function(e, stdout, stderr) {
		commandCallback(res, stdout, e, stderr);
	});
});

function commandCallback(res, stdout, e, stderr) {
	if (e !== null) {
		res.json({"result": stderr});
		res.status(500);
		return;
	}
	res.json({"result": stdout});
	res.status(200);
}

server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
