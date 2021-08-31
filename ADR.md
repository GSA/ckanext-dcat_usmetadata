# ADRs for CKANEXT_DCAT_USMETADATA

# 1. Fix special character test for resources `cypress/integration/resource-upload.spec.js:58`

Date: 2021-08-30

## Status

Not reviewed

## Context

The test was originally written using the `&` as the special character. This caused strange behavior of the `package_id`
not being recognized in the `package_update` request. Changing it to a different special character allowed the test to
pass; however, this seems like it can be a potential security issue in the future. The issue probably crosses over into
the validation done by ckanext-usmetadata..

## Decision

Due to limited time, no action was taken to resolve why the `&` symbol causes failure. The test just runs with using the
`$` special character.

## Consequences

- If a user enters the `&` symbol, the dataset will not be created.

# 2. Fix usmetadata validation to allow saving a draft without validation

Date: 2021-08-30

## Status

Not reviewed

## Context

The validation schema of ckanext-usmetadata is not well understood and may be causing this issue. The test to allow a
dataset to be saved as a draft with invalid data fails because the validation schema attempts to validate the input data.
The test proposes that the user may be able to save bad data as a draft without issue. The test fails.

## Decision

The test was commented out.

## Consequences

- If a user tried to save a draft dataset, they can't input invalid data.
