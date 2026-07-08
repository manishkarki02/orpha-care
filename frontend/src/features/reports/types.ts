export interface MissingReport {
  id: string;
  name: string | null;
  lastSeenAddress: string;
  lastSeenTime: string;
  age: number;
  remarks: string | null;
  longitude: number;
  latitude: number;
  image: string | null;
  reporter: {
    id: string;
    name: string;
  };
}
