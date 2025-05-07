type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  role: string;
};

// In-memory "database" for demo purposes
// Replace with actual database in production
const users: User[] = [
  {
    id: '1',
    username: 'sachin',
    email: 'sachin@gluu.org',
    password: 'sachin@123',
    createdAt: new Date(),
    role: 'admin',
  },
  {
    id: '2',
    username: 'dhoni',
    email: 'dhoni@gluu.org',
    password: 'dhoni@123',
    createdAt: new Date(),
    role: 'developer',
  },
  {
    id: '3',
    username: 'rohit',
    email: 'rohit@gluu.org',
    password: 'rohit@123',
    createdAt: new Date(),
    role: 'auditor',
  },
];

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  return users.find((user) => user.email === email);
};

export const findUserById = async (id: string): Promise<User | undefined> => {
  return users.find((user) => user.id === id);
};
