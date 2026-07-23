import logging

from django.db import transaction
from django.db.models import Q

from core.models import Property, PropertyLike

logger = logging.getLogger("core")


def get_similar_properties(property_instance, limit=3):
    """
    Find similar properties for a given property.
    Prioritized by:
    1. Same location (city/neighborhood)
    2. Same property type
    3. Similar price range (+/- 20% or +/- 50%)
    4. Overlapping features & amenities
    """
    candidates = (
        Property.objects.filter(is_visible=True, is_deleted=False, listing_type=property_instance.listing_type)
        .exclude(id=property_instance.id)
        .select_related("property_type")
        .prefetch_related("images")
    )

    scored_candidates = []

    for candidate in candidates:
        score = 0

        # 1. Location Matching
        cand_city = (candidate.city or "").lower()
        orig_city = (property_instance.city or "").lower()
        if cand_city and orig_city and cand_city == orig_city:
            score += 5

        cand_loc = (candidate.location or "").lower()
        orig_loc = (property_instance.location or "").lower()
        if cand_loc and orig_loc and cand_loc == orig_loc:
            score += 2

        # 2. Type Matching
        if candidate.property_type_id == property_instance.property_type_id:
            score += 4

        # 3. Price Proximity Matching
        price_diff = abs(candidate.price - property_instance.price)
        if property_instance.price > 0:
            pct_diff = price_diff / property_instance.price
            if pct_diff <= 0.2:
                score += 3
            elif pct_diff <= 0.5:
                score += 1

        # 4. Features & Amenities Overlap
        cand_features = (
            set(candidate.features) if isinstance(candidate.features, list) else set()
        )
        orig_features = (
            set(property_instance.features)
            if isinstance(property_instance.features, list)
            else set()
        )
        score += len(cand_features.intersection(orig_features))

        cand_amenities = (
            set(candidate.amenities) if isinstance(candidate.amenities, list) else set()
        )
        orig_amenities = (
            set(property_instance.amenities)
            if isinstance(property_instance.amenities, list)
            else set()
        )
        score += len(cand_amenities.intersection(orig_amenities))

        scored_candidates.append((score, candidate))

    # Sort candidates by score descending
    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    # Return top entries up to the limit
    return [item[1] for item in scored_candidates[:limit]]


def get_like_status(property_id: int, session_key: str | None, ip_address: str | None = None) -> dict:
    """
    Returns whether the current visitor has liked a property.
    Checks by session_key (which stores the persistent visitor UUID).
    Does NOT check by ip_address to avoid multi-user conflicts on the same network.
    Automatically keeps likes_count in sync on read.

    Returns:
        {
            "liked": bool,
            "likes_count": int,
        }
    """
    try:
        prop = Property.objects.get(id=property_id, is_visible=True, is_deleted=False)
    except Property.DoesNotExist:
        return {"liked": False, "likes_count": 0}

    # Ensure count is accurate by reading actual DB records
    actual_count = PropertyLike.objects.filter(property=prop).count()
    if prop.likes_count != actual_count:
        prop.likes_count = actual_count
        prop.save(update_fields=["likes_count"])

    if not session_key:
        return {"liked": False, "likes_count": actual_count}

    liked = PropertyLike.objects.filter(property=prop, session_key=session_key).exists()

    return {
        "liked": liked,
        "likes_count": actual_count,
    }


def toggle_like_property(
    property_id: int, session_key: str | None, ip_address: str | None = None
) -> dict:
    """
    Toggles the like state for a property from a specific visitor identified by session_key (Visitor UUID).

    - If the visitor has NOT liked: creates a like and increments counter.
    - If the visitor HAS liked: removes the like and decrements counter.

    Uses a single atomic transaction and selects for update to prevent race conditions.
    Always uses DB counts to update the denormalized likes_count.

    Returns:
        {
            "liked": bool,      # True = liked, False = unliked
            "likes_count": int, # Updated count after toggle
            "message": str,
        }
    """
    if not session_key:
        try:
            prop = Property.objects.get(id=property_id, is_visible=True, is_deleted=False)
            likes_count = prop.likes_count
        except Property.DoesNotExist:
            likes_count = 0
        return {
            "liked": False,
            "likes_count": likes_count,
            "message": "Visitor ID is required.",
        }

    with transaction.atomic():
        try:
            prop = Property.objects.select_for_update().get(
                id=property_id, is_visible=True, is_deleted=False
            )
        except Property.DoesNotExist:
            return {"liked": False, "likes_count": 0, "message": "Property not found."}

        # Query only by visitor session_key (UUID) to prevent NAT/office IP conflicts
        existing_like = (
            PropertyLike.objects.filter(property=prop, session_key=session_key).first()
        )

        if existing_like:
            # Toggle OFF — remove the like
            existing_like.delete()
            actual_count = PropertyLike.objects.filter(property=prop).count()
            prop.likes_count = actual_count
            prop.save(update_fields=["likes_count"])

            logger.debug(
                f"Property {property_id} unliked by visitor={session_key}. "
                f"New count: {actual_count}"
            )
            return {
                "liked": False,
                "likes_count": actual_count,
                "message": "Like removed.",
            }
        else:
            # Toggle ON — create a like
            try:
                PropertyLike.objects.create(
                    property=prop,
                    session_key=session_key,
                    ip_address=ip_address,
                )
            except Exception as e:
                logger.warning(f"Failed to create PropertyLike for visitor={session_key}: {e}")
                
            actual_count = PropertyLike.objects.filter(property=prop).count()
            prop.likes_count = actual_count
            prop.save(update_fields=["likes_count"])

            logger.debug(
                f"Property {property_id} liked by visitor={session_key}. "
                f"New count: {actual_count}"
            )
            return {
                "liked": True,
                "likes_count": actual_count,
                "message": "Liked successfully.",
            }


# Keep backward-compatible alias used in existing tests
def like_property(property_id, session_key=None, ip_address=None):
    """
    Legacy wrapper — preserved for backward compatibility with existing tests.
    Calls toggle_like_property internally.

    Returns: (success: bool, message: str)
    """
    result = toggle_like_property(property_id, session_key, ip_address)
    if result["liked"]:
        return True, result["message"]
    elif "not found" in result["message"] or "required" in result["message"]:
        return False, result["message"]
    else:
        # Was unliked (toggle off) — old code treated this as a failure, but toggle is valid now
        return True, result["message"]
