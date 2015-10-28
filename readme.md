mocha-docfull
=========

A reporter for Mocha, creating a HTML file with the test results, based on doc and xunit-file
The HTML files starts with a summary listing the suites tested, with an intern link leading to each suite. 
Then each suite lists the specs tested, passed or failed, and in case of failure, writes the error in the report.

## Installation

  npm install mocha-docfull --save

## Usage

in config.json, add an environment variable to define the destination path, for the result file:
for example
```
	env{
		"docfull_path":  "C:/results/"
		}
```
The path has to be absolute.
  
In the protractor configuration file, add "mocha-docfull" as a reporter:
```
	framework: 'mocha',
	mochaOpts: {
		reporter: 'mocha-docfull',
		timeout: 5000,
		enableTimeouts: false
		},
```
You also need to add this in the configuration file:
```
	onPrepare: function() {
        browser.getCapabilities().then(function (cap) {
            browser.browserName = cap.caps_.browserName;
            browser.browserVersion = cap.caps_.version;
        });
	},
```

## Tests


## Contributing

## Release History

* 0.1.0 Initial release
* 0.2.0 Working version
* 0.2.1 Fixed the BOM with the CSS, added the browser name and version, and timestamps
* 0.2.2 Fixed the readme.md
* 0.2.3 The report now contains the name of the browser and its version
* 0.2.4 Cleaned the code, added the total number of tests in the summary
* 0.2.5 Revert to fix a problem with illegal token
* 0.2.6 Modified the way tests are logged in the console, in case of failure (no more double line)