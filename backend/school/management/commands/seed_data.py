from django.core.management.base import BaseCommand
from school.models import Department, Instructor, Student, Course, Enrollment
from datetime import date
import random

class Command(BaseCommand):
    help = 'Seeds the database with Filipino mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Lists for Random Generation
        first_names = [
            "Juan", "Maria", "Jose", "Andres", "Gabriela", 
            "Bayani", "Tala", "Isagani", "Amihan", "Lakan", 
            "Francisco", "Clara", "Diego", "Luz", "Emilio"
        ]
        
        last_names = [
            "Santos", "Reyes", "Cruz", "Bautista", "Del Rosario",
            "Mendoza", "Garcia", "Torres", "Ramos", "Flores",
            "Dimaculangan", "Macapagal", "Batungbakal", "Dalisay", "Catapang"
        ]

        # Specific Departments Configuration
        dept_configs = [
            {
                "name": "Information Technology", 
                "code": "IT", 
                "loc": "Tech Hub, 3rd Floor"
            },
            {
                "name": "Entrepreneurship", 
                "code": "ENT", 
                "loc": "Business Center, Rm 101"
            },
            {
                "name": "Linguistics", 
                "code": "LIN", 
                "loc": "Humanities Hall, Rm 205"
            },
            {
                "name": "Education", 
                "code": "EDU", 
                "loc": "Teachers Pavilion, Rm 102"
            },
            {
                "name": "Public Administration", 
                "code": "PUB", 
                "loc": "Governance Bldg, Rm 404"
            },
        ]

        # 1. Departments (Create 10 records: 2 sections for each of the 5 types)
        depts = []
        for i in range(10):
            config = dept_configs[i % 5] # Cycle through the 5 configs
            section = "A" if i < 5 else "B"
            
            d = Department.objects.create(
                name=f"{config['name']} - Sec {section}", 
                code=f"{config['code']}10{i+1}", 
                office_location=config['loc'],
                phone_contact=f"0917-555-00{i}", 
                established_date=date(2005, 6, 15)
            )
            depts.append(d)
        
        self.stdout.write(f'Created {len(depts)} Departments')

        # 2. Instructors (Create 10)
        instructors = []
        for i in range(10):
            f_name = random.choice(first_names)
            l_name = random.choice(last_names)
            
            ins = Instructor.objects.create(
                first_name=f_name, 
                last_name=l_name,
                email=f"{f_name.lower()}.{l_name.lower()}{i}@edunexus.ph", 
                hire_date=date(2018, 8, 1),
                department=random.choice(depts)
            )
            instructors.append(ins)
            
        self.stdout.write(f'Created {len(instructors)} Instructors')

        # 3. Students (Create 10)
        students = []
        for i in range(10):
            f_name = random.choice(first_names)
            l_name = random.choice(last_names)
            
            s = Student.objects.create(
                first_name=f_name, 
                last_name=l_name,
                email=f"{f_name.lower()}{i}@student.edunexus.ph", 
                dob=date(2003, random.randint(1, 12), random.randint(1, 28)),
                department=random.choice(depts)
            )
            students.append(s)
            
        self.stdout.write(f'Created {len(students)} Students')

        # 4. Courses (Create 10 - Contextual Titles)
        courses = []
        course_titles = [
            ("Intro to Python", "Information Technology"),
            ("Web Development", "Information Technology"),
            ("Business Planning", "Entrepreneurship"),
            ("Accounting 101", "Entrepreneurship"),
            ("Filipino 1", "Linguistics"),
            ("English Phonetics", "Linguistics"),
            ("Child Psychology", "Education"),
            ("Curriculum Dev", "Education"),
            ("Public Policy", "Public Administration"),
            ("Governance 101", "Public Administration"),
        ]

        for i in range(10):
            title, dept_name_match = course_titles[i]
            
            # Find an instructor belonging to the matching department (approximate)
            # This is a simple logic to try and match course to relevant instructor
            relevant_instructor = next(
                (ins for ins in instructors if dept_name_match in ins.department.name), 
                random.choice(instructors) # Fallback if no exact match
            )

            c = Course.objects.create(
                title=title, 
                course_code=f"SUBJ-{100+i}", 
                credits=3,
                semester="1st Sem 2025-2026", 
                instructor=relevant_instructor
            )
            courses.append(c)

        self.stdout.write(f'Created {len(courses)} Courses')

        # 5. Enrollments (Create 10)
        for i in range(10):
            Enrollment.objects.create(
                student=random.choice(students),
                course=random.choice(courses),
                status=random.choice(['Enrolled', 'Enrolled', 'Completed']), # Weighted to Enrolled
                grade=random.choice(['1.0', '1.25', '1.5', '1.75', '2.0', ''])
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with Filipino context data!'))