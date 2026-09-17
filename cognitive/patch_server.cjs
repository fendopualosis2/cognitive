const fs = require('fs');
let code = fs.readFileSync('./cognitive/server.ts', 'utf-8');

// 1. Add imports and middleware
code = code.replace(
  "const app = express();",
  `import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-fallback-secret-for-dev-only-do-not-use-in-prod';

const app = express();`
);

code = code.replace(
  "app.use(express.json());",
  `app.use(express.json());
app.use(cookieParser());

const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};`
);

fs.writeFileSync('./cognitive/server.ts', code);
console.log('Imports and middleware added');
