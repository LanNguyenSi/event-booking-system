.PHONY: help install dev build start db-setup db-migrate db-studio seed clean docker-build docker-run deploy

# Variables
IMAGE_NAME = event-booking-system
CONTAINER_NAME = event-booking-app
DB_CONTAINER = event-booking-db

help: ## Show this help message
	@echo "Event Booking System - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Install dependencies
	npm install
	npx prisma generate

dev: ## Run development server
	npm run dev

build: ## Build production
	npm run build

start: ## Start production server
	npm run start

db-setup: ## Setup PostgreSQL (Docker)
	docker compose up -d

db-migrate: ## Run database migrations
	npx prisma migrate deploy

db-studio: ## Open Prisma Studio
	npx prisma studio

seed: ## Create admin user (prompts for credentials)
	@echo "Creating admin user..."
	@node scripts/create-admin.js

clean: ## Clean build artifacts
	rm -rf .next node_modules

docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):latest .

docker-run: ## Run in Docker
	docker run -d \
		--name $(CONTAINER_NAME) \
		--network event-booking-system_default \
		-p 3000:3000 \
		--env-file .env \
		$(IMAGE_NAME):latest

docker-logs: ## Show Docker logs
	docker logs -f $(CONTAINER_NAME)

docker-stop: ## Stop Docker container
	docker stop $(CONTAINER_NAME) && docker rm $(CONTAINER_NAME)

deploy-prepare: ## Prepare for deployment
	@echo "✓ Building production..."
	@npm run build
	@echo "✓ Running migrations..."
	@npx prisma migrate deploy
	@echo "✓ Ready for deployment!"

deploy-local: db-setup db-migrate seed ## Full local deployment
	@echo "🚀 Starting local deployment..."
	npm run build
	npm run start

# Default target
.DEFAULT_GOAL := help
