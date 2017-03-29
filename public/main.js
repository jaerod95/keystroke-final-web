$(document).ready(function () {
    $('#syncButton').on('click', function () {
        setTimeout(checkSyncStatus, 3000);
        $.ajax({
            url: "/api/v1/download-database",
            type: "post",
            success: function (err, data) {
                console.log(data);
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    document.getElementById('getDataButton').addEventListener('click', function (e) {
        console.log('button clicked');
        window.open('/api/v1/get-raw-data');
    });

    function checkSyncStatus() {
        $.getJSON('/api/v1/sync-status', function(data) {
            if (data.sync) {
                $('#syncStatus').css('background', 'green')
            }
            else {
                $('#syncStatus').css('background', 'red');
            }
        });

        $.getJSON('/api/v1/analysis-status', function(data2) {
            if (data2.status) {
                $('#algorithmStatus').css('background', 'green')
            } else {
                $('#algorithmStatus').css('background', 'red');
            }
        });
    }

    $('#runAlgorithms').on('click', function () {
        setTimeout(checkSyncStatus, 3000);
        $.ajax({
            url: "/api/v1/run-algorithm",
            type: "post",
            success: function (err, data) {
                console.log(data);
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    $('#getAlgorithm').on('click', function () {
        window.open('/api/v1/get-result-data');
    });


    checkSyncStatus();
    setInterval(checkSyncStatus, 30000);

});
