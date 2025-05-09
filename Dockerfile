ARG CKAN_VERSION=2.11
FROM ckan/ckan-dev:${CKAN_VERSION}
ARG CKAN_VERSION

USER root

RUN apt install swig -y
RUN pip install --upgrade pip

COPY . ${APP_DIR}/

RUN pip install -r ${APP_DIR}/requirements.txt \
  -r ${APP_DIR}/dev-requirements.txt -e ${APP_DIR}/.
