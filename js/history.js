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
    $.get(host + '/_api/gethistory?routernum=' + routernum, function(data) {
        for (var i = 0; i < data.length; i++) {
            time = new Date(data[i].CreatedAt).toLocaleString();
            cpuload = data[i].Cpu
            cpu_tp = data[i].Cpu_tp
            memusage = data[i].Mem
            upspeed = data[i].UpSpeed
            downspeed = data[i].DownSpeed
            uptotal = data[i].UpTotal
            downtotal = data[i].DownTotal
            devicenum = data[i].DeviceNum
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
        drawtrafficChart();
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


function pushdata(dev) {
    //遍历dev数组，创建表格内容行
    for (var i = 0; i < dev.length; i++) {
        //获取当前设备对象
        var device = dev[i];
        pushuptrafficdata(device.devname, togb(device.upload));
        pushdowntrafficdata(device.devname, togb(device.download));
    }
    drawtrafficChart();

}

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

function drawtrafficChart() {
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
            name: "（GB）",
        },
        dataZoom: [{
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'none'
        }],
        series: [{
                name: "上传",
                type: "line",
                data: upload_traffic_data, // 返回网络速度（MB/s）作为纵坐标
            },
            {
                name: "下载",
                type: "line",
                data: download_traffic_data, // 返回网络速度（MB/s）作为纵坐标
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
            name: "（MB/s）",
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