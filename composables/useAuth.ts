// composables/useAuth.ts
export const useAuth = () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({
      email,
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