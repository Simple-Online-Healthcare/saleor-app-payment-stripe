# Use an official Node.js image with Alpine Linux as the base image
FROM node:22.9.0-alpine as base
# Install pnpm globally within the container
# Install pnpm
RUN apk add --update bash
RUN npm install --global pnpm@8.12.0 \
    && SHELL=bash pnpm setup \
    && source /root/.bashrc
# Set the working directory within the container
WORKDIR /code
# Copy all files from your current directory to the container's working directory
COPY . .
ARG APP_DEBUG
ARG SECRET_KEY
# ARG SALEOR_API_URL
# RUN mkdir -p /code/mntvolumes && ln -s /code/.saleor-app-auth.json /code/mntvolumes/.saleor-app-auth.json
# Install project dependencies using pnpm
RUN pnpm install
RUN pnpm run build
# Define the command to run your application
# CMD ["pnpm", "start"]

CMD ["sh", "./scripts/start.sh"]
# Expose a port if your application listens on a specific port (e.g., 3000)
EXPOSE 3000