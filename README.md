# Livesync App


## Overview

### Technology Stack

- Front-end Framework: Nuxt.js v3
- UI Component: shadcn/vue
- CSS Framework: Tailwind CSS v4
- UI Catalog: Storybook
- API: Fast API
- Data Store: Vercel KV
- Test: Vitest
- Deploy: Vercel


### demo

- [Livesync App]()
- [Stoyrbook]()

## Getting Started

### Nuxt

- Make sure to install dependencies:

```bash
pnpm install
```

- Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

- Build the application for production:

```bash
pnpm build
```

- Locally preview production build:

```bash
pnpm preview
```

### Fast API 

- Navigate to the API directory:

```bash
cd api
```

- Create and activate a Python virtual environment:

```bash
# Create venv
python3 -m venv venv

# Activate venv (macOS/Linux)
source venv/bin/activate
```

- Install Python dependencies:

```bash
pip install -r requirements.txt
```

- Start the development server on http://127.0.0.1:8000:

```bash
uvicorn main:app --reload
```
- View interactive API documentation (Swagger UI) on http://127.0.0.1:8000/docs:

Once the server is running, you can access the auto-generated API documentation in your browser to view and test the endpoints.


### Storybook

- Launch the Storybook Viewer on `http://localhost:6006`:

```bash
pnpm run storybook
```


### Vitest

- Run Unit and Component Test

```bash
pnpm run test
```