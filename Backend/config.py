import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

class Config:
    """
    Base configuration class containing shared settings for all environments.
    """
    # Core Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    
    # Database settings: Exclusively using PostgreSQL
    DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgresql@localhost:5432/smart_polio_reporting_monitoring')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Connection pooling for better PostgreSQL performance
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 10,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    }
    
    # JWT (JSON Web Token) settings for secure authentication
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=80)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=80)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Security: Bcrypt hashing complexity
    BCRYPT_LOG_ROUNDS = 12
    
    # CORS: Allowed origins for the frontend (React)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')

class DevelopmentConfig(Config):
    """Configuration for local development."""
    DEBUG = True

class ProductionConfig(Config):
    """Configuration for production environments."""
    DEBUG = False
    # Ensure production environment variables are strictly enforced here
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')

# Mapping environment names to configuration classes
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}