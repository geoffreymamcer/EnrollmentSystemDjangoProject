// --- START OF FILE Dashboard.tsx ---

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";

// --- Types needed for local state ---
interface DashboardStat {
  students: number;
  instructors: number;
  courses: number;
  departments: number;
}

interface ChartData {
  name: string;
  students: number;
}

// Minimal types for relationship lookup
interface StudentRef {
  id: number;
  firstName: string;
  lastName: string;
  departmentId: number;
}
interface CourseRef {
  id: number;
  title: string;
}
interface EnrollmentRef {
  id: number;
  studentId: number;
  courseId: number;
  status: string;
  date: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  trend,
}: {
  title: string;
  value: number | string;
  icon: any;
  colorClass: string;
  trend?: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-100 group relative overflow-hidden">
    <div
      className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass}`}
    ></div>

    <div className="flex items-start justify-between mb-4 relative z-10">
      <div
        className={`p-3.5 rounded-xl ${colorClass.replace(
          "bg-",
          "bg-opacity-10 text-"
        )}`}
      >
        <Icon size={26} className={`${colorClass.replace("bg-", "text-")}`} />
      </div>
      {trend && (
        <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <TrendingUp size={12} className="mr-1" /> {trend}
        </span>
      )}
    </div>

    <div className="relative z-10">
      <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // 1. State for Count Stats
  const [stats, setStats] = useState<DashboardStat>({
    students: 0,
    instructors: 0,
    courses: 0,
    departments: 0,
  });

  // 2. State for Lists (to resolve names and populate charts)
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentRef[]>(
    []
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Lookup tables
  const [studentsList, setStudentsList] = useState<StudentRef[]>([]);
  const [coursesList, setCoursesList] = useState<CourseRef[]>([]);

  const [loading, setLoading] = useState(true);

  // Helper: Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const headers = getAuthHeaders();

        // 3. Fetch ALL data in parallel
        const [stuRes, instRes, courseRes, deptRes, enrRes] = await Promise.all(
          [
            fetch("http://127.0.0.1:8000/api/students/", { headers }),
            fetch("http://127.0.0.1:8000/api/instructors/", { headers }),
            fetch("http://127.0.0.1:8000/api/courses/", { headers }),
            fetch("http://127.0.0.1:8000/api/departments/", { headers }),
            fetch("http://127.0.0.1:8000/api/enrollments/", { headers }),
          ]
        );

        if (
          !stuRes.ok ||
          !instRes.ok ||
          !courseRes.ok ||
          !deptRes.ok ||
          !enrRes.ok
        ) {
          throw new Error("Failed to fetch dashboard data");
        }

        const students = await stuRes.json();
        const instructors = await instRes.json();
        const courses = await courseRes.json();
        const departments = await deptRes.json();
        const enrollments = await enrRes.json();

        // 4. Update Stats
        setStats({
          students: students.length,
          instructors: instructors.length,
          courses: courses.length,
          departments: departments.length,
        });

        // 5. Store Lookup Lists (Transform snake_case to CamelCase)
        const formattedStudents = students.map((s: any) => ({
          id: s.id,
          firstName: s.first_name,
          lastName: s.last_name,
          departmentId: s.department,
        }));
        setStudentsList(formattedStudents);

        const formattedCourses = courses.map((c: any) => ({
          id: c.id,
          title: c.title,
        }));
        setCoursesList(formattedCourses);

        // 6. Process Chart Data: Count Students per Department
        // Step A: Count occurrences of department IDs in student list
        const deptCounts: Record<number, number> = {};
        students.forEach((s: any) => {
          const dId = s.department;
          deptCounts[dId] = (deptCounts[dId] || 0) + 1;
        });

        // Step B: Map Department Codes to Counts
        const processedChartData = departments.map((d: any) => ({
          name: d.code, // e.g., "CS"
          students: deptCounts[d.id] || 0, // Default to 0 if no students
        }));
        setChartData(processedChartData);

        // 7. Process Recent Enrollments (Last 5)
        // Sort by ID descending (assuming higher ID = newer) or date
        const sortedEnrollments = enrollments
          .sort((a: any, b: any) => b.id - a.id)
          .slice(0, 5);

        setRecentEnrollments(
          sortedEnrollments.map((e: any) => ({
            id: e.id,
            studentId: e.student,
            courseId: e.course,
            status: e.status,
            date: e.enrollment_date,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Dashboard data load failed:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 8. Helper Functions to Resolve Names from IDs
  const getStudentName = (id: number) => {
    const s = studentsList.find((stu) => stu.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown Student";
  };

  const getCourseTitle = (id: number) => {
    const c = coursesList.find((cou) => cou.id === id);
    return c ? c.title : "Unknown Course";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-primary-900/20 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500 opacity-20 rounded-full blur-2xl"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-primary-200 mb-2 font-medium">
            <Calendar size={18} />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, Administrator!
          </h1>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed opacity-90">
            You have{" "}
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
              {recentEnrollments.filter((e) => e.status === "Enrolled").length}{" "}
              new enrollments
            </span>{" "}
            to review today. The system is running smoothly.
          </p>
          <button className="bg-white text-primary-700 px-6 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg shadow-black/10 inline-flex items-center gap-2">
            View Reports <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.students}
          icon={GraduationCap}
          colorClass="bg-violet-600"
          trend="+12%" // You could calculate this real-time if you had historical data
        />
        <StatCard
          title="Active Courses"
          value={stats.courses}
          icon={BookOpen}
          colorClass="bg-sky-500"
        />
        <StatCard
          title="Instructors"
          value={stats.instructors}
          icon={Users}
          colorClass="bg-pink-500"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
          colorClass="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-transparent">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Enrollment Trends
              </h3>
              <p className="text-slate-400 text-sm">
                Student distribution across departments
              </p>
            </div>
            {/* Filter UI - (Functional logic would require more backend filtering) */}
            <select className="bg-slate-50 border-none text-slate-600 text-sm rounded-lg px-3 py-2 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors">
              <option>Current Data</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    padding: "12px",
                  }}
                />
                <Bar
                  dataKey="students"
                  fill="#7c3aed"
                  radius={[6, 6, 6, 6]}
                  barSize={32}
                  fillOpacity={0.9}
                  name="Students"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-transparent flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">
            Recent Enrollments
          </h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentEnrollments.length > 0 ? (
              recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-start gap-4 group"
                >
                  <div
                    className={`
                    w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110
                    ${
                      enrollment.status === "Enrolled"
                        ? "bg-green-100 text-green-700"
                        : enrollment.status === "Dropped"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  `}
                  >
                    {/* Display first letter of Student Name */}
                    {getStudentName(enrollment.studentId).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {getStudentName(enrollment.studentId)}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(enrollment.date).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {getCourseTitle(enrollment.courseId)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          enrollment.status === "Enrolled"
                            ? "bg-green-50 text-green-600"
                            : enrollment.status === "Dropped"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-10">
                No enrollments found.
              </div>
            )}
          </div>
          <button className="mt-6 w-full py-2 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
            View All Enrollments
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
