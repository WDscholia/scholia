FROM python:3.5-slim

LABEL version="1.0"
LABEL description="This container starts the scholia server."

# setup working directory
WORKDIR /project

# install dependencies
RUN pip install wheel
RUN pip install waitress

COPY requirements.txt /project
RUN pip install -r requirements.txt

# import scholia project
COPY . .

# build and install scholia
RUN python setup.py bdist_wheel

# run production server
EXPOSE 8080
ENTRYPOINT [ "waitress-serve", "--call", "scholia.app:create_app" ]
