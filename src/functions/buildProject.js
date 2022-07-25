const http = require('http');
const { exec } = require('child_process');
var fs = require('fs');
var slugify = require('slugify')
var AdmZip = require("adm-zip");

http.createServer((req, res) => {
  if (req.url === '/api/buildProject' && req.method.toLowerCase() === 'post') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
      const incomingFormData = JSON.parse(data)
      console.log(incomingFormData)
      const originalFilename = incomingFormData.originalFilename 
      const originalFilenameWithoutExtension = slugify(originalFilename.split('.')[0], {lower: true})
      const filepath = incomingFormData.filepath
      const temp_name = incomingFormData.temp_name
      const title = incomingFormData.title
      const color = incomingFormData.color
      const stage_title = incomingFormData.stage_title
      const stage_desc = incomingFormData.stage_desc
      const folder = `sites/${originalFilenameWithoutExtension}`

      // make everything work -> async or await promise -> only when createProjectFolder and parseProject ran -> createZipArchive and build that sucker!
      async function init() {
        try {
          createProjectFolder();
          parseProject();
          createZipArchive();
          console.log(`Got the final result`);
        } catch (error) {
          console.log(error)
        }
      }

      // create sites folder with name of originalFile:
      const createProjectFolder = (cb) => {
        exec(`rm -r ${folder}`, (err, stdout, stderr) => {
          exec(`cp -a raw ${folder}`, (err, stdout, stderr) => {
            if (err) {
              console.error(err)
            } else {
              console.log(`Copied folder successfully`);
              console.log('go back to exports.handler')
              //TODO: use callback once it is in a function netlify folder
              // cb()
            }
          });
        });
      }
      //  get uploaded doc file and run it through office-parser -> put compiled files  into sites/*name*/src folder and write .env file 
      const parseProject = (cb) => {
        exec(`./office-parser/parse.mjs -n ${folder}/src ${filepath}`, (err, stdout, stderr) => {
          if (err) {
            console.error(err)
          } else {
            console.log(`Copied folder successfully`);
            let content = `SITE_TITLE="${title}"
  STAGE_TITLE="${stage_title}"
  STAGE_DESC="${stage_desc}"
  SITE_COLOR="${color}"`
  
            fs.writeFile(`${folder}/.env`, content, err => {
              if (err) {
                console.error(err)
                return
              } else {
                console.log("env file written sucessfully")
                // TODO: call function when in netlify functions folder
                // compileFolder(filename)
                //file written successfully
              }
            })
            // cb()
          }
        });
      }
      
      async function createZipArchive() {
        try {
          setTimeout(() => {
            const zip = new AdmZip();
            const outputFile = `${originalFilenameWithoutExtension}.zip`
            zip.addLocalFolder(folder);
            zip.writeZip(`./zips/${outputFile}`);
            console.log(`Created ${outputFile} successfully`);
          }, 1000);
        } catch (e) {
          console.log(`Something went wrong. ${e}`);
        }
      }

      init()
    })
    req.on('end', () => {
      console.log('end session')
      
      res.end();
    });
    return;
  }
}).listen(8091, () => {
    console.log('Server listening on http://localhost:8091/ ...');
});