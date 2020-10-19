import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit


class Dcat_UsmetadataPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IRoutes)

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
                    action='load_metadata_form')
        return map

    def after_map(self, map):
        return map
