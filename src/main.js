import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });
}

function addProjectName(options) {
  const { targetDirectory, projectName } = options;
  const packageJsonPath = `${targetDirectory}/package.json`;

  let packageJson;

  fs.readFile(packageJsonPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    packageJson = JSON.parse(data);
    packageJson = { ...packageJson, name: projectName };

    fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, "\t"),
      "utf8",
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
  });
}

export async function createProject(projectName) {
  const options = {
    projectName,
    targetDirectory:
      projectName === "." ? process.cwd() : `${process.cwd()}/${projectName}`,
  };

  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    "../../templates"
  );

  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  console.log("Generating project files");
  await copyTemplateFiles(options);
  addProjectName(options);

  console.log("%s Project ready", chalk.green.bold("DONE"));
  return true;
}
