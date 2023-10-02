var download_traffic_data = [];
var upload_traffic_data = [];
var cpu_data = [];
var mem_data = [];
var upspeed_data = [];
var downspeed_data = [];
var data_num = 0;
if (localStorage.getItem("darkMode") == "true") {
    lightmode = "dark"
} else {
    lightmode = "auto"
}
var traffic_chart = document.getElementById("traffic-chart");
var TrafficChart = echarts.init(traffic_chart, lightmode);
var status_chart = document.getElementById("status-chart");
var StatusChart = echarts.init(status_chart, lightmode);
var speed_chart = document.getElementById("speed-chart");
var SpeedChart = echarts.init(speed_chart, lightmode);

function updateStatus() {
    $.get(host + "/" + routernum + '/api/misystem/status', function(data) {
        upspeed = convertSpeed(data.wan.upspeed)
        maxuploadspeed = convertSpeed(data.wan.maxuploadspeed)
        downspeed = convertSpeed(data.wan.downspeed)
        maxdownloadspeed = convertSpeed(data.wan.maxdownloadspeed)
        uploadtotal = convertbytes(data.wan.upload)
        downloadtotal = convertbytes(data.wan.download)
        cpuload = (data.cpu.load * 100).toFixed(2)
        cpucore = data.cpu.core
        cpufreq = data.cpu.hz
        memusage = (data.mem.usage * 100).toFixed(2)
        memtotal = data.mem.total
        memfreq = data.mem.hz
        memtype = data.mem.type
        $('#platform').text("小米路由器" + data.hardware.platform);
        $('#mac').text(data.hardware.mac);
        $('#sncode').text(data.hardware.sn);
        $('#system-version').text(data.hardware.channel + "/" + data.hardware.version);
        $('#cpu-used .mdui-progress-determinate').css('width', cpuload + '%');
        $('#cpu-used-text').text(cpuload + '%');
        $('#mem-used .mdui-progress-determinate').css('width', memusage + '%');
        $('#mem-used-text').text(memusage + '%');
        $('#uploadspeed').text(upspeed)
        $('#maxuploadspeed').text(maxuploadspeed)
        $('#downloadspeed').text(downspeed)
        $('#maxdownloadspeed').text(maxdownloadspeed)
        $('#uploadtotal').text(uploadtotal)
        $('#downloadtotal').text(downloadtotal)
        $("#cpu_core").text(cpucore)
        $("#cpu_freq").text(cpufreq)
        $("#mem_total").text(memtotal)
        $("#mem_freq").text(memfreq)
        $("#mem_type").text(memtype)
        pushdata(data.dev)
        addData(cpu_data, cpuload)
        addData(mem_data, memusage)
        addData(upspeed_data, (data.wan.upspeed / 1024 / 1024).toFixed(2))
        addData(downspeed_data, (data.wan.downspeed / 1024 / 1024).toFixed(2))
        data_num += 1;
        drawstatusChart();
        drawspeedChart();
    });
}

function check_internet_connect() {
    $.get(host + "/" + routernum + '/api/xqsystem/internet_connect', function(data) {
        if (data.connect === 1) {
            mdui.snackbar({
                message: '路由器好像没联网呢😢'
            });

        }
    });
}

function get_router_name() {
    $.get(host + "/" + routernum + '/api/xqsystem/router_name', function(data) {
        if (data.code === 0) {
            router_name = data.routerName
            $("#router_name").text(router_name)
        }
    });
}

function get_fac_info() {
    $.get(host + "/" + routernum + '/api/xqsystem/fac_info', function(data) {

        router_name = data.routerName
        $("#isinit").text(boolTostring(data.init))
        $("#is4kblock").text(boolTostring(data["4kblock"]))
            // $("#issecboot").text(boolTostring(data.secboot))
        $("#isuart").text(boolTostring(data.uart))
        $("#isfacmode").text(boolTostring(data.facmode))
        $("#isssh").text(boolTostring(data.ssh))
        $("#istelnet").text(boolTostring(data.telnet))
        $("#wl0_ssid").text(data.wl0_ssid)
        $("#wl1_ssid").text(data.wl1_ssid)

    });
}

$(function() {
    // 初次加载状态
    updateStatus();
    check_internet_connect();
    get_router_name();
    get_fac_info();
    // 每5秒刷新状态
    setInterval(function() {
        updateStatus();
    }, 5000);
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
            trigger: 'item',
            confine: true
        },
        series: [{
                name: '上传流量(GB)',
                type: 'pie',
                radius: '50%',
                center: ['25%', '50%'],
                data: upload_traffic_data,
            },
            {
                name: '下载流量(GB)',
                type: 'pie',
                radius: '50%',
                center: ['75%', '50%'],
                data: download_traffic_data,
            }
        ],
    };
    // 设置图表的配置项和数据
    TrafficChart.setOption(option);
    //清空数据
    upload_traffic_data = [];
    download_traffic_data = [];
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
            data: cpu_data.map(function(item, index) {
                var data_offset = 0;
                if (data_num > 60) {
                    data_offset = data_num - 60;
                }
                return (index + data_offset + 1) * 5 + "s"; // 返回请求次数作为横坐标
            }),
        },
        yAxis: {
            type: "value",
            name: "占用（%）",
        },
        series: [{
                name: "CPU",
                type: "line",
                data: cpu_data, // 返回网络速度（MB/s）作为纵坐标
            },
            {
                name: "内存",
                type: "line",
                data: mem_data, // 返回网络速度（MB/s）作为纵坐标
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
            data: downspeed_data.map(function(item, index) {
                var data_offset = 0;
                if (data_num > 60) {
                    data_offset = data_num - 60;
                }
                return (index + data_offset + 1) * 5 + "s"; // 返回请求次数作为横坐标
            }),
        },
        yAxis: {
            type: "value",
            name: "网络速度（MB/s）",
        },
        series: [{
                name: "上传速度",
                type: "line",
                data: upspeed_data, // 返回网络速度（MB/s）作为纵坐标
            },
            {
                name: "下载速度",
                type: "line",
                data: downspeed_data, // 返回网络速度（MB/s）作为纵坐标
            },
        ],
    };
    // 设置图表的配置项和数据
    SpeedChart.setOption(option);
}
window.addEventListener('resize', function() {
    TrafficChart.resize();
    StatusChart.resize();
    SpeedChart.resize();
});