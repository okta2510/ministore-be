import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import ProductModal from './ProductModal'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingProduct, setEditingProduct] = useState(null)
  const [actionError, setActionError] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
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

  useEffect(() => {
    fetchProducts()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingProduct(null)
    setActionError('')
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setModalMode('edit')
    setEditingProduct(product)
    setActionError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleSave = async (data) => {
    try {
      setActionError('')
      if (modalMode === 'create') {
        await createProduct(data)
      } else {
        await updateProduct(editingProduct.id, data)
      }
      closeModal()
      await fetchProducts()
    } catch (err) {
      setActionError(err.response?.data?.message || err.message)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    try {
      setActionError('')
      await deleteProduct(product.id)
      await fetchProducts()
    } catch (err) {
      setActionError(err.response?.data?.message || err.message)
    }
  }

  if (loading) return <p className="py-8 text-center">Loading products...</p>
  if (error) return <p className="py-8 text-center text-red-500">Error: {error}</p>

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {actionError && (
        <p className="mb-3 text-sm text-red-500">{actionError}</p>
      )}

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
                <th className="px-4 py-2 text-left border border-gray-300">Actions</th>
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
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="px-2 py-1 text-xs text-red-600 bg-red-100 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        product={editingProduct}
        mode={modalMode}
      />
    </div>
  )
}

export default Products
