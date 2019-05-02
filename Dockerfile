FROM python:2.7

# setup working directory
RUN mkdir /project
WORKDIR /project

# import scholia project
ADD . /project

# install python dependencies
RUN pip install -r requirements.txt

# start scholia server
ENTRYPOINT [ "python", "runserver.py" ]
EXPOSE 8100