# Argument for version
ARG PW_VERSION=latest
FROM mcr.microsoft.com/playwright:v${PW_VERSION}-noble

# pwuser is a pre-defined user in the Playwright Docker images
WORKDIR /app

# Copy package file and change ownership to pwuser
COPY --chown=pwuser:pwuser package*.json ./

# Switch to non-root user before installing dependencies
USER pwuser

RUN npm ci

COPY --chown=pwuser:pwuser . .

CMD ["npx", "playwright", "test"]