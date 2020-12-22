import axios from 'axios';
import slugify from 'slugify';

const dataDictTypes = require('../components/AdditionalMetadata/data-dictionary-types');
const licenses = require('../components/RequiredMetadata/licenses.json');
const publishingFrequencyList = require('../components/AdditionalMetadata/publishingFrequencyList');
const publishersDictionary = require('../components/RequiredMetadata/publishers.json');

// There are 5 possible publishers/subpublishers
const publisherProps = [
  'publisher',
  'publisher_1',
  'publisher_2',
  'publisher_3',
  'publisher_4',
  'publisher_5',
];

/**
 *  Gets the last existing child/leaf from the publishers
 * @param {*} publisher
 */
const getLeafPublisher = (publisher) => {
  return (
    publisher.publisher_5 ||
    publisher.publisher_4 ||
    publisher.publisher_3 ||
    publisher.publisher_2 ||
    publisher.publisher_1 ||
    publisher.publisher
  );
};

/**
 * HELPERS
 */
const clone = (param) => JSON.parse(JSON.stringify(param));

/**
 * Converts mm/dd/yyyy -> yyyy-mm-dd
 */
const toISODate = (dateStr) => {
  let converted = dateStr;
  const dateParts = dateStr.split('/');
  // this means that date is in dd/mm/yyyy format
  if (dateParts.length === 3) {
    const [month, day, year] = dateParts;
    converted = `${year}-${month}-${day}`;
  }

  return converted;
};

/**
 * Deserialize extras from CKAN 2.8.2 Groups format
 */
const deserializeExtras = (opts) => {
  const newOpts = clone(opts);
  newOpts.extras.forEach((cur) => {
    newOpts[cur.key] = cur.value;
  });
  return newOpts;
};

/**
 * Converts to JSON string and encodes to URI encoded
 * @param {Object} obj
 */
const encodeValues = (obj) => {
  return encodeURIComponent(JSON.stringify(obj));
};

