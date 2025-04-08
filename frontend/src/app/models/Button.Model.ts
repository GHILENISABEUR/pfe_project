import { ButtonValue } from "./ButtonValue";

export interface Button {
    id: number;
    value: ButtonValue;
    style: {
      top?: string;
      left?: string;
      width?: string;
      height?: string;
      color?: string;
      backgroundColor?: string;
      display?: string;
        justifyContent?: string;
        alignItems?: string;
        borderradius?: string;
    };
    frame:number;
    website:number;
  }
  