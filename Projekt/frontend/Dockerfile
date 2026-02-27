FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Vite braucht --host, um Anfragen von außerhalb des Containers anzunehmen
CMD ["npm", "run", "dev", "--", "--host"]