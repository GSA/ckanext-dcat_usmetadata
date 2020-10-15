import moxios from 'moxios';
import Api from '.';
import mocks from '../mocks/apiMocks';

// eslint-disable-next-line
console.log('------------ Run API Tests ------------');
const { decodeExtras } = Api.helpers;

const { fetchDataset, createDataset, updateDataset } = Api;
const {
  datasetOne,
  requiredMetadata,
  createDatasetResponse,
  additionalMetadata,
  updateDatasetResponse,
} = mocks;

describe('Test helpers', () => {
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

      it('should encode the field names and values when creating dataset', async () => {
        const title = 'Some title with special chars: $&@';
        const description = 'Some description with special chars: $&@';
        const fieldNameWithSpecialChars = 'a&l#@!ls1';
        const fieldNameEncoded = 'a%26l%23%40!ls1';

        moxios.wait(() => {
          const request = moxios.requests.mostRecent();
          const payload = JSON.parse(request.config.data);

          expect(request.config.method).toBe('post');
          expect(payload.title).toBe('Some%20title%20with%20special%20chars%3A%20%24%26%40');
          expect(payload.description).toBe(
            'Some%20description%20with%20special%20chars%3A%20%24%26%40'
          );
          expect(payload[fieldNameEncoded]).toBe('Foo');
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
        moxios.wait(() => {
          const request = moxios.requests.mostRecent();
          const payload = JSON.parse(request.config.data);

          expect(request.config.method).toBe('post');
          expect(payload.themes).toBe('Some%20theme%20with%20special%20chars%3A%20%24%26%40');
          expect(payload[fieldNameEncoded]).toBe('Foo');

          request.respondWith({
            status: 200,
            response: updateDatasetResponse,
          });
        });

        await updateDataset(
          '123',
          { ...additionalMetadata, themes, [fieldNameWithSpecialChars]: 'Foo' },
          'APIURL',
          'APIKEY'
        );
      });
    });
  });
});
