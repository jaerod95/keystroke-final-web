const express = require('express');
const path = require('path');
var fs = require('fs');
var archiver = require('archiver');

const keystroke_interpreter = require(path.join(__dirname, "..", 'keystroke.js'));
const keystroke_database = require(path.join(__dirname, "..", "lib", "database-access", "justGetData.js"));

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.post('/api/v1/download-database', function (req, res, next) {
  keystroke_database();
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




module.exports = router;