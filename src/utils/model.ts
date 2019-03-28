
export interface IToken {
  type: string;
  lexeme: string;
  token: {
    start: number;
    end: number;
  };
  layout: {
    line: number;
    position: number;
  };
}

export interface INode {
  node: string;
  children: Array<INode | null>;
  value: number | string;
}

export interface ITermNode {
  node: 'Term';
  children: IToken[];
  value?: number | string;
}

export interface INodeError {
  node: string;
  children: Array<INode | null>;
  error: {
    message: string;
    priority: number;
    token: IToken;
  };
}
