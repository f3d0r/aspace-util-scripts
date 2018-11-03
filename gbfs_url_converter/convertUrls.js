var fs = require('fs')
var request = require('request')
var csv = require('csvtojson')

const csvFilePath = './systems.csv'

execute();

async function execute() {
    const jsonArray = await csv().fromFile(csvFilePath);
    console.log(jsonArray.length)
    var output = {};
    for (var index = 0; index < jsonArray.length; index++) {
        var url = jsonArray[index]["Auto-Discovery URL"]
        var dataReturn = await getJSON(url);
        var stationStatusURL = undefined;
        var systemInfoURL = undefined;
        var stationInfoURL = undefined;
        if (typeof dataReturn != 'undefined' && typeof dataReturn.data != 'undefined' && typeof dataReturn.data.en != 'undefined') {
            stationStatusURL = dataReturn.data.en.feeds.filter(feed => feed.name == "station_status")
            systemInfoURL = dataReturn.data.en.feeds.filter(feed => feed.name == "system_information")
            stationInfoURL = dataReturn.data.en.feeds.filter(feed => feed.name == "station_information")
        } else {
            stationStatusURL = dataReturn.data.feeds.filter(feed => feed.name == "station_status")
            systemInfoURL = dataReturn.data.feeds.filter(feed => feed.name == "system_information")
            stationInfoURL = dataReturn.data.feeds.filter(feed => feed.name == "station_information")
        }
        if (stationStatusURL.length != 1 || stationInfoURL.length != 1 || systemInfoURL.length != 1) {
            throw new Error("Missing or too many URLs for System: " + jsonArray[index]["Name"])
        } else {
            var systemInfo = await getJSON(systemInfoURL[0].url);
            output[systemInfo.data.name] = {}
            output[systemInfo.data.name].id = systemInfo.data.system_id
            output[systemInfo.data.name].region = jsonArray[index]["Country Code"]
            output[systemInfo.data.name].stationStatusURL = stationStatusURL[0].url;
            output[systemInfo.data.name].systemInfoURL = systemInfoURL[0].url;
            output[systemInfo.data.name].stationInfoURL = stationInfoURL[0].url;
            console.log("URL #" + (index + 1) + "/" + jsonArray.length + " COMPLETED: " + url);
        }
    }
    fs.writeFile('gbfs_system_info_urls.js', JSON.stringify(output), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function getJSON(url) {
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'GET',
            url: url,
            timeout: 30000,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                resolve(body)
            }
        });
    });
}