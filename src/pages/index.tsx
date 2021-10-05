import { GetStaticProps } from 'next'

import { FaCalendar, FaUser } from 'react-icons/fa'
import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

// interface HomeProps {
//   postsPagination: PostPagination
// }

export default function Home() {
  return (
    <>
      <img src="logo.svg" alt="logo" />
      <div className={styles.container}>
        <h2>Como utilizar Hooks</h2>
        <p>Pensando em sincronização em vez de ciclo de vida.</p>
        <div className={styles.footer}>
          <div className={styles.date}>
            <FaCalendar />
            <p>15 Mar 2021</p>
          </div>
          <div className={styles.author}>
            <FaUser />
            <p>Joseph Oliveira</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <h2>Como utilizar Hooks</h2>
        <p>Pensando em sincronização em vez de ciclo de vida.</p>
        <div className={styles.footer}>
          <div className={styles.date}>
            <FaCalendar />
            <p>15 Mar 2021</p>
          </div>
          <div className={styles.author}>
            <FaUser />
            <p>Joseph Oliveira</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <h2>Como utilizar Hooks</h2>
        <p>Pensando em sincronização em vez de ciclo de vida.</p>
        <div className={styles.footer}>
          <div className={styles.date}>
            <FaCalendar />
            <p>15 Mar 2021</p>
          </div>
          <div className={styles.author}>
            <FaUser />
            <p>Joseph Oliveira</p>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient()
  const posts = await prismic.query('')

  return {
    props: posts,
  }
}
