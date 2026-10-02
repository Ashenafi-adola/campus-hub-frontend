import SideBar from '@/components/main/layout/side-bar'
import TopBar from '@/components/main/layout/top-bar'
import React from 'react'

type Props = {
    children: React.ReactNode
}

function Layout({ children }: Props) {
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