Project Mentora:

Project description & System Implementation Design:
To build a platform that is fast, reliable, and easy to maintain, we will use a Modular System Architecture. This means we will break the platform down into distinct, specialized parts (modules) that work together.

1. Core System Modules
   Here is how the platform's features will be organised:

- User Management & Profiles:
  - Manages accounts for Admins, Teachers, Students, and Guardians.
  - Admin can set minimum rates by region (For example 3,500 Naira per hour for students living in Nigeria, $15 per hour for students living in US/Europe, etc…)
  - Admins set platform-wide policies: global class size limits, content moderation, commission rates, minimum rates, featured listings, etc.
  - Teacher can set rates by courses and by region. For example 3,500 Naira per hour for students living in Nigeria, $15 per hour for students living in US/Europe, etc…
  - Students sign up, build a subject-interest profile, and the system uses that to recommend matching teachers.
  - Students can link one or more guardians to their account. Connects Student accounts to Guardian accounts, granting guardians read-only access to records. From student profile, you can add a guardian, by providing the guardian email. The guardian will be sent a link to the provided email, they can click the link to sign up and view student profiles in read-only mode. Guardians get a read-only view of their linked student's attendance, grades, teacher remarks,
  - For underaged students, guardians can enrol on the student's behalf; (“I am the student” Vs “I’m a guardian registering my child”)
- Search & Recommendation Engine:
  - Allows students to filter teachers by subject, price, and star rating, availability, etc.
  - Uses a simple matching algorithm to recommend teachers based on a student's profile interests.
- Scheduling & Enrollment System:
  - Handles the teacher's calendar and availability.
  - Manages students enrolling in or dropping classes.
  - Capacity Logic: The system will check the Admin's maximum class limit. The Teacher can set a custom limit. The database will strictly enforce that the Teacher's limit cannot exceed the Admin's limit. e.g The effective cap = min("admin global limit”, “teacher personal limit”). When a class reaches this final limit, enrollment automatically closes. If a student drops, the spot instantly reopens.
  - The class limit, should be designed carefully. Note a teacher may have several classes in a day. Say John teaches Math 3 times on Mondays (1st period: 8am - 10am, 2nd period: 12pm - 2pm & 3rd period: 4pm - 6pm), 2 times on Wednesdays (1st period: 10.42am - 12.42pm, 2nd period: 2pm - 4pm), and once on Friday (period: 12pm - 2pm). The cap should be applied to these individual time periods. When students signup, they can choose time periods from johns schedule as long as the time period is less than the set limit. When a time period has reached the capacity, students can’t choose those periods anymore and will see it full. The total number of periods chosen will determine the total price for the student as they’ll be charged per hour.
- Virtual Classroom (Video & Attendance):
  - Provides a unified "Join Class" link for both teachers and students.
  - Auto-Attendance Logic: the system tracks join/leave timestamps during a live session. Presence is only recorded if the student stays connected for a meaningful threshold (e.g., ≥50% of session duration, configurable by admin). Joining for 2 minutes and leaving doesn't count
  - Think Agora, Twilio, or Daily.co. Instead of building a video calling system from scratch (which is very expensive and difficult), we may use an API from an established video provider. This guarantees high-quality, reliable calls
- Learning Management System (LMS):
  - Allows teachers to upload files (notes, assignments, PDFs, slides, videos, links) to secure cloud storage. Students can view and download.
  - Allows students to upload assignment solutions. students submit files or text through the platform
  - Assignments have due dates. Teachers grade assignments and leave remarks, which automatically updates the student's and guardian's dashboards. Grades are visible and downloadable by students and linked guardians.
  - Student records — a unified dashboard per student showing: attendance history, all grades, teacher remarks, enrolled classes, and assignment completion rate.
- Payment module
  - Commission on teacher earnings — take 10–25% of every payment processed through the platform. This is the primary revenue engine. Teachers price their own classes; the platform takes a cut automatically.

Stack:

| Component        | Technology          | Purpose                     |
| ---------------- | ------------------- | --------------------------- |
| **Frontend**     | Next.js 15.         | Responsive web + API routes |
| **Backend**      | NestJS (TypeScript) | Modular API architecture    |
| **Database**     | PostgreSQL + Redis  | Relational data + caching   |
| **Video**        | e.g Agora SDK       | Virtual classroom           |
| **File Storage** | AWS S3 + CloudFront | LMS content delivery        |
| **Payments**     | Stripe/PayPal       | Commission handling         |

CURSOR RULE:
<https://nextjs.org/docs/app/guides/production-checklist>
<https://dev.to/sizan_mahmud0_e7c3fd0cb68/nextjs-clean-code-best-practices-for-scalable-applications-2jmc>
<https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices>
<https://www.getfishtank.com/insights/best-practices-for-nextjs-and-typescript-component-organization>

To create the cursor rule for the project, start by reading the articles in the links above. Then using the information in those articles combined with the conents below, create a project-wide cursor rule combining the best practices from the articles and from the list below

Project Structure & Organization
App Router: Use the /app directory for nested layouts and Server Components.
Colocation: Keep component-specific styles and tests inside the component folder (e.g., components/Button/).
Naming Conventions: Utilize PascalCase for components (UserProfile.tsx) and camelCase for functions/hooks (getUser.ts).
Shared Logic: Organize utility functions, hooks, and types in /lib, /hooks, and /types directories.

Performance & Rendering
Image Optimization: Use next/image for automatic image resizing and lazy loading.
Font Optimization: Use next/font to eliminate layout shifts.
Data Fetching: Leverage Server Components for data fetching to reduce client-side JavaScript.
Caching: Use fetch options to cache data strategically or use revalidate for incremental static regeneration.
Lazy Loading: Use dynamic imports (next/dynamic) for heavy components not needed immediately.

Security & Reliability
Dependency Management: Regularly check package-lock.json and use tools like Dependabot.
Environment Variables: Use .env files for secrets, never hardcode keys.
Error Handling: Implement error.js for customized error handling per route segment.
Authentication: Implement Secure Auth (e.g., Auth.js or Clerk) with HTTP-only cookies.

Styling & State Management
Styling: Leverage Tailwind CSS for utility-first styling and faster development.
State Management: Use useState/useReducer for local state; for global, consider Context API or libraries like Zustand/Jotai.

Testing & Deployment
Testing: Implement unit tests with Jest and integration tests using React Testing Library.
Monitoring: Set up Vercel Analytics or similar performance monitoring for Core Web Vitals.

Component Organization Best Practices
Component Size: Keep components small, focused, and under 200 lines.
Separation: Separate UI components (presentation) from containers (logic).
TypeScript: Use TypeScript for type safety, creating interface definitions for props to reduce runtime errors.

UI theme (Save values as variables and re-use were necessary):

- background color: #f5f5f7
- foreground color (background color on e.g cards, forms, etc): #ffffff
- Text color: #020817
- header color: #172033

- Generate the cursor rule
- a web app but very responsive to also be usable on mobile
- Generate the claud plan for implementing project
- Implement the app
-
