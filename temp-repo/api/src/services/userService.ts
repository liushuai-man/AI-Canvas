import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  notionAccessToken: string;
  notionRefreshToken?: string;
  expiresAt?: number;
  createdAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 从文件加载用户数据
function loadUsers(): Map<string, User> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const usersArray = JSON.parse(data) as User[];
      return new Map(usersArray.map(user => [user.id, user]));
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return new Map();
}

// 保存用户数据到文件
function saveUsers(users: Map<string, User>): void {
  try {
    const usersArray = Array.from(users.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// 初始化用户存储
let users: Map<string, User> = loadUsers();

export class UserService {
  static createUser(id: string, accessToken: string, refreshToken?: string, expiresAt?: number): User {
    const user: User = {
      id,
      notionAccessToken: accessToken,
      notionRefreshToken: refreshToken,
      expiresAt,
      createdAt: Date.now()
    };
    users.set(id, user);
    saveUsers(users);
    return user;
  }

  static getUser(id: string): User | undefined {
    return users.get(id);
  }

  static updateUserToken(id: string, accessToken: string, refreshToken?: string, expiresAt?: number): User | undefined {
    const user = users.get(id);
    if (user) {
      user.notionAccessToken = accessToken;
      user.notionRefreshToken = refreshToken;
      user.expiresAt = expiresAt;
      users.set(id, user);
      saveUsers(users);
    }
    return user;
  }

  static deleteUser(id: string): boolean {
    const deleted = users.delete(id);
    if (deleted) {
      saveUsers(users);
    }
    return deleted;
  }

  static getAllUsers(): User[] {
    return Array.from(users.values());
  }
}
