module.exports = function () {

    const fs = require('fs');
    const path = require('path');
    const keystrokeInterpreter = require(path.join(__dirname, "keystroke_interpreter.js"));

    var pathToFiles = path.join(__dirname, "..", "..", "raw");
    var numberOfFilesToProcess = 5;


    fs.readdir(pathToFiles, (err, files) => {
        console.log(files.length);
        sliceFileIntoSegments(0,files.length, files);
    });

    function sliceFileIntoSegments(start, total, files) {
        if ((start + numberOfFilesToProcess) > total) {
            createInterpreters(files.slice(start, total+1));
        }
        else {
            createInterpreters(files.slice(start, start+numberOfFilesToProcess));
            setTimeout(sliceFileIntoSegments, 250, start+numberOfFilesToProcess, total, files);
        }
    }

    function createInterpreters(files) {
        files.forEach(file => {
            var interpreter = new keystrokeInterpreter();
            interpreter.init(JSON.parse(fs.readFileSync(path.join(pathToFiles, file), "utf8")));
        });

    }



}