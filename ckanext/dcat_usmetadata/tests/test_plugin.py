"""Tests for plugin.py."""

from builtins import object
import ckan.plugins


class TestDcatUsmetadataPluginLoaded(object):
    '''
        Tests for the ckanext.dcat_usmetadata.plugin module.
        This is only to tests that the plugin gets loaded.
        The main tests are written in cypress for nodejs/
        reactjs UI elements.
    '''

    def test_plugin_loaded(self):
        assert ckan.plugins.plugin_loaded('dcat_usmetadata')
