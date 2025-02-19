# Setting Up the Application for Deployment

## Overview
This guide details the changes made to the Docker Compose stack to prepare the application for deployment to a hosting provider.

---

## **1. Create .env file**

Create `prod.env` file in the root of the project folder:

```dotenv
# Database
MYSQL_PASSWORD=etamsapp
MYSQL_ROOT_PASSWORD=r0Otp@ssw0rd!

# Backend
SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/etams?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME: etamsapp
SPRING_DATASOURCE_PASSWORD: etamsapp
# Update with password of SSL bundle
#SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY_PASSWORD:
JWT_SECRET=XwZduFBc/Y9YfD+QOOxRLKdtXmfBv/2DFmpuQmaQdYY=
```

- This will mask sensitive data and allow Docker to reference them in global variables.
- NOTE: To specify the .env for docker compose, run:
```shell
docker-compose --env-file prod.env up -d
```

---

## 2. **Spring Boot: Create `application-production.properties`**


In Spring Boot's `resources` folder, create `application-production.properties`
```properties
# Server Config
server.address=0.0.0.0

# Logging Configuration
logging.level.org.springframework=WARN
logging.file.name=logs/etams-prod.log
```

Also, update `application.properties`
```properties
spring.application.name=etams

# Server Config
server.port=8080

## MySQL Config
## Dev db connection:
#spring.datasource.url=jdbc:mysql://localhost:3306/etams?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
## Production db connection:
#spring.datasource.url=jdbc:mysql://mysql:3306/etams?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true

# Hibernate Config
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Logging Configuration
logging.level.org.springframework=INFO
logging.file.name=logs/etams.log

# JWT Key
jwt.expiration=86400000
```

Additional Spring properties for development and production will be handled through Docker Compose.

---



## **3. Spring Boot: Update SecurityConfig**

We will need to update SecurityConfig to accept the domain name being used on the remote server.
```java
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(
                        "http://localhost:4200",
                        "http://localhost:8000",
                        // Domain name
                        "https://brubakerjm.com",
                        "https://www.brubakerjm.com",
                        "http://brubakerjm.com",
                        "http://www.brubakerjm.com"
                ));
```

---

## **4. Angular: Create Environment Files**

1. Run the Angular CLI command:
```shell
ng generate environments
```
- This creates `src/environments/environment.ts` and `src/environments/environment.development.ts`.

- `angular.json` should be automatically updated:
```json
"development": {
  "optimization": false,
  "extractLicenses": false,
  "sourceMap": true,
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.development.ts"
    }
  ]
}
```

- Additionally, this is a good time to update the production configuration:
```json
"configurations": {
"production": {
  "optimization": true,
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2MB",
      "maximumError": "3MB"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "10kB",
      "maximumError": "15kB"
    }
  ],
  "outputHashing": "all"
},
```

2. Update `environment.ts` for production (note `https`):
```typescript
export const environment = {
    production: true,
    apiUrl: 'https://brubakerjm.com:8080/api',
    authUrl: 'https://brubakerjm.com:8080/auth'
};
```

3. Update `environment.development.ts` for development:
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api',
    authUrl: 'http://localhost:8080/auth'
};
```

4. Update the services that make API requests:

`task.service.ts`
```typescript
export class TaskService {
    private tasksUrl = `${environment.apiUrl}/tasks`;

    constructor(private http: HttpClient) {}
```

`employee.service.ts`
```typescript
export class EmployeeService {
    private employeesUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) {}
```

`auth.service.ts`
```typescript
export class AuthService {
    private apiUrl = `${environment.authUrl}/login`;

