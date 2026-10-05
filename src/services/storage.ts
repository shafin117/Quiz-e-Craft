import { User, Quiz, Attempt, ActiveAttemptState, Question } from '../types';

const STORAGE_KEYS = {
  USERS: 'quizcraft_users_v1',
  CURRENT_USER: 'quizcraft_current_user_v1',
  QUIZZES: 'quizcraft_quizzes_v1',
  ATTEMPTS: 'quizcraft_attempts_v1',
  ACTIVE_ATTEMPT_PREFIX: 'quizcraft_active_attempt_',
  THEME: 'quizcraft_theme_v1',
};

// Seed Users
const SEED_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'Sarah Connor (Admin)',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'user_student_1',
    name: 'Alex Johnson (Student)',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
    createdAt: '2026-09-05T12:30:00.000Z',
  },
  {
    id: 'user_student_2',
    name: 'Maya Lin',
    email: 'maya@demo.com',
    password: 'student123',
    role: 'student',
    createdAt: '2026-09-06T14:10:00.000Z',
  },
  {
    id: 'user_student_3',
    name: 'David Chen',
    email: 'david@demo.com',
    password: 'student123',
    role: 'student',
    createdAt: '2026-09-08T09:20:00.000Z',
  },
];

// Seed Quizzes
const SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz_js_basics',
    title: 'JavaScript & Web Fundamentals',
    description: 'Master core modern JavaScript concepts including event loop, scopes, closures, promises, and ES6+ features.',
    category: 'Programming',
    difficulty: 'Medium',
    timeLimit: 10, // 10 minutes
    passingScore: 70, // 70%
    shuffleQuestions: true,
    shuffleOptions: true,
    maxAttempts: 3,
    status: 'published',
    createdBy: 'user_admin_1',
    createdAt: '2026-09-10T08:00:00.000Z',
    updatedAt: '2026-09-10T08:00:00.000Z',
    questions: [
      {
        id: 'q_js_1',
        type: 'single',
        text: 'What will be logged by `typeof null` in standard JavaScript?',
        options: [
          { id: 'opt_1', text: '"null"' },
          { id: 'opt_2', text: '"object"' },
          { id: 'opt_3', text: '"undefined"' },
          { id: 'opt_4', text: '"boolean"' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'Due to a historical bug in the first implementation of JavaScript that was kept for backward compatibility, `typeof null` returns "object".',
      },
      {
        id: 'q_js_2',
        type: 'multiple',
        text: 'Which of the following are primitive data types in modern JavaScript? (Select all that apply)',
        options: [
          { id: 'opt_1', text: 'Symbol' },
          { id: 'opt_2', text: 'BigInt' },
          { id: 'opt_3', text: 'Array' },
          { id: 'opt_4', text: 'Undefined' },
        ],
        correctAnswers: ['opt_1', 'opt_2', 'opt_4'],
        points: 2,
        explanation: 'JavaScript primitives are: string, number, bigint, boolean, undefined, symbol, and null. Array and Object are reference types.',
      },
      {
        id: 'q_js_3',
        type: 'boolean',
        text: 'Promises executed via `.then()` are scheduled into the Microtask Queue, taking priority over Macro-tasks like `setTimeout`.',
        options: [
          { id: 'opt_true', text: 'True' },
          { id: 'opt_false', text: 'False' },
        ],
        correctAnswers: ['opt_true'],
        points: 1,
        explanation: 'True. Microtasks (Promises, MutationObserver, queueMicrotask) run immediately after the current script and before the next task in the macrotask queue.',
      },
      {
        id: 'q_js_4',
        type: 'text',
        text: 'What keyword declared in ES6 prevents variable reassignment and provides block scoping?',
        options: [],
        correctAnswers: ['const'],
        points: 1,
        explanation: 'The `const` keyword declares block-scoped read-only named constants.',
      },
      {
        id: 'q_js_5',
        type: 'single',
        text: 'What is a closure in JavaScript?',
        options: [
          { id: 'opt_1', text: 'A syntax error when a function is left unclosed' },
          { id: 'opt_2', text: 'A function bundled with references to its lexical environment' },
          { id: 'opt_3', text: 'A built-in method that terminates asynchronous execution' },
          { id: 'opt_4', text: 'A private variable declared inside an HTML script tag' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), giving access to an outer function\'s scope.',
      },
      {
        id: 'q_js_6',
        type: 'single',
        text: 'What is the output of `[1, 2, 3].reduce((acc, curr) => acc + curr, 10)`?',
        options: [
          { id: 'opt_1', text: '6' },
          { id: 'opt_2', text: '16' },
          { id: 'opt_3', text: '10' },
          { id: 'opt_4', text: 'TypeError' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'The initial accumulator value is 10. Adding 1 + 2 + 3 gives 16.',
      },
      {
        id: 'q_js_7',
        type: 'boolean',
        text: '`===` (strict equality) performs type coercion before comparing two operands.',
        options: [
          { id: 'opt_true', text: 'True' },
          { id: 'opt_false', text: 'False' },
        ],
        correctAnswers: ['opt_false'],
        points: 1,
        explanation: 'False. `===` checks both value and type without performing type coercion. Loose equality `==` does type coercion.',
      },
      {
        id: 'q_js_8',
        type: 'multiple',
        text: 'Which array methods mutate the original array in-place? (Select all that apply)',
        options: [
          { id: 'opt_1', text: 'push()' },
          { id: 'opt_2', text: 'map()' },
          { id: 'opt_3', text: 'splice()' },
          { id: 'opt_4', text: 'filter()' },
        ],
        correctAnswers: ['opt_1', 'opt_3'],
        points: 2,
        explanation: '`push()` and `splice()` mutate the array in place. `map()` and `filter()` return a new array.',
      },
      {
        id: 'q_js_9',
        type: 'text',
        text: 'What is the acronym for the standard that governs JavaScript specifications?',
        options: [],
        correctAnswers: ['ECMAScript', 'ECMA'],
        points: 1,
        explanation: 'ECMAScript (standardized by Ecma International in ECMA-262) is the official specification.',
      },
    ],
  },
  {
    id: 'quiz_geography',
    title: 'World Geography & Planetary Wonders',
    description: 'Explore continents, capitals, oceans, mountain peaks, and natural marvels across the globe.',
    category: 'Geography',
    difficulty: 'Easy',
    timeLimit: 8, // 8 minutes
    passingScore: 65, // 65%
    shuffleQuestions: false,
    shuffleOptions: true,
    maxAttempts: 0, // unlimited
    status: 'published',
    createdBy: 'user_admin_1',
    createdAt: '2026-09-12T11:00:00.000Z',
    updatedAt: '2026-09-12T11:00:00.000Z',
    questions: [
      {
        id: 'q_geo_1',
        type: 'single',
        text: 'What is the deepest known location on Earth’s seabed?',
        options: [
          { id: 'opt_1', text: 'Puerto Rico Trench' },
          { id: 'opt_2', text: 'Challenger Deep (Mariana Trench)' },
          { id: 'opt_3', text: 'Java Trench' },
          { id: 'opt_4', text: 'Mid-Atlantic Ridge' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'Challenger Deep in the Mariana Trench reaches approximately 10,928 meters (35,853 feet) below sea level.',
      },
      {
        id: 'q_geo_2',
        type: 'single',
        text: 'What is the capital city of Australia?',
        options: [
          { id: 'opt_1', text: 'Sydney' },
          { id: 'opt_2', text: 'Melbourne' },
          { id: 'opt_3', text: 'Canberra' },
          { id: 'opt_4', text: 'Brisbane' },
        ],
        correctAnswers: ['opt_3'],
        points: 1,
        explanation: 'Canberra was chosen as the capital in 1908 as a compromise between rival cities Sydney and Melbourne.',
      },
      {
        id: 'q_geo_3',
        type: 'multiple',
        text: 'Which of the following countries lie entirely within the Southern Hemisphere? (Select all that apply)',
        options: [
          { id: 'opt_1', text: 'New Zealand' },
          { id: 'opt_2', text: 'Madagascar' },
          { id: 'opt_3', text: 'Colombia' },
          { id: 'opt_4', text: 'Argentina' },
        ],
        correctAnswers: ['opt_1', 'opt_2', 'opt_4'],
        points: 2,
        explanation: 'New Zealand, Madagascar, and Argentina lie south of the Equator. Colombia is crossed by the Equator so parts are in both hemispheres.',
      },
      {
        id: 'q_geo_4',
        type: 'boolean',
        text: 'The city of Istanbul spans across two separate continents: Europe and Asia.',
        options: [
          { id: 'opt_true', text: 'True' },
          { id: 'opt_false', text: 'False' },
        ],
        correctAnswers: ['opt_true'],
        points: 1,
        explanation: 'True. The Bosphorus Strait separates the European and Asian sections of Istanbul.',
      },
      {
        id: 'q_geo_5',
        type: 'text',
        text: 'Which continent is the driest, coldest, and windiest on Earth?',
        options: [],
        correctAnswers: ['Antarctica'],
        points: 1,
        explanation: 'Antarctica is a polar desert and the coldest continent on Earth.',
      },
      {
        id: 'q_geo_6',
        type: 'single',
        text: 'Which river discharges the greatest volume of water into the world’s oceans?',
        options: [
          { id: 'opt_1', text: 'Nile River' },
          { id: 'opt_2', text: 'Amazon River' },
          { id: 'opt_3', text: 'Yangtze River' },
          { id: 'opt_4', text: 'Mississippi River' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'The Amazon River accounts for roughly 20% of the world’s total river flow into the ocean.',
      },
      {
        id: 'q_geo_7',
        type: 'boolean',
        text: 'Mount Kilimanjaro is located in Kenya.',
        options: [
          { id: 'opt_true', text: 'True' },
          { id: 'opt_false', text: 'False' },
        ],
        correctAnswers: ['opt_false'],
        points: 1,
        explanation: 'False. Mount Kilimanjaro is located in northeastern Tanzania.',
      },
      {
        id: 'q_geo_8',
        type: 'text',
        text: 'What line of longitude is recognized as 0 degrees longitude, running through Greenwich, London?',
        options: [],
        correctAnswers: ['Prime Meridian', 'Prime meridian'],
        points: 1,
        explanation: 'The Prime Meridian is the planet\'s reference line for 0° longitude.',
      },
    ],
  },
  {
    id: 'quiz_science',
    title: 'General Science, Physics & Biology',
    description: 'Test your understanding of thermodynamic laws, cellular biology, chemical reactions, and astronomy.',
    category: 'Science',
    difficulty: 'Hard',
    timeLimit: 12,
    passingScore: 75,
    shuffleQuestions: true,
    shuffleOptions: true,
    maxAttempts: 2,
    status: 'published',
    createdBy: 'user_admin_1',
    createdAt: '2026-09-15T09:30:00.000Z',
    updatedAt: '2026-09-15T09:30:00.000Z',
    questions: [
      {
        id: 'q_sci_1',
        type: 'single',
        text: 'Which organelle is responsible for generating most of the chemical energy needed by eukaryotic cells?',
        options: [
          { id: 'opt_1', text: 'Ribosome' },
          { id: 'opt_2', text: 'Mitochondrion' },
          { id: 'opt_3', text: 'Endoplasmic reticulum' },
          { id: 'opt_4', text: 'Golgi apparatus' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'Mitochondria produce adenosine triphosphate (ATP), the primary cellular energy currency.',
      },
      {
        id: 'q_sci_2',
        type: 'multiple',
        text: 'Which of the following are nitrogenous bases found in DNA? (Select all that apply)',
        options: [
          { id: 'opt_1', text: 'Adenine' },
          { id: 'opt_2', text: 'Thymine' },
          { id: 'opt_3', text: 'Uracil' },
          { id: 'opt_4', text: 'Guanine' },
        ],
        correctAnswers: ['opt_1', 'opt_2', 'opt_4'],
        points: 2,
        explanation: 'DNA contains Adenine, Thymine, Cytosine, and Guanine. Uracil is found in RNA instead of Thymine.',
      },
      {
        id: 'q_sci_3',
        type: 'boolean',
        text: 'According to Newton’s Third Law of Motion, for every action force there is an equal and opposite reaction force.',
        options: [
          { id: 'opt_true', text: 'True' },
          { id: 'opt_false', text: 'False' },
        ],
        correctAnswers: ['opt_true'],
        points: 1,
        explanation: 'True. Whenever an object exerts a force on another, the second object exerts an equal force in the opposite direction on the first.',
      },
      {
        id: 'q_sci_4',
        type: 'text',
        text: 'What is the chemical formula for water?',
        options: [],
        correctAnswers: ['H2O', 'H20'],
        points: 1,
        explanation: 'Water consists of two hydrogen atoms covalently bonded to one oxygen atom (H2O).',
      },
      {
        id: 'q_sci_5',
        type: 'single',
        text: 'What layer of Earth’s atmosphere contains the ozone layer that absorbs harmful ultraviolet rays?',
        options: [
          { id: 'opt_1', text: 'Troposphere' },
          { id: 'opt_2', text: 'Stratosphere' },
          { id: 'opt_3', text: 'Mesosphere' },
          { id: 'opt_4', text: 'Thermosphere' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'The ozone layer is primarily located within the lower portion of the stratosphere (about 15 to 35 km altitude).',
      },
      {
        id: 'q_sci_6',
        type: 'boolean',
        text: 'Water boils at a higher temperature at high altitudes (e.g. on Mount Everest) compared to sea level.',
        options: [
          { id: 'opt_true', text: 'True' },
          { id: 'opt_false', text: 'False' },
        ],
        correctAnswers: ['opt_false'],
        points: 1,
        explanation: 'False. At higher altitudes, atmospheric pressure is lower, so water boils at a lower temperature (approx. 71°C on Everest vs 100°C at sea level).',
      },
      {
        id: 'q_sci_7',
        type: 'single',
        text: 'What is the approximate speed of light in a vacuum?',
        options: [
          { id: 'opt_1', text: '300,000 meters per second' },
          { id: 'opt_2', text: '300,000 kilometers per second' },
          { id: 'opt_3', text: '3,000,000 miles per hour' },
          { id: 'opt_4', text: '150,000 kilometers per second' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'The speed of light in vacuum is exactly 299,792,458 m/s, approximately 300,000 km/s.',
      },
      {
        id: 'q_sci_8',
        type: 'text',
        text: 'What gas do plants absorb during the light-independent reactions of photosynthesis?',
        options: [],
        correctAnswers: ['Carbon Dioxide', 'CO2', 'carbon dioxide'],
        points: 1,
        explanation: 'Plants absorb Carbon Dioxide (CO2) from the atmosphere during the Calvin Cycle.',
      },
    ],
  },
  {
    id: 'quiz_cloud_devops',
    title: 'Cloud Architecture & DevOps CI/CD (Draft)',
    description: 'Upcoming test on microservices, containerization with Docker, Kubernetes orchestration, and deployment strategies.',
    category: 'Cloud & DevOps',
    difficulty: 'Medium',
    timeLimit: 15,
    passingScore: 70,
    shuffleQuestions: true,
    shuffleOptions: true,
    maxAttempts: 1,
    status: 'draft',
    createdBy: 'user_admin_1',
    createdAt: '2026-09-18T14:00:00.000Z',
    updatedAt: '2026-09-18T14:00:00.000Z',
    questions: [
      {
        id: 'q_cloud_1',
        type: 'single',
        text: 'What is the primary function of Kubernetes in cloud environments?',
        options: [
          { id: 'opt_1', text: 'Database query optimizer' },
          { id: 'opt_2', text: 'Container orchestration and automated deployment' },
          { id: 'opt_3', text: 'Code syntax validator' },
          { id: 'opt_4', text: 'Domain name registrar' },
        ],
        correctAnswers: ['opt_2'],
        points: 1,
        explanation: 'Kubernetes automates deployment, scaling, and operations of application containers across clusters.',
      },
    ],
  },
];

// Seed Attempts
const SEED_ATTEMPTS: Attempt[] = [
  {
    id: 'att_1',
    quizId: 'quiz_js_basics',
    quizTitle: 'JavaScript & Web Fundamentals',
    userId: 'user_student_1',
    userName: 'Alex Johnson (Student)',
    userEmail: 'student@demo.com',
    answers: {
      q_js_1: 'opt_2',
      q_js_2: ['opt_1', 'opt_2', 'opt_4'],
      q_js_3: 'opt_true',
      q_js_4: 'const',
      q_js_5: 'opt_2',
      q_js_6: 'opt_2',
      q_js_7: 'opt_false',
      q_js_8: ['opt_1', 'opt_3'],
      q_js_9: 'ECMAScript',
    },
    score: 11,
    totalPoints: 11,
    percentage: 100,
    passed: true,
    timeTaken: 245, // 4m 05s
    startedAt: '2026-09-20T14:00:00.000Z',
    submittedAt: '2026-09-20T14:04:05.000Z',
  },
  {
    id: 'att_2',
    quizId: 'quiz_js_basics',
    quizTitle: 'JavaScript & Web Fundamentals',
    userId: 'user_student_2',
    userName: 'Maya Lin',
    userEmail: 'maya@demo.com',
    answers: {
      q_js_1: 'opt_2',
      q_js_2: ['opt_1', 'opt_2'],
      q_js_3: 'opt_true',
      q_js_4: 'const',
      q_js_5: 'opt_2',
      q_js_6: 'opt_1', // wrong
      q_js_7: 'opt_false',
      q_js_8: ['opt_1', 'opt_3'],
      q_js_9: 'javascript', // partial or wrong
    },
    score: 8,
    totalPoints: 11,
    percentage: 72.7,
    passed: true,
    timeTaken: 380, // 6m 20s
    startedAt: '2026-09-21T10:15:00.000Z',
    submittedAt: '2026-09-21T10:21:20.000Z',
  },
  {
    id: 'att_3',
    quizId: 'quiz_js_basics',
    quizTitle: 'JavaScript & Web Fundamentals',
    userId: 'user_student_3',
    userName: 'David Chen',
    userEmail: 'david@demo.com',
    answers: {
      q_js_1: 'opt_1', // wrong
      q_js_2: ['opt_1'],
      q_js_3: 'opt_false', // wrong
      q_js_4: 'var', // wrong
      q_js_5: 'opt_2',
      q_js_6: 'opt_2',
      q_js_7: 'opt_true', // wrong
      q_js_8: ['opt_1'],
      q_js_9: 'ECMA',
    },
    score: 4,
    totalPoints: 11,
    percentage: 36.4,
    passed: false,
    timeTaken: 510, // 8m 30s
    startedAt: '2026-09-22T16:00:00.000Z',
    submittedAt: '2026-09-22T16:08:30.000Z',
  },
  {
    id: 'att_4',
    quizId: 'quiz_geography',
    quizTitle: 'World Geography & Planetary Wonders',
    userId: 'user_student_1',
    userName: 'Alex Johnson (Student)',
    userEmail: 'student@demo.com',
    answers: {
      q_geo_1: 'opt_2',
      q_geo_2: 'opt_3',
      q_geo_3: ['opt_1', 'opt_2', 'opt_4'],
      q_geo_4: 'opt_true',
      q_geo_5: 'Antarctica',
      q_geo_6: 'opt_2',
      q_geo_7: 'opt_false',
      q_geo_8: 'Prime Meridian',
    },
    score: 10,
    totalPoints: 10,
    percentage: 100,
    passed: true,
    timeTaken: 195, // 3m 15s
    startedAt: '2026-09-23T11:00:00.000Z',
    submittedAt: '2026-09-23T11:03:15.000Z',
  },
  {
    id: 'att_5',
    quizId: 'quiz_geography',
    quizTitle: 'World Geography & Planetary Wonders',
    userId: 'user_student_2',
    userName: 'Maya Lin',
    userEmail: 'maya@demo.com',
    answers: {
      q_geo_1: 'opt_2',
      q_geo_2: 'opt_1', // Sydney (wrong)
      q_geo_3: ['opt_1', 'opt_4'],
      q_geo_4: 'opt_true',
      q_geo_5: 'Antarctica',
      q_geo_6: 'opt_2',
      q_geo_7: 'opt_false',
      q_geo_8: 'Equator', // wrong
    },
    score: 7,
    totalPoints: 10,
    percentage: 70,
    passed: true,
    timeTaken: 260,
    startedAt: '2026-09-24T09:00:00.000Z',
    submittedAt: '2026-09-24T09:04:20.000Z',
  },
  {
    id: 'att_6',
    quizId: 'quiz_science',
    quizTitle: 'General Science, Physics & Biology',
    userId: 'user_student_3',
    userName: 'David Chen',
    userEmail: 'david@demo.com',
    answers: {
      q_sci_1: 'opt_2',
      q_sci_2: ['opt_1', 'opt_2', 'opt_4'],
      q_sci_3: 'opt_true',
      q_sci_4: 'H2O',
      q_sci_5: 'opt_2',
      q_sci_6: 'opt_false',
      q_sci_7: 'opt_2',
      q_sci_8: 'Carbon Dioxide',
    },
    score: 10,
    totalPoints: 10,
    percentage: 100,
    passed: true,
    timeTaken: 420,
    startedAt: '2026-09-25T15:00:00.000Z',
    submittedAt: '2026-09-25T15:07:00.000Z',
  },
];

// Initialize Storage with seed data if empty
export function initStorage(): void {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(SEED_QUIZZES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(SEED_ATTEMPTS));
    }
  } catch (e) {
    console.error('Failed to initialize local storage data:', e);
  }
}

// User Methods
export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.id === id);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Quiz Methods
export function getQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return raw ? JSON.parse(raw) : SEED_QUIZZES;
  } catch {
    return SEED_QUIZZES;
  }
}

export function getQuizById(id: string): Quiz | undefined {
  const quizzes = getQuizzes();
  return quizzes.find((q) => q.id === id);
}

export function saveQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes();
  const existingIdx = quizzes.findIndex((q) => q.id === quiz.id);
  const now = new Date().toISOString();
  if (existingIdx >= 0) {
    quizzes[existingIdx] = {
      ...quiz,
      updatedAt: now,
    };
  } else {
    quizzes.unshift({
      ...quiz,
      createdAt: quiz.createdAt || now,
      updatedAt: now,
    });
  }
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
}

export function duplicateQuiz(id: string, newAuthorId: string): Quiz | null {
  const quiz = getQuizById(id);
  if (!quiz) return null;

  const duplicated: Quiz = {
    ...quiz,
    id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: `${quiz.title} (Copy)`,
    status: 'draft',
    createdBy: newAuthorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: quiz.questions.map((q) => ({
      ...q,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      options: q.options.map((opt) => ({ ...opt })),
      correctAnswers: [...q.correctAnswers],
    })),
  };

  saveQuiz(duplicated);
  return duplicated;
}

export function deleteQuiz(id: string): boolean {
  const quizzes = getQuizzes();
  const filtered = quizzes.filter((q) => q.id !== id);
  if (filtered.length !== quizzes.length) {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(filtered));
    return true;
  }
  return false;
}

// Attempt Methods
export function getAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : SEED_ATTEMPTS;
  } catch {
    return SEED_ATTEMPTS;
  }
}

export function getAttemptById(id: string): Attempt | undefined {
  const attempts = getAttempts();
  return attempts.find((a) => a.id === id);
}

export function getAttemptsByQuiz(quizId: string): Attempt[] {
  const attempts = getAttempts();
  return attempts
    .filter((a) => a.quizId === quizId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getAttemptsByUser(userId: string): Attempt[] {
  const attempts = getAttempts();
  return attempts
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function saveAttempt(attempt: Attempt): void {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

// Active Taking Attempt State (for persistent timer and questions across refresh)
export function getActiveAttempt(quizId: string, userId: string): ActiveAttemptState | null {
  try {
    const key = `${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${quizId}_${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveAttempt(state: ActiveAttemptState, userId: string): void {
  try {
    const key = `${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${state.quizId}_${userId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save active attempt state:', e);
  }
}

export function clearActiveAttempt(quizId: string, userId: string): void {
  try {
    const key = `${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${quizId}_${userId}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to clear active attempt state:', e);
  }
}

// Score Calculation Utility
export function evaluateQuizAttempt(
  quiz: Quiz,
  answers: Record<string, string | string[]>,
  timeTakenSeconds: number,
  user: User
): Attempt {
  let earnedPoints = 0;
  let totalPossiblePoints = 0;

  quiz.questions.forEach((q) => {
    totalPossiblePoints += q.points;
    const studentAnswer = answers[q.id];

    if (!studentAnswer) {
      return;
    }

    if (q.type === 'single' || q.type === 'boolean') {
      if (typeof studentAnswer === 'string' && q.correctAnswers.includes(studentAnswer)) {
        earnedPoints += q.points;
      }
    } else if (q.type === 'multiple') {
      if (Array.isArray(studentAnswer)) {
        const sortedStudent = [...studentAnswer].sort();
        const sortedCorrect = [...q.correctAnswers].sort();
        const isMatch =
          sortedStudent.length === sortedCorrect.length &&
          sortedStudent.every((val, index) => val === sortedCorrect[index]);
        if (isMatch) {
          earnedPoints += q.points;
        }
      }
    } else if (q.type === 'text') {
      if (typeof studentAnswer === 'string') {
        const normalizedStudent = studentAnswer.trim().toLowerCase();
        const isCorrect = q.correctAnswers.some(
          (ans) => ans.trim().toLowerCase() === normalizedStudent
        );
        if (isCorrect) {
          earnedPoints += q.points;
        }
      }
    }
  });

  const percentage = totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 10) / 10;
  const passed = roundedPercentage >= quiz.passingScore;

  const attempt: Attempt = {
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    answers,
    score: earnedPoints,
    totalPoints: totalPossiblePoints,
    percentage: roundedPercentage,
    passed,
    timeTaken: timeTakenSeconds,
    startedAt: new Date(Date.now() - timeTakenSeconds * 1000).toISOString(),
    submittedAt: new Date().toISOString(),
  };

  return attempt;
}

// Reset Storage to default
export function resetStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.QUIZZES);
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  initStorage();
}
