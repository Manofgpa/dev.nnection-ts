import { GetStaticPaths, GetStaticProps } from 'next'

import Prismic from '@prismicio/client'
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
      }[]
    }[]
  }
}

interface PostProps {
  post: Post
}

export default function Post() {
  return (
    <>
      <h1>Post</h1>
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
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient()

  console.log(context)

  // const { slug } = params
  // const response = await prismic.getByUID('post', String(slug), {})

  return {
    props: {},
  }
}
