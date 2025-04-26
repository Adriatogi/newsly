# Taken from FastAPI docs: https://fastapi.tiangolo.com/deployment/docker
# note that we need "--platform=linux/amd64" when building on M1/M2 macs. Otherwise, the image will be built for arm64 and will not run on x86_64 servers.
FROM --platform=linux/amd64 python:3.10 
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY ./app /code/app
EXPOSE 80
CMD ["fastapi", "run", "app/main.py", "--port", "80"]

