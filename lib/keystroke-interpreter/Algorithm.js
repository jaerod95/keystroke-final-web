module.exports = {

    /**
     * Each key gets a unique key. how to handle ctrl and shift keys?
     * All keys are different, all keys are different
     */
    keyStats: (keyData) => {
        /*
        var j = {
            id: 0,
            keyName: "space",
            keyCode: 124,
            keyDownT1imestamp: 0001,
            keyUpTimestamp: 2000,
            dwellTime: 1999,
            shift: 1,
            ctrl: 0,
            alt: 0,
        }*/

        //for (var i = 0; i < )
        var results = {}
        return results
    },

    /********************************************************
     * Calculates the DwellTime by Key                      *
     * @param  {JSON} data KeyEvents of data                *
     * @return {JSON}      JSON object of DwellTime per Key *
     ********************************************************/
    pairEvents: (keystrokes) => {
        var result = {};
        var str = '{';
        for (page in keystrokes) {
            str += '"' + page + '": null,';
        }
        str = str.slice(0, -1);
        str += '}';
        result = JSON.parse(str);

        var keyTemp = [];
        var temp = [];

        for (page in keystrokes) {
            result[page] = [];
            keystrokes[page].KeyEvents.forEach((val, ind, arr) => {
                var index = keyTemp.indexOf(val.code);
                if (index != -1) {
                    if (val.type == "keydown") {
                        if (temp[index]["pairedEvents"] == null)
                            temp[index]["pairedEvents"] = [];
                        temp[index]["pairedEvents"].push(val);
                    } else {
                        if (result[page][val.code] == null)
                            result[page][val.code] = [];
                        var keyEvent = {
                            "code": val.key + "-" + val.code,
                            "Press": temp[index].timeStamp,
                            "Release": val.timeStamp,
                            "allData": {
                                "Press": temp[index],
                                "Release": val
                            },
                            "wrongKeyPair": false
                        }
                        if (temp[index].pairedEvents != null)
                            keyEvent["wrongKeyPair"] = true;
                        result[page].push(keyEvent);
                        temp.splice(index, 1);
                        keyTemp.splice(index, 1);
                    }
                } else {
                    if (val.type != "keyup") {
                        keyTemp.push(val.code);
                        temp.push(val);
                    }
                }
            });
        }
        return result
    },

    /******************************************************************** */
    getWrongPairedEvents: (pairedKeystrokes) => {
        var results = {
            "count": {}
        };
        for (page in pairedKeystrokes) {
            results[page] = [];
            pairedKeystrokes[page].forEach((val, ind, arr) => {
                if (val.wrongKeyPair) {
                    results[page].push(val);
                    if (results.count[val.code] == null)
                        results.count[val.code] = 0
                    results.count[val.code]++;
                }
            });
        }
        return results;
    },

    /******************************************************************** */
    getDwellTime: (pairedKeystrokes) => {
        var results = {};
        for (page in pairedKeystrokes) {
            results[page] = {};
            pairedKeystrokes[page].forEach((val, ind, arr) => {
                if (!val.wrongKeyPair) {
                    var dwelltime = val.Release - val.Press;
                    if (results[page][val.code] == null)
                        results[page][val.code] = []
                    results[page][val.code].push(dwelltime);
                }
            });
        }
        return results;
    },

    /**************************************************************
     * Calculates the flight time between all key combinations, *
     * uses the formula: FTtype1,n=Pn+1−Rn.                     *
     * @param  {array} obj An ordered array of keystrokes       *
     * @return {JSON}     A JSON object of the Flight Times     *
     ************************************************************/

    calculateFlightTimeOne: function (obj) {
        var result = {};

        for (var i = 0; i < obj.length - 1; i++) {
            if (!obj[i].wrongKeyPair && !obj[i + 1].wrongKeyPair) {
                var flight_time = obj[i + 1].Press - obj[i].Release;
                var from_key = obj[i].allData.Press.key
                var to_key = obj[i + 1].allData.Release.key
                var both_keys = from_key + to_key;

                if (result.hasOwnProperty(both_keys)) {

                    result[both_keys].FlightTime.push(flight_time);

                } else {
                    result[both_keys] = {
                        "From": from_key,
                        "To": to_key,
                        "FlightTime": [flight_time]
                    };
                }
            }
        }
        return result;
    },

    /************************************************************
     * Calculates the flight time between all key combinations, *
     * uses the formula: FTtype2,n=Rn+1−Rn.                     *
     * @param  {array} obj An ordered array of keystrokes       *
     * @return {JSON}     A JSON object of the Flight Times     *
     ************************************************************/
    calculateFlightTimeTwo: function (obj) {
        var result = {};

        for (var i = 0; i < obj.length - 1; i++) {
            if (!obj[i].wrongKeyPair && !obj[i + 1].wrongKeyPair) {
                var flight_time = obj[i + 1].Release - obj[i].Release;
                var from_key = obj[i].allData.Press.key
                var to_key = obj[i + 1].allData.Release.key
                var both_keys = from_key + to_key;

                if (result.hasOwnProperty(both_keys)) {

                    result[both_keys].FlightTime.push(flight_time);

                } else {
                    result[both_keys] = {
                        "From": from_key,
                        "To": to_key,
                        "FlightTime": [flight_time]
                    };
                }
            }
        }
        return result;
    },

    /************************************************************
     * Calculates the flight time between all key combinations, *
     * uses the formula: FTtype3,n=Pn+1−Pn.                     *
     * @param  {array} obj An ordered array of keystrokes       *
     * @return {JSON}     A JSON object of the Flight Times     *
     ************************************************************/
    calculateFlightTimeThree: function (obj) {
        var result = {};

        for (var i = 0; i < obj.length - 1; i++) {
            if (!obj[i].wrongKeyPair && !obj[i + 1].wrongKeyPair) {
                var flight_time = obj[i + 1].Press - obj[i].Press;
                var from_key = obj[i].allData.Press.key
                var to_key = obj[i + 1].allData.Release.key
                var both_keys = from_key + to_key;

                if (result.hasOwnProperty(both_keys)) {

                    result[both_keys].FlightTime.push(flight_time);

                } else {
                    result[both_keys] = {
                        "From": from_key,
                        "To": to_key,
                        "FlightTime": [flight_time]
                    };
                }
            }
        }
        return result;
    },

    /************************************************************
     * Calculates the flight time between all key combinations, *
     * uses the formula: FTtype4,n=Rn+1−Pn.                     *
     * @param  {array} obj An ordered array of keystrokes       *
     * @return {JSON}     A JSON object of the Flight Times     *
     ************************************************************/
    calculateFlightTimeFour: function (obj) {
        var result = {};

        for (var i = 0; i < obj.length - 1; i++) {
            if (!obj[i].wrongKeyPair && !obj[i + 1].wrongKeyPair) {
                var flight_time = obj[i + 1].Release - obj[i].Press;
                var from_key = obj[i].allData.Press.key
                var to_key = obj[i + 1].allData.Release.key
                var both_keys = from_key + to_key;

                if (result.hasOwnProperty(both_keys)) {

                    result[both_keys].FlightTime.push(flight_time);
                } else {
                    result[both_keys] = {
                        "From": from_key,
                        "To": to_key,
                        "FlightTime": [flight_time]
                    };
                }
            }
        }
        return result;
    }
}