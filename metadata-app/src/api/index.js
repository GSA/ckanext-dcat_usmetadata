import axios from 'axios';

const EXTRAS = [
  'accessLevel',
  'accrualPeriodicity',
  'bureauCode',
  'category',
  'contactEmail',
  'contactPoint',
  'dataQuality',
  'dataLevel',
  'describedBy',
  'describedByType',
  'frequency',
  'homePage',
  'identifier',
  'isPartOf',
  'issued',
  'landingPage',
  'language',
  'license',
  'master',
  'organization',
  'publisher',
  'primaryITInvestmentUIIUSG',
  'programCode',
  'references',
  'rights',
  'spatial',
  'subagency',
  'systemOfRecordsUSG',
  'temporal',
  'theme',
];
/**
 * HELPERS
 */
const safeName = (name) => name.split(' ').join('_').replace(/\W/g, '').toLowerCase();
const clone = (param) => JSON.parse(JSON.stringify(param));

/**
 * Encode extras for CKAN 2.8.2 Groups format
 */
const encodeExtras = (opts) => {
  const newOpts = clone(opts);

  let extras;
  if (opts) {
    extras = EXTRAS.map((key) => {
      return {
        key,
        value: opts[key] || '',
      };
    });
  } else {
    extras = [{}];
  }

  newOpts.extras = extras;
  return newOpts;
};

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

const encodeSupplementalValues = (opts) => {
  const newOpts = clone(opts);

  if (opts.description) {
    newOpts.notes = opts.description;
  }

  if (opts.license_others) {
    newOpts.license = opts.license_others;
    delete newOpts.license_others;
  }

  if (opts.rights_desc) {
    newOpts.rights = opts.rights_desc;
    delete newOpts.rights_desc;
  }

  if (opts.spatial_location_desc) {
    newOpts.spatial = opts.spatial_location_desc;
    delete newOpts.spatial_location_desc;
  }

  if (opts.temporal_start_date) {
    const start = new Date(opts.temporal_start_date).toISOString();
    const end = new Date(opts.temporal_end_date).toISOString();
    newOpts.temporal = `${start}/${end}`;
    delete newOpts.temporal_start_date;
    delete newOpts.temporal_end_date;
  }

  return newOpts;
};

const decodeSupplementalValues = (opts) => {
  const newOpts = clone(opts);

  if (opts.license) {
    newOpts.license_others = opts.license;
    newOpts.license = 'Others';
  }

  if (opts.rights) {
    newOpts.rights_desc = opts.rights;
    newOpts.rights = 'false';
  }

  if (opts.spatial) {
    newOpts.spatial_location_desc = opts.spatial;
    newOpts.spatial = true;
  }

  if (opts.temporal) {
    [newOpts.temporal_start_date, newOpts.temporal_end_date] = opts.temporal.split('/');
    newOpts.temporal = 'true';
  }

  return newOpts;
};

/**
 * API CALLS
 */

const createDataset = (ownerOrg, opts, apiUrl, apiKey) => {
  const newOpts = clone(opts);
  newOpts.modified = new Date();
  newOpts.notes = opts.description; // TODO not sure what notes is supposed to be

  // TODO where do we get these?
  newOpts.bureauCode = '015:11';
  newOpts.programCode = '015:001';

  const encoded = encodeExtras(encodeSupplementalValues(opts));
  encoded.owner_org = ownerOrg;
  encoded.name = safeName(opts.title);
  encoded.description = encoded.notes;
  encoded.url = opts.url;
  return axios
    .post(`${apiUrl}package_create`, encoded, {
      headers: {
        'X-CKAN-API-Key': apiKey,
      },
    })
    .then((res) => {
      // note that we don't return the axios response, we return the result
      const resVals = res.data.result;
      const decoded = decodeExtras(decodeSupplementalValues(resVals));
      return decoded;
    });
};

const createResource = (packageId, opts, apiUrl, apiKey) => {
  const newOpts = clone(opts);
  newOpts.package_id = packageId;
  if (opts.upload) {
    newOpts.mime_type = opts.upload.type;
    newOpts.size = opts.upload.size;
  }
  return axios.post(`${apiUrl}resource_create`, opts, {
    headers: {
      'X-CKAN-API-Key': apiKey,
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
  const encoded = encodeExtras(encodeSupplementalValues(opts));
  encoded.id = id;

  return axios.post(`${apiUrl}package_update`, encoded, {
    headers: {
      'X-CKAN-API-Key': apiKey,
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

export default {
  createDataset,
  updateDataset,
  fetchDataset,
  fetchTags,
  createResource,
  helpers: {
    encodeExtras,
    decodeExtras,
    encodeSupplementalValues,
    decodeSupplementalValues,
    clone,
    safeName,
  },
};
