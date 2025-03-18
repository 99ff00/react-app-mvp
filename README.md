# Express.js + Vite React Application

This is a full-stack JavaScript application with an Express.js backend API and a Vite-powered React frontend. The project is structured with the backend in the `/server` directory and the frontend in the `/client` directory.

The application has been tested with Node v22.11.0.

## Project Structure

```
project-root/
├── client/            # React frontend application
├── server/            # Express.js backend API
└── README.md          # This file
```

## Installation

Follow these steps to set up the project:

### 1. Server

```bash
cd server
yarn
```

Rename `.env.template` to `.env`, set Mux (https://www.mux.com/) credentials:

```
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
```

### 2. Client

```bash
cd client
yarn
yarn dev
```

## Development

### Starting the backend (Express.js)

```bash
# From the server directory
yarn start
```

### Starting the frontend (Vite React)

```bash
# From the client directory
yarn dev
```

## Building for Production

### Building the frontend

```bash
# From the client directory
yarn build
```

The frontend build output will be in the `client/dist` directory.
