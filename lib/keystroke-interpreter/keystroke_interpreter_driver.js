module.exports = function () {

    const fs = require('fs');
    const path = require('path');
    const keystrokeInterpreter = require(path.join(__dirname, "keystroke_interpreter.js"));
    const json2csv = require("json2csv");

    var pathToFiles = path.join(__dirname, "..", "..", "raw");
    var numberOfFilesToProcess = 5;
    delayTime = 500;

    makeTotalsSheet();


    fs.readdir(pathToFiles, (err, files) => {
        console.log(files.length);
        sliceFileIntoSegments(0, files.length, files);
    });

    function sliceFileIntoSegments (start, total, files) {
        if ((start + numberOfFilesToProcess) > total) {
            createInterpretersFinal(files.slice(start, total + 1));
        }
        else {
            createInterpreters(files.slice(start, start + numberOfFilesToProcess));
            setTimeout(sliceFileIntoSegments, delayTime, start + numberOfFilesToProcess, total, files);
        }
    }

    function createInterpreters (files) {
        files.forEach(file => {
            var interpreter = new keystrokeInterpreter();
            interpreter.init(JSON.parse(fs.readFileSync(path.join(pathToFiles, file), "utf8")));
        });
    }

    function createInterpretersFinal (files) {
        files.forEach(file => {
            var interpreter = new keystrokeInterpreter();
            interpreter.init(JSON.parse(fs.readFileSync(path.join(pathToFiles, file), "utf8")));
        });
        fs.writeFileSync("analysis_status.json", JSON.stringify({ "status": true }));
        createTop25DiGraphs();
    }

    function createTop25DiGraphs () {
        var pathTo25 = path.join(pathToFiles, "..", "results", "complete", "000-TOTALS-000", "flight_time_raw");
        var files = fs.readdirSync(pathTo25);
        var total = {};
        files.forEach((val, ind, arr) => {
            var obj = JSON.parse(fs.readFileSync(path.join(pathTo25, val), "utf8"));
            obj.result.forEach((v, i, a) => {
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

        var top25csv = json2csv({ data: data, fields: fields });
        fs.writeFileSync(path.join(pathTo25, "..", "top25-digraphs.csv"), top25csv);
        makeTotalsSheet();
    }

    //Makes all the files for the different processed data categories for each user in complete or incomplete
    function makeTotalsSheet () {
        var pathToResultsComplete = path.join(pathToFiles, "..", "results", "complete");
        var pathToResultsIncomplete = path.join(pathToFiles, "..", "results", "incomplete");
        var users = fs.readdirSync(pathToResultsComplete);
        var totalAverageFlightTimeForAllUsers_RP = [];
        var totalAverageFlightTimeForAllUsers_RR = [];
        var totalAverageFlightTimeForAllUsers_PP = [];
        var totalAverageFlightTimeForAllUsers_PR = [];
        var fields = ['Usernames'];

        var dwellTotals = [];
        var dwellFields = ["Usernames"];


        users.forEach((val, ind, arr) => {
            var usr_RP = { "Usernames": val }
            var usr_RR = { "Usernames": val }
            var usr_PP = { "Usernames": val }
            var usr_PR = { "Usernames": val }
            var usrDat = { "Usernames": val }

            if (val.substr(0, 1) != "." && val != "000-TOTALS-000") {
                var pathToJSONFlightTime = path.join(pathToResultsComplete, val, "json");
                var jsonFiles = fs.readdirSync(pathToJSONFlightTime);
                jsonFiles.forEach((v, i, a) => {
                    if (v.substr(0, 11) == "flight_time") {
                        var flightTimes = JSON.parse(fs.readFileSync(path.join(pathToJSONFlightTime, v)));
                        var ReleaseToPress = flightTimes.total.Release_To_Press;
                        var ReleaseToRelease = flightTimes.total.Release_To_Release;
                        var PressToRelease = flightTimes.total.Press_To_Press;
                        var PressToPress = flightTimes.total.Press_To_Release;

                        for (prop in ReleaseToPress) {
                            if (!fields.includes(prop)) {
                                fields.push(prop);
                            }
                            var propSum = 0;
                            ReleaseToPress[prop].FlightTime.forEach((q, w, e) => {
                                propSum += q;
                            });
                            var average = propSum / ReleaseToPress[prop].FlightTime.length;
                            usr_RP[prop] = average;
                        }

                        for (prop in ReleaseToRelease) {
                            var propSum = 0;
                            ReleaseToRelease[prop].FlightTime.forEach((q, w, e) => {
                                propSum += q;
                            });
                            var average = propSum / ReleaseToRelease[prop].FlightTime.length;
                            usr_RR[prop] = average;
                        }

                        for (prop in PressToRelease) {
                            var propSum = 0;
                            PressToRelease[prop].FlightTime.forEach((q, w, e) => {
                                propSum += q;
                            });
                            var average = propSum / PressToRelease[prop].FlightTime.length;
                            usr_PR[prop] = average;
                        }

                        for (prop in PressToPress) {
                            var propSum = 0;
                            PressToPress[prop].FlightTime.forEach((q, w, e) => {
                                propSum += q;
                            });
                            var average = propSum / PressToPress[prop].FlightTime.length;
                            usr_PP[prop] = average;
                        }

                        totalAverageFlightTimeForAllUsers_RP.push(usr_RP);
                        totalAverageFlightTimeForAllUsers_RR.push(usr_RR);
                        totalAverageFlightTimeForAllUsers_PR.push(usr_PR);
                        totalAverageFlightTimeForAllUsers_PP.push(usr_PP);

                    } else if (v.substr(0, 10) == "dwell_time") {
                        var dwell_times = JSON.parse(fs.readFileSync(path.join(pathToJSONFlightTime, v)));
                        var dwellTimeJSON = dwell_times.total;

                        for (prop in dwellTimeJSON) {
                            if (!dwellFields.includes(prop)) {
                                dwellFields.push(prop);
                            }
                            var propSum = 0;
                            dwellTimeJSON[prop].forEach((q, w, e) => {
                                propSum += q;
                            });
                            var average = propSum / dwellTimeJSON[prop].length;
                            usrDat[prop] = average;
                        }
                        dwellTotals.push(usrDat);
                    }
                });
            }
        });

        var FT_RP_TOTAL = json2csv({ data: totalAverageFlightTimeForAllUsers_RP, fields: fields });
        fs.writeFileSync(path.join(pathToResultsComplete, "000-TOTALS-000", "EVERYONE_FLIGHT_TIME_RELEASE_TO_PRESS.csv"), FT_RP_TOTAL);

        var FT_RR_TOTAL = json2csv({ data: totalAverageFlightTimeForAllUsers_RR, fields: fields });
        fs.writeFileSync(path.join(pathToResultsComplete, "000-TOTALS-000", "EVERYONE_FLIGHT_TIME_RELEASE_TO_RELEASE.csv"), FT_RR_TOTAL);

        var FT_PR_TOTAL = json2csv({ data: totalAverageFlightTimeForAllUsers_PR, fields: fields });
        fs.writeFileSync(path.join(pathToResultsComplete, "000-TOTALS-000", "EVERYONE_FLIGHT_TIME_PRESS_TO_RELEASE.csv"), FT_PR_TOTAL);

        var FT_PP_TOTAL = json2csv({ data: totalAverageFlightTimeForAllUsers_PP, fields: fields });
        fs.writeFileSync(path.join(pathToResultsComplete, "000-TOTALS-000", "EVERYONE_FLIGHT_TIME_PRESS_TO_PRESS.csv"), FT_PP_TOTAL);

        var DT_TOTAL = json2csv({ data: dwellTotals, fields: dwellFields });
        fs.writeFileSync(path.join(pathToResultsComplete, "000-TOTALS-000", "EVERYONE_DWELL_TIME.csv"), DT_TOTAL);
    }

}

