import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import c
from logging import getLogger

try:
    toolkit.requires_ckan_version("2.9")
except toolkit.CkanVersionException:
    from ckanext.dcat_usmetadata.plugin.pylons_plugin import MixinPlugin
else:
    from ckanext.dcat_usmetadata.plugin.flask_plugin import MixinPlugin

from .. import blueprint
from .. import db_utils as utils

log = getLogger(__name__)


class Dcat_UsmetadataPlugin(MixinPlugin, plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IBlueprint)

    # IActions
    def get_actions(self):
        def parent_dataset_options(context, data_dict):
            return utils.get_parent_organizations(c)
        return {
            'parent_dataset_options': parent_dataset_options,
        }

    def get_blueprint(self):
        return blueprint.dcat_usmetadata
