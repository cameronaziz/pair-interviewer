
export const round = (value: number) => Math.round(value * 100) / 100;

export const calculateTemperature = (kelvin: number, scale: App.ScaleType): number => {
  switch (scale) {
    case 'celsius':
      return round(kelvin - 273.15);
    case 'fahrenheit':
      return round((kelvin - 273.15) * 9 / 5 + 32);
    default:
      return round(kelvin)
  }
};
