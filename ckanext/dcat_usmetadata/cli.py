import sys
import csv
import json

import ckan.lib.cli as cli
import ckan.plugins as p


class DCATUSMetadataCommand(cli.CkanCommand):
    '''Import publishers from the CSV data to CKAN group extra.

    Usage:

        publishers-import <path_to_file> - imports publishers from the \
        CSV file.

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

    def __init__(self, name):
        super(DCATUSMetadataCommand, self).__init__(name)

    def command(self):
        self._load_config()

        if len(self.args) != 1:
            print 'This command requires a single argument\n'
            print self.usage
            sys.exit(1)

        self.import_publishers(self.args[0])

    def import_publishers(self, path_to_file):
        with open(path_to_file, 'rb') as csvfile:
            reader = csv.reader(csvfile)
            next(reader, None)  # skip the headers
            data = list(reader)
            # Generate publishers extra for each CKAN org:
            for org in self.get_orgs_to_process(data):
                publishers_tree = []
                for row in data:
                    if row[0] == org:
                        # Append the row but remove empty strings
                        publishers_tree.append([i for i in row if i])

                self.update_orgs_with_publishers(org, publishers_tree)

    def get_orgs_to_process(self, rows):
        list_of_available_orgs = []
        for row in rows:
            list_of_available_orgs.append(row[0])
        unique_set_of_orgs = set(list_of_available_orgs)
        return list(unique_set_of_orgs)

    def update_orgs_with_publishers(self, org, publishers_tree):
        # Update org metadata with the publishers data:
        try:
            org_metadata = p.toolkit.get_action(
                'organization_show')({}, {'id': org})
            org_extras = org_metadata.get('result', {}).get('extras', [])
            index_of_publisher_extra = next(
                (i for i, item in enumerate(org_extras)
                    if item['key'] == 'publisher'), None)
            if index_of_publisher_extra:
                org_extras[index_of_publisher_extra]['value'] = json.dumps(
                    publishers_tree)
            else:
                org_extras.append(
                    {'key': 'publisher', 'value': json.dumps(publishers_tree)})

            p.toolkit.get_action('organization_patch')(
                {}, {'id': org, 'extras': org_extras})
            print "Updated publishers for '{}'".format(org)
        except Exception as e:
            print e
            print "Organization '{}' was not found".format(org)
