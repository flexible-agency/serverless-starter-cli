#!/usr/bin/env node

const { Command } = require("commander");
const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version);

program
  .command("init")
  .description("create a new service")
  .action((...args) => require("./commands/init")(...args));

program
  .command("fn <function-name>")
  .description("create a new function")
  .option("-t, --ts", "Typescript")
  .option("-s, --simple", "No middleware")
  .action((...args) => require("./commands/fn")(...args));

program.parse();
