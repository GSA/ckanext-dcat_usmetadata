import axios from 'axios';
import slugify from 'slugify';

const dataDictTypes = require('../components/AdditionalMetadata/data-dictionary-types');
const licenses = require('../components/RequiredMetadata/licenses.json');
const publishingFrequencyList = require('../components/AdditionalMetadata/publishingFrequencyList');

export const RESOURCE_URL_TYPES = {
  LINK_TO_FILE: 'url',
  UPLOAD_FILE: 'upload',
  LINK_TO_API: 'linkToApi',
  ACCESS_URL: 'accessUrl',
};

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
const ckanExtrasToDcat = {
  accrual_periodicity: 'accrualPeriodicity',
  data_dictionary_type: 'describedByType',
};

const deserializeExtras = (opts) => {
  const newOpts = clone(opts);
  newOpts.extras.forEach((cur) => {
    const newKey = ckanExtrasToDcat[cur.key] || cur.key;
    newOpts[newKey] = cur.value;
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

/**
 * Makes the necessary serialization for resource metadata
 * @param {Object} resource
 */
const serializeResource = (resource) => {
  const serializedResource = clone(resource);

  // delete serializedResource.resource_type;

  if (serializedResource.urlType) {
    if (
      serializedResource.urlType === RESOURCE_URL_TYPES.LINK_TO_API ||
      serializedResource.urlType === RESOURCE_URL_TYPES.ACCESS_URL
    ) {
      serializedResource.resource_type = 'accessurl';
      serializedResource.url_type = 'url';
    }
    if (serializedResource.urlType === RESOURCE_URL_TYPES.LINK_TO_FILE) {
      serializedResource.url_type = 'url';
    }
  }

  delete serializedResource.urlType;
  return serializedResource;
};

/**
 * Makes the necessary de-serialization for resource metadata
 * @param {Object} resource
 */
const deserializeResource = (resource) => {
  const deserializedResource = clone(resource);
  deserializedResource.urlType = resource.url_type;
  if (deserializedResource.resource_type === 'accessurl') {
    deserializedResource.urlType = RESOURCE_URL_TYPES.ACCESS_URL;
    if (deserializedResource.format === 'API') {
      deserializedResource.urlType = RESOURCE_URL_TYPES.LINK_TO_API;
    }
  }
  return deserializedResource;
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
    // const indexOfNotes = newOpts.extras.findIndex((x) => x.key === 'notes');
    // if (indexOfNotes > -1) {
    //   newOpts.extras[indexOfNotes].value = opts.description;
    // } else {
    //   newOpts.extras.push({ key: 'notes', value: newOpts.notes });
    // }
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
    newOpts.data_quality = opts.dataQuality === 'Yes';
    const indexOfDataQuality = newOpts.extras.findIndex((x) => x.key === 'data_quality');
    if (indexOfDataQuality > -1) {
      newOpts.extras[indexOfDataQuality].value = newOpts.data_quality;
    }
  }

  const indexOfCategory = newOpts.extras.findIndex((x) => x.key === 'category');
  if (opts.category) {
    if (indexOfCategory > -1) {
      newOpts.extras[indexOfCategory].value = opts.category;
    }
  } else if (indexOfCategory > -1) {
    newOpts.extras.splice(indexOfCategory, 1);
  }

  const indexOfDataDictionary = newOpts.extras.findIndex((x) => x.key === 'data_dictionary');
  if (opts.data_dictionary) {
    if (indexOfDataDictionary > -1) {
      newOpts.extras[indexOfDataDictionary].value = opts.data_dictionary;
    }
  } else if (indexOfDataDictionary > -1) {
    newOpts.extras.splice(indexOfDataDictionary, 1);
  }

  // Data Dictionary Type
  const indexOfDataDictionaryType = newOpts.extras.findIndex(
    (x) => x.key === 'data_dictionary_type'
  );
  if (opts.describedByType) {
    // If it's specified other
    if (opts.describedByType === 'other') {
      newOpts.data_dictionary_type = opts.otherDataDictionaryType;
      delete newOpts.otherDataDictionaryType;
    } else newOpts.data_dictionary_type = opts.describedByType;
    delete newOpts.describedByType;

    if (indexOfDataDictionaryType > -1) {
      newOpts.extras[indexOfDataDictionaryType].value = newOpts.data_dictionary_type;
    }
  } else if (indexOfDataDictionaryType > -1) {
    newOpts.extras.splice(indexOfDataDictionaryType, 1);
  }

  const indexOfAccrualPeriodicity = newOpts.extras.findIndex(
    (x) => x.key === 'accrual_periodicity'
  );
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

    if (indexOfAccrualPeriodicity > -1) {
      newOpts.extras[indexOfAccrualPeriodicity].value = newOpts.accrual_periodicity;
    }
  } else if (indexOfAccrualPeriodicity > -1) {
    newOpts.extras.splice(indexOfAccrualPeriodicity, 1);
  }

  const indexOfHomePageUrl = newOpts.extras.findIndex((x) => x.key === 'homepage_url');
  if (opts.homepage_url && indexOfHomePageUrl > -1) {
    newOpts.extras[indexOfHomePageUrl].value = opts.homepage_url;
  } else if (indexOfHomePageUrl > -1) {
    newOpts.extras.splice(indexOfHomePageUrl, 1);
  }

  // Language field should be constructed from language subtag and language
  // regional subtag:
  if (opts.languageSubTag) {
    newOpts.language =
      opts.languageSubTag + (opts.languageRegSubTag && `-${opts.languageRegSubTag}`);
  }
  delete newOpts.languageSubTag;
  delete newOpts.languageRegSubTag;
  const indexOfLanguage = newOpts.extras.findIndex((x) => x.key === 'language');
  if (indexOfLanguage > -1) {
    newOpts.extras[indexOfLanguage].value = newOpts.language;
  }

  const indexOfPrimaryITInvestmentUIIUSG = newOpts.extras.findIndex(
    (x) => x.key === 'primary_it_investment_uii'
  );
  if (opts.primary_it_investment_uii && indexOfPrimaryITInvestmentUIIUSG > -1) {
    newOpts.extras[indexOfPrimaryITInvestmentUIIUSG].value = opts.primary_it_investment_uii;
  } else if (indexOfPrimaryITInvestmentUIIUSG > -1) {
    newOpts.extras.splice(indexOfPrimaryITInvestmentUIIUSG, 1);
  }

  const indexOfRelatedDocuments = newOpts.extras.findIndex((x) => x.key === 'related_documents');
  if (opts.related_documents && indexOfRelatedDocuments > -1) {
    newOpts.extras[indexOfRelatedDocuments].value = opts.related_documents;
  } else if (indexOfRelatedDocuments > -1) {
    newOpts.extras.splice(indexOfRelatedDocuments, 1);
  }

  const indexOfReleaseDate = newOpts.extras.findIndex((x) => x.key === 'release_date');
  if (opts.release_date) {
    newOpts.release_date = toISODate(newOpts.release_date);
    if (indexOfReleaseDate > -1) {
      newOpts.extras[indexOfReleaseDate].value = newOpts.release_date;
    }
  } else {
    delete newOpts.release_date;
    // remove release date from extras if any
    if (indexOfReleaseDate > -1) {
      newOpts.extras.splice(indexOfReleaseDate, 1);
    }
  }

  const indexOfSystemOfRecrods = newOpts.extras.findIndex((x) => x.key === 'system_of_records');
  if (opts.system_of_records && indexOfSystemOfRecrods > -1) {
    newOpts.extras[indexOfSystemOfRecrods].value = opts.system_of_records;
  } else if (indexOfSystemOfRecrods > -1) {
    newOpts.extras.splice(indexOfSystemOfRecrods, 1);
  }

  const indexOfIsParent = newOpts.extras.findIndex((x) => x.key === 'is_parent');
  if (opts.isParent === 'Yes') {
    newOpts.is_parent = 'true';
    delete newOpts.parent_dataset;
    newOpts.extras = newOpts.extras.filter((extra) => extra.key !== 'parent_dataset');
    if (indexOfIsParent > -1) {
      newOpts.extras[indexOfIsParent].value = newOpts.is_parent;
    }
  } else if (opts.isParent === 'No') {
    newOpts.is_parent = 'false';
    if (indexOfIsParent > -1) {
      newOpts.extras[indexOfIsParent].value = newOpts.is_parent;
    }
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

  const { selectedPublisher } = newOpts;
  if (selectedPublisher) {
    // First delete all publishers initially came from backend
    if (newOpts.extras)
      newOpts.extras = newOpts.extras.filter(({ key }) => {
        if (publisherProps.includes(key)) {
          delete newOpts[key];
          return false;
        }
        return true;
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
  // deserialize resources
  newOpts.resources = (newOpts.resources || []).map((resource) => {
    return deserializeResource(resource);
  });

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
  } else {
    newOpts.license = 'n/a';
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

  if (opts.data_quality === 'true') {
    newOpts.dataQuality = 'Yes';
  } else if (opts.data_quality === 'false') {
    newOpts.dataQuality = 'No';
  }

  if (opts.language) {
    [newOpts.languageSubTag, newOpts.languageRegSubTag] = opts.language.split('-');
  }

  if (opts.describedByType) {
    // Check if the data dictionary type is out of list,
    // then specify the other input field
    const selectedDataDictType = dataDictTypes.find((dataDictType) => {
      return dataDictType.value === opts.describedByType;
    });
    // If it is from the list then the type should be other
    if (!selectedDataDictType) {
      newOpts.otherDataDictionaryType = opts.describedByType;
      newOpts.describedByType = 'other';
    } else newOpts.describedByType = opts.describedByType;
  }

  if (opts.is_parent === 'true') {
    newOpts.isParent = 'Yes';
  } else {
    newOpts.isParent = 'No';
  }

  if (opts.parent_dataset) {
    newOpts.parentDataset = opts.parent_dataset;
  }

  if (opts.accrualPeriodicity) {
    // Check if it defined in the list
    if (publishingFrequencyList.find((item) => item.value === opts.accrualPeriodicity)) {
      newOpts.accrualPeriodicity = opts.accrualPeriodicity;
    }
    // Check if it is custom if not fallback to ad needed
    else if (opts.accrualPeriodicity.indexOf('R/P') !== -1) {
      newOpts.accrualPeriodicity = 'other';
      newOpts.accrualPeriodicityOther = opts.accrualPeriodicity;
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

const moveToExtras = (opts) => {
  const newOpts = clone(opts);
  const extras = [];

  const keysToCheck = [
    'publisher',
    'contact_name',
    'contact_email',
    'unique_id',
    'modified',
    'public_access_level',
    'bureau_code',
    'program_code',
    'release_date',
    'accrual_periodicity',
    'language',
    'data_quality',
    'publishing_status',
    'is_parent',
    'parent_dataset',
    'category',
    'related_documents',
    'conforms_to',
    'homepage_url',
    'system_of_records',
    'primary_it_investment_uii',
    'publisher_1',
    'publisher_2',
    'publisher_3',
    'publisher_4',
    'publisher_5',
  ];

  for (let i = 0; i < keysToCheck.length; i += 1) {
    if (keysToCheck[i] in opts) {
      extras.push({ key: keysToCheck[i], value: opts[keysToCheck[i]] });
      delete newOpts[keysToCheck[i]];
    }
  }

  const commonCore = {};
  for (let i = 0; i < extras.length; i += 1) {
    commonCore[extras[i].key] = extras[i].value;
  }

  newOpts.common_core = commonCore;
  newOpts.extras = extras;
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
  body.notes = body.notes || '';
  delete body.url;
  body.bureau_code = '015:11';
  body.program_code = '015:001';

  return axios
    .post(`${apiUrl}package_create`, encodeValues(moveToExtras(body)), {
      headers: {
        'X-CKAN-API-Key': apiKey,
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
    Object.keys(serializeResource(opts)).forEach((item) => {
      body.append(item, opts[item]);
    });
  } else {
    body = serializeResource(opts);
    body.package_id = packageId;
    body = encodeValues(body);
  }

  return axios
    .post(`${apiUrl}resource_create`, body, {
      headers: {
        'X-CKAN-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      // eslint-disable-next-line no-return-assign
      if (res.data) res.data.result = deserializeResource(res.data.result);
      return res;
    });
};

const updateResource = (resource, apiUrl, apiKey) => {
  let body;
  if (resource.upload) {
    body = new FormData();
    Object.keys(serializeResource(resource)).forEach((item) => {
      if (resource[item] !== null) {
        body.append(item, resource[item]);
      }
    });
  } else {
    body = encodeValues(serializeResource(resource));
  }

  return axios
    .post(`${apiUrl}resource_update`, body, {
      headers: {
        'X-CKAN-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => {
      // eslint-disable-next-line no-return-assign
      if (res.data) res.data.result = deserializeResource(res.data.result);
      return res;
    });
};

const deleteResource = (id, apiUrl, apiKey) => {
  const body = encodeValues({ id });

  return axios.post(`${apiUrl}resource_delete`, body, {
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
  body.bureau_code = '015:11';
  body.program_code = '015:001';

  return axios
    .post(`${apiUrl}package_update`, encodeValues(moveToExtras(body)), {
      headers: {
        'X-CKAN-API-Key': apiKey,
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
    const url = `${apiUrl}parent_dataset_options`;
    const res = await axios.post(
      url,
      {},
      {
        headers: {
          'X-CKAN-API-Key': apiKey,
        },
      }
    );
    return Object.keys(res.data.result).map((id) => {
      return {
        id,
        name: res.data.result[id],
      };
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

// Fetch list of available publishers for given organization id
const fetchPublishers = async (orgId, apiUrl, apiKey) => {
  if (!orgId) {
    // User hasn't selected org yet
    return [];
  }
  const url = `${apiUrl}organization_show?id=${orgId}`;
  const res = await axios.get(url, {
    headers: {
      'X-CKAN-API-Key': apiKey,
    },
  });
  const publisherExtra = res.data.result.extras.find((extra) => {
    return extra.key === 'publisher';
  });
  if (!publisherExtra) {
    // The org has no publishers - admin hasn't imported yet
    return [];
  }
  const publishersDictionary = JSON.parse(publisherExtra.value).map((row) => {
    // Note that row[0] is org name
    return {
      publisher: row[1],
      publisher_1: row[2] || null,
      publisher_2: row[3] || null,
      publisher_3: row[4] || null,
      publisher_4: row[5] || null,
      publisher_5: row[6] || null,
    };
  });
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
  updateResource,
  deleteResource,
  helpers: {
    serializeSupplementalValues,
    deserializeSupplementalValues,
    deserializeExtras,
    clone,
  },
  fetchPublishers,
};
