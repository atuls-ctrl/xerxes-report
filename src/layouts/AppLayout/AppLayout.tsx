import { Content } from '../../components/Content'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.body}>
        <Header />
        <Content />
      </div>
    </div>
  )
}
