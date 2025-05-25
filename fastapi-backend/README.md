Steps to get it running
1. cd into the `fastapi-backend` directory
    ```bash
    cd fastapi-backend
    ```
2. Create a virtual environment
    ```bash
    python3 -m venv venv
    ```
3. Activate the virtual environment
    ```bash
    source venv/bin/activate
    ```
3. Install the requirements
    ```bash
    pip install -r requirements.txt
    ```
4. Copy the `.env.template` file to `.env` and fill in the required environment variables
    ```bash
    cp .env.template .env
    ```
5. Run the FastAPI server
    ```bash
    fastapi dev app/main.py
    ```

6. To use the CLI, run
```bash
    python3 cli.py --help
```

To deploy modal run 'modal deploy app/ml_modal.py'
To test modal function, run 'modal run app/ml_modal.py::function_name'