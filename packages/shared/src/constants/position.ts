import { TDirection } from './directions';

export interface ICoor {
  x: number;
  y: number;
}

export interface IPosition extends ICoor {
  direction: TDirection;
}
