console.log("Program Started");

import fs from "fs";

const data = fs.readFileSync("midi34.mid", { encoding: "base64" });

console.log(data);
