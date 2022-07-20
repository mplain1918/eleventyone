const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var fs = require('fs');
var slugify = require('slugify')
const { exec } = require('child_process');

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);
  console.log("🚀 ~ file: upload.js ~ line 8 ~ body", body)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
}