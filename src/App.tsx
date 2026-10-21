import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { ReportQueryProvider } from './state/reportQuery'

/** Root: router, then the header query so the shell and every routed page share it. */
export default function App() {
  return (
    <BrowserRouter>
      <ReportQueryProvider>
        <AppRoutes />
      </ReportQueryProvider>
    </BrowserRouter>
  )
}
