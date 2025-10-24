# Contributing to Hummy

Thank you for your interest in contributing to Hummy! 🐝

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Security](#security)

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Public or private harassment
- Publishing private information without permission

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone git@github.com:YOUR-USERNAME/HUMMII.git
cd HUMMII

# Add upstream remote
git remote add upstream git@github.com:DanielFilinski/HUMMII.git
```

### 2. Setup Development Environment

```bash
# Copy environment file
cp .env.example .env

# Start services
./start.sh
# or
docker compose up -d
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## Development Workflow

### Before Making Changes

1. Ensure you're on the latest main branch
   ```bash
   git checkout main
   git pull upstream main
   ```

2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Making Changes

1. Write your code
2. Add tests if applicable
3. Update documentation
4. Run quality checks:
   ```bash
   # In relevant service directory (api/frontend/admin)
   pnpm run lint
   pnpm run format
   pnpm run type-check
   pnpm run test
   ```

### Testing Your Changes

```bash
# Unit tests
pnpm run test

# E2E tests (API)
cd api
pnpm run test:e2e

# Manual testing
docker compose up -d
# Test your changes in browser
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `security`: Security fixes
- `ci`: CI/CD changes

### Scopes

- `api`: Backend API changes
- `frontend`: Frontend changes
- `admin`: Admin panel changes
- `docker`: Docker configuration
- `docs`: Documentation
- `deps`: Dependencies

### Examples

```bash
feat(api): add user authentication endpoint

fix(frontend): resolve navigation bug on mobile devices

docs: update installation instructions

chore(deps): upgrade nestjs to v10.3.0

security(api): fix SQL injection vulnerability
```

### Rules

- Use imperative mood ("add" not "added")
- Don't capitalize first letter of subject
- No period at the end of subject
- Keep subject under 50 characters
- Separate body from subject with blank line
- Wrap body at 72 characters
- Reference issues and PRs in footer

---

## Pull Request Process

### 1. Before Submitting

✅ Checklist:
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings
- [ ] Commits follow convention
- [ ] Branch is up to date with main

### 2. Create Pull Request

1. Push your branch:
   ```bash
   git push origin feature/amazing-feature
   ```

2. Go to GitHub and create a Pull Request

3. Fill in the PR template:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test these changes

   ## Screenshots (if applicable)

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] Tests added
   ```

### 3. Review Process

- At least one approval required
- All CI/CD checks must pass
- No merge conflicts
- Security scans must pass
- Conversations must be resolved

### 4. After Approval

Your PR will be merged by a maintainer. Thank you! 🎉

---

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function getUser(id: string): Promise<User> {
  return userService.findById(id);
}

// Use interfaces for objects
interface UserData {
  name: string;
  email: string;
  age?: number;
}

// Use enums for constants
enum UserRole {
  CLIENT = 'CLIENT',
  CONTRACTOR = 'CONTRACTOR',
  ADMIN = 'ADMIN',
}
```

### React/Next.js

```typescript
// Use functional components with TypeScript
interface Props {
  title: string;
  onClose: () => void;
}

export const Modal: React.FC<Props> = ({ title, onClose }) => {
  return <div>{title}</div>;
};

// Use hooks properly
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### NestJS

```typescript
// Use decorators properly
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }
}

// Use DTOs for validation
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
```

### File Structure

```
api/
├── src/
│   ├── modules/
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       ├── users.module.ts
│   │       ├── entities/
│   │       ├── dto/
│   │       └── tests/
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase` or `PascalCase`
- **Types**: `PascalCase`

---

## Security

### Reporting Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email: security@hummy.ca
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.

### Security Guidelines

When contributing:

✅ **Do:**
- Validate all user inputs
- Use parameterized queries
- Sanitize data before output
- Use HTTPS only
- Implement rate limiting
- Add authentication/authorization checks
- Hash passwords with bcrypt
- Use environment variables for secrets

❌ **Don't:**
- Commit secrets or API keys
- Use `eval()` or similar dangerous functions
- Trust user input
- Store passwords in plain text
- Expose sensitive data in logs
- Use deprecated libraries
- Disable security features

---

## Questions?

- **Documentation**: Check `/docs/` directory
- **Issues**: [GitHub Issues](https://github.com/DanielFilinski/HUMMII/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DanielFilinski/HUMMII/discussions)
- **Email**: admin@hummy.ca

---

Thank you for contributing to Hummy! 🐝🇨🇦

