export interface Image {
    id: number;
    src: string;
    style: {
      color?: string;
      fontSize?: string;
      [key: string]: any;  
    };
    frame: number;
    website:number;
  }
  