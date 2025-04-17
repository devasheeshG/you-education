SERVICE_NAME = you-education

.PHONY: all install enable start status logs stop disable clean deps start_dev_server deploy dev

# ----------Production commands (Docker)----------
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec $(SERVICE_NAME) /bin/bash

clean:
	docker compose down -v
	docker system prune -af

git_pull:
	git pull origin main

deploy: down git_pull build up logs
	@echo "Deployment complete"

restart: down up logs
	@echo "Application reloaded"

refresh: down git_pull up logs
	@echo "Application reloaded"