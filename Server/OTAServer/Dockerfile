#Download the latest node js environement
FROM node:latest

#Create a new directory to copy the source code and modules
RUN mkdir -p /usr/src/app

#Make the newly created directory as working directory
WORKDIR /usr/src/app

#Copy package.json file fisrt
COPY package.json /usr/src/app/

RUN npm cache clean --force
#Install all the dependencies mentioned in package.json
RUN npm install

#Copy the source files into the working directory
COPY . /usr/src/app

#map connection on port 3000
EXPOSE 3000

#Run npm command
CMD [ "npm", "start" ]