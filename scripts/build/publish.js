"use strict";
// Node module dependencies
const fs = require('fs-extra-promise').useFs(require('fs-extra')),
  queue = require('queue'),
  path = require('path'),
  exec = require('child-process-promise').exec;


const ROOT = path.resolve(path.join(__dirname, '../../')),
  DIST = path.resolve(ROOT, 'dist', '@heidji-native-mocks');

const FLAGS = '--access public'; // add any flags here if you want... (example: --tag alpha)

const PACKAGES = fs.readdirSync(DIST);

const failedPackages = [];

const QUEUE = queue({
  concurrency: 10
});

PACKAGES.forEach(packageName => {

  QUEUE.push(done => {
    if (packageName !== '.DS_store' ) {
    console.log(`Publishing @heidji-native-mocks/${packageName}`);
    const packagePath = path.resolve(DIST, packageName);
    exec(`npm publish ${packagePath} ${FLAGS}`)
      .then(() => done())
      .catch((e) => {
        if (e.stderr && e.stderr.indexOf('previously published version') === -1) {
          failedPackages.push({
            cmd: e.cmd,
            stderr: e.stderr
          });
        }
        done();
      });
    }
  });

});

QUEUE.start((err) => {

  if (err) {
    console.log('Error publishing ionic-native-mocks. ', err);
  } else if (failedPackages.length > 0) {
    console.log(`${failedPackages.length} packages failed to publish.`);
    console.log(failedPackages);
  } else {
    console.log('Done publishing ionic-native-mocks!');
  }
});

