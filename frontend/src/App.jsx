import Home from "./home"
import {Route, Routes} from 'react-router-dom'
import Crop from "./crop"


function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crops/:cropHash" element={<Crop />} />
      </Routes>
    </>
  )
}

export default App
