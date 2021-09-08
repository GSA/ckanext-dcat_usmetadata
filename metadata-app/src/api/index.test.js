import moxios from 'moxios';
import Api from '.';
import mocks from '../mocks/apiMocks';

const { helpers } = Api;
const { fetchDataset, createDataset, updateDataset, createResource, updateResource } = Api;
const {
  datasetOne,
  requiredMetadata,
  createDatasetResponse,
  additionalMetadata,
  updateDatasetResponse,
} = mocks;

describe('Test helpers', () => {
  describe('Deserialize extras', () => {
    it('should correctly parse extras array', () => {
      const opts = {
        extras: [{ key: 'my_key', value: 100 }],
      };

      const decoded = helpers.deserializeExtras(opts);
      expect(decoded.my_key).toBe(100);
    });
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

      const result = await fetchDataset('test-id', 'APIURL', 'APIKEY');

      expect(result.title).toBe('Test Dataset 1');
      expect(typeof result).toBe('object');
      expect(Array.isArray(result.tags)).toBe(true);
      expect(Array.isArray(result.extras)).toBe(true);
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

      const result = await createDataset(requiredMetadata, 'APIURL', 'APIKEY');
      expect(result.title).toBe('Test Dataset 2');
      expect(typeof result).toBe('object');
      expect(Array.isArray(result.tags)).toBe(true);
      expect(Array.isArray(result.extras)).toBe(true);
    });

    it('should send the temporal dates in correct ISO format', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        expect(payload.temporal).toBe('2020-01-13/2021-05-23');

        request.respondWith({
          status: 200,
          response: createDatasetResponse,
        });
      });

      await createDataset(
        {
          ...requiredMetadata,
          temporal_start_date: '01/13/2020',
          temporal_end_date: '05/23/2021',
        },
        'APIURL',
        'APIKEY'
      );
    });

    it('should send the release date in correct ISO format', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        let received = '';
        for (let i = 0; i < payload.extras.length; i += 1) {
          if (payload.extras[i].key === 'release_date') {
            received = payload.extras[i].value;
          }
        }
        expect(received).toBe('2020-01-14');

        request.respondWith({
          status: 200,
          response: createDatasetResponse,
        });
      });

      await createDataset(
        {
          ...requiredMetadata,
          release_date: '01/14/2020',
        },
        'APIURL',
        'APIKEY'
      );
    });

    it('should send the Data Publishing Frequency in correct ISO-8601 format added with R/ prefix', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        let received = '';
        for (let i = 0; i < payload.extras.length; i += 1) {
          if (payload.extras[i].key === 'accrual_periodicity') {
            received = payload.extras[i].value;
          }
        }
        expect(received).toBe('R/P1Y30DT15M39S');

        request.respondWith({
          status: 200,
          response: createDatasetResponse,
        });
      });

      await createDataset(
        {
          ...requiredMetadata,
          accrualPeriodicity: 'other',
          accrualPeriodicityOther: 'P1Y30DT15M39S',
        },
        'APIURL',
        'APIKEY'
      );
    });

    it('should encode the field names and values when creating dataset', async () => {
      const title = 'Some title with special chars: $&@';
      const description = 'Some description with special chars: $&@';
      const fieldNameWithSpecialChars = 'a&l#@!ls1';
      const fieldNameEncoded = 'a%26l%23%40!ls1';

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        expect(request.config.method).toBe('post');
        expect(payload.title).toBe(title);
        expect(payload.description).toBe(description);
        expect(payload[fieldNameWithSpecialChars]).toBe('Foo');
        expect(payloadStr).toEqual(expect.stringContaining(fieldNameEncoded));
        expect(payloadStr).toEqual(
          expect.stringContaining('Some%20description%20with%20special%20chars%3A%20%24%26%40')
        );
        expect(payloadStr).toEqual(
          expect.stringContaining('Some%20title%20with%20special%20chars%3A%20%24%26%40')
        );

        request.respondWith({
          status: 200,
          response: createDatasetResponse,
        });
      });

      await createDataset(
        { ...requiredMetadata, title, description, [fieldNameWithSpecialChars]: 'Foo' },
        'APIURL',
        'APIKEY'
      );
    });
  });

  describe('Update dataset', () => {
    it('should successfully update an existing dataset', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          response: updateDatasetResponse,
        });
      });

      const result = await updateDataset('123', additionalMetadata, 'APIURL', 'APIKEY');
      expect(result.title).toBe('Test Dataset 2');
    });

    it('should encode the field names and values when updating dataset', async () => {
      const themes = 'Some theme with special chars: $&@';
      const fieldNameWithSpecialChars = 'a&l#@!ls1';
      const fieldNameEncoded = 'a%26l%23%40!ls1';
      const description = 'Some description with special chars: $&@';
      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        expect(request.config.method).toBe('post');
        expect(payload.themes).toBe(themes);
        expect(payload[fieldNameWithSpecialChars]).toBe('Foo');
        expect(payload.notes).toBe(description);
        expect(payloadStr).toEqual(
          expect.stringContaining('Some%20theme%20with%20special%20chars%3A%20%24%26%40')
        );
        expect(payloadStr).toEqual(
          expect.stringContaining('Some%20description%20with%20special%20chars%3A%20%24%26%40')
        );
        expect(payloadStr).toEqual(expect.stringContaining(fieldNameEncoded));
        request.respondWith({
          status: 200,
          response: updateDatasetResponse,
        });
      });

      await updateDataset(
        '123',
        { ...additionalMetadata, themes, description, [fieldNameWithSpecialChars]: 'Foo' },
        'APIURL',
        'APIKEY'
      );
    });
  });

  describe('Resource', () => {
    it('should encode the field names and values when creating resource', async () => {
      const fieldNameWithSpecialChars = 'a&l#@!ls1';
      const fieldNameEncoded = 'a%26l%23%40!ls1';

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        expect(request.config.method).toBe('post');
        expect(payload[fieldNameWithSpecialChars]).toBe('Foo');
        expect(payloadStr).toEqual(expect.stringContaining(fieldNameEncoded));
        request.respondWith({
          status: 200,
          response: updateDatasetResponse,
        });
      });

      await createResource('123', { [fieldNameWithSpecialChars]: 'Foo' }, 'APIURL', 'APIKEY');
    });
    it('should encode the field names and values when editing resource', async () => {
      const fieldNameWithSpecialChars = 'a&l#@!ls1';
      const fieldNameEncoded = 'a%26l%23%40!ls1';

      moxios.wait(() => {
        const request = moxios.requests.mostRecent();
        const payloadStr = request.config.data;
        const payload = JSON.parse(decodeURIComponent(payloadStr));

        expect(request.config.method).toBe('post');
        expect(payload[fieldNameWithSpecialChars]).toBe('Foo');
        expect(payloadStr).toEqual(expect.stringContaining(fieldNameEncoded));
        request.respondWith({
          status: 200,
          response: updateDatasetResponse,
        });
      });

      await updateResource({ [fieldNameWithSpecialChars]: 'Foo' }, 'APIURL', 'APIKEY');
    });
  });
});
