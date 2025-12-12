// Minimal ambient declarations to satisfy TS in the repo without installing dev type packages.
// These are intentionally loose; tests rely on runtime mocha/chai provided by hardhat.

// Mocha globals
declare function describe(name: string, fn: (this: any) => any): void;
declare function it(name: string, fn?: (this: any) => any): void;
declare function before(fn: (this: any) => any): void;
declare function beforeEach(fn: (this: any) => any): void;
declare function after(fn: (this: any) => any): void;
declare function afterEach(fn: (this: any) => any): void;

// Chai expect shim
declare module "chai" {
  export const expect: any;
}

// Allow importing mocha without installed types
declare module "mocha" {
  export const describe: typeof describe;
  export const it: typeof it;
  export const before: typeof before;
  export const beforeEach: typeof beforeEach;
  export const after: typeof after;
  export const afterEach: typeof afterEach;
}

// Minimal Node globals used in tests
declare const process: any;
declare const Buffer: any;
declare const __dirname: string;
