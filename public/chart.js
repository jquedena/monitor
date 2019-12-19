'use strict';

var container = document.getElementById("chart-container-01");
var chartContainer = [];

const processUri = _uri => {
    return new Promise((resolve, reject) => {
        $.ajax(`http://localhost:3000/info?node=${_uri}`)
            .done(data => {
                try {
                    let values = {
                        "uri": _uri,
                        "Heap memory": {},
                        "Non-heap memory": {},
                        "System": {},
                        "GC": {},
                        "maxMemory": Math.ceil( Math.max(data.memoryInfo.nonHeap.max, data.memoryInfo.heap.max) /1024 /1024 /1024 ),
                        "freeMemory": Number.parseFloat( data.jmxProperties["java.lang:type=OperatingSystem"].attributes.FreePhysicalMemorySize /1024 /1024 /1024 ).toFixed(2),
                        "totalMemory": Number.parseFloat( data.jmxProperties["java.lang:type=OperatingSystem"].attributes.TotalPhysicalMemorySize /1024 /1024 /1024 ).toFixed(2)
                    }
                    /*
                    data.poolMemory.forEach(element => {
                        values[element.type][element.name] = Number.parseFloat(element.used /1024 /1024).toFixed(2);
                    });
                    */
                    values["System"]["CPU %"] = Number.parseFloat(data.jmxProperties["java.lang:type=OperatingSystem"].attributes.SystemCpuLoad).toFixed(2); 
                    values["Heap memory"]["heap (GB)"] = Number.parseFloat(data.memoryInfo.heap.committed /1024 /1024 /1024).toFixed(2); 
                    values["Heap memory"]["heap used (GB)"] = Number.parseFloat(data.memoryInfo.heap.used /1024 /1024 /1024).toFixed(2); 
                    values["Non-heap memory"]["nonHeap (GB)"] = Number.parseFloat(data.memoryInfo.nonHeap.committed /1024 /1024 /1024).toFixed(2); 
                    values["Non-heap memory"]["nonHeap used (GB)"] = Number.parseFloat(data.memoryInfo.nonHeap.used /1024 /1024 /1024).toFixed(2); 
                    
                    data.gcInfo.forEach(element => {
                        values["GC"][element.name + " (Count)"] = element.collectionCount;
                        values["GC"][element.name + " (Time)"] = element.collectionTime;
                    });

                    resolve(values);
                } catch(err) {
                    const e = {
                        textStatus: "done",
                        errorThrown: err.message,
                        responseText: JSON.stringify(data)
                    }
                    reject(e);
                }
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                const e = {
                    textStatus,
                    errorThrown,
                    responseText: jqXHR.responseText
                }
                reject(e);
            })
    });
}

const createConfigMemory = (_data, _type, _yAxesSecond) => {
    return new Promise((resolve, reject) => {
        let label = [dateToString(new Date())];
        let xAxis = [createXAxes("Hora", 1)];
        let yAxis = [createYAxes(_type, 1)];
        if(_yAxesSecond) {
            let yAxes = createYAxes(_type, 2);
            yAxes.scaleLabel.display = false;
            yAxes.position = "right";
            yAxes.gridLines = {
                drawOnChartArea: false
            }
            yAxis.push(yAxes);
        }
        let datasets = [];
        let sets = [];
        let index = 0;
        for(let prop in _data[_type]) {
            sets.push(prop);
            let dataset = createDataset(prop, window.colors[index], 1, 1);
            dataset.data.push(_data[_type][prop]);
            datasets.push(dataset);
            index++;
        }
        let options = {
            "uri": _data.uri,
            "type": _type,
            "orderFields": sets,
            "config": createChartConfig(_data.uri, label, datasets, xAxis, yAxis)
        }
        resolve(options);
    });
}

