#Argument for version
ARG PW_VERSION=latest
From mcr.microsoft.com/playwright:v${PW_VERSION}-noble
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npx", "playwright", "test"]