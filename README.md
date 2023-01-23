[![Github Actions](https://github.com/GSA/ckanext-dcat_usmetadata/actions/workflows/test.yml/badge.svg)](https://github.com/GSA/ckanext-dcat_usmetadata/actions)
[![PyPI version](https://badge.fury.io/py/ckanext-dcat_usmetadata.svg)](https://badge.fury.io/py/ckanext-dcat_usmetadata)

# ckanext-dcat_usmetadata

This extension provides a new dataset form for [inventory.data.gov](https://inventory.data.gov/). The form is tailored to managing metadata meeting the [DCAT-US Schema](https://resources.data.gov/resources/dcat-us/).

## Usage

### Dependencies

This module currently depends on the [USMetadata app](https://github.com/GSA/USMetadata) for server-side validation and rendering.
Make sure it is enabled in CKAN's plugins.

This extension is compatible with these versions of CKAN.

| CKAN version | Compatibility |
| ------------ | ------------- |
| <=2.8        | no            |
| 2.9          | yes           |

### Installation

To install this package, activate CKAN virtualenv (e.g. "source /path/to/virtenv/bin/activate"), then run

```
(virtualenv) pip install ckanext-dcat-usmetadata
```

In your CKAN .ini file add `dcat_usmetadata` to your enabled plugins:

`ckan.plugins = [YOUR PLUGINS HERE...] dcat_usmetadata`

### Commands

### publishers-import

This extension adds a new CLI command for importing publishers linked to CKAN
organizations. The [list of
publishers](https://docs.google.com/spreadsheets/d/1BWpXWswnnMRaNazMCYrzl4W5JMWpGuyW0Wo2YaNH9jY/edit?usp=sharing)
should be exported in a CSV data and it should have the following structure
(note the headers):

```
organization,publisher,publisher_1,publisher_2,publisher_3,publisher_4,publisher_5
agricultural-marketing-service-department-of-agriculture,Department of Agriculture,Agricultural Marketing Service,,,,
ars-usda-gov,Department of Agriculture,Agricultural Research Service,,,,
aphis-usda-gov,Department of Agriculture,Animal and Plant Health Inspection Service,,,,
risk-management-agency-department-of-agriculture,Department of Agriculture,Departmental Management,,,,
usda-gov,Department of Agriculture,Office of Chief Information Officer,,,,
usda-gov,Department of Agriculture,Economic Research Service,,,,
usda-gov,Department of Agriculture,Farm Service Agency,,,,
usda-gov,Department of Agriculture,Food and Nutrition Service,,,,
usda-gov,Department of Agriculture,Food Safety and Inspection Service,,,,
usda-gov,Department of Agriculture,Foreign Agricultural Service,,,,
usda-gov,Department of Agriculture,National Agricultural Statistics Service,,,,
usda-gov,Department of Agriculture,National Institute of Food and Agriculture,,,,
usda-gov,Department of Agriculture,Natural Resources Conservation Service,Colorado State University,,,
usda-gov,Department of Agriculture,Rural Development,,,,
usda-gov,Department of Agriculture,GIPSA,Federal Grain Inspection Service,,,
usda-gov,Department of Agriculture,Natural Resources Conservation Service,,,,
usda-gov,Department of Agriculture,US Forest Service,,,,
```

Each CKAN organization must have its own list of publishers.

Example of running the command:

    $ ckan dcat-usmetadata import-publishers /path/to/publishers.csv

## Development

### Prerequisites

These tools are required for development.

- [Node.js](https://nodejs.org/) 12.x
- [Yarn](https://yarnpkg.com/) 1.22.x
- [Cypress](https://www.cypress.io/) 6.0.0+

### Setup

Install Node.js dependencies.

```bash
yarn install
```

Build the JS application. The new build files can be found in `ckanext/dcat_usmetadata/public` folder.

```bash
yarn build
```

Build and start the docker containers.

```bash
yarn build:docker
yarn up
```

## Testing

There are several levels of testing:

| Suite                     | Description                  | Command                  |
| ------------------------- | ---------------------------- | ------------------------ |
| Unit tests for the JS app | Tests for the React app.     | `yarn test:metadata-app` |
| CKAN extension tests      | Python tests using Nosetests | `yarn test`              |
| End to end tests          | Cypress tests                | `yarn e2e`               |

## Linting

Lint the python code.

```bash
yarn lint:python
```

Lint the JavaScript code.

```bash
yarn lint:js
```

## Metadata app

The Metadata app is a [Create React App](https://create-react-app.dev/)-bootstrapped project.

To run the app use `yarn && yarn start:metadata-app` command.

_TODO briefly describe how the metadata application relates to the CKAN
extension._

### Development

This project uses [cosmos](https://reactcosmos.org/) for development.

Run CKAN locally (`yarn up`), get the Admin user's API Key and add it in `/metadata-app/public/index.html` as `data-apiKey` attribute of the `div` element. Add a test org for development purposes.

Run `yarn && yarn cosmos` to start the cosmos server, which will watch the `metadata-app/src` directory for changes.

Run the unit tests:

```bash
yarn test:metadata-app
# To run it in watch mode:
yarn test:metadata-app:watch
```

### Update Jest snapshots

Some tests render a fixture component with [Jest](https://jestjs.io/) and then
match against a known good snapshot (HTML rendering) of the component. When you
edit a component, you'll usually have to update the snapshot and inspect the
diff to make sure all changes are as intended.

```bash
yarn test:metadata-app --updateSnapshot
```

## Local development and end-to-end testing

To build the latest JS code and update assets in the CKAN extension, you can run the following command from the root directory of this project:

```
yarn build
```

For convenience, we have prepared a single script that you can run to perform end-to-end tests locally. Don't forget to `yarn build` prior to running e2e tests, otherwise, the tests could run against older builds:

```bash
yarn e2e
```

Note, it may be necessary to remove cached images when rebuilding the docker container, in order to ensure that the new usmetadata-app template is included in the build. If you want to make sure that you aren't using cached builds, you can try:

```bash
docker-compose build --no-cache --pull ckanext-dcat_usmetadata_app
```

To run e2e tests interactively use:

```bash
yarn e2e:interactive
```

## Publishing a new version of the extension

We publish this extension to PyPI - https://pypi.org/project/ckanext-dcat-usmetadata/. This is done by CI job that is triggered on tagged commit on master branch. When you need to release a new version of the extension, you need to:

0. Create a new branch for releasing a new version of the extension. You can name your branch with the following convention: `release/x.y.z`;
1. Update version in `setup.py`;
2. Get your PR merged to master branch;
3. Tag the merged commit with the new version (`git tag $version`).

In the CI job, the following is done for tagged commits:

- It builds the JS bundles and puts them into the relevant directory so the extension can use them;
- It runs integration tests to make sure everything is working as expected;
- It packages the extension and publishes it to PyPI.

Below is a sequence diagram demonstrating the flow (you need to have `github + mermaid` chrome extension to view it):

```mermaid
sequenceDiagram
    Developer->>Git: Push tagged commit to master branch
    Git-->>CI/CD: Trigger deployment
    CI/CD-->>CI/CD: Build assets (JS bundles)
    CI/CD-->>CI/CD: Build python package
    CI/CD-->>CI/CD: Run tests
    CI/CD-->>PyPI: Publish the package
    Inventory-->>PyPI: Install
```

## Ways to Contribute

The Data.gov team manages all Data.gov updates, bugs, and feature additions via GitHub's public [issue tracker](https://github.com/GSA/ckanext-dcat_usmetadata/issues) in this repository.

If you do not already have a GitHub account, you can [sign up for GitHub here](https://github.com/). In the spirit of open source software, everyone is encouraged to help improve this project. Here are some ways you can contribute:

- by reporting bugs
- by suggesting new features
- by translating content to a new language
- by writing or editing documentation
- by writing specifications
- by writing code and documentation (no pull request is too small: fix typos, add code comments, clean up inconsistent whitespace)
- by reviewing pull requests.
- by closing issues

### Submit Great Issues

- Before submitting a new issue, check to make sure a similar issue isn't already open. If one is, contribute to that issue thread with your feedback.
- When submitting a bug report, please try to provide as much detail as possible, i.e. a screenshot or gist that demonstrates the problem, the technology you are using, and any relevant links.

### Ready for your Help

Issues labeled [help wanted](https://github.com/GSA/data.gov/labels/help%20wanted) make it easy for you to find ways you can contribute today.

## Public Domain

This project constitutes a work of the United States Government and is not subject to domestic copyright protection under 17 USC § 105. Additionally, we waive copyright and related rights in the work worldwide through the CC0 1.0 [Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
