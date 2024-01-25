const core = require('@actions/core');
const exec = require('@actions/exec');
const AWS = require('aws-sdk');
const fs = require('graceful-fs');

async function run() {
  try {
    const s3Bucket = core.getInput('s3-bucket', { required: true });
    const cacheKey = core.getInput('cache-key', { required: true });
    const paths = core.getInput('paths', { required: true });
    const command = core.getInput('command', { required: true });
    const zipOption = core.getInput('zip-option', { required: false });
    const unzipOption = core.getInput('unzip-option', { required: false });
    const workingDirectory = core.getInput('working-directory', { required: false });
    const cacheHitSkip = core.getInput('cache-hit-skip', { required: false });
    const fileName = cacheKey + '.zip';

    process.chdir(workingDirectory);

    const s3 = new AWS.S3();

    s3.getObject(
      {
        Bucket: s3Bucket,
        Key: fileName,
      },
      async (err, data) => {
        if (err) {
          console.log(`No cache is found for key: ${fileName}`);

          await exec.exec(command); // install or build command e.g. npm ci, npm run dev
          await exec.exec('bash', ['-c', `zip ${zipOption} ${fileName} ${paths}`]);

          s3.upload(
            {
              Body: fs.readFileSync(fileName),
              Bucket: s3Bucket,
              Key: fileName,
            },
            (err, data) => {
              if (err) {
                console.log(`Failed store to ${fileName}`);
              } else {
                console.log(`Stored cache to ${fileName}`);
              }
            },
          );
        } else {
          console.log(`Found a cache for key: ${fileName}`);
          if (cacheHitSkip) {
            console.log(`Cache found, skipping command: ${command}`);
            return;
          }
          fs.writeFileSync(fileName, data.Body);

          await exec.exec(`unzip ${unzipOption} ${fileName}`);
          await exec.exec(`rm -f ${fileName}`);
        }
      },
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
