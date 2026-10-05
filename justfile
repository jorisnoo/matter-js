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

# Lint with ESLint
lint:
    npm run lint

# Rewrite files with Prettier (most of src does not follow it yet)
format:
    npm run format

# Run tests
test:
    npm test

# Run all tests (node + browser)
test-all:
    npm run test-all

# Run all checks
check: lint test
