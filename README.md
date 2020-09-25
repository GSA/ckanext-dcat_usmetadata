# ckanext-dcat_usmetadata

This extension provides a react Admin UI for managing custom fields related to [DCAT-US Schema](https://resources.data.gov/resources/dcat-us/)

## Dependencies

This module currently depends on the [USMetadata app](https://github.com/GSA/USMetadata) for server-side validation and rendering. 
Make sure it is enabled in CKAN's plugins.

## Installation

To install this package, activate CKAN virtualenv (e.g. "source /path/to/virtenv/bin/activate"), then run

```
(virtualenv) pip install -e git+https://github.com/GSA/ckanext-dcat_usmetadata@master#egg=ckanext-dcat_usmetadata
(virtualenv) python setup.py develop
```

In your CKAN .ini file add `dcat_usmetadata` to your enabled plugins:

`ckan.plugins = [YOUR PLUGINS HERE...] dcat_usmetadata`

## Testing

Run `make test` to run the tests locally inside a docker container

You need to have docker and docker-compose installed locally for the tests to run.

## CI and Testing Workaround

The circle setup uses docker-compose to run the inventory app in the root of this project. In order to access local changes to the extension they need to be committed and the commit hash should be used to update `requirements.txt` and `requirements-freeze.txt`, to ensure that the changes will be picked up in CI. Please do this as part of the PR process.

## Building the App

To build the app (from metadata-app/ directory):

* `$ yarn build`
* `$ rm ../ckanext/dcat_usmetadata/public/js/*`
* `$ rm ../ckanext/dcat_usmetadata/public/css/*`
* `$ rm ../ckanext/dcat_usmetadata/public/media/*`
* `$ cp build/static/js/* ../ckanext/dcat_usmetadata/public/js`
* `$ cp build/static/css/* ../ckanext/dcat_usmetadata/public/css`
* `$ cp build/static/media/* ../ckanext/dcat_usmetadata/public/media`

Now update `ckanext/dcat_usmetadata/templates/new-metadata.html` to reference the new bundles.

For example:

```
<div
  id="root"
  data-apiUrl="{{g.site_url}}/api/3/action/"
  data-apiKey="{{c.userobj.apikey}}"
  data-ownerOrg="{{request.params.get('group')}}"
  data-datasetId="{{request.params.get('datasetId') or ''}}"
></div>
<link rel="stylesheet" href="/css/main.2cca9f24.chunk.css" type"text/css">
<script src="/js/2.89b84686.chunk.js"></script>
<script src="/js/main.84d1d3f2.chunk.js"></script>
<script src="/js/runtime-main.bfc1d45b.js"></script>
```

## Metadata App

The Metadata APP is a [Create React App](https://create-react-app.dev/)-bootstrapped project.

To run the app use `make app-up`

### Development

We recommend using [cosmos](https://reactcosmos.org/) for development.

Run CKAN locally (`make up`) and get the Admin user's API Key. Add a test org for development purposes and get the id. Add these values to indicated place in `/metadata-app/src/index.js`.

Run `make app-cosmos` to start the cosmos server, which will watch the `metadata-app/src` directory for changes.

## Ways to Contribute

The Data.gov team manages all Data.gov updates, bugs, and feature additions via GitHub's public [issue tracker](https://github.com/GSA/ckanext-dcat_usmetadata/issues) in this repository.

If you do not already have a GitHub account, you can [sign up for GitHub here](https://github.com/). In the spirit of open source software, everyone is encouraged to help improve this project. Here are some ways you can contribute:

* by reporting bugs
* by suggesting new features
* by translating content to a new language
* by writing or editing documentation
* by writing specifications
* by writing code and documentation (no pull request is too small: fix typos, add code comments, clean up inconsistent whitespace)
* by reviewing pull requests.
* by closing issues

### Submit Great Issues

* Before submitting a new issue, check to make sure a similar issue isn't already open. If one is, contribute to that issue thread with your feedback.
* When submitting a bug report, please try to provide as much detail as possible, i.e. a screenshot or gist that demonstrates the problem, the technology you are using, and any relevant links.

### Ready for your Help
Issues labeled [help wanted](https://github.com/GSA/data.gov/labels/help%20wanted) make it easy for you to find ways you can contribute today.

## Public Domain
This project constitutes a work of the United States Government and is not subject to domestic copyright protection under 17 USC § 105. Additionally, we waive copyright and related rights in the work worldwide through the CC0 1.0 [Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
