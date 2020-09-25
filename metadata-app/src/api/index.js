import axios from 'axios';
import slugify from 'slugify';

const dataDictTypes = require('../components/AdditionalMetadata/data-dictionary-types');

/**
 * HELPERS
 */
const clone = (param) => JSON.parse(JSON.stringify(param));

/**
 * Decode extras from CKAN 2.8.2 Groups format
 */
const decodeExtras = (opts) => {
  const newOpts = clone(opts);
  newOpts.extras.forEach((cur) => {
    newOpts[cur.key] = cur.value;
  });
  return newOpts;
};

// encode values from USMetadata format to match form values
const encodeSupplementalValues = (opts) => {
  const newOpts = clone(opts);

  if (opts.description) {
    newOpts.notes = opts.description;
  }

  if (opts.tags && opts.tags.length > 0) {
    newOpts.tag_string = opts.tags.reduce((acc, cur) => {
      if (acc.length === 0) {
        return cur.name;
      }
      return `${acc}, ${cur.name}`;
    }, '');
  }

  if (opts.publisher_other) {
    newOpts.publisher = opts.publisher_other;
    delete newOpts.publisher_other;
  }

  if (opts.license_others) {
    newOpts.license_new = opts.license_others;
    delete newOpts.license_others;
  }

  // if access_level_comment is false use provided description
  if (opts.access_level_comment === 'false' && opts.rights_desc) {
    newOpts.access_level_comment = opts.rights_desc;
    delete newOpts.rights_desc;
  } else {
    newOpts.access_level_comment = 'true';
  }

  if (opts.spatial_location_desc) {
    newOpts.spatial = opts.spatial_location_desc;
    delete newOpts.spatial_location_desc;
  }

  if (opts.temporal_start_date) {
    const start = new Date(opts.temporal_start_date).toISOString().split('T')[0]; // get yyyy-mm-dd from ISO string
    const end = new Date(opts.temporal_end_date).toISOString().split('T')[0]; // ditto
    newOpts.temporal = `${start}/${end}`;
    delete newOpts.temporal_start_date;
    delete newOpts.temporal_end_date;
  } else {
    delete newOpts.temporal;
  }

  // Language field should be constructed from language subtag and language
  // regional subtag:
  if (opts.languageSubTag) {
    newOpts.language =
      opts.languageSubTag + (opts.languageRegSubTag && `-${opts.languageRegSubTag}`);
  }
  delete newOpts.languageSubTag;
  delete newOpts.languageRegSubTag;

  // Data Dictionary Type
  if (opts.describedByType) {
    // If it's specified other
    if (opts.describedByType === 'other') {
      newOpts.data_dictionary_type = opts.otherDataDictionaryType;
      delete newOpts.otherDataDictionaryType;
    } else newOpts.data_dictionary_type = opts.describedByType;
    delete newOpts.describedByType;
  }

  if (opts.isParent === 'Yes') {
    newOpts.is_parent = true;
  } else {
    newOpts.is_parent = false;
  }

  return newOpts;
};

// decode values from USMetadata format to match form values
const decodeSupplementalValues = (opts) => {
  const newOpts = clone(opts);
  if (opts.tag_string) {
    newOpts.tags = opts.tag_string.split(',').map((n, i) => ({ id: i, name: n }));
  }

  if (opts.license_new) {
    if (['MIT', 'Open Source License'].includes(opts.license_new)) {
      newOpts.license = opts.license;
    } else {
      newOpts.license_others = opts.license_new;
      newOpts.license = 'Others';
    }
  }

  if (opts.access_level_comment !== 'true') {
    newOpts.rights_desc = opts.access_level_comment;
    newOpts.access_level_comment = 'false';
  }

  if (opts.spatial) {
    newOpts.spatial_location_desc = opts.spatial;
    newOpts.spatial = true;
  }

  if (opts.temporal) {
    [newOpts.temporal_start_date, newOpts.temporal_end_date] = opts.temporal.split('/');
    newOpts.temporal = 'true';
  }

  if (opts.language) {
    [newOpts.languageSubTag, newOpts.languageRegSubTag] = opts.language.split('-');
  }

  if (opts.data_dictionary_type) {
    // Check if the data dictionary type is out of list,
    // then specify the other input field
    const selectedDataDictType = dataDictTypes.find((dataDictType) => {
      return dataDictType.value === opts.data_dictionary_type;
    });
    // If it is from the list then the type should be other
    if (!selectedDataDictType) {
      newOpts.otherDataDictionaryType = opts.data_dictionary_type;
      newOpts.describedByType = 'other';
    } else newOpts.describedByType = opts.data_dictionary_type;
  }

  if (opts.is_parent === 'true') {
    newOpts.isParent = 'Yes';
  } else {
    newOpts.isParent = 'No';
  }

  return newOpts;
};

