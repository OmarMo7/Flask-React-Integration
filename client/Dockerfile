# Use an official node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Clean npm cache
RUN npm cache clean --force

# Copy the rest of the application code
COPY . .

# Copy the .env file
COPY .env .env

# Build the app for production and print logs if it fails
RUN npm run build || { echo "Build failed"; exit 1; }

# Install serve to serve the build
RUN npm install -g serve

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Start the app
CMD ["serve", "-s", "build", "-l", "8080"]