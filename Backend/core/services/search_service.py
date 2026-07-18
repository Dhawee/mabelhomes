from django.db.models import Q

from core.models import Property


def search_and_filter_properties(
    search_query=None,
    city=None,
    type_slug=None,
    status=None,
    price_min=None,
    price_max=None,
    bedrooms=None,
    featured=None,
    luxury=None,
    include_hidden=False,
    is_visible=None,
    show_deleted=False,
    prefetch_videos=True,
):
    """
    Queries visible, non-deleted properties based on filters.
    Optimizes queries by prefetching images and joining property_type,
    preventing N+1 queries.
    """
    # Base optimized query
    if show_deleted:
        base_filter = Q(is_deleted=True)
    else:
        base_filter = Q(is_deleted=False)
    if not include_hidden:
        base_filter &= Q(is_visible=True)
    elif is_visible is not None:
        base_filter &= Q(is_visible=is_visible)

    queryset = (
        Property.objects.filter(base_filter)
        .select_related("property_type")
        .prefetch_related("images")
    )
    if prefetch_videos:
        queryset = queryset.prefetch_related("videos")
    queryset = queryset.order_by("-created_at")

    # Apply search text matches across multiple fields
    if search_query:
        query_terms = search_query.strip().split()
        search_filter = Q()
        for term in query_terms:
            search_filter &= (
                Q(title__icontains=term)
                | Q(location__icontains=term)
                | Q(city__icontains=term)
                | Q(description__icontains=term)
                | Q(property_type__name__icontains=term)
            )
        queryset = queryset.filter(search_filter)

    # Apply exact filters
    if city:
        queryset = queryset.filter(city__iexact=city.strip())

    if type_slug:
        queryset = queryset.filter(property_type__slug=type_slug.strip())

    if status:
        queryset = queryset.filter(status__iexact=status.strip())

    # Range Filters
    if price_min is not None:
        queryset = queryset.filter(price__gte=price_min)
    if price_max is not None:
        queryset = queryset.filter(price__lte=price_max)

    if bedrooms is not None:
        queryset = queryset.filter(bedrooms__gte=bedrooms)

    # Boolean Toggles
    if featured is not None:
        queryset = queryset.filter(featured=featured)
    if luxury is not None:
        queryset = queryset.filter(luxury=luxury)

    return queryset
