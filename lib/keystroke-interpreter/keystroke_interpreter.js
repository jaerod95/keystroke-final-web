const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv');
const Mongo = require('mongodb');
const assert = require('assert');

/******************************************************************
 * Main variable to contail all funcitons out of the global scope *
 * @type {Object}                                                 *
 ******************************************************************/
module.exports = function jr_keystroke_analyzer() {
    this.nonAlgorithm   = require(path.join(__dirname, 'nonAlgorithm.js'));
    this.Algorithm      = require(path.join(__dirname, 'Algorithm.js'))
    self                = this;
    this.data           = [];
    this.results        = {};
    this.resultsDir     = null;
    this.incompleteData = false;


    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/
    this.init = function (data) {
        console.log('new interpreter object created');

        self.data = data;

        self.single_key_counts(self.data.keystrokes);
        self.results["pairedResults"] = self.Algorithm.pairEvents(data.keystrokes);
        self.results["wrongPairedKeyEvents"] = self.Algorithm.getWrongPairedEvents(self.results.pairedResults);
        self.results["dwell_time"] = self.Algorithm.getDwellTime(self.results.pairedResults);
        self.getFlightTimes();

        self.runAlgorithms();

        self.incompleteData = self.checkIncomplete();
        self.make_result_directory();
        self.saveTotalsForAllSubjects();
        self.saveJSONResults();
        self.saveCSVResults();
    }

    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/

    this.single_key_counts = (data) => {
        var keycodes = require(path.join(__dirname, 'keycodes', 'keycodes.js'));
        self.results['key_counts'] = {};
        for (code in keycodes) {
            self.results.key_counts[code + "-" + keycodes[code]] = this.nonAlgorithm.key_count_of_type(data, code);
        }
    }

    /************************************************************************ */
    this.getFlightTimes = () => {
        self.results.flight_time = {
            "total": {}
        }

        function compare(a, b) {
            if (a.Press < b.Press)
                return -1;
            if (a.Press > b.Press)
                return 1;
            return 0;
        }
        for (page in self.results.pairedResults) {
            self.results.pairedResults[page].sort(compare);
            self.results.flight_time[page] = {};
            self.results.flight_time[page]["Release_To_Press"] = self.Algorithm.calculateFlightTimeOne(self.results.pairedResults[page]);
            self.results.flight_time[page]["Release_To_Release"] = self.Algorithm.calculateFlightTimeTwo(self.results.pairedResults[page]);
            self.results.flight_time[page]["Press_To_Press"] = self.Algorithm.calculateFlightTimeThree(self.results.pairedResults[page]);
            self.results.flight_time[page]["Press_To_Release"] = self.Algorithm.calculateFlightTimeFour(self.results.pairedResults[page]);
            for (resultSet in self.results.flight_time[page]) {
                for (dataset in self.results.flight_time[page][resultSet]) {
                    if (self.results.flight_time.total[resultSet] == null)
                        self.results.flight_time.total[resultSet] = {};
                    if (self.results.flight_time.total[resultSet][dataset] == null)
                        self.results.flight_time.total[resultSet][dataset] = {};
                    self.results.flight_time.total[resultSet][dataset]["From"] = self.results.flight_time[page][resultSet][dataset]["From"];
                    self.results.flight_time.total[resultSet][dataset]["To"] = self.results.flight_time[page][resultSet][dataset]["To"];
                    if (self.results.flight_time.total[resultSet][dataset]["FlightTime"] == null) {
                        self.results.flight_time.total[resultSet][dataset]["FlightTime"] = [];
                    }
                    self.results.flight_time[page][resultSet][dataset]["FlightTime"].forEach((val, ind, arr) => {
                        self.results.flight_time.total[resultSet][dataset]["FlightTime"].push(val);
                    });
                }
            }
        }
    }

    /*****************************************–******************************** */
    this.runAlgorithms = () => {
        self.results["Canberra_algoritm"]             = self.Algorithm.algorithm_Canberra();
        self.results["Chebyshev_algoritm"]            = self.Algorithm.algorithm_Chebyshev();
        self.results["Czekanowski_algoritm"]          = self.Algorithm.algorithm_Czekanowski();
        self.results["Gower_algoritm"]                = self.Algorithm.algorithm_Gower();
        self.results["Intersection_algoritm"]         = self.Algorithm.algorithm_Intersection();
        self.results["Kulczynski_algoritm"]           = self.Algorithm.algorithm_Kulczynski();
        self.results["Minkowski_algoritm"]            = self.Algorithm.algorithm_Minkowski();
        self.results["Motyka_algoritm"]               = self.Algorithm.algorithm_Motyka();
        self.results["Ruzicka_algoritm"]              = self.Algorithm.algorithm_Ruzicka();
        self.results["Soergel_algoritm"]              = self.Algorithm.algorithm_Soergel();
        self.results["Sorensen_algoritm"]             = self.Algorithm.algorithm_Sorensen();
        self.results["Euclidean_Distance_algoritm"]   = self.Algorithm.algorithm_Euclidean_Distance();
        self.results["Mahanobolis_Distance_algoritm"] = self.Algorithm.algorithm_Mahanobolis_Distance();
        self.results["Z_Score_algoritm"]              = self.Algorithm.algorithm_Z_Score();
        self.results["Lorentzian_algoritm"]           = self.Algorithm.algorithm_Lorentzian();
        self.results["Manhattan_Distance_algoritm"]   = self.Algorithm.algorithm_Manhattan_Distance();
    }

    this.checkIncomplete = () => {
        for (prop in self.results.dwell_time) {
            if (JSON.stringify(self.results.dwell_time[prop]) == JSON.stringify({}))
                return true;
        }
        return false;
    }

    this.make_result_directory = () => {
        if (!fs.existsSync("./results")) {
            fs.mkdirSync("./results");
        }
        if (self.incompleteData) {
            if (!fs.existsSync("./results/incomplete")) {
                fs.mkdirSync("./results/incomplete");
            }
            self.resultsDir = "./results/incomplete";
        } else {
            if (!fs.existsSync("./results/complete")) {
                fs.mkdirSync("./results/complete");
            }
            self.resultsDir = "./results/complete";
        }
        if (!fs.existsSync(path.join(self.resultsDir, self.data._id.split('-')[0]))) {
            fs.mkdirSync(path.join(self.resultsDir, self.data._id.split('-')[0]));
        }
        self.resultsDir = path.join(self.resultsDir, self.data._id.split('-')[0]);
    }

    this.saveTotalsForAllSubjects = () => {
        //dwell time
        var results = [];
        var top25 = { "result": [] };
        for (param in self.results.flight_time.total.Press_To_Press) {
            results.push([`From '${self.results.flight_time.total.Press_To_Press[param].From}' To '${self.results.flight_time.total.Press_To_Press[param].To}'`, self.results.flight_time.total.Press_To_Press[param].FlightTime.length]);
        }
        results.sort(function (a, b) { return a[1] - b[1] });
        results.reverse();
        if (results.length < 25) {
            for (var i = 0; i < results.length; i++) {
                top25.result.push(results[i][0]);
            }
        } else {
            for (var i = 0; i < 25; i++) {
                top25.result.push(results[i][0]);
            }
        }

        if (!fs.existsSync(path.join(self.resultsDir, "..", "000-TOTALS-000"))) {
            fs.mkdirSync(path.join(self.resultsDir, "..", "000-TOTALS-000"));
        }
        if (!fs.existsSync(path.join(self.resultsDir, "..", "000-TOTALS-000", "flight_time_raw"))) {
            fs.mkdirSync(path.join(self.resultsDir, "..", "000-TOTALS-000", "flight_time_raw"));
        }
        fs.writeFileSync(path.join(self.resultsDir, "..", "000-TOTALS-000", "flight_time_raw", `top25-${self.data._id}.json`), JSON.stringify(top25));
    }


    this.saveCSVResults = () => {
        if (!fs.existsSync(path.join(self.resultsDir, "csv"))) {
            fs.mkdirSync(path.join(self.resultsDir, "csv"));
        }
        if (!fs.existsSync(path.join(self.resultsDir, "csv", "dwell_time"))) {
            fs.mkdirSync(path.join(self.resultsDir, "csv", "dwell_time"));
        }
        if (!fs.existsSync(path.join(self.resultsDir, "csv", "flight_time"))) {
            fs.mkdirSync(path.join(self.resultsDir, "csv", "flight_time"));
        }

        //Dwell Time
        for (dwell_time_tab in self.results.dwell_time) {
            var fields = [];
            for (dataType in self.results.dwell_time[dwell_time_tab]) {
                fields.push(dataType);
            }

            var dwell_time_csv = json2csv({
                data: self.convertToCSVDwell(self.results.dwell_time[dwell_time_tab]),
                fields: fields
            });
            fs.writeFileSync(
                path.join(
                    self.resultsDir,
                    "csv",
                    "dwell_time",
                    `${dwell_time_tab}-${self.data._id}.csv`), dwell_time_csv);
        }

        //Flight Time
        for (page in self.results.flight_time) {
            for (flight_time_tab in self.results.flight_time[page]) {
                var fields = [];
                for (dataType in self.results.flight_time[page][flight_time_tab]) {
                    fields.push(`From '${self.results.flight_time[page][flight_time_tab][dataType].From}' To '${self.results.flight_time[page][flight_time_tab][dataType].To}'`)
                }

                var flight_time_csv = json2csv({
                    data: self.convertToCSVFlight(self.results.flight_time[page][flight_time_tab]),
                    fields: fields
                });
                fs.writeFileSync(
                    path.join(
                        self.resultsDir,
                        "csv",
                        "flight_time",
                        `${page}-${flight_time_tab}-${self.data._id}.csv`), flight_time_csv);
            }
        }
        //keyCounts


    }

    /**********************************************************
     * Converts JSON Object into CSV Format (dwelltime)       *
     * @param {JSON} obj JSON object to convert to CSV format *
     **********************************************************/
    this.convertToCSVDwell = function (obj) {

        var csv = [];
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            for (var i = 0; i < obj[prop].length; i++) {
                var bool = false;
                var temp = {};
                for (var k = 0; k < csv.length; k++) {
                    if (!csv[k].hasOwnProperty(prop)) {
                        temp[prop] = obj[prop][i];
                        csv[k][prop] = obj[prop][i];
                        bool = true;
                        break;
                    }
                }
                if (!bool) {
                    temp[prop] = obj[prop][i];
                    csv.push(temp);
                }
            }
        }
        return csv;
    }

    /**********************************************************
     * Converts JSON Object into CSV Format (flightTime)      *
     * @param {JSON} obj JSON object to convert to CSV format *
     **********************************************************/
    this.convertToCSVFlight = function (obj) {
        var csv = [];
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            for (var i = 0; i < obj[prop].FlightTime.length; i++) {
                var temp = {};
                var bool = false;
                for (var k = 0; k < csv.length; k++) {
                    var newProp = `From '${obj[prop].From}' To '${obj[prop].To}'`;
                    if (!csv[k].hasOwnProperty(newProp)) {
                        var newProp = `From '${obj[prop].From}' To '${obj[prop].To}'`;
                        csv[k][newProp] = obj[prop].FlightTime[i];
                        bool = true;
                        break;
                    }
                }
                if (!bool) {
                    var newProp = `From '${obj[prop].From}' To '${obj[prop].To}'`;
                    temp[newProp] = obj[prop].FlightTime[i];
                    csv.push(temp);
                }
            }
        }
        return csv;
    }

    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/
    this.saveJSONResults = () => {
        if (!fs.existsSync(path.join(self.resultsDir, "json"))) {
            fs.mkdirSync(path.join(self.resultsDir, "json"));
        }
        for (obj in self.results) {

            fs.writeFileSync(
                path.join(
                    self.resultsDir,
                    "json",
                    `${obj}-${self.data._id}.json`), JSON.stringify(self.results[obj], null, 2));
        }
    }

    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/
    /*
    this.dev_writeDBData = (data) => {

        fs.writeFile(path.join(__dirname, '..', '..', 'raw', data._id + ".txt"), JSON.stringify(data), function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }
    */


}