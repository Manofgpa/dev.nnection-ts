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

interface PaginationPosts {
  slug: string
  title: string
}

interface Pagination {
  prevPost: PaginationPosts
  nextPost: PaginationPosts
}
interface Post {
  pagination: Pagination
  slug: string
  first_publication_date: string | null
  last_publication_date: string | null
  data: {
    readTime: number
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
  preview: any
}

export default function Post({ post, preview }: PostProps): JSX.Element {
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
                <p>{post.data.readTime} min</p>
              </div>
            </div>
            <div className={styles.lastEdit}>
              <p>{`* editado em ${post?.last_publication_date.slice(
                0,
                11
              )}, às ${post?.last_publication_date.slice(11, 18)}h`}</p>
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
              {post.pagination.prevPost.title ? (
                <Link href={`/post/${post.pagination.prevPost.slug}`}>
                  <div>
                    <p>{post?.pagination.prevPost.title}</p>
                    <button>Post anterior</button>
                  </div>
                </Link>
              ) : (
                <div className={styles.noPrevPost}>
                  <p>Nenhum post anterior</p>
                </div>
              )}
              {post.pagination.nextPost.title ? (
                <Link href={`/post/${post?.pagination.nextPost.slug}`}>
                  <div>
                    <p>{post.pagination.nextPost.title}</p>
                    <button>Próximo post</button>
                  </div>
                </Link>
              ) : (
                <div className={styles.noNextPost}>
                  <p>Nenhum post próximo</p>
                </div>
              )}
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

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params: { slug },
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient()

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  })

  const nextPost = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  )

  const prevPost = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date]',
    }
  )

  const pagination = {
    prevPost: {
      slug: prevPost.results[0] ? prevPost.results[0].slugs[0] : null,
      title: prevPost.results[0]
        ? prevPost.results[0].data.title[0].text
        : null,
    },
    nextPost: {
      slug: nextPost.results[0] ? nextPost.results[0].slugs[0] : null,
      title: nextPost.results[0]
        ? nextPost.results[0].data.title[0].text
        : null,
    },
  }

  const content = response.data.content.map(cont => {
    return {
      heading: cont.heading,
      body: {
        text: RichText.asHtml(cont.body),
      },
      totalWords: RichText.asText(cont.body),
    }
  })

  const totalWords = content.reduce((acc, cur) => {
    return (acc += cur.totalWords)
  }, 0)

  const readTime = Math.round(totalWords.match(/\S+/g).length / 200)

  const post = {
    pagination,
    slug: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    last_publication_date: format(
      new Date(response.last_publication_date),
      'dd MMM yyyy hh:mm',
      {
        locale: ptBR,
      }
    ),
    data: {
      readTime,
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
      preview,
    },
    redirect: 60 * 30, // 30 minutos
  }
}
