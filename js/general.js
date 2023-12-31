//重定向到http
var protocol = location.protocol;
if (protocol === "https:") {
    location.href = "http://" + location.host + location.pathname;
}
//处理host
let host = localStorage.getItem("host") || "";
//处理routernum
let routernum = localStorage.getItem("routernum") || "0";

//跳转
if (window.location.host == 'mrui.hzchu.top:8880' && !host && window.location.pathname !== '/host/index.html') {
    window.location.href = '/host/index.html';
}


// 接受数字，输出速度（MiB/s）
function convertSpeed(bytesPerSecond) {
    bytesPerSecond = parseFloat(bytesPerSecond);
    var units = ["B/s", "KiB/s", "MiB/s", "GiB/s", "TiB/s"];
    var speed = bytesPerSecond;
    var index = 0;
    while (speed >= 1024 && index < units.length - 1) {
        speed = speed / 1024;
        index++;
    }
    //保留两位小数
    return speed.toFixed(2) + " " + units[index];
}

function convertbytes(bytes, mode) {
    bytes = parseFloat(bytes);
    var units = ["B", "KiB", "MiB", "GiB", "TiB"];
    var speed = bytes;
    var index = 0;
    while (speed >= 1024 && index < units.length - 1) {
        speed = speed / 1024;
        index++;
    }
    if (mode === 1) {
        return speed.toFixed(3);
    } else {
        return speed.toFixed(3) + " " + units[index];
    }
}

function togb(num) {
    return (num / 1024 / 1024 / 1024).toFixed(2)
}

function roundToOneDecimal(num) {
    // 保留一位小数
    return num.toFixed(1);
}

function convertSeconds(seconds) {
    const SECONDS_IN_MINUTE = 60;
    const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
    const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;

    let result = "";

    if (seconds >= SECONDS_IN_DAY) {
        let days = Math.floor(seconds / SECONDS_IN_DAY);
        result += days + "天";
        seconds -= days * SECONDS_IN_DAY;
    }

    if (seconds >= SECONDS_IN_HOUR) {
        let hours = Math.floor(seconds / SECONDS_IN_HOUR);
        result += hours + "小时";
        seconds -= hours * SECONDS_IN_HOUR;
    }

    if (seconds >= SECONDS_IN_MINUTE) {
        let minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
        result += minutes + "分钟";
        seconds -= minutes * SECONDS_IN_MINUTE;
    }

    if (seconds > 0) {
        result += seconds + "秒";
    }

    return result;
}

function getbooleantype(type) {
    // 0/1/2/3  有线 / 2.4G wifi / 5G wifi / guest wifi
    switch (type) {
        case 0:
            return "否";
        case 1:
            return "是";
        default:
            return "未知";
    }
}
// 转换布尔值为是/否
function boolTostring(value) {
    if (value) {
        return '是';
    } else {
        return '否';
    }
}

function getconnecttype(type) {
    // 0/1/2/3  有线 / 2.4G wifi / 5G wifi / guest wifi
    switch (type) {
        case 0:
            return "有线连接";
        case 1:
            return "2.4G wifi";
        case 2:
            return "5G wifi";
        case 3:
            return "guest wifi";
        default:
            return "未知";
    }
}

// 添加新数据到数组，并保持数组长度不超过60
function addData(dataArray, newData) {
    dataArray.push(newData);
    // 当数组长度大于60时，删除最先添加的数据
    if (dataArray.length > 60) {
        dataArray.shift();
    }
}

function moreipdisplay(ip) {
    var ips = "";
    if (ip.length == 1) {
        ips = ip[0].ip
    } else {
        for (var i = 0; i < ip.length; i++) {
            if (ip[i].active == 1) {
                ips += ip[i].ip;
                // 如果不是最后一个元素，添加逗号分隔符
                if (i < ip.length - 1) {
                    ips += ", ";
                }
            }
        }
    }
    return ips
}

function darkMode() {
    if (localStorage.getItem("darkMode") == "true") {
        localStorage.setItem("darkMode", "false");
        document.body.classList.remove("mdui-theme-layout-dark");
        document.body.classList.add("light");
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        localStorage.setItem("darkMode", "true");
        document.body.classList.remove("light");

        document.body.classList.add("mdui-theme-layout-dark");
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}
if (localStorage.getItem("darkMode") == "true") {
    document.body.classList.remove("light");
    document.body.classList.add("mdui-theme-layout-dark");
    document.documentElement.setAttribute('data-theme', 'dark');
}

function refreshToken() {
    $.get(host + '/_api/refresh', function(data) {
        if (data.code != 0) {
            mdui.snackbar({
                message: "请求失败：" + data.msg
            })
            return
        }
        mdui.snackbar({
            message: data.msg
        })

    });
}

$.ajaxSetup({
    error: function(jqXHR, textStatus, errorThrown) {
        mdui.snackbar({
            message: "发送网络请求失败：" + textStatus
        });
    }
});
