import { toast } from "react-hot-toast"
import { setUser, setLoading as setProfileLoading } from "@/slices/profileSlice"
import { authEndpoints } from "@/services/api"
import { apiConnector } from "../apiConnector"
import { setProgress } from "@/slices/loadingBarSlice"

const {
  GET_CURRENT_USER,
} = authEndpoints

// Get current user profile
export function getCurrentUser() {
  return async (dispatch: any) => {
    dispatch(setProfileLoading(true))
    dispatch(setProgress(10))
    try {
      const response = await apiConnector("GET", GET_CURRENT_USER, undefined)
      
      dispatch(setProgress(50))
      console.log("GET CURRENT USER API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Update the user in profile slice
      dispatch(setUser(response.data.user))
      dispatch(setProgress(100))
      
      return response.data.user
    } catch (error) {
      console.log("GET CURRENT USER API ERROR............", error)
      dispatch(setProgress(100))
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to fetch user profile"
      )
      throw error
    } finally {
      dispatch(setProfileLoading(false))
    }
  }
}

// Get user statistics (posts count, etc.)
export function getUserStats() {
  return async (dispatch: any) => {
    try {
      dispatch(setProgress(10))
      
      // For now, we'll calculate stats from the user's posts
      // This could be expanded to a dedicated endpoint if needed
      const { getUserPosts } = await import('./postAPI')
      const userPostsResponse = await dispatch(getUserPosts())
      
      const stats = {
        postsCount: userPostsResponse.posts?.length || 0,
        totalUpvotes: userPostsResponse.posts?.reduce((acc: number, post: any) => acc + (post.upvotes || 0), 0) || 0,
        totalDownvotes: userPostsResponse.posts?.reduce((acc: number, post: any) => acc + (post.downvotes || 0), 0) || 0,
        joinedDate: userPostsResponse.posts?.[0]?.user?.createdAt || new Date().toISOString(),
      }
      
      dispatch(setProgress(100))
      return stats
    } catch (error) {
      console.log("GET USER STATS ERROR............", error)
      dispatch(setProgress(100))
      toast.error("Failed to fetch user statistics")
      return {
        postsCount: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
        joinedDate: new Date().toISOString(),
      }
    }
  }
}