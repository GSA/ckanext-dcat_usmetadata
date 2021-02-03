import sys

import ckan.lib.cli as cli
import ckan.plugins as p


class DCATUSMetadataCommand(cli.CkanCommand):
    '''Import publishers from the CSV data to CKAN group extra.

    Usage:

        publishers-import <path_to_file> - imports publishers from the CSV file.
    '''

    summary = __doc__.split('\n')[0]
    usage = __doc__

    def command(self):
        if self.args and self.args[0] == 'publishers-import':
            print 'hey!!!'
            if len(self.args) != 2:
                print "This command requires an argument\n"
                print self.usage
                sys.exit(1)
        else:
            print self.usage
