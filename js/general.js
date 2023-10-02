//重定向到http
var protocol = location.protocol;
if (protocol === "https:") {
    location.href = "http://" + location.host + location.pathname;
}
//处理host
let host = "";
if (document.cookie.indexOf("host") >= 0) {
    let cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split("=");
        if (cookie[0] === "host") {
            host = cookie[1];
            break;
        }
    }
}
//处理routernum
let routernum = "0";
if (document.cookie.indexOf("routernum") >= 0) {
    let cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split("=");
        if (cookie[0] === "routernum") {
            routernum = cookie[1];
            break;
        }
    }
}
//跳转
if (window.location.host == 'mrui.hzchu.top:8880' && !host && window.location.pathname !== '/host/index.html') {
    window.location.href = '/host/index.html';
}


// 接受数字，输出速度（MB/s）
function convertSpeed(bytesPerSecond) {
    bytesPerSecond = parseFloat(bytesPerSecond);
    var units = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
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
    var units = ["B", "KB", "MB", "GB", "TB"];
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