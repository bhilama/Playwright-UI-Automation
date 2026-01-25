PLAYWRIGHT UI AND API AUTOMATION FRAMEWORK

================================================================================

A robust, enterprise-grade automation framework built with Playwright for end-to-end testing of UI and API components. Designed for scalability, maintainability, and CI/CD integration, this framework supports cross-browser testing, API authentication, and comprehensive reporting.

TABLE OF CONTENTS
-----------------
- Features
- Prerequisites
- Installation
- Configuration
- Usage
- Project Structure
- Testing
- CI/CD
- Contributing
- Troubleshooting
- License

FEATURES
--------
- UI Automation: Page Object Model (POM) for maintainable UI tests with Playwright.
- API Automation: OAuth2 client credentials flow with token management and storage.
- Cross-Browser Support: Tests run on Chromium, Firefox, and WebKit.
- Environment Management: Multi-environment support (DEV, SIT, UAT) with dotenv.
- Logging & Reporting: Centralized logging utility and HTML/test reports.
- Code Quality: ESLint, Prettier, and Husky for consistent code standards.
- Containerization: Docker support for isolated test execution.
- Parallel Execution: Optimized for CI with retries and parallel workers.
- Enterprise Practices: Input validation, error handling, retries, and comprehensive documentation.

PREREQUISITES
-------------
- Node.js: Version 18.x or higher (LTS recommended).
- npm: Version 8.x or higher.
- Git: For cloning the repository.
- Docker (optional): For containerized execution.
- Environment Variables: Access to API credentials (e.g., CLIENT_ID, CLIENT_SECRET).

INSTALLATION
------------
1. Clone the Repository:
   git clone https://github.com/your-org/PlayWright-UI-Automation.git
   cd PlayWright-UI-Automation

2. Install Dependencies:
   npm install

3. Install Playwright Browsers:
   npx playwright install

4. Set Up Environment:
   - Copy and configure environment files in src/environments/ (e.g., DEV.env).
   - Ensure required variables like API_BASE_URL, CLIENT_ID, CLIENT_SECRET are set.

5. Verify Setup:
   npm run lint
   npm test -- --dry-run

CONFIGURATION
-------------
Environment Files
- Located in src/environments/.
- Supported environments: DEV.env, SIT.env, UAT.env.
- Set NODE_ENV to switch (e.g., NODE_ENV=SIT npm test).

Playwright Config
- Main config: playwright.config.ts.
- Key settings:
  - Test directory: src/tests/
  - Timeouts: 50s for tests, 10s for assertions.
  - Retries: 2 on CI.
  - Reporters: List and HTML.
  - Projects: Chromium, Firefox, WebKit.

API Authentication
- OAuth2 setup in src/api-lib/authmgr/oauth.setup.ts.
- Tokens stored in .auth/user.json for reuse.

USAGE
-----
Running Tests
- All Tests:
  npm test

- Specific Test File:
  npx playwright test src/tests/ui/user.validations.spec.ts

- With Environment:
  NODE_ENV=SIT npm test

- Headed Mode (for debugging):
  npx playwright test --headed

- Generate Report:
  npx playwright show-report

API Tests
- Located in src/tests/api/.
- Example: src/tests/api/paypal.spec.ts.

UI Tests
- Located in src/tests/ui/.
- Example: src/tests/ui/user.validations.spec.ts.
- Uses fixtures in src/fixtures/app.fixtures.ts for setup/teardown.

Docker Execution
docker build -t playwright-automation .
docker run --rm playwright-automation

