# Use an official node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Clean npm cache
RUN npm cache clean --force

# Copy the rest of the application code
COPY ./build .

# # Build the app for production
# RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build"]
