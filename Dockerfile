# Step 1: Set the base image
FROM node:20 AS build

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Build the project
RUN npm run build

# Step 7: Expose port 6009 for the app
EXPOSE 75

# Step 8: Start the application in production mode
CMD ["npm", "run", "preview"]

#
