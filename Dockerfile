###
###   REACT SPA
###

# global variables
ARG ALPINE=node:18.10.0-alpine
ARG NGINX=nginx:1.23.1-alpine
ARG APP_DIR='/app/'
ARG OUT_DIR='dist'




##
## STAGE 1: app build
##
FROM ${ALPINE} AS builder

ARG APP_DIR
ARG OUT_DIR
ARG ENV

WORKDIR ${APP_DIR}

# prepares source files
COPY . ${APP_DIR}
RUN npm ci --ignore-scripts

# builds the app
ENV NODE_ENV production
RUN npm run build:${ENV}



##
## STAGE 2: static web server setup
##
FROM ${NGINX}

ARG APP_DIR
ARG OUT_DIR

# static assets dir
WORKDIR /usr/share/nginx/html

# gets build app
RUN rm -rf ./*
COPY --from=builder ${APP_DIR}${OUT_DIR} .
COPY --from=builder ${APP_DIR}'nginx.conf' '/etc/nginx/conf.d/default.conf'

# alpine security updates
RUN apk --no-cache -U upgrade

# start command
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

EXPOSE 8080/tcp
