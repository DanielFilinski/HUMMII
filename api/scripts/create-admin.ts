import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AdminData {
  email: string;
  password: string;
  name: string;
}

/**
 * Validate password strength
 */
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long' };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      error:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email address format' };
  }

  return { valid: true };
}

/**
 * Prompt user for input
 */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompt for password with masked input (asterisks)
 * Password is never stored in environment variables for security
 */
function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    // Check if we're in a TTY (terminal)
    if (!stdin.isTTY) {
      // Not a TTY - fallback to regular prompt
      const rl = readline.createInterface({
        input: stdin,
        output: stdout,
      });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    // TTY available - use masked input
    stdout.write(question);

    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = (char: string) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D (EOF)
          stdin.setRawMode(wasRaw);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          stdin.setRawMode(wasRaw);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n\n');
          console.log('❌ Operation cancelled by user.');
          process.exit(0);
          break;
        case '\u007f': // Backspace (Unix)
        case '\b': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;
        default:
          // Only accept printable characters
          if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) < 127) {
            password += char;
            stdout.write('*');
          }
          break;
      }
    };

    stdin.on('data', onData);
  });
}

/**
 * Get admin data from interactive input
 * Password is ALWAYS entered interactively for security (never from env variables)
 */
async function getAdminData(): Promise<AdminData> {
  console.log('👤 Admin Creation - Interactive Mode\n');
  console.log('🔒 Password will be entered interactively (not from environment variables)\n');

  // Warn if ADMIN_PASSWORD is set (it will be ignored)
  if (process.env.ADMIN_PASSWORD) {
    console.log('⚠️  WARNING: ADMIN_PASSWORD environment variable is set but will be IGNORED for security.');
    console.log('   Password must be entered interactively.\n');
  }

  console.log('Please provide the following information:\n');

  let email: string;
  let password: string;
  let name: string;

  // Check if email and name are provided via env (optional, for convenience)
  // Note: Password is NEVER read from env for security
  const envEmail = process.env.ADMIN_EMAIL;
  const envName = process.env.ADMIN_NAME;

  // Get email (use env if provided, otherwise prompt)
  if (envEmail) {
    console.log(`📧 Email from environment: ${envEmail}`);
    const validation = validateEmail(envEmail);
    if (validation.valid) {
      email = envEmail;
    } else {
      console.log(`⚠️  Invalid email in environment: ${validation.error}`);
      console.log('Please enter email manually:\n');
      while (true) {
        email = await prompt('Email: ');
        const validation = validateEmail(email);
        if (validation.valid) {
          break;
        }
        console.log(`❌ ${validation.error}\n`);
      }
    }
  } else {
    // Get email interactively
    while (true) {
      email = await prompt('Email: ');
      const validation = validateEmail(email);
      if (validation.valid) {
        break;
      }
      console.log(`❌ ${validation.error}\n`);
    }
  }

  // Get password - ALWAYS interactive (security requirement)
  console.log('\n🔐 Password Requirements:');
  console.log('   - Minimum 12 characters');
  console.log('   - At least one uppercase letter');
  console.log('   - At least one lowercase letter');
  console.log('   - At least one number');
  console.log('   - At least one special character (@$!%*?&)\n');
  
  while (true) {
    password = await promptPassword('Enter password: ');
    const validation = validatePassword(password);
    if (validation.valid) {
      const confirmPassword = await promptPassword('Confirm password: ');
      if (password === confirmPassword) {
        break;
      }
      console.log('\n❌ Passwords do not match. Please try again.\n');
    } else {
      console.log(`\n❌ ${validation.error}\n`);
    }
  }

  // Get name (use env if provided, otherwise prompt)
  if (envName && envName.length >= 2) {
    console.log(`\n👤 Name from environment: ${envName}`);
    name = envName;
  } else {
    if (envName) {
      console.log(`⚠️  Invalid name in environment (too short): ${envName}`);
      console.log('Please enter name manually:\n');
    }
    // Get name interactively
    while (true) {
      name = await prompt('\nFull name: ');
      if (name.length >= 2) {
        break;
      }
      console.log('❌ Name must be at least 2 characters long');
    }
  }

  return { email, password, name };
}

/**
 * Create or update admin user
 */
async function createAdmin() {
  const prisma = new PrismaClient();

  try {
    // Get admin data
    const adminData = await getAdminData();

    // Validate email
    const emailValidation = validateEmail(adminData.email);
    if (!emailValidation.valid) {
      console.error(`❌ ${emailValidation.error}`);
      process.exit(1);
    }

    // Validate password
    const passwordValidation = validatePassword(adminData.password);
    if (!passwordValidation.valid) {
      console.error(`❌ ${passwordValidation.error}`);
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
      select: { id: true, email: true, name: true, roles: true },
    });

    // Hash password with bcrypt cost 12 (PIPEDA compliance)
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    if (existingUser) {
      // User exists - update
      console.log(`\n⚠️  User with email ${adminData.email} already exists`);

      const hasAdminRole = existingUser.roles.includes(UserRole.ADMIN);
      const updatedRoles = hasAdminRole
        ? existingUser.roles
        : [...existingUser.roles, UserRole.ADMIN];

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          roles: updatedRoles,
          password: hashedPassword, // Update password
          isVerified: true,
          name: adminData.name, // Update name
        },
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          isVerified: true,
        },
      });

      console.log('✅ Admin user updated successfully!\n');
      console.log('📋 User details:');
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Roles: ${updatedUser.roles.join(', ')}`);
      console.log(`   Verified: ${updatedUser.isVerified ? 'Yes' : 'No'}`);

      if (!hasAdminRole) {
        console.log(`\n✨ ADMIN role has been added to existing user`);
      } else {
        console.log(`\n✨ Password and name have been updated`);
      }
    } else {
      // User does not exist - create
      const newUser = await prisma.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          name: adminData.name,
          roles: [UserRole.ADMIN],
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          isVerified: true,
        },
      });

      console.log('\n✅ Admin user created successfully!\n');
      console.log('📋 User details:');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Roles: ${newUser.roles.join(', ')}`);
      console.log(`   Verified: ${newUser.isVerified ? 'Yes' : 'No'}`);
    }

    console.log('\n🎉 Admin user is ready to use!');
    console.log('💡 You can now login to the admin panel with these credentials.\n');
  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Unknown error occurred');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin();