    constructor(private http: HttpClient, private router: Router) {}
```

5. Update `package.json` with a new script, `"build:dev"`:
```json
{
  "name": "front-end",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "build:dev": "ng build --configuration development",
```

## **5. Angular: Configure Dockerfiles**

We will need to split the single dockerfile into a production version and a development version so that the build can set the appropriate environment configurations we just created. We will also create production and development nginx configuration files.

1. Copy `dockerfile` to paste it as `dockerfile-dev` in the same folder, `front-end/`.

2. Update `dockerfile-dev` and note that npm run is now using `build:dev`:
```dockerfile
# DEVELOPMENT

# Stage 1: Build the Angular app
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:dev

# Stage 2: Serve the app with Nginx
FROM nginx:alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist/front-end/browser /usr/share/nginx/html/front-end/browser
CMD ["nginx", "-g", "daemon off;"]
```

4. Rename `dockerfile` to `dockerfile-prod-build` and ensure it is configured as below:
```dockerfile
# PRODUCTION

# Stage 1: Build the Angular app
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist/front-end/browser /usr/share/nginx/html/front-end/browser
CMD ["nginx", "-g", "daemon off;"]
```

5. In the project root directory, create a `nginx` folder and create two files: `dev.conf` and `prod.conf`. Update them with the following:

`dev.conf`
```nginx configuration
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html/front-end/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`prod.conf`
```nginx configuration
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html/front-end/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Update the respective `docker-compose` file or create them in the project root directory if they are not already present.

`docker-compose.yml`
```dockerfile
# DEVELOPMENT
networks:
  etams-network:  # Network for frontend and backend
    driver: bridge
    internal: false
  db-network:  # Isolated network for the database
    driver: bridge
    internal: true

services:
  mysql:
    image: yobasystems/alpine-mariadb
    container_name: etams-mysql
    restart: always
    environment:
      MYSQL_DATABASE: etams
      MYSQL_USER: etamsapp
      MYSQL_PASSWORD: etamsapp
      MYSQL_ROOT_PASSWORD: r0Otp@ssw0rd!
    ports:
      - "3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db-init:/docker-entrypoint-initdb.d
    networks:
      - db-network

  backend:
    build:
      context: ./back-end/etams
      dockerfile: Dockerfile
    container_name: etams-backend
    restart: always
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/etams?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: etamsapp
      SPRING_DATASOURCE_PASSWORD: etamsapp
      JWT_SECRET: XwZduFBc/Y9YfD+QOOxRLKdtXmfBv/2DFmpuQmaQdYY=
    ports:
      - "8080:8080"
    volumes:
      - ./back-end/etams/logs:/app/logs
    networks:
      - etams-network
      - db-network

  frontend:
    build:
      context: ./front-end
      dockerfile: dockerfile-dev
    container_name: etams-frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "8000:80"
    volumes:
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf
    networks:
      - etams-network

volumes:
  mysql_data:
```

`docker-compose-prod-build.yml`
```dockerfile
# Local Build Version

# Configuring docker network to restrict network communication between the backend and the database
# Setting resource limits on backend
networks:
  etams-network:
    driver: bridge
    internal: false
  db-network:
    driver: bridge
    internal: true

services:
  mysql:
    image: yobasystems/alpine-mariadb
    container_name: mysql
    restart: always
    environment:
      MYSQL_DATABASE: etams
      MYSQL_USER: etamsapp
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    ports:
      - "3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db-init:/docker-entrypoint-initdb.d
    networks:
      - db-network

  backend:
    build:
      context: ./back-end/etams
      dockerfile: Dockerfile
      platforms:
        - "linux/amd64"
    container_name: backend
    restart: always
    depends_on:
      - mysql
    environment:
      MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: health
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      # Enable Forwarded Headers for HTTPS
      SERVER_FORWARD_HEADERS_STRATEGY: native
      SERVER_TOMCAT_REMOTE_IP_HEADER: X-Forwarded-For
      SERVER_TOMCAT_REMOTE_IP_PROTOCOL_HEADER: X-Forwarded-Proto
      JWT_SECRET: ${JWT_SECRET}
      JAVA_OPTS: "-XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0 -Xss256k -XX:+UseShenandoahGC -XX:+UseCompressedClassPointers -XX:MaxMetaspaceSize=128m -XX:InitiatingHeapOccupancyPercent=30"
    ports:
      - "8080:8080"
    volumes:
      - ./back-end/etams/logs:/app/logs
    networks:
      - etams-network
      - db-network

  frontend:
    build:
      context: ./front-end
      dockerfile: dockerfile-prod
      platforms:
        - "linux/amd64"
    container_name: frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "8000:80"
    networks:
      - etams-network
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf

volumes:
  mysql_data:
```
---

## **6. Create `docker-compose-prod.yml` for Remote Server**

In the project root folder, create a `docker-compose-prod.yml` file and include the below information. This yml will be used on the remote server when starting the containers.
NOTE: There are SSL configurations included in this version. They are included here for a complete yml to reference. For additional information on the SSL process, please see the **Spring Boot: Enable HTTPS** section.

```dockerfile
# Remote Server Version

# Configuring docker network to restrict network communication between the backend and the database
# Setting resource limits on backend
networks:
  etams-network:
    driver: bridge
    internal: false
  db-network:
    driver: bridge
    internal: true

services:
  mysql:
    image: yobasystems/alpine-mariadb
    container_name: mysql
    restart: always
    environment:
      MYSQL_DATABASE: etams
      MYSQL_USER: etamsapp
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    ports:
      - "3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db-init:/docker-entrypoint-initdb.d
    networks:
      - db-network
    command: --skip-name-resolve
    deploy:
      resources:
        limits:
          memory: 150M
          cpus: "0.50"
        reservations:
          memory: 100M
          cpus: "0.25"

  backend:
    image: registry.gitlab.com/wgu-gitlab-environment/student-repos/jbruba6/d424-software-engineering-capstone/backend:rc1
    container_name: backend
    restart: always
    depends_on:
      - mysql
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: org.hibernate.dialect.MariaDBDialect
      MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: health
      # SSL
      SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_CERTIFICATE: /etc/ssl/certs/fullchain.pem
      SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY: /etc/ssl/certs/privkey.pem
      SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY_PASSWORD: ${SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY_PASSWORD}
      SERVER_SSL_BUNDLE: server
      # Enable Forwarded Headers for HTTPS
      SERVER_FORWARD_HEADERS_STRATEGY: native
      SERVER_TOMCAT_REMOTE_IP_HEADER: X-Forwarded-For
      SERVER_TOMCAT_REMOTE_IP_PROTOCOL_HEADER: X-Forwarded-Proto
      JWT_SECRET: ${JWT_SECRET}
      JAVA_OPTS: "-XX:+UseContainerSupport 
      -XX:MaxRAMPercentage=50.0 -Xss256k 
      -XX:+UseShenandoahGC 
      -XX:+UseCompressedClassPointers 
      -XX:MaxMetaspaceSize=128m 
      -XX:InitiatingHeapOccupancyPercent=30 
      -XX:+TieredCompilation 
      -XX:TieredStopAtLevel=1"
    ports:
      - "8080:8080"
    volumes:
      - ./back-end/etams/logs:/app/logs
      # SSL CERT
      - /etc/letsencrypt/live/brubakerjm.com/fullchain.pem:/etc/ssl/certs/fullchain.pem
      - /etc/letsencrypt/live/brubakerjm.com/privkey.pem:/etc/ssl/certs/privkey.pem
    networks:
      - etams-network
      - db-network
    deploy:
      resources:
        limits:
          memory: 275M
          cpus: "0.60"
        reservations:
          memory: 128M
          cpus: "0.50"

  frontend:
    image: registry.gitlab.com/wgu-gitlab-environment/student-repos/jbruba6/d424-software-engineering-capstone/frontend:rc1
    container_name: frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "8000:80"
    networks:
      - etams-network
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf
    deploy:
      resources:
        limits:
          memory: 25M
          cpus: "0.15"
        reservations:
          memory: 15M
          cpus: "0.05"

volumes:
  mysql_data:
```

---

## **7. Spring Boot: Enable HTTPS**

NOTE: This step assumes that the remote sever has has a certificate generated. These instructions are specific for a certificate that has been granted from Let's Encrypt by following the steps in the below link:

https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04

1. In `docker-compose-prod.yml`, update with the following:
```dockerfile
    environment:
      # SSL
      SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_CERTIFICATE: /etc/ssl/certs/fullchain.pem
      SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY: /etc/ssl/certs/privkey.pem
      SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY_PASSWORD: ${SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY_PASSWORD}
      SERVER_SSL_BUNDLE: server
    volumes:
      # SSL CERT
      - /etc/letsencrypt/live/brubakerjm.com/fullchain.pem:/etc/ssl/certs/fullchain.pem
      - /etc/letsencrypt/live/brubakerjm.com/privkey.pem:/etc/ssl/certs/privkey.pem
```

This will import the certs from the host server and create an SSL bundle for Spring to use

2. Update `prod.env` with the cert password:
```dotenv
SPRING_SSL_BUNDLE_PEM_SERVER_KEYSTORE_PRIVATE_KEY_PASSWORD: PASSWORD
```

---

## **8. Remote Server: NGINX Reverse Proxy Conf**

While not explicitly part of the build process for the ETAMS application, the remote server on which the application will be deployed will be using an NGINX server to act as a reverse proxy to direct traffic to the containers:

Outside Traffic --> NGINX Reverse Proxy --> ETAMS Containers

Provided below is the configuration file, `proxy.conf`, that the proxy will be using.
```nginx configuration
server {
    listen 80;
    server_name brubakerjm.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name brubakerjm.com;

    ssl_certificate /etc/letsencrypt/live/brubakerjm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/brubakerjm.com/privkey.pem;

    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api/ {
        proxy_pass https://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /auth/ {
        proxy_pass https://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
    
    # Enable Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_min_length 1024;
}
```

To confirm that gzip is enabled, run the below command and look for `Content-Encoding: gzip`
```shell
❯ curl -I -H "Accept-Encoding: gzip" https://brubakerjm.com/
```

---

## 9. Build Process

Since we will be building the docker images locally to deploy on the remote server, below outlines the process.

**Local Machine:**

1. Log into GitLab
```shell
docker login registry.gitlab.com
```

2. Run the prod build
```shell
docker compose -f docker-compose-prod-build.yml --env-file prod.env build
```

3. Tag the images
```shell
docker tag d424-software-engineering-capstone-backend:latest registry.gitlab.com/wgu-gitlab-environment/student-repos/jbruba6/d424-software-engineering-capstone/backend:rc1

docker tag d424-software-engineering-capstone-frontend:latest registry.gitlab.com/wgu-gitlab-environment/student-repos/jbruba6/d424-software-engineering-capstone/frontend:rc1
```

4. Push the images to the Docker Hub repo
```shell
docker push registry.gitlab.com/wgu-gitlab-environment/student-repos/jbruba6/d424-software-engineering-capstone/frontend:rc1

docker push registry.gitlab.com/wgu-gitlab-environment/student-repos/jbruba6/d424-software-engineering-capstone/backend:rc1
```

**Remote Server:**

1. Log into GitLab
```shell
docker login registry.gitlab.com
```

2. Start the docker compose
```shell
docker compose -f docker-compose-prod.yml --env-file prod.env up --build
```