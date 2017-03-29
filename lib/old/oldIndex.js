
    /*
        self.mainAnalysis();

        var dwelltime         = json2csv(self.convertToCSVDwell(self.dwell_time_total));
        var flight_time_one   = json2csv(self.convertToCSVFlight(self.flight_time_one_total));
        var flight_time_two   = json2csv(self.convertToCSVFlight(self.flight_time_two_total));
        var flight_time_three = json2csv(self.convertToCSVFlight(self.flight_time_three_total));
        var flight_time_four  = json2csv(self.convertToCSVFlight(self.flight_time_four_total));
        var bool = fs.existsSync(`./results/${self.data.Username}/master`)
          if (!bool) {
            fs.mkdirSync('./results/' + self.data.Username + '/master');
          }

        fs.writeFile('./results/' + self.data.Username + '/master/dwell-time-' + self.data._id + '.csv', dwelltime, function (err) {
          if (err) throw err;
        });

        fs.writeFile('./results/' + self.data.Username + '/master/flight-time-1-' + self.data._id + '.csv', flight_time_one, function (err) {
          if (err) throw err;
        });

        fs.writeFile('./results/' + self.data.Username + '/master/flight-time-2-' + self.data._id + '.csv', flight_time_two, function (err) {
          if (err) throw err;
        });

        fs.writeFile('./results/' + self.data.Username + '/master/flight-time-3-' + self.data._id + '.csv', flight_time_three, function (err) {
          if (err) throw err;
        });

        fs.writeFile('./results/' + self.data.Username + '/master/flight-time-4-' + self.data._id + '.csv', flight_time_four, function (err) {
          if (err) throw err;
        });

    */
  this.orderedEvents = [];
  this.dwell_time = {};
  this.flight_time_one = {};
  this.flight_time_two = {};
  this.flight_time_three = {};
  this.flight_time_four = {};

  this.dwell_time_total = {};
  this.flight_time_one_total = {};
  this.flight_time_two_total = {};
  this.flight_time_three_total = {};
  this.flight_time_four_total = {};


  /************************************************
   * All Analysis Start Here, Calculates:         *
   *  Dwell Time,                                 *
   *  Flight Time,                                *
   *  N-Graph                                     *
   * @param  {String} str Data in String Format   *
   * @return {void}       void;                   *
   ************************************************/
  this.parse = function (data) {

    self.orderedEvents = self.orderKeyEvents(self.data.KeyEvents);
    self.dwell_time = self.calculateDwellTime(self.data.KeyEvents);
    self.flight_time_one = self.calculateFlightTimeOne(self.orderedEvents);
    self.flight_time_two = self.calculateFlightTimeTwo(self.orderedEvents);
    self.flight_time_three = self.calculateFlightTimeThree(self.orderedEvents);
    self.flight_time_four = self.calculateFlightTimeFour(self.orderedEvents);
    self.dwell_time_total = self.mergeDwell(self.dwell_time, self.dwell_time_total);
    self.flight_time_one_total = self.merge(self.flight_time_one, self.flight_time_one_total);
    self.flight_time_two_total = self.merge(self.flight_time_two, self.flight_time_two_total);
    self.flight_time_three_total = self.merge(self.flight_time_three, self.flight_time_three_total);
    self.flight_time_four_total = self.merge(self.flight_time_four, self.flight_time_four_total);

    self.checkDirectory()
  },

    /************************************************
     * Merges Dwell Time data from the current doc  *
     * to the total user dwell time data            *
     * @param  {JSON} newData new DT Data           *
     * @param  {JSON} oldData old DT Data           *
     * @return {JSON} updataed old DT Data          *
     ************************************************/
    this.mergeDwell = function (newData, oldData) {
      for (obj in newData) {
        if (oldData[obj]) {
          for (item in newData[obj])
            oldData[obj].push(newData[obj][item]);
        } else {
          oldData[obj] = newData[obj];
        }
      }
      return oldData;
    }

  /************************************************
   * Merges Flight Time data from the current doc *
   * to the total user Flight time data           *
   * @param  {JSON} newData new FT Data           *
   * @param  {JSON} oldData old FT Data           *
   * @return {JSON} updataed old FT Data          *
   ************************************************/
  this.merge = function (newData, oldData) {
    for (obj in newData) {
      if (oldData[obj]) {
        for (item in newData[obj].FlightTime)
          oldData[obj].FlightTime.push(newData[obj].FlightTime[item]);
      } else {
        oldData[obj] = newData[obj];
      }
    }
    return oldData;
  }

  /************************************************
   * Checks to see if the new directory for       *
   * writing files exists, if not, creates dir    *
   * @return {void} void                          *
   ************************************************/
  this.checkDirectory = function () {
    var newDir = self.data.Username;
    var exists = fs.existsSync('./results/' + self.data.Username)
    if (exists) {
      self.writeFiles(newDir);
    } else {
      fs.mkdirSync('./results/' + newDir);
      self.writeFiles(newDir);
    }
  }

  /************************************************
   * writes CSV files to new directory            *
   * @param  {String} newDir dir to write files   *
   * @return {void} void                          *
   ************************************************/
  this.writeFiles = function (newDir) {

    var dwelltime = json2csv(self.convertToCSVDwell(self.dwell_time));
    var flight_time_one = json2csv(self.convertToCSVFlight(self.flight_time_one));
    var flight_time_two = json2csv(self.convertToCSVFlight(self.flight_time_two));
    var flight_time_three = json2csv(self.convertToCSVFlight(self.flight_time_three));
    var flight_time_four = json2csv(self.convertToCSVFlight(self.flight_time_four));

    fs.writeFile('./results/' + newDir + '/dwell-time-' + self.data._id + '.csv', dwelltime, function (err) {
      if (err) throw err;
    });

    fs.writeFile('./results/' + newDir + '/flight-time-1-' + self.data._id + '.csv', flight_time_one, function (err) {
      if (err) throw err;
    });

    fs.writeFile('./results/' + newDir + '/flight-time-2-' + self.data._id + '.csv', flight_time_two, function (err) {
      if (err) throw err;
    });

    fs.writeFile('./results/' + newDir + '/flight-time-3-' + self.data._id + '.csv', flight_time_three, function (err) {
      if (err) throw err;
    });

    fs.writeFile('./results/' + newDir + '/flight-time-4-' + self.data._id + '.csv', flight_time_four, function (err) {
      if (err) throw err;
    });
  }

  /*****************************************************************************
   * Orders every keystroke Press and Release pair by Timestamp of Press       *
   * @param  {JSON} data Key Events of data                                    *
   * @return {array}     An array of JSON Objects sorted by Timestamp of Press *
   *                     [Format]   : {                                        *
   *                     Press      : Timestamp(numeric),                      *
   *                     Release    : Timestamp(numeric),                      *
   *                     allData    : [{                                       *
   *                                    EventType: ex.("keydown"),             *
   *                                    Key: ex.("T"),                         *
   *                                    KeyCode: ex.(84),                      *
   *                                    Target: ex.("question_one"),           *
   *                                    Timestamp: ex.(1483093174757)          *
   *                                   },                                      *
   *                                   {                                       *
   *                                    EventType: ex.("keyup"),               *
   *                                    Key: ex.("T"),                         *
   *                                    KeyCode: ex.(84),                      *
   *                                    Target: ex.("question_one"),           *
   *                                    Timestamp: ex.(1483093174869)          *
   *                                   }]                                      *
   *                                                                           *
   *     //8,9,10,14,15,27,32-127  POSSIBLE TO TRACK KEYS                      *
   ****************************************************************************/
  this.orderKeyEvents = function (data) {
    var result = {};
    var str = '{';

    for (var i = 0; i < data.length; i++) {
      str += '"' + data[i].Key + '": [],';
    }

    str = str.slice(0, -1);
    str += '}';
    result = JSON.parse(str);
    var keyTemp = [];
    var temp = [];

    for (var k = data.length - 1; k >= 0; k--) {
      var index = keyTemp.indexOf(data[k].KeyCode);

      if (index != -1) {
        var dwelltime = temp[index].Timestamp - data[k].Timestamp;
        var PressValues = [{
          "Press": data[k].Timestamp,
          "Release": temp[index].Timestamp,
          "allData": [data[k], data[index]]
        }];

        result[data[k].Key].push(PressValues)
        temp.splice(index, 1);
        keyTemp.splice(index, 1);
      } else {
        keyTemp.push(data[k].KeyCode);
        temp.push(data[k]);
      }
    }
    var toSort = [];
    for (var value in result) {
      if (!result.hasOwnProperty(value)) {
        continue;
      }
      for (var j = 0; j < result[value].length; j++) {
        toSort.push(result[value][j][0]);
      }
    }
    self.sortByKey(toSort, 'Press');
    result = toSort;
    return result;
  }

  /**********************************************************
   * Sorts an array of JSON objects by property value       *
   * @param  {array} array An Array of JSON Objects         *
   * @param  {String} key  The property you want to sort by *
   * @return {array}       The sorted Array                 *
   **********************************************************/
  this.sortByKey = function (array, key) {
    return array.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  },

    /**********************************************************
     * Converts JSON Object into CSV Format (dwelltime)       *
     * @param {JSON} obj JSON object to convert to CSV format *
     **********************************************************/
    this.convertToCSVDwell = function (obj) {
      var csv = {
        data: []
      };
      for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) {
          continue;
        }
        for (var i = 0; i < obj[prop].length; i++) {
          var temp = {};
          var bool = false;
          for (var k = 0; k < csv.data.length; k++) {
            if (csv.data[k].hasOwnProperty(prop)) { } else {
              temp[prop] = obj[prop][i];
              csv.data[k][prop] = obj[prop][i];
              bool = true;
              break;
            }
          }
          if (!bool) {
            temp[prop] = obj[prop][i];
            csv.data.push(temp);
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
    var csv = {
      data: []
    };
    for (var prop in obj) {
      if (!obj.hasOwnProperty(prop)) {
        continue;
      }
      for (var i = 0; i < obj[prop].FlightTime.length; i++) {
        var temp = {};
        var bool = false;
        for (var k = 0; k < csv.data.length; k++) {
          var newProp = `From '${obj[prop].From}' To '${obj[prop].To}'`;
          if (csv.data[k].hasOwnProperty(newProp)) { } else {
            var newProp = `From '${obj[prop].From}' To '${obj[prop].To}'`;
            csv.data[k][newProp] = obj[prop].FlightTime[i];
            bool = true;
            break;
          }
        }
        if (!bool) {
          var newProp = `From '${obj[prop].From}' To '${obj[prop].To}'`;
          temp[newProp] = obj[prop].FlightTime[i];
          csv.data.push(temp);
        }
      }
    }
    return csv;
  }

  /********************************************************
   * Calculates the DwellTime by Key                      *
   * @param  {JSON} data KeyEvents of data                *
   * @return {JSON}      JSON object of DwellTime per Key *
   ********************************************************/
  this.calculateDwellTime = function (data) {
    var result = {}
    var str = '{'

    for (var i = 0; i < data.length; i++) {

      str += '"' + data[i].Key + '": [],';

    }

    str = str.slice(0, -1);
    str += '}';
    result = JSON.parse(str);

    var keyTemp = [];
    var temp = [];

    for (var k = data.length - 1; k >= 0; k--) {

      var index = keyTemp.indexOf(data[k].KeyCode);

      if (index != -1) {

        var dwelltime = temp[index].Timestamp - data[k].Timestamp;
        result[data[k].Key].push(dwelltime)
        temp.splice(index, 1);
        keyTemp.splice(index, 1);

      } else {

        keyTemp.push(data[k].KeyCode);
        temp.push(data[k]);

      }
    }
    return result;
  }

  /************************************************************
   * Calculates the flight time between all key combinations, *
   * uses the formula: FTtype1,n=Pn+1−Rn.                     *
   * @param  {array} obj An ordered array of keystrokes       *
   * @return {JSON}     A JSON object of the Flight Times     *
   ************************************************************/

  this.calculateFlightTimeOne = function (obj) {
    var result = {};

    for (var i = 0; i < obj.length - 1; i++) {

      var flight_time = obj[i + 1].Press - obj[i].Release;
      var from_key = obj[i].allData[0].Key;
      var to_key = obj[i + 1].allData[0].Key;
      var both_keys = from_key + to_key;

      if (result.hasOwnProperty(both_keys)) {

        result[both_keys].FlightTime.push(flight_time);

      } else {

        var temp = {
          "From": from_key,
          "To": to_key,
          "FlightTime": [flight_time]
        };
        result[both_keys] = temp;

      }
    }
    return result;
  }

  /************************************************************
   * Calculates the flight time between all key combinations, *
   * uses the formula: FTtype2,n=Rn+1−Rn.                     *
   * @param  {array} obj An ordered array of keystrokes       *
   * @return {JSON}     A JSON object of the Flight Times     *
   ************************************************************/
  this.calculateFlightTimeTwo = function (obj) {
    var result = {};

    for (var i = 0; i < obj.length - 1; i++) {

      var flight_time = obj[i + 1].Release - obj[i].Release;
      var from_key = obj[i].allData[0].Key;
      var to_key = obj[i + 1].allData[0].Key;
      var both_keys = from_key + to_key;

      if (result.hasOwnProperty(both_keys)) {

        result[both_keys].FlightTime.push(flight_time);

      } else {

        var temp = {
          "From": from_key,
          "To": to_key,
          "FlightTime": [flight_time]
        };
        result[both_keys] = temp;

      }
    }
    return result;
  }

  /************************************************************
   * Calculates the flight time between all key combinations, *
   * uses the formula: FTtype3,n=Pn+1−Pn.                     *
   * @param  {array} obj An ordered array of keystrokes       *
   * @return {JSON}     A JSON object of the Flight Times     *
   ************************************************************/
  this.calculateFlightTimeThree = function (obj) {
    var result = {};

    for (var i = 0; i < obj.length - 1; i++) {

      var flight_time = obj[i + 1].Press - obj[i].Press;
      var from_key = obj[i].allData[0].Key;
      var to_key = obj[i + 1].allData[0].Key;
      var both_keys = from_key + to_key;

      if (result.hasOwnProperty(both_keys)) {

        result[both_keys].FlightTime.push(flight_time);

      } else {

        var temp = {
          "From": from_key,
          "To": to_key,
          "FlightTime": [flight_time]
        };
        result[both_keys] = temp;

      }
    }
    return result;
  }

  /************************************************************
   * Calculates the flight time between all key combinations, *
   * uses the formula: FTtype4,n=Rn+1−Pn.                     *
   * @param  {array} obj An ordered array of keystrokes       *
   * @return {JSON}     A JSON object of the Flight Times     *
   ************************************************************/
  this.calculateFlightTimeFour = function (obj) {
    var result = {};

    for (var i = 0; i < obj.length - 1; i++) {

      var flight_time = obj[i + 1].Release - obj[i].Press;
      var from_key = obj[i].allData[0].Key;
      var to_key = obj[i + 1].allData[0].Key;
      var both_keys = from_key + to_key;

      if (result.hasOwnProperty(both_keys)) {

        result[both_keys].FlightTime.push(flight_time);
      } else {

        var temp = {
          "From": from_key,
          "To": to_key,
          "FlightTime": [flight_time]
        };
        result[both_keys] = temp;

      }
    }
    return result;
  }

  /*********************************************
   * Calculates other N-graphs                 *
   * @param  {JSON} obj The dataFile passed in *
   * @return {array}     Values of n-graph     *
   *********************************************/

  this.calculateNGraph = function (obj) {
    console.log('calculate n-graph here')
  }

  this.mainAnalysis = function () {

    var DT_M = calculateMedianDT(self.dwell_time_total);
    var FT1_M = calculateMedianFT(self.flight_time_one_total);
    var FT2_M = calculateMedianFT(self.flight_time_two_total);
    var FT3_M = calculateMedianFT(self.flight_time_three_total);
    var FT4_M = calculateMedianFT(self.flight_time_four_total);

    uploadToMongo();

    function calculateMedianDT(obj) {
      var result = {};
      for (item in obj) {
        result[item] = getMedian(obj[item]);
      }
      return result
    }

    function calculateMedianFT(obj) {
      var result = {};
      for (item in obj) {
        result[item] = getMedian(obj[item].FlightTime);
      }
      return result
    }

    function getMedian(values) {
      values.sort((a, b) => a - b);
      let lowMiddle = Math.floor((values.length - 1) / 2);
      let highMiddle = Math.ceil((values.length - 1) / 2);
      let median = (values[lowMiddle] + values[highMiddle]) / 2;
      return median
    }

    function uploadToMongo() {

      DT_M = prettyMongo(DT_M);
      FT1_M = prettyMongo(FT1_M);
      FT2_M = prettyMongo(FT2_M);
      FT3_M = prettyMongo(FT3_M);
      FT4_M = prettyMongo(FT4_M);

      Mongo.MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);

        console.log("Connected successfully to server");

        var collection = db.collection('medians');
        var str = self.data.Username;
        collection.find({
          "_id": str
        }).toArray(function (err, docs) {
          assert.equal(err, null);
          if (docs.length == 0) {
            collection.insertOne({
              "_id": str,
              "DT": DT_M,
              "FT1": FT1_M,
              "FT2": FT2_M,
              "FT3": FT3_M,
              "FT4": FT4_M,

            }, function (err, result) {
              assert.equal(err, null);
              console.log("Inserted a document into the Medians collection.");
            });
            console.log('Connection Closed');
            db.close();
          } else {
            collection.updateOne({
              "_id": str
            }, {
                $set: {
                  "DT": DT_M,
                  "FT1": FT1_M,
                  "FT2": FT2_M,
                  "FT3": FT3_M,
                  "FT4": FT4_M,
                }


              }, function (err, result) {
                assert.equal(err, null);
                console.log("Inserted a document into the Medians collection.");
              });
            console.log('Connection Closed');
            db.close();
          }

        });
      });


      function prettyMongo(obj) {
        for (values in obj) {
          if (values.indexOf('.') != -1) {
            var newValues = values.replace(/\./g, 'period');
            obj[newValues] = obj[values];
            delete obj[values];
          }
        }
        return obj;
      }
    }
  }