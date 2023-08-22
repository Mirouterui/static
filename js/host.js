$(document).ready(function() {
    var host = document.cookie.split('; ').find(row => row.startsWith('host=')).split('=')[1];
    var url = new URL(host);
    $('#ip').val(url.hostname);
    $('#port').val(url.port);
});
$('#Form').submit(function(event) {
    event.preventDefault();
    var ip = $('#ip').val();
    var port = $('#port').val();
    document.cookie = "host=" + "http://" + ip + ":" + port + "; path=/";
    window.location.href = "/";
});