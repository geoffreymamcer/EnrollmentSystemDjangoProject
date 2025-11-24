from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    office_location = models.CharField(max_length=100)
    phone_contact = models.CharField(max_length=20)
    established_date = models.DateField()

    def __str__(self):
        return self.name

class Instructor(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    hire_date = models.DateField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Student(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    dob = models.DateField(verbose_name="Date of Birth")
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Course(models.Model):
    title = models.CharField(max_length=100)
    course_code = models.CharField(max_length=20)
    credits = models.IntegerField()
    semester = models.CharField(max_length=50)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('Enrolled', 'Enrolled'),
        ('Dropped', 'Dropped'),
        ('Completed', 'Completed'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Enrolled')
    grade = models.CharField(max_length=5, blank=True, null=True)

    def __str__(self):
        return f"{self.student} -> {self.course}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# 🔄 AUTOMATION: Create Profile automatically when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()