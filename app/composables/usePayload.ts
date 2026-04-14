/**
 * usePayload – Synchronisation avec PayloadCMS via API Key
 *
 * Le token est saisi une fois par l'utilisateur dans l'UI et stocké dans
 * localforage. Toutes les opérations sont fire-and-forget : elles n'échouent
 * jamais silencieusement pour ne pas bloquer l'app hors-ligne.
 */

const STORAGE_KEY = 'payloadApiKey'

// Cache module-level du token (évite des lectures localforage à chaque appel)
let _cachedToken: string | null | undefined = undefined

export function usePayload() {
  const { $db } = useNuxtApp()
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.payloadUrl as string

  // ── Gestion du token ─────────────────────────────────────────────────────

  /** Lit le token depuis le cache ou localforage. */
  async function getToken(): Promise<string | null> {
    if (_cachedToken !== undefined) return _cachedToken
    _cachedToken = (await ($db as any).getItem(STORAGE_KEY)) ?? null
    return _cachedToken
  }

  /** Sauvegarde le token en localforage et met à jour le cache. */
  async function saveToken(token: string) {
    _cachedToken = token.trim() || null
    if (_cachedToken) {
      await ($db as any).setItem(STORAGE_KEY, _cachedToken)
    } else {
      await ($db as any).removeItem(STORAGE_KEY)
    }
  }

  /** Retourne les headers avec l'API Key, ou null si pas de token. */
  async function authHeaders(): Promise<Record<string, string> | null> {
    const token = await getToken()
    if (!token) return null
    return {
      'Content-Type': 'application/json',
      Authorization: `API-Key ${token}`,
    }
  }

  // ── Utilitaires bas niveau ────────────────────────────────────────────────

  async function findOne(
    collection: string,
    where: Record<string, { equals: string | number }>,
  ): Promise<{ id: string; [key: string]: any } | null> {
    const headers = await authHeaders()
    if (!headers) return null

    const query = Object.entries(where)
      .map(([k, v]) => `where[${encodeURIComponent(k)}][equals]=${encodeURIComponent(String(v.equals))}`)
      .join('&')

    try {
      const res = await fetch(`${baseUrl}/api/${collection}?${query}&limit=1`, { headers })
      if (!res.ok) return null
      const data = await res.json()
      return data.docs?.[0] ?? null
    } catch {
      return null
    }
  }

  async function createDoc(collection: string, body: object): Promise<string | null> {
    const headers = await authHeaders()
    if (!headers) return null

    try {
      const res = await fetch(`${baseUrl}/api/${collection}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.doc?.id ?? null
    } catch {
      return null
    }
  }

  async function updateDoc(collection: string, id: string, body: object): Promise<boolean> {
    const headers = await authHeaders()
    if (!headers) return false

    try {
      const res = await fetch(`${baseUrl}/api/${collection}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async function deleteDoc(collection: string, id: string): Promise<boolean> {
    const headers = await authHeaders()
    if (!headers) return false

    try {
      const res = await fetch(`${baseUrl}/api/${collection}/${id}`, {
        method: 'DELETE',
        headers,
      })
      return res.ok
    } catch {
      return false
    }
  }

  // ── API publique ──────────────────────────────────────────────────────────

  async function syncProjet(projet: Projet, ordre?: number): Promise<void> {
    try {
      const existing = await findOne('projets-sdt', { nom: { equals: projet.nom } })
      const body = {
        nom: projet.nom,
        couleur: projet.couleur ?? '#6366f1',
        isArchived: projet.isArchived ?? false,
        description: projet.description ?? '',
        ordre: ordre ?? 0,
      }
      if (existing) {
        await updateDoc('projets-sdt', existing.id, body)
      } else {
        await createDoc('projets-sdt', body)
      }
    } catch (e) {
      console.warn('[Payload] syncProjet échoué:', e)
    }
  }

  async function syncSession(
    projetNom: string,
    date: string,
    duree: number,
    note: string = '',
  ): Promise<void> {
    try {
      const existing = await findOne('sessions-sdt', {
        projetNom: { equals: projetNom },
        date: { equals: date },
      })
      const body = { projetNom, date, duree, note }
      if (existing) {
        await updateDoc('sessions-sdt', existing.id, body)
      } else {
        await createDoc('sessions-sdt', body)
      }
    } catch (e) {
      console.warn('[Payload] syncSession échoué:', e)
    }
  }

  async function deleteProjet(nom: string): Promise<void> {
    try {
      const existing = await findOne('projets-sdt', { nom: { equals: nom } })
      if (existing) await deleteDoc('projets-sdt', existing.id)
    } catch (e) {
      console.warn('[Payload] deleteProjet échoué:', e)
    }
  }

  async function deleteSession(projetNom: string, date: string): Promise<void> {
    try {
      const existing = await findOne('sessions-sdt', {
        projetNom: { equals: projetNom },
        date: { equals: date },
      })
      if (existing) await deleteDoc('sessions-sdt', existing.id)
    } catch (e) {
      console.warn('[Payload] deleteSession échoué:', e)
    }
  }

  async function syncAll(projets: Projet[]): Promise<void> {
    for (let i = 0; i < projets.length; i++) {
      const p = projets[i]!
      void syncProjet(p, i)
      for (const d of p.durees) {
        void syncSession(p.nom, d.date, d.duree, d.note ?? '')
      }
    }
  }

  /**
   * Teste la connexion avec l'API Key actuelle.
   * Retourne true si le token est valide.
   */
  async function testConnection(): Promise<boolean> {
    const headers = await authHeaders()
    if (!headers) return false
    try {
      const res = await fetch(`${baseUrl}/api/users/me`, { headers })
      return res.ok
    } catch {
      return false
    }
  }

  return {
    getToken,
    saveToken,
    syncProjet,
    syncSession,
    deleteProjet,
    deleteSession,
    syncAll,
    testConnection,
  }
}
