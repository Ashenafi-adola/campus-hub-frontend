import AuthFormWrapper from '@/components/auth/form-wraper'
import SingInForm from '@/components/auth/signin/signin-form'
import React from 'react'

function SignInPage() {
  return (
    <AuthFormWrapper
      title="Welcome Back"
      description="Log in to your account to continue collaborating."
    >
      <SingInForm />
    </AuthFormWrapper>
  )
}

export default SignInPage