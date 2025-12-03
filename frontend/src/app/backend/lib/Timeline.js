import { BskyAgent } from '@atproto/api'

const agent = new BskyAgent({
  service: 'https://bsky.social'
})

export async function getTimeline(limit = 20, cursor = null) {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD
  })

  const response = await agent.getTimeline({
    limit,
    cursor: cursor || undefined
  })

  const posts = response.data.feed.map(item => {
    const post = item.post
    const author = post.author

    let images = []
    if (post.embed) {
      if (post.embed.$type === 'app.bsky.embed.images#view') {
        images = post.embed.images.map(img => img.fullsize || img.thumb)
      } else if (
        post.embed.$type === 'app.bsky.embed.recordWithMedia#view' &&
        post.embed.media?.$type === 'app.bsky.embed.images#view'
      ) {
        images = post.embed.media.images.map(img => img.fullsize || img.thumb)
      }
    }

    return {
      id: post.uri,
      text: post.record?.text || '',
      createdAt: post.indexedAt,
      images,
      author: {
        name: author.displayName || author.handle,
        handle: author.handle,
        avatar: author.avatar
      },
      stats: {
        replies: post.replyCount || 0,
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0
      }
    }
  })

  return {
    posts,
    cursor: response.data.cursor || null
  }
}
