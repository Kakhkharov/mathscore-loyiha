FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and code
COPY prisma ./prisma/
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start server
CMD [ "npm", "start" ]
