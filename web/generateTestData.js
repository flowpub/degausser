const fs = require("fs");
const http = require("http");
const static = require("node-static");
const puppeteer = require("puppeteer");
const cpy = require("cpy");
const glob = require("glob");
const path = require("path");
const { asyncForEach, hypotext } = require("./util");

const startServer = async port => {
  const fileServer = new static.Server(".");

  http
    .createServer((req, res) => {
      req
        .addListener("end", () => {
          fileServer.serve(req, res);
        })
        .resume();
    })
    .listen(port || 8080);
};

const processFile = async (page, file, cwd) => {
  const pathToFile = path.join(cwd, file);

  const html = fs.readFileSync(pathToFile).toString();

  const fileToCreate = path.join(
    path.dirname(pathToFile),
    path.basename(pathToFile, path.extname(pathToFile)) + ".txt"
  );

  await hypotext(page, html).then(parsed => {
    fs.writeFileSync(fileToCreate, parsed);
  });
};

const processEpub = async (entryPoint, page) => {
  const [epubName] = entryPoint.split("/").reverse();

  const pathToInputDir = entryPoint;
  const pathToOutputDir = `../../parsed_epubs/${epubName}_test`;

  const globPattern = "**/*.{html,xhtml,htm}";

  // Move source files to output directiry
  await cpy(`${globPattern}`, pathToOutputDir, {
    cwd: pathToInputDir,
    parents: true
  });

  const cwd = path.join(pathToInputDir, pathToOutputDir);

  await glob(
    `${globPattern}`,
    {
      cwd
    },
    async (er, files) => {
      if (er) {
        console.error(er);
        return;
      }

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          await processFile(page, file, cwd);
        }

        console.log("Processing Complete");
      } catch (error) {
        console.error(error);
        return;
      }
    }
  );
};

const main = async pathToEpubs => {
  const URL = "http://localhost:8080/hypotext.html";

  await startServer();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);

  const epubs = fs.readdirSync(pathToEpubs);

  await asyncForEach(epubs, async epub => {
    await processEpub(`${pathToEpubs}/${epub}`, page);
  });

  // TODO: Make sure process exits when processing is complete
  //browser.close();
};

module.exports = {
  parseEpubs: main
};
