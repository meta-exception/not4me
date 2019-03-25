
export interface IToken {
  type: string;
  value?: string;
  token: {
    start: number;
    end: number;
  };
  layout: {
    line: number;
    position: number;
  };
}
