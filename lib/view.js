'use strict';

const path = require('path');
const React = require('react');
const ReactDOM = require('react-dom/server');

let babelRegister;
const hook = require('css-modules-require-hook');
hook({
  generateScopedName: '[name]__[local]___',
});
class View {

  constructor (ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config.view;

    if (!babelRegister) {
      babelRegister = require('babel-register');
      babelRegister({
        "presets": [ "react", "es2015", "stage-0" ],
        "plugins": [
          "transform-runtime",
          "add-module-exports",
          "transform-decorators-legacy",
          "transform-react-display-name"
        ],
      })
    }
  }

  renderScripts (scriptUrls) {
    const items = [];
    scriptUrls.forEach((url, i) => {
      items.push(`<script src=${url}></script>`);
    });
    return items;
  }

  render (reactFile, locals) {
    return new Promise((resolve, reject) => {
      let html = '<!DOCTYPE html>';
      const { css, title, initState, scriptUrls, } = locals;
      html += ` <html lang="zh">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta httpEquiv="Cache-Control" content="no-siteapp" />
          <meta name="renderer" content="webkit" />
          <meta name="keywords" content="demo" />
          <meta name="description" content="demo" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <link rel="stylesheet" href=${css} type="text/css" />
          <script>
          window.__PRELOADED_STATE__ =${JSON.stringify(initState).replace(/</g, '\\u003c')}
          </script>
        </head>
        <body>`
      try {
        const reactComponent = require(reactFile);
        html += '<div id="root">' + ReactDOM.renderToString(React.createElement(reactComponent.default || reactComponent, locals || {})) + '</div>';
        html += `${this.renderScripts(scriptUrls)}</body></html>`
      } catch (error) {
        reject(error);
      }

      resolve(html);
    });
  }

  renderString () {
    return Promise.reject('not implemented yet!');
  }

}

module.exports = View;
