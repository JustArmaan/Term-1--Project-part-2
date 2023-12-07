const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const fsp = require("fs/promises");
const ejs = require('ejs');
const express = require("express");
const { userInfo } = require("os");
const formidable = require("formidable");


function urlFilter(request, response, parameter) {
	const { pathname, searchParams } = new URL(request.url, `http://${request.headers.host}`);
  return searchParams.get(parameter); 
}


const userData = async (username) => {
    const filePath = path.join(__dirname, "..", "database", "data.json");
    const database = await fs.readFile(filePath, "utf8");    
    const usersArray = JSON.parse(database);
    const foundUser = usersArray.find(user => user.username === username);
    if(foundUser) {
        return foundUser;
    } else {
        console.log("User not found")
    }
}

const picture = async(username) => {
  const photoPath = path.join(__dirname,"photos", username)
  const folderList = await fs.readdir(photoPath);
  const pngFiles = folderList.filter(fileName => fileName.endsWith(".png"));
  let photoHtml = "";

  for (let i = 1; i <= pngFiles.length; i++) {
    let str = `
    <div class="gallery-item" tabindex="0">               
      <img src="/gallery?username=${username}&picture=${i}" class="gallery-image" alt="">           
        <div class="gallery-item-info">
          <ul>
            <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 56</li>
            <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 2</li>
          </ul>                   
        </div>
    </div>`;
    photoHtml = photoHtml.concat(str);
    console.log(photoHtml)
  }
  
  return photoHtml;
}

const homePath = path.join(__dirname,"views", "index.ejs");
const feedPath = path.join(__dirname,"views", "feed.ejs")
const controller = {
  getHomepage: async (request, response) => {
    //should be dynamic, changes if john changes name, or added people in database. Loop through all the database and take name, photo and put it in the html
    // const database = await fs.readFile("./database/data.json", "UTF8"); //USE EJS FOR USERNAME, also change images to images in the photo array in database
    // const usersArray = JSON.parse(database);
    try {
        const username = 'john123';
        const user = await userData(username);

    ejs.renderFile(homePath, user, (err, str) => {
        if (err) {
            response.writeHead(404, DEFAULT_HEADER);
        } else {
            response.end(str);
        }
    });
  } catch (err) {
    console.log(err);
    response.writeHead(404, DEFAULT_HEADER);
  }
}, //<a href = "/link"> When you have an a tag, this says /feed, /feed, there is no way who clicked? ADD A Query String, ass a ? and then extra information

  sendFormData: (request, response) => {
    var body = "";

    request.on("data", function (data) {
      body += data;
    });

    request.on("end", function () {
      var post = qs.parse(body);
      console.log(post);
    });
  },

  getFeed: async(request, response) => {
    // console.log(request.url); try: http://localhost:3000/feed?username=john123
    const userName = urlFilter(request, response, "username");
    const data = await userData(userName);
    const phtoHtml = await picture(userName);
    ejs.renderFile(feedPath, { userData: data, phtoHtml }, (err, str) => {
        if (err) {
            response.writeHead(404, DEFAULT_HEADER);
        } else {
            response.end(str);
        }
    });
  },
  
  uploadImages: (request, response) => {
  },
};

module.exports = { controller, urlFilter };
