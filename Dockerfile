# Use official Node.js image as base
FROM node:14

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Install system dependencies for building native modules
RUN apt-get update && apt-get install -y build-essential clang

# Install dependencies
RUN npm install

# Rebuild bcrypt to ensure compatibility with the container environment
# You may need to adjust this command to use Clang instead of the default compiler
RUN npm rebuild bcrypt --build-from-source --clang=1

# Copy the rest of the application code to container
COPY . .

# Expose port on which your application will run
EXPOSE 3000

# Command to run your application
CMD ["node", "server.js"]
