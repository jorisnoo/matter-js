# List available recipes
default:
    @just --list

# Install dependencies
install:
    npm install

# Update dependencies
update:
    npm update

# Start the dev server
dev:
    npm run dev

# Build for production
build:
    npm run build

# Fix code style
lint:
    npm run format

# Check code style without fixing
lint-check:
    npm run lint

# Run tests
test:
    npm test

# Run all tests (node + browser)
test-all:
    npm run test-all

# Run all checks
check: lint-check test
