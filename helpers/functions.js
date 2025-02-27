const fs = require("node:fs");

const readFileCustom = (path) => {
  try {
    const data = fs.readFileSync(path, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    console.error("Error while reading file:", error.message);
    return null;
  }
};

const writeFileCustom = (path, data) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error while writing file:", error.message);
    return null;
  }
};

module.exports = { readFileCustom, writeFileCustom };
