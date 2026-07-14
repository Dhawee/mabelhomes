# Mabel Homes Backend - Django API Server

This folder contains the Django backend codebase, Django REST Framework endpoints, database models, business logic services, and custom management commands.

---

## 🛠️ Requirements & Setup

### Prerequisites
- Python 3.10+
- Node.js (for Next.js frontend, already present on local system)
- PostgreSQL (or SQLite for local dev)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   Create a `.env` file from the provided values:
   ```env
   SECRET_KEY=your-django-secret-key
   DEBUG=True
   ALLOWED_HOSTS=*
   DATABASE_URL=postgres://user:password@host:port/database
   ADMIN_EMAIL=olajumoke@mabelhomes.org
   ```

---

## 🚀 Running Commands

### 1. Migrating Database
Configure database tables:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. Seeding Frontend Listings
Seed the PostgreSQL database with the existing frontend mock properties and services:
```bash
python manage.py seed_frontend_data
```

### 3. Creating Admin Superuser
Create an administrator to log into the Django Admin portal:
```bash
python manage.py createsuperuser
```

### 4. Running Dev Server
Launch the API server locally at `http://localhost:8000`:
```bash
python manage.py runserver
```

---

## 🧪 Testing & Code Quality

### Running Unit Tests
Execute the test suites (validating recommendations, abuse protections, transaction safety, and double submission blocks):
```bash
python manage.py test core
```

### Formatting
Format code to standards using installed tools:
```bash
ruff check --fix
black .
isort .
```

---

## 📁 API Endpoints

- **Properties list**: `/api/properties/` (supports searching, pagination, filtering by `type`, `location` (city), `status`, `featured`, `luxury`, etc.)
- **Property Details**: `/api/properties/<slug>/`
- **Similar Recommendations**: `/api/properties/<slug>/similar/`
- **Like Property**: `/api/properties/<slug>/like/` (POST)
- **Submit Property Enquiry**: `/api/property-enquiries/` (POST)
- **Submit Service Enquiry**: `/api/service-enquiries/` (POST)
- **Service Categories list**: `/api/services/`
- **Swagger Documentation**: `/api/docs/`
- **ReDoc Documentation**: `/api/redoc/`
