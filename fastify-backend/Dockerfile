FROM node:20-alpine
WORKDIR /app
COPY package* ./
RUN npm install
COPY . .
EXPOSE 3000
RUN npm run build
CMD ["node", "dist/index.js"]
