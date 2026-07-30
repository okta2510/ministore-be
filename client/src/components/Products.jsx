import { useState, useEffect } from 'react'
import { getProducts } from '../api/example'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts()
        const data = response.data
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
          setError('Unexpected data format from server')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) return <p className="py-8 text-center">Loading products...</p>
  if (error) return <p className="py-8 text-center text-red-500">Error: {error}</p>

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-collapse border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left border border-gray-300">ID</th>
                <th className="px-4 py-2 text-left border border-gray-300">Name</th>
                <th className="px-4 py-2 text-left border border-gray-300">Category</th>
                <th className="px-4 py-2 text-left border border-gray-300">Description</th>
                <th className="px-4 py-2 text-left border border-gray-300">Price</th>
                <th className="px-4 py-2 text-left border border-gray-300">Tags</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">{product.id}</td>
                  <td className="px-4 py-2 font-medium border border-gray-300">{product.name}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600 border border-gray-300">{product.description}</td>
                  <td className="px-4 py-2 font-medium text-green-600 border border-gray-300">{formatPrice(product.price)}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {product.tag.map((t) => (
                        <span key={t} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Products