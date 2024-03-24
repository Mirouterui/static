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
var classification = "day";

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

function purgedata() {
    xdata = [];
    upspeed_data = [];
    downspeed_data = [];
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

function updateStatus() {
    purgedata()
    $.get(host + '/_api/getdevicehistory?devicemac=' + mac, function(data) {
        if (data.code != 0) {
            mdui.snackbar({
                message: "请求失败：" + data.msg
            })
            return
        }
        history_data = data.history
        for (var i = 0; i < history_data.length; i++) {
            time = new Date(history_data[i].CreatedAt).toLocaleString();
            upspeed = history_data[i].UpSpeed
            downspeed = history_data[i].DownSpeed
            uptotal = history_data[i].UpTotal.toFixed(2)
            downtotal = history_data[i].DownTotal.toFixed(2)
            xdata.push(time)
            upspeed_data.push((upspeed / 1024 / 1024).toFixed(2))
            downspeed_data.push((downspeed / 1024 / 1024).toFixed(2))
            upload_traffic_data.push(togb(uptotal))
            download_traffic_data.push(togb(downtotal))
        }
        drawspeedChart();
        drawTrafficChart();
    });
}
function get_appconfig() {
    $.get(host + '/_api/getconfig', function(data) {
        maxsaved = data.history.maxsaved;
        databasepath = data.history.databasepath;
        sampletime = data.history.sampletime;
        $("#maxsaved").text(maxsaved);
        $("#databasepath").text(databasepath);
        $("#sampletime").text(sampletime);
        // 计算时间跨度
        timespan = convertSeconds(parseInt(sampletime) * parseInt(maxsaved));
        $("#timespan").text(timespan);
    });
}

function drawTrafficChart() {
    let {result_list: upload_traffic_data_processed, xdata: xdata_processed} = processTrafficData(xdata, upload_traffic_data, classification);
    let download_traffic_data_processed = processTrafficData(xdata, download_traffic_data, classification).result_list;
    // 定义图表的配置项和数据
    var option = {
        backgroundColor: '',
        tooltip: {
            trigger: "axis",
        },
        legend: {
            orient: 'vertical',
            left: 'right'
        },
        xAxis: {
            type: "category",
            data: xdata_processed
        },
        yAxis: {
            type: "value",
            name: "（GiB）",
        },
        dataZoom: [{
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'none'
        }],
        series: [{
                name: "上传",
                type: "bar",
                data: upload_traffic_data_processed, // 返回网络速度（MiB/s）作为纵坐标
            },
            {
                name: "下载",
                type: "bar",
                data: download_traffic_data_processed, // 返回网络速度（MiB/s）作为纵坐标
            }
        ],
    };
    TrafficChart.setOption(option);
}
function drawspeedChart() {
    let {result_list: upspeed_data_processed, xdata: xdata_processed} = processTrafficData(xdata, upspeed_data, classification);
    let downspeed_data_processed = processTrafficData(xdata, downspeed_data, classification).result_list;
    // 定义图表的配置项和数据
    var option = {
        backgroundColor: '',
        tooltip: {
            trigger: "axis",
        },
        legend: {
            orient: 'vertical',
            left: 'right'
        },
        xAxis: {
            type: "category",
            data: xdata_processed
        },
        yAxis: {
            type: "value",
            name: "（MiB/s）",
        },
        dataZoom: [{
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'none'
        }],
        series: [{
                name: "上传速度",
                type: "line",
                data: upspeed_data_processed,
            },
            {
                name: "下载速度",
                type: "line",
                data: downspeed_data_processed,
            },
        ],
    };
    // 设置图表的配置项和数据
    SpeedChart.setOption(option);
}

function processTrafficData(timeArray, dataArray, classification) {
    let data = {};
    for(let i = 0; i < timeArray.length; i++) {
        let date = new Date(timeArray[i]);
        let key;
        switch(classification) {
            case 'day':
                key = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
                break;
            case 'hour':
                key = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:00`;
                break;
            case 'min':
                key = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
                break;
            default:
                console.log('Invalid classification');
                return;
        }
        if(!data[key]) {
            data[key] = [];
        }
        data[key].push(dataArray[i]);
    }
    let result = {};
    for(let key in data) {
        result[key] = sumDiffs(data[key]);
    }
    let xdata = Object.keys(result);
    let result_list = Object.values(result);
    return {result_list, xdata};
}


function sumDiffs(arr) {
    let sum = 0;
    while (arr.length > 0) {
        let subArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (i === arr.length - 1 || arr[i] > arr[i + 1]) {
                subArr.push(arr[i]);
                if (subArr.length > 1) {
                    sum += subArr[subArr.length - 1] - subArr[0];
                }
                arr = arr.slice(i + 1);
                break;
            } else {
                subArr.push(arr[i]);
            }
        }
    }
    return sum;
}

// 监听data-fit-time-select变化
$('#data-fit-time-select').on('change', function() {
    let value = $(this).val();
    switch(value) {
        case '1':
            classification = 'day';
            break;
        case '2':
            classification = 'hour';
            break;
        case '3':
            classification = 'min';
            break;
        default:
            console.log('Invalid value');
            break;
    }
    drawTrafficChart();
    drawspeedChart();
})



























window.addEventListener('resize', function() {
    TrafficChart.resize();
    SpeedChart.resize();
});

$(function() {
    // 初次加载状态
    get_appconfig();
    updateStatus();
    getDeviceInfo();
    // 每30秒刷新状态
    setInterval(function() {
        updateStatus();
    }, 30000);
});

// jumptodevidehisory
function jumptodeviceinfo() {
    window.location.href = "/device/index.html?mac=" + mac;
}