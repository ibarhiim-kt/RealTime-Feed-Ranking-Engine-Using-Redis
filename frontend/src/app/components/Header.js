import React from 'react'
import Link from 'next/link'
import ProfileMenu from './ProfileMenu'


export default function Header({ user }) {
return (
<header className="bg-white shadow-sm sticky top-0 z-20">
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">
<div className="flex items-center gap-4">
<Link href="/" className="flex items-center gap-3">
{/* <a className="flex items-center gap-3"> */}
<div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold">P</div>
<div>
<div className="text-lg font-semibold">Postly</div>
<div className="text-xs text-gray-500">Real-looking feed</div>
</div>
{/* </a> */}
</Link>
</div>


<div className="flex items-center gap-4">
<nav className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
<a className="hover:text-gray-900" href="#">Explore</a>
<a className="hover:text-gray-900" href="#">Notifications</a>
<a className="hover:text-gray-900" href="#">Bookmarks</a>
</nav>


{user ? (
<ProfileMenu user={user} />
) : (
<div className="flex items-center gap-3">
<Link href="/auth/login" className="px-4 py-2 rounded-lg border border-gray-200 text-sm">Sign in</Link>
<Link href="/auth/signup" className="px-4 py-2 rounded-lg bg-black text-white text-sm">Get started</Link>
</div>
 )} 
</div>
</div>
</div>
</header>
)
}