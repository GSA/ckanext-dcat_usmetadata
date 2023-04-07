ARG CKAN_VERSION=2.9
FROM openknowledge/ckan-dev:${CKAN_VERSION}.7
ARG CKAN_VERSION

RUN apk add swig
RUN pip install --upgrade pip

COPY . ${APP_DIR}/

RUN pip install -r ${APP_DIR}/requirements.txt \
  -r ${APP_DIR}/dev-requirements.txt -e ${APP_DIR}/.
