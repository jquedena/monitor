'use strict';

window.isStop = true;
window.isInit = true;
window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    /* grey: 'rgb(71, 75, 78)', */
    grey: 'rgb(201, 203, 207)',
    orangeAlpha: 'rgba(255, 159, 64, 0.2)',
    purpleAlpha: 'rgba(153, 102, 255, 0.2)',
    greenAlpha: 'rgba(75, 192, 192, 0.2)'
};
window.colors = [
    window.chartColors.red,
    window.chartColors.blue,
    window.chartColors.orange,
    window.chartColors.green,
    window.chartColors.purple,
    window.chartColors.yellow,
    window.chartColors.grey,
    window.chartColors.orangeAlpha,
    window.chartColors.purpleAlpha,
    window.chartColors.greenAlpha,
]

var createDataset = function(_label, _color, _idX, _idY) {
    return {
        type: 'line',
        label: _label,
        fill: false,
        backgroundColor: _color,
        borderColor: _color,
        pointRadius: 0,
        data: [],
        yAxisID: `y-axis-${_idY}`,
        xAxisID: `x-axis-${_idX}`
    }
}

var createYAxes = function(_label, _id) {
    return {
        display: true,
        scaleLabel: {
            display: true,
            labelString: _label,
            fontFamily: "Tahoma",
            fontStyle: "bold",
            fontSize: 12
        },
        ticks: {
            fontFamily: "Tahoma",
            fontSize: 11,
            suggestedMin: 0,
            suggestedMax: 0.25
        },
        stacked: true,
        id: `y-axis-${_id}`
    }
    /* 
        type: "linear",
        position: "left",
    */
}

var createXAxes = function(_label, _id) {
    return {
        id: `x-axis-${_id}`,
        display: true,
        scaleLabel: {
            display: true,
            labelString: _label,
            fontFamily: "Tahoma",
            fontStyle: "bold",
            fontSize: 12
        },
        ticks: {
            autoSkip: false,
            maxTicksLimit: 100,
            minRotation: 0, // 90
            maxRotation: 0, // 90
            fontFamily: "Tahoma",
            fontSize: 11,
            callback: function(value, index, values) {
                return index % 40 == 0 ? value : "";
            }
        },
        stacked: true
    }
}

var createChartConfig = function(_title, _labels, _datasets, _xAxes, _yAxes) {
    return {
        type: 'bar',
        data: {
            labels: _labels,
            datasets: _datasets
        },
        options: {
            legend: {
                display: true,
                labels: {
                    fontFamily: "Tahoma",
                    fontSize: 11
                },
                position: "top"
            },
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: _title,
                fontFamily: "Tahoma",
                fontStyle: "bold",
                fontSize: 12
            },
            tooltips: {
                enabled: true,
                mode: 'index',
                intersect: true,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: _xAxes,
                yAxes: _yAxes
            }
        }
    };
}

var dateToString = function(date) {
    var val = "";

    if($.type(date) === "string") {
        return date;
    }

    var hh = date.getHours();
    var nhh = parseInt(hh);
    var nn = date.getMinutes();
    var nnn = parseInt(nn);
    var ss = date.getSeconds();
    var nss = parseInt(ss);

    val += (nhh < 10 ? '0' : '') + hh + ":";
    val += (nnn < 10 ? '0' : '') + nn + ":";
    val += (nss < 10 ? '0' : '') + ss;

    return val; // + "." + ('000' + date.getMilliseconds()).substr(-4)
}