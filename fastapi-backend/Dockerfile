# Taken from FastAPI docs: https://fastapi.tiangolo.com/deployment/docker
FROM python:3.10
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY ./app /code/app
EXPOSE 80
CMD ["fastapi", "run", "app/main.py", "--port", "80"]