PROJECT STRUCTURE
-----------------
```text
PlayWright-UI-Automation/
  .auth/                          # Directory for storing authentication tokens (e.g., OAuth tokens)
  .github/                        # GitHub configuration and workflows
    workflows/                    # CI/CD pipeline definitions
      playwright.yml              # GitHub Actions workflow for running Playwright tests
  .gitignore                      # Specifies files and directories to ignore in Git
  .husky/                         # Pre-commit hooks for code quality checks
  playwright.config.ts            # Playwright configuration (timeouts, browsers, etc.)
  src/                            # Source code directory
    api-lib/                      # API-related utilities and libraries
      authmgr/                    # Authentication management
        oauth.setup.ts            # OAuth setup and token retrieval
        TokenManager.ts           # Class for managing API tokens
      controllers/                # API controllers for handling requests
        BaseController.ts         # Base class for API controllers
        BuyOrder.controller.ts    # Controller for buy order operations
      models/                     # TypeScript interfaces for API data models
        BuyOrder.model.ts         # Interface for buy order data structure
    environments/                 # Environment-specific configuration files
      DEV.env                     # Development environment variables
      SIT.env                     # System Integration Testing environment variables
      UAT.env                     # User Acceptance Testing environment variables
    fixtures/                     # Playwright test fixtures for setup/teardown
      app.fixtures.ts             # Application-level fixtures (e.g., login)
    pages/                        # Page Object Model classes for UI tests
      base.page.ts                # Base page class with common methods
      dashboard.page.ts           # Dashboard page object
      login.page.ts               # Login page object
    testdata/                     # Test data files
      api/                        # API test data
        buyOrder.json             # Sample buy order data for API tests
      ui/                         # UI test data (if any)
    tests/                        # Test suites
      api/                        # API test files
        paypal.spec.ts            # PayPal API tests
      ui/                         # UI test files
        user.validations.spec.ts  # User validation UI tests
    utils/                        # Utility functions and helpers
      logger.utils.ts             # Centralized logging utility
  test-results/                   # Directory for test execution results and artifacts
  tsconfig.json                   # TypeScript compiler configuration
  .lintstagedrc                   # Configuration for lint-staged (runs linters on staged files)
  .prettierrc                     # Prettier configuration for code formatting
  CODEOWNERS                      # Defines code owners for review requirements
  Dockerfile                      # Docker configuration for containerized test execution
  eslint.config.mjs               # ESLint configuration for TypeScript and Playwright rules
  node_modules/                   # Installed npm dependencies (auto-generated)
  package-lock.json               # Lockfile for exact dependency versions
  package.json                    # Project metadata, scripts, and dependencies
  playwright-report/              # Generated HTML test reports
    index.html                    # Main report file for viewing test results

TESTING
-------
- Unit Tests: Add tests for utilities (e.g., Logger) using Jest or similar.
- Integration Tests: Ensure API and UI components interact correctly.
- Flakiness Handling: Use retries, waits, and assertions for stability.
- Data Management: Use dynamic data generation to avoid conflicts.

CI/CD
-----
- GitHub Actions: Workflow in .github/workflows/playwright.yml runs tests on push/PR.
- Pre-commit Hooks: Husky ensures linting and formatting via .lintstagedrc.
- Parallelism: Configured for efficient CI execution.
- Artifacts: Upload reports and traces on failure.

CONTRIBUTING
------------
1. Fork the repository.
2. Create a feature branch: git checkout -b feature/your-feature.
3. Follow code standards: Run npm run lint:fix before committing.
4. Add tests for new features.
5. Submit a PR with a clear description.

Code Standards
- Linting: ESLint with TypeScript and Prettier.
- Commits: Conventional commits (enforced by Husky).
- Reviews: All PRs require review.

TROUBLESHOOTING
---------------
- Test Failures: Check playwright-report/index.html for traces and screenshots.
- Environment Issues: Verify .env files and NODE_ENV.
- Browser Issues: Reinstall browsers with npx playwright install --force.
- API Errors: Check .auth/user.json and token validity.
- Performance: Reduce workers or increase timeouts if needed.

For more help, open an issue or check the Playwright Docs at https://playwright.dev/docs/intro.

LICENSE
-------
This project is licensed under the ISC License. See LICENSE for details.
