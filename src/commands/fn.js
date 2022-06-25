const fs = require("fs");
const pa = require("path");
const yaml = require("js-yaml");
const inquirer = require("inquirer");

const { findServerlessFile } = require("../lib/filesystem");

const fn = async (functionName) => {
  const sls = findServerlessFile();
  const dir = pa.join("src", "functions", functionName.replace(/--/g, pa.sep));
  const name = functionName.replace(pa.sep, "--");
  const templates = pa.join(__dirname, "..", "templates");
  const root = pa.join(pa.dirname(sls), dir);

  // ask some questions
  const { method, url, auth, schedule } = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      default: `/${functionName.replace(/--/g, "/").replace(/(^\/|\/$)/g, "")}`,
      message: "HTTP path",
    },
    {
      type: "input",
      name: "method",
      default:
        functionName.includes("update") || functionName.includes("create")
          ? "post"
          : "get",
      when: ({ url }) => url && !!url.trim(),
      message: "HTTP method",
    },
    {
      type: "confirm",
      name: "auth",
      default: true,
      when: ({ method, url }) =>
        method && !!method.trim() && url && !!url.trim(),
      message: "Authorizer",
    },
    {
      type: "input",
      name: "schedule",
      default: "rate(5 minutes)",
      when: ({ method, url }) =>
        !method || !method.trim() || !url || !url.trim(),
      message: "Schedule",
    },
  ]);

  // create directory
  fs.mkdirSync(root, { recursive: true });

  // add function.yml
  const fnYaml = {
    [name]: {
      handler: `${dir}/handler.handler`,
      events:
        url && method
          ? [
              {
                httpApi: {
                  path: url,
                  method: method.toLowerCase(),
                  authorizer: auth
                    ? {
                        name: "WebAuthorizer",
                      }
                    : undefined,
                },
              },
            ]
          : schedule
          ? [{ schedule }]
          : undefined,
    },
  };
  fs.writeFileSync(pa.join(root, "function.yml"), yaml.dump(fnYaml), "utf8");

  // add handler.js
  const handler = auth ? "handler--auth.js" : "handler.js";
  fs.copyFileSync(
    pa.join(templates, "fn", handler),
    pa.join(root, "handler.js")
  );

  // add entry in serverless.yml
  // TODO: this is a very hacky way to insert a line without updating the rest of the file
  const slsYaml = fs.readFileSync(sls, "utf8").split("\n");
  const beforeFunctions = [];
  const functionsList = [];
  const afterFunctions = [];
  let inFunctionsList = false;
  let afterFunctionsList = false;
  for (const ln of slsYaml) {
    if (ln.indexOf("functions:") === 0) {
      beforeFunctions.push(ln);
      inFunctionsList = true;
      continue;
    }
    if (afterFunctionsList) {
      afterFunctions.push(ln);
      continue;
    }
    if (!inFunctionsList) {
      beforeFunctions.push(ln);
      continue;
    }
    if (inFunctionsList && ln.match(/^\s+-\s+/)) {
      if (!ln.includes(`- \${file(./${dir}/function.yml)}`)) {
        functionsList.push(ln);
      }
      continue;
    }
    if (inFunctionsList) {
      inFunctionsList = false;
      afterFunctionsList = true;
      afterFunctions.push(ln);
    }
  }

  functionsList.push(`  - \${file(./${dir}/function.yml)}`);

  fs.writeFileSync(
    sls,
    [...beforeFunctions, ...functionsList, ...afterFunctions].join("\n"),
    "utf8"
  );
};

module.exports = fn;
