const fs = require("fs");
const pa = require("path");

const findServerlessFile = () => {
  let dir = process.cwd();

  while (dir.split(pa.sep).length > 2) {
    const file = pa.join(dir, "serverless.yml"); // TODO: SLS also supports JSON config files I think
    if (fs.existsSync(file)) {
      return file;
    }
    dir = pa.dirname(dir);
  }

  throw new Error(
    "Could not find serverless.yml file for your project in any of the parent directories."
  );
};

module.exports = {
  findServerlessFile,
};
