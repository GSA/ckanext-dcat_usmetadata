"""Tests for plugin.py."""
from ckan import plugins

try:
    from ckan.tests import factories, helpers
except ImportError:
    from ckan.new_tests import factories, helpers


class TestReactMetadataPlugin(helpers.FunctionalTestBase):
    def setup(self):
        super(TestReactMetadataPlugin, self).setup()
        self.user = factories.User()
        self.dataset = factories.Dataset()
        self.app = self._get_test_app()

        if not plugins.plugin_loaded('react_usmetadata'):
            plugins.load('react_usmetadata')

    def teardown(self):
        plugins.unload('react_usmetadata')
        helpers.reset_db()

    def test_new_dataset_page_snippet_loads(self):
        env = {'REMOTE_USER': self.user['name'].encode('ascii')}
        response = self.app.get(url='/dataset/beta/new',
                                extra_environ=env)

        assert 'id="dep-of-ed-admin-ui"' in response.body

    def test_edit_dataset_page_snippet_loads(self):
        env = {'REMOTE_USER': self.user['name'].encode('ascii')}
        dataset_id = self.dataset['name']
        response = self.app.get(url='/dataset/beta/edit/{}'.format(dataset_id),
                                extra_environ=env)

        assert 'id="dep-of-ed-admin-ui"' in response.body

    def test_new_dataset_fails_for_anonymous(self):
        response = self.app.get(url='/dataset/beta/new')

        assert '302 Found' in response
        assert 'id="dep-of-ed-admin-ui"' not in response.body

    def test_snippet_package_id_present(self):
        env = {'REMOTE_USER': self.user['name'].encode('ascii')}
        dataset_id = self.dataset['name']
        response = self.app.get(url='/dataset/beta/edit/{}'.format(dataset_id),
                                extra_environ=env)

        assert '"dataset_id": {}'.format(dataset_id) in response.body
