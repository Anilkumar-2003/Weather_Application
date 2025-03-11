export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temperature: number;
    humidity: number;
    feelslike: number;
    weather_descriptions: string[];
    weather_icons: string[];
  };
}

export interface FavoriteCity {
  id: string;
  name: string;
}