from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, InstructorViewSet, StudentViewSet, CourseViewSet, EnrollmentViewSet, RegisterView, UserProfileView 

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'instructors', InstructorViewSet)
router.register(r'students', StudentViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),

]