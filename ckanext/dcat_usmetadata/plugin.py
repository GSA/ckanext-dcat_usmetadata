import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import db_utils as utils
from ckan.common import c
from logging import getLogger


log = getLogger(__name__)


class Dcat_UsmetadataPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IRoutes)
    plugins.implements(plugins.IActions)

    # IConfigurer
    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'dcat_usmetadata')

    # IRoutes
    def before_map(self, map):
        controller = 'ckanext.dcat_usmetadata.controller:MetadataController'

        map.connect('/dataset/new-metadata',
                    controller=controller,
                    action='new_metadata')

        map.connect('/dataset/edit-new/{id}',
                    controller=controller,
                    action='edit_metadata')

        return map

    def after_map(self, map):
        return map

    # IActions
    def get_actions(self):
        def parent_dataset_options(context, data_dict):
            return utils.get_parent_organizations(c)
        return {
            'parent_dataset_options': parent_dataset_options,
        }
