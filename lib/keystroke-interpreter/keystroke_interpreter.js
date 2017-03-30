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
    this.nonAlgorithm = require(path.join(__dirname, 'nonAlgorithm.js'));
    this.Algorithm = require(path.join(__dirname, 'Algorithm.js'))
    self = this;
    this.data = [];
    this.results = {};
    this.resultsDir = null;


    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/
    this.init = function (data) {
        console.log('new interpreter object created');

        self.data = data;

        self.make_result_directory();
        self.single_key_counts(self.data.keystrokes);
        self.results["pairedResults"] = self.Algorithm.pairEvents(data.keystrokes);
        self.results["wrongPairedKeyEvents"] = self.Algorithm.getWrongPairedEvents(self.results.pairedResults);
        self.results["dwell_time"] = self.Algorithm.getDwellTime(self.results.pairedResults);
        self.getFlightTimes();








        self.saveJSONResults();
    }

    this.make_result_directory = () => {
        if (!fs.existsSync("./results")) {
            fs.mkdirSync("./results");
        }
        if (!fs.existsSync(path.join('./results', self.data._id.split('-')[0]))) {
            fs.mkdirSync(path.join('./results', self.data._id.split('-')[0]));
        }
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
        self.results.flight_time = {}

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
        }
    }

    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/
    this.saveJSONResults = () => {
        if (!fs.existsSync(path.join(__dirname, '..', '..', 'results', self.data._id.split('-')[0],"json"))) {
            fs.mkdirSync(path.join(__dirname, '..', '..', 'results', self.data._id.split('-')[0],"json"));
        }
        for (obj in self.results) {

            fs.writeFile(
                path.join(
                    __dirname,
                    '..',
                    '..',
                    'results',
                    self.data._id.split('-')[0],
                    "json",
                    `${obj}-${self.data._id.split('-')[0]}.json`), JSON.stringify(self.results[obj], null, 2), (err) => {
                    if (err)
                        return console.log(err);
                    console.log('The results were saved!');
                });
        }
    }

    /************************************************************************
     * Organizer for All parsing and link to csv conver and master analysis *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/
    this.dev_writeDBData = (data) => {

        fs.writeFile(path.join(__dirname, '..', '..', 'raw', data._id + ".txt"), JSON.stringify(data), function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }
}