const updateInfo = () => {
    let promiseWait = [];
    chartContainer.forEach(element => {
        // console.log(element);
        promiseWait.push(processUri(element.uri).then(data => {
            return new Promise((resolve, reject) => {
                if(element.config.data.labels.length >= 200) {
                    element.config.data.labels.shift();
                }
                element.config.data.labels.push(dateToString(new Date()));
                element.config.data.datasets.forEach((dataset, index) => {
                    if(dataset.data.length >= 200) {
                        dataset.data.shift();
                    }
                    dataset.data.push(data[element.type][dataset.label]);
                });
                element.chart.update();
                resolve(element.uri);
            })
        }))
    });
    Promise.all(promiseWait).then(rows => {
        if(!window.isStop) {
            setTimeout(() => {
                updateInfo();
            }, 1000);
        }
    })
}

const agregar = (_uri) => {
    processUri(_uri) 
        .then(data => {
            agregar1(_uri, "Heap memory", data);
            agregar1(_uri, "Non-heap memory", data);
            agregar1(_uri, "System", data);
            agregar1(_uri, "GC", data);
        })
        .catch(e => {
            let div = document.getElementById("message");
            div.style.padding = "7px";
            div.innerHTML = `Estado: ${e.textStatus}<br/> Descripción: ${e.errorThrown}<br/>Respuesta: <pre>${e.responseText}</pre>`;
        });

    $("#btnIniciar").attr("disabled", false);
}

const agregar1 = (_uri, _type, _data) => {
    let div = document.createElement('div');
    let canvas = document.createElement('canvas');

    div.classList.add('chart-container');
    div.appendChild(canvas);
    container.appendChild(div);

    const yAxesSecond = (_type == "System" || _type == "GC");
    createConfigMemory(_data, _type, yAxesSecond).then(options => {        
        if(_type == "GC") {
            /*
            options.config.data.datasets[0].fill = false;
            options.config.data.datasets[1].fill = false;
            options.config.data.datasets[2].fill = false;
            options.config.data.datasets[3].fill = false;
            */

            options.config.data.datasets[1].yAxisID = "y-axis-2";
            options.config.data.datasets[3].yAxisID = "y-axis-2";
            options.config.options.scales.yAxes[0].stacked = false;
            options.config.options.scales.yAxes[1].stacked = false;
        } else if(_type == "System") {
            // options.config.options.scales.yAxes[0].ticks.suggestedMin = 0;
            // options.config.options.scales.yAxes[0].ticks.suggestedMax = 0.5;
            // options.config.options.scales.yAxes[0].ticks.min = 0;
            // options.config.options.scales.yAxes[0].ticks.max = 1.5;
            options.config.options.scales.yAxes[0].stacked = false;

            // options.config.options.scales.yAxes[1].ticks.suggestedMin = 0;
            // options.config.options.scales.yAxes[1].ticks.suggestedMax = 0.25;
            // options.config.options.scales.yAxes[1].ticks.min = 0;
            // options.config.options.scales.yAxes[1].ticks.max = _data.maxMemory;
            options.config.options.scales.yAxes[1].stacked = false;
            
            /*
            options.config.data.datasets[0].fill = false;
            options.config.data.datasets[1].fill = false;
            options.config.data.datasets[2].fill = false;
            options.config.data.datasets[3].fill = false;
            options.config.data.datasets[4].fill = false;
            
            options.config.data.datasets[1].yAxisID = "y-axis-2";
            options.config.data.datasets[2].yAxisID = "y-axis-2";
            options.config.data.datasets[3].yAxisID = "y-axis-2";
            options.config.data.datasets[4].yAxisID = "y-axis-2";
            */
        }
        console.log(options);
        let ctx = canvas.getContext('2d');
        options.chart = new Chart(ctx, options.config);
        chartContainer.push(options);
        updateInfo();
    });
}

const iniciar = () => {
    window.isStop = false;
    updateInfo();
    $("#btnIniciar").attr("disabled", true);
    $("#btnDetener").attr("disabled", false);
}

const detener = () => {
    window.isStop = true; this.disabled = true;
    $("#btnIniciar").attr("disabled", false);
    $("#btnDetener").attr("disabled", true);
}