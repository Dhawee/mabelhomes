import json
import os
import re

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Property, PropertyImage, PropertyType, ServiceType


class Command(BaseCommand):
    help = "Seeds initial database records from the Next.js frontend mock data"

    def handle(self, *args, **options):
        # Locate the frontend data file
        # Check standard relative paths from Backend directory
        possible_paths = [
            os.path.join(settings.BASE_DIR, "..", "src", "data", "site.ts"),
            os.path.join(settings.BASE_DIR, "src", "data", "site.ts"),
        ]

        target_path = None
        for path in possible_paths:
            if os.path.exists(path):
                target_path = path
                break

        if not target_path:
            self.stderr.write(
                "Could not locate site.ts in the frontend directory structure."
            )
            return

        self.stdout.write(f"Reading frontend data from: {target_path}")

        with open(target_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse properties and services arrays
        properties_json = self.parse_ts_array(content, "PROPERTIES")
        services_json = self.parse_ts_array(content, "SERVICES")

        if not properties_json:
            self.stderr.write("Failed to parse PROPERTIES array from frontend file.")
            return
        if not services_json:
            self.stderr.write("Failed to parse SERVICES array from frontend file.")
            return

        self.stdout.write(
            f"Parsed {len(properties_json)} properties and {len(services_json)} services."
        )

        # Seed in a single database transaction
        with transaction.atomic():
            # 1. Seed Service Types
            self.stdout.write("Seeding ServiceType records...")
            service_map = {}
            for s in services_json:
                service, created = ServiceType.objects.get_or_create(
                    slug=s["slug"],
                    defaults={
                        "title": s["title"],
                        "description": s["description"],
                        "icon": s["icon"],
                        "features": s.get("features", []),
                        "long_description": s.get("longDescription", ""),
                        "process": s.get("process", []),
                        "benefits": s.get("benefits", []),
                    },
                )
                service_map[s["slug"]] = service
                if created:
                    self.stdout.write(f" - Created Service: {service.title}")

            # 2. Seed Property Types & Properties
            self.stdout.write("Seeding PropertyType and Property records...")
            for p in properties_json:
                # Resolve Property Type
                type_name = p.get("type", "Apartment")
                prop_type, _ = PropertyType.objects.get_or_create(name=type_name)

                # Resolve coordinates
                coords = p.get("coordinates", {})
                lat = coords.get("lat", 6.4388)
                lng = coords.get("lng", 3.5218)

                # Create Property
                prop, created = Property.objects.get_or_create(
                    slug=p["slug"],
                    defaults={
                        "title": p["title"],
                        "location": p["location"],
                        "city": p.get("city", p["location"].split(",")[-1].strip()),
                        "price": p["price"],
                        "bedrooms": p.get("bedrooms", 0),
                        "bathrooms": p.get("bathrooms", 0),
                        "sqft": p.get("sqft", 0),
                        "status": p.get("status", "For Sale"),
                        "property_type": prop_type,
                        "featured": p.get("featured", False),
                        "luxury": p.get("luxury", False),
                        "description": p.get("description", ""),
                        "building_approval": p.get("buildingApproval"),
                        "survey": p.get("survey"),
                        "document_title": p.get("documentTitle"),
                        "features": p.get("features", []),
                        "amenities": p.get("amenities", []),
                        "year_built": p.get("yearBuilt"),
                        "parking": p.get("parking"),
                        "latitude": lat,
                        "longitude": lng,
                    },
                )

                if created:
                    self.stdout.write(f" - Created Property: {prop.title}")

                    # Add Images
                    images = p.get("images", [])
                    for index, img_url in enumerate(images):
                        PropertyImage.objects.create(
                            property=prop,
                            image_url=img_url,
                            order=index + 1,
                            is_primary=(index == 0),
                        )
                        self.stdout.write(
                            f"   * Added image {index + 1} for {prop.title}"
                        )

        self.stdout.write(
            self.style.SUCCESS("Database seeding completed successfully!")
        )

    def parse_ts_array(self, content, array_name):
        """
        Extracts and converts a TypeScript array literal into a Python list of dicts.
        """
        # Find start of array: export const ARRAY_NAME: Type[] = [
        pattern = rf"export\s+const\s+{array_name}(?::\s*\w+\[\])?\s*=\s*\["
        match = re.search(pattern, content)
        if not match:
            return None

        start_idx = match.end() - 1  # include the '['

        # Track bracket balancing to locate the end of the array
        bracket_count = 0
        end_idx = -1
        for i in range(start_idx, len(content)):
            char = content[i]
            if char == "[":
                bracket_count += 1
            elif char == "]":
                bracket_count -= 1
                if bracket_count == 0:
                    end_idx = i + 1
                    break

        if end_idx == -1:
            return None

        array_str = content[start_idx:end_idx]

        # Clean JS syntax to make it standard valid JSON
        # 1. Remove single-line comments that are NOT part of URLs (i.e. not preceded by a colon)
        cleaned = re.sub(r"(?<!:)\/\/.*", "", array_str)
        # 2. Quote keys: e.g. title: "value" -> "title": "value"
        # Matches word boundaries at start of object fields
        cleaned = re.sub(r"([{,]\s*)([a-zA-Z_]\w*)(\s*:)", r'\1"\2"\3', cleaned)
        # 3. Remove trailing commas before closing brackets/braces
        cleaned = re.sub(r",\s*([}\]])", r"\1", cleaned)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            # Fallback/Debug print to stdout to understand cleaning failures if they occur
            print(f"JSON Decoding Error: {e}")
            print(cleaned[:1000])
            return None
