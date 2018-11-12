var fs = require('fs');
var readLine = require('readline');
var es = require('event-stream');

var output = "";
var count = 0;

var s = fs.createReadStream('input.txt')
    .pipe(es.split())
    .pipe(es.mapSync(function (line) {
            var firstChar = line.charAt(0);
            // console.log(line);
            if (firstChar != "\"" && firstChar != "<") {
                output += (line.substring(0, line.indexOf(' ')) + "\n");
                count++;
            }
        })
        .on('error', function (err) {
            console.log('Error while reading file.', err);
        })
        .on('end', function () {
            writeFile('output.txt', output);
        })
    );

function writeFile(fileName, output) {
    fs.writeFile(fileName, output, function (err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("FILE SAVED, OUTPUT LINE COUNT: " + count);
        }
    });
}