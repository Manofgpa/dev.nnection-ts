import { GetStaticPaths, GetStaticProps } from 'next'

import Prismic from '@prismicio/client'
import ptBR from 'date-fns/locale/pt-BR'
import { format } from 'date-fns'
import { RichText } from 'prismic-reactjs'
import { FaCalendar, FaUser, FaClock } from 'react-icons/fa'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Content {
  body: string
  heading: string
}

interface Post {
  slug: string
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: Content[]
  }
}

interface PostProps {
  post: Post
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post)

  return (
    <>
      <div>
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
              <p>{cont.body}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  // const posts = await prismic.query(
  //   [Prismic.predicates.at('document.type', 'posts')],
  //   {
  //     fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
  //   }
  // )

  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient()

  const response = await prismic.getByUID('posts', String(slug), {})

  const content = response?.data.content.map(cont => {
    return {
      heading: RichText.asText(cont.heading),
      body: RichText.asText(cont.body),
    }
  })

  const post = {
    slug: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      content,
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
    },
    // content: {
    //   heading: RichText.asText(content.heading),
    //   body: {
    //     text: RichText.asText(content.body),
    //   },
    // },
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutos
  }
}
