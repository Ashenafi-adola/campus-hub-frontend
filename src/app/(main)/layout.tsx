import MobileFooter from '@/components/main/layout/mobile-footer'
import SideBar from '@/components/main/layout/side-bar'
import SiteHeader from '@/components/main/layout/site-header'
import { AuthProvider } from '@/context/auth-context'
import { httpDriver } from '@/libs/auth/http-driver'
import { readSession } from '@/libs/auth/session'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    children: React.ReactNode
}

async function Layout({ children }: Props) {
    const { access } = await readSession();
    if (!access) redirect("/signin");
    const user = await httpDriver.me(access);
    return (
        <AuthProvider value={{ user }}>
            <div className="min-h-screen bg-[#f7f6f2] dark:bg-neutral-950">
                <SiteHeader />
                <div className="mx-auto flex max-w-full min-w-0 md:gap-2  ml-0 md:px-2 py-0">
                    <div className="ml-0 pl-0 px-1 shrink-0 overflow-clip transition-all duration-300 ease-out max-lg:w-0 max-lg:-translate-x-3 max-lg:opacity-0 lg:w-80 lg:translate-x-0 lg:opacity-100 dark:border-neutral-800">
                        <SideBar />
                    </div>
                    {children}
                </div>
                <MobileFooter/>
            </div>
        </AuthProvider>
    )
}

export default Layout