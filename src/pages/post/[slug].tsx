import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import Prismic from '@prismicio/client'
import ptBR from 'date-fns/locale/pt-BR'
import { format } from 'date-fns'
import { RichText } from 'prismic-dom'
import { FaCalendar, FaUser, FaClock } from 'react-icons/fa'

import Comments from '../../components/Comments'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Post {
  slug: string
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: {
      heading: string
      body: {
        text: string
      }
    }[]
  }
}

interface PostProps {
  post: Post
}

export default function Post({ post }: PostProps, preview): JSX.Element {
  return (
    <>
      {!post ? (
        <p>Carregando...</p>
      ) : (
        <>
          <Head>
            <title>{post.data.title}</title>
          </Head>
          <div className={styles.banner}>
            <img
              src={post?.data.banner.url}
              alt="banner"
              className={styles.banner}
            />
          </div>
          <main key={post?.slug} className={styles.container}>
            <h1>{post?.data.title}</h1>
            <div className={styles.details}>
              <div>
                <FaCalendar />
                <time>{post?.first_publication_date}</time>
              </div>
              <div>
                <FaUser />
                <p>{post?.data.author}</p>
              </div>
              <div>
                <FaClock />
                <p>4 min</p>
              </div>
            </div>
            <div className={styles.content}>
              {post?.data.content.map(cont => (
                <section key={cont.heading}>
                  <h2>{cont.heading}</h2>
                  {/* eslint-disable */}
                  <div dangerouslySetInnerHTML={{ __html: cont.body.text }} />
                </section>
              ))}
            </div>
            <hr />
            <section className={styles.pagination}>
              {/* <Link href={pagination.next_page}> */}
              <div>
                <p>Como utlizar hooks</p>
                <button>Post anterior</button>
              </div>
              {/* </Link> */}
              <div>
                <p>Criando um app CRA do zero</p>
                <button>Próximo post</button>
              </div>
            </section>
            <section className={styles.utteranc}>
              <Comments />
            </section>
            {preview && (
              <Link href="/api/exit-preview">
                <aside className={commonStyles.preview}>
                  <a>Sair do modo Preview</a>
                </aside>
              </Link>
            )}
          </main>
        </>
      )}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
    }
  )

  const postsPaths = response.results.map(post => {
    return {
      params: {
        slug: `${post.uid}`,
      },
    }
  })

  return {
    paths: postsPaths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient()

  const response = await prismic.getByUID('posts', String(slug), {})

  const content = response.data.content.map(cont => {
    return {
      heading: cont.heading,
      body: {
        text: RichText.asHtml(cont.body),
      },
    }
  })

  const post = {
    response,
    slug: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
      content,
    },
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutos
  }
}
