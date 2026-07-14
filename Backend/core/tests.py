from django.core.exceptions import ValidationError
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status

from core.models import (Property, PropertyType, ServiceType, ContactMessage,
                         PropertyVideo, EnquiryReply, AdminNotification)
from core.services.enquiry_service import (create_property_enquiry,
                                           create_service_enquiry,
                                           send_enquiry_reply)
from core.services.property_service import (get_similar_properties,
                                            toggle_like_property)

User = get_user_model()


class PropertyServiceTests(TestCase):
    def setUp(self):
        # Create Property Types
        self.type_house = PropertyType.objects.create(name="House")
        self.type_flat = PropertyType.objects.create(name="Flat")

        # Create Properties
        self.prop_a = Property.objects.create(
            title="House A in Lekki",
            location="Lekki, Lagos",
            city="Lagos",
            price=100000000,
            bedrooms=4,
            bathrooms=4,
            sqft=3000,
            status="For Sale",
            property_type=self.type_house,
            latitude=6.45,
            longitude=3.50,
            features=["Modern", "Pool"],
            amenities=["Security", "Water"],
        )

        self.prop_b = Property.objects.create(
            title="House B in Lekki",
            location="Lekki, Lagos",
            city="Lagos",
            price=110000000,  # Within 20%
            bedrooms=4,
            bathrooms=4,
            sqft=3200,
            status="For Sale",
            property_type=self.type_house,
            latitude=6.46,
            longitude=3.51,
            features=["Modern"],
            amenities=["Security"],
        )

        self.prop_c = Property.objects.create(
            title="Flat C in Ikeja",
            location="Ikeja, Lagos",
            city="Ikeja",
            price=50000000,  # 50% price, different city and type
            bedrooms=2,
            bathrooms=2,
            sqft=1200,
            status="For Rent",
            property_type=self.type_flat,
            latitude=6.60,
            longitude=3.35,
            features=["Compact"],
            amenities=["Electricity"],
        )

    def test_similar_properties_recommendation(self):
        """
        Tests that House B is recommended as similar to House A
        due to overlapping location, type, and price range.
        """
        similar = get_similar_properties(self.prop_a, limit=2)
        self.assertEqual(len(similar), 2)
        self.assertEqual(similar[0].id, self.prop_b.id)

    def test_property_like_toggle_behavior(self):
        """
        Tests the toggle-based like system:
        - First like from session_1 / 127.0.0.1 → liked=True, count=1
        - Second call from same session → toggles OFF (unlike), count=0
        - A fresh session (session_2) with a different IP can like again → count=1
        """
        # First like from session_1 / 127.0.0.1
        result = toggle_like_property(
            self.prop_a.id, session_key="session_1", ip_address="127.0.0.1"
        )
        self.assertTrue(result["liked"])
        self.assertEqual(result["likes_count"], 1)
        self.prop_a.refresh_from_db()
        self.assertEqual(self.prop_a.likes_count, 1)

        # Same session clicks again → should toggle OFF (unlike)
        result = toggle_like_property(
            self.prop_a.id, session_key="session_1", ip_address="127.0.0.1"
        )
        self.assertFalse(result["liked"])
        self.assertEqual(result["likes_count"], 0)
        self.prop_a.refresh_from_db()
        self.assertEqual(self.prop_a.likes_count, 0)

        # A completely different visitor (new session + new IP) can like
        result = toggle_like_property(
            self.prop_a.id, session_key="session_2", ip_address="192.168.1.1"
        )
        self.assertTrue(result["liked"])
        self.assertEqual(result["likes_count"], 1)


class EnquiryServiceTests(TestCase):
    def setUp(self):
        self.type_house = PropertyType.objects.create(name="House")
        self.property = Property.objects.create(
            title="Villa Chevron",
            location="Chevron, Lagos",
            city="Lagos",
            price=150000000,
            bedrooms=5,
            bathrooms=6,
            sqft=5000,
            status="For Sale",
            property_type=self.type_house,
            latitude=6.43,
            longitude=3.52,
        )
        self.service = ServiceType.objects.create(
            title="Property Management",
            description="Manage your properties",
            icon="Home",
        )
        self.staff_user = User.objects.create_user(
            username="staff", email="staff@example.com", password="password", is_staff=True
        )

    def test_create_property_enquiry_success(self):
        enquiry = create_property_enquiry(
            property_id=self.property.id,
            name="John Doe",
            email="johndoe@example.com",
            phone="+234800000000",
            message="Hello, I want to inspect this villa.",
        )
        self.assertIsNotNone(enquiry.id)
        self.assertEqual(enquiry.property_title, self.property.title)

        # Notification generation assertion
        notif_exists = AdminNotification.objects.filter(
            notification_type="property_enquiry", title__contains="Villa Chevron"
        ).exists()
        self.assertTrue(notif_exists)

    def test_create_property_enquiry_spam_prevention(self):
        # First submission succeeds
        create_property_enquiry(
            property_id=self.property.id,
            name="John Doe",
            email="johndoe@example.com",
            phone="+234800000000",
            message="Hello, I want to inspect this villa.",
        )

        # Duplicate submission within 5 minutes raises ValidationError
        with self.assertRaises(ValidationError) as context:
            create_property_enquiry(
                property_id=self.property.id,
                name="John Doe",
                email="johndoe@example.com",
                phone="+234800000000",
                message="Hello, I want to inspect this villa.",
            )
        self.assertIn("already submitted this enquiry recently", str(context.exception))

    def test_create_service_enquiry_success(self):
        enquiry = create_service_enquiry(
            service_slug_or_id=self.service.slug,
            name="Alice Smith",
            email="alice@example.com",
            phone="+234700000000",
            message="Please manage my duplex.",
        )
        self.assertIsNotNone(enquiry.id)
        self.assertEqual(enquiry.service_title, self.service.title)

        # Notification generation assertion
        notif_exists = AdminNotification.objects.filter(
            notification_type="service_enquiry", title__contains="Property Management"
        ).exists()
        self.assertTrue(notif_exists)

    def test_reply_system_success(self):
        # Create an enquiry first
        enquiry = create_property_enquiry(
            property_id=self.property.id,
            name="Recipient Doe",
            email="recipient@example.com",
            phone="+234800000000",
            message="Initial interest",
        )

        # Send reply
        reply = send_enquiry_reply(
            enquiry_instance=enquiry,
            subject="Re: Villa Chevron",
            message="Sure, when are you available?",
            sender_user=self.staff_user,
        )

        self.assertIsNotNone(reply.id)
        self.assertEqual(reply.recipient_email, "recipient@example.com")
        self.assertEqual(reply.subject, "Re: Villa Chevron")

        # Check enquiry marked as replied
        enquiry.refresh_from_db()
        self.assertTrue(enquiry.replied)
        self.assertEqual(enquiry.status, "Responded")


