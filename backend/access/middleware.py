class DocsSameOriginMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if "/api/docs" in request.path:
            # Remover headers que podem interferir
            response["X-Frame-Options"] = "SAMEORIGIN"
            if "Content-Security-Policy" in response:
                del response["Content-Security-Policy"]
        return response
