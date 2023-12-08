const { parse } = require("url");
const express = require("express");
const { DEFAULT_HEADER } = require("./util/util.js");
const { controller, urlFilter } = require("./controller");
const { createReadStream, createWriteStream } = require("fs");
const path = require("path");
const fs = require("fs/promises");

const allRoutes = {
  "/:get": (request, response) => {
    controller.getHomepage(request, response);
  },
  // GET: localhost:3000/form
  // POST: localhost:3000/form
  "/form:post": (request, response) => {
    controller.sendFormData(request, response);
  },
  // POST: localhost:3000/images

  // GET: localhost:3000/feed
  // Shows instagram profile for a given user
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
  },
  "/imagesinstagramLogopng:get": async (request, response) => {
    const imagePath = path.join(__dirname, "images", "instagramLogo.png");
    const data = await fs.readFile(imagePath);
    response.end(data);
  },

  "/johnProfile:get": async (request, response) => {
    const imagePath = path.join(__dirname, "photos", "john123", "profile.jpeg");
    const data = await fs.readFile(imagePath);
    response.end(data);
  },
  "/sandraProfile:get": async (request, response) => {
    const imagePath = path.join(
      __dirname,
      "photos",
      "sandra123",
      "profile.jpeg"
    );
    const data = await fs.readFile(imagePath);
    response.end(data);
  },
  "/profile:get": async (request, response) => {
    const profileUser = urlFilter(request, response, "username");
    const imagePath = path.join(
      __dirname,
      "photos",
      profileUser,
      "profile.jpeg"
    );
    const data = await fs.readFile(imagePath);
    response.end(data);
  },
  "/gallery:get": async (request, response) => {
    const profileUser = urlFilter(request, response, "username");
    const photoNum = urlFilter(request, response, "picture");
    const imagePath = path.join(
      __dirname,
      "photos",
      profileUser,
      `pic${photoNum}.png`
    );
    try {
      const data = await fs.readFile(imagePath);
      response.end(data);
    } catch (err) {
      console.error(err);
    }
  },
  "/upload:post": async (request, response) => {
    controller.uploadImages(request, response);
  },

  // 404 routes
  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER);
    createReadStream(path.join(__dirname, "views", "404.html"), "utf8").pipe(
      response
    );
  },
};

function handler(request, response) {
  const { url, method } = request;
  // console.log(url, method);

  const { pathname } = parse(url, true);

  const key = `${pathname}:${method.toLowerCase()}`;
  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(
    handlerError(response)
  );
}

function handlerError(response) {
  return (error) => {
    console.log("Something bad has  happened**", error.stack);
    response.writeHead(500, DEFAULT_HEADER);
    response.write(
      JSON.stringify({
        error: "internet server error!!",
      })
    );

    return response.end();
  };
}

module.exports = handler;
