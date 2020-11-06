from ckan.lib import base
import ckan.lib.helpers as h
import ckan.logic as logic
import ckan.model as model
from ckan.common import request, c, _
from ckan.controllers.package import PackageController as CorePackageController

check_access = logic.check_access
NotAuthorized = logic.NotAuthorized

class MetadataController(CorePackageController):
    def load_metadata_form(self):
        if not c.user:
            err = _('Unauthorized to create a package')
            h.flash_error(err)
            came_from = h.url_for(
                controller = 'ckanext.dcat_usmetadata.controller:MetadataController',
                action='load_metadata_form'
            )
            h.redirect_to(controller='user',
                          action='login', came_from=came_from)

        context = {'model': model, 'session': model.Session,
                   'user': c.user, 'auth_user_obj': c.userobj,
                   'save': 'save' in request.params}
        try:
            check_access('package_create', context)
        except NotAuthorized:
            base.abort(403, _('Unauthorized to create a package'))
        return base.render('new-metadata.html')
