export const API_HOST = 'http://192.168.0.52';
export const API_PORT = 3001;
export const API_BASE_URL = `${API_HOST}:${API_PORT}`;

export function CommonFunction(serviceName: string): string {
  return `CommonFunction called by ${serviceName} directly.`;
}

export namespace CommonApi {
  export const Router = 'abc/def/ghi';

  export interface Req {
    A: string;
    B: string;
  }

  export interface Resp {
    AconcatB: string;
  }
}
