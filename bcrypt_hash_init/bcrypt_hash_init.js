var bcrypt = require('bcrypt');

var stdin = process.openStdin();
console.log("Please enter a password on the next line:");

stdin.addListener("data", function (d) {
    bcrypt.hash(d.toString().trim(), 10, function (err, hash) {
        for (var x = 0; x <= 10000; x++) {
            console.log();
        }
        console.log(hash);
    });
});