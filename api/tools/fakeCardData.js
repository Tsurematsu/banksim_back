// helper/fakeCardData.js

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

// BIN ranges por tipo de tarjeta
const CARD_TYPES = {
  visa: ["4"],
  mastercard: ["51", "52", "53", "54", "55"],
  amex: ["34", "37"],
  discover: ["6011", "65"]
};

function generateCardNumber(type) {
  const bins = CARD_TYPES[type];
  const bin = pick(bins);

  const length = type === "amex" ? 15 : 16;
  const remaining = length - bin.length;

  let number = bin;

  for (let i = 0; i < remaining; i++) {
    number += randomInt(0, 9);
  }
  return number;
}

function generateCVV(type) {
  return type === "amex"
    ? String(randomInt(1000, 9999)) // Amex usa 4 dígitos
    : String(randomInt(100, 999)); // otras usan 3 dígitos
}

function generateExpiration() {
  const month = String(randomInt(1, 12)).padStart(2, "0");

  // entre 1 y 5 años en el futuro
  const year = new Date().getFullYear() + randomInt(1, 5);

  return `${month}/${String(year).slice(2)}`; // MM/YY
}

export function generateFakeCard() {
  const type = pick(Object.keys(CARD_TYPES));

  return {
    card_number: generateCardNumber(type),
    card_cvv: generateCVV(type),
    card_expiration_date: generateExpiration(),
    card_type: type
  };
}
