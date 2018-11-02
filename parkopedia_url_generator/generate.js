var csv = require('csvtojson')
var fs = require('fs')

const csvFilePath = './zipcodes.csv'
const baseUrl = 'https://en.parkopedia.com/parking/'

execute()

var possibleStates = ["WA", "OR", "CA", "ID", "NV", "AZ", "UT", "WY", "MT", "CO", "NM", "TX", "AK", "IL", "DC", "NY"]

async function execute() {
    const zipcodes = await csv().fromFile(csvFilePath);
    var output = ""
    var exportNum = 0;
    zipcodes.forEach(function (currentZipCode) {
        if (possibleStates.indexOf(currentZipCode.state) != -1) {
            exportNum++;
            var city = currentZipCode.city.toLowerCase().split(' ').join('_');
            var state = currentZipCode.state.toLowerCase();
            var zipcode = currentZipCode.zipcode;
            output += baseUrl + city + "_" + state + "_" + zipcode + "/\n"
        }
    });
    fs.writeFile('parkopediaUrls.txt', output, (err) => {
        if (err) {
            throw err;
        } else {
            console.log(exportNum + " parkopedia URLs exported.");
        }
    });
}
