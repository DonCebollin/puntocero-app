FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_BACKEND_URL=http://localhost:3000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]