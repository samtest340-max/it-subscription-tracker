'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'

export type CreateSubscriptionInput = {
  softwareName: string
  category: string
  renewalCost: number
  currency: string
  expirationDate: string
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const softwareName = input.softwareName.trim()
  const category = input.category.trim()
  const currency = input.currency.trim().toUpperCase()
  const renewalCost = Number(input.renewalCost)
  const expirationDate = input.expirationDate

  if (!softwareName || !category || !expirationDate || !Number.isFinite(renewalCost) || renewalCost <= 0) {
    throw new Error('Please provide a valid subscription name, category, cost, and expiration date.')
  }

  const expiration = new Date(`${expirationDate}T00:00:00Z`)
  if (Number.isNaN(expiration.getTime())) throw new Error('Expiration date is invalid.')

  const startDate = new Date()
  const durationDays = Math.max(1, Math.ceil((expiration.getTime() - startDate.getTime()) / 86400000))

  await db.insert(subscriptions).values({
    userId: 'preview-user',
    softwareName,
    category,
    renewalCost: renewalCost.toString(),
    currency: currency || 'NGN',
    startDate: startDate.toISOString().slice(0, 10),
    durationDays,
    seats: 1,
    autoRenewal: false,
    cancelled: false,
  })

  revalidatePath('/')
  revalidatePath('/subscriptions')
  return { ok: true }
}
