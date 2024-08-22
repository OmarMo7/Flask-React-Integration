# Overview

This project is a full-stack pipeline that combines a React-based frontend application with a Python backend for machine learning. The main objective of the project is to receive an image of an Egyptian national ID card and detect four key components:

- Citizen's first name
- Citizen's last name
- Citizen's national ID number
- Citizen's photo

# Project Setup

## Client

- Install dependencies: `npm install`

## Python BackendP

- Install dependencies: `pip install -r requirements.txt`

# Running the Project

## Client

- Navigate to the client directory: `cd client`
- Start the application: `npm run start`

## Server

- Navigate to the server directory: `cd server`
- Start the Python server: `python app.py`

## Sanity (optional)

- Navigate to the backend_sanity directory: `cd server/backend_sanity`
- Start the Sanity server: `sanity start`

# Technology Stack

## Frontend

- ReactJS

## Backend

- Python

## Database

- Sanity.io

### Useful Commands

- Delete all records: `sanity documents query "_type == 'person'" --apiVersion 2022-02-01 groq "_" -o ndjson xargs sanity documents delete`
- Open Sanity manager interface: `sanity manage`

## Containerization

- Docker

### Useful Commands

- Build frontend image: `docker build -t frontend_react .`
- Build backend image: `docker build -t backend_python .`

## Deployment

- Fly.io

### Useful Commands

- Scale up backend memory: `fly scale memory 2048 -a object-detection-backend`
- Allocate shared IP: `fly ips allocate-v4 --shared`
- Deploy frontend locally: `flyctl deploy -a object-detection-frontend --local-only --image frontend_react`
- Deploy backend locally: `flyctl deploy -a object-detection-backend --local-only --image backend_python`
