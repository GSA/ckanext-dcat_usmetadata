'use strict';

const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const resolveAppFromRoot = resolveApp;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveAppFromRoot('package.json')).homepage,
  process.env.PUBLIC_URL
);

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('metadata-app/.env'),
  appPath: resolveApp('metadata-app/.'),
  appBuild: resolveAppFromRoot('ckanext/dcat_usmetadata/public'),
  appPublic: resolveApp('metadata-app/public'),
  appHtml: resolveApp('metadata-app/public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'metadata-app/src/index'),
  appPackageJson: resolveAppFromRoot('package.json'),
  appSrc: resolveApp('metadata-app/src'),
  appTsConfig: resolveApp('metadata-app/tsconfig.json'),
  appJsConfig: resolveApp('metadata-app/jsconfig.json'),
  yarnLockFile: resolveAppFromRoot('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'metadata-app/src/setupTests'),
  proxySetup: resolveApp('metadata-app/src/setupProxy.js'),
  appNodeModules: resolveAppFromRoot('node_modules'),
  publicUrlOrPath,
};

module.exports.moduleFileExtensions = moduleFileExtensions;
