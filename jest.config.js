module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@app/contracts$': '<rootDir>/libs/contracts/src',
    '^@app/contracts/(.*)$': '<rootDir>/libs/contracts/src/$1',
    '^@app/shared$': '<rootDir>/libs/shared/src',
    '^@app/shared/(.*)$': '<rootDir>/libs/shared/src/$1',
  },
  collectCoverageFrom: ['apps/**/*.ts', 'libs/**/*.ts'],
};
