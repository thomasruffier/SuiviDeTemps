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

// Files d'attente pour sérialiser les requêtes concurrentes par ressource
const activePromises = new Map<string, Promise<any>>()
const nextOperations = new Map<string, () => Promise<any>>()

function queueOperation(key: string, operation: () => Promise<any>): Promise<any> {
  if (!activePromises.has(key)) {
    const run = async () => {
      try {
        await operation()
      } catch (err) {
        console.warn(`[Queue] Erreur d'exécution pour ${key}:`, err)
      } finally {
        activePromises.delete(key)
        const next = nextOperations.get(key)
        if (next) {
          nextOperations.delete(key)
          queueOperation(key, next)
        }
      }
    }
    const p = run()
    activePromises.set(key, p)
    return p
  } else {
    nextOperations.set(key, operation)
    return activePromises.get(key)!
  }
}

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
      Authorization: `users API-Key ${token}`,
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
    const key = `projet:${projet.nom}`
    return queueOperation(key, async () => {
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
    })
  }

  async function syncSession(
    projetNom: string,
    date: string,
    duree: number,
    note: string = '',
  ): Promise<void> {
    const key = `session:${projetNom}:${date}`
    return queueOperation(key, async () => {
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
    })
  }

  async function deleteProjet(nom: string): Promise<void> {
    const key = `projet:${nom}`
    return queueOperation(key, async () => {
      try {
        const existing = await findOne('projets-sdt', { nom: { equals: nom } })
        if (existing) await deleteDoc('projets-sdt', existing.id)
      } catch (e) {
        console.warn('[Payload] deleteProjet échoué:', e)
      }
    })
  }

  async function deleteSession(projetNom: string, date: string): Promise<void> {
    const key = `session:${projetNom}:${date}`
    return queueOperation(key, async () => {
      try {
        const existing = await findOne('sessions-sdt', {
          projetNom: { equals: projetNom },
          date: { equals: date },
        })
        if (existing) await deleteDoc('sessions-sdt', existing.id)
      } catch (e) {
        console.warn('[Payload] deleteSession échoué:', e)
      }
    })
  }

  async function syncAll(projets: Projet[]): Promise<void> {
    for (let i = 0; i < projets.length; i++) {
      const p = projets[i]!
      await syncProjet(p, i)
      for (const d of p.durees) {
        await syncSession(p.nom, d.date, d.duree, d.note ?? '')
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

  async function checkProjectExists(nom: string): Promise<boolean> {
    try {
      const existing = await findOne('projets-sdt', { nom: { equals: nom } })
      return existing !== null
    } catch {
      return false
    }
  }

  async function fetchAllFromPayload(): Promise<Projet[]> {
    const headers = await authHeaders()
    if (!headers) return []

    try {
      const projetsRes = await fetch(`${baseUrl}/api/projets-sdt?limit=10000`, { headers })
      if (!projetsRes.ok) return []
      const projetsData = await projetsRes.json()
      const rawProjets = projetsData.docs || []

      const sessionsRes = await fetch(`${baseUrl}/api/sessions-sdt?limit=10000`, { headers })
      const sessionsData = sessionsRes.ok ? await sessionsRes.json() : { docs: [] }
      const rawSessions = sessionsData.docs || []

      const sessionsByProject: Record<string, Duree[]> = {}
      for (const s of rawSessions) {
        if (!s.projetNom) continue
        if (!sessionsByProject[s.projetNom]) {
          sessionsByProject[s.projetNom] = []
        }
        sessionsByProject[s.projetNom].push({
          date: s.date,
          duree: s.duree || 0,
          note: s.note ?? '',
        })
      }

      const sortedRawProjets = [...rawProjets].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))

      return sortedRawProjets.map((p) => {
        const pSessions = sessionsByProject[p.nom] || []
        const derniereModification = p.updatedAt 
          ? new Date(p.updatedAt).toDateString() 
          : new Date().toDateString()

        return {
          nom: p.nom,
          durees: pSessions,
          derniereModification,
          isArchived: p.isArchived ?? false,
          description: p.description ?? '',
          couleur: p.couleur ?? '#6366f1',
        }
      })
    } catch (error) {
      console.error('[Payload] fetchAllFromPayload failed:', error)
      return []
    }
  }

  async function renameProjetAndSessions(
    ancienNom: string,
    nouveauNom: string,
    updatedProjet: Projet,
  ): Promise<void> {
    const key = `projet:${ancienNom}`
    return queueOperation(key, async () => {
      try {
        const headers = await authHeaders()
        if (!headers) return

        const existingProj = await findOne('projets-sdt', { nom: { equals: ancienNom } })
        if (existingProj) {
          const body = {
            nom: nouveauNom,
            couleur: updatedProjet.couleur ?? '#6366f1',
            isArchived: updatedProjet.isArchived ?? false,
            description: updatedProjet.description ?? '',
          }
          await updateDoc('projets-sdt', existingProj.id, body)
        }

        const query = `where[projetNom][equals]=${encodeURIComponent(ancienNom)}&limit=10000`
        const res = await fetch(`${baseUrl}/api/sessions-sdt?${query}`, { headers })
        if (res.ok) {
          const data = await res.json()
          const docs = data.docs || []
          for (const doc of docs) {
            await updateDoc('sessions-sdt', doc.id, { projetNom: nouveauNom })
          }
        }
      } catch (e) {
        console.warn('[Payload] renameProjetAndSessions échoué:', e)
      }
    })
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
    checkProjectExists,
    fetchAllFromPayload,
    renameProjetAndSessions,
  }
}
