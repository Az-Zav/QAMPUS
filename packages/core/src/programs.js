// The programs a student can choose, grouped by college (shared by both apps and the backend tests).
// A student's `users.program` holds the program name exactly as written here; the college is looked up from the name,
// not stored. Change this file when the school's catalogue changes.

export const COLLEGES = Object.freeze([
  {
    name: 'College of Computer Studies',
    programs: [
      'BS Computer Science',
      'BS Data Science and Analytics',
      'BS Information Systems',
      'BS Information Technology',
    ],
  },
  {
    name: 'College of Engineering and Architecture',
    programs: [
      'BS Architecture',
      'BS Civil Engineering',
      'BS Computer Engineering',
      'BS Electrical Engineering',
      'BS Electronics Engineering',
      'BS Environmental and Sanitary Engineering',
      'BS Industrial Engineering',
      'BS Mathematics',
      'BS Mechanical Engineering',
      'BS Design and Technology',
    ],
  },
  {
    name: 'College of Business Education',
    programs: [
      'BS Accountancy',
      'BS Accounting Information System',
      // Business Administration is only offered with a major, so each major is its own choice
      'BS Business Administration major in Financial Management',
      'BS Business Administration major in Human Resource Management',
      'BS Business Administration major in Marketing Management',
      'BS Business Administration major in Logistics and Supply Chain Management',
    ],
  },
  {
    name: 'College of Education',
    programs: [
      'Bachelor of Secondary Education major in English',
      'Bachelor of Secondary Education major in Mathematics',
      'Bachelor of Secondary Education major in Sciences',
      'Bachelor of Special Needs Education',
    ],
  },
  {
    name: 'College of Arts',
    programs: ['Bachelor of Arts major in English Language', 'Bachelor of Arts major in Political Science'],
  },
]);

// Every program in one list, in college order (what the pickers show)
export const PROGRAMS = Object.freeze(COLLEGES.flatMap((college) => college.programs));

// The college a program belongs to, or null for a name that is not in the list (an older saved value)
export const collegeOf = (program) => COLLEGES.find((college) => college.programs.includes(program))?.name ?? null;
