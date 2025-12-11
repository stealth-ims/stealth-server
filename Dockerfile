FROM node:24-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .

RUN yarn build


EXPOSE 5500

CMD [ "yarn", "start:prod" ]
