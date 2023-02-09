console.log("Program Started");

import fs from "fs";

const data = fs.readFileSync("midi34.mid");

console.log(data);
