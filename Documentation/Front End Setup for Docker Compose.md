# Setting Up the Frontend for Docker Compose

## Overview
This guide details the steps to containerize and run the Angular frontend inside Docker using **Docker Compose**. NGINX is leveraged for to handle Angular Single-Page Application (SPA) routing.

---

## **1. Create `nginx.conf` for NGINX**

Inside the `front-end/` directory, create a file named `nginx.conf` and add:

```nginx configuration
server {
  listen 4200;
  root /usr/share/nginx/html/front-end/browser;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

This script ensures Angular routing works inside Docker by serving `index.html` for any unknown routes.

---

## **2. Update the `Dockerfile` for Frontend**

Create `front-end/Dockerfile`:

```dockerfile
# Stage 1: Build the Angular app
FROM node:lts AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

COPY --from=build-stage /app/dist/front-end/browser /usr/share/nginx/html/front-end/browser

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
```

---

## **3. Update `docker-compose.yml`**

Modify `docker-compose.yml` to include the frontend service:

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./front-end
      dockerfile: Dockerfile
    container_name: etams-frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "4200:4200"
```

This configuration ensures:
- The frontend container is built from `front-end/` using its `Dockerfile`.
- It waits for the backend to start before running.
- It maps port **4200** for local access.

---

## **4. Restart and Rebuild Containers**

After making these changes, rebuild and restart the containers:

```sh
docker-compose down -v
```

```sh
docker-compose up --build -d
```

This ensures all updates take effect and the frontend is correctly rebuilt and deployed.

---

## **5. Test the Setup**

- Open **[http://localhost:4200](http://localhost:4200)** in your browser.
- Click through different routes in the Angular app.
- **Refresh the page** → If working correctly, no 404 errors should occur.

---

## **Conclusion**
This setup ensures the Angular frontend is properly containerized with Docker and correctly handles routing issues using NGINX.

