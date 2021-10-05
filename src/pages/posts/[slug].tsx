import { GetStaticPaths, GetStaticProps } from 'next'

import Prismic from '@prismicio/client'
import ptBR from 'date-fns/locale/pt-BR'
import { format } from 'date-fns'
import { RichText } from 'prismic-reactjs'
import { FaCalendar, FaUser } from 'react-icons/fa'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Post {
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
    }
  }
}

interface PostProps {
  post: Post
}

export default function Post({ post }): JSX.Element {
  console.log(post)

  return (
    <>
      <main>
        <h1>{post?.title}</h1>
        <div>
          <div>
            <FaCalendar />
            <time>{post?.date}</time>
          </div>
          <div>
            <FaUser />
            <p>{post?.author}</p>
          </div>
        </div>
        {post?.content.map(cont => (
          <>
            <h2>{cont.heading}</h2>
            <p>{cont.body}</p>
          </>
        ))}
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

  const content = response.data.content.map(cont => {
    return {
      heading: RichText.asText(cont.heading),
      body: RichText.asText(cont.body),
    }
  })

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    date: format(new Date(response.first_publication_date), 'dd MMM yyyy', {
      locale: ptBR,
    }),
    author: RichText.asText(response.data.author),
    content,
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutos
  }
}
