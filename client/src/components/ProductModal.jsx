import { useState, useEffect } from 'react'

function ProductModal({ isOpen, onClose, onSave, product, mode }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name || '')
      setPrice(product.price || '')
      setDescription(product.description || '')
      setCategory(product.category || '')
      setTags((product.tag || []).join(', '))
    } else {
      setName('')
      setPrice('')
      setDescription('')
      setCategory('')
      setTags('')
    }
    setError('')
  }, [isOpen, mode, product])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const priceNum = parseFloat(price)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid number')
      return
    }
    setError('')
    const productData = {
      name: name.trim(),
      price: priceNum,
      description: description.trim(),
      category: category.trim(),
      tag: tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
    }
    onSave(productData)
  }

  const title = mode === 'edit' ? 'Edit Product' : 'Add Product'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{title}</h3>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. portable, office, productivity"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {mode === 'edit' ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
