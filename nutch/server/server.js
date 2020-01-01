'use strict';

const PORT = 9080;
const HOST = '0.0.0.0';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
	bodyParser = require('body-parser'),
    app = require('express')(),
    server = require('http').Server(app),
    nutch_loc = '~/nutch',
    sh = spawn('bash');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/crawl/start', (req, res) => {
	if(!req.body.depth || !req.body.url || !req.body.index){
		res.status(405);
		return;
	}

	var crawl_command = 'rm -rf '+nutch_loc+'/localcrawl || true && cd '+nutch_loc+' && rm seed.txt || true && echo "'+req.body.url+'" > seed.txt && ./bin/crawl -i -D "elastic.rest.index='+req.body.index+'" -s '+nutch_loc+'/seed.txt localcrawl '+req.body.depth + ' &';

	console.log(`Crawl command: ${crawl_command}`);
	exec(crawl_command);

	res.json({"result":"started"});
	res.status(200);
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
