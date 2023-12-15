FROM node:18-alpine

RUN apk add tzdata && ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

RUN apk add --no-cache bash curl && curl -1sLf \
'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash \
&& apk add infisical

WORKDIR /app

COPY ./package.json ./yarn.lock ./

RUN yarn install

COPY . .

ARG INFISICAL_TOKEN
ENV INFISICAL_TOKEN=$INFISICAL_TOKEN

RUN yarn build

EXPOSE 3000

CMD [ "infisical", "run", "--domain", "https://env.2w.vc/api", "--env", "prod", "--", "yarn", "start:prod" ]
