export interface Text {
    id: number;
    text: string;
    style: {
      color?: string;
      fontSize?: string;
      [key: string]: any;  
    };
    frame: number;
    website:number;
  }
  