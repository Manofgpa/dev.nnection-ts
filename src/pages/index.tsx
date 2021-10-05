import { GetStaticProps } from 'next'
import Prismic from '@prismicio/client'
import Link from 'next/link'

import { FaCalendar, FaUser } from 'react-icons/fa'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import Head from 'next/head'
import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'

interface Post {
  slug: string
  title: string
  subtitle: string
  date: string | null
  author: string
}

interface PostPagination {
  next_page: string
  posts: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { posts } = postsPagination

  return (
    <>
      <Head>
        <title>Home | Spaceblog</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <article key={post.slug} className="">
              <Link key={post.slug} href={`/posts/${post.slug}`}>
                <a key={post.slug}>
                  <h2>{post.title}</h2>
                  <p>{post.subtitle}</p>
                  <div className={styles.footer}>
                    <div className={styles.date}>
                      <FaCalendar />
                      <time>{post.date}</time>
                    </div>
                    <div className={styles.author}>
                      <FaUser />
                      <p>{post.author}</p>
                    </div>
                  </div>
                </a>
              </Link>
            </article>
          ))}
          {/* {postsPagination.next_page && ( */}
          <a href="" className={styles.morePosts}>
            Carregar mais posts
          </a>
          {/* )} */}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    }
  )

  const posts = response.results.map(post => {
    return {
      slug: post.slugs[0],
      title: post.data.title[0].text,
      subtitle: post.data.subtitle[0].text,
      date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
        locale: ptBR,
      }),
      author: post.data.author[0].text,
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        posts,
      },
      revalidate: 60 * 30, // 30 minutos
    },
  }
}
