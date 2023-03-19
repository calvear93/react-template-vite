###
###   REACT SPA with PNPM
###

# global variables
ARG ALPINE=node:18.15.0-alpine
ARG NGINX=nginx:1.23.3-alpine
ARG PNPM_VER=7.30.0
ARG APP_DIR='/app/'
ARG OUT_DIR='dist'


##
## STAGE 1: build
##
FROM ${ALPINE} AS builder

ARG APP_DIR
ARG OUT_DIR
ARG ENV

WORKDIR ${APP_DIR}

# installs pnpm
RUN npm i -g pnpm@${PNPM_VER}
# prepares source files
COPY . ${APP_DIR}
RUN pnpm install --frozen-lockfile --ignore-scripts
# builds the app
ENV NODE_ENV production
RUN pnpm build:${ENV}



##
## STAGE 2: exec
##
FROM ${NGINX}

ARG APP_DIR
ARG OUT_DIR
# static assets dir
WORKDIR '/usr/share/nginx/html'
# retrieves build app
RUN rm -rf ./*
COPY --from=builder ${APP_DIR}${OUT_DIR} .
COPY --from=builder ${APP_DIR}'deploy/nginx.conf' '/etc/nginx/conf.d/default.conf'
# alpine security updates
RUN apk --no-cache -U upgrade

# exec command
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

EXPOSE 8080/tcp
