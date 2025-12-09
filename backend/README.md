# AnEat Backend

Backend API for AnEat application using Node.js, Express, and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aneat_db
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3001
JWT_SECRET=your_secret_key
```

4. Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE aneat_db;
```

5. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.js    # Main configuration
│   │   └── database.js  # Database connection
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── middleware/      # Custom middleware
│   │   └── errorHandler.js
│   ├── utils/           # Utility functions
│   │   ├── ApiError.js
│   │   └── asyncHandler.js
│   └── server.js        # Application entry point
├── .env.example         # Environment variables template
├── .gitignore
└── package.json
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API welcome message

## Technologies

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Request validation

## Development

The server runs on port 3001 by default. You can change this in the `.env` file.

Access the API at: `http://localhost:3001`
