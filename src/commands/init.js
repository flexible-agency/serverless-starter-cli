const fs = require("fs");
const pa = require("path");
const inquirer = require("inquirer");
const degit = require("degit");

const init = async () => {
  // ask some questions
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      validate: (str) => !!str.match(/^[a-z0-9-]{3,}$/),
      message: "Service name",
    },
  ]);

  const dest = pa.join(process.cwd(), name);

  // clone repo
  const emitter = degit("flexible-agency/serverless-starter#master");
  emitter.on("info", (info) => {
    console.log(info.message);
  });
  await emitter.clone(dest);

  // update package name
  const pkg = pa.join(dest, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkg, "utf8"));
  pkgJson.name = name;
  fs.writeFileSync(pkg, JSON.stringify(pkgJson, null, 2), "utf8");

  // update service name
  const sls = pa.join(dest, "serverless.yml");
  const slsYaml = fs.readFileSync(sls, "utf8").split("\n");
  slsYaml[0] = `service: ${name}`;
  fs.writeFileSync(sls, slsYaml.join("\n"), "utf8");

  // TODO: run git init

  console.log(`Done - to get started:\n\n  cd ${name} && yarn\n\n`);
};

module.exports = init;
