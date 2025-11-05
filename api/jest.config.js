module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/main.ts',
    '!**/*.dto.ts',
    '!**/*.enum.ts',
    '!**/*.interface.ts',
    '!**/*.module.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/auth/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
};