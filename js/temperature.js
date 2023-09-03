var mode
var warningconst = false
var cputp_data = []
var w24gtp_data = []
var w5gtp_data = []
$(document).ready(function() {
    try {
        mode = document.cookie.split('; ').find(row => row.startsWith('mode=')).split('=')[1];
    } catch (error) {
        mode = 1;
    }
    $('.mdui-select').val(mode);
    new mdui.Select('.mdui-select');
});

$('.mdui-select').change(function() {
    if ($(this).val() == 2) {
        $.get(host + '/_api/getconfig', function(data) {
            if (data.dev[routernum].routerunit == false) {
                mdui.snackbar({
                    message: '在路由器上运行并打开routerunit模式'
                });
            } else {
                document.cookie = "mode=2; path=/";
                mode = 2
            }
        });
    } else {
        document.cookie = "mode=1; path=/";
        mode = 1
    }
});

function gettp() {
    if (mode == 1) {
        $.get(host + "/" + routernum + '/api/misystem/status', function(data) {
            cputp = data.temperature
            w24gtp = 0
            w5gtp = 0
            if (cputp == 0) {
                // 虽然一刀切不好，但没办法
                if (!warningconst) {
                    mdui.snackbar({
                        message: '该设备不支持'
                    });
                }
                warningconst = true

            }
            var table = document.querySelector("table");
            var tbody = document.getElementById("tp-list");
            tbody.innerHTML = "";

            var tr = document.createElement("tr");
            var td_cputp = document.createElement("td");
            td_cputp.textContent = cputp + "°C";
            tr.appendChild(td_cputp);

            var td_w24gtp = document.createElement("td");
            td_w24gtp.textContent = "不支持";
            tr.appendChild(td_w24gtp);

            var td_w5gtp = document.createElement("td");
            td_w5gtp.textContent = "不支持";
            tr.appendChild(td_w5gtp);
            //将内容行添加到表格内容区域中
            tbody.appendChild(tr);
            table.appendChild(tbody);
            cputp_data.push(cputp)
            w24gtp_data.push(w24gtp)
            w5gtp_data.push(w5gtp)
            drawtpChart();

        });
    } else if (mode == 2) {
        $.get(host + "/" + routernum + '/_api/gettemperature', function(data) {
            if (data.code == 0) {
                cputp = data.cpu_temperature / 1000
                w24gtp = data.w24g_temperature / 1000
                w5gtp = data.w5g_temperature / 1000
                var table = document.querySelector("table");
                var tbody = document.getElementById("tp-list");
                tbody.innerHTML = "";

                var tr = document.createElement("tr");
                var td_cputp = document.createElement("td");
                td_cputp.textContent = cputp + "°C";
                tr.appendChild(td_cputp);

                var td_24gtp = document.createElement("td");
                td_24gtp.textContent = w24gtp + "°C";
                tr.appendChild(td_24gtp);

                var td_24gtp = document.createElement("td");
                td_24gtp.textContent = w5gtp + "°C";
                tr.appendChild(td_24gtp);

                //将内容行添加到表格内容区域中
                tbody.appendChild(tr);

                table.appendChild(tbody);
                cputp_data.push(cputp)
                w24gtp_data.push(w24gtp)
                w5gtp_data.push(w5gtp)
                drawtpChart();
            } else {

                mdui.snackbar({
                    message: data.msg
                });
            }

        });
    }
}

function drawtpChart() {
    // 获取div元素，用于放置图表
    var chart = document.getElementById("tp-chart");
    // 初始化echarts实例
    var myChart = echarts.init(chart);
    // 定义图表的配置项和数据
    var option = {
        tooltip: {
            trigger: "axis",
        },
        legend: {
            orient: 'vertical',
            left: 'right'
        },
        xAxis: {
            type: "category",
            data: cputp_data.map(function(item, index) {
                return (index + 1) * 5 + "s"; // 返回请求次数作为横坐标
            }),
        },
        yAxis: {
            type: "value",
            name: "温度（°C）",
        },
        series: [{
                name: "CPU",
                type: "line",
                data: cputp_data, // 返回网络速度（MB/s）作为纵坐标
            },
            {
                name: "2.4g网卡模块",
                type: "line",
                data: w24gtp_data, // 返回网络速度（MB/s）作为纵坐标
            },
            {
                name: "5g网卡模块",
                type: "line",
                data: w5gtp_data, // 返回网络速度（MB/s）作为纵坐标
            }
        ],
    };
    // 设置图表的配置项和数据
    myChart.setOption(option);
}

$(function() {
    // 初次加载状态
    gettp();
    // 每5秒刷新状态
    setInterval(function() {
        gettp();
    }, 5000);
});