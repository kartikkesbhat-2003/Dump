import { toast } from "react-hot-toast"
import { setLoading } from "@/slices/authSlice"
import { postEndpoints } from "@/services/api"
import { apiConnector } from "../apiConnector"
import { setProgress } from "@/slices/loadingBarSlice"

const {
  CREATE_POST,
  GET_ALL_POSTS,
  GET_POST_BY_ID,
  DELETE_POST,
  UPDATE_POST,
  GET_POSTS_BY_USER,
  VOTE_POST,
} = postEndpoints

// Create a new post
export function createPost(
  title: string,
  content: string,
  image?: File,
  isAnonymous?: boolean,
) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Creating post...")
    dispatch(setLoading(true))
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('isAnonymous', String(isAnonymous || false));
      
      if (image) {
        formData.append('image', image);
      }

      const response = await apiConnector(
        "POST",
        CREATE_POST,
        formData,
        {
          'Content-Type': 'multipart/form-data',
        }
      )

      console.log("CREATE POST API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      toast.success("Post created successfully")
      return response.data.post
    } catch (error) {
      dispatch(setProgress(100))
      console.log("CREATE POST API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to create post"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
      toast.dismiss(toastId)
    }
  }
}

// Get all posts with pagination and filtering
export function getAllPosts(
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc',
  search?: string
) {
  return async (dispatch: any, getState: any) => {
    const { token } = getState().auth;
    
    try {
      dispatch(setLoading(true));
      
      const config: any = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      // Add auth header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      }
      
      if (search) {
        params.search = search
      }

      const response = await apiConnector(
        "GET",
        `${GET_ALL_POSTS}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        null,
        config.headers
      );

      console.log("GET ALL POSTS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      return response.data
    } catch (error) {
      dispatch(setProgress(100))
      console.log("GET ALL POSTS API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to fetch posts"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }
}

// Get a single post by ID
export function getPostById(postId: string) {
  return async (dispatch: any) => {
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_POST_BY_ID(postId))

      console.log("GET POST BY ID API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      return response.data.post
    } catch (error) {
      dispatch(setProgress(100))
      console.log("GET POST BY ID API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to fetch post"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }
}

// Update a post
export function updatePost(
  postId: string,
  title?: string,
  content?: string,
  imageUrl?: string,
  isAnonymous?: boolean
) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Updating post...")
    dispatch(setLoading(true))
    try {
      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl
      if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous

      const response = await apiConnector(
        "PUT",
        UPDATE_POST(postId),
        updateData
      )

      console.log("UPDATE POST API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      toast.success("Post updated successfully")
      return response.data.post
    } catch (error) {
      dispatch(setProgress(100))
      console.log("UPDATE POST API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to update post"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
      toast.dismiss(toastId)
    }
  }
}

// Delete a post
export function deletePost(postId: string) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Deleting post...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector(
        "DELETE",
        DELETE_POST(postId),
        null
      )

      console.log("DELETE POST API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      toast.success("Post deleted successfully")
      return true
    } catch (error) {
      dispatch(setProgress(100))
      console.log("DELETE POST API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to delete post"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
      toast.dismiss(toastId)
    }
  }
}

// Get user's own posts
export function getUserPosts(
) {
  return async (dispatch: any) => {
    dispatch(setLoading(true))
    try {
      const response = await apiConnector(
        "GET",
        GET_POSTS_BY_USER,
        undefined,
      )

      console.log("GET USER POSTS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      return response.data
    } catch (error) {
      dispatch(setProgress(100))
      console.log("GET USER POSTS API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to fetch user posts"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }
}

// Vote on a post
export function votePost(
  postId: string,
  voteType: 'upvote' | 'downvote'
) {
  return async () => {
    try {
      const response = await apiConnector(
        "POST",
        VOTE_POST(postId),
        {
          voteType,
        }
      )

      console.log("VOTE POST API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Don't show toast for voting actions as they should be quick and silent
      return response.data
    } catch (error) {
      console.log("VOTE POST API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to vote on post"
      )
      throw error
    }
  }
}

// Get posts with filters (trending, etc.)
export function getTrendingPosts(
  page: number = 1,
  limit: number = 10
) {
  return async (dispatch: any) => {
    dispatch(setLoading(true))
    try {
      const response = await apiConnector(
        "GET",
        GET_ALL_POSTS,
        null,
        undefined,
        {
          page,
          limit,
          sortBy: 'totalVotes',
          sortOrder: 'desc',
        }
      )

      console.log("GET TRENDING POSTS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      return response.data
    } catch (error) {
      dispatch(setProgress(100))
      console.log("GET TRENDING POSTS API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to fetch trending posts"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }
}

// Search posts
export function searchPosts(
  searchQuery: string,
  page: number = 1,
  limit: number = 10
) {
  return async (dispatch: any) => {
    dispatch(setLoading(true))
    try {
      const response = await apiConnector(
        "GET",
        GET_ALL_POSTS,
        null,
        undefined,
        {
          page,
          limit,
          search: searchQuery,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      )

      console.log("SEARCH POSTS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setProgress(100))
      return response.data
    } catch (error) {
      dispatch(setProgress(100))
      console.log("SEARCH POSTS API ERROR............", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to search posts"
      )
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }
}
