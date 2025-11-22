// utils/CryptoManager.ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
  pbkdf2Sync,
  timingSafeEqual
} from "crypto"
import SECRETS from "./A_SECRETS.js"


// 🔐 Se obtiene el secreto desde el .env (por ejemplo con Bun.env o process.env)
const SECRET_KEY = SECRETS.CryptoManager

if (!SECRET_KEY) {
  console.warn("[CryptoManager] ⚠️ Falta SECRET_KEY en el archivo .env")
}

export default class CryptoManager {
  // -------------------------------------------------
  // 🔹 CODIFICACIÓN DÉBIL (base64 reversible)
  // -------------------------------------------------
  static encodeWeak(data) {
    return Buffer.from(data, "utf8").toString("base64")
  }

  static decodeWeak(encoded) {
    return Buffer.from(encoded, "base64").toString("utf8")
  }

  // -------------------------------------------------
  // 🔒 CODIFICACIÓN FUERTE (AES-256-CBC con SECRET_KEY)
  // -------------------------------------------------
  static encodeStrong(data) {
    if (!SECRET_KEY) throw new Error("SECRET_KEY no está definida en el .env")

    const key = createHash("sha256").update(SECRET_KEY).digest()
    const iv = randomBytes(16)
    const cipher = createCipheriv("aes-256-cbc", key, iv)

    let encrypted = cipher.update(data, "utf8", "base64")
    encrypted += cipher.final("base64")

    return iv.toString("base64") + ":" + encrypted
  }

  static decodeStrong(encoded) {
    if (!SECRET_KEY) throw new Error("SECRET_KEY no está definida en el .env")

    const [ivStr, encrypted] = encoded.split(":")
    if (!ivStr || !encrypted) throw new Error("Formato inválido de texto cifrado")

    const key = createHash("sha256").update(SECRET_KEY).digest()
    const iv = Buffer.from(ivStr, "base64")
    const decipher = createDecipheriv("aes-256-cbc", key, iv)

    let decrypted = decipher.update(encrypted, "base64", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  }

  // -------------------------------------------------
  // 🧂 HASH DE CONTRASEÑAS (NO REVERSIBLE)
  // -------------------------------------------------

  /**
   * Genera un hash seguro y único para una contraseña.
   * Devuelve un string que incluye el salt y el hash.
   */
  static hashPassword(password) {
    const salt = randomBytes(16).toString("base64") // genera un salt único
    const iterations = 100_000 // más = más seguro (pero más lento)
    const keyLength = 64
    const digest = "sha512"

    const derivedKey = pbkdf2Sync(password, salt, iterations, keyLength, digest)
    const hash = derivedKey.toString("base64")

    // guardamos todo en formato legible
    return `${iterations}:${salt}:${hash}`
  }

  /**
   * Compara una contraseña con un hash previamente generado.
   * Devuelve true si coincide.
   */
  static verifyPassword(password, storedHash) {
    const [iterationsStr, salt, originalHash] = storedHash.split(":")
    if (!iterationsStr || !salt || !originalHash)
      throw new Error("Formato de hash inválido")

    const iterations = parseInt(iterationsStr, 10)
    const keyLength = 64
    const digest = "sha512"

    const derivedKey = pbkdf2Sync(password, salt, iterations, keyLength, digest)
    const derivedHash = derivedKey.toString("base64")

    // Comparación segura contra ataques de tiempo
    return timingSafeEqual(
      Buffer.from(derivedHash, "base64"),
      Buffer.from(originalHash, "base64")
    )
  }
}
