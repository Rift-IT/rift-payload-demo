import type { Endpoint, Where } from 'payload'

/**
 * GET /api/products/search?category=coffee&maxPrice=150&inStock=true
 *
 * A custom endpoint that filters products and returns a trimmed response.
 * All query parameters are optional. The auto-generated API at /api/products
 * can do the same filtering; a custom endpoint is useful when you want your
 * own parameters, validation or response shape.
 */
export const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    const { category, maxPrice, inStock } = req.query as Record<string, string | undefined>

    const where: Where = {}
    if (category) where.category = { equals: category }
    if (inStock === 'true') where.inStock = { equals: true }
    if (maxPrice) {
      const max = Number(maxPrice)
      if (Number.isNaN(max)) {
        return Response.json({ error: 'maxPrice must be a number' }, { status: 400 })
      }
      where.price = { less_than_equal: max }
    }

    const result = await req.payload.find({
      collection: 'products',
      where,
      sort: 'price',
      limit: 100,
      depth: 0,
      // The Local API skips access control by default. Passing the request
      // user and overrideAccess: false applies the collection's access rules.
      req,
      overrideAccess: false,
    })

    return Response.json({
      count: result.totalDocs,
      products: result.docs.map(({ id, name, category, price, inStock }) => ({
        id,
        name,
        category,
        price,
        inStock,
      })),
    })
  },
}
