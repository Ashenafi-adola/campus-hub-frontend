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
                <div className="mx-auto flex max-w-full gap-6 md:pr-6 ml-0 px-0 py-0">
                    <div className="ml-0 pl-0 transition-all hidden md:block dark:border-neutral-800">
                        <SideBar />
                    </div>
                    {children}
                </div>
            </div>
        </AuthProvider>
    )
}

export default Layout