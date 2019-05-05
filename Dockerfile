FROM python:3.5

LABEL version="1.0"
LABEL description="This container starts the scholia server."


# setup working directory
RUN mkdir /project
WORKDIR /project

# install dependencies
RUN pip install wheel
RUN pip install waitress

ADD requirements.txt /project
RUN pip install -r requirements.txt

# import scholia project
ADD . /project

# build and install scholia
RUN python setup.py bdist_wheel

# run production server
ENTRYPOINT [ "waitress-serve", "--call", "scholia.app:create_app" ]
EXPOSE 8080
