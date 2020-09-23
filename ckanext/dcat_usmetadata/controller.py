from ckan.lib import base
from ckan.controllers.package import PackageController as CorePackageController

class MetadataController(CorePackageController):
    def load_metadata_form(self):
        return base.render('new_metadata.html')
