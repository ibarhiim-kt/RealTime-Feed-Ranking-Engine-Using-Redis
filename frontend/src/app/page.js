"use client"
import Head from 'next/head'
import Header from './components/Header'
import PostCard from './components/PostCard'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ClipLoader from "react-spinners/ClipLoader"
import SavedPosts from './components/SavedPosts'

export default function Home() {
  const router = useRouter()

  const [user, setUser] = useState(undefined) // undefined = loading
  const [posts, setPosts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState('for-you')
  const [savedPosts, setSavedPosts] = useState([])
  

  // =========================================================
  //  AUTHENTICATION CHECK
  // =========================================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/profile", {
          method: "GET",
          credentials: "include",
        })
        const data = await res.json()
        setUser(res.ok ? data.user : null)
      } catch {
        setUser(null)
      }
    }

    checkAuth()
  }, [router])

  // =========================================================
  //  FETCH SAVED POSTS (ONLY AFTER USER LOADS)
  // =========================================================
  useEffect(() => {
    if (!user) return;

    const fetchSavedPosts = async () => {
      try {
        const res = await fetch(`/backend/get-saved-post?userId=${user.id}`)
        const data = await res.json()

        const uniquePosts = data.reduce((acc, post) => {
          if (post.post_id && !acc.find(p => p.post_id === post.post_id)) {
            acc.push(post)
          }
          return acc
        }, [])

        setSavedPosts(uniquePosts)
      } catch (error) {
        console.error('Error fetching saved posts:', error)
        setSavedPosts([])
      }
    }

    fetchSavedPosts()
  }, [user])

  // =========================================================
  //  LOAD MORE POSTS (Infinite Scroll)
  // =========================================================
  const loadMorePosts = async () => {
    if (loadingMore) return;

    setLoadingMore(true)

    const url = cursor
      ? `/backend/api/bluesky?cursor=${cursor}`
      : `/backend/api/bluesky`

    try {
      const res = await fetch(url)
      const data = await res.json()

      // --------------------------
      //   FIX DUPLICATE POSTS
      // --------------------------
      setPosts(prev => {
        const combined = [...prev, ...(data.posts || [])]

        const unique = Array.from(
          new Map(combined.map(item => [item.id, item]))
        ).map(e => e[1])

        return unique
      })

      setCursor(data.cursor || null)

    } catch (err) {
      console.error("Error loading more posts:", err)
    }

    setLoadingMore(false)
  }

  // Initial Load
  useEffect(() => {
    loadMorePosts()
  }, [])

  // =========================================================
  //  SCROLL LISTENER — Infinite Scroll Trigger
  // =========================================================
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        if (cursor) loadMorePosts()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [cursor, loadingMore])

  // =========================================================
  //  SHOW LOADING IF USER NOT READY
  // =========================================================
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <ClipLoader size={50} />
      </div>
    )
  }

  // =========================================================
  //  MAIN UI
  // =========================================================
  return (
    <>
      <Head>
        <title>Postly — Feed</title>
      </Head>

      <Header user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Content */}
          <section className="md:col-span-2 space-y-4">

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('for-you')}
                className={`pb-2 cursor-pointer ${
                  activeTab === 'for-you'
                    ? 'border-b-2 border-blue-500 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                For You
              </button>

              {user && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`pb-2 cursor-pointer ${
                    activeTab === 'saved'
                      ? 'border-b-2 border-blue-500 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  Saved
                </button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === 'for-you' && (
              <>
                {/* Skeleton when empty */}
                {(!posts || posts.length === 0) ? (
                  <div className="space-y-4 py-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="animate-pulse flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-gray-300 rounded-full" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-48 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  posts.map(p => (
                    <PostCard
                      key={p.id}
                      post={p}
                      user={user}
                      savedPosts={savedPosts}
                      setSavedPosts={setSavedPosts}
                    />
                  ))
                )}

                {/* Infinite Scroll Loader */}
                {loadingMore && (
                  <div className="text-center py-4 text-gray-500">
                    Loading more…
                  </div>
                )}
              </>
            )}

            {/* Saved Tab */}
            {activeTab === 'saved' && user && (
              <SavedPosts
                user={user}
                savedPosts={savedPosts}
                setSavedPosts={setSavedPosts}
              />
            )}
          </section>

          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-20 space-y-4">

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-semibold">What's happening</h3>
                <p className="mt-2 text-sm text-gray-600">
                  A compact sidebar for trends, suggestions, or curated content.
                </p>
              </div>

              {user && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold">Your profile</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {user.name || user.email.split('@')[0]} · @{user.email.split('@')[0]}
                  </p>
                </div>
              )}

            </div>
          </aside>

        </div>
      </main>
    </>
  )
}
