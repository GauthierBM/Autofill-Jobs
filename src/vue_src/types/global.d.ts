// Global type definitions for browser extension APIs

declare global {
  var browser: {
    runtime: {
      getURL: (path: string) => string;
    };
    storage: {
      local: {
        get: (keys?: string | string[] | object | null) => Promise<{ [key: string]: any }>;
        set: (items: object) => Promise<void>;
      };
      sync: {
        get: (keys?: string | string[] | object | null) => Promise<{ [key: string]: any }>;
        set: (items: object) => Promise<void>;
      };
    };
    tabs: {
      query: (queryInfo: { active?: boolean; currentWindow?: boolean }) => Promise<Array<{ id: number; url: string }>>;
      sendMessage: (tabId: number, message: any) => Promise<void>;
      create: (createProperties: { url: string }) => Promise<void>;
    };
    scripting: {
      executeScript: (details: { target: { tabId: number }; func?: () => void; files?: string[] }) => Promise<void>;
    };
  } | undefined;

  var chrome: {
    runtime: {
      getURL: (path: string) => string;
    };
    storage: {
      local: {
        get: (keys?: string | string[] | object | null, callback?: (items: { [key: string]: any }) => void) => void;
        set: (items: object, callback?: () => void) => void;
      };
      sync: {
        get: (keys?: string | string[] | object | null, callback?: (items: { [key: string]: any }) => void) => void;
        set: (items: object, callback?: () => void) => void;
      };
    };
    tabs: {
      query: (queryInfo: { active?: boolean; currentWindow?: boolean }, callback?: (tabs: Array<{ id: number; url: string }>) => void) => void;
      sendMessage: (tabId: number, message: any, callback?: () => void) => void;
      create: (createProperties: { url: string }, callback?: () => void) => void;
    };
    scripting: {
      executeScript: (details: { target: { tabId: number }; func?: () => void; files?: string[] }, callback?: () => void) => void;
    };
  } | undefined;
}

export {};