class ContactMessageTests(TestCase):
    def test_contact_message_submission_and_notification(self):
        message = ContactMessage.objects.create(
            name="Jane Contact",
            email="jane@example.com",
            phone="+234800001234",
            subject="General Question",
            message="Do you support luxury home valuations?",
        )
        self.assertIsNotNone(message.id)
        self.assertEqual(message.status, "Pending")

        # AdminNotification created via signals.py
        notif_exists = AdminNotification.objects.filter(
            notification_type="contact", title__contains="Jane Contact"
        ).exists()
        self.assertTrue(notif_exists)


class PropertyVideoTests(TestCase):
    def setUp(self):
        self.type_house = PropertyType.objects.create(name="House")
        self.property = Property.objects.create(
            title="Video Villa",
            location="Lagos",
            city="Lagos",
            price=50000000,
            bedrooms=3,
            bathrooms=3,
            sqft=2000,
            status="For Sale",
            property_type=self.type_house,
            latitude=6.45,
            longitude=3.50,
        )

    def test_property_video_embed_url_conversion(self):
        # YouTube URL conversion
        video_yt = PropertyVideo.objects.create(
            property=self.property,
            title="Villa Tour YT",
            video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        )
        self.assertEqual(
            video_yt.video_type, "youtube"
        )
        self.assertEqual(
            video_yt.get_embed_url(),
            "https://www.youtube.com/embed/dQw4w9WgXcQ"
        )

        # Vimeo URL conversion
        video_vimeo = PropertyVideo.objects.create(
            property=self.property,
            title="Villa Tour Vimeo",
            video_url="https://vimeo.com/80612345",
        )
        self.assertEqual(
            video_vimeo.video_type, "vimeo"
        )
        self.assertEqual(
            video_vimeo.get_embed_url(),
            "https://player.vimeo.com/video/80612345"
        )


class APITests(APITestCase):
    def setUp(self):
        self.type_house = PropertyType.objects.create(name="House")
        self.property = Property.objects.create(
            title="API Villa",
            location="Lagos",
            city="Lagos",
            price=50000000,
            bedrooms=3,
            bathrooms=3,
            sqft=2000,
            status="For Sale",
            property_type=self.type_house,
            latitude=6.45,
            longitude=3.50,
        )
        self.staff_user = User.objects.create_user(
            username="apistaff", email="apistaff@example.com", password="password123", is_staff=True
        )

    def test_jwt_authentication_endpoints(self):
        # 1. Obtain Token Pair
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "apistaff", "password": "password123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        access_token = response.data["access"]
        refresh_token = response.data["refresh"]

        # 2. Verify Token
        verify_response = self.client.post(
            reverse("token_verify"),
            {"token": access_token},
            format="json",
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)

        # 3. Refresh Token
        refresh_response = self.client.post(
            reverse("token_refresh"),
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

    def test_api_permissions_and_stats(self):
        # Properties should be open for read access
        properties_list_url = "/api/properties/"
        response = self.client.get(properties_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Creating a property anonymously should fail (401/403)
        response_post = self.client.post(
            properties_list_url,
            {"title": "Anonymous Property", "price": 10000},
            format="json",
        )
        self.assertEqual(response_post.status_code, status.HTTP_401_UNAUTHORIZED)

        # Dashboard stats should require staff authentication
        stats_url = reverse("dashboard-stats")
        stats_anon = self.client.get(stats_url)
        self.assertEqual(stats_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # Log in with JWT and test dashboard stats
        self.client.force_authenticate(user=self.staff_user)
        stats_auth = self.client.get(stats_url)
        self.assertEqual(stats_auth.status_code, status.HTTP_200_OK)
        self.assertEqual(stats_auth.data["total_properties"], 1)
