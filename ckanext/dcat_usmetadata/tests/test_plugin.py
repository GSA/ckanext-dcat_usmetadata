"""Tests for plugin.py."""

import ckan.plugins

import ckan.tests.factories as factories
from ckan.tests import helpers

import json
import pytest
import six


@pytest.mark.usefixtures('with_request_context')
class TestDcatUsmetadataPlugin(helpers.FunctionalTestBase):
    '''
        Tests for the ckanext.dcat_usmetadata.plugin module.
        The main tests are written in cypress for nodejs/
        reactjs UI elements.
    '''

    @classmethod
    def setup(cls):
        helpers.reset_db()

    @classmethod
    def setup_class(cls):
        super(TestDcatUsmetadataPlugin, cls).setup_class()

    def create_user(self):
        self.sysadmin = factories.Sysadmin(name='admin')
        self.organization = factories.Organization()
        if six.PY2:
            self.extra_environ = {'REMOTE_USER': self.sysadmin['name'].encode('ascii')}
        else:
            self.extra_environ = {'REMOTE_USER': self.sysadmin['name']}

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

        for key in self.sysadmin:
            if key not in ['id', 'name']:
                self.dataset1.update({key: self.sysadmin[key]})
        self.dataset1 = factories.Dataset(**self.dataset1)

    def test_plugin_loaded(self):
        assert ckan.plugins.plugin_loaded('dcat_usmetadata')

    def test_new_metadata_route(self):
        self.create_user()
        self.app = self._get_test_app()
        res = self.app.get('/dataset/new-metadata', extra_environ=self.extra_environ)
        if six.PY2:
            assert '/js/main.chunk.js' in res.unicode_body
            res = self.app.get('/js/main.chunk.js', extra_environ=self.extra_environ)
            assert 'Required Metadata' in res.body
        else:
            assert '/js/main.chunk.js' in res.body
            res = self.app.get('/js/main.chunk.js', extra_environ=self.extra_environ)
            assert 'Required Metadata' in res.body

    def test_package_creation(self):
        '''
        test if dataset is getting created successfully
        '''
        self.create_user()
        self.app = self._get_test_app()
        package_dict = self.app.get('/api/3/action/package_show?id=my_package_000',
                                    extra_environ=self.extra_environ)

        result = json.loads(package_dict.body)['result']
        assert result['name'] == 'my_package_000'

    def test_edit_metadata_route(self):
        self.create_user()
        self.app = self._get_test_app()
        res = self.app.get('/dataset/edit-new/%s' % (self.dataset1['name']),
                           extra_environ=self.extra_environ)
        if six.PY2:
            assert '/js/main.chunk.js' in res.unicode_body
            res = self.app.get('/js/main.chunk.js', extra_environ=self.extra_environ)
            assert 'Required Metadata' in res.body
        else:
            assert '/js/main.chunk.js' in res.body
            res = self.app.get('/js/main.chunk.js', extra_environ=self.extra_environ)
            assert 'Required Metadata' in res.body
