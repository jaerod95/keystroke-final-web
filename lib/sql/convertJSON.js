var fs = require('fs')
var path = require('path')
var completeDir = path.join(__dirname, '..', '..', 'results', 'complete');

fs.readdir(completeDir, (err, files) => {
    if (err) return err
    files.forEach((val, ind, arr) => {
        if (val != '000-TOTALS-000' && val != '.DS_Store') {
            var userJsonDataPath = path.join(completeDir, val, "json")
            var jsonDataPerUser = fs.readdirSync(userJsonDataPath)
            jsonDataPerUser.forEach((v, i, a) => {
                if (v.indexOf("dwell_time") != -1) {
                    var result = []
                    var dwellTimeData = fs.readFileSync(path.join(userJsonDataPath, v), 'UTF-8')
                    var jsonData = JSON.parse(dwellTimeData)
                    for (prop in jsonData) {
                        if (prop != 'total') {
                            for (p in jsonData[prop]) {
                                jsonData[prop][p].forEach((vv, ii, aa) => {
                                    var name;
                                    var key_char;
                                    if (p == '--Minus') {
                                        name = 'Minus'
                                        key_char = '-'
                                    } else {
                                        name = p.split('-')[0]
                                        key_char = p.split('-')[1]
                                    }
                                    var obj = {
                                        "p_level": prop,
                                        "key_char": key_char,
                                        "name": name,
                                        dwell_time: vv
                                    }
                                    result.push(obj)
                                })
                            }
                        }
                    }
                    fs.writeFile('./dwell_time/' + v, JSON.stringify(result), (err) => {
                        if (err) throw err;
                    })
                }
                if (v.indexOf("flight_time") != -1) {
                    var result = []
                    var flightTimeData = fs.readFileSync(path.join(userJsonDataPath, v), 'UTF-8')
                    var jsonData = JSON.parse(flightTimeData)
                    for (prop in jsonData) {
                        if (prop != 'total') {
                            for (flightType in jsonData[prop]) {
                                for (keyCombo in jsonData[prop][flightType]) {
                                    jsonData[prop][flightType][keyCombo]["FlightTime"].forEach((vv, ii, aa) => {

                                        var obj = {
                                            "keyCombo": keyCombo,
                                            "From": jsonData[prop][flightType][keyCombo]["From"],
                                            "To": jsonData[prop][flightType][keyCombo]["To"],
                                            flight_time: vv,
                                            flight_type: flightType,
                                            "p_level": prop
                                        }
                                        result.push(obj)
                                    })
                                }
                            }
                        }
                    }
                    fs.writeFile('./flight_time/' + v, JSON.stringify(result), (err) => {
                        if (err) throw err;
                    })
                }
            })
        }
    })
})