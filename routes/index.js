const express = require('express');
const path = require('path');
var fs = require('fs');
var archiver = require('archiver');

const keystroke_interpreter = require(path.join(__dirname, "..", "lib", "keystroke-interpreter", "keystroke_interpreter_driver.js"));
const keystroke_database = require(path.join(__dirname, "..", "lib", "database-access", "justGetData.js"));

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/api/v1/sync-status', function (req, res, next) {
  fs.readFile(path.join(__dirname, '..', 'sync_status.json'), 'utf8', function (err, file) {
    res.send(JSON.parse(file));
  });
});

router.get('/api/v1/analysis-status', function (req, res, next) {
  fs.readFile(path.join(__dirname, "..", "analysis_status.json"), 'utf8', function(err, file) {
    res.send(JSON.parse(file));
  })
});

router.post('/api/v1/download-database', function (req, res, next) {
  var file = JSON.parse(fs.readFileSync('sync_status.json', 'utf8'));

  if (!file.sync) {
    res.send(200);
  } else {
    fs.writeFileSync("sync_status.json", JSON.stringify({
      "sync": false
    }));
    keystroke_database();
    res.send(200);
  }
});

router.get('/api/v1/get-raw-data', function (req, res, next) {

  var output = fs.createWriteStream('raw.zip');
  var archive = archiver('zip');

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');

    res.download('./raw.zip');
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.bulk([{
    expand: true,
    cwd: 'consent_forms',
    src: ['**', '../users/**', '../raw/**'],
    dest: 'consent_forms'
  }]);
  archive.finalize();
});

router.post('/api/v1/run-algorithm', function (req, res, next) {
  console.log('this route ran');

  var file = JSON.parse(fs.readFileSync('analysis_status.json', 'utf8'));

  if (!file.status) {
    res.send(200);
  } else {
    fs.writeFileSync("analysis_status.json", JSON.stringify({
      "status": false
    }));
    keystroke_interpreter();
    res.send(200);
  }
});

router.get('/api/v1/get-result-data', function (req, res, next) {

  var output = fs.createWriteStream('results.zip');
  var archive = archiver('zip');

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');

    res.download('./results.zip');
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.bulk([{
    expand: true,
    cwd: 'results',
    src: ['../results/**'],
    dest: 'results'
  }]);
  archive.finalize();
});




module.exports = router;