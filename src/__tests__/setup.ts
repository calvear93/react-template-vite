import fetch, { Request, Response } from 'node-fetch';

// fixes "TypeError: The "emitter" argument must be an instance of EventEmitter or EventTarget. Received an instance of AbortSignal" for jsdom environment
global.fetch = fetch as any;
global.Request = Request as any;
global.Response = Response as any;
