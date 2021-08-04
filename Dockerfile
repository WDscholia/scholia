FROM python:3.9-slim-buster

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 

RUN apt-get update -qq \
    && apt-get install -qq -y --no-install-recommends \
    dumb-init gosu unzip curl build-essential \
    && rm -rf /var/lib/apt/list/* /usr/share/doc /usr/share/man \
    && apt-get clean


WORKDIR /scholia

COPY ./requirements.txt /scholia/requirements.txt

RUN pip install --quiet -r requirements.txt

COPY . /scholia

EXPOSE 8100

ENV FLASK_APP=runserver.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8100

CMD ["flask","run"]