// serialize values from USMetadata format to match form values
const serializeSupplementalValues = (opts) => {
  const newOpts = clone(opts);
  newOpts.modified = new Date();
  newOpts.extras = newOpts.extras || [];

  if (opts.title) {
    const indexOfTitle = newOpts.extras.findIndex((x) => x.key === 'title');
    if (indexOfTitle > -1) {
      newOpts.extras[indexOfTitle].value = opts.title;
    }
  }

  if (opts.description) {
    newOpts.notes = opts.description;
    const indexOfNotes = newOpts.extras.findIndex((x) => x.key === 'notes');
    if (indexOfNotes > -1) {
      newOpts.extras[indexOfNotes].value = opts.description;
    }
  }

  if (opts.tags && opts.tags.length > 0) {
    newOpts.tag_string = opts.tags.reduce((acc, cur) => {
      if (acc.length === 0) {
        return cur.name;
      }
      return `${acc}, ${cur.name}`;
    }, '');
  }

  const indexOfContactName = newOpts.extras.findIndex((x) => x.key === 'contact_name');
  if (indexOfContactName > -1) {
    newOpts.extras[indexOfContactName].value = newOpts.contact_name;
  }

  const indexOfContactEmail = newOpts.extras.findIndex((x) => x.key === 'contact_email');
  if (indexOfContactEmail > -1) {
    newOpts.extras[indexOfContactEmail].value = newOpts.contact_email;
  }

  const indexOfUniqueId = newOpts.extras.findIndex((x) => x.key === 'unique_id');
  if (indexOfUniqueId > -1) {
    newOpts.extras[indexOfUniqueId].value = newOpts.unique_id;
  }

  const indexOfPublicAccessLevel = newOpts.extras.findIndex((x) => x.key === 'public_access_level');
  if (indexOfPublicAccessLevel > -1) {
    newOpts.extras[indexOfPublicAccessLevel].value = newOpts.public_access_level;
  }

  const indexOfLicense = newOpts.extras.findIndex((x) => x.key === 'license_new');
  if (opts.license === 'n/a') {
    // if the license is selected "no license"
    delete newOpts.license_new;
    delete newOpts.license_others;
    delete newOpts.licenseOther;
    // Delete 'license_new' from extras if exists so we can add a new value
    if (indexOfLicense > -1) {
      newOpts.extras.splice(indexOfLicense, 1);
    }
  } else if (opts.license) {
    if (opts.license === 'other') newOpts.license_new = opts.licenseOther;
    else newOpts.license_new = opts.license;
    delete newOpts.license_others;
    delete newOpts.licenseOther;
    if (indexOfLicense > -1) {
      newOpts.extras[indexOfLicense].value = newOpts.license_new;
    }
  }

  // if access_level_comment is false use provided description
  if (opts.access_level_comment === 'false' && opts.rights_desc) {
    newOpts.access_level_comment = opts.rights_desc;
    delete newOpts.rights_desc;
  } else {
    newOpts.access_level_comment = 'true';
  }
  const indexOfAccessLevel = newOpts.extras.findIndex((x) => x.key === 'access_level_comment');
  if (indexOfAccessLevel > -1) {
    newOpts.extras[indexOfAccessLevel].value = newOpts.access_level_comment;
  }

  if (opts.spatial === 'false') {
    delete newOpts.spatial;
    const indexOfSpatial = newOpts.extras.findIndex((x) => x.key === 'spatial');
    if (indexOfSpatial > -1) {
      newOpts.extras.splice(indexOfSpatial, 1);
    }
  } else if (opts.spatial_location_desc) {
    newOpts.spatial = opts.spatial_location_desc;
    delete newOpts.spatial_location_desc;
  }

  if (opts.temporal === 'true') {
    const start = toISODate(opts.temporal_start_date);
    const end = toISODate(opts.temporal_end_date);
    newOpts.temporal = `${start}/${end}`;
    delete newOpts.temporal_start_date;
    delete newOpts.temporal_end_date;
  } else {
    delete newOpts.temporal;
    delete newOpts.temporal_start_date;
    delete newOpts.temporal_end_date;
    const indexOfTemporal = newOpts.extras.findIndex((x) => x.key === 'temporal');
    if (indexOfTemporal > -1) {
      newOpts.extras.splice(indexOfTemporal, 1);
    }
  }

  if (opts.dataQuality) {
    newOpts.data_quality = opts.dataQuality;
  }

  if (opts.release_date) {
    newOpts.release_date = toISODate(newOpts.release_date);
  } else {
    delete newOpts.release_date;
    // remove release date from extras if any
    if (newOpts.extras)
      newOpts.extras = newOpts.extras.filter(({ key }) => {
        return key !== 'release_date';
      });
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
    newOpts.is_parent = 'true';
    delete newOpts.parent_dataset;
    newOpts.extras = newOpts.extras.filter((extra) => extra.key !== 'parent_dataset');
  } else if (opts.isParent === 'No') {
    newOpts.is_parent = 'false';
    if (opts.parentDataset) {
      newOpts.parent_dataset = opts.parentDataset;
    } else {
      delete newOpts.parent_dataset;
      newOpts.extras = newOpts.extras.filter((extra) => extra.key !== 'parent_dataset');
    }
  } else {
    delete newOpts.is_parent;
    delete newOpts.parent_dataset;
  }

  if (opts.accrualPeriodicity) {
    newOpts.accrual_periodicity = opts.accrualPeriodicity;
    if (opts.accrualPeriodicity === 'other') {
      newOpts.accrual_periodicity = opts.accrualPeriodicityOther;
      // make sure that R/ is added at the beginning
      if (newOpts.accrual_periodicity.substring(0, 2) !== 'R/')
        newOpts.accrual_periodicity = `R/${newOpts.accrual_periodicity}`;
    }
    delete newOpts.accrualPeriodicityOther;
    delete newOpts.accrualPeriodicity;
  }

  const { selectedPublisher } = newOpts;
  if (selectedPublisher) {
    // First delete all publishers initially came from backend
    if (newOpts.extras)
      newOpts.extras = newOpts.extras.filter(({ key }) => {
        delete newOpts[key];
        return !publisherProps.includes(key);
      });

    // eslint-disable-next-line no-restricted-syntax
    for (const publisherPropName of publisherProps) {
      const publisher = selectedPublisher[publisherPropName];
      if (publisher) {
        newOpts[publisherPropName] = publisher;
      }
    }
  }

  return newOpts;
};

