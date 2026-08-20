.PHONY: up down restart rebuild logs psql seed clean-db

# Start Docker containers in detached mode
up:
	docker compose up -d

# Stop Docker containers
down:
	docker compose down

# Rebuild and start containers from scratch
rebuild:
	docker compose up -d --build

# View container runtime logs
logs:
	docker compose logs -f

# Open an interactive psql terminal inside the database container
psql:
	docker exec -it hanakori_db psql -U postgres -d hanakori_db

# Execute migrations and all seed files instantly without restarting Go server
seed:
	@echo "Applying database schema migrations..."
	@docker exec -i hanakori_db psql -U postgres -d hanakori_db < ./internal/infrastructure/database/migrations/000001_init_schema.sql
	@echo "Seeding products..."
	@docker exec -i hanakori_db psql -U postgres -d hanakori_db < ./internal/infrastructure/database/seeders/000001_seed_products.sql
	@echo "Seeding promo codes..."
	@docker exec -i hanakori_db psql -U postgres -d hanakori_db < ./internal/infrastructure/database/seeders/000002_seed_promos.sql
	@echo "Seeding orders and order items..."
	@docker exec -i hanakori_db psql -U postgres -d hanakori_db < ./internal/infrastructure/database/seeders/000003_seed_orders.sql
	@echo "Database successfully reset and re-seeded!"