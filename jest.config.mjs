// Jest configuration for PromptFlow
import nextJest from 'next/jest.js';

// Create Next.js testing environment with automatically configured mocks
const createJestConfig = nextJest({
  // Path to Next.js app
  dir: './',
});

// Custom Jest configuration
/** @type {import('jest').Config} */
const config = {
  // Add test environment setup for JSDOM
  testEnvironment: 'jest-environment-jsdom',
  
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
  
  // Coverage configuration
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: [
    'src/**/*.{js,ts,jsx,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,ts,jsx,tsx}',
    '!**/*.config.js',
    '!**/.next/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  
  // Modules transformations
  moduleNameMapper: {
    // Handle module aliases
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  
  // Ignore paths for transformations
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // Use correct file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// Create and export Jest config with Next.js handling
export default createJestConfig(config);
