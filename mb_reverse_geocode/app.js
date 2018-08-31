var rp = require('request-promise');
const csv = require("csvtojson");
var accessToken = '***REMOVED***';
const csvFilePath = 'Bicycle_Parking.csv'
var fs = require('fs');
var reqsComplete = 0;

function getRequest(lng, lat) {
    var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + accessToken + '&types=address';
    return new rp(url)
        .then(function (result) {
            console.log("Request Complete: #" + reqsComplete);
            reqsComplete++;
            return JSON.parse(result).features[0].place_name;
        })
        .catch(function (err) {
            console.log("ERROR : " + err);
            process.exit(1);
        });
}

csv()
    .fromFile(csvFilePath)
    .then((bikeRacks) => {
        var reqs = [];
        var endRow = 306;
        for (var index = 0; index <= endRow; index++) {
            reqs.push(getRequest(bikeRacks[index].lng, bikeRacks[index].lat));
        }
        Promise.all(reqs)
            .then(data => {
                var output = '';
                for (var index = 0; index <= endRow; index++) {
                    output += bikeRacks[index].id + ';' + bikeRacks[index].lng + ';' + bikeRacks[index].lat + ';' + bikeRacks[index].num_spaces + ';' + data[index] + '\n'
                }
                fs.writeFile("results.csv", output, function (err) {
                    if (err) {
                        console.log("ERROR : " + err);
                        process.exit(1);
                    } else {
                        console.log("The file was saved!");
                    }
                });
            });
    })