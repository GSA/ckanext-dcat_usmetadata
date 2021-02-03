import sys

import ckan.lib.cli as cli
import ckan.plugins as p


class DCATUSMetadataCommand(cli.CkanCommand):
    '''Import publishers from the CSV data to CKAN group extra.

    Usage:

        publishers-import <path_to_file> - imports publishers from the CSV file.

        Headers of expected CSV data (ordered):
        1. organization
        2. publisher
        3. publisher_1
        4. publisher_2
        5. publisher_3
        6. publisher_4
        7. publisher_5
    '''

    summary = __doc__.split('\n')[0]
    usage = __doc__

    def command(self):
        if len(self.args) == 1:
            path_to_file = self.args[0]
        else:
            print "This command requires an argument\n"
            print self.usage
            sys.exit(1)
