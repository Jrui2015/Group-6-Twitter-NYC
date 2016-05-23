# Hot Topic Finder of Twitter

![](assets/UI.png)

This project is trying to visualize the most recent twitter activities in NYC hoping to get a picture of trending topics and their geographical distribution. It's a course project for the Information Visualization at NYU Tandon by Professor Bertini.

The project fetches tweets geolocated in NYC, and transmit them to connected browsers. At the client side, a quad tree is maintained to store the hierarchical cluster/word frequency information. This makes tweet grouping automatically adjusted by the zooming area to reach a balance of general/details information.

Screenshot: https://vimeo.com/167764465

Website: http://twitter-nyc.com

Documentation: [report.pdf](assets/report.pdf)


# Install

Prerequisites:

- node.js >=6.0
- the latest npm
- [canvas package](https://www.npmjs.com/package/canvas) should be compiled on the host, read the provided document

## 1. Locally build and deploy

```
cd /root/of/project
npm install
npm run build
```

After that the `build` folder will contains all you need to host the server. For deploying on platform such as Heroku, check out the command `npm run deploy`, for the server, just copy the folder onto it using command such as `scp -r build username@hostname:path`.

## 2. Build directly on the server

```
npm install
```

**NOTE**: 

1. If you encountered an issue telling you `npm` is killed during the process, make sure your server got at least 1GB RAM.
2. If you encountered an issue telling you `ndoe-gyp rebuild failed`, please read the [canvas package document](https://www.npmjs.com/package/canvas) to install the prerequisites.

Once you finished the installation, just goto `build/` folder and run with `PORT=80 node server.js`.
