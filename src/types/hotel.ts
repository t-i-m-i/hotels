export type Hotel = {
  id: string;
  name: string;
  description: string;
  location: string;
  geo: {
    latitude: number;
    longitude: number;
  };
};
