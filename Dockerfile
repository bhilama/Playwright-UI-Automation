# Argument for version
ARG PW_VERSION=latest
FROM mcr.microsoft.com/playwright:v${PW_VERSION}-noble

# pwuser is a pre-defined user in the Playwright Docker images
WORKDIR /app

# This ensures the folders exist and are writable before we switch users
RUN mkdir -p /app/.npm /app/.npm-global && chown -R pwuser:pwuser /app

# Copy package file and change ownership to pwuser
COPY --chown=pwuser:pwuser package*.json ./

# Switch to non-root user before installing dependencies
USER pwuser

# Force npm to treat /app as its home
ENV HOME=/app
ENV NPM_CONFIG_CACHE=/app/.npm
ENV NPM_CONFIG_PREFIX=/app/.npm-global
# Added the new global bin to path just in case
ENV PATH=$PATH:/app/.npm-global/bin

RUN npm ci

COPY --chown=pwuser:pwuser . .

CMD ["npx", "playwright", "test"]