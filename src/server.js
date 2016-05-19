import 'babel-polyfill';
import path from 'path';
import express from 'express';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import assets from './assets'; // eslint-disable-line import/no-unresolved
import { port } from './config';
import http from 'http';
import React from 'react';
import App from './components/App';

const server = global.server = express();

server.use(express.static(path.join(__dirname, 'public')));

server.get('/', async (req, res, next) => {
  try {
    const template = require('./views/index.jade');
    const data = { title: '', description: '', css: '', body: '', entry: assets.main.js };

    const css = [];
    const context = {
      insertCss: styles => css.push(styles._getCss()),
      onSetTitle: value => (data.title = value),
      onSetMeta: (key, value) => (data[key] = value),
    };

    data.body = ReactDOM.renderToString(<App context={context} />);
    data.css = css.join('');

    res.send(template(data));
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const template = require('./views/error.jade');
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.send(template({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '' : err.stack,
  }));
});

//
// Launch the server
// -----------------------------------------------------------------------------
const httpServer = http.Server(server); // eslint-disable-line new-cap

httpServer.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${port}/`);
});

import startTweetStream from './start-tweet-stream';
startTweetStream(httpServer);
