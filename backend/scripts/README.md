# Scripts Directory

## Available Scripts

### 🚀 Deployment
- **check-deploy.sh**: Pre-deployment verification script
  ```bash
  chmod +x scripts/check-deploy.sh
  ./scripts/check-deploy.sh
  ```

### 🔐 Authentication
- **generate-tokens.ts**: Generate test authentication tokens
  ```bash
  npm run generate-tokens
  ```

- **quick-login.ts**: Quick login helper for development
  ```bash
  npm run quick-login
  ```

### 📊 Testing
- **get-test-ids.ts**: Get test IDs for development
  ```bash
  ts-node scripts/get-test-ids.ts
  ```

- **test-order.ts**: Test order functionality
  ```bash
  ts-node scripts/test-order.ts
  ```

### 📤 Data Management
- **export-data.ts**: Export database data
  ```bash
  ts-node scripts/export-data.ts
  ```

## Usage

All scripts can be run from the backend root directory:

```bash
cd backend
npm run <script-name>
# or
ts-node scripts/<script-name>.ts
```
