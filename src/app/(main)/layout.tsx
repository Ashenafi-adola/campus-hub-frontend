import SideBar from '@/components/main/layout/side-bar'
import TopBar from '@/components/main/layout/top-bar'
import { httpDriver } from '@/libs/auth/http-driver'
import { readSession } from '@/libs/auth/session'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    children: React.ReactNode
}

async function Layout({ children }: Props) {
    const { access } = await readSession();
    if (access) console.log(httpDriver.me(access))
    if (!access) redirect("/signin")
    return (
        <div className="min-h-screen bg-[#f7f6f2]">
            <TopBar/>
            <div className="mx-auto flex max-w-full gap-6 px-6 py-6">
                <SideBar/>
                {children}
            </div>
            
        </div>
    )
}

export default Layout