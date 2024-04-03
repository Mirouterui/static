$("#spinner").hide();

function getBackVersion() {
    $.get(host + '/_api/getconfig', function(data) {
        $('#backversion').text(data.ver)
    });
}

function checkUpdate() {
    $("#update-info").text("正在检查更新...");
    $("#checkUpdate-button").attr("disabled", true);
    $("#spinner").show();
    $.get("https://mrui-api.hzchu.top/checkupdate", function(data) {
        var frontversion = data.frontversion;
        var backversion = data.backversion;
        var versioninfo = ""
            // 检查document.getElementById("frontversion")是否一致
        if ($("#frontversion").text() != frontversion) {
            versioninfo += "前端版本有更新，版本号：" + frontversion + "<br>";
        }
        if ($("#backversion").text() == "Docker") {
            versioninfo += "当前为Docker环境，无法检查后端更新<br>";
            $("#flushFront-button").attr("disabled", false);
        } else if ($("#backversion").text() != backversion) {
            versioninfo += "后端版本有更新，版本号：" + backversion + "<br>";
        }
        if ($("#frontversion").text() == frontversion && $("#backversion").text() == backversion) {
            versioninfo += "未检测到更新(●'◡'●)<br>";
        }
        $("#update-info").html(versioninfo);
        $("#checkUpdate-button").attr("disabled", false);
        $("#spinner").hide();
    })

}

function flushFront() {
    $("#spinner").show();
    $("#flushFront-button").attr("disabled", true);
    $.get(host + '/_api/flushstatic', function(data) {
        if (data.code == 0) {
            mdui.snackbar({
                message: "更新成功"
            })
        } else if (data.msg) {
            mdui.snackbar({
                message: data.msg
            });
        } else {
            mdui.snackbar({
                message: data.message
            });
        }
        $("#spinner").hide();
        $("#flushFront-button").attr("disabled", false);
        // 5秒后刷新
        setTimeout(function() {
            location.reload();
        }, 5000);
    })
}
$(function() {
    getBackVersion();
});