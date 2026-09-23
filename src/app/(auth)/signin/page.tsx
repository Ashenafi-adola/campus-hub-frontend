import AuthFormWrapper from '@/components/auth/form-wraper'
import SingInForm from '@/components/auth/signin/signin-form'
import React from 'react'


function SignInPage() {
  return (
    <AuthFormWrapper>
        <SingInForm/>
    </AuthFormWrapper>
  )
}

export default SignInPage