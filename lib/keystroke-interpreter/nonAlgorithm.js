module.exports = {

    /************************************************************************
     * FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILL  *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/

    sort: (arr) => {
        arr.sort((a, b) => {
            return a.timeStamp - b.timeStamp;
        });
        return arr;
    },

    /************************************************************************
     * FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILL  *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/

    key_count_of_type: (data, key) => {
        var result = {
            "total": 0
        };
        for (pX in data) { //runs for each page eg.p1, p2, p3...
            result[pX] = {
                "total": 0
            };
            var keys = data[pX].KeyEvents;
            keys.forEach((val, index, arr) => { //runs for each data set on page. eg. p1-a, p1-b...
                if (val.type == 'keydown' && val.which == key) {
                    result[pX].total++;
                    result.total++;
                }
            });
        }
        return result;
    },

    /************************************************************************
     * FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILL  *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/

    speed: (data) => {
        var result = {
            'words_per_minute': 0
        };
        for (pX in data) {
            result[pX] = {
                'words_per_minute': 0
            }
            var keys = data[pX].KeyEvents;
            keys.forEach((val, index, arr) => {
                result[pX][pX + '_' + index + '_words'] = 0;

                var lastTimeStamp = 0;

                val.forEach((v, i, a) => {
                    if (v.type == 'keydown' && v.which == 32) {
                        //console.log(v.localTimeStamp - lastTimeStamp);
                        //console.log(v.localTimeStamp);
                        lastTimeStamp = v.localTimeStamp;
                        result[pX][pX + '_' + index + '_words'] += 1;
                    }
                });
            });
        }
        return result;
    },

    /************************************************************************
     * FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILLER FILL  *
     * @param  {Array} data  An array of JSON KeyStroke Data Files          *
     * @return {void}       void;                                           *
     ************************************************************************/

    overLap: (data) => {
        
    }
}