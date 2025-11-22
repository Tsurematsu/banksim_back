// utils/TokenManager.ts
import { createHmac } from "crypto"
import SECRETS from "./A_SECRETS.js"

export default class TokenManager {
  // 🔑 Clave secreta interna para firmar los tokens
  static secret = SECRETS.TokenManager

  // 📦 Crear token desde un objeto
  static create(payload, expiresInSeconds = 432000) {
    const header = { alg: "HS256", typ: "JWT" }
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
    const fullPayload = { ...payload, exp }

    const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url")
    const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url")

    const signature = this.sign(`${base64Header}.${base64Payload}`)
    return `${base64Header}.${base64Payload}.${signature}`
  }

  // 🔍 Obtener el objeto del token (sin validar firma)
  static decode(token) {
    try {
      const [, payload] = token.split(".")
      return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    } catch {
      return null
    }
  }

  // ✅ Validar el token (firma + expiración)
  static validate(token) {
    try {
      const [headerB64, payloadB64, signature] = token.split(".")
      if (!headerB64 || !payloadB64 || !signature)
        return false

      // Verificar firma
      const expectedSig = this.sign(`${headerB64}.${payloadB64}`)
      if (expectedSig !== signature) return false

      // Verificar expiración
      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"))
      if (payload.exp && Date.now() / 1000 > payload.exp)
        return false

      return true
    } catch (e) {
      return false
    }
  }

  // 🧮 Firma interna
  static sign(data) {
    return createHmac("sha256", String(this.secret)).update(data).digest("base64url")
  }
}