// deserialize values from form values to match USMetadata format
const deserializeSupplementalValues = (opts) => {
  const newOpts = clone(opts);
  if (opts.tag_string) {
    newOpts.tags = opts.tag_string.split(',').map((n, i) => ({ id: i, name: n }));
  } else if (opts.tags) {
    newOpts.tags = opts.tags.map((row) => ({ id: row.id, name: row.name }));
  }

  if (opts.license_new) {
    if (licenses.map((license) => license.value).includes(opts.license_new)) {
      newOpts.license = opts.license_new;
    } else {
      newOpts.licenseOther = opts.license_new;
      newOpts.license = 'other';
    }
  }

  if (opts.access_level_comment !== 'true') {
    newOpts.rights_desc = opts.access_level_comment;
    newOpts.access_level_comment = 'false';
  }

  if (opts.spatial) {
    newOpts.spatial_location_desc = opts.spatial;
    newOpts.spatial = 'true';
  }

  if (opts.temporal) {
    [newOpts.temporal_start_date, newOpts.temporal_end_date] = opts.temporal.split('/');
    newOpts.temporal = 'true';
  }

  if (opts.data_quality) {
    newOpts.dataQuality = opts.data_quality;
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

  if (opts.parent_dataset) {
    newOpts.parentDataset = opts.parent_dataset;
  }

  if (opts.accrual_periodicity) {
    // Check if it defined in the list
    if (publishingFrequencyList.find((item) => item.value === opts.accrual_periodicity)) {
      newOpts.accrualPeriodicity = opts.accrual_periodicity;
    }
    // Check if it is custom if not fallback to ad needed
    else if (opts.accrual_periodicity.indexOf('R/P') !== -1) {
      newOpts.accrualPeriodicity = 'other';
      newOpts.accrualPeriodicityOther = opts.accrual_periodicity;
    }
  }
  const publisher = {};
  // eslint-disable-next-line array-callback-return
  (opts.extras || []).map(({ key, value }) => {
    if (publisherProps.includes(key)) {
      publisher[key] = value;
    }
  });
  newOpts.publisher = getLeafPublisher(publisher);

  return newOpts;
};

/**
 * API CALLS
 */

const createDataset = (opts, apiUrl, apiKey) => {
  const body = serializeSupplementalValues(opts);
  body.name = opts.url
    ? opts.url.split('/').pop()
    : slugify(opts.title, { lower: true, remove: /[*+~.()'"!:@]/g });
  delete body.url;
  body.bureau_code = '015:11';
  body.program_code = '015:001';
  return axios
    .post(`${apiUrl}package_create`, encodeValues(body), {
      headers: {
        'X-CKAN-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      // note that we don't return the axios response, we return the result
      const resVals = res.data.result;
      const result = deserializeSupplementalValues(deserializeExtras(resVals));
      return result;
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
    body = encodeValues(body);
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
      const result = deserializeSupplementalValues(deserializeExtras(res.data.result));
      result.description = result.notes;
      return result;
    });
};

const updateDataset = (id, opts, apiUrl, apiKey) => {
  const body = serializeSupplementalValues(opts);
  body.id = id;

  body.name = opts.url ? opts.url.split('/').pop() : body.name;
  delete body.url;

  // TODO where do we get these?
  body.bureauCode = '015:11';
  body.programCode = '015:001';

  return axios
    .post(`${apiUrl}package_update`, encodeValues(body), {
      headers: {
        'X-CKAN-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      // note that we don't return the axios response, we return the result
      const resVals = res.data.result;
      const result = deserializeSupplementalValues(deserializeExtras(resVals));
      return result;
    });
};

const patchDataset = (id, opts, apiUrl, apiKey) => {
  const body = Object.assign(opts, { id });
  return axios.post(`${apiUrl}package_patch`, encodeValues(body), {
    headers: {
      'X-CKAN-API-Key': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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

/**
 * Get list of organizations where a given user has "create_dataset" permission
 */
const fetchOrganizationsForUser = async (apiUrl, apiKey) => {
  try {
    const url = `${apiUrl}organization_list_for_user`;
    const body = {
      permission: 'create_dataset',
    };
    const res = await axios.post(url, body, {
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
    return (res.data.result.results || []).map(({ id, title }) => {
      return {
        id,
        name: title,
      };
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

// TODO depending on the changes in the backend this might be moved to API
const fetchPublishers = async () => {
  // TODO Currently the list is static, but later this is going to be provided dynamically
  return publishersDictionary
    .map((publisher, index) => {
      // TODO here we choose index as an id, but we later we suppose it will be given by the backend
      const id = index;
      const leafPublisher = getLeafPublisher(publisher);
      return { id, name: leafPublisher, ...publisher };
    })
    .sort();
};

export default {
  createDataset,
  updateDataset,
  patchDataset,
  fetchDataset,
  fetchTags,
  fetchOrganizationsForUser,
  fetchParentDatasets,
  createResource,
  helpers: {
    serializeSupplementalValues,
    deserializeSupplementalValues,
    deserializeExtras,
    clone,
  },
  fetchPublishers,
};
