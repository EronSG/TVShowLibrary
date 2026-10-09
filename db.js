const fs = require("node:fs");
const path = require("node:path");

const FILE = path.join(__dirname, "shows.json");
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]\n", "utf8");

exports.read = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
exports.write = (shows) => fs.writeFileSync(FILE, JSON.stringify(shows, null, 2) + "\n", "utf8");
