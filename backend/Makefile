.PHONY: setup models ingest ingest-force ingest-all list serve test clean docker-up docker-down docker-models docker-ingest

setup:
	/opt/homebrew/bin/python3.12 -m venv .venv
	. .venv/bin/activate && pip install -r requirements.txt

models:
	ollama pull qwen3:8b
	ollama pull bge-m3

ingest:
	. .venv/bin/activate && python scripts/ingest.py --book-id $(BOOK)

ingest-force:
	. .venv/bin/activate && python scripts/ingest.py --book-id $(BOOK) --force

ingest-all:
	. .venv/bin/activate && python scripts/ingest.py --all

list:
	. .venv/bin/activate && python scripts/ingest.py --list

serve:
	. .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	. .venv/bin/activate && python scripts/test_query.py --book-id $(BOOK) --question "$(Q)"

clean:
	rm -rf chroma_db/*

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-models:
	docker exec ollama ollama pull qwen3:8b
	docker exec ollama ollama pull bge-m3

docker-ingest:
	docker exec rag-api python scripts/ingest.py --all
