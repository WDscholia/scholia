FROM python:2.7

LABEL version="1.0"
LABEL description="This container starts the scholia server."


# setup working directory
RUN mkdir /project
WORKDIR /project

# install python dependencies
ADD requirements.txt /project
RUN pip install -r requirements.txt

# import scholia project
ADD . /project

# start scholia server
ENTRYPOINT [ "python", "runserver.py" ]
EXPOSE 8100