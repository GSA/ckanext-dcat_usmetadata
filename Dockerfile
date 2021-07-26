ARG CKAN_VERSION=2.8
FROM openknowledge/ckan-dev:${CKAN_VERSION}
ARG CKAN_VERSION

COPY . /app
WORKDIR /app

RUN apk add swig

# python cryptography takes a while to build
RUN if [[ "${CKAN_VERSION}" = "2.8" ]] ; then \
        pip install -r requirements-py2.txt -r dev-requirements.txt -e . ; else \
        pip install -r requirements.txt -r dev-requirements.txt -e . ; fi
