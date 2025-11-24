from rest_framework import serializers
from .models import Department, Instructor, Student, Course, Enrollment
from django.contrib.auth.models import User 

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # 🛡️ SECURITY: utilize create_user to automatically hash the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__' 

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    # ➕ 🟢 ADDED: Map the nested profile avatar to a flat field
    avatar = serializers.ImageField(source='profile.avatar', required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar']
        read_only_fields = ['username']

    def update(self, instance, validated_data):
        # 🔄 LOGIC: Extract avatar data separately
        profile_data = validated_data.pop('profile', {})
        avatar = profile_data.get('avatar')

        # Update standard User fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Update Profile (Avatar)
        if avatar:
            instance.profile.avatar = avatar
            instance.profile.save()

        return instance