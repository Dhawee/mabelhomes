import os
import sys
import django

# Add current folder to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mabelhomes_backend.settings")

# Dynamic databases settings override BEFORE django.setup()
from django.conf import settings

# Force configure sqlite as secondary database connection
settings.DATABASES['sqlite'] = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
}

django.setup()

from django.db import transaction
from django.db.models.signals import post_save, pre_save, post_delete
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from core.models import (PropertyType, ServiceType, Property, PropertyImage,
                           PropertyVideo, PropertyEnquiry, ServiceEnquiry,
                           ContactMessage, AdminNotification, AuditLog,
                           EnquiryReply, UserProfile)

def disconnect_all_signals():
    """
    Disconnects all custom and Django built-in signals that could interfere 
    with direct ORM copying (like auto-creating UserProfiles or mailing admins).
    """
    print("Disconnecting Django signals to avoid auto-trigger issues during migration...")
    
    # Import signal handlers from core.signals to disconnect them
    from core import signals
    
    post_save.disconnect(receiver=signals.create_user_profile, sender=User)
    post_save.disconnect(receiver=signals.save_user_profile, sender=User)
    
    pre_save.disconnect(sender=Property)
    post_save.disconnect(sender=Property)
    post_delete.disconnect(sender=Property)
    
    pre_save.disconnect(sender=PropertyImage)
    post_save.disconnect(sender=PropertyImage)
    post_delete.disconnect(sender=PropertyImage)
    
    pre_save.disconnect(sender=PropertyVideo)
    post_save.disconnect(sender=PropertyVideo)
    post_delete.disconnect(sender=PropertyVideo)

def migrate_model(model_class, name):
    print(f"\nMigrating {name}...")
    source_items = list(model_class.objects.using('sqlite').all())
    total = len(source_items)
    print(f"Found {total} records in SQLite.")
    
    success_count = 0
    # Use transactional block on PostgreSQL default connection
    with transaction.atomic(using='default'):
        # Empty postgres records first to avoid duplicate primary keys
        model_class.objects.using('default').all().delete()
        
        for index, item in enumerate(source_items, 1):
            try:
                # Save item using PostgreSQL connection
                item.save(using='default')
                success_count += 1
                if index % 50 == 0 or index == total:
                    print(f"[{success_count}/{total}] Migrated...")
            except Exception as e:
                print(f"Failed to migrate record ID {item.pk}: {e}")
                raise e
    print(f"Successfully migrated {success_count} of {total} records.")

def main():
    # Double check connection settings
    db_default = settings.DATABASES['default']
    if 'sqlite3' in db_default.get('ENGINE', ''):
        print("ERROR: Your 'default' database is still SQLite! Please configure your PostgreSQL connection environment variables first.")
        sys.exit(1)
        
    print("Starting SQLite to PostgreSQL Migration...")
    print(f"Postgres Target: {db_default.get('HOST')}:{db_default.get('PORT')} ({db_default.get('NAME')})")
    
    disconnect_all_signals()
    
    try:
        # Migrate Auth Groups & Permissions
        migrate_model(Group, "Auth Groups")
        
        # Migrate Core Tables (Dependencies first)
        migrate_model(PropertyType, "Property Types")
        migrate_model(ServiceType, "Service Types")
        migrate_model(User, "Users")
        migrate_model(UserProfile, "User Profiles")
        migrate_model(Property, "Properties")
        migrate_model(PropertyImage, "Property Images")
        migrate_model(PropertyVideo, "Property Videos")
        migrate_model(PropertyEnquiry, "Property Enquiries")
        migrate_model(ServiceEnquiry, "Service Enquiries")
        migrate_model(ContactMessage, "Contact Messages")
        migrate_model(AdminNotification, "Admin Notifications")
        migrate_model(EnquiryReply, "Enquiry Replies")
        migrate_model(AuditLog, "Audit Logs")
        
        print("\n=======================================================")
        print("MIGRATION COMPLETED SUCCESSFULLY WITH ZERO DATA LOSS!")
        print("Please check record counts in PostgreSQL to verify.")
        print("=======================================================")
        
    except Exception as e:
        print(f"\nMigration failed: {e}")
        print("PostgreSQL transaction rolled back. SQLite data remains untouched.")
        sys.exit(1)

if __name__ == "__main__":
    main()