/**
 * API CALLS
 */

const createDataset = (opts, apiUrl, apiKey) => {
  const encoded = encodeSupplementalValues(opts);
  encoded.name = slugify(opts.title, { lower: true, remove: /[*+~.()'"!:@]/g });
  encoded.modified = new Date();
  encoded.bureau_code = '015:11';
  encoded.program_code = '015:001';
  // encoded.temporal = '2020-12-22/2020-12-22'; // todo encode this
  // encoded.tag_string = 'tag1, tag2, tag3, tag4'; // TODO make tag string
  encoded.url = opts.url;
  return axios
    .post(`${apiUrl}package_create`, encoded, {
      headers: {
        'X-CKAN-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      // note that we don't return the axios response, we return the result
      const resVals = res.data.result;
      const decoded = decodeSupplementalValues(decodeExtras(resVals));
      return decoded;
    });
};

const createResource = (packageId, opts, apiUrl, apiKey) => {
  let body;
  if (opts.upload) {
    body = new FormData();
    body.append('package_id', packageId);
    Object.keys(opts).forEach((item) => {
      body.append(item, opts[item]);
    });
  } else {
    body = clone(opts);
    body.package_id = packageId;
  }

  return axios.post(`${apiUrl}resource_create`, body, {
    headers: {
      'X-CKAN-API-Key': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

const fetchDataset = async (id, apiUrl, apiKey) => {
  return axios
    .get(`${apiUrl}package_show?id=${id}`, {
      headers: {
        'X-CKAN-API-Key': apiKey,
      },
    })
    .then((res) => {
      // note that we don't return the axios response, we return the result
      const decoded = decodeSupplementalValues(decodeExtras(res.data.result));
      decoded.description = decoded.notes;
      return decoded;
    });
};

const updateDataset = (id, opts, apiUrl, apiKey) => {
  const encoded = encodeSupplementalValues(opts);
  encoded.modified = new Date();
  encoded.notes = opts.description; // TODO not sure what notes is supposed to be
  encoded.id = id;

  // TODO where do we get these?
  encoded.bureauCode = '015:11';
  encoded.programCode = '015:001';

  return axios
    .post(`${apiUrl}package_update`, encoded, {
      headers: {
        'X-CKAN-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      // note that we don't return the axios response, we return the result
      const resVals = res.data.result;
      const decoded = decodeSupplementalValues(decodeExtras(resVals));
      return decoded;
    });
};

const fetchTags = async (str, apiUrl, apiKey) => {
  try {
    const url = `${apiUrl}tag_list?query=${str}`;
    const res = await axios.get(url, {
      headers: {
        'X-CKAN-API-Key': apiKey,
      },
    });
    return res.data.result.map((row, i) => ({ id: i, name: row }));
  } catch (e) {
    return Promise.reject(e);
  }
};

const fetchOrganizationsForUser = async (apiUrl, apiKey) => {
  try {
    const url = `${apiUrl}organization_list_for_user`;
    const res = await axios.get(url, {
      headers: {
        'X-CKAN-API-Key': apiKey,
      },
    });
    return res.data.result;
  } catch (e) {
    return Promise.reject(e);
  }
};

const fetchParentDatasets = async (query, apiUrl, apiKey) => {
  try {
    // the space belongs here q= solr query string including indexed extras
    const url = `${apiUrl}package_search?q=${query} extras_is_parent=true`;
    const res = await axios.get(url, {
      headers: {
        'X-CKAN-API-Key': apiKey,
      },
    });
    return res.data.result.results;
  } catch (e) {
    return Promise.reject(e);
  }
};

export default {
  createDataset,
  updateDataset,
  fetchDataset,
  fetchTags,
  fetchOrganizationsForUser,
  fetchParentDatasets,
  createResource,
  helpers: {
    decodeExtras,
    clone,
  },
};
