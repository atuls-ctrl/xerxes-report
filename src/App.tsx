import './App.css'
import { Button } from './components/Button'
import { Icon } from './components/icons'
import { ToggleButton } from './components/ToggleButton'

function App() {
  return (
    <>
      <ToggleButton />
      <Button variant="primary" icon={<Icon name="react" />}>
        Hello
      </Button>
    </>
  )
}

export default App
