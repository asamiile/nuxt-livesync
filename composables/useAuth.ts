// composables/useAuth.ts
export const useAuth = () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  const config = useRuntimeConfig()

  const isAuthenticated = computed(() => !!user.value)

  const login = async (password: string) => {
    // SupabaseではEmailも必須なため、固定の管理者用Emailを使用
    const { error } = await client.auth.signInWithPassword({
      email: config.public.adminEmail as string,
      password,
    })
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await client.auth.signOut()
    if (error) throw error
    // ログアウト後はログインページにリダイレクト
    await navigateTo('/admin/login')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  }
}