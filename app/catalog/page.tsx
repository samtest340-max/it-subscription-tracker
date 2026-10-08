import { Metadata } from 'next'
import { PublicCatalog } from '@/components/public-catalog'
export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { return { title: 'Farm Alert Product Catalog', robots: { index: false, follow: false } } }
export default function CatalogPage() { return <PublicCatalog /> }
