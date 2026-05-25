interface User {
  id: string;
  notionAccessToken: string;
  notionRefreshToken?: string;
  expiresAt?: number;
  createdAt: number;
}

const users: Map<string, User> = new Map();

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
    }
    return user;
  }

  static deleteUser(id: string): boolean {
    return users.delete(id);
  }

  static getAllUsers(): User[] {
    return Array.from(users.values());
  }
}
