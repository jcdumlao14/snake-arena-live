.PHONY: run install test clean

# Default target
run:
	uvicorn app.main:app --reload

install:
	pip install -r requirements.txt

test:
	pytest

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
