"use client"

import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const page = () => {

    const router = useRouter();

    useEffect(() => {
        router.replace("/problem-solver")
    }, [])

    return (
        <div className='w-full h-screen flex justify-center items-center'>
            <h1>Loading...</h1>
        </div>
    )
}

export default page
