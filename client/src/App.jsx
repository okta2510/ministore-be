import { Routes, Route, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Products from './components/Products'

function App() {
  useEffect(() => {
    if (!localStorage.getItem('adminKey')) {
      localStorage.setItem('adminKey', 'secret123')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex gap-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/products" className="hover:underline">Products</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-4">Ministore Client</h1>
      <p className="text-gray-600">Welcome to the Ministore frontend.</p>
    </div>
  )
}

export default App