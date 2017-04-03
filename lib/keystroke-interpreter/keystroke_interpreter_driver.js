module.exports = function () {

    const fs = require('fs');
    const path = require('path');
    const keystrokeInterpreter = require(path.join(__dirname, "keystroke_interpreter.js"));
    const json2csv = require("json2csv");

    var pathToFiles = path.join(__dirname, "..", "..", "raw");
    var numberOfFilesToProcess = 5;
    delayTime = 500;


    fs.readdir(pathToFiles, (err, files) => {
        console.log(files.length);
        sliceFileIntoSegments(0,files.length, files);
    });

    function sliceFileIntoSegments(start, total, files) {
        if ((start + numberOfFilesToProcess) > total) {
            createInterpretersFinal(files.slice(start, total+1));
        }
        else {
            createInterpreters(files.slice(start, start+numberOfFilesToProcess));
            setTimeout(sliceFileIntoSegments, delayTime, start+numberOfFilesToProcess, total, files);
        }
    }

    function createInterpreters(files) {
        files.forEach(file => {
            var interpreter = new keystrokeInterpreter();
            interpreter.init(JSON.parse(fs.readFileSync(path.join(pathToFiles, file), "utf8")));
        });
    }

        function createInterpretersFinal(files) {
        files.forEach(file => {
            var interpreter = new keystrokeInterpreter();
            interpreter.init(JSON.parse(fs.readFileSync(path.join(pathToFiles, file), "utf8")));
        });
        fs.writeFileSync("analysis_status.json", JSON.stringify({"status": true}));
        createTop25DiGraphs();
    }

    function createTop25DiGraphs() {
    var pathTo25 = path.join(pathToFiles, "..", "results", "complete", "000-TOTALS-000", "flight_time_raw");
    var files = fs.readdirSync(pathTo25);
    var total = {};
    files.forEach( (val, ind, arr) => {
        var obj = JSON.parse(fs.readFileSync(path.join(pathTo25, val), "utf8"));
        obj.result.forEach( (v, i , a) => {
            if (total[v] == null) {
                total[v] = 1
            } else {
                total[v]++;
            }
        });
    });

    var top25 = [];
    for (param in total) {
        top25.push([param, total[param]]);
    }
    top25.sort(function (a, b) { return a[1] - b[1] });
    top25.reverse();

    var fields = [];
    var data = {};
    for (var i = 0; i < 25; i++) {
        fields.push(top25[i][0]);
        data[top25[i][0]] = top25[i][1];
    }

    var top25csv = json2csv({data: data, fields: fields});
    fs.writeFileSync(path.join(pathTo25, "..", "top25-digraphs.csv"), top25csv);
}
}

