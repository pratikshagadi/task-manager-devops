# Task Manager DevOps Project

A full-stack web application with **React.js frontend**, **Node.js/Express backend**, and **MongoDB**, fully **Dockerized**, with **CI/CD** pipelines using **GitHub Actions**, **Jenkins**, and **Kubernetes** deployment.

---

## Features

- Create, update, delete, and view tasks
- Frontend: React.js
- Backend: Node.js + Express
- Database: MongoDB
- Dockerized for easy deployment
- CI/CD pipeline with GitHub Actions
- Optional Jenkins pipeline
- Kubernetes deployment ready

---

## Project Structure

```
task-manager-devops/
│
├── backend/           # Node.js backend
├── frontend/          # React.js frontend
├── k8s/               # Kubernetes deployment
├── docker-compose.yml
├── Jenkinsfile
└── .github/           # GitHub Actions CI/CD
```

---

## Prerequisites

- Docker & Docker Compose
- Node.js (for local dev)
- Git
- Kubernetes cluster (optional)
- Jenkins server (optional)

---

## Setup & Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-manager-devops.git
cd task-manager-devops
```

### 2. Start Docker containers

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/tasks`

---

## CI/CD Pipeline

### GitHub Actions

- Triggered on push or pull request to `main`
- Builds Docker images
- Can be extended with unit tests or deployment steps

---

### Jenkins (Optional)

- Checkout the repo
- Build Docker images
- Deploy to Kubernetes cluster using `kubectl apply -f k8s/`

---

## Kubernetes Deployment

- Deployment file: `k8s/deployment.yaml`
- Contains 2 replicas of backend and frontend
- Ports:
  - Backend: 5000
  - Frontend: 3000

Deploy to your cluster:

```bash
kubectl apply -f k8s/deployment.yaml
```

---

## Notes

- MongoDB runs in a separate Docker container
- Docker Compose handles container networking automatically
- You can extend CI/CD pipelines for tests, linting, or production deployment

---

## Author

Swati K Kale
