# Snake Arena Online - Backend

## Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

To start the development server, run the following command from the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`.
API Documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

Run tests with:

```bash
pytest
```
