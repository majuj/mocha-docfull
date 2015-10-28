/**
 * Module dependencies.
 */


var mocha = require("mocha")
  , Base = mocha.reporters.Base
  , utils = mocha.utils
  , escape = utils.escape
  , fs = require("fs")
  , path = require("path")
  , mkdirp = require("mkdirp")
  , totalPas = 0
  , totalFai = 0
  , totalDur = 0
  , indents = 2;

const config = require(fs.realpathSync(process.cwd()) + "/config.json");
const cssPath = fs.realpathSync(process.cwd()) + "/node_modules/mocha-docfull/resultPage.less";


/**
 * Expose `MochaDocFull`.
 */

exports = module.exports = MochaDocFull;

/**
 * Initialize a new `MochaDocFull` reporter.
 *
 * @param {Runner} runner
 * @api public
 */
function MochaDocFull(runner) {
    Base.call(this, runner);
    var stats = this.stats
    , tests = []
    , suites = []
    , fd;
    var created = false;



    runner.on('suite', function (suite) {
        console.log('  ' + suite.title);
        stats.suites = stats.suites || 0;
        suite.root || stats.suites++;
        var browserName = getBrowser();
        suite.title = suite.title;
        stats.start = new Date();
        stats.tests = 0;
        var classHTML = "suite";

        if (suite.root) {

        }
        else {
            if (!created) {

                const filePath = createFile(browserName);
                fd = fs.openSync(filePath, 'w', 0755);
                createHeader(fd, "Results with " + browserName);
                created = true;
            }
            ++indents;
            appendLine(fd, '<section class=' + classHTML + ' id="' + utils.escape(suite.title).replace(/\s/g, '') + '" >');
            ++indents;
            appendLine(fd, '<h1 class="suiteTitle">' + utils.escape(suite.title) + '</h1>');
            appendLine(fd, '<dl>');
        };
    });

    runner.on('suite end', function (suite) {
        stats.end = new Date();
        stats.duration = new Date() - stats.start;
        if (suite.root) {
            summary(fd, suites);
            --indents;
            createFooter(fd);
            suite.title = "Summary";
        }
        else {

            suites.push(suite);
            appendLine(fd, '<dl><dt class = "resultPassed">Tests passed: ' + stats.passes + '</dt>');
            appendLine(fd, '<dt class = "resultFailed">Tests failed: ' + stats.failures + '</dt>');
            appendLine(fd, '<dt class = "elapsedTime">Test duration: ' + stats.duration / 1000 + ' s</dt></dl>');
            appendLine(fd, '</dl>');
            --indents;
            appendLine(fd, '</section>');
            --indents;
            totalPas += stats.passes;
            totalFai += stats.failures;
            totalDur += stats.duration;
            stats.passes = 0;
            stats.failures = 0;
        };
    });

    runner.on('test', function (test) {
        stats.tests = stats.tests || 0;
        stats.tests++;
        tests.push(test);
    })

    runner.on('pending', function (test) {
        console.log('  - ' + test.title);

        tests.push(test);
    })

    runner.on('pass', function (test) {
        console.log('  ◦ ' + test.title);
        test.date = new Date();
        tests.push(test);
        ++indents;
        appendLine(fd, '<dt class="pass">' + formatTime(test.date) + ' - ' + utils.escape(test.title) + ' &#10003;</dt>');
        --indents
    });

    runner.on('fail', function (test, err) {
        console.log('  x ' + test.title);
        test.date = new Date();

        tests.push(test);
        ++indents;
        appendLine(fd, '<dt class="fail">' + formatTime(test.date) + ' - ' + utils.escape(test.title) + ' &#10007;</dt>');
        ++indents;
        appendLine(fd, '<dd class="error">' + utils.escape(err) + '</dd>');
        --indents;
        --indents;
    });

};
// To be able to use the report without the project, the stylesheet is integrated in the header
function createHeader(fileDesc, name) {
    var header = "<!DOCTYPE html> " +
    "<html><head>"
    appendLine(fileDesc, header);
    insertCss(fileDesc, cssPath);
    header = "<title>Automated Tests - " + name + "</title>" +
"</head><body id=\"body\">"
    appendLine(fileDesc, header);
};

function insertCss(fileDesc, css) {
    var line = "<style media=\"screen\" type=\"text/css\">";
    appendLine(fileDesc, line);
    var cssContent = fs.readFileSync(css, 'utf8');
    // the file is in UTF8 with BOM, so we strip the BOM with the following line
    cssContent = cssContent.replace(/^\uFEFF/, '');
    appendLine(fileDesc, cssContent);
    line = "</style>";
    appendLine(fileDesc, line);
};

function createFooter(fileDesc) {
    const footer = "</body></html>"
    appendLine(fileDesc, footer);
};

function indent() {
    return Array(indents).join('  ');
};

function appendLine(fd, line) {
    line = indent() + line;
    fs.writeSync(fd, line + "\n", null, 'utf8');
};

function summary(fd, suites) {
    line = "<dl class='summary'>";
    appendLine(fd, line);
    ++indents;
    if (suites.length > 1) {
        suites.forEach(function(suite) {
            //var suite = suites[a];
            line = "<dt class='summarySuite'> <a href=#" + suite.title.replace(/\s/g, '') + ">" + suite.title + "</a></dt>";
            appendLine(fd, line);
        });
        appendLine(fd, '<dl><dt class = "resultPassed">Total tests passed: ' + totalPas + '</dt>');
        appendLine(fd, '<dt class = "resultFailed">Total tests failed: ' + totalFai + '</dt>');
        appendLine(fd, '<dt class = "elapsedTime">Total test duration: ' + (totalDur / 1000) + ' s</dt></dl>');
    };
    --indents;
    line = "</dl>";
    appendLine(fd, line);

}

function formatTime(date) {
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hour = ("0" + date.getHours()).slice(-2);
    const minute = ("0" + date.getMinutes()).slice(-2);
    const second = ("0" + date.getSeconds()).slice(-2);
    const resultDate = "" + date.getFullYear() + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
    return resultDate;
};

function createFile(browserName) {
    /**
    * Filename follows the pattern YYYYMMDDHHMMSS_results.html
    * Numbers are padded with zero if they're on one figure only
    */

    var date = new Date();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hour = ("0" + date.getHours()).slice(-2);
    const minute = ("0" + date.getMinutes()).slice(-2);
    const second = ("0" + date.getSeconds()).slice(-2);

    const time = "" + date.getFullYear() + month + day + hour + minute + second;
    var fileName = time + "_" + browserName + ".html";
    const filePath = config.env.docfull_path + fileName;
    mkdirp.sync(path.dirname(filePath));
    return filePath;
};


function getBrowser() {
    const fullBrowserName = browser.browserName + "_" + browser.browserVersion;
    return fullBrowserName.replace(/\s/g, '').split('.')[0];
};