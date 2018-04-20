FROM circleci/node:9-browsers
USER root
COPY package.json /digibytego/package.json
COPY src/environments/dev.ts /digibytego/src/environments/dev.ts
WORKDIR /digibytego/
RUN npm install --unsafe-perm
COPY . /digibytego/
CMD [ "npm", "run", "e2e:capture-latest"]