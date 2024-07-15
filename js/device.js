var queryString = window.location.search;
queryString = queryString.substring(1);
var queryArray = queryString.split("=");
// 获取MAC地址
var mac = queryArray[1];
if (mac) {
    $('#mac').text(mac);
} else {
    mdui.snackbar({
        message: '没有MAC地址😅'
    });
}
var upspeed_data = [];
var downspeed_data = [];
var upload_traffic_data = [];
var download_traffic_data = [];
var data_num = 0;
if (localStorage.getItem("darkMode") == "true") {
    lightmode = "dark"
} else {
    lightmode = "auto"
}
var speed_chart = document.getElementById("speed-chart");
var SpeedChart = echarts.init(speed_chart, lightmode);
var traffic_chart = document.getElementById("traffic-chart");
var TrafficChart = echarts.init(traffic_chart, lightmode);

function updateStatus() {
    $.get(host + '/' + routernum + '/api/misystem/status', function(data) {
        if (data.code != 0) {
            mdui.snackbar({
                message: "请求失败：" + data.msg
            })
            return
        }
        var match
        dev = data.dev
        for (var i = 0; i < dev.length; i++) {
            //获取当前设备对象
            var device = dev[i];
            if (device.mac == mac) {
                upspeed = convertSpeed(device.upspeed)
                maxuploadspeed = convertSpeed(device.maxuploadspeed)
                downspeed = convertSpeed(device.downspeed)
                maxdownloadspeed = convertSpeed(device.maxdownloadspeed)
                uploadtotal = convertbytes(device.upload)
                downloadtotal = convertbytes(device.download)
                onlinetime = convertSeconds(device.online)
                $('#uploadspeed').text(upspeed)
                $('#maxuploadspeed').text(maxuploadspeed)
                $('#downloadspeed').text(downspeed)
                $('#maxdownloadspeed').text(maxdownloadspeed)
                $('#uploadtotal').text(uploadtotal)
                $('#downloadtotal').text(downloadtotal)
                $('#onlinetime').text(onlinetime)
                var upspeed = convertSize(device.upspeed,speedUnit)
                var downspeed = convertSize(device.downspeed,speedUnit)
                var uploadtotal = convertSize(device.upload,trafficUnit);
                var downloadtotal = convertSize(device.download,trafficUnit);
                addData(upspeed_data, upspeed)
                addData(downspeed_data, downspeed)
                addData(upload_traffic_data, uploadtotal)
                addData(download_traffic_data, downloadtotal)
                    // 调用drawChart函数，绘制图表
                SpeedChart.showLoading();
                TrafficChart.showLoading();
                drawspeedChart();
                drawtrafficChart();
                data_num += 1
                var match = true
            }
        }
        if (match != true) {
            mdui.snackbar({
                message: '该设备（如智能插座）不支持此功能😢'
            });
        }
    });
}

function getDeviceInfo() {
    $.get(host + '/' + routernum + '/api/misystem/devicelist', function(data) {
        if (data.code != 0) {
            mdui.snackbar({
                message: "请求失败：" + data.msg
            })
            return
        }
        dev = data.list
        for (var i = 0; i < dev.length; i++) {
            //获取当前设备对象
            var device = dev[i];
            if (device.mac == mac) {
                if (device.icon != "") {
                    iconurl = "/img/" + device.icon
                } else {
                    iconurl = "/img/device_list_unknow.png"
                }
                ips = moreipdisplay(device.ip)
                $("#devicename").text(device.name);
                $("#deviceicon").attr("src", iconurl);
                $("#device_oname").text(device.oname);
                $("#ipaddress").text(ips);
                $("#authority_wan").text(getbooleantype(device.authority.wan));
                $("#authority_lan").text(getbooleantype(device.authority.lan));
                $("#authority_admin").text(getbooleantype(device.authority.admin));
                $("#authority_pridisk").text(getbooleantype(device.authority.pridisk));
                $("#connecttype").text(getConnectType(device.type));
                $("#isap").text(getbooleantype(device.isap));
                $("#isonline").text(getbooleantype(device.online));

                var match = true
                if (device.mac == data.mac) {
                    $("#devicename").text($("#devicename").text() + " (页面所在地)");
                }
                console.log(device)
            }
        }
        if (match != true) {
            mdui.snackbar({
                message: '好像没有这个设备呢😢'
            });
        }


    });
}

function drawspeedChart() {
    // 定义图表的配置项和数据
    var option = {
        backgroundColor: '',
        tooltip: {
            trigger: "axis",
        },
        xAxis: {
            type: "category",
            data: upspeed_data.map(function(item, index) {
                var data_offset = 0;
                if (data_num > 60) {
                    data_offset = data_num - 60;
                }
                return (index + data_offset + 1) * 5 + "s"; // 返回请求次数作为横坐标
            }),
        },
        yAxis: {
            type: "value",
            name: "网络速度（"+speedUnit+"）",
        },
        legend: {
            orient: 'vertical',
            left: 'right'
        },
        series: [{
                name: "上传速度（"+speedUnit+"）",
                type: "line",
                data: upspeed_data, 
            },
            {
                name: "下载速度（"+speedUnit+"）",
                type: "line",
                data: downspeed_data, 
            },
        ],
    };
    // 设置图表的配置项和数据
    SpeedChart.hideLoading();
    SpeedChart.setOption(option);
}

function drawtrafficChart() {
    // 定义图表的配置项和数据
    var option = {
        backgroundColor: '',
        tooltip: {
            trigger: "axis",
        },
        xAxis: {
            type: "category",
            data: upload_traffic_data.map(function(item, index) {
                var data_offset = 0;
                if (data_num > 60) {
                    data_offset = data_num - 60;
                }
                return (index + data_offset + 1) * 5 + "s"; // 返回请求次数作为横坐标
            }),
        },
        legend: {
            orient: 'vertical',
            left: 'right'
        },
        yAxis: {
            type: "value",
            name: "上传/下载（"+trafficUnit+"）",
        },
        series: [{
                name: "上传总量（"+trafficUnit+"）",
                type: "line",
                data: upload_traffic_data, 
            },
            {
                name: "下载总量（"+trafficUnit+"）",
                type: "line",
                data: download_traffic_data, 
            },
        ],
    };
    // 设置图表的配置项和数据
    TrafficChart.hideLoading();
    TrafficChart.setOption(option);
}
window.addEventListener('resize', function() {
    TrafficChart.resize();
    SpeedChart.resize();
});

function get_router_name() {
    $.get(host + '/' + routernum + '/api/xqsystem/router_name', function(data) {
        if (data.code != 0) {
            mdui.snackbar({
                message: "请求失败：" + data.msg
            })
            return
        }
        router_name = data.routerName
        $("#router_name").text(router_name)

    });
}
$(function() {
    // 初次加载状态
    showChartLoading();
    getDeviceInfo();
    get_router_name();
    updateStatus();
    // 每5秒刷新状态
    setInterval(function() {
        updateStatus();
    }, pageUpdateTime);
});

// jumptodevidehisory
function jumptodevicehisory() {
    window.location.href = "/devicehistory/index.html?mac=" + mac;
}

// 展示加载动画
function showChartLoading() {
    TrafficChart.showLoading();
    SpeedChart.showLoading();
}