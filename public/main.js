$(document).ready(function () {
    $('#syncButton').on('click', function () {
        $.ajax({
            url: "/api/v1/download-database",
            type: "post",
            success: function (err, data) {
                console.log(data);
            },
            error: function (err) {
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
    }


    checkSyncStatus();
    setInterval(checkSyncStatus, 30000);

});
