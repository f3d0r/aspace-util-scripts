var fs = require('fs')
var request = require('request')
var csv = require('csvtojson')

const csvFilePath = './systems.csv'

execute();

async function execute() {
    const jsonArray = await csv().fromFile(csvFilePath);
    console.log("Analyzing " + jsonArray.length + " GBFS systems.")
    var output = {};

    var reqs = []
    for (var index = 0; index < jsonArray.length; index++) {
        var url = jsonArray[index]["Auto-Discovery URL"]
        reqs.push(getJSON(url))
    }
    var responses = await Promise.all(reqs);

    for (var index = 0; index < jsonArray.length; index++) {
        var dataReturn = responses[index]
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
            var systemName = jsonArray[index]["Name"]
            output[systemName] = {}
            output[systemName].id = systemInfo.data.system_id
            output[systemName].region = jsonArray[index]["Country Code"]
            output[systemName].stationStatusURL = stationStatusURL[0].url;
            output[systemName].systemInfoURL = systemInfoURL[0].url;
            output[systemName].stationInfoURL = stationInfoURL[0].url;
            console.log("URL #" + (index + 1) + "/" + jsonArray.length + " COMPLETED: " + systemName);
        }
    }
    fs.writeFile('gbfs_system_info_urls.json', JSON.stringify(output), function (err) {
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