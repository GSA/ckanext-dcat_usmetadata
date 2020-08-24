import moxios from 'moxios';
import Api from '.';
import mocks from '../mocks/apiMocks';

// eslint-disable-next-line
console.log('------------ Run API Tests ------------');
const {
  encodeExtras,
  decodeExtras,
  encodeSupplementalValues,
  decodeSupplementalValues,
} = Api.helpers;

const { fetchDataset, createDataset, updateDataset } = Api;
const {
  datasetOne,
  requiredMetadata,
  createDatasetResponse,
  additionalMetadata,
  updateDatasetResponse,
} = mocks;

describe('Test helpers', () => {
  describe('Encode extras', () => {
    it('should encode extras for Api consumption', () => {
      const opts = {
        accessLevel: 123,
        publisher: 'Willie onka',
        rights: 'Eternal',
      };

      const encoded = encodeExtras(opts);
      const accessLevel = encoded.extras.filter((row) => row.key === 'accessLevel');
      const temporal = encoded.extras.filter((row) => row.key === 'temporal');

      expect(encoded.extras).toBeInstanceOf(Array);
      expect(accessLevel[0].value).toBe(123);
      expect(temporal[0].value).toBe('');
    });
  });

  describe('Decode extras', () => {
    it('should correctly parse extras array', () => {
      const opts = {
        extras: [
          { key: 'accessLevel', value: 100 },
          { key: 'publisher', value: 'Willie Wonka' },
          { key: 'rights', value: 'MIT' },
        ],
      };

      const decoded = decodeExtras(opts);
      expect(true).toBe(true);
      expect(decoded.publisher).toBe('Willie Wonka');
      expect(decoded.accessLevel).toBe(100);
    });
  });

  describe('Encode supplemental values', () => {
    const opts = {
      license_others: 'Zany new license',
      rights_desc: 'Description of rights',
      spatial_location_desc: 'Far side of the moon',
      temperal_start_date: '11/11/2010',
      temporal_end_date: '11/11/2020',
      unchanged: 'unchanged',
    };

    const encoded = encodeSupplementalValues(opts);

    it('should properly encode supplemental values', () => {
      expect(encoded.license).toBe(opts.license_others);
      expect(encoded.rights).toBe(opts.rights_desc);
      expect(encoded.spatial).toBe(opts.spatial_location_desc);
      expect(encoded.unchanged).toBe(opts.unchanged);
    });
  });

  describe('Decode supplemental values', () => {
    const opts = {
      temperal_start_date: '11/11/2010',
      temporal_end_date: '11/11/2020',
      unchanged: 'unchanged',
      license: 'Zany new license',
      rights: 'Description of rights',
      spatial: 'Far side of the moon',
    };

    const decoded = decodeSupplementalValues(opts);
    it('should properly decode supplemental values', () => {
      expect(decoded.license_others).toBe(opts.license);
      expect(decoded.rights_desc).toBe(opts.rights);
      expect(decoded.rights).toBe('false');
      expect(decoded.spatial_location_desc).toBe(opts.spatial);
      expect(decoded.temporal_end_date).toBe(opts.temporal_end_date);
      expect(decoded.temporal_start_date).toBe(opts.temporal_start_date);
    });
  });

  describe('Test API', () => {
    beforeEach(() => {
      // import and pass your custom axios instance to this method
      moxios.install();
    });

    afterEach(() => {
      // import and pass your custom axios instance to this method
      moxios.uninstall();
    });

    describe('Fetch dataset', () => {
      it('should return fetched dataset from server', async () => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent();
          request.respondWith({
            status: 200,
            response: datasetOne,
          });
        });

        const res = await fetchDataset('test-id', 'APIURL', 'APIKEY');

        expect(res.data.result.title).toBe('Test Dataset 2');
        expect(typeof res.data.result).toBe('object');
        expect(Array.isArray(res.data.result.tags)).toBe(true);
        expect(Array.isArray(res.data.result.extras)).toBe(true);
      });
    });

    describe('Create dataset', () => {
      it('should return CKAN response when creating dataset', async () => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent();
          request.respondWith({
            status: 200,
            response: createDatasetResponse,
          });
        });

        const res = await createDataset('123', requiredMetadata, 'APIURL', 'APIKEY');

        expect(res.data.result.title).toBe('Test Dataset 1');
        expect(typeof res.data.result).toBe('object');
        expect(Array.isArray(res.data.result.tags)).toBe(true);
        expect(Array.isArray(res.data.result.extras)).toBe(true);
      });
    });

    describe('Update dataset', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          response: updateDatasetResponse,
        });
      });

      it('should successfully update an existing dataset', async () => {
        const res = await updateDataset('123', additionalMetadata, 'APIURL', 'APIKEY');
        expect(res.data.success).toBe(true);
        expect(res.data.result.title).toBe('Test Dataset 2');
      });
    });
  });
});
