from ckan.lib import base
from ckan.controllers.package import PackageController as CorePackageController

class CustomPageController(CorePackageController):
    def load_react_hello(self):
        return base.render('new-metadata.html')
