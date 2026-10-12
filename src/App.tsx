import './App.css'
import { BellIcon, Button } from './components/Button'
import { ToggleButton } from './components/ToggleButton'

function App() {
  return (
    <>
      <ToggleButton />
      <Button variant="primary" icon={<BellIcon />}>
        Hello
      </Button>
    </>
  )
}

export default App
