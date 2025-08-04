import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CustomerList from '../components/CustomerList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CustomerList />
    </>
  )
}

export default App
