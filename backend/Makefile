.PHONY: help build run dev clean install-air

# Default target
help:
	@echo "Available commands:"
	@echo "  make run      - Run the server (normal)"
	@echo "  make dev      - Run the server with hot-reload (Air)"
	@echo "  make build    - Build the application"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make install-air - Install Air for hot-reload"
	@echo ""
	@echo "Hot-reload usage:"
	@echo "  ./dev.sh      - Run with hot-reload (recommended for development)"

# Install Air for hot-reload
install-air:
	@echo "Installing Air for hot-reload..."
	go install github.com/air-verse/air@latest

# Run with hot-reload (development)
dev:
	@echo "Starting server with hot-reload..."
	@echo "Make sure you have Air installed: make install-air"
	@echo "Or run: ./dev.sh"
	PATH=$$PATH:/Users/sourav/go/bin air

# Normal run (production)
run:
	@echo "Starting server normally..."
	go run .

# Build the application
build:
	@echo "Building application..."
	go build -o ./tmp/main .

# Clean build artifacts
clean:
	@echo "Cleaning up..."
	rm -rf ./tmp
	rm -f build-errors.log

# Install dependencies
deps:
	@echo "Installing dependencies..."
	go mod tidy
	go mod download
