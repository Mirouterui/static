if (localStorage.getItem("darkMode") == "true") {
    lightmode = "dark"
} else {
    lightmode = "auto"
}
var xdata = [];
var download_traffic_data = [];
var upload_traffic_data = [];
var cpu_data = [];
var cputp_data = [];
var mem_data = [];
var upspeed_data = [];
var downspeed_data = [];
var devicenum_data = [];
var classification = "day";

function purgedata() {
    xdata = [];
    cpu_data = [];
    cputp_data = [];
    mem_data = [];
    upspeed_data = [];
    downspeed_data = [];
    devicenum_data = [];
}
var traffic_chart = document.getElementById("traffic-chart");
var TrafficChart = echarts.init(traffic_chart, lightmode);
var status_chart = document.getElementById("status-chart");
var StatusChart = echarts.init(status_chart, lightmode);
var speed_chart = document.getElementById("speed-chart");
var SpeedChart = echarts.init(speed_chart, lightmode);
var devicenum_chart = document.getElementById("devicenum-chart");
var Devicenumchart = echarts.init(devicenum_chart, lightmode);

function updateStatus() {
    purgedata()
    $.get(host + '/_api/getrouterhistory?routernum=' + routernum, function(data) {
        if (data.code != 0) {
            mdui.snackbar({
                message: "请求失败：" + data.msg
            })
            return
        }
        history_data = data.history
        for (var i = 0; i < history_data.length; i++) {
            time = new Date(history_data[i].CreatedAt).toLocaleString();
            cpuload = history_data[i].Cpu.toFixed(2)
            cpu_tp = history_data[i].Cpu_tp
            memusage = history_data[i].Mem.toFixed(2)
            upspeed = history_data[i].UpSpeed
            downspeed = history_data[i].DownSpeed
            uptotal = history_data[i].UpTotal.toFixed(2)
            downtotal = history_data[i].DownTotal.toFixed(2)
            devicenum = history_data[i].DeviceNum
            xdata.push(time)
            cpu_data.push(cpuload)
            cputp_data.push(cpu_tp)
            mem_data.push(memusage)
            upspeed_data.push((upspeed / 1024 / 1024).toFixed(2))
            downspeed_data.push((downspeed / 1024 / 1024).toFixed(2))
            upload_traffic_data.push(togb(uptotal))
            download_traffic_data.push(togb(downtotal))
            devicenum_data.push(devicenum)
        }

        drawstatusChart();
        drawspeedChart();
        drawTrafficChart();
        devicenumChart();
    });
}


function get_router_name() {
    $.get(host + '/' + routernum + '/api/xqsystem/router_name', function(data) {
        if (data.code === 0) {
            router_name = data.routerName
            $("#router_name").text(router_name)
        }
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

$(function() {
    // 初次加载状态
    get_appconfig();
    get_router_name();
    updateStatus();
    // 每5秒刷新状态
    // setInterval(function() {
    //     updateStatus();
    // }, 5000);
});


function pushuptrafficdata(name, value) {
    data = {
        value: value,
        name: name
    }
    upload_traffic_data.push(data);

}

function pushdowntrafficdata(name, value) {
    data = {
        value: value,
        name: name
    }
    download_traffic_data.push(data);

}

// 定义所有图表的实例数组
echarts.connect([StatusChart, SpeedChart, Devicenumchart]);

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

function drawstatusChart() {
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
            data: xdata
        },
        yAxis: {
            type: "value",
            name: "（%）",
        },
        dataZoom: [{
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'none'
        }],
        series: [{
                name: "CPU",
                type: "line",
                data: cpu_data,
            },
            {
                name: "内存",
                type: "line",
                data: mem_data,
            },
            {
                name: "CPU温度(°C)",
                type: "line",
                data: cputp_data,
            },
        ],
    };
    // 设置图表的配置项和数据
    StatusChart.setOption(option);
}

function drawspeedChart() {
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
            data: xdata
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
                data: upspeed_data,
            },
            {
                name: "下载速度",
                type: "line",
                data: downspeed_data,
            },
        ],
    };
    // 设置图表的配置项和数据
    SpeedChart.setOption(option);
}

function devicenumChart() {
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
            data: xdata
        },
        yAxis: {
            type: "value",
            name: "（个）",
        },
        dataZoom: [{
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'none'
        }],
        series: [{
            name: "已连接设备数量",
            type: "line",
            data: devicenum_data,
        }],
    };
    // 设置图表的配置项和数据
    Devicenumchart.setOption(option);
}

window.addEventListener('resize', function() {
    TrafficChart.resize();
    StatusChart.resize();
    SpeedChart.resize();
    Devicenumchart.resize();
});
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
})