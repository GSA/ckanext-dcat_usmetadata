"""Tests for plugin.py."""

import pytest
import six

from ckan import plugins

try:
    from ckan.tests import factories
    from ckan.tests.helpers import FunctionalTestBase, reset_db
except ImportError:
    from ckan.new_tests import factories
    from ckan.new_tests.helpers import FunctionalTestBase, reset_db


# def test_plugin():
#     '''
#         This was the only test that existed when I first started upgrading
#         this extension.  The below tests were recovered from previous commit,
#             https://github.com/GSA/ckanext-dcat_usmetadata/commit/
#             cea27a7cdaf2110527d9de9d61db0645180a5603#diff-72c130e5
#             a6d283c1e38b6d2bcf75b061c36a0fdf6826c48dba1308e052c8bbd0
#         The tests were added in the commit prior to this one and then
#         promptly removed.  We will see if these tests can work..
#     '''
#     pass


@pytest.mark.usefixtures("with_request_context")
class TestReactMetadataPlugin(FunctionalTestBase):

    @classmethod
    def setup(cls):
        reset_db()

    @classmethod
    def setupclass(cls):
        super(TestReactMetadataPlugin, cls).setup_class()
        if not plugins.plugin_loaded('dcat_usmetadata'):
            plugins.load('dcat_usmetadata')

    def create_datasets(self):
        self.user = factories.Sysadmin()

        self.organization = factories.Organization()
        if six.PY2:
            self.extra_environ = {'REMOTE_USER': self.user['name'].encode('ascii')}
        else:
            self.extra_environ = {'REMOTE_USER': self.user['name']}
        # token_dict = call_action('api_token_create')
        # print(token_dict)

        self.dataset1 = {
            'name': 'my_package_000',
            'title': 'my package',
            'notes': 'my package notes',
            'public_access_level': 'public',
            'access_level_comment': 'Access level comment',
            'unique_id': '000',
            'contact_name': 'Jhon',
            'program_code': '018:001',
            'bureau_code': '019:20',
            'contact_email': 'jhon@mail.com',
            'publisher': 'Publicher 01',
            'modified': '2019-01-27 11:41:21',
            'tag_string': 'mypackage,tag01,tag02',
            'parent_dataset': 'true',
            'owner_org': self.organization['id']
        }

        for key in self.user:
            if key not in ['id', 'name']:
                self.dataset1.update({key: self.user[key]})
        self.dataset1 = factories.Dataset(**self.dataset1)

    def test_new_dataset_page_snippet_loads(self):
        self.create_datasets()
        self.app = self._get_test_app()

        response = self.app.get(url='/dataset/new',
                                extra_environ=self.extra_environ)

        assert 'id="dep-of-ed-admin-ui"' in response.body

    # def test_edit_dataset_page_snippet_loads(self):
    #     self.create_datasets()
    #     self.app = self._get_test_app()
    #     dataset_id = self.dataset1['name']
    #     response = self.app.get(url='/dataset/edit/{}'.format(dataset_id),
    #                             extra_environ=self.extra_environ)

    #     assert 'id="dep-of-ed-admin-ui"' in response.body

    # def test_new_dataset_fails_for_anonymous(self):
    #     self.create_datasets()
    #     self.app = self._get_test_app()
    #     response = self.app.get(url='/dataset/new')

    #     assert '302 Found' in response
    #     assert 'id="dep-of-ed-admin-ui"' not in response.body

    # def test_snippet_package_id_present(self):
    #     self.create_datasets()
    #     self.app = self._get_test_app()
    #     dataset_id = self.dataset1['name']
    #     response = self.app.get(url='/dataset/edit/{}'.format(dataset_id),
    #                             extra_environ=self.extra_environ)

    #     assert '"dataset_id": {}'.format(dataset_id) in response.body
