import type { Payload } from 'payload'

import type { Product } from '@/payload-types'

type ProductData = Pick<Product, 'name' | 'category' | 'price' | 'inStock' | 'description'>

const products: ProductData[] = [
  {
    name: 'Espresso, hele bønner',
    category: 'coffee',
    price: 89,
    inStock: true,
    description: 'Mørkristet blend, 500 g.',
  },
  {
    name: 'Filterkaffe, Etiopien',
    category: 'coffee',
    price: 119,
    inStock: true,
    description: 'Lys ristning med noter af bær.',
  },
  {
    name: 'Decaf, Colombia',
    category: 'coffee',
    price: 99,
    inStock: false,
    description: 'Koffeinfri, medium ristning.',
  },
  {
    name: 'Grøn te, Sencha',
    category: 'tea',
    price: 65,
    inStock: true,
    description: 'Japansk grøn te, 100 g.',
  },
  {
    name: 'Earl Grey',
    category: 'tea',
    price: 55,
    inStock: true,
    description: 'Sort te med bergamot.',
  },
  {
    name: 'Kaffekværn',
    category: 'equipment',
    price: 899,
    inStock: true,
    description: 'Keglekværn med 40 trin.',
  },
  {
    name: 'Pour-over sæt',
    category: 'equipment',
    price: 349,
    inStock: false,
    description: 'Dripper, filtre og kande.',
  },
]

/** Sample rows for the `products` table. */
export async function seedProducts(payload: Payload): Promise<void> {
  for (const data of products) {
    await payload.create({ collection: 'products', overrideAccess: true, data })
  }
  payload.logger.info(`Seed: created ${products.length} products`)
}
