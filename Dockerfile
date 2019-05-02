FROM python:2.7

# setup working directory
RUN mkdir /project
WORKDIR /project
RUN cd /project

# import scholia project
ADD . /project

# install python dependencies
RUN pip install -r requirements.txt

# start scholia server
CMD [ "python", "runserver.py" ]
EXPOSE 8100