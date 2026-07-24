export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeAllFirstLetters(str: string): string {
  return str.split(" ").map(capitalizeFirstLetter).join(" ");
}
